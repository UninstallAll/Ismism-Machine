const Artwork = require('../models/Artwork');
const Artist = require('../models/Artist');
const ArtMovement = require('../models/ArtMovement');

// 艺术作品相关操作
const artworkOperations = {
  // 获取作品及其艺术家信息
  async getArtworkWithArtist(artworkId) {
    return await Artwork.findById(artworkId)
      .populate('artist_id')
      .populate('movement_id');
  },

  // 根据艺术主义获取作品
  async getArtworksByMovement(movementId) {
    return await Artwork.find({ movement_id: movementId })
      .populate('artist_id');
  },

  // 创建新作品
  async createArtwork(artworkData) {
    const artwork = new Artwork(artworkData);
    return await artwork.save();
  }
};

// 艺术家相关操作
const artistOperations = {
  // 获取艺术家及其所有作品
  async getArtistWithWorks(artistId) {
    return await Artist.findById(artistId)
      .populate('notable_works')
      .populate('movements');
  },

  // 获取艺术家的所有作品
  async getArtistAllWorks(artistId) {
    return await Artwork.find({ artist_id: artistId })
      .populate('movement_id');
  },

  // 创建新艺术家
  async createArtist(artistData) {
    const artist = new Artist(artistData);
    return await artist.save();
  }
};

// 艺术主义相关操作
const artMovementOperations = {
  // 获取艺术主义及其艺术家和作品
  async getMovementDetails(movementId) {
    return await ArtMovement.findById(movementId)
      .populate('representative_artists')
      .populate('notable_artworks');
  },

  // 获取某时期的艺术主义
  async getMovementsByPeriod(startYear, endYear) {
    return await ArtMovement.find({
      start_year: { $lte: endYear },
      end_year: { $gte: startYear }
    });
  },

  // 创建新艺术主义
  async createArtMovement(movementData) {
    const movement = new ArtMovement(movementData);
    return await movement.save();
  }
};

// 高级查询操作
const advancedQueries = {
  // 获取特定年代范围内的所有作品
  async getArtworksByPeriod(startYear, endYear) {
    return await Artwork.find({
      year_created: { $gte: startYear, $lte: endYear }
    })
    .populate('artist_id')
    .populate('movement_id');
  },

  // 获取某个国籍的所有艺术家及其作品
  async getArtistsByNationality(nationality) {
    return await Artist.find({ nationality })
      .populate('notable_works')
      .populate('movements');
  },

  // 获取跨越多个艺术主义的艺术家
  async getMultiMovementArtists() {
    return await Artist.aggregate([
      {
        $match: {
          $expr: { $gt: [{ $size: "$movements" }, 1] }
        }
      },
      {
        $lookup: {
          from: 'artmovements',
          localField: 'movements',
          foreignField: '_id',
          as: 'movement_details'
        }
      }
    ]);
  }
};

module.exports = {
  artworkOperations,
  artistOperations,
  artMovementOperations,
  advancedQueries
}; 