import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ZoomIn, ZoomOut, Info } from 'lucide-react';
import { Button } from '../components/ui/button';

// 导入本地数据库
import artStylesData from '../../data/artStyles.json';

// 扩展artStylesData类型以支持可选的images字段
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
  images?: string[]; // 可选的图片数组
}

interface ArtworkDetail {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  style: string;
  description: string;
  // 新增字段
  medium?: string;     // 材料
  technique?: string;  // 技术
  dimensions?: string; // 尺寸
  location?: string;   // 收藏地点
}

const ArtworkDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<ArtworkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    const fetchArtwork = async () => {
      setLoading(true);
      
      try {
        // 这里应该从实际API获取数据
        // 当前使用artStylesData模拟数据
        if (!id) return;
        
        const [styleId, artworkIndex] = id.split('-');
        const artStyle = (artStylesData as ArtStyle[]).find(style => style.id === styleId);
        
        if (artStyle && artworkIndex) {
          const index = parseInt(artworkIndex, 10);
          const artist = artStyle.artists[index % artStyle.artists.length];
          
          // 固定图片索引规则，确保与Gallery中的预览图一致
          const imageIndex = 10001 + (index % 30);
          
          // 创建Artwork对象
          const artworkData: ArtworkDetail = {
            id: id,
            title: `《${artist}的${artStyle.title}作品》`,
            artist: artist,
            year: artStyle.year,
            imageUrl: `/TestData/${imageIndex}.jpg`,
            style: artStyle.title,
            description: artStyle.description,
            // 模拟数据
            medium: ['油彩画布', '纸上水彩', '木板蛋彩', '铜版蚀刻', '混合媒材'][index % 5],
            technique: ['印象派笔触', '超现实主义拼贴', '点彩技法', '几何抽象', '表现主义笔法'][index % 5],
            dimensions: [`${80 + index * 5}cm × ${60 + index * 5}cm`, `${100 - index * 2}cm × ${120 - index * 3}cm`][index % 2],
            location: ['卢浮宫', '普拉多博物馆', '大都会艺术博物馆', '英国国家美术馆', '俄罗斯冬宫博物馆'][index % 5]
          };
          
          setArtwork(artworkData);
        }
      } catch (error) {
        console.error('获取艺术作品详情失败', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtwork();
  }, [id]);

  // 返回上一页
  const goBack = () => {
    navigate(-1);
  };

  // 缩放控制
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2.5));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.8));
  };

  // 切换信息显示
  const toggleInfo = () => {
    setShowInfo(prev => !prev);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-500">未找到艺术作品</h2>
        <p className="mt-4 text-gray-400">无法找到指定的艺术作品信息</p>
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
    <div className="flex flex-col min-h-screen bg-[#0a0a0b] pb-10">
      {/* 顶部导航 */}
      <div className="sticky top-16 z-10 bg-background border-b border-white/5 py-2">
        <div className="container flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="gap-1 text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              className="h-8 w-8 p-0 rounded-full"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              className="h-8 w-8 p-0 rounded-full"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant={showInfo ? "default" : "outline"}
              size="sm"
              onClick={toggleInfo}
              className="h-8 w-8 p-0 rounded-full"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* 主要内容区 */}
      <div className="container flex-grow flex flex-col items-center justify-center pt-8 px-4">
        {/* 图片区域 */}
        <div className="relative w-full max-w-5xl overflow-hidden rounded-lg bg-black/30 backdrop-blur-sm">
          <div className="flex justify-center items-center overflow-auto p-4" style={{ minHeight: '60vh' }}>
            <motion.img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="max-w-full max-h-[70vh] object-contain rounded shadow-lg"
              style={{ 
                transform: `scale(${zoomLevel})`, 
                transition: 'transform 0.3s ease-out'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const artworkIndex = parseInt(id?.split('-')[1] || '0');
                target.src = `/TestData/${10001 + (artworkIndex % 30)}.jpg`;
              }}
            />
          </div>
          
          {/* 作品信息 */}
          {showInfo && (
            <motion.div
              className="w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent mb-3">
                {artwork.title}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-lg font-medium text-white/90 mb-2">{artwork.artist}, {artwork.year}</p>
                  <p className="text-gray-300 mb-4">{artwork.description}</p>
                  
                  <div className="flex items-center">
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                      {artwork.style}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {artwork.medium && (
                      <>
                        <span className="text-gray-400">材料</span>
                        <span className="text-white">{artwork.medium}</span>
                      </>
                    )}
                    
                    {artwork.technique && (
                      <>
                        <span className="text-gray-400">技法</span>
                        <span className="text-white">{artwork.technique}</span>
                      </>
                    )}
                    
                    {artwork.dimensions && (
                      <>
                        <span className="text-gray-400">尺寸</span>
                        <span className="text-white">{artwork.dimensions}</span>
                      </>
                    )}
                    
                    {artwork.location && (
                      <>
                        <span className="text-gray-400">收藏地</span>
                        <span className="text-white">{artwork.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetailPage; 