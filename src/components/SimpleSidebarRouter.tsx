import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image, Clock, Zap, Code, Braces, Home, BookOpen, Palette } from 'lucide-react';

interface SimpleSidebarRouterProps {
  isOpen: boolean;
}

interface NavLinkStateProps {
  isActive: boolean;
}

const SimpleSidebarRouter: React.FC<SimpleSidebarRouterProps> = ({ isOpen }) => {
  const listItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2
      }
    })
  };

  return (
    <div className="w-full py-4 px-6">
      <nav className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          <motion.div
            custom={0}
            variants={listItemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2 }}
          >
            <NavLink
              to="/gallery"
              className={({ isActive }: NavLinkStateProps) => 
                `flex items-center px-4 py-2 rounded-xl ${isActive 
                  ? 'bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-400 font-medium' 
                  : 'hover:bg-white/5 text-gray-200'} transition-all duration-200`
              }
            >
              <div className="p-1 rounded-lg mr-2 bg-gray-800/80 hover:bg-blue-500/20">
                <Palette className="h-4 w-4" />
              </div>
              <span>艺术主义画廊</span>
              {({ isActive }: NavLinkStateProps) => isActive ? (
                <Zap className="ml-2 h-3 w-3 text-blue-400" />
              ) : null}
            </NavLink>
          </motion.div>

          <motion.div
            custom={1}
            variants={listItemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2 }}
          >
            <NavLink
              to="/timeline"
              className={({ isActive }: NavLinkStateProps) => 
                `flex items-center px-4 py-2 rounded-xl ${isActive 
                  ? 'bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-400 font-medium' 
                  : 'hover:bg-white/5 text-gray-200'} transition-all duration-200`
              }
            >
              <div className="p-1 rounded-lg mr-2 bg-gray-800/80 hover:bg-blue-500/20">
                <Clock className="h-4 w-4" />
              </div>
              <span>时间线视图</span>
              {({ isActive }: NavLinkStateProps) => isActive ? (
                <Zap className="ml-2 h-3 w-3 text-blue-400" />
              ) : null}
            </NavLink>
          </motion.div>

          <motion.div
            custom={2}
            variants={listItemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2 }}
          >
            <a
              href="https://www.cursor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 rounded-xl hover:bg-white/5 text-gray-200 transition-all duration-200"
            >
              <div className="p-1 rounded-lg mr-2 bg-gray-800/80">
                <BookOpen className="h-4 w-4" />
              </div>
              <span>参考文档</span>
            </a>
          </motion.div>

          <motion.div
            custom={3}
            variants={listItemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2 }}
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 rounded-xl hover:bg-white/5 text-gray-200 transition-all duration-200"
            >
              <div className="p-1 rounded-lg mr-2 bg-gray-800/80">
                <Braces className="h-4 w-4" />
              </div>
              <span>源代码</span>
            </a>
          </motion.div>
        </div>
      </nav>
    </div>
  );
};

export default SimpleSidebarRouter; 