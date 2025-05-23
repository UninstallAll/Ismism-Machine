const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const ArtMovement = require('../models/ArtMovement.cjs');
const Artist = require('../models/Artist.cjs');
const Artwork = require('../models/Artwork.cjs');

const connectDB = require('../config/db.cjs');

const importData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await ArtMovement.deleteMany();
    await Artist.deleteMany();
    await Artwork.deleteMany();

    // Read JSON files
    const artMovementsData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../database/example/art_database.json'), 'utf-8')
    );
    const artistsData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../database/example/artists.json'), 'utf-8')
    );
    const artworksData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../database/example/artworks.json'), 'utf-8')
    );

    // Import data with original _id values
    await ArtMovement.insertMany(artMovementsData);
    await Artist.insertMany(artistsData);
    await Artwork.insertMany(artworksData);

    console.log('Data imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData(); 