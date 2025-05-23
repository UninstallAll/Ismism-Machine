const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');
const Movement = require('../models/Movement');

const connectDB = require('../config/db');

const importData = async () => {
  try {
    await connectDB();

    // 读取JSON文件
    const artistsData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../database/example/artists.json'), 'utf-8')
    );
    const artworksData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../database/example/artworks.json'), 'utf-8')
    );
    const movementsData = JSON.parse(
      await fs.readFile(path.join(__dirname, '../database/example/movements.json'), 'utf-8')
    );

    // 清空现有数据
    await Artist.deleteMany();
    await Artwork.deleteMany();
    await Movement.deleteMany();

    // 导入新数据
    await Artist.insertMany(artistsData);
    await Artwork.insertMany(artworksData);
    await Movement.insertMany(movementsData);

    console.log('Data imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData(); 