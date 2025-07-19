const express = require('express');
const Template = require('../models/Template');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary.js');
const Category = require('../models/Category.js');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v4: uuid } = require('uuid');

const router = express.Router();

// Cloudinary Storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'categories',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const upload = multer({ storage });

// POST /api/categories - Upload category with image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name || !file) {
      return res.status(400).json({ message: 'Name and image are required.' });
    }

    const imageUrl = file.path;

    const category = new Category({ name, imageUrl, category_uuid: uuid() });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    console.error('Error uploading category:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all categories with usage status
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({});
    const templates = await Template.find({});

    const usedCategorySet = new Set(templates.map(l => l.category)); 
    const usedCategories = categories.filter(cat =>

      usedCategorySet.has(cat.category_uuid)
    );
    res.json(usedCategories);

  } catch (err) {
    console.error("Error fetching used categories:", err);
    res.status(500).json({ error: "Failed to load categories." });
  }

});

// GET /api/categories/with-usage
router.get("/with-usage", async (req, res) => {
  try {
    const templates = await Template.find({}, "category"); 
    const usedCategoryUUIDs = templates.map(l => l.category);

    const categories = await Category.find();

    const enriched = categories.map(cat => ({
      ...cat._doc,
      isUsed: usedCategoryUUIDs.includes(cat.category_uuid),
    }));

    res.json(enriched);
  } catch (err) {
    console.error("Error fetching categories with usage:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// DELETE category only if not used
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const isUsed = await Template.exists({ category: category.name });
    if (isUsed) {
      return res.status(400).json({ message: 'Category is in use and cannot be deleted.' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// PUT /api/categories/:id - Update category name and/or image
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    const updateData = { name };

    if (file) {
      updateData.imageUrl = file.path;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
