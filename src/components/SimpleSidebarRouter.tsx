import React from 'react';
import { NavLink } from 'react-router-dom';

interface SimpleSidebarRouterProps {
  isOpen: boolean;
}

const SimpleSidebarRouter: React.FC<SimpleSidebarRouterProps> = ({ isOpen }) => {
  const sidebarClasses = `sidebar fixed top-16 left-0 bottom-0 bg-white shadow-md overflow-y-auto z-40
    transition-transform duration-300 w-64 ${isOpen ? '' : 'transform -translate-x-full md:translate-x-0'}`;

  // 自定义NavLink样式
  const navLinkClasses = ({ isActive }: { isActive: boolean }) => {
    return `block w-full p-2 text-left rounded-md transition-colors mb-2 ${
      isActive
        ? 'bg-blue-800 text-white'
        : 'text-gray-800 hover:bg-gray-100'
    }`;
  };

  return (
    <aside className={sidebarClasses}>
      <div className="p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">艺术主义机器</h2>
        </div>
        
        <div className="space-y-2">
          <NavLink to="/gallery" className={navLinkClasses}>
            艺术主义画廊
          </NavLink>
          
          <NavLink to="/timeline" className={navLinkClasses}>
            时间线视图
          </NavLink>
          
          <NavLink to="/stats" className={navLinkClasses}>
            数据统计分析
          </NavLink>
          
          <NavLink to="/ai-create" className={navLinkClasses}>
            AI 创作实验室
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default SimpleSidebarRouter; 