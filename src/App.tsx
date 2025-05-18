import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">艺术主义拖拽演示</h1>
        <DragDemo />
      </div>
    </ThemeProvider>
  );
}

export default App; 