const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: String,
  birth_year: Number,
  death_year: Number,
  nationality: String,
  biography: String,
  movements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArtMovement'
  }],
  notable_works: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork'
  }],
  portrait_url: String
});

module.exports = mongoose.model('Artist', artistSchema); 