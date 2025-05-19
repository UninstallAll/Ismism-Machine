import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Search, X, Zap } from 'lucide-react';
import GalleryGrid from './GalleryGrid';
import { Button } from './ui/button';

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

// 将artStyles数据转换为Gallery组件所需的Artwork格式
const convertArtStyleToArtwork = (artStyle: any): Artwork[] => {
  // 从每个艺术风格创建艺术品对象，为每个艺术家创建一个作品
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

const Gallery = () => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [artStylesWithImages, setArtStylesWithImages] = useState(artStylesData);

  // 尝试加载带图片的艺术风格数据
  useEffect(() => {
    // 显示加载状态
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
        // 加载完成后生成艺术品数据
        generateArtworks();
      }
    };
    
    loadArtStylesWithImages();
  }, []);

  // 生成艺术品数据
  const generateArtworks = () => {
    // 将艺术风格数据转换为艺术品
    const allArtworks = artStylesWithImages.flatMap(convertArtStyleToArtwork);
    
    // 确保所有艺术品都有图片URL
    const artworksWithImages = allArtworks.map((artwork, index) => {
      // 如果没有设置imageUrl或imageUrl不存在，使用备份
      if (!artwork.imageUrl) {
        return {
          ...artwork,
          imageUrl: `/TestData/${10001 + (index % 30)}.jpg`
        };
      }
      return artwork;
    });
    
    setArtworks(artworksWithImages);
    setFilteredArtworks(artworksWithImages); // 初始时设置已过滤的作品为所有作品
    setLoading(false);
  };

  // 当artStylesWithImages更新时，重新生成艺术品
  useEffect(() => {
    generateArtworks();
  }, [artStylesWithImages]);

  // 搜索筛选
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredArtworks(artworks);
      return;
    }
    
    const filtered = artworks.filter(artwork => 
      artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredArtworks(filtered);
  }, [searchTerm, artworks]);

  // 关闭详情模态框
  const closeArtworkDetails = () => {
    setSelectedArtwork(null);
  };

  return (
    <div className="relative pb-10">
      {/* 头部标题和筛选栏 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-center">
            艺术主义画廊
          </h1>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <div className="flex items-center p-2 px-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input
                  type="text"
                  placeholder="搜索艺术作品..."
                  className="bg-transparent border-none outline-none text-sm text-muted-foreground w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex p-1 border border-white/10 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-sm"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-sm"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <div>
                <Button 
                  variant="outline"
                  size="sm"
                  className="border border-white/10 hover:bg-white/5"
                >
                  按时间排序
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* 加载状态 */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* 内容区域 */}
      {!loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredArtworks.length > 0 ? (
            <GalleryGrid artworks={filteredArtworks} onSelect={setSelectedArtwork} />
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">没有找到符合条件的艺术作品</p>
            </div>
          )}
        </motion.div>
      )}
      
      {/* 作品详情模态框 */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={closeArtworkDetails}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-[rgba(10,10,11,0.95)] backdrop-blur-lg rounded-xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden relative" 
              onClick={e => e.stopPropagation()}
            >
              <Button 
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 rounded-full bg-black/40 text-white hover:bg-black/60 z-10"
                onClick={closeArtworkDetails}
              >
                <X className="h-5 w-5" />
              </Button>
              
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 h-60 md:h-auto overflow-hidden bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                  <motion.img 
                    src={selectedArtwork.imageUrl} 
                    alt={selectedArtwork.title}
                    className="w-full h-full object-contain"
                    initial={{ filter: 'blur(10px)', opacity: 0 }}
                    animate={{ filter: 'blur(0px)', opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    onError={(e) => {
                      // 图片加载失败时使用备用图片
                      const target = e.target as HTMLImageElement;
                      const artworkId = selectedArtwork.id.split('-')[0];
                      const artworkIndex = parseInt(selectedArtwork.id.split('-')[1] || '0');
                      target.src = `/TestData/${10001 + (artworkIndex % 30)}.jpg`;
                    }}
                  />
                </div>
                
                <div className="md:w-1/2 p-6 flex flex-col">
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      {selectedArtwork.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                      <span>{selectedArtwork.artist}, {selectedArtwork.year}</span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-full">
                        {selectedArtwork.style}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-grow overflow-y-auto py-4 text-gray-300">
                    <p className="leading-relaxed">{selectedArtwork.description}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                    <Button 
                      className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none"
                    >
                      <Zap className="h-4 w-4" />
                      在时间线查看
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-white/10 hover:bg-white/5"
                    >
                      相关作品
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery; 