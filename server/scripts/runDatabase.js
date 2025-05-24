const { exec } = require('child_process');
const path = require('path');

// 确保MongoDB服务已启动
const startMongoDB = () => {
  return new Promise((resolve, reject) => {
    // 在Windows系统上启动MongoDB服务
    const command = 'net start MongoDB';
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        if (error.message.includes('already been started')) {
          console.log('MongoDB服务已经在运行中');
          resolve();
        } else {
          console.error('启动MongoDB服务失败:', error);
          reject(error);
        }
        return;
      }
      console.log('MongoDB服务启动成功');
      resolve();
    });
  });
};

// 运行数据库种子脚本
const runSeedScript = () => {
  return new Promise((resolve, reject) => {
    const seedScript = path.join(__dirname, 'seedArtData.js');
    const command = `node "${seedScript}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('运行种子脚本失败:', error);
        reject(error);
        return;
      }
      console.log(stdout);
      resolve();
    });
  });
};

// 主函数
const main = async () => {
  try {
    console.log('正在启动数据库服务...');
    await startMongoDB();
    
    console.log('正在运行数据库种子脚本...');
    await runSeedScript();
    
    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('初始化过程中出现错误:', error);
    process.exit(1);
  }
};

// 运行主函数
main(); 