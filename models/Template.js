const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  template_uuid: { type: String, required: true },
  title: String,
  category: String,
  subCategory: String,
  price: Number,
  image: String,
  canvasJson: { type: mongoose.Schema.Types.Mixed }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', templateSchema);
