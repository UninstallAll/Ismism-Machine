import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import GalleryPage from './pages/GalleryPage';
import TimelinePage from './pages/TimelinePage';
import StatsPage from './pages/StatsPage';
import AICreatePage from './pages/AICreatePage';

// 瑞士国际主义风格设计主题
const swissTheme = createTheme({
  palette: {
    primary: {
      main: '#000',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FF3B30',
      contrastText: '#fff',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
    text: {
      primary: '#000',
      secondary: '#333',
    },
  },
  typography: {
    fontFamily: [
      'Helvetica Neue', 'Arial', 'sans-serif',
    ].join(','),
    h1: { fontWeight: 700, textTransform: 'uppercase' },
    h2: { fontWeight: 700, textTransform: 'uppercase' },
    h3: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: 'uppercase' },
  },
  shape: { borderRadius: 0 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 0, boxShadow: 'none', border: '1px solid #eee' } } },
    MuiAppBar: { styleOverrides: { root: { boxShadow: 'none', borderBottom: '2px solid #FF3B30' } } },
  },
});

function App() {
  return (
    <ThemeProvider theme={swissTheme}>
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