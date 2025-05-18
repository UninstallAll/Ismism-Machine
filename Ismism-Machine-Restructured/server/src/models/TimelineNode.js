const mongoose = require('mongoose');

const TimelineNodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请提供时间线节点的标题'],
    trim: true,
    maxlength: [100, '标题不能超过100个字符']
  },
  description: {
    type: String,
    required: [true, '请提供时间线节点的描述'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, '请提供时间线节点的年份']
  },
  imageUrl: {
    type: String,
    required: false
  },
  artists: {
    type: [String],
    default: []
  },
  styleMovement: {
    type: String,
    required: false
  },
  influences: {
    type: [String],
    default: []
  },
  influencedBy: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// 添加索引以支持更快的查询
TimelineNodeSchema.index({ year: 1 });
TimelineNodeSchema.index({ styleMovement: 1 });
TimelineNodeSchema.index({ tags: 1 });

module.exports = mongoose.model('TimelineNode', TimelineNodeSchema); 