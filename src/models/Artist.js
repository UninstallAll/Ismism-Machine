import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  birth_year: Number,
  death_year: Number,
  nationality: String,
  biography: String,
  movements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movement'
  }],
  notable_works: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork'
  }],
  portrait_url: String
}, {
  timestamps: true,
  collection: 'artist' // 指定集合名称
});

const Artist = mongoose.model('Artist', artistSchema);

export default Artist; 