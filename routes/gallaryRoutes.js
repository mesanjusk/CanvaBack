const express = require('express');
const Gallary = require('../models/Gallary');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary.js');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v4: uuid } = require('uuid');

const router = express.Router();

// Cloudinary Storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gallaries',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const upload = multer({ storage });

// POST /api/gallary 
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { institute_uuid } = req.body;
    const file = req.file;

    const image = file.path;

    const gallaries = new Gallary({ institute_uuid, image, Gallary_uuid: uuid() });
    await gallaries.save();

    res.status(201).json(gallaries);
  } catch (err) {
    console.error('Error uploading gallary:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET all gallaries
router.get('/GetGallaryList/:institute_id', async (req, res) => {
  const { institute_id } = req.params;
  try {
    const gallaries = await Gallary.find({ institute_uuid: institute_id });
    res.json(gallaries.length ? { success: true, result: gallaries } : { success: false, message: 'No gallaries found' });
  } catch (err) {
    console.error('Error fetching gallaries:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get gallary by ID
router.get('/:id', async (req, res) => {
  try {
    const gallary = await Gallary.findById(req.params.id);
    res.status(gallary ? 200 : 404).json(gallary ? { success: true, result: gallary } : { success: false, message: 'Gallary not found' });
  } catch (err) {
    console.error('Error fetching gallary:', err);
    res.status(500).json({ success: false, message: 'Error fetching gallary', error: err.message });
  }
});

// ✅ Delete gallary
router.delete('/:id', async (req, res) => {
  try {
    const gallary = await Gallary.findById(req.params.id);
    if (!gallary) return res.status(404).json({ message: 'Gallary not found' });

    await Gallary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gallary deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Update gallary
router.put("/:id", upload.single("image"),  async (req, res) => {
    try {
      const { institute_uuid } = req.body;
      const file = req.file;

      const updateData = { institute_uuid };

      if (file) {
        updateData.image = file.path;
      }

      const gallary = await Gallary.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      });

      if (!gallary) {
        return res.status(404).json({ message: "Gallary not found" });
      }

      res.json({ success: true, result: gallary });
    } catch (err) {
      console.error("Error updating gallary:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


module.exports = router;
