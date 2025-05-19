import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image, Clock, Sparkles, Zap } from 'lucide-react';

interface SimpleSidebarRouterProps {
  isOpen: boolean;
}

interface NavLinkStateProps {
  isActive: boolean;
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
      className="fixed top-16 left-0 h-[calc(100%-64px)] w-[250px] bg-card/90 backdrop-blur-md border-r border-primary/20 z-10 overflow-y-auto"
      initial="closed"
      animate="open"
      variants={sidebarVariants}
    >
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          <h2 className="text-xl font-bold mb-6 pb-2 relative z-10">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">导航菜单</span>
          </h2>
          <div className="absolute left-0 right-0 bottom-[9px] h-[1px] bg-gradient-to-r from-primary/50 via-secondary/50 to-transparent"></div>
        </motion.div>
        
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
                className={({ isActive }: NavLinkStateProps) => 
                  `flex items-center p-3 mb-1 rounded-md border border-transparent ${isActive 
                    ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.2)]' 
                    : 'hover:bg-primary/10 hover:border-primary/20'} transition-all duration-300`
                }
              >
                <Image className="mr-3 h-5 w-5" />
                <span className="font-medium">艺术主义画廊</span>
                {/* 活跃状态指示器 */}
                <NavLink to="/gallery">
                  {({ isActive }: NavLinkStateProps) => isActive ? (
                    <Zap className="ml-auto h-4 w-4 text-primary animate-pulse" />
                  ) : null}
                </NavLink>
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
                className={({ isActive }: NavLinkStateProps) => 
                  `flex items-center p-3 mb-1 rounded-md border border-transparent ${isActive 
                    ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.2)]' 
                    : 'hover:bg-primary/10 hover:border-primary/20'} transition-all duration-300`
                }
              >
                <Clock className="mr-3 h-5 w-5" />
                <span className="font-medium">时间线视图</span>
                {/* 活跃状态指示器 */}
                <NavLink to="/timeline">
                  {({ isActive }: NavLinkStateProps) => isActive ? (
                    <Zap className="ml-auto h-4 w-4 text-primary animate-pulse" />
                  ) : null}
                </NavLink>
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
                to="/ai-create"
                className={({ isActive }: NavLinkStateProps) => 
                  `flex items-center p-3 mb-1 rounded-md border border-transparent ${isActive 
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white border-secondary/30 shadow-[0_0_15px_rgba(var(--secondary),0.2)]' 
                    : 'hover:bg-secondary/10 hover:border-secondary/20'} transition-all duration-300`
                }
              >
                <Sparkles className="mr-3 h-5 w-5" />
                <span className="font-medium">AI 创作实验室</span>
                {/* 活跃状态指示器 */}
                <NavLink to="/ai-create">
                  {({ isActive }: NavLinkStateProps) => isActive ? (
                    <Zap className="ml-auto h-4 w-4 text-secondary animate-pulse" />
                  ) : null}
                </NavLink>
              </NavLink>
            </motion.li>
          </ul>
        </nav>

        <div className="mt-8 p-4 rounded-md border border-primary/20 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center mb-2">
            <Sparkles className="h-4 w-4 text-primary mr-2" />
            <h3 className="text-sm font-semibold text-primary/90">科技艺术探索</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            通过人工智能和数据可视化探索艺术主义历史与风格演变
          </p>
        </div>
      </div>
    </motion.aside>
  );
};

export default SimpleSidebarRouter; 