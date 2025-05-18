import React from 'react';

interface SimpleNavbarProps {
  onMenuClick: () => void;
}

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="flex justify-between items-center h-16 px-4 md:px-6">
        <div className="flex items-center">
          <button 
            className="mr-3 p-2 text-gray-700 hover:text-blue-800 focus:outline-none"
            onClick={onMenuClick}
            aria-label="切换侧边栏"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          
          <div className="text-xl font-bold text-blue-800">艺术主义机器</div>
        </div>
        
        <div className="flex items-center">
          <div className="relative hidden sm:block">
            <input 
              type="text" 
              placeholder="搜索艺术品..." 
              className="px-4 py-2 pr-10 border-2 border-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent w-40 md:w-64"
            />
            <button className="absolute right-0 top-0 mt-2 mr-3 text-gray-600 hover:text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleNavbar; 