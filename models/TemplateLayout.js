const mongoose = require('mongoose');

const templateLayoutSchema = new mongoose.Schema({
  templateLayout_uuid: { type: String, required: true },
  title: String,
  layout: Object,
  image: String,  
  width: Number, 
  height: Number, 
  photo: String,
  logo: String,
  photo: String,
  signature: String,
  template: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TemplateLayout', templateLayoutSchema);
