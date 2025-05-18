import React from 'react';
import { motion } from 'framer-motion';
import { Search, Menu } from 'lucide-react';
import { Button } from './ui/button';

interface SimpleNavbarProps {
  onMenuClick: () => void;
}

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-l-4 border-l-secondary bg-background flex items-center z-20 shadow-sm">
      <div className="container flex items-center justify-between px-4 mx-auto">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <motion.h1 
            className="text-xl font-bold uppercase tracking-wider"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            艺术主义机器
          </motion.h1>
        </div>
        
        <motion.div 
          className="hidden sm:flex items-center border rounded-md px-3 py-1 w-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <input 
            type="text" 
            placeholder="搜索艺术品..." 
            className="border-none bg-transparent outline-none flex-1 text-sm"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Search className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </header>
  );
};

export default SimpleNavbar; 