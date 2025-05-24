const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArtworkSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  artist_id: {
    type: Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  movement_id: {
    type: Schema.Types.ObjectId,
    ref: 'ArtMovement',
    required: true
  },
  year_created: {
    type: Number
  },
  medium: {
    type: String
  },
  dimensions: {
    height_cm: Number,
    width_cm: Number
  },
  location: {
    type: String
  },
  description: {
    type: String
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

// 创建索引以提高查询性能
ArtworkSchema.index({ artist_id: 1 });
ArtworkSchema.index({ movement_id: 1 });
ArtworkSchema.index({ year_created: 1 });

const Artwork = mongoose.model('Artwork', ArtworkSchema);

module.exports = Artwork; 