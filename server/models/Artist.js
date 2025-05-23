const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  _id: String,
  name: String,
  birth_year: Number,
  death_year: Number,
  nationality: String,
  biography: String,
  movements: [String],
  notable_works: [String],
  portrait_url: String
});

module.exports = mongoose.model('Artist', artistSchema); 