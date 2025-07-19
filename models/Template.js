const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  template_uuid: String,
  title: String,
  category: String,
  subCategory: String,
  price: Number,
  image: String, 
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Template', templateSchema);
