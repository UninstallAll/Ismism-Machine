import { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

// 示例数据
const sampleArtworks = [
  {
    id: "1",
    title: "向日葵",
    artist: "文森特·梵高",
    year: 1888,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/46/Vincent_Willem_van_Gogh_127.jpg",
    style: "后印象派",
    description: "《向日葵》是荷兰后印象派画家文森特·梵高创作的一系列静物油画作品。画作描绘了盛开或凋谢的向日葵，简单明快的黄色调充满了生命力和热情。"
  },
  {
    id: "2",
    title: "星月夜",
    artist: "文森特·梵高",
    year: 1889,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    style: "后印象派",
    description: "《星月夜》是荷兰后印象派画家文森特·梵高于1889年创作的一幅油画。这幅画描绘了画家从圣雷米疗养院的窗户所见的夜景，充满了动感的螺旋状云层和明亮的星空。"
  },
  {
    id: "3",
    title: "格尔尼卡",
    artist: "巴勃罗·毕加索",
    year: 1937,
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/7/74/PicassoGuernica.jpg",
    style: "立体主义",
    description: "《格尔尼卡》是西班牙画家巴勃罗·毕加索创作的一幅巨型油画，描绘了1937年4月26日德国空军对西班牙北部小镇格尔尼卡的轰炸。这幅画是对战争暴行和人类痛苦的强烈谴责。"
  },
  {
    id: "4",
    title: "记忆的永恒",
    artist: "萨尔瓦多·达利",
    year: 1931,
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg",
    style: "超现实主义",
    description: "《记忆的永恒》（又称《熔化的钟表》）是西班牙超现实主义画家萨尔瓦多·达利于1931年创作的一幅油画，画中柔软变形的钟表象征着时间的相对性和主观性。"
  },
  {
    id: "5",
    title: "睡莲",
    artist: "克劳德·莫奈",
    year: 1919,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Claude_Monet_-_Water_Lilies_-_1919.jpg",
    style: "印象派",
    description: "《睡莲》是法国印象派画家克劳德·莫奈晚年创作的一系列大型油画，描绘了其花园中的睡莲池塘。这些作品捕捉了水面上光影的变化，是印象派对光和色彩研究的集大成者。"
  },
  {
    id: "6",
    title: "舞者",
    artist: "亨利·马蒂斯",
    year: 1910,
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/8/8d/Matissedance.jpg",
    style: "野兽派",
    description: "《舞者》是法国野兽派画家亨利·马蒂斯的代表作，画中简化的人物形象和大胆的色彩运用体现了野兽派的艺术特点。"
  }
];

const sampleTimelineItems = [
  {
    id: "t1",
    title: "印象派",
    year: 1870,
    description: "印象派是19世纪后期在法国兴起的艺术运动，强调捕捉光线和色彩的瞬间效果，而非追求细节和轮廓。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Claude_Monet_-_Water_Lilies_-_1919.jpg",
    artists: ["克劳德·莫奈", "皮埃尔-奥古斯特·雷诺阿", "埃德加·德加", "卡米耶·毕沙罗"],
    styleMovement: "印象派",
    influences: ["浮世绘", "写生传统"],
    influencedBy: ["巴比松画派", "浪漫主义"]
  },
  {
    id: "t2",
    title: "立体主义",
    year: 1907,
    description: "立体主义是20世纪初由巴勃罗·毕加索和乔治·布拉克发起的前卫艺术运动，它打破了传统的透视法则，从多个角度同时表现对象。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/7/74/PicassoGuernica.jpg",
    artists: ["巴勃罗·毕加索", "乔治·布拉克", "费尔南·莱热", "胡安·格里斯"],
    styleMovement: "立体主义",
    influences: ["非洲雕塑", "塞尚的几何趋向"],
    influencedBy: ["后印象派"]
  },
  {
    id: "t3",
    title: "超现实主义",
    year: 1924,
    description: "超现实主义强调梦境、潜意识和非理性思维的艺术表达，将现实与幻想、理性与非理性融为一体。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg",
    artists: ["萨尔瓦多·达利", "勒内·马格里特", "胡安·米罗", "马克思·恩斯特"],
    styleMovement: "超现实主义",
    influences: ["精神分析学", "达达主义"],
    influencedBy: ["弗洛伊德理论"]
  },
  {
    id: "t4",
    title: "抽象表现主义",
    year: 1946,
    description: "抽象表现主义是二战后在美国兴起的艺术运动，强调艺术家的自发性表达和情感宣泄，通常采用大尺幅画布和非具象形式。",
    imageUrl: "https://www.jackson-pollock.org/images/paintings/convergence.jpg",
    artists: ["杰克逊·波洛克", "马克·罗斯科", "威廉·德·库宁", "克莱夫特·斯蒂尔"],
    styleMovement: "抽象表现主义",
    influences: ["超现实主义的自动技法", "欧洲抽象艺术"],
    influencedBy: ["立体主义", "表现主义"]
  },
  {
    id: "t5",
    title: "波普艺术",
    year: 1955,
    description: "波普艺术源于1950年代的英国和美国，借用大众文化和日常生活中的图像、产品和风格进行艺术创作，挑战传统的精英艺术观念。",
    imageUrl: "https://www.masterworksfineart.com/wp-content/uploads/2018/12/Andy-Warhol-Campbells-Soup-I-Tomato-F.S.-II.46-1968.jpg",
    artists: ["安迪·沃霍尔", "罗伊·李支登斯坦", "理查德·汉密尔顿", "克拉斯·奥尔登伯格"],
    styleMovement: "波普艺术",
    influences: ["商业广告", "漫画", "大众文化"],
    influencedBy: ["达达主义", "新现实主义"]
  }
];

// 示例分类数据
const categories = [
  {
    id: "c1",
    name: "19世纪艺术主义",
    subcategories: [
      { id: "sc1", name: "浪漫主义" },
      { id: "sc2", name: "现实主义" },
      { id: "sc3", name: "印象派" },
      { id: "sc4", name: "后印象派" }
    ]
  },
  {
    id: "c2",
    name: "20世纪前卫艺术",
    subcategories: [
      { id: "sc5", name: "野兽派" },
      { id: "sc6", name: "立体主义" },
      { id: "sc7", name: "未来主义" },
      { id: "sc8", name: "达达主义" },
      { id: "sc9", name: "超现实主义" }
    ]
  },
  {
    id: "c3",
    name: "战后艺术主义",
    subcategories: [
      { id: "sc10", name: "抽象表现主义" },
      { id: "sc11", name: "波普艺术" },
      { id: "sc12", name: "极简主义" },
      { id: "sc13", name: "概念艺术" }
    ]
  },
  {
    id: "c4",
    name: "当代艺术主义",
    subcategories: [
      { id: "sc14", name: "新表现主义" },
      { id: "sc15", name: "后现代主义" },
      { id: "sc16", name: "装置艺术" }
    ]
  }
];

function App() {
  const [activeView, setActiveView] = useState<'gallery' | 'timeline' | 'stats' | 'ai'>('gallery');
  
  const handleNavChange = (view: 'gallery' | 'timeline' | 'stats' | 'ai') => {
    setActiveView(view);
  };
  
  const handleCategorySelect = (categoryId: string, subcategoryId?: string) => {
    console.log(`Selected category: ${categoryId}, subcategory: ${subcategoryId || 'none'}`);
    // 这里可以实现过滤逻辑
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="主义主义机" onNavChange={handleNavChange} activeView={activeView} />
      <Sidebar categories={categories} onCategorySelect={handleCategorySelect} />
      <MainContent 
        artworks={sampleArtworks} 
        timelineItems={sampleTimelineItems} 
        activeView={activeView} 
      />
    </div>
  );
}

export default App; 