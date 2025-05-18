const express = require('express');
const timelineController = require('../controllers/timelineController');

const router = express.Router();

// 获取所有时间线节点
router.get('/', timelineController.getAllNodes);

// 获取单个时间线节点
router.get('/:id', timelineController.getNodeById);

// 创建新的时间线节点
router.post('/', timelineController.createNode);

// 更新时间线节点
router.put('/:id', timelineController.updateNode);

// 删除时间线节点
router.delete('/:id', timelineController.deleteNode);

module.exports = router; 