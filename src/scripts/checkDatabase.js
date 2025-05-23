import mongoose from 'mongoose';
import Movement from '../models/Movement.js';
import Artist from '../models/Artist.js';
import Artwork from '../models/Artwork.js';

const MONGODB_URI = 'mongodb://localhost:27017/ismismdatabase';

async function checkDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 检查movements集合
    const movements = await Movement.find();
    console.log('Movements count:', movements.length);
    if (movements.length > 0) {
      console.log('Sample movement:', movements[0]);
    }

    // 检查artists集合
    const artists = await Artist.find();
    console.log('Artists count:', artists.length);
    if (artists.length > 0) {
      console.log('Sample artist:', artists[0]);
    }

    // 检查artworks集合
    const artworks = await Artwork.find();
    console.log('Artworks count:', artworks.length);
    if (artworks.length > 0) {
      console.log('Sample artwork:', artworks[0]);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabase(); 