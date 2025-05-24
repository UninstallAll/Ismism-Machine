const mongoose = require('mongoose');
const Schema = mongoose.Schema;

<<<<<<< HEAD
const ArtworkSchema = new Schema({
=======
const artworkSchema = new mongoose.Schema({
>>>>>>> ad93a342403699dff2c4b4f94a65e13403a248ac
  title: {
    type: String,
    required: true
  },
  artist_id: {
<<<<<<< HEAD
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
=======
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
>>>>>>> ad93a342403699dff2c4b4f94a65e13403a248ac
});

// 创建索引以提高查询性能
ArtworkSchema.index({ artist_id: 1 });
ArtworkSchema.index({ movement_id: 1 });
ArtworkSchema.index({ year_created: 1 });

const Artwork = mongoose.model('Artwork', ArtworkSchema);

module.exports = Artwork; 