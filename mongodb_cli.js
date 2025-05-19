import { MongoClient } from 'mongodb';
import readline from 'readline';

/**
 * MongoDB命令行交互界面
 */
async function startMongoDBCLI() {
  // 创建MongoDB客户端
  const uri = 'mongodb://localhost:27017/';
  const client = new MongoClient(uri);
  
  // 创建命令行界面
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  try {
    // 连接到MongoDB
    await client.connect();
    console.log('✅ 已连接到MongoDB');
    
    // 默认使用ismism_demo_db数据库
    let currentDB = client.db('ismism_demo_db');
    console.log(`当前数据库: ${currentDB.databaseName}`);
    
    // 显示帮助信息
    printHelp();
    
    // 开始交互循环
    promptUser();
    
    function promptUser() {
      rl.question(`\n[${currentDB.databaseName}]> `, async (input) => {
        // 分割命令和参数
        const parts = input.trim().split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        try {
          // 处理命令
          switch (command) {
            case 'help':
              printHelp();
              break;
              
            case 'exit':
            case 'quit':
              await client.close();
              console.log('MongoDB连接已关闭');
              rl.close();
              return;
              
            case 'use':
              if (args.length === 0) {
                console.log(`当前数据库: ${currentDB.databaseName}`);
              } else {
                currentDB = client.db(args[0]);
                console.log(`已切换到数据库: ${currentDB.databaseName}`);
              }
              break;
              
            case 'show':
              if (args[0] === 'dbs' || args[0] === 'databases') {
                const dbs = await client.db().admin().listDatabases();
                console.log('数据库列表:');
                dbs.databases.forEach(db => console.log(`- ${db.name}`));
              } else if (args[0] === 'collections' || args[0] === 'cols') {
                const collections = await currentDB.listCollections().toArray();
                console.log(`${currentDB.databaseName}中的集合:`);
                collections.forEach(col => console.log(`- ${col.name}`));
              } else {
                console.log('无效的show命令。使用: show dbs 或 show collections');
              }
              break;
              
            case 'find':
              if (args.length < 1) {
                console.log('语法错误: find <集合名> [query]');
                break;
              }
              
              const collectionName = args[0];
              let query = {};
              
              // 检查是否有查询参数
              if (args.length > 1) {
                try {
                  // 将剩余参数合并为一个JSON字符串
                  const queryStr = args.slice(1).join(' ');
                  query = JSON.parse(queryStr);
                } catch (err) {
                  console.log('查询参数格式错误, 使用空查询');
                }
              }
              
              const docs = await currentDB.collection(collectionName).find(query).limit(10).toArray();
              console.log(`在${collectionName}中找到 ${docs.length} 条记录:`);
              docs.forEach((doc, i) => {
                console.log(`\n--- 记录 ${i+1} ---`);
                console.log(JSON.stringify(doc, null, 2));
              });
              break;
              
            case 'insert':
              if (args.length < 2) {
                console.log('语法错误: insert <集合名> <JSON文档>');
                break;
              }
              
              const insertCollection = args[0];
              try {
                const docStr = args.slice(1).join(' ');
                const doc = JSON.parse(docStr);
                
                const insertResult = await currentDB.collection(insertCollection).insertOne(doc);
                console.log(`插入成功，ID: ${insertResult.insertedId}`);
              } catch (err) {
                console.log('文档格式错误:', err.message);
              }
              break;
              
            case 'update':
              if (args.length < 3) {
                console.log('语法错误: update <集合名> <查询> <更新操作>');
                break;
              }
              
              const updateCollection = args[0];
              try {
                const queryStr = args[1];
                const updateStr = args.slice(2).join(' ');
                
                const query = JSON.parse(queryStr);
                const update = JSON.parse(updateStr);
                
                const updateResult = await currentDB.collection(updateCollection).updateOne(query, update);
                console.log(`更新结果: 匹配 ${updateResult.matchedCount}, 修改 ${updateResult.modifiedCount}`);
              } catch (err) {
                console.log('更新操作格式错误:', err.message);
              }
              break;
              
            case 'delete':
              if (args.length < 2) {
                console.log('语法错误: delete <集合名> <查询>');
                break;
              }
              
              const deleteCollection = args[0];
              try {
                const queryStr = args.slice(1).join(' ');
                const query = JSON.parse(queryStr);
                
                const deleteResult = await currentDB.collection(deleteCollection).deleteOne(query);
                console.log(`删除结果: 删除了 ${deleteResult.deletedCount} 条记录`);
              } catch (err) {
                console.log('查询格式错误:', err.message);
              }
              break;
              
            case 'createcollection':
            case 'create':
              if (args.length < 1) {
                console.log('语法错误: createcollection <集合名>');
                break;
              }
              
              const newCollection = args[0];
              await currentDB.createCollection(newCollection);
              console.log(`集合创建成功: ${newCollection}`);
              break;
              
            case 'dropcollection':
            case 'drop':
              if (args.length < 1) {
                console.log('语法错误: dropcollection <集合名>');
                break;
              }
              
              const dropCollection = args[0];
              await currentDB.collection(dropCollection).drop();
              console.log(`集合已删除: ${dropCollection}`);
              break;
              
            case 'count':
              if (args.length < 1) {
                console.log('语法错误: count <集合名> [query]');
                break;
              }
              
              const countCollection = args[0];
              let countQuery = {};
              
              if (args.length > 1) {
                try {
                  const queryStr = args.slice(1).join(' ');
                  countQuery = JSON.parse(queryStr);
                } catch (err) {
                  console.log('查询参数格式错误, 使用空查询');
                }
              }
              
              const count = await currentDB.collection(countCollection).countDocuments(countQuery);
              console.log(`${countCollection}中有 ${count} 条记录匹配查询`);
              break;
              
            default:
              if (command) {
                console.log(`未知命令: ${command}. 输入 'help' 查看可用命令`);
              }
          }
        } catch (err) {
          console.error('命令执行错误:', err.message);
        }
        
        // 继续提示
        promptUser();
      });
    }
    
  } catch (err) {
    console.error('MongoDB连接错误:', err);
    rl.close();
    await client.close();
  }
}

// 打印帮助信息
function printHelp() {
  console.log('\n===== MongoDB命令行界面 =====');
  console.log('可用命令:');
  console.log('- help                          显示帮助信息');
  console.log('- show dbs                      显示所有数据库');
  console.log('- show collections              显示当前数据库中的集合');
  console.log('- use <数据库名>                 切换数据库');
  console.log('- find <集合名> [查询]           查询文档');
  console.log('- insert <集合名> <JSON文档>     插入文档');
  console.log('- update <集合名> <查询> <更新>   更新文档');
  console.log('- delete <集合名> <查询>         删除文档');
  console.log('- count <集合名> [查询]          统计文档数量');
  console.log('- create <集合名>               创建新集合');
  console.log('- drop <集合名>                 删除集合');
  console.log('- exit                          退出');
  console.log('\n示例:');
  console.log('> find artMovements {"name":"印象派"}');
  console.log('> update artMovements {"name":"印象派"} {"$push":{"majorArtists":"莫里索"}}');
  console.log('> insert artMovements {"name":"未来主义","period":{"start":1909,"end":1944}}');
}

// 启动MongoDB命令行界面
startMongoDBCLI().catch(console.error); 