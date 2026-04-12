const express = require('express');
const Student = require('../models/Student');
const Template = require('../models/Template');
const IdCardRecord = require('../models/IdCardRecord');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/preview/:studentId/:templateId', requirePermission('template.read'), async (req, res) => {
  const student = await Student.findById(req.params.studentId).lean();
  const template = await Template.findById(req.params.templateId).lean();
  if (!student || !template) return res.status(404).json({ success: false, message: 'Student or template missing' });
  res.json({ success: true, data: { student, template } });
});

router.post('/generate', requirePermission('card.generate'), async (req, res) => {
  const { studentIds = [], templateId } = req.body;
  const template = await Template.findById(templateId).lean();
  if (!template) return res.status(404).json({ success: false, message: 'Template not found' });

  const students = await Student.find({ _id: { $in: studentIds } }).lean();
  const results = [];

  for (const student of students) {
    const previewPayload = {
      name: student.fullName,
      className: student.className,
      section: student.section,
      admissionNo: student.admissionNo,
      contactNumber: student.contactNumber,
      photoUrl: student.photoUrl,
    };

    const record = await IdCardRecord.findOneAndUpdate(
      { schoolId: student.schoolId, studentId: student._id, templateId },
      {
        $set: {
          status: 'generated',
          previewPayload,
          generatedBy: req.user._id,
        },
      },
      { new: true, upsert: true }
    );
    results.push(record);
  }

  res.json({ success: true, count: results.length, data: results });
});

router.post('/approve', requirePermission('card.approve'), async (req, res) => {
  const { recordIds = [] } = req.body;
  await IdCardRecord.updateMany({ _id: { $in: recordIds } }, { $set: { status: 'approved', approvedBy: req.user._id } });
  res.json({ success: true, message: 'Approved' });
});

router.get('/records', requirePermission('template.read'), async (req, res) => {
  const schoolId = req.user.role === 'super_admin' && req.query.schoolId ? req.query.schoolId : req.user.schoolId;
  const records = await IdCardRecord.find(schoolId ? { schoolId } : {})
    .populate('studentId', 'fullName className section photoUrl')
    .populate('templateId', 'name')
    .sort({ updatedAt: -1 })
    .lean();
  res.json({ success: true, data: records });
});

module.exports = router;
