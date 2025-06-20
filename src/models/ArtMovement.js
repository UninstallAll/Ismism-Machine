const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArtMovementSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  // Optional start/end years if known
  start_year: {
    type: Number
  },
  end_year: {
    type: Number
  },
  // Theoretical foundations of the movement
  theoretical_foundation: {
    type: String
  },
  // Common forms/mediums used in this movement
  forms: {
    type: String
  },
  // Representative artists and their works
  representative_artists: [{
    name: String,
    works: [String]
  }],
  // Key characteristics of the movement
  characteristics: [String],
  // Related art movements or influences
  related_movements: [{
    type: Schema.Types.ObjectId,
    ref: 'ArtMovement'
  }],
  // Keywords or tags for searchability
  tags: [String],
  // Contemporary context
  context: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
ArtMovementSchema.index({ name: 1 });
ArtMovementSchema.index({ start_year: 1, end_year: 1 });
ArtMovementSchema.index({ tags: 1 });

const ArtMovement = mongoose.model('ArtMovement', ArtMovementSchema);

module.exports = ArtMovement; 