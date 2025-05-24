const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArtistSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  birth_year: {
    type: Number
  },
  death_year: {
    type: Number
  },
  nationality: {
    type: String
  },
  biography: {
    type: String
  },
  movements: [{
    type: Schema.Types.ObjectId,
    ref: 'ArtMovement'
  }],
  notable_works: [{
    type: Schema.Types.ObjectId,
    ref: 'Artwork'
  }],
  photos: [{
    type: String
  }]
}, {
  timestamps: true
});

// 创建索引
ArtistSchema.index({ name: 1 });
ArtistSchema.index({ nationality: 1 });
ArtistSchema.index({ movements: 1 });

const Artist = mongoose.model('Artist', ArtistSchema);

module.exports = Artist; 