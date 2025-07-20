const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
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
router.post('/save', upload.single('image'), async (req, res) => {
  try {
    const { title, category, subcategory, price, canvasJson } = req.body;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const imageUrl = req.file.path;

    const categoryDoc = await Category.findOne({
      $or: [{ name: category }, { category_uuid: category }]
    });
    if (!categoryDoc) return res.status(400).json({ message: 'Invalid category' });

    const subcategoryDoc = await Subcategory.findOne({
      $or: [{ name: subcategory }, { subcategory_uuid: subcategory }]
    });
    if (!subcategoryDoc) return res.status(400).json({ message: 'Invalid subcategory' });

    const newTemplate = new Template({
      template_uuid: uuid(),
      title,
      category: categoryDoc.category_uuid,
      subCategory: subcategoryDoc.subcategory_uuid,
      price,
      image: imageUrl,
      canvasJson: canvasJson ? JSON.parse(canvasJson) : null
    });

    await newTemplate.save();
    res.status(201).json(newTemplate);
  } catch (err) {
    console.error('Error saving template:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================================
// GET /api/template
// Get all templates
// ================================
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
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
    const template = await Template.findById(req.params.id);
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
    await Template.findByIdAndDelete(req.params.id);
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
    const updated = await Template.findByIdAndUpdate(
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
