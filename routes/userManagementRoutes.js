const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { institute_uuid } = req.query;
    const users = await User.find(institute_uuid ? { institute_uuid } : {}).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.password) {
      payload.login_password = await bcrypt.hash(payload.password, 10);
      delete payload.password;
    }
    payload.login_username = payload.login_username || payload.mobile;
    const user = await User.create(payload);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.password) {
      payload.login_password = await bcrypt.hash(payload.password, 10);
      delete payload.password;
    }
    const user = await User.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
