import React from 'react';
import { motion } from 'framer-motion';
import { Search, Menu, Zap } from 'lucide-react';
import { Button } from './ui/button';

interface SimpleNavbarProps {
  onMenuClick: () => void;
}

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-[rgba(10,10,11,0.8)] backdrop-blur-xl flex items-center z-50">
      <div className="container flex items-center justify-between px-4 mx-auto">
        <div className="flex items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
            <Zap className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              艺术主义机器
            </h1>
          </motion.div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex">
            <div className="flex items-center p-1 px-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <input
                type="text"
                placeholder="搜索艺术作品..."
                className="bg-transparent border-none outline-none text-sm text-muted-foreground w-48"
              />
            </div>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block"
          >
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none shadow-md hover:shadow-lg"
            >
              登录
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default SimpleNavbar; 