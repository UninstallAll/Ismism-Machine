import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IArtStyle, IArtwork } from '../types/art';
import { X, User, Image, Info, Palette, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

interface ArtMovementDetailProps {
  artStyle: IArtStyle;
  onClose: () => void;
}

const ArtMovementDetail: React.FC<ArtMovementDetailProps> = ({ artStyle, onClose }) => {
  // 当前显示的作品索引
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);
  const [artworks, setArtworks] = useState<IArtwork[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 获取艺术家头像
  const getArtistAvatar = (artistName: string, index: number) => {
    return `/TestData/artist${(index % 5) + 1}.jpg`;
  };

  // 处理图片URL，确保能够正确获取数据库指向的图片
  const getImageUrl = (url: string) => {
    if (!url) return '/TestData/10040.jpg'; // 如果URL为空，返回默认图片
    
    // 如果是完整URL或以/开头的路径，直接使用
    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }
    
    // 处理相对路径，根据实际情况调整
    // 1. 如果是数据库图片路径，可能需要添加API前缀
    if (url.startsWith('db/') || url.startsWith('uploads/')) {
      return `/api/images/${url}`; // 假设有一个图片API路径
    }
    
    // 2. 其他资源文件
    return `/assets/${url}`;
  };

  // 处理图片加载错误
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const index = parseInt(target.dataset.index || '0');
    
    // 尝试获取原始图片URL
    const originalUrl = target.getAttribute('data-original-url') || '';
    console.log('Image load error for:', originalUrl);
    
    // 使用固定的备用图片路径
    target.src = `/TestData/10040.jpg`;
    
    // 防止循环触发错误
    target.onerror = null;
  };
  
  // 获取当前艺术主义相关的艺术作品
  useEffect(() => {
    const fetchArtworks = async () => {
      if (!artStyle.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // 从数据库获取艺术主义相关的作品
        const response = await axios.get(`/api/art-movements/${artStyle.id}`);
        const movementData = response.data;
        
        if (movementData && movementData.artworks && movementData.artworks.length > 0) {
          setArtworks(movementData.artworks);
        } else {
          // 如果没有找到作品，使用传入的artStyle中的作品
          setArtworks(artStyle.artworks || []);
        }
      } catch (err) {
        console.error('获取艺术作品失败:', err);
        setError('无法加载艺术作品');
        // 使用传入的artStyle中的作品作为备用
        setArtworks(artStyle.artworks || []);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArtworks();
  }, [artStyle.id]);
  
  // 获取展示的作品
  const artworksToShow = artworks.length > 0 ? artworks : (artStyle.artworks || []);
  
  // 处理翻页
  const handlePrevArtwork = () => {
    setCurrentArtworkIndex(prev => 
      prev === 0 ? artworksToShow.length - 1 : prev - 1
    );
  };
  
  const handleNextArtwork = () => {
    setCurrentArtworkIndex(prev => 
      prev === artworksToShow.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* 头部信息 */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {artStyle.title}
          </h2>
          <p className="text-gray-400 mt-1">
            {artStyle.period ? 
              `${artStyle.period.start} - ${artStyle.period.end}` : 
              `约 ${artStyle.year} 年`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* 主要内容 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左侧：描述和特征 */}
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-lg">简介</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">{artStyle.description}</p>
          </div>

          {/* 代表艺术家 */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-lg">代表艺术家</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {artStyle.artists && artStyle.artists.map((artist, index) => (
                <span 
                  key={index} 
                  className="inline-block px-3 py-1 bg-white/5 rounded-md hover:bg-white/10 transition-colors text-blue-300"
                >
                  {artist}
                </span>
              ))}
            </div>
          </div>

          {artStyle.characteristics && artStyle.characteristics.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">主要特征</h3>
              <ul className="space-y-2">
                {artStyle.characteristics.map((char, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-gray-300">{char}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 右侧：艺术作品展示 */}
        <div className="space-y-4">
          {/* 艺术作品展示模块 - 使用数据库提供的图片 */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Image className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold text-lg">艺术作品展示</h3>
            </div>
            
            {isLoading ? (
              <div className="text-center py-6 text-gray-400">
                加载中...
              </div>
            ) : error ? (
              <div className="text-center py-6 text-red-400">
                {error}
              </div>
            ) : artworksToShow.length > 0 ? (
              <div className="relative">
                {/* 作品图片 */}
                <div className="aspect-square overflow-hidden rounded-lg bg-black/20">
                  <img
                    src={getImageUrl(artworksToShow[currentArtworkIndex]?.imageUrl || '')}
                    alt={artworksToShow[currentArtworkIndex]?.title || artStyle.title}
                    className="w-full h-full object-contain"
                    data-index={currentArtworkIndex}
                    data-original-url={artworksToShow[currentArtworkIndex]?.imageUrl || ''}
                    onError={handleImageError}
                  />
                </div>
                
                {/* 作品信息 */}
                <div className="mt-3 p-3 bg-black/30 rounded-lg">
                  <h4 className="font-medium text-purple-300">
                    {artworksToShow[currentArtworkIndex]?.title || '未知作品'}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {artworksToShow[currentArtworkIndex]?.artist || '未知艺术家'} 
                    {artworksToShow[currentArtworkIndex]?.year ? ` (${artworksToShow[currentArtworkIndex].year})` : ''}
                  </p>
                  {artworksToShow[currentArtworkIndex]?.description && (
                    <p className="text-sm text-gray-300 mt-2">
                      {artworksToShow[currentArtworkIndex].description}
                    </p>
                  )}
                </div>
                
                {/* 翻页按钮 */}
                {artworksToShow.length > 1 && (
                  <div className="flex justify-between absolute top-1/2 -translate-y-1/2 left-0 right-0 px-2">
                    <button 
                      onClick={handlePrevArtwork}
                      className="bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleNextArtwork}
                      className="bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
                
                {/* 页码指示器 */}
                {artworksToShow.length > 1 && (
                  <div className="flex justify-center gap-1 mt-2">
                    {artworksToShow.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentArtworkIndex ? 'bg-purple-400' : 'bg-white/30'
                        }`}
                        onClick={() => setCurrentArtworkIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                暂无作品展示
              </div>
            )}
          </div>

          {/* 代表作品列表 */}
          {artworksToShow.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Image className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-lg">代表作品</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {artworksToShow.map((artwork, index) => (
                  <motion.div
                    key={artwork.id || index}
                    className="group relative overflow-hidden rounded-lg cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setCurrentArtworkIndex(index)}
                  >
                    <img
                      src={getImageUrl(artwork.imageUrl)}
                      alt={artwork.title}
                      className="w-full h-24 object-cover"
                      data-index={index}
                      data-original-url={artwork.imageUrl}
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                      <h4 className="font-medium text-white text-sm">{artwork.title}</h4>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtMovementDetail; 