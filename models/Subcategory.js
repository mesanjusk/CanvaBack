const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  subcategory_uuid: { type: String },
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  categoryId: String
});

module.exports = mongoose.model('Subcategory', subcategorySchema);