const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: String,
  artist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist'
  },
  movement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArtMovement'
  },
  year_created: Number,
  medium: String,
  dimensions: String,
  location: String,
  description: String,
  images: [String]
});

module.exports = mongoose.model('Artwork', artworkSchema); 