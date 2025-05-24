const express = require('express');
const router = express.Router();
const { getAllArtMovements } = require('../controllers/artMovementController');

// 根路径路由
router.get('/', getAllArtMovements);

module.exports = router; 