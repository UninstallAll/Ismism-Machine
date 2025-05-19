import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SimpleNavbar from './SimpleNavbar';
import SimpleSidebarRouter from './SimpleSidebarRouter';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0b]">
      <SimpleNavbar onMenuClick={toggleSidebar} />
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-30 border-b border-white/5 bg-[rgba(10,10,11,0.9)] backdrop-blur-xl"
          >
            <SimpleSidebarRouter isOpen={true} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.main
        className="flex-grow p-3 pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container py-4 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export default MainLayout; 