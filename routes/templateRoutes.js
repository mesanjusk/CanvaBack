const express = require('express');
const router = express.Router();
const Template = require('../models/Template');

router.post('/save', async (req, res) => {
  const { name, canvasJSON, thumbnail } = req.body;
  const template = new Template({ name, canvasJSON, thumbnail });
  await template.save();
  res.json({ success: true });
});

router.get('/', async (req, res) => {
  const templates = await Template.find();
  res.json(templates);
});

router.get('/:id', async (req, res) => {
  const template = await Template.findById(req.params.id);
  res.json(template);
});

module.exports = router;
