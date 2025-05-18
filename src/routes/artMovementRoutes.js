const express = require('express');
const router = express.Router();
const artMovementController = require('../controllers/artMovementController');

// 获取所有艺术主义
router.get('/', artMovementController.getAllMovements);

// 获取单个艺术主义详情
router.get('/:id', artMovementController.getMovementById);

// 按时间线获取艺术主义
router.get('/timeline/all', artMovementController.getMovementsByTimeline);

// 按标签筛选艺术主义
router.get('/filter/tags', artMovementController.getMovementsByTags);

module.exports = router; 