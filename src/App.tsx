import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import GalleryPage from './pages/GalleryPage';
import TimelinePage from './pages/TimelinePage';
import StatsPage from './pages/StatsPage';
import AICreatePage from './pages/AICreatePage';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/gallery" replace />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="ai-create" element={<AICreatePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 