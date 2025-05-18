import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 图片文件夹路径
const TEST_DATA_DIR = path.join(__dirname, '..', 'TestData');
// 输出文件路径
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'galleryImages.json');

// 确保输出目录存在
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 图片样式类别
const styles = [
  '印象派', '后印象派', '现代主义', '立体主义', '超现实主义', 
  '表现主义', '抽象主义', '未来主义', '极简主义', '波普艺术'
];

// 艺术家名称
const artists = [
  '克劳德·莫奈', '文森特·梵高', '巴勃罗·毕加索', '萨尔瓦多·达利', '爱德华·蒙克',
  '瓦西里·康定斯基', '乔治亚·欧姬芙', '雅克-路易·大卫', '杰克逊·波洛克', '弗里达·卡罗'
];

// 处理图片文件
function processImages() {
  // 读取所有文件
  const files = fs.readdirSync(TEST_DATA_DIR);
  
  // 过滤出图片文件
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });
  
  // 创建艺术品数据
  const artworks = imageFiles.map((file, index) => {
    // 生成随机值
    const randomYear = Math.floor(Math.random() * 150) + 1870;
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomArtist = artists[Math.floor(Math.random() * artists.length)];
    
    // 获取文件名（不含扩展名）作为标题
    let title = path.basename(file, path.extname(file));
    
    // 如果文件名以数字开头或者包含@符号，生成一个简单的标题
    if (/^\d/.test(title) || title.includes('@')) {
      title = `艺术作品 ${index + 1}`;
    }
    
    // 限制标题长度
    if (title.length > 30) {
      title = title.substring(0, 30) + '...';
    }
    
    return {
      id: `artwork-${index + 1}`,
      title: title,
      artist: randomArtist,
      year: randomYear,
      imageUrl: `/TestData/${file}`,
      style: randomStyle,
      description: `这是一幅由${randomArtist}于${randomYear}年创作的${randomStyle}作品。这幅作品展示了艺术家独特的视角和创作风格，值得细细品味。`
    };
  });
  
  // 保存为JSON文件
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(artworks, null, 2));
  
  console.log(`✅ 成功处理 ${artworks.length} 张图片，数据已保存至 ${OUTPUT_FILE}`);
}

// 执行处理
processImages(); 