import React from 'react';
import { motion } from 'framer-motion';
import { Search, Menu, Zap } from 'lucide-react';
import { Button } from './ui/button';

interface SimpleNavbarProps {
  onMenuClick: () => void;
}

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-primary/20 bg-card/80 backdrop-blur-md flex items-center z-20 shadow-md">
      <div className="container flex items-center justify-between px-4 mx-auto">
        <div className="flex items-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 text-primary hover:bg-primary/10"
              onClick={onMenuClick}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </motion.div>
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Zap className="h-5 w-5 mr-2 text-primary animate-glow-pulse" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              艺术主义机器
            </h1>
          </motion.div>
        </div>
        
        <motion.div 
          className="hidden sm:flex items-center border border-primary/20 rounded-md px-3 py-1 w-64 bg-card/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ borderColor: 'rgba(var(--primary), 0.5)' }}
        >
          <input 
            type="text" 
            placeholder="搜索艺术品..." 
            className="border-none bg-transparent outline-none flex-1 text-sm"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
            <Search className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse"></div>
    </header>
  );
};

export default SimpleNavbar; 