import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImageIcon from '@mui/icons-material/Image';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import BrushIcon from '@mui/icons-material/Brush';

interface SimpleSidebarRouterProps {
  isOpen: boolean;
}

const SimpleSidebarRouter: React.FC<SimpleSidebarRouterProps> = ({ isOpen }) => {
  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: -250, transition: { duration: 0.3 } }
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
      className="fixed top-16 left-0 h-[calc(100%-64px)] w-[250px] bg-background border-r z-10 overflow-y-auto"
      initial="closed"
      animate="open"
      variants={sidebarVariants}
    >
      <div className="p-6">
        <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-2 border-b-2 border-secondary">
          导航菜单
        </h2>
        <nav>
          <ul className="space-y-2">
            <motion.li
              custom={0}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 5 }}
            >
              <NavLink
                to="/gallery"
                className={({ isActive }) => 
                  `flex items-center p-3 mb-1 border-l-4 ${isActive ? 'bg-primary text-white border-primary' : 'bg-white border-transparent hover:bg-muted'} transition-colors rounded-sm`
                }
              >
                <ImageIcon className="mr-3" />
                <span className="font-medium">艺术主义画廊</span>
              </NavLink>
            </motion.li>
            <motion.li
              custom={1}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 5 }}
            >
              <NavLink
                to="/timeline"
                className={({ isActive }) => 
                  `flex items-center p-3 mb-1 border-l-4 ${isActive ? 'bg-primary text-white border-primary' : 'bg-white border-transparent hover:bg-muted'} transition-colors rounded-sm`
                }
              >
                <TimelineIcon className="mr-3" />
                <span className="font-medium">时间线视图</span>
              </NavLink>
            </motion.li>
            <motion.li
              custom={2}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 5 }}
            >
              <NavLink
                to="/stats"
                className={({ isActive }) => 
                  `flex items-center p-3 mb-1 border-l-4 ${isActive ? 'bg-primary text-white border-primary' : 'bg-white border-transparent hover:bg-muted'} transition-colors rounded-sm`
                }
              >
                <BarChartIcon className="mr-3" />
                <span className="font-medium">数据统计分析</span>
              </NavLink>
            </motion.li>
            <motion.li
              custom={3}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 5 }}
            >
              <NavLink
                to="/ai-create"
                className={({ isActive }) => 
                  `flex items-center p-3 mb-1 border-l-4 ${isActive ? 'bg-primary text-white border-primary' : 'bg-secondary/10 border-secondary hover:bg-muted'} transition-colors rounded-sm`
                }
              >
                <BrushIcon className="mr-3" />
                <span className="font-medium">AI 创作实验室</span>
              </NavLink>
            </motion.li>
          </ul>
        </nav>
      </div>
    </motion.aside>
  );
};

export default SimpleSidebarRouter; 