import React, { ReactNode } from 'react';

interface NavbarProps {
  title: string;
  activeView: 'gallery' | 'timeline' | 'stats' | 'ai';
  onNavChange: (view: 'gallery' | 'timeline' | 'stats' | 'ai') => void;
}

const Navbar: React.FC<NavbarProps> = ({ title, activeView, onNavChange }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="flex justify-between items-center h-16 px-6">
        <div className="flex items-center">
          <div className="text-xl font-bold text-blue-600">{title}</div>
        </div>
        
        <nav className="flex items-center">
          <button 
            className={`px-4 py-2 mx-1 rounded-full transition-colors ${
              activeView === 'gallery' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => onNavChange('gallery')}
          >
            艺术主义画廊
          </button>
          
          <button 
            className={`px-4 py-2 mx-1 rounded-full transition-colors ${
              activeView === 'timeline' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => onNavChange('timeline')}
          >
            时间线视图
          </button>
          
          <button 
            className={`px-4 py-2 mx-1 rounded-full transition-colors ${
              activeView === 'stats' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => onNavChange('stats')}
          >
            数据统计
          </button>
          
          <button 
            className={`px-4 py-2 mx-1 rounded-full transition-colors ${
              activeView === 'ai' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => onNavChange('ai')}
          >
            AI创作
          </button>
        </nav>
        
        <div className="flex items-center">
          <div className="relative">
            <input 
              type="text" 
              placeholder="搜索艺术主义..." 
              className="px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <button className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          <button className="ml-4 p-2 text-gray-600 hover:text-blue-500 md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 