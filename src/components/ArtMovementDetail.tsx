import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Tag, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';

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
  imageUrl?: string;
  images?: string[];
  artists: string[];
  styleMovement: string;
  influences: string[];
  influencedBy: string[];
  tags?: string[];
}

interface ArtMovementDetailProps {
  artStyle: ArtStyle;
  onClose: () => void;
}

// 瑞士简约风格的艺术主义详情组件
const ArtMovementDetail = ({ artStyle, onClose }: ArtMovementDetailProps) => {
  const [activeTab, setActiveTab] = useState<'description' | 'artists' | 'influences'>('description');
  const [imageLoaded, setImageLoaded] = useState(false);

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

  // 生成艺术作品数据
  const generateArtworks = () => {
    return artStyle.artists.slice(0, 6).map((artist, index) => {
      const imageIndex = index % (artStyle.images?.length || 1);
      return {
        id: `artwork-${index}`,
        title: `${artist}的作品`,
        artist,
        year: artStyle.year + (index % 5),
        imageUrl: artStyle.images?.[imageIndex] || `/TestData/${10001 + (index % 30)}.jpg`,
        style: artStyle.styleMovement,
        description: `${artStyle.title}时期的代表作品`
      };
    });
  };

  const artworks = generateArtworks();

  return (
    <div className="flex flex-col h-full bg-white text-black">
      {/* 头部 */}
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-medium tracking-tight">{artStyle.title}</h2>
          <span className="text-sm text-gray-500">{artStyle.year}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="rounded-full h-8 w-8 p-0 flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧详情 */}
        <div className="w-3/5 p-4 overflow-y-auto border-r border-gray-200">
          {/* 标签页导航 - 瑞士设计风格 */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`px-3 py-2 text-sm ${
                activeTab === 'description'
                  ? 'border-b-2 border-black font-medium'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('description')}
            >
              描述
            </button>
            <button
              className={`px-3 py-2 text-sm ${
                activeTab === 'artists'
                  ? 'border-b-2 border-black font-medium'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('artists')}
            >
              艺术家
            </button>
            <button
              className={`px-3 py-2 text-sm ${
                activeTab === 'influences'
                  ? 'border-b-2 border-black font-medium'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('influences')}
            >
              影响
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div
                key="description"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm leading-relaxed text-gray-700">{artStyle.description}</p>
                
                {artStyle.tags && artStyle.tags.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs uppercase text-gray-500 mb-2">关键词</h3>
                    <div className="flex flex-wrap gap-1">
                      {artStyle.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1"
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xs uppercase text-gray-500 mb-2">主要艺术家</h3>
                <div className="grid grid-cols-2 gap-3">
                  {artStyle.artists.map((artist, index) => (
                    <div key={index} className="bg-gray-50 p-2">
                      <div className="aspect-square w-full mb-2 overflow-hidden bg-gray-200">
                        <img
                          src={artworks[index % artworks.length].imageUrl}
                          alt={artist}
                          className="w-full h-full object-cover"
                          onLoad={handleImageLoaded}
                          onError={(e) => handleImageError(e, index)}
                        />
                      </div>
                      <h4 className="text-sm font-medium truncate">{artist}</h4>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'influences' && (
              <motion.div
                key="influences"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {artStyle.influences.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs uppercase text-gray-500 mb-2">影响来源</h3>
                    <div className="flex flex-wrap gap-1">
                      {artStyle.influences.map((influence, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1"
                        >
                          {influence}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {artStyle.influencedBy.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase text-gray-500 mb-2">受影响于</h3>
                    <div className="flex flex-wrap gap-1">
                      {artStyle.influencedBy.map((influenced, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1"
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

        {/* 右侧艺术作品 */}
        <div className="w-2/5 p-3 overflow-y-auto">
          <h3 className="text-xs uppercase text-gray-500 mb-3">代表作品</h3>
          <div className="grid grid-cols-2 gap-2">
            {artworks.map((artwork, index) => (
              <div
                key={index}
                className="bg-gray-50 overflow-hidden"
              >
                <div className="aspect-square w-full overflow-hidden bg-gray-200">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                    onLoad={handleImageLoaded}
                    onError={(e) => handleImageError(e, index)}
                  />
                </div>
                <div className="p-2">
                  <h4 className="text-xs font-medium truncate">{artwork.title}</h4>
                  <p className="text-xs text-gray-500 truncate">{artwork.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtMovementDetail; 