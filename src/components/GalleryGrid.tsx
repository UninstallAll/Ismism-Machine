import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Eye, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  style: string;
  description: string;
}

interface GalleryGridProps {
  artworks: Artwork[];
  onSelect: (artwork: Artwork) => void;
}

const GalleryGrid = ({ artworks, onSelect }: GalleryGridProps) => {
  const navigate = useNavigate();
  
  // 处理图片加载错误
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/300x200?text=图片加载失败';
  };

  // 获取艺术主义的ID
  const getArtMovementId = (styleName: string): string => {
    // 根据风格名称找到对应的ID
    // 这里假设风格名称和ID的关系是：ID是风格名称的英文小写形式
    // 实际项目中可能需要一个映射表或其他方式来获取正确的ID
    const styleToIdMap: Record<string, string> = {
      '印象派': 'impressionism',
      '立体主义': 'cubism',
      '超现实主义': 'surrealism',
      '新印象主义': 'neo-impressionism',
      '后印象派': 'post-impressionism',
      '表现主义': 'expressionism',
      '野兽派': 'fauvism',
      '达达主义': 'dadaism',
      '构成主义': 'constructivism',
      '抽象表现主义': 'abstract-expressionism',
      '波普艺术': 'pop-art',
      '极简主义': 'minimalism',
      '观念艺术': 'conceptual-art',
      '新表现主义': 'neo-expressionism',
      '装置艺术': 'installation-art',
      '录像艺术': 'video-art',
      '行为艺术': 'performance-art',
      '数字艺术': 'digital-art'
    };
    
    return styleToIdMap[styleName] || styleName.toLowerCase().replace(/\s+/g, '-');
  };

  // 跳转到艺术主义详情页
  const navigateToArtMovement = (style: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const artMovementId = getArtMovementId(style);
    navigate(`/art-movement/${artMovementId}`);
  };

  // 跳转到艺术作品详情页
  const navigateToArtworkDetail = (artworkId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/artwork/${artworkId}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <AnimatePresence mode="popLayout">
        {artworks.map((artwork) => (
          <motion.div 
            key={artwork.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ 
              duration: 0.3,
              type: "spring", 
              stiffness: 100
            }}
            layout
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Card 
              className="overflow-hidden h-full cursor-pointer border border-primary/20 bg-card/90 backdrop-blur-sm tech-card"
              onClick={(e) => navigateToArtworkDetail(artwork.id, e)}
            >
              <div className="h-52 overflow-hidden relative group">
                <motion.img 
                  src={artwork.imageUrl} 
                  alt={artwork.title} 
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  loading="lazy"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-3 w-full">
                    <h4 className="text-white font-bold truncate">{artwork.title}</h4>
                    <p className="text-white/90 text-sm">{artwork.artist}</p>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-primary/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(artwork);
                      }}
                    >
                      <Eye className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-1 truncate bg-gradient-to-r from-white to-primary-foreground/80 bg-clip-text text-transparent">{artwork.title}</h3>
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{artwork.artist}</p>
                  <p className="text-sm text-muted-foreground">{artwork.year}</p>
                </div>
              </CardContent>
              <CardFooter className="px-4 py-3 flex justify-between items-center border-t border-primary/10 bg-muted/5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-white hover:bg-primary/20 p-0 h-8 px-2 flex items-center gap-1"
                  onClick={(e) => navigateToArtMovement(artwork.style, e)}
                >
                  <span className="text-xs">{artwork.style}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default GalleryGrid; 