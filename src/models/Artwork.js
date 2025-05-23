import mongoose from 'mongoose';

const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  movement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movement'
  },
  year_created: Number,
  description: String,
  medium: String,
  dimensions: String,
  location: String,
  images: [String],
  tags: [String]
}, {
  timestamps: true,
  collection: 'artworks' // 指定集合名称
});

const Artwork = mongoose.model('Artwork', artworkSchema);

export default Artwork; 