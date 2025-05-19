import { MongoClient } from 'mongodb';

async function demonstrateMongoQueries() {
  const uri = 'mongodb://localhost:27017/ismism_machine_db';
  const client = new MongoClient(uri);

  try {
    console.log('连接到MongoDB...');
    await client.connect();
    console.log('MongoDB连接成功！');
    
    const db = client.db('ismism_machine_db');
    
    // 准备演示数据：创建并填充测试集合
    const testCollection = 'query_demo_collection';
    console.log(`\n准备测试集合: ${testCollection}`);
    
    // 检查是否存在，如果存在则先删除
    const collections = await db.listCollections({ name: testCollection }).toArray();
    if (collections.length > 0) {
      await db.collection(testCollection).drop();
    }
    
    // 创建新集合
    const collection = db.collection(testCollection);
    
    // 插入测试数据：电子产品目录
    const products = [
      {
        name: "超薄笔记本电脑",
        category: "电脑",
        brand: "品牌A",
        price: 5999,
        specs: {
          cpu: "Core i7",
          ram: "16GB",
          storage: "512GB SSD",
          screenSize: 14
        },
        inStock: true,
        tags: ["轻薄", "高性能", "办公"],
        reviews: [
          { user: "用户1", rating: 5, comment: "非常满意" },
          { user: "用户2", rating: 4, comment: "性能出色" }
        ],
        createdAt: new Date('2025-01-15')
      },
      {
        name: "游戏笔记本电脑",
        category: "电脑",
        brand: "品牌B",
        price: 8999,
        specs: {
          cpu: "Core i9",
          ram: "32GB",
          storage: "1TB SSD",
          screenSize: 17
        },
        inStock: true,
        tags: ["游戏", "高性能", "发烧"],
        reviews: [
          { user: "用户3", rating: 5, comment: "游戏流畅" },
          { user: "用户4", rating: 3, comment: "散热一般" }
        ],
        createdAt: new Date('2025-02-10')
      },
      {
        name: "入门笔记本电脑",
        category: "电脑",
        brand: "品牌C",
        price: 3999,
        specs: {
          cpu: "Core i5",
          ram: "8GB",
          storage: "256GB SSD",
          screenSize: 15.6
        },
        inStock: true,
        tags: ["入门", "性价比", "学生"],
        reviews: [
          { user: "用户5", rating: 4, comment: "性价比高" }
        ],
        createdAt: new Date('2025-03-05')
      },
      {
        name: "高端智能手机",
        category: "手机",
        brand: "品牌A",
        price: 6999,
        specs: {
          cpu: "A15",
          ram: "8GB",
          storage: "256GB",
          screenSize: 6.7
        },
        inStock: true,
        tags: ["旗舰", "摄影", "5G"],
        reviews: [
          { user: "用户6", rating: 5, comment: "拍照超赞" },
          { user: "用户7", rating: 5, comment: "电池续航好" },
          { user: "用户8", rating: 4, comment: "系统流畅" }
        ],
        createdAt: new Date('2025-01-20')
      },
      {
        name: "中端智能手机",
        category: "手机",
        brand: "品牌D",
        price: 2999,
        specs: {
          cpu: "A13",
          ram: "6GB",
          storage: "128GB",
          screenSize: 6.4
        },
        inStock: false,
        tags: ["中端", "性价比", "5G"],
        reviews: [
          { user: "用户9", rating: 4, comment: "性价比高" },
          { user: "用户10", rating: 3, comment: "摄像一般" }
        ],
        createdAt: new Date('2025-02-25')
      },
      {
        name: "专业平板电脑",
        category: "平板",
        brand: "品牌A",
        price: 5499,
        specs: {
          cpu: "A14",
          ram: "6GB",
          storage: "128GB",
          screenSize: 11
        },
        inStock: true,
        tags: ["专业", "创作", "便携"],
        reviews: [
          { user: "用户11", rating: 5, comment: "画图很舒适" },
          { user: "用户12", rating: 5, comment: "屏幕显示效果好" }
        ],
        createdAt: new Date('2025-03-15')
      },
      {
        name: "入门平板电脑",
        category: "平板",
        brand: "品牌E",
        price: 1999,
        specs: {
          cpu: "A12",
          ram: "4GB",
          storage: "64GB",
          screenSize: 10.2
        },
        inStock: true,
        tags: ["入门", "娱乐", "学习"],
        reviews: [
          { user: "用户13", rating: 4, comment: "适合孩子学习" },
          { user: "用户14", rating: 3, comment: "性能一般" }
        ],
        createdAt: new Date('2025-01-30')
      },
      {
        name: "智能手表",
        category: "穿戴设备",
        brand: "品牌A",
        price: 2799,
        specs: {
          cpu: "S6",
          storage: "32GB",
          screenSize: 1.7
        },
        inStock: true,
        tags: ["健康", "运动", "通知"],
        reviews: [
          { user: "用户15", rating: 5, comment: "续航提升明显" },
          { user: "用户16", rating: 4, comment: "健康监测准确" }
        ],
        createdAt: new Date('2025-02-15')
      },
      {
        name: "无线耳机",
        category: "音频设备",
        brand: "品牌A",
        price: 1299,
        specs: {
          batteryLife: "24小时",
          noiseReduction: true
        },
        inStock: false,
        tags: ["无线", "降噪", "舒适"],
        reviews: [
          { user: "用户17", rating: 5, comment: "音质优秀" },
          { user: "用户18", rating: 5, comment: "降噪效果好" },
          { user: "用户19", rating: 4, comment: "佩戴舒适" }
        ],
        createdAt: new Date('2025-03-01')
      },
      {
        name: "智能音箱",
        category: "音频设备",
        brand: "品牌D",
        price: 899,
        specs: {
          power: "10W",
          assistant: true
        },
        inStock: true,
        tags: ["智能", "音乐", "家居"],
        reviews: [
          { user: "用户20", rating: 4, comment: "音质不错" },
          { user: "用户21", rating: 3, comment: "语音识别一般" }
        ],
        createdAt: new Date('2025-01-10')
      }
    ];
    
    const inserted = await collection.insertMany(products);
    console.log(`插入了 ${inserted.insertedCount} 个测试产品数据`);
    
    // 创建索引
    await collection.createIndex({ name: 1 });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ brand: 1 });
    await collection.createIndex({ price: 1 });
    await collection.createIndex({ tags: 1 });
    await collection.createIndex({ "specs.screenSize": 1 });
    await collection.createIndex({ "reviews.rating": 1 });
    console.log('创建了索引');
    
    // 基本查询
    console.log('\n===== 基本查询 =====');
    
    // 1. 按价格范围查询
    console.log('\n-- 价格在3000-6000之间的产品 --');
    const priceRangeResults = await collection.find({
      price: { $gte: 3000, $lte: 6000 }
    }).toArray();
    
    priceRangeResults.forEach(product => {
      console.log(`${product.name} - ¥${product.price} - ${product.category}`);
    });
    
    // 2. 按类别和库存状态查询
    console.log('\n-- 有库存的手机和平板 --');
    const inStockResults = await collection.find({
      category: { $in: ['手机', '平板'] },
      inStock: true
    }).toArray();
    
    inStockResults.forEach(product => {
      console.log(`${product.name} - ${product.category} - 品牌: ${product.brand}`);
    });
    
    // 3. 使用正则表达式查询产品名称
    console.log('\n-- 名称中包含"智能"的产品 --');
    const nameRegexResults = await collection.find({
      name: /智能/
    }).toArray();
    
    nameRegexResults.forEach(product => {
      console.log(`${product.name} - ${product.category}`);
    });
    
    // 4. 使用嵌套对象查询
    console.log('\n-- 屏幕尺寸大于10英寸的产品 --');
    const screenSizeResults = await collection.find({
      "specs.screenSize": { $gt: 10 }
    }).toArray();
    
    screenSizeResults.forEach(product => {
      console.log(`${product.name} - 屏幕: ${product.specs.screenSize}英寸`);
    });
    
    // 5. 使用数组查询
    console.log('\n-- 带有"性价比"标签的产品 --');
    const tagResults = await collection.find({
      tags: "性价比"
    }).toArray();
    
    tagResults.forEach(product => {
      console.log(`${product.name} - 标签: ${product.tags.join(', ')}`);
    });
    
    // 6. 复杂条件查询
    console.log('\n-- 品牌A的产品且价格大于5000或包含"专业"标签 --');
    const complexResults = await collection.find({
      brand: "品牌A",
      $or: [
        { price: { $gt: 5000 } },
        { tags: "专业" }
      ]
    }).toArray();
    
    complexResults.forEach(product => {
      console.log(`${product.name} - ¥${product.price} - 标签: ${product.tags.join(', ')}`);
    });
    
    // 7. 查询嵌套数组中的对象
    console.log('\n-- 评分为5星的产品 --');
    const reviewResults = await collection.find({
      "reviews.rating": 5
    }).toArray();
    
    reviewResults.forEach(product => {
      console.log(`${product.name} - 评价数: ${product.reviews.length}`);
    });
    
    // 高级聚合操作
    console.log('\n===== 高级聚合操作 =====');
    
    // 1. 按类别统计产品数量和平均价格
    console.log('\n-- 按类别统计 --');
    const categoryStats = await collection.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          averagePrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();
    
    categoryStats.forEach(stat => {
      console.log(`类别: ${stat._id}`);
      console.log(`  产品数量: ${stat.count}`);
      console.log(`  平均价格: ¥${stat.averagePrice.toFixed(2)}`);
      console.log(`  价格范围: ¥${stat.minPrice} - ¥${stat.maxPrice}`);
    });
    
    // 2. 按品牌和类别分组统计
    console.log('\n-- 按品牌和类别统计产品数量 --');
    const brandCategoryStats = await collection.aggregate([
      {
        $group: {
          _id: {
            brand: "$brand",
            category: "$category"
          },
          count: { $sum: 1 },
          models: { $push: "$name" }
        }
      },
      {
        $sort: { "_id.brand": 1, "_id.category": 1 }
      }
    ]).toArray();
    
    brandCategoryStats.forEach(stat => {
      console.log(`品牌: ${stat._id.brand}, 类别: ${stat._id.category}`);
      console.log(`  产品数量: ${stat.count}`);
      console.log(`  型号: ${stat.models.join(', ')}`);
    });
    
    // 3. 计算每个品牌的总销售额（假设每个产品都卖出一台）
    console.log('\n-- 各品牌总销售额 --');
    const brandSales = await collection.aggregate([
      {
        $group: {
          _id: "$brand",
          totalSales: { $sum: "$price" },
          productCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalSales: -1 }
      }
    ]).toArray();
    
    brandSales.forEach(brand => {
      console.log(`品牌: ${brand._id}`);
      console.log(`  产品数量: ${brand.productCount}`);
      console.log(`  总销售额: ¥${brand.totalSales}`);
    });
    
    // 4. 统计每个产品的平均评分
    console.log('\n-- 产品平均评分 --');
    const productRatings = await collection.aggregate([
      {
        $unwind: "$reviews"
      },
      {
        $group: {
          _id: "$name",
          averageRating: { $avg: "$reviews.rating" },
          reviewCount: { $sum: 1 }
        }
      },
      {
        $match: {
          reviewCount: { $gt: 1 }
        }
      },
      {
        $sort: { averageRating: -1 }
      }
    ]).toArray();
    
    productRatings.forEach(product => {
      console.log(`产品: ${product._id}`);
      console.log(`  评价数量: ${product.reviewCount}`);
      console.log(`  平均评分: ${product.averageRating.toFixed(1)}`);
    });
    
    // 5. 查找评价数量最多的产品
    console.log('\n-- 评价数量最多的产品 --');
    const mostReviewed = await collection.aggregate([
      {
        $project: {
          name: 1,
          category: 1,
          brand: 1,
          reviewCount: { $size: "$reviews" }
        }
      },
      {
        $sort: { reviewCount: -1 }
      },
      {
        $limit: 3
      }
    ]).toArray();
    
    mostReviewed.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.brand}`);
      console.log(`   评价数量: ${product.reviewCount}`);
    });
    
    // 6. 按月份统计产品发布数量
    console.log('\n-- 按月份统计产品发布数量 --');
    const monthlyStats = await collection.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          products: { $push: "$name" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]).toArray();
    
    monthlyStats.forEach(stat => {
      console.log(`${stat._id.year}年${stat._id.month}月: ${stat.count}个产品`);
      console.log(`  产品: ${stat.products.join(', ')}`);
    });
    
    // 7. 标签分析
    console.log('\n-- 最常用的产品标签 --');
    const tagStats = await collection.aggregate([
      {
        $unwind: "$tags"
      },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
          products: { $push: "$name" }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]).toArray();
    
    tagStats.forEach((tag, index) => {
      console.log(`${index + 1}. 标签: ${tag._id} - 出现${tag.count}次`);
      console.log(`   产品: ${tag.products.join(', ')}`);
    });
    
    console.log('\nMongoDB查询和聚合演示完成！');
    
  } catch (error) {
    console.error('MongoDB操作失败:', error);
  } finally {
    await client.close();
    console.log('MongoDB连接已关闭');
  }
}

// 执行演示
demonstrateMongoQueries().catch(console.error); 