/**
 * 艺术图像搜索和下载工具
 * 
 * 此脚本用于根据artStyles.json中的艺术主义信息，搜索并下载相关图像，
 * 并在本地数据库中建立索引，使每个艺术主义能对应20张图像。
 * 
 * 使用方法:
 * 1. 安装依赖: npm install axios fs-extra node-fetch sharp
 * 2. 运行脚本: node data/fetchArtImages.js
 */

import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import fetch from 'node-fetch';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 导入艺术主义数据
const artStylesPath = path.join(__dirname, './artStyles.json');
const artStylesData = JSON.parse(await fs.readFile(artStylesPath, 'utf8'));

// Unsplash API密钥 - 请替换为你自己的密钥
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';

// Pexels API密钥 - 请替换为你自己的密钥
const PEXELS_API_KEY = 'YOUR_PEXELS_API_KEY';

// 图片数据库索引文件路径
const imageIndexPath = path.join(__dirname, 'imageIndex.json');

// 每个艺术主义需要的图片数量
const IMAGES_PER_STYLE = 20;

// 已下载图片索引结构
let imageIndex = {};

// 初始化索引文件
async function initImageIndex() {
  if (await fs.pathExists(imageIndexPath)) {
    imageIndex = await fs.readJson(imageIndexPath);
    console.log('已加载现有图片索引');
  } else {
    // 为每个艺术主义创建一个空数组
    artStylesData.forEach(style => {
      imageIndex[style.id] = [];
    });
    await fs.writeJson(imageIndexPath, imageIndex, { spaces: 2 });
    console.log('已创建新的图片索引');
  }
}

// 确保所有必要的目录存在
async function ensureDirectories() {
  // 确保public/images目录存在
  await fs.ensureDir(path.join(__dirname, '../public/images'));
  
  // 为每个艺术主义创建目录
  for (const style of artStylesData) {
    await fs.ensureDir(path.join(__dirname, '../public/images', style.id));
  }
  
  console.log('所有必要的目录已创建');
}

// 从Unsplash搜索图片
async function searchUnsplashImages(query, count = 5) {
  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query,
        per_page: count,
        orientation: 'landscape'
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
    
    return response.data.results.map(result => ({
      id: result.id,
      url: result.urls.regular,
      small_url: result.urls.small,
      alt_description: result.alt_description || query,
      credit: `Photo by ${result.user.name} on Unsplash`,
      source: 'unsplash'
    }));
  } catch (error) {
    console.error(`Unsplash搜索失败: ${error.message}`);
    return [];
  }
}

// 从Pexels搜索图片
async function searchPexelsImages(query, count = 5) {
  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query,
        per_page: count,
        orientation: 'landscape'
      },
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });
    
    return response.data.photos.map(photo => ({
      id: photo.id,
      url: photo.src.medium,
      small_url: photo.src.small,
      alt_description: photo.alt || query,
      credit: `Photo by ${photo.photographer} on Pexels`,
      source: 'pexels'
    }));
  } catch (error) {
    console.error(`Pexels搜索失败: ${error.message}`);
    return [];
  }
}

// 下载图片
async function downloadImage(imageInfo, styleId, index) {
  try {
    const imageDir = path.join(__dirname, '../public/images', styleId);
    const ext = path.extname(new URL(imageInfo.url).pathname) || '.jpg';
    const filename = `${index + 1}${ext}`;
    const imagePath = path.join(imageDir, filename);
    
    console.log(`下载图片: ${imageInfo.url} -> ${imagePath}`);
    
    // 使用fetch和pipeline下载图片
    const response = await fetch(imageInfo.url);
    if (!response.ok) throw new Error(`响应状态: ${response.status}`);
    
    // 使用sharp优化图片
    const transform = sharp()
      .resize(800, null, { fit: 'inside' })
      .jpeg({ quality: 85 });
    
    await pipeline(
      response.body,
      transform,
      fs.createWriteStream(imagePath)
    );
    
    // 返回图片本地路径和相关信息
    return {
      id: imageInfo.id,
      path: `/images/${styleId}/${filename}`,
      alt_description: imageInfo.alt_description,
      credit: imageInfo.credit,
      source: imageInfo.source
    };
  } catch (error) {
    console.error(`下载图片失败: ${error.message}`);
    return null;
  }
}

// 为艺术主义搜索和下载图片
async function processArtStyle(style) {
  console.log(`处理艺术主义: ${style.title}`);
  
  // 已有的图片数量
  const existingImages = imageIndex[style.id].length;
  
  // 如果已经有20张图片，跳过
  if (existingImages >= IMAGES_PER_STYLE) {
    console.log(`${style.title} 已有 ${existingImages} 张图片，跳过...`);
    return;
  }
  
  // 需要下载的图片数量
  const neededImages = IMAGES_PER_STYLE - existingImages;
  
  // 构建搜索关键词
  const searchTerms = [
    `${style.title} art`,
    `${style.styleMovement} painting`,
    ...style.artists.map(artist => `${artist} ${style.styleMovement} art`)
  ];
  
  // 搜索图片
  let allImages = [];
  
  for (const term of searchTerms) {
    if (allImages.length >= neededImages) break;
    
    // 从Unsplash搜索图片
    if (UNSPLASH_ACCESS_KEY !== 'YOUR_UNSPLASH_ACCESS_KEY') {
      const unsplashImages = await searchUnsplashImages(term, 5);
      allImages = [...allImages, ...unsplashImages];
    }
    
    // 从Pexels搜索图片
    if (PEXELS_API_KEY !== 'YOUR_PEXELS_API_KEY') {
      const pexelsImages = await searchPexelsImages(term, 5);
      allImages = [...allImages, ...pexelsImages];
    }
  }
  
  // 如果没有找到图片，使用本地TestData图片作为备份
  if (allImages.length === 0) {
    console.log(`没有找到 ${style.title} 的图片，使用本地TestData图片作为备份`);
    
    // 确定本地图片的起始索引
    const startIdx = (artStylesData.findIndex(s => s.id === style.id) * 5) % 30 + 10001;
    
    // 模拟图片信息
    for (let i = 0; i < neededImages; i++) {
      const idx = (startIdx + i) % 30 + 10001;
      
      // 检查TestData图片是否存在
      const testDataPath = path.join(__dirname, '../TestData', `${idx}.jpg`);
      if (await fs.pathExists(testDataPath)) {
        // 复制TestData图片到艺术主义目录
        const targetDir = path.join(__dirname, '../public/images', style.id);
        const targetPath = path.join(targetDir, `${existingImages + i + 1}.jpg`);
        
        await fs.copy(testDataPath, targetPath);
        
        // 添加到索引
        imageIndex[style.id].push({
          id: `test-${idx}`,
          path: `/images/${style.id}/${existingImages + i + 1}.jpg`,
          alt_description: `${style.title} artwork`,
          credit: 'Test image from local TestData',
          source: 'local'
        });
      }
    }
    
    // 保存索引
    await fs.writeJson(imageIndexPath, imageIndex, { spaces: 2 });
    return;
  }
  
  // 去重和限制图片数量
  const uniqueImages = Array.from(new Map(allImages.map(img => [img.id, img])).values());
  const imagesToDownload = uniqueImages.slice(0, neededImages);
  
  // 下载图片
  for (let i = 0; i < imagesToDownload.length; i++) {
    const downloadedImage = await downloadImage(
      imagesToDownload[i], 
      style.id, 
      existingImages + i
    );
    
    if (downloadedImage) {
      imageIndex[style.id].push(downloadedImage);
    }
  }
  
  // 保存索引
  await fs.writeJson(imageIndexPath, imageIndex, { spaces: 2 });
  
  console.log(`${style.title} 处理完成，共 ${imageIndex[style.id].length} 张图片`);
}

// 主函数
async function main() {
  try {
    // 初始化图片索引
    await initImageIndex();
    
    // 确保所有必要的目录存在
    await ensureDirectories();
    
    // 处理每个艺术主义
    for (const style of artStylesData) {
      await processArtStyle(style);
      
      // 等待一秒，避免API请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('所有艺术主义图片处理完成！');
    
    // 更新整体索引文件
    const artStylesWithImages = artStylesData.map(style => ({
      ...style,
      images: imageIndex[style.id].map(img => img.path)
    }));
    
    await fs.writeJson(
      path.join(__dirname, 'artStylesWithImages.json'),
      artStylesWithImages,
      { spaces: 2 }
    );
    
    console.log('artStylesWithImages.json 已创建');
  } catch (error) {
    console.error('处理过程中出错:', error);
  }
}

// 执行主函数
main(); 