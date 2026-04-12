const express = require('express');
const crypto = require('crypto');
const ReportCardTemplate = require('../models/ReportCardTemplate');
const ReportCard = require('../models/ReportCard');
const Student = require('../models/Student');
const router = express.Router();

const snapshotFromStudent = (student = {}) => ({
  studentName: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
  className: student.className || '',
  section: student.section || '',
  rollNumber: student.rollNumber || '',
  admissionNo: student.admissionNo || '',
  academicYear: student.academicYear || '',
  guardianName: student.guardianName || '',
  photoUrl: Array.isArray(student.photo) ? (student.photo[0] || '') : '',
});

router.get('/templates', async (req, res) => {
  try {
    const { institute_uuid } = req.query;
    const data = await ReportCardTemplate.find(institute_uuid ? { institute_uuid } : {}).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.isDefault) await ReportCardTemplate.updateMany({ institute_uuid: payload.institute_uuid }, { $set: { isDefault: false } });
    const item = await ReportCardTemplate.create(payload);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/templates/:uuid', async (req, res) => {
  try {
    const current = await ReportCardTemplate.findOne({ uuid: req.params.uuid });
    if (!current) return res.status(404).json({ success: false, message: 'Template not found' });
    if (req.body.isDefault) await ReportCardTemplate.updateMany({ institute_uuid: current.institute_uuid }, { $set: { isDefault: false } });
    const item = await ReportCardTemplate.findOneAndUpdate({ uuid: req.params.uuid }, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/templates/:uuid', async (req, res) => {
  try {
    await ReportCardTemplate.findOneAndDelete({ uuid: req.params.uuid });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { institute_uuid, student_uuid } = req.query;
    const query = {};
    if (institute_uuid) query.institute_uuid = institute_uuid;
    if (student_uuid) query.student_uuid = student_uuid;
    const data = await ReportCard.find(query).sort({ createdAt: -1 }).limit(1000);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await ReportCard.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/bulk-create', async (req, res) => {
  try {
    const { institute_uuid, template_uuid, sourceType = 'database', records = [], student_uuids = [] } = req.body || {};
    let payloads = Array.isArray(records) ? records : [];
    if (!payloads.length && Array.isArray(student_uuids) && student_uuids.length) {
      const students = await Student.find({ institute_uuid, uuid: { $in: student_uuids } });
      payloads = students.map((student) => ({
        student_uuid: student.uuid,
        studentSnapshot: snapshotFromStudent(student),
        className: student.className || '',
        section: student.section || '',
      }));
    }
    const inserted = payloads.length ? await ReportCard.insertMany(payloads.map((row) => ({
      institute_uuid,
      template_uuid,
      sourceType,
      student_uuid: row.student_uuid || '',
      studentSnapshot: row.studentSnapshot || row,
      academicYear: row.academicYear || '',
      examName: row.examName || '',
      className: row.className || row.studentSnapshot?.className || '',
      section: row.section || row.studentSnapshot?.section || '',
      attendance: row.attendance || { workingDays: 0, presentDays: 0 },
      subjects: Array.isArray(row.subjects) ? row.subjects : [],
      teacherRemarks: row.teacherRemarks || '',
      principalRemarks: row.principalRemarks || '',
    }))) : [];
    res.status(201).json({ success: true, data: inserted });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:uuid', async (req, res) => {
  try {
    const item = await ReportCard.findOneAndUpdate({ uuid: req.params.uuid }, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Report card not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:uuid', async (req, res) => {
  try {
    await ReportCard.findOneAndDelete({ uuid: req.params.uuid });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:uuid/share-link', async (req, res) => {
  try {
    const item = await ReportCard.findOne({ uuid: req.params.uuid });
    if (!item) return res.status(404).json({ success: false, message: 'Report card not found' });
    const shareToken = crypto.randomBytes(20).toString('hex');
    const expiresHours = Number(req.body?.expiresHours || 72);
    item.shareToken = shareToken;
    item.shareRole = req.body?.shareRole || 'teacher';
    item.shareExpiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000);
    await item.save();
    const baseUrl = req.body?.baseUrl || process.env.PUBLIC_APP_BASE_URL || 'http://localhost:5173';
    const shareUrl = `${baseUrl.replace(/\/$/, '')}/public/${shareToken}`;
    res.json({ success: true, data: { shareUrl, shareToken, shareExpiresAt: item.shareExpiresAt, shareRole: item.shareRole } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
