import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SimpleNavbar from './SimpleNavbar';
import SimpleSidebarRouter from './SimpleSidebarRouter';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 获取布局样式
  const getLayoutClasses = () => {
    return `content-with-sidebar pt-16 flex-1 min-h-screen bg-gray-50 transition-all duration-300
      ${sidebarOpen ? 'md:ml-64' : 'ml-0'} 
      sm:ml-0`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <SimpleSidebarRouter isOpen={sidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <SimpleNavbar onMenuClick={toggleSidebar} />
        <main className={getLayoutClasses()}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 