import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
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

  // 返回上一页
  const goBack = () => {
    navigate(-1);
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
          onClick={goBack}
        >
          返回
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
      style={{ pointerEvents: 'none' }}
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={goBack}
        style={{ pointerEvents: 'auto' }}
      />
      
      <motion.div 
        className="bg-black/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ pointerEvents: 'auto' }}
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        {/* 头部导航 */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-4"
              onClick={goBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {artStyle.title}
            </h1>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={goBack}
            className="rounded-full w-8 h-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 内容区域 - 可滚动 */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 h-full">
            {/* 左侧：艺术主义介绍，调整为更宽 */}
            <div className="lg:col-span-3 p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">时期</h3>
                  <p className="text-lg font-medium">{artStyle.year}年</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">描述</h3>
                  <p className="text-base leading-relaxed">{artStyle.description}</p>
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
              </div>
            </div>
            
            {/* 右侧：艺术作品展示，调整为更窄、可上下滚动 */}
            <div className="lg:col-span-1 bg-black/40 border-l border-white/10 p-4 overflow-y-auto max-h-[calc(90vh-4rem)]">
              <h3 className="text-lg font-medium mb-4">代表作品</h3>
              <div className="space-y-3">
                {artworks.map((artwork, index) => (
                  <div 
                    key={index} 
                    className="bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setSelectedArtwork(artwork)}
                  >
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        // 图片加载失败时使用备用图片
                        const target = e.target as HTMLImageElement;
                        target.src = `/TestData/${10001 + (index % 30)}.jpg`;
                      }}
                    />
                    <div className="p-2">
                      <h4 className="text-sm font-medium truncate">{artwork.title}</h4>
                      <p className="text-xs text-gray-400">{artwork.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ArtMovementPage; 