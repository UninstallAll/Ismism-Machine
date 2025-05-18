import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, LayoutGrid, ArrowUpDown } from 'lucide-react';
import GalleryGrid from '../components/GalleryGrid';
import galleryImages from '../data/galleryImages.json';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  style: string;
  description: string;
}

const GalleryPage = () => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const artworks = galleryImages as Artwork[];

  // 关闭详情模态框
  const closeArtworkDetails = () => {
    setSelectedArtwork(null);
  };

  return (
    <div className="page-container">
      {/* 标题栏 */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">艺术主义画廊</h1>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="gap-1 hidden sm:flex">
              <ArrowUpDown className="h-4 w-4" />
              <span>按时间排序</span>
            </Button>
            
            <div className="border rounded-md overflow-hidden flex">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="h-9 w-9 rounded-none">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 内容区域 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4"
      >
        <GalleryGrid artworks={artworks} onSelect={setSelectedArtwork} />
      </motion.div>
      
      {/* 作品详情模态框 */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" 
            onClick={closeArtworkDetails}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" 
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <Button 
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full bg-black/40 text-white hover:bg-black/60 z-10"
                  onClick={closeArtworkDetails}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
                <img 
                  src={selectedArtwork.imageUrl} 
                  alt={selectedArtwork.title} 
                  className="w-full h-80 object-contain bg-muted"
                />
              </div>
              
              <CardHeader>
                <CardTitle>{selectedArtwork.title}</CardTitle>
                <CardDescription className="flex items-center">
                  <span>{selectedArtwork.artist}, {selectedArtwork.year}</span>
                  <span className="mx-2 text-muted-foreground">|</span>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-900 rounded">
                    {selectedArtwork.style}
                  </span>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-foreground leading-relaxed">{selectedArtwork.description}</p>
              </CardContent>
              
              <CardFooter className="flex-wrap gap-2">
                <Button className="gap-2" variant="default">在时间线查看</Button>
                <Button variant="outline">查看相关作品</Button>
              </CardFooter>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage; 