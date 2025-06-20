const express = require('express');
const router = express.Router();
const artMovementController = require('../controllers/artMovementController');

/**
 * @route   GET /api/art-movements
 * @desc    Get all art movements
 * @access  Public
 */
router.get('/', artMovementController.getAllArtMovements);

/**
 * @route   GET /api/art-movements/:id
 * @desc    Get a single art movement by ID
 * @access  Public
 */
router.get('/:id', artMovementController.getArtMovementById);

/**
 * @route   GET /api/art-movements/timeline/all
 * @desc    Get all art movements in timeline format
 * @access  Public
 */
router.get('/timeline/all', artMovementController.getArtMovementsTimeline);

/**
 * @route   GET /api/art-movements/search
 * @desc    Search art movements by query
 * @access  Public
 */
router.get('/search', artMovementController.searchArtMovements);

/**
 * @route   GET /api/art-movements/filter/tags
 * @desc    Filter art movements by tags
 * @access  Public
 */
router.get('/filter/tags', artMovementController.filterByTags);

module.exports = router; 