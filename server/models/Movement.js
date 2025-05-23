const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
  _id: String,
  name: String,
  start_year: Number,
  end_year: Number,
  description: String,
  representative_artists: [String],
  notable_artworks: [String]
});

module.exports = mongoose.model('Movement', movementSchema); 