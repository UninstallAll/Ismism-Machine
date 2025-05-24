const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArtMovementSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  start_year: {
    type: Number
  },
  end_year: {
    type: Number
  },
  description: {
    type: String
  },
  representative_artists: [{
    type: Schema.Types.ObjectId,
    ref: 'Artist'
  }],
  notable_artworks: [{
    type: Schema.Types.ObjectId,
    ref: 'Artwork'
  }]
}, {
  timestamps: true
});

// 创建索引
ArtMovementSchema.index({ name: 1 });
ArtMovementSchema.index({ start_year: 1, end_year: 1 });

const ArtMovement = mongoose.model('ArtMovement', ArtMovementSchema);

module.exports = ArtMovement; 