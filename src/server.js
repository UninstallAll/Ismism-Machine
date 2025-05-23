import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import Movement from './models/Movement.js';
import Artist from './models/Artist.js';
import Artwork from './models/Artwork.js';
import ArtMovement from './models/Movement.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Movement Routes
app.get('/api/movements', async (req, res) => {
  try {
    const movements = await Movement.find();
    console.log('Found movements:', movements.length);
    res.json(movements);
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/movements/timeline', async (req, res) => {
  try {
    const movements = await Movement.find().sort('start_year');
    console.log('Found movements for timeline:', movements.length);
    res.json(movements);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/movements/tags', async (req, res) => {
  try {
    const { tags } = req.query;
    const tagsArray = tags.split(',');
    const movements = await Movement.find({
      tags: { $in: tagsArray }
    });
    console.log('Found movements by tags:', movements.length);
    res.json(movements);
  } catch (error) {
    console.error('Error fetching by tags:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/movements/:id', async (req, res) => {
  try {
    const movement = await Movement.findById(req.params.id);
    if (!movement) {
      return res.status(404).json({ message: 'Movement not found' });
    }
    res.json(movement);
  } catch (error) {
    console.error('Error fetching movement:', error);
    res.status(500).json({ message: error.message });
  }
});

// Artist Routes
app.get('/api/artists', async (req, res) => {
  try {
    const artists = await Artist.find();
    console.log('Found artists:', artists.length);
    res.json(artists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ message: error.message });
  }
});

// Artwork Routes
app.get('/api/artworks', async (req, res) => {
  try {
    const artworks = await Artwork.find();
    console.log('Found artworks:', artworks.length);
    res.json(artworks);
  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/artworks/movement/:movementId', async (req, res) => {
  try {
    const artworks = await Artwork.find({ movement_id: req.params.movementId });
    console.log('Found artworks for movement:', artworks.length);
    res.json(artworks);
  } catch (error) {
    console.error('Error fetching movement artworks:', error);
    res.status(500).json({ message: error.message });
  }
});

// 获取特定艺术主义的艺术家信息
app.get('/api/movements/:movementId/artists', async (req, res) => {
  try {
    const movementId = req.params.movementId;
    const movement = await ArtMovement.findById(movementId);
    if (!movement) {
      return res.status(404).json({ message: 'Art movement not found' });
    }
    
    // 获取该艺术主义相关的所有艺术家
    const artists = await Artist.find({ movements: movementId });
    res.json(artists);
  } catch (error) {
    console.error('Error fetching artists for movement:', error);
    res.status(500).json({ message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 