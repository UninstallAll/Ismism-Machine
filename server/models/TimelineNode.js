import mongoose from 'mongoose';

const timelineNodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist'
  },
  movement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movement'
  },
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('TimelineNode', timelineNodeSchema); 