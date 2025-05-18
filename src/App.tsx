import React from 'react';
import { CssBaseline, ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import GalleryPage from './pages/GalleryPage';
import TimelinePage from './pages/TimelinePage';
import StatsPage from './pages/StatsPage';
import AICreatePage from './pages/AICreatePage';

// 瑞士国际主义风格设计主题
let swissTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF3B30',
      light: '#FF6B61',
      dark: '#CC2F26',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#333333',
    },
    divider: '#000000',
    error: {
      main: '#FF3B30',
    },
    warning: {
      main: '#FF9500',
    },
    info: {
      main: '#007AFF',
    },
    success: {
      main: '#4CD964',
    },
  },
  typography: {
    fontFamily: [
      'Helvetica Neue',
      'Helvetica',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: { 
      fontWeight: 700, 
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
    },
    h2: { 
      fontWeight: 700, 
      textTransform: 'uppercase',
      letterSpacing: '0.01em',
    },
    h3: { 
      fontWeight: 700,
      letterSpacing: '0.01em',
    },
    h4: { 
      fontWeight: 600,
    },
    h5: { 
      fontWeight: 600,
    },
    h6: { 
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.6,
    },
    button: { 
      fontWeight: 700, 
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    caption: {
      fontSize: '0.75rem',
    },
    overline: {
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontWeight: 500,
    },
  },
  shape: { 
    borderRadius: 0 
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#000000 #ffffff",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            width: 8,
            height: 8,
            backgroundColor: "#ffffff",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 0,
            backgroundColor: "#000000",
            border: "none",
          },
        }
      }
    },
    MuiButton: { 
      styleOverrides: { 
        root: { 
          borderRadius: 0,
          padding: '8px 22px',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
          }
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          }
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          }
        }
      } 
    },
    MuiPaper: { 
      styleOverrides: { 
        root: { 
          borderRadius: 0, 
          boxShadow: 'none', 
          border: '1px solid #eee',
          backgroundImage: 'none'
        } 
      } 
    },
    MuiAppBar: { 
      styleOverrides: { 
        root: { 
          boxShadow: 'none', 
          borderBottom: '2px solid #FF3B30',
          backgroundImage: 'none'
        } 
      } 
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid #000000',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          }
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 16,
          '&:last-child': {
            paddingBottom: 16
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid #000000',
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#000000',
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            '& fieldset': {
              borderWidth: 1,
            },
            '&:hover fieldset': {
              borderWidth: 2,
            },
            '&.Mui-focused fieldset': {
              borderWidth: 2,
            }
          }
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }
      }
    },
  },
});

// 应用响应式字体大小
swissTheme = responsiveFontSizes(swissTheme);

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