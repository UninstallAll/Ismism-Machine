import mongoose from 'mongoose';

const movementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  start_year: Number,
  end_year: Number,
  description: String,
  representative_artists: [{
    type: String
  }],
  notable_artworks: [{
    type: String
  }],
  influences: [{
    type: String
  }],
  influencedBy: [{
    type: String
  }],
  images: [String],
  tags: [String],
  position: {
    x: Number,
    y: Number
  }
}, {
  timestamps: true,
  collection: 'movements'
});

const Movement = mongoose.model('Movement', movementSchema);

export default Movement; 