const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist'
  },
  movement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movement'
  },
  year_created: Number,
  medium: String,
  dimensions: String,
  location: String,
  description: String,
  images: [{
    url: String,
    title: String,
    caption: String,
    photographer: String,
    date_taken: String,
    resolution: String,
    color_space: String,
    copyright: String
  }]
});

module.exports = mongoose.model('Artwork', artworkSchema); 