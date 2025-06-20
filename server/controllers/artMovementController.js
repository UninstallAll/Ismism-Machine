const mongoose = require('mongoose');
const ArtMovement = require('../models/ArtMovement');

/**
 * Get all art movements
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with art movements
 */
exports.getAllArtMovements = async (req, res) => {
  try {
    const artMovements = await ArtMovement.find({})
      .select('name description tags') // Return only essential fields for list view
      .sort({ name: 1 });
    
    return res.status(200).json({
      success: true,
      count: artMovements.length,
      data: artMovements
    });
  } catch (err) {
    console.error('Error fetching art movements:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get a single art movement by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with art movement details
 */
exports.getArtMovementById = async (req, res) => {
  try {
    const artMovement = await ArtMovement.findById(req.params.id);
    
    if (!artMovement) {
      return res.status(404).json({
        success: false,
        error: 'Art movement not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: artMovement
    });
  } catch (err) {
    console.error('Error fetching art movement:', err);
    
    // Check if error is due to invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Art movement not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get art movements as a timeline
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with timeline data
 */
exports.getArtMovementsTimeline = async (req, res) => {
  try {
    const artMovements = await ArtMovement.find({})
      .select('name description start_year end_year')
      .sort({ start_year: 1 });
    
    const timeline = artMovements.map(movement => ({
      id: movement._id,
      name: movement.name,
      description: movement.description.substring(0, 150) + '...',
      startYear: movement.start_year || 2000, // Default to contemporary if no date
      endYear: movement.end_year || 2023
    }));
    
    return res.status(200).json({
      success: true,
      count: timeline.length,
      data: timeline
    });
  } catch (err) {
    console.error('Error fetching art movements timeline:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Search art movements by query
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with search results
 */
exports.searchArtMovements = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    // Create a text index for full-text search
    const searchResults = await ArtMovement.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    }).select('name description tags');
    
    return res.status(200).json({
      success: true,
      count: searchResults.length,
      data: searchResults
    });
  } catch (err) {
    console.error('Error searching art movements:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Filter art movements by tags
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with filtered movements
 */
exports.filterByTags = async (req, res) => {
  try {
    const { tags } = req.query;
    
    if (!tags) {
      return res.status(400).json({
        success: false,
        error: 'Tags are required for filtering'
      });
    }
    
    const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
    
    const filteredMovements = await ArtMovement.find({
      tags: { $in: tagArray }
    }).select('name description tags');
    
    return res.status(200).json({
      success: true,
      count: filteredMovements.length,
      data: filteredMovements
    });
  } catch (err) {
    console.error('Error filtering art movements:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 