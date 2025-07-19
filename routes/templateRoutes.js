const express = require('express');
const Template = require('../models/Template');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary.js');
const Category = require('../models/Category.js');
const Subcategory = require('../models/Subcategory.js');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v4: uuid } = require('uuid');

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mern-images', 
    allowed_formats: ['jpg', 'jpeg', 'png'], 
  },
});

const upload = multer({ storage });

router.post('/save', upload.single('image'), async (req, res) => {
  try {
    const { title, category, subcategory, price } = req.body;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const imageUrl = req.file.path;

    const categoryDoc = await Category.findOne({
      $or: [{ name: category }, { category_uuid: category }]
    });

    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const subcategoryDoc = await Subcategory.findOne({
      $or: [{ name: subcategory }, { subcategory_uuid: subcategory }]
    });

    if (!subcategoryDoc) {
      return res.status(400).json({ message: 'Invalid subcategory' });
    }

    const newTemplate = new Template({
      template_uuid: uuid(),
      title,
      category: categoryDoc.category_uuid,
      subCategory: subcategoryDoc.subcategory_uuid,  
      price,
      image: imageUrl
    });

    await newTemplate.save();
    res.status(201).json(newTemplate);
  } catch (err) {
    console.error('Error saving template:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
      const templates = await Template.find();
      res.status(200).json(templates);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: 'Invalid ID or server error', details: err.message });
  }
});

// DELETE /api/template/:id - Delete a Template
router.delete('/:id', async (req, res) => {
  try {
    await Template.findByIdAndDelete(req.params.id);
    res.json({ message: 'Template deleted' });
  } catch (err) {
    console.error('Error deleting template:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/template/:id - Update template name
router.put('/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true }
    );
    res.json(template);
  } catch (err) {
    console.error('Error updating template:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
