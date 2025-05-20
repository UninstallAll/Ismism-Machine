import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Gallery from './components/Gallery';
import Timeline from './components/Timeline';
import ArtMovementPage from './pages/ArtMovementPage';
import ArtworkDetailPage from './pages/ArtworkDetailPage';
import { CursorGlow } from './components/ui/cursor-glow';
import { TechBackground } from './components/ui/tech-background';

// 现代风格主题 - 参考 Cursor 官网
const modernTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2563EB', // 更亮的蓝色，类似Cursor官网
      contrastText: '#fff',
    },
    secondary: {
      main: '#9333EA', // 紫色调
      contrastText: '#fff',
    },
    background: {
      default: '#0A0A0B', // 更深的背景色
      paper: '#111113',   // 更现代的卡片背景
    },
    text: {
      primary: '#F5F5F7',
      secondary: '#A1A1AA',
    },
  },
  typography: {
    fontFamily: [
      'Inter', 'SF Pro Display', 'system-ui', 'sans-serif',
    ].join(','),
    h1: { fontWeight: 800, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 600, letterSpacing: '-0.02em' },
    button: { fontWeight: 600, letterSpacing: '0' },
  },
  shape: { borderRadius: 12 }, // 更大的圆角
  components: {
    MuiButton: { 
      styleOverrides: { 
        root: { 
          borderRadius: 12, 
          textTransform: 'none',
          padding: '10px 20px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease',
        } 
      } 
    },
    MuiPaper: { 
      styleOverrides: { 
        root: { 
          borderRadius: 12, 
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
        } 
      } 
    },
    MuiAppBar: { 
      styleOverrides: { 
        root: { 
          boxShadow: 'none',
          backgroundImage: 'linear-gradient(rgba(10, 10, 11, 0.8), rgba(10, 10, 11, 0.7))',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        } 
      } 
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          backgroundImage: 'linear-gradient(rgba(10, 10, 11, 0.95), rgba(10, 10, 11, 0.9))',
          backdropFilter: 'blur(20px)',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(37, 99, 235, 0.2)',
            borderColor: 'rgba(37, 99, 235, 0.2)',
            transform: 'translateY(-2px)',
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(37, 99, 235, 0.3)',
            },
          }
        }
      }
    }
  },
});

function App() {
  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <Router>
        <TechBackground />
        <CursorGlow />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/gallery" replace />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="art-movement/:id" element={<ArtMovementPage />} />
            <Route path="artwork/:id" element={<ArtworkDetailPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 