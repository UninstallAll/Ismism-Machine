const mongoose = require('mongoose');
const ArtMovement = require('../src/models/ArtMovement');
require('dotenv').config();

const artMovementsData = [
  {
    name: '印象派',
    period: { start: 1860, end: 1890 },
    description: '印象派起源于19世纪60年代末的法国巴黎，重视光线和颜色的即时视觉印象。',
    keyCharacteristics: ['户外写生', '捕捉光影变化', '短促笔触', '鲜艳色彩'],
    majorArtists: [
      {
        name: '克劳德·莫奈',
        birthYear: 1840,
        deathYear: 1926,
        nationality: '法国',
        bio: '印象派代表人物，以描绘光线和色彩的变化著称。'
      },
      {
        name: '皮埃尔-奥古斯特·雷诺阿',
        birthYear: 1841,
        deathYear: 1919,
        nationality: '法国',
        bio: '印象派画家，以描绘欢乐的、充满活力的人物场景和裸体而闻名。'
      }
    ],
    keyArtworks: [
      {
        title: '日出·印象',
        artist: '克劳德·莫奈',
        year: 1872,
        imageUrl: '/images/impression-sunrise.jpg',
        description: '这幅画给印象派命名，描绘了勒阿弗尔港口的日出景象。'
      },
      {
        title: '睡莲',
        artist: '克劳德·莫奈',
        year: 1899,
        imageUrl: '/images/water-lilies.jpg',
        description: '莫奈晚年创作的系列作品，描绘了他花园中的睡莲池塘。'
      }
    ],
    influences: ['巴比松画派', '日本浮世绘'],
    influencedMovements: ['后印象派', '野兽派'],
    tags: ['19世纪', '法国', '光影', '自然']
  },
  {
    name: '立体主义',
    period: { start: 1907, end: 1922 },
    description: '立体主义由毕加索和布拉克开创，强调几何形式和多视角分析。',
    keyCharacteristics: ['几何形式', '多视角', '分析与综合', '单色调'],
    majorArtists: [
      {
        name: '巴勃罗·毕加索',
        birthYear: 1881,
        deathYear: 1973,
        nationality: '西班牙',
        bio: '20世纪最有影响力的艺术家之一，立体主义的创始人。'
      },
      {
        name: '乔治·布拉克',
        birthYear: 1882,
        deathYear: 1963,
        nationality: '法国',
        bio: '与毕加索一起发展了立体主义，以静物画和风景画著称。'
      }
    ],
    keyArtworks: [
      {
        title: '亚维农少女',
        artist: '巴勃罗·毕加索',
        year: 1907,
        imageUrl: '/images/les-demoiselles-davignon.jpg',
        description: '被视为立体主义的开端，打破了传统透视法。'
      },
      {
        title: '吉他手',
        artist: '巴勃罗·毕加索',
        year: 1910,
        imageUrl: '/images/guitarist.jpg',
        description: '分析立体主义时期的代表作，将对象分解为几何形状。'
      }
    ],
    influences: ['塞尚', '非洲雕塑', '伊比利亚雕塑'],
    influencedMovements: ['未来主义', '构成主义', '超现实主义'],
    tags: ['20世纪初', '法国', '西班牙', '几何', '抽象']
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB连接成功');
    
    // 清空现有数据
    await ArtMovement.deleteMany({});
    console.log('已清空现有数据');
    
    // 插入新数据
    await ArtMovement.insertMany(artMovementsData);
    console.log('数据导入成功');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('数据导入失败:', error);
    process.exit(1);
  }
};

seedDatabase(); 