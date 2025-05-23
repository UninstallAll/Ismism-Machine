import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tab } from '@headlessui/react';
import { X, Info, Users, Lightbulb, ExternalLink } from 'lucide-react';
import { IArtStyle } from '../types/art';

interface Artist {
  _id: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
  nationality?: string;
  biography?: string;
}

interface ArtMovementDetailProps {
  artStyle: IArtStyle;
  onClose?: () => void;
}

export default function ArtMovementDetail({ artStyle, onClose }: ArtMovementDetailProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{src: string, index: number} | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取艺术家信息
  useEffect(() => {
    const fetchArtists = async () => {
      if (activeTab === 1) { // 只在艺术家标签页被选中时加载
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/movements/${artStyle.id}/artists`);
          if (!response.ok) {
            throw new Error('Failed to fetch artists');
          }
          const data = await response.json();
          setArtists(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load artists');
          console.error('Error fetching artists:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchArtists();
  }, [artStyle.id, activeTab]);

  // 使用标签页分类显示内容
  const tabs = [
    { key: 'description', name: '描述', icon: <Info className="w-4 h-4" /> },
    { key: 'artists', name: '艺术家', icon: <Users className="w-4 h-4" /> },
    { key: 'influences', name: '影响', icon: <Lightbulb className="w-4 h-4" /> },
  ];

  // 获取作品图片
  const getArtworkImages = () => {
    if (artStyle.images && artStyle.images.length > 0) {
      return artStyle.images;
    }
    
    // 如果没有提供图片，生成8张测试图片
    return Array.from({ length: 8 }, (_, i) => 
      artStyle.imageUrl || `/TestData/${10001 + ((i + artStyle.year) % 30)}.jpg`
    );
  };

  // 关闭大图预览
  const closeImagePreview = () => {
    setSelectedImage(null);
  };

  return (
    <div className="flex flex-col">
      {/* 标题栏 */}
      <div className="flex justify-between items-center p-2 px-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/80">
            {artStyle.styleMovement}
          </span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex overflow-hidden">
        {/* 左侧内容区 */}
        <div className="w-1/2 p-3 flex flex-col">
          <Tab.Group onChange={setActiveTab}>
            <Tab.List className="flex space-x-1 border-b border-white/10 mb-3">
              {tabs.map((tab) => (
                <Tab
                  key={tab.key}
                  className={({ selected }: { selected: boolean }) =>
                    `flex items-center gap-1 px-3 py-1 text-sm border-b-2 outline-none ${
                      selected 
                        ? 'border-blue-500 text-white' 
                        : 'border-transparent text-white/60 hover:text-white/80'
                    }`
                  }
                >
                  {tab.icon}
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2 flex-1">
              <Tab.Panel className="max-w-none h-full overflow-auto pr-2 max-h-[300px]">
                <p className="text-white/80 leading-relaxed">{artStyle.description}</p>
                
                {artStyle.tags && artStyle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {artStyle.tags.map((tag, index) => (
                      <span key={index} className="text-xs text-white/60">
                        {tag}
                        {index < artStyle.tags!.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </Tab.Panel>
              <Tab.Panel className="h-full overflow-auto pr-2 max-h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-400 text-center py-4">
                    {error}
                  </div>
                ) : artists.length > 0 ? (
                  <ul className="space-y-3">
                    {artists.map((artist) => (
                      <li key={artist._id} className="p-2 hover:bg-white/5 rounded-md transition-colors">
                        <h3 className="font-medium text-white">{artist.name}</h3>
                        {(artist.birthYear || artist.deathYear) && (
                          <p className="text-sm text-white/60">
                            {artist.birthYear && `${artist.birthYear}`}
                            {artist.birthYear && artist.deathYear && ' - '}
                            {artist.deathYear && `${artist.deathYear}`}
                          </p>
                        )}
                        {artist.nationality && (
                          <p className="text-sm text-white/70">{artist.nationality}</p>
                        )}
                        {artist.biography && (
                          <p className="text-sm text-white/80 mt-1">{artist.biography}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-white/60 text-center py-4">
                    暂无艺术家信息
                  </div>
                )}
              </Tab.Panel>
              <Tab.Panel className="h-full overflow-auto pr-2 max-h-[300px]">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm text-white/60 mb-1">受影响自</h3>
                    <div className="flex flex-wrap gap-2">
                      {artStyle.influencedBy.map((style, index) => (
                        <span key={index} className="text-sm text-white/80">
                          {style}
                          {index < artStyle.influencedBy.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm text-white/60 mb-1">影响了</h3>
                    <div className="flex flex-wrap gap-2">
                      {artStyle.influences.map((style, index) => (
                        <span key={index} className="text-sm text-white/80">
                          {style}
                          {index < artStyle.influences.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
        
        {/* 右侧艺术作品展示 */}
        <div className="w-1/2 p-3 overflow-y-auto max-h-[350px]">
          <h3 className="text-sm text-white/60 mb-2 sticky top-0 bg-black/50 py-1 z-10">代表作品</h3>
          <div className="grid grid-cols-3 gap-1">
            {getArtworkImages().map((image, index) => (
              <div 
                key={index}
                className="aspect-square bg-black/30 rounded overflow-hidden cursor-pointer hover:brightness-110 transition-all"
                onClick={() => setSelectedImage({src: image, index})}
              >
                <img 
                  src={image} 
                  alt={`${artStyle.title}作品${index + 1}`}
                  className="w-full h-full object-cover" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 大图预览弹窗 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={closeImagePreview}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-4xl max-h-[80vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage.src} 
                alt={`${artStyle.title}作品详图`} 
                className="max-h-[80vh] max-w-full object-contain rounded-md" 
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 backdrop-blur-sm">
                <h3 className="text-white font-medium">
                  {artStyle.title} - 作品{selectedImage.index + 1}
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  {artStyle.artists[selectedImage.index % artStyle.artists.length]}
                  {artStyle.artists.length > 0 ? ` (c. ${artStyle.year + (selectedImage.index % 10)})` : ''}
                </p>
                <button 
                  className="absolute top-2 right-2 text-white/70 hover:text-white"
                  onClick={closeImagePreview}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 