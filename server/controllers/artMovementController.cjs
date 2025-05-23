const ArtMovement = require('../models/ArtMovement');
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');

// Get all art movements with related data
exports.getArtMovements = async (req, res) => {
  try {
    const artMovements = await ArtMovement.find({});
    const enrichedMovements = await Promise.all(
      artMovements.map(async (movement) => {
        const artists = await Artist.find({ movements: movement._id });
        const artworks = await Artwork.find({ movement_id: movement._id });
        return {
          ...movement.toObject(),
          artists: artists.map(artist => ({
            id: artist._id,
            name: artist.name,
            biography: artist.biography,
            portrait_url: artist.portrait_url
          })),
          artworks: artworks.map(artwork => ({
            id: artwork._id,
            title: artwork.title,
            description: artwork.description,
            images: artwork.images,
            year_created: artwork.year_created
          }))
        };
      })
    );
    res.json(enrichedMovements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single art movement with related data
exports.getArtMovement = async (req, res) => {
  try {
    const movement = await ArtMovement.findById(req.params.id);
    if (!movement) {
      return res.status(404).json({ message: 'Art movement not found' });
    }

    const artists = await Artist.find({ movements: movement._id });
    const artworks = await Artwork.find({ movement_id: movement._id });

    const enrichedMovement = {
      ...movement.toObject(),
      artists: artists.map(artist => ({
        id: artist._id,
        name: artist.name,
        biography: artist.biography,
        portrait_url: artist.portrait_url
      })),
      artworks: artworks.map(artwork => ({
        id: artwork._id,
        title: artwork.title,
        description: artwork.description,
        images: artwork.images,
        year_created: artwork.year_created
      }))
    };

    res.json(enrichedMovement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get timeline data
exports.getTimelineData = async (req, res) => {
  try {
    const movements = await ArtMovement.find({})
      .sort('startYear')
      .select('name startYear endYear description');
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get gallery data
exports.getGalleryData = async (req, res) => {
  try {
    const artworks = await Artwork.find({})
      .populate('artist_id', 'name')
      .populate('movement_id', 'name')
      .select('title images description artist_id movement_id year_created');
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new art movement
exports.createArtMovement = async (req, res) => {
  try {
    const artMovement = new ArtMovement(req.body);
    const newArtMovement = await artMovement.save();
    res.status(201).json(newArtMovement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 