const express = require('express');
const router = express.Router();
const { 
  getArtMovements, 
  getArtMovement, 
  getTimelineData,
  getGalleryData
} = require('../controllers/artMovementController.cjs');

// Base routes
router.route('/').get(getArtMovements);
router.route('/:id').get(getArtMovement);

// Timeline and Gallery specific routes
router.route('/data/timeline').get(getTimelineData);
router.route('/data/gallery').get(getGalleryData);

module.exports = router; 