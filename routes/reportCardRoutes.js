const express = require('express');
const ReportCardTemplate = require('../models/ReportCardTemplate');
const ReportCard = require('../models/ReportCard');
const router = express.Router();

router.get('/templates', async (req, res) => {
  try {
    const { institute_uuid } = req.query;
    const data = await ReportCardTemplate.find(institute_uuid ? { institute_uuid } : {}).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const item = await ReportCardTemplate.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/templates/:uuid', async (req, res) => {
  try {
    const item = await ReportCardTemplate.findOneAndUpdate({ uuid: req.params.uuid }, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Template not found' });
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
    const data = await ReportCard.find(query).sort({ createdAt: -1 });
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

router.put('/:uuid', async (req, res) => {
  try {
    const item = await ReportCard.findOneAndUpdate({ uuid: req.params.uuid }, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Report card not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
