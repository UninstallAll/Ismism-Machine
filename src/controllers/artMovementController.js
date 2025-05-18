const ArtMovement = require('../models/ArtMovement');

// 获取所有艺术主义
exports.getAllMovements = async (req, res) => {
  try {
    const movements = await ArtMovement.find().select('name period description');
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个艺术主义详情
exports.getMovementById = async (req, res) => {
  try {
    const movement = await ArtMovement.findById(req.params.id);
    if (!movement) {
      return res.status(404).json({ message: '未找到该艺术主义' });
    }
    res.json(movement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 按时间线获取艺术主义
exports.getMovementsByTimeline = async (req, res) => {
  try {
    const movements = await ArtMovement.find().sort({ 'period.start': 1 });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 按标签筛选艺术主义
exports.getMovementsByTags = async (req, res) => {
  try {
    const { tags } = req.query;
    const tagsArray = tags.split(',');
    
    const movements = await ArtMovement.find({
      tags: { $in: tagsArray }
    });
    
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 