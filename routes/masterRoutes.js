const express = require('express');
const Master = require('../models/Master');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { institute_uuid, type } = req.query;
    const query = {};
    if (institute_uuid) query.institute_uuid = institute_uuid;
    if (type) query.type = type;
    const data = await Master.find(query).sort({ type: 1, sortOrder: 1, name: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Master.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:uuid', async (req, res) => {
  try {
    const item = await Master.findOneAndUpdate({ uuid: req.params.uuid }, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Master not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:uuid', async (req, res) => {
  try {
    const item = await Master.findOneAndDelete({ uuid: req.params.uuid });
    if (!item) return res.status(404).json({ success: false, message: 'Master not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
