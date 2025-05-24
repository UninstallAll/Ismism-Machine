// 切换到art_db数据库
db = db.getSiblingDB('art_db');

// 清空已存在的集合
db.artworks.drop();
db.artists.drop();
db.art_movements.drop();

// 1. 创建艺术主义
const artMovements = {
  postImpressionism: db.art_movements.insertOne({
    name: "后印象派",
    start_year: 1880,
    end_year: 1910,
    description: "后印象派是继印象派之后兴起的艺术风格，强调情感与表现。"
  }),

  impressionism: db.art_movements.insertOne({
    name: "印象派",
    start_year: 1860,
    end_year: 1890,
    description: "印象派强调捕捉光线和色彩的瞬间印象。"
  }),

  cubism: db.art_movements.insertOne({
    name: "立体主义",
    start_year: 1907,
    end_year: 1922,
    description: "立体主义强调物体的几何形状和多视角表现。"
  }),

  surrealism: db.art_movements.insertOne({
    name: "超现实主义",
    start_year: 1924,
    end_year: 1950,
    description: "超现实主义探索潜意识和梦境世界。"
  }),

  expressionism: db.art_movements.insertOne({
    name: "表现主义",
    start_year: 1905,
    end_year: 1925,
    description: "表现主义强调主观情感的表达。"
  })
};

// 2. 创建艺术家
const artists = {
  vanGogh: db.artists.insertOne({
    name: "文森特·梵高",
    birth_year: 1853,
    death_year: 1890,
    nationality: "荷兰",
    biography: "文森特·梵高是荷兰后印象派画家，是后印象派的代表人物之一。",
    movements: [artMovements.postImpressionism.insertedId],
    photos: ["https://example.com/photos/vangogh1.jpg"]
  }),

  monet: db.artists.insertOne({
    name: "克劳德·莫奈",
    birth_year: 1840,
    death_year: 1926,
    nationality: "法国",
    biography: "克劳德·莫奈是法国印象派画家，印象派代表人物。",
    movements: [artMovements.impressionism.insertedId],
    photos: ["https://example.com/photos/monet1.jpg"]
  }),

  picasso: db.artists.insertOne({
    name: "巴勃罗·毕加索",
    birth_year: 1881,
    death_year: 1973,
    nationality: "西班牙",
    biography: "巴勃罗·毕加索是20世纪最具影响力的艺术家之一，立体主义创始人。",
    movements: [artMovements.cubism.insertedId],
    photos: ["https://example.com/photos/picasso1.jpg"]
  }),

  dali: db.artists.insertOne({
    name: "萨尔瓦多·达利",
    birth_year: 1904,
    death_year: 1989,
    nationality: "西班牙",
    biography: "萨尔瓦多·达利是超现实主义最著名的代表人物之一。",
    movements: [artMovements.surrealism.insertedId],
    photos: ["https://example.com/photos/dali1.jpg"]
  }),

  munch: db.artists.insertOne({
    name: "爱德华·蒙克",
    birth_year: 1863,
    death_year: 1944,
    nationality: "挪威",
    biography: "爱德华·蒙克是表现主义的先驱者之一。",
    movements: [artMovements.expressionism.insertedId],
    photos: ["https://example.com/photos/munch1.jpg"]
  })
};

// 3. 创建艺术作品
const artworks = {
  starryNight: db.artworks.insertOne({
    title: "星夜",
    artist_id: artists.vanGogh.insertedId,
    movement_id: artMovements.postImpressionism.insertedId,
    year_created: 1889,
    medium: "油画",
    dimensions: {
      height_cm: 73.7,
      width_cm: 92.1
    },
    location: "纽约现代艺术博物馆",
    description: "这幅画描绘了圣雷米的夜景，是梵高最著名的作品之一。",
    images: ["https://example.com/images/starry-night.jpg"]
  }),

  waterLilies: db.artworks.insertOne({
    title: "睡莲",
    artist_id: artists.monet.insertedId,
    movement_id: artMovements.impressionism.insertedId,
    year_created: 1919,
    medium: "油画",
    dimensions: {
      height_cm: 100,
      width_cm: 200
    },
    location: "巴黎橘园美术馆",
    description: "莫奈晚年创作的系列作品之一，描绘了吉维尼花园的睡莲。",
    images: ["https://example.com/images/water-lilies.jpg"]
  }),

  guernica: db.artworks.insertOne({
    title: "格尔尼卡",
    artist_id: artists.picasso.insertedId,
    movement_id: artMovements.cubism.insertedId,
    year_created: 1937,
    medium: "油画",
    dimensions: {
      height_cm: 349.3,
      width_cm: 776.6
    },
    location: "马德里索菲亚王后艺术中心",
    description: "这幅画描绘了西班牙内战中格尔尼卡镇被轰炸的场景。",
    images: ["https://example.com/images/guernica.jpg"]
  }),

  persistenceOfMemory: db.artworks.insertOne({
    title: "记忆的永恒",
    artist_id: artists.dali.insertedId,
    movement_id: artMovements.surrealism.insertedId,
    year_created: 1931,
    medium: "油画",
    dimensions: {
      height_cm: 24.1,
      width_cm: 33
    },
    location: "纽约现代艺术博物馆",
    description: "这幅画以融化的钟表为主题，展现了时间的流动性。",
    images: ["https://example.com/images/persistence-of-memory.jpg"]
  }),

  theScream: db.artworks.insertOne({
    title: "呐喊",
    artist_id: artists.munch.insertedId,
    movement_id: artMovements.expressionism.insertedId,
    year_created: 1893,
    medium: "油画、蜡笔和粉彩",
    dimensions: {
      height_cm: 91,
      width_cm: 73.5
    },
    location: "奥斯陆国家美术馆",
    description: "这幅画表现了现代人的焦虑和绝望。",
    images: ["https://example.com/images/the-scream.jpg"]
  })
};

// 4. 更新艺术家的代表作品
for (let artist in artists) {
  let artistWorks = Object.values(artworks).filter(work => 
    work.insertedId && work.insertedOne.artist_id.equals(artists[artist].insertedId)
  ).map(work => work.insertedId);
  
  if (artistWorks.length > 0) {
    db.artists.updateOne(
      { _id: artists[artist].insertedId },
      { $set: { notable_works: artistWorks } }
    );
  }
}

// 5. 更新艺术主义的代表艺术家和作品
for (let movement in artMovements) {
  let movementWorks = Object.values(artworks).filter(work => 
    work.insertedId && work.insertedOne.movement_id.equals(artMovements[movement].insertedId)
  ).map(work => work.insertedId);
  
  let movementArtists = Object.values(artists).filter(artist => 
    artist.insertedId && artist.insertedOne.movements.includes(artMovements[movement].insertedId)
  ).map(artist => artist.insertedId);

  if (movementWorks.length > 0 || movementArtists.length > 0) {
    db.art_movements.updateOne(
      { _id: artMovements[movement].insertedId },
      { $set: { 
          notable_artworks: movementWorks,
          representative_artists: movementArtists
        } 
      }
    );
  }
}

// 创建索引
db.artworks.createIndex({ artist_id: 1 });
db.artworks.createIndex({ movement_id: 1 });
db.artworks.createIndex({ year_created: 1 });
db.artworks.createIndex({ title: "text" });

db.artists.createIndex({ name: 1 });
db.artists.createIndex({ nationality: 1 });
db.artists.createIndex({ movements: 1 });
db.artists.createIndex({ name: "text", biography: "text" });

db.art_movements.createIndex({ name: 1 }, { unique: true });
db.art_movements.createIndex({ start_year: 1, end_year: 1 });
db.art_movements.createIndex({ name: "text", description: "text" });

// 高级查询示例
print("\n=== 高级查询示例 ===");

// 1. 按时期统计艺术作品数量
print("\n1. 各年代艺术作品统计：");
printjson(db.artworks.aggregate([
  {
    $group: {
      _id: { $subtract: [{ $divide: ["$year_created", 10] }, { $mod: [{ $divide: ["$year_created", 10] }, 1] }] },
      decade: { $first: { $concat: [{ $toString: { $multiply: [{ $subtract: [{ $divide: ["$year_created", 10] }, { $mod: [{ $divide: ["$year_created", 10] }, 1] }] }, 10] } }, "s"] } },
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
]).toArray());

// 2. 艺术家及其作品数量统计
print("\n2. 艺术家作品统计：");
printjson(db.artists.aggregate([
  {
    $lookup: {
      from: "artworks",
      localField: "_id",
      foreignField: "artist_id",
      as: "works"
    }
  },
  {
    $project: {
      _id: 0,
      name: 1,
      nationality: 1,
      work_count: { $size: "$works" }
    }
  },
  { $sort: { work_count: -1 } }
]).toArray());

// 3. 艺术主义影响力分析
print("\n3. 艺术主义影响力分析：");
printjson(db.art_movements.aggregate([
  {
    $lookup: {
      from: "artists",
      localField: "_id",
      foreignField: "movements",
      as: "artists"
    }
  },
  {
    $lookup: {
      from: "artworks",
      localField: "_id",
      foreignField: "movement_id",
      as: "artworks"
    }
  },
  {
    $project: {
      _id: 0,
      name: 1,
      duration: { $subtract: ["$end_year", "$start_year"] },
      artist_count: { $size: "$artists" },
      artwork_count: { $size: "$artworks" }
    }
  },
  { $sort: { artwork_count: -1 } }
]).toArray());

// 4. 全文搜索示例
print("\n4. 包含'光'的艺术作品描述：");
printjson(db.artworks.find(
  { $text: { $search: "光" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } }).toArray()); 