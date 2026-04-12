const express = require('express');
const IdCardRecord = require('../models/IdCardRecord');
const ReportCard = require('../models/ReportCard');
const router = express.Router();

async function resolveRecord(token) {
  const now = new Date();
  let record = await IdCardRecord.findOne({ shareToken: token, $or: [{ shareExpiresAt: null }, { shareExpiresAt: { $gt: now } }] });
  if (record) return { type: 'id-card', record };
  record = await ReportCard.findOne({ shareToken: token, $or: [{ shareExpiresAt: null }, { shareExpiresAt: { $gt: now } }] });
  if (record) return { type: 'report-card', record };
  return null;
}

router.get('/:token', async (req, res) => {
  try {
    const resolved = await resolveRecord(req.params.token);
    if (!resolved) return res.status(404).json({ success: false, message: 'Link expired or not found' });
    res.json({ success: true, type: resolved.type, data: resolved.record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:token', async (req, res) => {
  try {
    const resolved = await resolveRecord(req.params.token);
    if (!resolved) return res.status(404).json({ success: false, message: 'Link expired or not found' });
    const payload = req.body || {};
    if (resolved.type === 'id-card') {
      const allowed = {
        data: { ...(resolved.record.data || {}), ...(payload.data || payload) },
        imageDataUrl: payload.imageDataUrl || resolved.record.imageDataUrl,
        pdfDataUrl: payload.pdfDataUrl || resolved.record.pdfDataUrl,
        lastEditedBy: payload.lastEditedBy || resolved.record.lastEditedBy || 'public-link',
        status: payload.status || resolved.record.status,
      };
      const updated = await IdCardRecord.findOneAndUpdate({ uuid: resolved.record.uuid }, allowed, { new: true });
      return res.json({ success: true, type: 'id-card', data: updated });
    }
    const allowed = {
      studentSnapshot: { ...(resolved.record.studentSnapshot || {}), ...(payload.studentSnapshot || {}) },
      subjects: Array.isArray(payload.subjects) ? payload.subjects : resolved.record.subjects,
      attendance: payload.attendance || resolved.record.attendance,
      teacherRemarks: payload.teacherRemarks ?? resolved.record.teacherRemarks,
      principalRemarks: payload.principalRemarks ?? resolved.record.principalRemarks,
      imageDataUrl: payload.imageDataUrl || resolved.record.imageDataUrl,
      pdfDataUrl: payload.pdfDataUrl || resolved.record.pdfDataUrl,
      lastEditedBy: payload.lastEditedBy || resolved.record.lastEditedBy || 'public-link',
    };
    const updated = await ReportCard.findOneAndUpdate({ uuid: resolved.record.uuid }, allowed, { new: true });
    res.json({ success: true, type: 'report-card', data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
