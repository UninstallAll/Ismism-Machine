import React, { useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import DragDemo from './components/DragDemo';

// 创建一个简约的瑞士风格主题
const swissTheme = createTheme({
  palette: {
    primary: {
      main: '#000000', // 黑色
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF3B30', // 红色点缀
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f8f8f8',
    },
    text: {
      primary: '#000000',
      secondary: '#555555',
    },
    error: {
      main: '#FF3B30',
    },
  },
  typography: {
    fontFamily: [
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      textTransform: 'uppercase',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      textTransform: 'uppercase',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    button: {
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 0, // 方形边角，符合瑞士风格
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '8px 24px',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={swissTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: '#ffffff' }}>
        <AppBar position="static" color="transparent">
          <Toolbar sx={{ borderLeft: '8px solid #FF3B30' }}>
            <Typography variant="h6" component="div" sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold', 
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              MAI
            </Typography>
            <Button color="inherit">艺术主义</Button>
            <Button color="inherit">时间线</Button>
            <Button color="inherit">关于</Button>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ pt: 8, pb: 8 }}>
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              mb: 6,
              borderLeft: '8px solid #FF3B30',
              pl: 3,
              py: 2
            }}
          >
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 900, 
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                mb: 1
              }}
            >
              艺术主义时间线
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 400,
                color: '#555555'
              }}
            >
              探索艺术流派的演变与联系
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              mb: 6, 
              display: 'grid',
              gridTemplateColumns: '100px 1fr',
              borderBottom: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ 
              p: 2, 
              fontWeight: 'bold', 
              borderRight: '1px solid #e0e0e0',
              textTransform: 'uppercase'
            }}>
              日期
            </Box>
            <Box sx={{ 
              p: 2, 
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              艺术主义
            </Box>
          </Box>
          
          {/* 艺术主义列表项 */}
          <Box 
            sx={{ 
              mb: 2, 
              display: 'grid',
              gridTemplateColumns: '100px 1fr',
              '&:hover': {
                backgroundColor: '#f9f9f9'
              }
            }}
          >
            <Box sx={{ 
              p: 2, 
              fontWeight: 'bold', 
              borderRight: '1px solid #e0e0e0',
              fontSize: '1.5rem',
              textTransform: 'uppercase'
            }}>
              1870
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" sx={{ textTransform: 'uppercase', mb: 1 }}>
                印象派
              </Typography>
              <Typography variant="body2" color="text.secondary">
                印象派起源于19世纪60年代末的法国巴黎，重视光线和颜色的即时视觉印象。
              </Typography>
            </Box>
          </Box>
          
          <Box 
            sx={{ 
              mb: 2, 
              display: 'grid',
              gridTemplateColumns: '100px 1fr',
              '&:hover': {
                backgroundColor: '#f9f9f9'
              }
            }}
          >
            <Box sx={{ 
              p: 2, 
              fontWeight: 'bold', 
              borderRight: '1px solid #e0e0e0',
              fontSize: '1.5rem',
              textTransform: 'uppercase'
            }}>
              1907
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" sx={{ textTransform: 'uppercase', mb: 1 }}>
                立体主义
              </Typography>
              <Typography variant="body2" color="text.secondary">
                立体主义由毕加索和布拉克开创，强调几何形式和多视角分析。
              </Typography>
            </Box>
          </Box>
          
          <Box 
            sx={{ 
              mt: 6,
              pt: 4,
              borderTop: '1px solid #e0e0e0'
            }}
          >
            <Typography variant="h4" sx={{ textTransform: 'uppercase', mb: 3 }}>
              拖拽演示
            </Typography>
            <DragDemo />
          </Box>
        </Container>
        
        <Box 
          component="footer" 
          sx={{ 
            mt: 'auto', 
            py: 3, 
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © 2025 艺术主义机 | 探索艺术流派的演变与联系
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App; 