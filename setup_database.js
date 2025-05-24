import { MongoClient } from 'mongodb';

async function setupDatabase() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ MongoDB连接成功!');

    // 创建/获取数据库
    const db = client.db('IsmismMachine');

    // 删除现有集合（如果存在）
    try {
      await db.collection('artworks').drop();
      await db.collection('artists').drop();
      await db.collection('art_movements').drop();
    } catch (e) {
      // 忽略集合不存在的错误
    }

    // 创建集合
    await db.createCollection('artworks');
    await db.createCollection('artists');
    await db.createCollection('art_movements');

    // 创建索引
    const artworksCollection = db.collection('artworks');
    const artistsCollection = db.collection('artists');
    const artMovementsCollection = db.collection('art_movements');

    // artworks集合的索引
    await artworksCollection.createIndex({ artist_id: 1 });
    await artworksCollection.createIndex({ movement_id: 1 });
    await artworksCollection.createIndex({ title: 1 });
    await artworksCollection.createIndex({ year_created: 1 });

    // artists集合的索引
    await artistsCollection.createIndex({ name: 1 });
    await artistsCollection.createIndex({ nationality: 1 });
    await artistsCollection.createIndex({ movements: 1 });

    // art_movements集合的索引
    await artMovementsCollection.createIndex({ name: 1 });
    await artMovementsCollection.createIndex({ start_year: 1 });
    await artMovementsCollection.createIndex({ end_year: 1 });
    await artMovementsCollection.createIndex({ representative_artists: 1 });

    console.log('✅ 数据库和集合创建成功!');
    console.log('✅ 索引创建成功!');

    // 创建数据库验证规则
    await db.command({
      collMod: 'artworks',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['title'],
          properties: {
            title: { bsonType: 'string' },
            artist_id: { bsonType: ['objectId', 'null'] },
            movement_id: { bsonType: ['objectId', 'null'] },
            year_created: { bsonType: ['int', 'null'] },
            medium: { bsonType: ['string', 'null'] },
            dimensions: {
              bsonType: ['object', 'null'],
              properties: {
                height_cm: { bsonType: 'double' },
                width_cm: { bsonType: 'double' }
              }
            },
            location: { bsonType: ['string', 'null'] },
            description: { bsonType: ['string', 'null'] },
            images: {
              bsonType: ['array', 'null'],
              items: { bsonType: 'string' }
            }
          }
        }
      }
    });

    await db.command({
      collMod: 'artists',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name'],
          properties: {
            name: { bsonType: 'string' },
            birth_year: { bsonType: ['int', 'null'] },
            death_year: { bsonType: ['int', 'null'] },
            nationality: { bsonType: ['string', 'null'] },
            biography: { bsonType: ['string', 'null'] },
            movements: {
              bsonType: ['array', 'null'],
              items: { bsonType: 'objectId' }
            },
            notable_works: {
              bsonType: ['array', 'null'],
              items: { bsonType: 'objectId' }
            },
            portrait_url: { bsonType: ['string', 'null'] }
          }
        }
      }
    });

    await db.command({
      collMod: 'art_movements',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name'],
          properties: {
            name: { bsonType: 'string' },
            start_year: { bsonType: ['int', 'null'] },
            end_year: { bsonType: ['int', 'null'] },
            description: { bsonType: ['string', 'null'] },
            representative_artists: {
              bsonType: ['array', 'null'],
              items: { bsonType: 'objectId' }
            },
            notable_artworks: {
              bsonType: ['array', 'null'],
              items: { bsonType: 'objectId' }
            }
          }
        }
      }
    });

    console.log('✅ 数据验证规则创建成功!');

  } catch (error) {
    console.error('❌ 数据库设置失败:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB连接已关闭');
  }
}

// 执行数据库设置
setupDatabase()
  .then(() => console.log('数据库设置完成!'))
  .catch(console.error); 