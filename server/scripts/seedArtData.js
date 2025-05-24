const connectDB = require('../config/database');
const { artworkOperations, artistOperations, artMovementOperations } = require('../database/dbOperations');
const Artist = require('../models/Artist');
const ArtMovement = require('../models/ArtMovement');

const seedData = async () => {
  try {
    // 连接数据库
    await connectDB();
    console.log('开始插入示例数据...');

    // 1. 创建艺术主义
    const postImpressionism = await artMovementOperations.createArtMovement({
      name: "后印象派",
      start_year: 1880,
      end_year: 1910,
      description: "后印象派是继印象派之后兴起的艺术风格，强调情感与表现。"
    });

    const impressionism = await artMovementOperations.createArtMovement({
      name: "印象派",
      start_year: 1860,
      end_year: 1890,
      description: "印象派强调捕捉光线和色彩的瞬间印象。"
    });

    // 2. 创建艺术家
    const vanGogh = await artistOperations.createArtist({
      name: "文森特·梵高",
      birth_year: 1853,
      death_year: 1890,
      nationality: "荷兰",
      biography: "文森特·梵高是荷兰后印象派画家，是后印象派的代表人物之一。",
      movements: [postImpressionism._id],
      photos: ["https://example.com/photos/vangogh1.jpg"]
    });

    const monet = await artistOperations.createArtist({
      name: "克劳德·莫奈",
      birth_year: 1840,
      death_year: 1926,
      nationality: "法国",
      biography: "克劳德·莫奈是法国印象派画家，印象派代表人物。",
      movements: [impressionism._id],
      photos: ["https://example.com/photos/monet1.jpg"]
    });

    // 3. 创建艺术作品
    const starryNight = await artworkOperations.createArtwork({
      title: "星夜",
      artist_id: vanGogh._id,
      movement_id: postImpressionism._id,
      year_created: 1889,
      medium: "油画",
      dimensions: {
        height_cm: 73.7,
        width_cm: 92.1
      },
      location: "纽约现代艺术博物馆",
      description: "这幅画描绘了圣雷米的夜景，是梵高最著名的作品之一。",
      images: ["https://example.com/images/starry-night.jpg"]
    });

    const waterLilies = await artworkOperations.createArtwork({
      title: "睡莲",
      artist_id: monet._id,
      movement_id: impressionism._id,
      year_created: 1919,
      medium: "油画",
      dimensions: {
        height_cm: 100,
        width_cm: 200
      },
      location: "巴黎橘园美术馆",
      description: "莫奈晚年创作的系列作品之一，描绘了吉维尼花园的睡莲。",
      images: ["https://example.com/images/water-lilies.jpg"]
    });

    // 4. 更新艺术家的代表作品
    await Artist.findByIdAndUpdate(vanGogh._id, {
      $push: { notable_works: starryNight._id }
    });

    await Artist.findByIdAndUpdate(monet._id, {
      $push: { notable_works: waterLilies._id }
    });

    // 5. 更新艺术主义的代表艺术家和作品
    await ArtMovement.findByIdAndUpdate(postImpressionism._id, {
      $push: { 
        representative_artists: vanGogh._id,
        notable_artworks: starryNight._id
      }
    });

    await ArtMovement.findByIdAndUpdate(impressionism._id, {
      $push: { 
        representative_artists: monet._id,
        notable_artworks: waterLilies._id
      }
    });

    console.log('示例数据插入成功！');
    
    // 测试查询
    console.log('\n执行一些测试查询：');
    
    // 测试1：获取梵高的所有作品
    const vanGoghWorks = await artistOperations.getArtistAllWorks(vanGogh._id);
    console.log('\n梵高的作品：', vanGoghWorks);

    // 测试2：获取后印象派的所有作品
    const postImpressionismWorks = await artworkOperations.getArtworksByMovement(postImpressionism._id);
    console.log('\n后印象派作品：', postImpressionismWorks);

    // 测试3：获取1880-1900年间的艺术主义
    const movements1880_1900 = await artMovementOperations.getMovementsByPeriod(1880, 1900);
    console.log('\n1880-1900年间的艺术主义：', movements1880_1900);

    process.exit(0);
  } catch (error) {
    console.error('数据插入错误：', error);
    process.exit(1);
  }
};

// 运行种子脚本
seedData(); 