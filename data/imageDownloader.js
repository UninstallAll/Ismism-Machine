/**
 * 图片下载器脚本
 * 
 * 使用方法:
 * 1. 修改imageSearchUrls.json文件，添加真实的图片URL
 * 2. 运行: node imageDownloader.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 读取URL配置文件
const imageUrls = require('./imageSearchUrls.json');
const artStyles = require('./artStyles.json');

// 确保所有艺术风格文件夹都存在
artStyles.forEach(style => {
  const dirPath = path.join(__dirname, 'images', style.id);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`创建文件夹: ${style.id}`);
  }
});

// 下载图片的函数
function downloadImage(url, destPath, callback) {
  const protocol = url.startsWith('https') ? https : http;
  
  const file = fs.createWriteStream(destPath);
  
  const request = protocol.get(url, response => {
    if (response.statusCode !== 200) {
      fs.unlink(destPath, () => {
        callback(new Error(`下载失败: ${response.statusCode}`));
      });
      return;
    }
    
    response.pipe(file);
    
    file.on('finish', () => {
      file.close(callback);
      console.log(`下载完成: ${destPath}`);
    });
  });
  
  request.on('error', err => {
    fs.unlink(destPath, () => {
      callback(err);
    });
  });
  
  file.on('error', err => {
    fs.unlink(destPath, () => {
      callback(err);
    });
  });
}

// 循环每个艺术风格，下载其图片
Object.keys(imageUrls).forEach(styleId => {
  const urls = imageUrls[styleId];
  const styleDir = path.join(__dirname, 'images', styleId);
  
  urls.forEach((url, index) => {
    // 获取文件名 (使用URL的最后部分)
    const fileName = url.split('/').pop() || `image_${index + 1}.jpg`;
    const filePath = path.join(styleDir, fileName);
    
    console.log(`开始下载 ${styleId} 的图片: ${url}`);
    
    downloadImage(url, filePath, (err) => {
      if (err) {
        console.error(`下载失败 ${url}: ${err.message}`);
      }
    });
  });
});

console.log('下载任务已启动。请等待完成...'); 