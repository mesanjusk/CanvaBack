const express = require('express');
const Student = require('../models/Student');
const EditRequest = require('../models/EditRequest');

const router = express.Router();

router.get('/student-edit/:token', async (req, res) => {
  const student = await Student.findOne({ publicEditToken: req.params.token }).lean();
  if (!student) return res.status(404).json({ success: false, message: 'Link not found' });
  if (!student.publicEditExpiresAt || student.publicEditExpiresAt < new Date()) {
    return res.status(410).json({ success: false, message: 'Link expired' });
  }
  res.json({
    success: true,
    data: {
      student: {
        id: student._id,
        fullName: student.fullName,
        className: student.className,
        section: student.section,
        contactNumber: student.contactNumber,
        address: student.address,
        bloodGroup: student.bloodGroup,
        photoUrl: student.photoUrl,
      },
      editableFields: ['fullName', 'contactNumber', 'address', 'bloodGroup', 'photoUrl'],
    },
  });
});

router.post('/student-edit/:token', async (req, res) => {
  const student = await Student.findOne({ publicEditToken: req.params.token });
  if (!student) return res.status(404).json({ success: false, message: 'Link not found' });
  if (!student.publicEditExpiresAt || student.publicEditExpiresAt < new Date()) {
    return res.status(410).json({ success: false, message: 'Link expired' });
  }

  const allowed = ['fullName', 'contactNumber', 'address', 'bloodGroup', 'photoUrl'];
  const payload = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  }

  const request = await EditRequest.create({
    schoolId: student.schoolId,
    studentId: student._id,
    submittedByType: 'student_public',
    payload,
  });

  student.status = 'pending_review';
  await student.save();

  res.json({ success: true, message: 'Correction submitted', data: request });
});

module.exports = router;
