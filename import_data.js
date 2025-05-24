import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

// 转换ID为ObjectId的函数
function convertToObjectId(id) {
  try {
    return new ObjectId(id);
  } catch (error) {
    console.warn(`警告: ID ${id} 无法转换为ObjectId`);
    return id;
  }
}

// 自动检测JSON数据的模式
function detectSchema(data) {
  const schema = {
    bsonType: "object",
    required: [],
    properties: {}
  };

  // 分析第一个对象的结构
  const sampleObject = Array.isArray(data) ? data[0] : data;
  
  Object.entries(sampleObject).forEach(([key, value]) => {
    // 确定字段类型
    let fieldType;
    if (Array.isArray(value)) {
      fieldType = {
        bsonType: "array",
        items: { bsonType: typeof value[0] === 'object' ? 'object' : 'string' }
      };
    } else if (value === null) {
      fieldType = { bsonType: ["null", "string", "number"] };
    } else if (typeof value === 'object') {
      fieldType = { bsonType: "object" };
    } else {
      fieldType = { bsonType: [typeof value, "null"] };
    }

    schema.properties[key] = fieldType;
    
    // 如果字段有值，将其添加到必需字段列表
    if (value !== null && value !== undefined && value !== '') {
      schema.required.push(key);
    }
  });

  return schema;
}

// 创建集合和索引的函数
async function createCollectionsAndIndexes(db, schemas) {
  // 删除现有集合
  for (const collectionName of Object.keys(schemas)) {
    try {
      await db.collection(collectionName).drop();
    } catch (error) {
      // 忽略集合不存在的错误
    }
  }
  console.log('✅ 已清空现有集合');

  // 创建新集合
  for (const [collectionName, schema] of Object.entries(schemas)) {
    await db.createCollection(collectionName, {
      validator: {
        $jsonSchema: schema
      },
      validationAction: "warn" // 将验证失败改为警告而不是错误
    });

    // 创建索引
    if (collectionName === 'artists') {
      await db.collection(collectionName).createIndex({ name: 1 });
      await db.collection(collectionName).createIndex({ movements: 1 });
    } else if (collectionName === 'art_movements') {
      await db.collection(collectionName).createIndex({ name: 1 });
    } else if (collectionName === 'artworks') {
      await db.collection(collectionName).createIndex({ title: 1 });
    }
  }
  console.log('✅ 集合和索引创建完成');
}

// 艺术运动数据映射函数
function mapMovementData(movement) {
  const mappedMovement = {
    _id: convertToObjectId(movement._id),
    name: movement.name || '',
    start_year: movement.start_year || null,
    end_year: movement.end_year || null,
    description: movement.description || '',
    representative_artists: (movement.representative_artists || []).map(id => convertToObjectId(id)),
    notable_artworks: (movement.notable_artworks || []).map(id => convertToObjectId(id)),
    influences: movement.influences || [],
    influencedBy: movement.influencedBy || [],
    images: movement.images || [],
    tags: movement.tags || []
  };

  // 数据验证
  if (!mappedMovement.name) {
    console.warn(`警告: 艺术运动 ${movement._id} 缺少名称`);
  }

  return mappedMovement;
}

// 艺术家数据映射函数
function mapArtistData(artist) {
  const mappedArtist = {
    _id: convertToObjectId(artist._id),
    name: artist.name || '',
    birth_year: artist.birth_year || null,
    death_year: artist.death_year || null,
    nationality: artist.nationality || '',
    biography: artist.biography || '',
    movements: (artist.movements || []).map(id => convertToObjectId(id)),
    notable_works: (artist.notable_works || []).map(id => convertToObjectId(id)),
    portrait_url: artist.portrait_url || ''
  };

  // 数据验证
  if (!mappedArtist.name) {
    console.warn(`警告: 艺术家 ${artist._id} 缺少名称`);
  }

  return mappedArtist;
}

// 艺术品数据映射函数
function mapArtworkData(artwork) {
  const mappedArtwork = {
    _id: convertToObjectId(artwork._id),
    title: artwork.title || '',
    artist_id: artwork.artist_id ? convertToObjectId(artwork.artist_id) : null,
    movement_id: artwork.movement_id ? convertToObjectId(artwork.movement_id) : null,
    year_created: artwork.year_created || null,
    medium: artwork.medium || null,
    dimensions: artwork.dimensions || null,
    location: artwork.location || null,
    description: artwork.description || '',
    images: artwork.images || []
  };

  // 数据验证
  if (!mappedArtwork.title) {
    console.warn(`警告: 艺术品 ${artwork._id} 缺少标题`);
  }

  return mappedArtwork;
}

async function importData() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ MongoDB连接成功!');

    const db = client.db('IsmismMachine');

    // 读取并解析所有JSON文件
    const dataFiles = {
      'artists': JSON.parse(fs.readFileSync('server/database/example/artists.json', 'utf8')),
      'art_movements': JSON.parse(fs.readFileSync('server/database/example/movements.json', 'utf8')),
      'artworks': JSON.parse(fs.readFileSync('server/database/example/artworks.json', 'utf8'))
    };

    // 为每个集合检测模式
    const schemas = {};
    for (const [collectionName, data] of Object.entries(dataFiles)) {
      schemas[collectionName] = detectSchema(data);
    }

    // 创建集合和索引
    await createCollectionsAndIndexes(db, schemas);

    // 导入数据（使用映射函数）
    for (const [collectionName, data] of Object.entries(dataFiles)) {
      let mappedData;
      switch(collectionName) {
        case 'artists':
          mappedData = data.map(mapArtistData);
          break;
        case 'art_movements':
          mappedData = data.map(mapMovementData);
          break;
        case 'artworks':
          mappedData = data.map(mapArtworkData);
          break;
        default:
          mappedData = data;
      }
      
      const result = await db.collection(collectionName).insertMany(mappedData);
      console.log(`✅ 成功导入 ${result.insertedCount} 条数据到 ${collectionName}`);
    }

    // 验证导入的数据
    console.log('\n数据验证:');
    for (const collectionName of Object.keys(dataFiles)) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`${collectionName} 集合中的文档数量: ${count}`);
    }

    // 检查关联关系
    const movements = await db.collection('art_movements').find({}).toArray();
    movements.forEach(movement => {
      if (movement.representative_artists?.length > 0) {
        console.log(`艺术运动 "${movement.name}" 关联了 ${movement.representative_artists.length} 位艺术家`);
      }
      if (movement.notable_artworks?.length > 0) {
        console.log(`艺术运动 "${movement.name}" 关联了 ${movement.notable_artworks.length} 件艺术品`);
      }
    });

    console.log('✅ 所有数据导入完成!');

  } catch (error) {
    console.error('❌ 数据导入失败:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB连接已关闭');
  }
}

// 执行导入
importData()
  .then(() => console.log('导入过程完成!'))
  .catch(console.error); 