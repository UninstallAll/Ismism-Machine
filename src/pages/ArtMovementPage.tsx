import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import GalleryGrid from '../components/GalleryGrid';

// 导入本地数据库
import artStylesData from '../../data/artStyles.json';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  style: string;
  description: string;
}

interface ArtStyle {
  id: string;
  title: string;
  year: number;
  description: string;
  artists: string[];
  styleMovement: string;
  influences: string[];
  influencedBy: string[];
  tags: string[];
  images?: string[];
}

// 将artStyle数据转换为Gallery组件所需的Artwork格式
const convertArtStyleToArtwork = (artStyle: ArtStyle): Artwork[] => {
  // 从艺术风格创建艺术品对象，为每个艺术家创建一个作品
  return artStyle.artists.map((artist: string, index: number) => {
    // 确定图片URL
    let imageUrl = '';
    
    // 如果artStyle有images属性并且有足够的图片，使用对应的图片
    if (artStyle.images && artStyle.images.length > 0) {
      // 为每个艺术家选择不同的图片，确保不越界
      const imageIndex = index % artStyle.images.length;
      imageUrl = artStyle.images[imageIndex];
    } else {
      // 使用TestData中的测试图片作为备份
      imageUrl = `/TestData/${10001 + (index % 30)}.jpg`;
    }
    
    return {
      id: `${artStyle.id}-${index}`,
      title: `${artist}的${artStyle.title}作品`,
      artist: artist,
      year: artStyle.year,
      imageUrl: imageUrl,
      style: artStyle.title,
      description: artStyle.description
    };
  });
};

const ArtMovementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artStyle, setArtStyle] = useState<ArtStyle | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [artStylesWithImages, setArtStylesWithImages] = useState(artStylesData);

  // 加载艺术主义数据
  useEffect(() => {
    setLoading(true);
    
    // 尝试动态导入artStylesWithImages.json
    const loadArtStylesWithImages = async () => {
      try {
        const response = await fetch('/data/artStylesWithImages.json');
        if (response.ok) {
          const data = await response.json();
          setArtStylesWithImages(data);
        } else {
          console.warn('无法加载artStylesWithImages.json，使用默认数据');
          setArtStylesWithImages(artStylesData);
        }
      } catch (error) {
        console.warn('加载artStylesWithImages.json出错，使用默认数据', error);
        setArtStylesWithImages(artStylesData);
      } finally {
        // 加载完成后查找当前艺术主义
        findCurrentArtStyle();
      }
    };
    
    loadArtStylesWithImages();
  }, [id]);

  // 查找当前艺术主义
  const findCurrentArtStyle = () => {
    if (!id) {
      setLoading(false);
      return;
    }

    const foundArtStyle = artStylesWithImages.find(style => style.id === id);
    
    if (foundArtStyle) {
      setArtStyle(foundArtStyle);
      const artworksFromStyle = convertArtStyleToArtwork(foundArtStyle);
      setArtworks(artworksFromStyle);
    } else {
      console.error(`未找到ID为${id}的艺术主义`);
    }
    
    setLoading(false);
  };

  // 当artStylesWithImages更新时，重新查找当前艺术主义
  useEffect(() => {
    findCurrentArtStyle();
  }, [artStylesWithImages, id]);

  // 返回到画廊页面
  const goBackToGallery = () => {
    navigate('/gallery');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!artStyle) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-500">未找到艺术主义</h2>
        <p className="mt-4 text-gray-400">无法找到指定的艺术主义信息</p>
        <Button 
          variant="outline" 
          className="mt-6"
          onClick={goBackToGallery}
        >
          返回画廊
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* 头部导航 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-center"
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-4"
          onClick={goBackToGallery}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回画廊
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {artStyle.title}
        </h1>
      </motion.div>

      {/* 主体内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：艺术主义介绍 */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-[rgba(10,10,11,0.7)] backdrop-blur-lg rounded-xl border border-white/10 p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              {artStyle.title}
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-400 mb-1">时期</h3>
                <p className="text-lg font-medium">{artStyle.year}年</p>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-400 mb-1">描述</h3>
                <p className="text-base">{artStyle.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-400 mb-1">主要艺术家</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {artStyle.artists.map((artist, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-white/5 text-white text-sm px-3 py-1 rounded-full"
                    >
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
              
              {artStyle.influences.length > 0 && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">影响来源</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {artStyle.influences.map((influence, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-white/5 text-white text-sm px-3 py-1 rounded-full"
                      >
                        {influence}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {artStyle.influencedBy.length > 0 && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">受影响于</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {artStyle.influencedBy.map((influenced, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-white/5 text-white text-sm px-3 py-1 rounded-full"
                      >
                        {influenced}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {artStyle.tags.length > 0 && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">标签</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {artStyle.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* 右侧：艺术家作品 */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
            相关艺术作品
          </h2>
          
          {artworks.length > 0 ? (
            <GalleryGrid artworks={artworks} onSelect={setSelectedArtwork} />
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">暂无相关艺术作品</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ArtMovementPage; 