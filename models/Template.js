const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: String,
  canvasJSON: Object,
  thumbnail: String,
});

module.exports = mongoose.model('Template', templateSchema);
