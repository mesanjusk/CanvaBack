const express = require('express');
const crypto = require('crypto');
const IdCardTemplate = require('../models/IdCardTemplate');
const IdCardRecord = require('../models/IdCardRecord');
const Student = require('../models/Student');
const router = express.Router();

const buildStudentPayload = (student = {}) => ({
  studentName: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
  firstName: student.firstName || '',
  middleName: student.middleName || '',
  lastName: student.lastName || '',
  className: student.className || '',
  section: student.section || '',
  rollNumber: student.rollNumber || '',
  admissionNo: student.admissionNo || '',
  academicYear: student.academicYear || '',
  guardianName: student.guardianName || '',
  guardianRelation: student.guardianRelation || '',
  mobileParent: student.mobileParent || '',
  mobileSelf: student.mobileSelf || '',
  bloodGroup: student.bloodGroup || '',
  house: student.house || '',
  address: student.address || '',
  schoolName: student.schoolName || '',
  dob: student.dob || '',
  photoUrl: Array.isArray(student.photo) ? (student.photo[0] || '') : '',
});

router.get('/templates', async (req, res) => {
  try {
    const { institute_uuid } = req.query;
    const query = institute_uuid ? { institute_uuid } : {};
    const data = await IdCardTemplate.find(query).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.isDefault) await IdCardTemplate.updateMany({ institute_uuid: payload.institute_uuid }, { $set: { isDefault: false } });
    const item = await IdCardTemplate.create(payload);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/templates/:uuid', async (req, res) => {
  try {
    const current = await IdCardTemplate.findOne({ uuid: req.params.uuid });
    if (!current) return res.status(404).json({ success: false, message: 'Template not found' });
    if (req.body.isDefault) await IdCardTemplate.updateMany({ institute_uuid: current.institute_uuid }, { $set: { isDefault: false } });
    const item = await IdCardTemplate.findOneAndUpdate({ uuid: req.params.uuid }, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/templates/:uuid', async (req, res) => {
  try {
    await IdCardTemplate.findOneAndDelete({ uuid: req.params.uuid });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/students', async (req, res) => {
  try {
    const { institute_uuid } = req.query;
    const students = await Student.find(institute_uuid ? { institute_uuid } : {}).sort({ createdAt: -1 }).limit(500);
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/records', async (req, res) => {
  try {
    const { institute_uuid, template_uuid } = req.query;
    const query = {};
    if (institute_uuid) query.institute_uuid = institute_uuid;
    if (template_uuid) query.template_uuid = template_uuid;
    const data = await IdCardRecord.find(query).sort({ createdAt: -1 }).limit(1000);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/records', async (req, res) => {
  try {
    const item = await IdCardRecord.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/records/bulk-create', async (req, res) => {
  try {
    const { institute_uuid, template_uuid, sourceType = 'database', records = [], student_uuids = [] } = req.body || {};
    let payloads = Array.isArray(records) ? records : [];
    if ((!payloads.length) && Array.isArray(student_uuids) && student_uuids.length) {
      const students = await Student.find({ institute_uuid, uuid: { $in: student_uuids } });
      payloads = students.map((student) => ({ student_uuid: student.uuid, data: buildStudentPayload(student) }));
    }
    const docs = payloads.map((row) => ({
      institute_uuid,
      template_uuid,
      sourceType,
      student_uuid: row.student_uuid || '',
      data: row.data || row,
      status: (row.data?.photoUrl || row.photoUrl) ? 'ready' : 'pending_photo',
    }));
    const inserted = docs.length ? await IdCardRecord.insertMany(docs) : [];
    res.status(201).json({ success: true, data: inserted });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/records/:uuid', async (req, res) => {
  try {
    const item = await IdCardRecord.findOneAndUpdate({ uuid: req.params.uuid }, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/records/:uuid', async (req, res) => {
  try {
    await IdCardRecord.findOneAndDelete({ uuid: req.params.uuid });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/records/:uuid/share-link', async (req, res) => {
  try {
    const item = await IdCardRecord.findOne({ uuid: req.params.uuid });
    if (!item) return res.status(404).json({ success: false, message: 'Record not found' });
    const shareToken = crypto.randomBytes(20).toString('hex');
    const expiresHours = Number(req.body?.expiresHours || 72);
    item.shareToken = shareToken;
    item.shareRole = req.body?.shareRole || 'student';
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
