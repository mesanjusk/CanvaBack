const mongoose = require('mongoose');

const gallarySchema = new mongoose.Schema({
  Gallary_uuid: { type: String },
  institute_uuid: { type: String },
  image: { type: String, required: true }
});

module.exports = mongoose.model('Gallary', gallarySchema);