import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import DragDemo from './components/DragDemo';

// 使用更高对比度的颜色方案
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e', // 更深的蓝色
      light: '#534bae',
      dark: '#000051',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d50000', // 更鲜艳的红色
      light: '#ff5131',
      dark: '#9b0000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#424242',
    },
    error: {
      main: '#d50000',
    },
    warning: {
      main: '#ff6d00',
    },
    info: {
      main: '#2962ff',
    },
    success: {
      main: '#00c853',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// 模拟数据
const mockCategories = [
  {
    id: 'modernism',
    name: '现代主义',
    subcategories: [
      { id: 'expressionism', name: '表现主义' },
      { id: 'cubism', name: '立体主义' },
      { id: 'surrealism', name: '超现实主义' }
    ]
  },
  {
    id: 'postmodernism',
    name: '后现代主义',
    subcategories: [
      { id: 'conceptual', name: '观念艺术' },
      { id: 'installation', name: '装置艺术' },
      { id: 'performance', name: '行为艺术' }
    ]
  }
];

const mockArtworks = [
  {
    id: 'a1',
    title: '向日葵',
    artist: '文森特·梵高',
    year: 1889,
    imageUrl: 'https://via.placeholder.com/300x200?text=向日葵',
    style: '后印象派',
    description: '梵高最著名的作品之一，描绘了一束向日葵。'
  },
  {
    id: 'a2',
    title: '格尔尼卡',
    artist: '巴勃罗·毕加索',
    year: 1937,
    imageUrl: 'https://via.placeholder.com/300x200?text=格尔尼卡',
    style: '立体主义',
    description: '毕加索创作的反战杰作，描绘了格尔尼卡轰炸的恐怖。'
  }
];

const mockTimelineItems = [
  {
    id: 't1',
    title: '印象派',
    year: 1870,
    description: '起源于19世纪60年代末的法国巴黎，重视光线和颜色的表现。',
    imageUrl: 'https://via.placeholder.com/300x200?text=印象派',
    artists: ['莫奈', '雷诺阿', '德加'],
    styleMovement: '印象主义',
    influences: ['巴比松画派', '日本浮世绘'],
    influencedBy: ['后印象派', '野兽派']
  },
  {
    id: 't2',
    title: '立体主义',
    year: 1907,
    description: '由毕加索和布拉克开创，强调几何形式和多视角分析。',
    imageUrl: 'https://via.placeholder.com/300x200?text=立体主义',
    artists: ['毕加索', '布拉克', '格里斯'],
    styleMovement: '现代主义',
    influences: ['塞尚', '非洲雕塑'],
    influencedBy: ['未来主义', '构成主义']
  }
];

function App() {
  const [activeView, setActiveView] = useState('drag');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleCategorySelect = (categoryId, subcategoryId) => {
    console.log(`Selected: ${categoryId}${subcategoryId ? `, ${subcategoryId}` : ''}`);
    // 实现分类筛选逻辑
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app high-contrast min-h-screen">
        <Navbar 
          title="艺术主义机" 
          activeView={activeView} 
          onNavChange={setActiveView} 
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        
        <div className="flex">
          <Sidebar 
            categories={mockCategories} 
            onCategorySelect={handleCategorySelect}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          
          {activeView === 'drag' ? (
            <div className="flex-1 p-4">
              <h1 className="text-2xl font-bold mb-6">拖拽演示</h1>
              <DragDemo />
            </div>
          ) : (
            <MainContent 
              artworks={mockArtworks}
              timelineItems={mockTimelineItems}
              activeView={activeView}
              sidebarOpen={sidebarOpen}
            />
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App; 