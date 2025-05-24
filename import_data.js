import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

async function importData() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ MongoDB连接成功!');

    const db = client.db('IsmismMachine');

    // 读取JSON文件
    const artistsData = JSON.parse(fs.readFileSync('server/database/example/artists.json', 'utf8'));
    const movementsData = JSON.parse(fs.readFileSync('server/database/example/movements.json', 'utf8'));

    // 预处理艺术家数据
    const processedArtistsData = artistsData.map(artist => {
      // 确保_id是ObjectId类型
      const _id = typeof artist._id === 'string' ? new ObjectId(artist._id) : artist._id;
      
      // 处理movements数组
      const movements = (artist.movements || []).map(id => 
        typeof id === 'string' ? new ObjectId(id) : id
      );

      // 处理notable_works数组
      const notable_works = (artist.notable_works || []).map(id =>
        typeof id === 'string' ? new ObjectId(id) : id
      );

      return {
        _id,
        name: artist.name || '',
        birth_year: artist.birth_year || null,
        death_year: artist.death_year || null,
        nationality: artist.nationality || '',
        biography: artist.biography || '',
        movements,
        notable_works,
        portrait_url: artist.portrait_url || ''
      };
    });

    // 预处理艺术运动数据
    const processedMovementsData = movementsData.map(movement => {
      // 确保_id是ObjectId类型
      const _id = typeof movement._id === 'string' ? new ObjectId(movement._id) : movement._id;

      // 处理representative_artists数组
      const representative_artists = (movement.representative_artists || []).map(id =>
        typeof id === 'string' ? new ObjectId(id) : id
      );

      // 处理notable_artworks数组
      const notable_artworks = (movement.notable_artworks || []).map(id =>
        typeof id === 'string' ? new ObjectId(id) : id
      );

      return {
        _id,
        name: movement.name || '',
        start_year: movement.start_year || null,
        end_year: movement.end_year || null,
        description: movement.description || '',
        representative_artists,
        notable_artworks
      };
    });

    // 清空现有集合
    await db.collection('artists').deleteMany({});
    await db.collection('art_movements').deleteMany({});
    console.log('✅ 已清空现有集合');

    // 导入艺术家数据
    const artistsCollection = db.collection('artists');
    const artistsResult = await artistsCollection.insertMany(processedArtistsData, { ordered: false });
    console.log(`✅ 成功导入 ${artistsResult.insertedCount} 位艺术家数据`);

    // 导入艺术运动数据
    const movementsCollection = db.collection('art_movements');
    const movementsResult = await movementsCollection.insertMany(processedMovementsData, { ordered: false });
    console.log(`✅ 成功导入 ${movementsResult.insertedCount} 个艺术运动数据`);

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