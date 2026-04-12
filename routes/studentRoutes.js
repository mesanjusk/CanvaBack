const express = require('express');
const crypto = require('crypto');
const Student = require('../models/Student');
const EditRequest = require('../models/EditRequest');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function schoolFilter(req) {
  if (req.user.role === 'super_admin' && req.query.schoolId) return { schoolId: req.query.schoolId };
  if (req.user.role === 'super_admin') return {};
  return { schoolId: req.user.schoolId };
}

function teacherScope(req, query) {
  if (req.user.role !== 'teacher') return query;
  if (!req.user.assignedSectionNames?.length) return query;
  return { ...query, section: { $in: req.user.assignedSectionNames } };
}

router.get('/', requirePermission('student.read'), async (req, res) => {
  const { className, section, q } = req.query;
  let filter = teacherScope(req, schoolFilter(req));
  if (className) filter.className = className;
  if (section) filter.section = section;
  if (q) filter.fullName = { $regex: q, $options: 'i' };

  const students = await Student.find(filter).sort({ className: 1, section: 1, fullName: 1 }).lean();
  res.json({ success: true, data: students });
});

router.post('/', requirePermission('student.create'), async (req, res) => {
  const payload = { ...req.body, schoolId: req.user.role === 'super_admin' ? req.body.schoolId : req.user.schoolId, createdBy: req.user._id };
  const student = await Student.create(payload);
  res.status(201).json({ success: true, data: student });
});

router.post('/bulk', requirePermission('student.create'), async (req, res) => {
  const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
  const schoolId = req.user.role === 'super_admin' ? req.body.schoolId : req.user.schoolId;
  const docs = rows
    .filter((row) => row.fullName)
    .map((row) => ({ ...row, schoolId, createdBy: req.user._id }));
  const result = docs.length ? await Student.insertMany(docs) : [];
  res.json({ success: true, count: result.length, data: result });
});

router.put('/:id', async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  if (req.user.role !== 'super_admin' && String(student.schoolId) !== String(req.user.schoolId)) {
    return res.status(403).json({ success: false, message: 'Out of scope' });
  }

  const fullAccess = ['super_admin', 'school_admin', 'principal'].includes(req.user.role);
  const allowed = fullAccess
    ? ['admissionNo', 'rollNo', 'fullName', 'className', 'section', 'gender', 'dob', 'fatherName', 'motherName', 'bloodGroup', 'contactNumber', 'address', 'photoUrl', 'status']
    : ['photoUrl', 'contactNumber', 'address', 'bloodGroup'];

  for (const key of allowed) {
    if (req.body[key] !== undefined) student[key] = req.body[key];
  }
  student.correctedAt = new Date();
  await student.save();
  res.json({ success: true, data: student });
});

router.delete('/:id', requirePermission('student.delete'), async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  if (req.user.role !== 'super_admin' && String(student.schoolId) !== String(req.user.schoolId)) {
    return res.status(403).json({ success: false, message: 'Out of scope' });
  }
  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

router.post('/:id/create-edit-link', requirePermission('student.update'), async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  student.publicEditToken = token;
  student.publicEditExpiresAt = expiresAt;
  await student.save();
  res.json({ success: true, data: { token, expiresAt } });
});

router.get('/edit-requests/all', requirePermission('edit.review'), async (req, res) => {
  const requests = await EditRequest.find(schoolFilter(req))
    .populate('studentId', 'fullName className section photoUrl')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: requests });
});

router.post('/edit-requests/:id/review', requirePermission('edit.review'), async (req, res) => {
  const request = await EditRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
  if (req.user.role !== 'super_admin' && String(request.schoolId) !== String(req.user.schoolId)) {
    return res.status(403).json({ success: false, message: 'Out of scope' });
  }

  const { action, reviewComment = '' } = req.body;
  request.status = action === 'approve' ? 'approved' : 'rejected';
  request.reviewComment = reviewComment;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  if (action === 'approve') {
    const student = await Student.findById(request.studentId);
    if (student) {
      const allowed = ['photoUrl', 'fullName', 'contactNumber', 'address', 'bloodGroup'];
      for (const key of allowed) {
        if (request.payload[key] !== undefined) student[key] = request.payload[key];
      }
      student.status = 'pending_review';
      student.correctedAt = new Date();
      await student.save();
    }
  }

  res.json({ success: true, data: request });
});

module.exports = router;
