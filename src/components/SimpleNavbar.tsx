import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, Palette, Clock, Menu, X, Home } from 'lucide-react';
import { Button } from './ui/button';
import { NavLink } from 'react-router-dom';

interface SimpleNavbarProps {
  onMenuClick: () => void;
}

interface NavLinkStateProps {
  isActive: boolean;
}

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({ onMenuClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
    <header className="fixed top-0 left-0 right-0 h-18 border-b border-white/5 bg-[rgba(10,10,11,0.8)] backdrop-blur-xl flex items-center z-50">
      <div className="container flex items-center justify-between px-4 py-3 mx-auto">
          <div className="flex items-center space-x-6">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <NavLink to="/" className="flex items-center">
              <Zap className="h-6 w-6 mr-2 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                艺术主义机器
              </h1>
            </NavLink>
          </motion.div>

            {/* 固定导航链接 - 桌面端 */}
            <div className="hidden md:flex items-center space-x-2">
              <NavLink
                to="/"
                className={({ isActive }: NavLinkStateProps) => 
                  `flex items-center px-3 py-1.5 rounded-lg ${isActive 
                    ? 'bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-400 font-medium' 
                    : 'hover:bg-white/5 text-gray-200'} transition-all duration-200`
                }
                end
              >
                <Home className="h-4 w-4 mr-1.5" />
                <span>主页</span>
              </NavLink>
              
              <NavLink
                to="/gallery"
                className={({ isActive }: NavLinkStateProps) => 
                  `flex items-center px-3 py-1.5 rounded-lg ${isActive 
                    ? 'bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-400 font-medium' 
                    : 'hover:bg-white/5 text-gray-200'} transition-all duration-200`
                }
              >
                <Palette className="h-4 w-4 mr-1.5" />
                <span>艺术主义画廊</span>
              </NavLink>

              <NavLink
                to="/timeline"
                className={({ isActive }: NavLinkStateProps) => 
                  `flex items-center px-3 py-1.5 rounded-lg ${isActive 
                    ? 'bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-400 font-medium' 
                    : 'hover:bg-white/5 text-gray-200'} transition-all duration-200`
                }
              >
                <Clock className="h-4 w-4 mr-1.5" />
                <span>时间线视图</span>
              </NavLink>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 移动端菜单按钮 */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden"
          >
            <Button
              variant="ghost"
              size="icon"
              className="text-primary hover:bg-primary/10"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
      
      {/* 移动端导航菜单 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 bg-[rgba(10,10,11,0.95)] backdrop-blur-lg border-b border-white/10 z-40 md:hidden"
          >
            <div className="container mx-auto py-4 px-6 space-y-3">
              <NavLink
                to="/"
                className={({ isActive }: NavLinkStateProps) => 
                  `flex items-center px-4 py-2 rounded-lg ${isActive 
                    ? 'bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-400 font-medium' 
                    : 'hover:bg-white/5 text-gray-200'} transition-all duration-200`
                }
                onClick={() => setMobileMenuOpen(false)}
                end
              >
                <Home className="h-4 w-4 mr-2" />
                <span>主页</span>
              </NavLink>
              
              <NavLink
                to="/gallery"
                className={({ isActive }: NavLinkStateProps) => 
                  `flex items-center px-4 py-2 rounded-lg ${isActive 
                    ? 'bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-400 font-medium' 
                    : 'hover:bg-white/5 text-gray-200'} transition-all duration-200`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <Palette className="h-4 w-4 mr-2" />
                <span>艺术主义画廊</span>
              </NavLink>

              <NavLink
                to="/timeline"
                className={({ isActive }: NavLinkStateProps) => 
                  `flex items-center px-4 py-2 rounded-lg ${isActive 
                    ? 'bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-400 font-medium' 
                    : 'hover:bg-white/5 text-gray-200'} transition-all duration-200`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <Clock className="h-4 w-4 mr-2" />
                <span>时间线视图</span>
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SimpleNavbar; 