import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Container } from '@mui/material';
import SimpleNavbar from './SimpleNavbar';
import SimpleSidebarRouter from './SimpleSidebarRouter';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex min-h-screen bg-background">
      <SimpleNavbar onMenuClick={toggleSidebar} />
      <AnimatePresence>
        {sidebarOpen && <SimpleSidebarRouter isOpen={sidebarOpen} />}
      </AnimatePresence>
      <motion.main
        className="flex-grow p-3 pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          marginLeft: sidebarOpen ? '250px' : 0,
          transition: 'margin-left 0.2s',
        }}
      >
        <div className="container py-4 max-w-7xl">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export default MainLayout; 