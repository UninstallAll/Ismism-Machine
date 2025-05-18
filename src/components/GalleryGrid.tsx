import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';

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
  // 处理图片加载错误
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/300x200?text=图片加载失败';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {artworks.map((artwork, index) => (
        <motion.div 
          key={artwork.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className="overflow-hidden h-full cursor-pointer bg-white border-0 shadow-sm hover:shadow-md transition-all"
            onClick={() => onSelect(artwork)}
          >
            <div className="h-48 overflow-hidden relative">
              <motion.img 
                src={artwork.imageUrl} 
                alt={artwork.title} 
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 w-full">
                  <h4 className="text-white font-bold truncate">{artwork.title}</h4>
                  <p className="text-white/90 text-sm">{artwork.artist}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-1 truncate">{artwork.title}</h3>
              <div className="flex justify-between mb-2">
                <p className="text-sm text-muted-foreground">{artwork.artist}</p>
                <p className="text-sm text-muted-foreground">{artwork.year}</p>
              </div>
            </CardContent>
            <CardFooter className="px-4 py-3 flex justify-between items-center border-t bg-muted/20">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                {artwork.style}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0 h-8 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(artwork);
                }}
              >
                查看详情
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export default GalleryGrid; 