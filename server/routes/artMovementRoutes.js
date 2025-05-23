const express = require('express');
const router = express.Router();
const { getAllArtMovements } = require('../controllers/artMovementController');

router.get('/movements', getAllArtMovements);

module.exports = router; 