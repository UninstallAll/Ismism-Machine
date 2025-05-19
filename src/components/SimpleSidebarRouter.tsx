import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image, Clock, Zap, Code, Braces } from 'lucide-react';

interface SimpleSidebarRouterProps {
  isOpen: boolean;
}

interface NavLinkStateProps {
  isActive: boolean;
}

const SimpleSidebarRouter: React.FC<SimpleSidebarRouterProps> = ({ isOpen }) => {
  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: -280, transition: { duration: 0.3 } }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  return (
    <motion.aside
      className="fixed top-16 left-0 h-[calc(100%-64px)] w-[280px] bg-[rgba(10,10,11,0.85)] backdrop-blur-xl border-r border-white/5 z-10 overflow-y-auto"
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
    >
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          <h2 className="text-2xl font-extrabold mb-6 pb-3 relative z-10">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              导航菜单
            </span>
          </h2>
          <div className="absolute left-0 right-0 bottom-[10px] h-[1px] bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-transparent"></div>
        </motion.div>
        
        <nav>
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400 pl-3">
            主要页面
          </div>
          <ul className="space-y-1 mb-6">
            <motion.li
              custom={0}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 3 }}
            >
              <NavLink
                to="/gallery"
                className={({ isActive }: NavLinkStateProps) => 
                  `flex items-center px-4 py-3 rounded-xl ${isActive 
                    ? 'bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-400 font-medium' 
                    : 'hover:bg-white/5 text-gray-200'} transition-all duration-200`
                }
              >
                <div className="p-2 rounded-lg mr-3 bg-gray-800/80 hover:bg-blue-500/20">
                  <Image className="h-5 w-5" />
                </div>
                <span>艺术主义画廊</span>
                <NavLink to="/gallery">
                  {({ isActive }: NavLinkStateProps) => isActive ? (
                    <Zap className="ml-auto h-4 w-4 text-blue-400" />
                  ) : null}
                </NavLink>
              </NavLink>
            </motion.li>
            <motion.li
              custom={1}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 3 }}
            >
              <NavLink
                to="/timeline"
                className={({ isActive }: NavLinkStateProps) => 
                  `flex items-center px-4 py-3 rounded-xl ${isActive 
                    ? 'bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-400 font-medium' 
                    : 'hover:bg-white/5 text-gray-200'} transition-all duration-200`
                }
              >
                <div className="p-2 rounded-lg mr-3 bg-gray-800/80 hover:bg-blue-500/20">
                  <Clock className="h-5 w-5" />
                </div>
                <span>时间线视图</span>
                <NavLink to="/timeline">
                  {({ isActive }: NavLinkStateProps) => isActive ? (
                    <Zap className="ml-auto h-4 w-4 text-blue-400" />
                  ) : null}
                </NavLink>
              </NavLink>
            </motion.li>
          </ul>

          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400 pl-3">
            资源
          </div>
          <ul className="space-y-1">
            <motion.li
              custom={2}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 3 }}
            >
              <a
                href="https://www.cursor.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-3 rounded-xl hover:bg-white/5 text-gray-200 transition-all duration-200"
              >
                <div className="p-2 rounded-lg mr-3 bg-gray-800/80">
                  <Code className="h-5 w-5" />
                </div>
                <span>参考文档</span>
              </a>
            </motion.li>
            <motion.li
              custom={3}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 3 }}
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-3 rounded-xl hover:bg-white/5 text-gray-200 transition-all duration-200"
              >
                <div className="p-2 rounded-lg mr-3 bg-gray-800/80">
                  <Braces className="h-5 w-5" />
                </div>
                <span>源代码</span>
              </a>
            </motion.li>
          </ul>
        </nav>

        <div className="mt-10 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/10">
          <div className="text-center mb-2">
            <span className="inline-block px-3 py-1 bg-blue-500/20 rounded-full text-xs font-medium text-blue-400">艺术主义机器</span>
          </div>
          <p className="text-xs text-center text-gray-400">
            探索艺术主义历史与风格演变
          </p>
        </div>
      </div>
    </motion.aside>
  );
};

export default SimpleSidebarRouter; 