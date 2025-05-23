const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  _id: String,
  title: String,
  artist_id: String,
  movement_id: String,
  year_created: Number,
  medium: String,
  dimensions: String,
  location: String,
  description: String,
  images: [String]
});

module.exports = mongoose.model('Artwork', artworkSchema); 