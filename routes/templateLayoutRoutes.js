const express = require('express');
const router = express.Router();
const TemplateLayout = require('../models/TemplateLayout.js');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary.js');
const { v4: uuid } = require('uuid');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mern-images',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

// ================================
// POST /api/template/save
// Create a new template
// ================================
// No multer middleware here!
router.post('/save', async (req, res) => {
  try {
    const { title, layout, image, width, height, photo, signature, template } = req.body;

    if (!title || !layout) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newTemplateLayout = new TemplateLayout({
      templateLayout_uuid: uuid(),
      title,
      layout,
      image,
      width,
      height,
      photo,      
      signature,  
      template
    });

    await newTemplateLayout.save();
    console.log("✅ Template saved:", newTemplateLayout);
    res.status(201).json(newTemplateLayout);
  } catch (err) {
    console.error('❌ Error saving template:', err);
    res.status(500).json({ error: err.message });
  }
});



// ================================
// GET /api/template
// Get all templates
// ================================
router.get('/', async (req, res) => {
  try {
    const templates = await TemplateLayout.find().sort({ createdAt: -1 });
    res.status(200).json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// GET /api/template/:id
// Get a template by ID
// ================================
router.get('/:id', async (req, res) => {
  try {
    const template = await TemplateLayout.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: 'Invalid ID or server error', details: err.message });
  }
});

// ================================
// DELETE /api/template/:id
// Delete a template
// ================================
router.delete('/:id', async (req, res) => {
  try {
    await TemplateLayout.findByIdAndDelete(req.params.id);
    res.json({ message: 'Template deleted' });
  } catch (err) {
    console.error('Error deleting template:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ================================
// PUT /api/template/:id
// Update template title (or other fields)
// ================================
router.put('/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const updated = await TemplateLayout.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Error updating template:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
