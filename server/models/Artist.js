const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artistSchema = new mongoose.Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  name: String,
  birth_year: Number,
  death_year: Number,
  nationality: String,
  biography: String,
  movements: [{ type: Schema.Types.ObjectId, ref: 'Movement' }],
  notable_works: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
  portrait_url: String
}, {
  timestamps: true,
  collection: 'artists',
  strict: false, // 允许存储模式中未定义的字段
  toJSON: { 
    transform: function(doc, ret) {
      // 确保返回的字段名与数据库中的一致
      return {
        _id: ret._id.toString(),
        name: ret.name,
        birth_year: ret.birth_year,
        death_year: ret.death_year,
        nationality: ret.nationality,
        biography: ret.biography,
        movements: ret.movements ? ret.movements.map(id => id.toString()) : [],
        notable_works: ret.notable_works ? ret.notable_works.map(id => id.toString()) : [],
        portrait_url: ret.portrait_url
      };
    }
  }
});

// 创建索引
artistSchema.index({ name: 1 });
artistSchema.index({ movements: 1 });

module.exports = mongoose.model('Artist', artistSchema); 