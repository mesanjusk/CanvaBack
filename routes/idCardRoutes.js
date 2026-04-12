const express = require('express');
const IdCardTemplate = require('../models/IdCardTemplate');
const Student = require('../models/Student');
const router = express.Router();

router.get('/templates', async (req, res) => {
  try {
    const { institute_uuid } = req.query;
    const query = institute_uuid ? { institute_uuid } : {};
    const data = await IdCardTemplate.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const item = await IdCardTemplate.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/templates/:uuid', async (req, res) => {
  try {
    const item = await IdCardTemplate.findOneAndUpdate({ uuid: req.params.uuid }, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Template not found' });
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
    const students = await Student.find(institute_uuid ? { institute_uuid } : {}).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
