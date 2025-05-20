import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import SimpleNavbar from './SimpleNavbar';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0b]">
      <SimpleNavbar onMenuClick={() => {}} />
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