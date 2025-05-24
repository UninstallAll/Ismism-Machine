const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movementSchema = new mongoose.Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  name: String,
  start_year: Number,
  end_year: Number,
  description: String,
  representative_artists: [{ type: Schema.Types.ObjectId, ref: 'Artist' }],
  notable_artworks: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
  influences: [String],
  influencedBy: [String],
  images: [String],
  tags: [String]
}, {
  timestamps: true,
  collection: 'art_movements',
  strict: false, // 允许存储模式中未定义的字段
  toJSON: {
    transform: function(doc, ret) {
      // 确保返回的字段名与数据库中的一致
      return {
        _id: ret._id.toString(),
        name: ret.name,
        start_year: ret.start_year,
        end_year: ret.end_year,
        description: ret.description,
        representative_artists: ret.representative_artists ? ret.representative_artists.map(id => id.toString()) : [],
        notable_artworks: ret.notable_artworks ? ret.notable_artworks.map(id => id.toString()) : [],
        influences: ret.influences,
        influencedBy: ret.influencedBy,
        images: ret.images,
        tags: ret.tags
      };
    }
  }
});

// 创建索引
movementSchema.index({ name: 1 });

module.exports = mongoose.model('Movement', movementSchema); 