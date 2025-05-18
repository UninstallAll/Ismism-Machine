import React from 'react';

interface NavbarProps {
  title: string;
  activeView: 'gallery' | 'timeline' | 'stats' | 'ai' | 'drag';
  onNavChange: (view: 'gallery' | 'timeline' | 'stats' | 'ai' | 'drag') => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  title, 
  activeView, 
  onNavChange,
  onToggleSidebar,
  sidebarOpen = true
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="flex justify-between items-center h-16 px-4 md:px-6">
        <div className="flex items-center">
          {/* 汉堡菜单按钮 - 只在移动视图显示 */}
          <button 
            className="mr-3 p-2 text-gray-700 hover:text-blue-800 focus:outline-none sm:block md:hidden"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? "关闭侧边栏" : "打开侧边栏"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          
          <div className="text-xl font-bold text-blue-800">{title}</div>
        </div>
        
        <nav className="hidden md:flex items-center">
          <button 
            className={`px-4 py-2 mx-1 rounded-full transition-colors ${
              activeView === 'gallery' 
                ? 'bg-blue-800 text-white' 
                : 'text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => onNavChange('gallery')}
          >
            艺术主义画廊
          </button>
          
          <button 
            className={`px-4 py-2 mx-1 rounded-full transition-colors ${
              activeView === 'timeline' 
                ? 'bg-blue-800 text-white' 
                : 'text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => onNavChange('timeline')}
          >
            时间线视图
          </button>
          
          <button 
            className={`px-4 py-2 mx-1 rounded-full transition-colors ${
              activeView === 'stats' 
                ? 'bg-blue-800 text-white' 
                : 'text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => onNavChange('stats')}
          >
            数据统计
          </button>
          
          <button 
            className={`px-4 py-2 mx-1 rounded-full transition-colors ${
              activeView === 'ai' 
                ? 'bg-blue-800 text-white' 
                : 'text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => onNavChange('ai')}
          >
            AI创作
          </button>
          
          <button 
            className={`px-4 py-2 mx-1 rounded-full transition-colors ${
              activeView === 'drag' 
                ? 'bg-blue-800 text-white' 
                : 'text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => onNavChange('drag')}
          >
            拖拽演示
          </button>
        </nav>
        
        {/* 移动设备导航下拉菜单按钮 */}
        <div className="flex md:hidden">
          <div className="relative group">
            <button className="px-3 py-2 text-gray-800 font-medium rounded-md border-2 border-gray-400 hover:bg-gray-100">
              {activeView === 'gallery' && '艺术主义画廊'}
              {activeView === 'timeline' && '时间线视图'}
              {activeView === 'stats' && '数据统计'}
              {activeView === 'ai' && 'AI创作'}
              {activeView === 'drag' && '拖拽演示'}
              <span className="ml-2">▼</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-300 hidden group-hover:block">
              <div className="py-1">
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    activeView === 'gallery' ? 'bg-blue-100 text-blue-800' : 'text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => onNavChange('gallery')}
                >
                  艺术主义画廊
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    activeView === 'timeline' ? 'bg-blue-100 text-blue-800' : 'text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => onNavChange('timeline')}
                >
                  时间线视图
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    activeView === 'stats' ? 'bg-blue-100 text-blue-800' : 'text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => onNavChange('stats')}
                >
                  数据统计
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    activeView === 'ai' ? 'bg-blue-100 text-blue-800' : 'text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => onNavChange('ai')}
                >
                  AI创作
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    activeView === 'drag' ? 'bg-blue-100 text-blue-800' : 'text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => onNavChange('drag')}
                >
                  拖拽演示
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="relative hidden sm:block">
            <input 
              type="text" 
              placeholder="搜索艺术主义..." 
              className="px-4 py-2 pr-10 border-2 border-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent w-40 md:w-64"
            />
            <button className="absolute right-0 top-0 mt-2 mr-3 text-gray-600 hover:text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          {/* 移动视图中的搜索按钮 */}
          <button className="ml-3 p-2 text-gray-700 hover:text-blue-800 focus:outline-none sm:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 