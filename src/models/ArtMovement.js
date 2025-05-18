const mongoose = require('mongoose');

const ArtMovementSchema = new mongoose.Schema({
  name: { type: String, required: true },          // 艺术主义名称，如"立体主义"
  period: { 
    start: Number,                                 // 开始年份
    end: Number                                    // 结束年份
  },
  description: { type: String, required: true },   // 详细描述
  keyCharacteristics: [String],                    // 关键特征
  majorArtists: [{                                 // 主要艺术家
    name: String,
    birthYear: Number,
    deathYear: Number,
    nationality: String,
    bio: String
  }],
  keyArtworks: [{                                  // 代表作品
    title: String,
    artist: String,
    year: Number,
    imageUrl: String,
    description: String
  }],
  influences: [String],                            // 受哪些流派影响
  influencedMovements: [String],                   // 影响了哪些流派
  tags: [String]                                   // 标签分类
});

module.exports = mongoose.model('ArtMovement', ArtMovementSchema); 