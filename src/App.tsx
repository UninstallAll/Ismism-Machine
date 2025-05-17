import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Timeline from './components/Timeline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Timeline />
    </ThemeProvider>
  );
}

export default App; 