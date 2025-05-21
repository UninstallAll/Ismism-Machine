import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Calendar, User, Clock, Tag, Lightbulb } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'description' | 'artists' | 'influences'>('description');
  const [imageLoaded, setImageLoaded] = useState(false);

  // 加载艺术主义数据
  useEffect(() => {
    setLoading(true);
    setImageLoaded(false);
    
    // 尝试动态导入artStylesWithImages.json
    const loadArtStylesWithImages = async () => {
      try {
        const response = await fetch('/artStylesWithImages.json');
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

  // 查找当前艺术主义 - 使用useCallback优化
  const findCurrentArtStyle = useCallback(() => {
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
  }, [id, artStylesWithImages]);

  // 当artStylesWithImages更新时，重新查找当前艺术主义
  useEffect(() => {
    findCurrentArtStyle();
  }, [findCurrentArtStyle]);

  // 返回到画廊页面
  const goBackToGallery = useCallback(() => {
    navigate('/gallery');
  }, [navigate]);

  // 返回上一页
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 处理图片加载完成
  const handleImageLoaded = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // 处理图片加载错误
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
    const target = e.target as HTMLImageElement;
    target.src = `/TestData/${10001 + (index % 30)}.jpg`;
    target.onerror = null; // 防止无限循环
    setImageLoaded(true);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm">
        <div className="relative flex flex-col items-center justify-center gap-3 p-6 bg-black/40 rounded-xl border border-white/10 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-white/60 animate-pulse">加载艺术主义信息...</p>
        </div>
      </div>
    );
  }

  if (!artStyle) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm">
        <div className="relative p-6 bg-black/40 rounded-xl border border-white/10 shadow-2xl text-center max-w-lg">
          <h2 className="text-2xl font-bold text-red-500 mb-4">未找到艺术主义</h2>
          <p className="text-gray-400 mb-6">无法找到指定的艺术主义信息，可能该内容已被移除或ID不正确。</p>
          <div className="flex justify-center gap-4">
            <Button variant="destructive" className="mr-2" onClick={goBack}>
              返回
            </Button>
            <Button variant="outline" onClick={goBackToGallery}>
              回到画廊
            </Button>
          </div>
        </div>
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
              返回时间线
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {artStyle.title}
            </h1>
            <div className="flex items-center ml-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                <Calendar className="h-3 w-3 mr-1" />
                {artStyle.year}年
              </span>
            </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-7 h-full">
            {/* 左侧：艺术主义介绍，调整为更宽 */}
            <div className="lg:col-span-5 p-6 overflow-y-auto">
              {/* 标签页导航 */}
              <div className="flex border-b border-white/10 mb-6">
                <button
                  className={`px-4 py-2 ${activeTab === 'description' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/60 hover:text-white/90'}`}
                  onClick={() => setActiveTab('description')}
                >
                  描述
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === 'artists' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/60 hover:text-white/90'}`}
                  onClick={() => setActiveTab('artists')}
                >
                  艺术家
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === 'influences' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/60 hover:text-white/90'}`}
                  onClick={() => setActiveTab('influences')}
                >
                  影响关系
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'description' && (
                  <motion.div
                    key="description"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="prose prose-invert max-w-none">
                      <p className="text-base leading-relaxed">{artStyle.description}</p>
                    </div>
                    
                    {artStyle.tags.length > 0 && (
                      <div>
                        <h3 className="flex items-center text-sm text-gray-400 mb-2"><Tag className="h-4 w-4 mr-1" /> 关键词</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {artStyle.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="inline-block bg-purple-500/10 text-purple-300 text-sm px-3 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'artists' && (
                  <motion.div
                    key="artists"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="flex items-center text-sm text-gray-400 mb-2"><User className="h-4 w-4 mr-1" /> 主要艺术家</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                        {artStyle.artists.map((artist, index) => (
                          <div
                            key={index}
                            className="bg-white/5 hover:bg-white/10 transition-colors rounded-lg p-3 cursor-pointer"
                          >
                            <div className="h-24 w-24 mx-auto mb-2 rounded-full overflow-hidden bg-white/10">
                              <img
                                src={artworks[index]?.imageUrl || `/TestData/${10001 + (index % 30)}.jpg`}
                                alt={artist}
                                className="w-full h-full object-cover"
                                onLoad={handleImageLoaded}
                                onError={(e) => handleImageError(e, index)}
                              />
                            </div>
                            <h4 className="text-center font-medium truncate">{artist}</h4>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'influences' && (
                  <motion.div
                    key="influences"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {artStyle.influences.length > 0 && (
                      <div>
                        <h3 className="flex items-center text-sm text-gray-400 mb-2"><Lightbulb className="h-4 w-4 mr-1" /> 影响来源</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {artStyle.influences.map((influence, index) => (
                            <span 
                              key={index}
                              className="inline-block bg-blue-500/10 text-blue-300 text-sm px-3 py-1 rounded-full"
                            >
                              {influence}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {artStyle.influencedBy.length > 0 && (
                      <div className="mt-6">
                        <h3 className="flex items-center text-sm text-gray-400 mb-2"><Lightbulb className="h-4 w-4 mr-1" /> 受影响于</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {artStyle.influencedBy.map((influenced, index) => (
                            <span 
                              key={index}
                              className="inline-block bg-green-500/10 text-green-300 text-sm px-3 py-1 rounded-full"
                            >
                              {influenced}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* 右侧：艺术作品展示 */}
            <div className="lg:col-span-2 bg-black/40 border-l border-white/10 p-4 overflow-y-auto max-h-[calc(90vh-4rem)]">
              <h3 className="flex items-center text-lg font-medium mb-4"><Clock className="h-4 w-4 mr-2" />代表作品</h3>
              
              <div className="space-y-3">
                {artworks.map((artwork, index) => (
                  <motion.div 
                    key={index} 
                    className="bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setSelectedArtwork(artwork)}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full aspect-square object-cover"
                      onLoad={handleImageLoaded}
                      onError={(e) => handleImageError(e, index)}
                    />
                    <div className="p-2">
                      <h4 className="text-sm font-medium truncate">{artwork.title}</h4>
                      <p className="text-xs text-gray-400">{artwork.artist}</p>
                    </div>
                  </motion.div>
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