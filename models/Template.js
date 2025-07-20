// models/Template.js
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  template_uuid: { type: String, required: true },
  title: String,
  category: String,
  subCategory: String,
  price: Number,
  image: String,
  canvasJson: Object, // <-- Add this line
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', templateSchema);
