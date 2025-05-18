import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, LayoutGrid, ArrowUpDown, Sparkles } from 'lucide-react';
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
    <div className="page-container relative">
      {/* 标题栏 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-6 border border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="animate-border-flow h-[1px] w-full absolute top-0 opacity-30"></div>
          </div>
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-glow-pulse" />
              <h1 className="text-xl font-bold">艺术主义画廊</h1>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="gap-1 hidden sm:flex bg-muted/50 border-primary/20 backdrop-blur-sm hover:bg-primary/10">
                <ArrowUpDown className="h-4 w-4" />
                <span>按时间排序</span>
              </Button>
              
              <div className="border border-primary/20 rounded-md overflow-hidden flex">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none hover:bg-primary/10">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none bg-primary/10 hover:bg-primary/20">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* 内容区域 */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={closeArtworkDetails}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-card/90 backdrop-blur-md rounded-lg border border-primary/30 max-w-4xl w-full max-h-[90vh] overflow-hidden relative" 
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="animate-border-flow h-[1px] w-full absolute top-0 opacity-40"></div>
                <div className="animate-border-flow h-[1px] w-full absolute bottom-0 opacity-40"></div>
              </div>
              
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
                <div className="h-80 overflow-hidden bg-muted/30 flex items-center justify-center">
                  <motion.img 
                    src={selectedArtwork.imageUrl} 
                    alt={selectedArtwork.title}
                    className="w-full h-full object-contain"
                    initial={{ filter: 'blur(10px)', opacity: 0 }}
                    animate={{ filter: 'blur(0px)', opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-primary/90">{selectedArtwork.title}</CardTitle>
                <CardDescription className="flex items-center">
                  <span>{selectedArtwork.artist}, {selectedArtwork.year}</span>
                  <span className="mx-2 text-muted-foreground">|</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                    {selectedArtwork.style}
                  </span>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-foreground/90 leading-relaxed">{selectedArtwork.description}</p>
              </CardContent>
              
              <CardFooter className="flex-wrap gap-2 border-t border-border/40">
                <Button className="gap-2 bg-gradient-to-r from-primary to-secondary text-white" variant="default">
                  <Sparkles className="h-4 w-4" />
                  在时间线查看
                </Button>
                <Button variant="outline" className="border-primary/30 hover:bg-primary/10">查看相关作品</Button>
              </CardFooter>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage; 