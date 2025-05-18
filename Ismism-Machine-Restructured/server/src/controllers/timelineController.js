const TimelineNode = require('../models/TimelineNode');

// 获取所有时间线节点
exports.getAllNodes = async (req, res) => {
  try {
    const nodes = await TimelineNode.find().sort({ year: 1 });
    res.status(200).json({
      success: true,
      count: nodes.length,
      data: nodes
    });
  } catch (error) {
    console.error('Error fetching timeline nodes:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// 获取单个时间线节点
exports.getNodeById = async (req, res) => {
  try {
    const node = await TimelineNode.findById(req.params.id);
    
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Timeline node not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: node
    });
  } catch (error) {
    console.error(`Error fetching timeline node ${req.params.id}:`, error);
    
    // 处理无效ID格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid timeline node ID'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// 创建新的时间线节点
exports.createNode = async (req, res) => {
  try {
    const node = await TimelineNode.create(req.body);
    
    res.status(201).json({
      success: true,
      data: node
    });
  } catch (error) {
    console.error('Error creating timeline node:', error);
    
    // 处理验证错误
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// 更新时间线节点
exports.updateNode = async (req, res) => {
  try {
    let node = await TimelineNode.findById(req.params.id);
    
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Timeline node not found'
      });
    }
    
    node = await TimelineNode.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: node
    });
  } catch (error) {
    console.error(`Error updating timeline node ${req.params.id}:`, error);
    
    // 处理无效ID格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid timeline node ID'
      });
    }
    
    // 处理验证错误
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// 删除时间线节点
exports.deleteNode = async (req, res) => {
  try {
    const node = await TimelineNode.findById(req.params.id);
    
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Timeline node not found'
      });
    }
    
    await node.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(`Error deleting timeline node ${req.params.id}:`, error);
    
    // 处理无效ID格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid timeline node ID'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 