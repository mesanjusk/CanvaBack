const mongoose = require('mongoose');

const placeholderSchema = new mongoose.Schema({
  id: { type: String, required: true }, 
  field: { type: String, required: true }, 
  left: Number,
  top: Number,
  width: Number,
  height: Number,
  fontSize: Number,
}, { _id: false });


const templateSchema = new mongoose.Schema({
  template_uuid: { type: String, required: true },
  title: String,
  category: String,
  subCategory: String,
  price: Number,
  image: String,
  canvasJson: Object, 
  placeholders: [placeholderSchema], 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', templateSchema);
