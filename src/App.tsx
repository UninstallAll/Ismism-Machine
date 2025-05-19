import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import GalleryPage from './pages/GalleryPage';
import TimelinePage from './pages/TimelinePage';
import AICreatePage from './pages/AICreatePage';
import { CursorGlow } from './components/ui/cursor-glow';
import { TechBackground } from './components/ui/tech-background';

// 科技暗色主题
const techTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3D8BF7',
      contrastText: '#fff',
    },
    secondary: {
      main: '#AF4DFF',
      contrastText: '#fff',
    },
    background: {
      default: '#121417',
      paper: '#1a1d21',
    },
    text: {
      primary: '#e1e1e3',
      secondary: '#a1a1a6',
    },
  },
  typography: {
    fontFamily: [
      'Inter', 'Roboto', 'system-ui', 'sans-serif',
    ].join(','),
    h1: { fontWeight: 700, letterSpacing: '-0.01em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { 
      styleOverrides: { 
        root: { 
          borderRadius: 8, 
          textTransform: 'none',
          padding: '8px 16px',
        } 
      } 
    },
    MuiPaper: { 
      styleOverrides: { 
        root: { 
          borderRadius: 8, 
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        } 
      } 
    },
    MuiAppBar: { 
      styleOverrides: { 
        root: { 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        } 
      } 
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 0 20px rgba(61, 139, 247, 0.2)',
            borderColor: 'rgba(61, 139, 247, 0.2)',
          }
        }
      }
    }
  },
});

function App() {
  return (
    <ThemeProvider theme={techTheme}>
      <CssBaseline />
      <BrowserRouter>
        <TechBackground />
        <CursorGlow />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/gallery" replace />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="ai-create" element={<AICreatePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 