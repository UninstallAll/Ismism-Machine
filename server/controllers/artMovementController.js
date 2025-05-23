const Movement = require('../models/Movement');
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');

// 获取所有艺术运动数据，包括相关的艺术家和作品信息
exports.getAllArtMovements = async (req, res) => {
  try {
    const movements = await Movement.find();
    const enrichedMovements = await Promise.all(movements.map(async (movement) => {
      // 获取相关艺术家信息
      const artists = await Artist.find({
        _id: { $in: movement.representative_artists }
      });
      
      // 获取相关作品信息
      const artworks = await Artwork.find({
        _id: { $in: movement.notable_artworks }
      });

      return {
        id: movement._id,
        title: movement.name,
        year: movement.start_year,
        description: movement.description,
        artists: artists.map(artist => artist.name),
        artworks: artworks.map(artwork => ({
          title: artwork.title,
          imageUrl: artwork.images[0] || null
        })),
        styleMovement: movement.name,
        images: artworks.reduce((acc, artwork) => [...acc, ...(artwork.images || [])], [])
      };
    }));

    res.json(enrichedMovements);
  } catch (error) {
    console.error('Error fetching art movements:', error);
    res.status(500).json({ message: 'Error fetching art movements' });
  }
}; 