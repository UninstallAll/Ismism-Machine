const mongoose = require('mongoose');

const artMovementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  startYear: {
    type: Number,
    required: true
  },
  endYear: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  keyArtists: [{
    type: String
  }],
  characteristics: [{
    type: String
  }],
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ArtMovement', artMovementSchema); 