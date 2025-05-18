import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, InputBase } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

interface SimpleNavbarProps {
  onMenuClick: () => void;
}

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({ onMenuClick }) => {
  return (
    <AppBar position="fixed" color="default" sx={{ backgroundColor: '#fff', borderLeft: '4px solid #FF3B30' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenuClick} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#000' }}>
            艺术主义机器
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', border: '1px solid #000', px: 2, py: 0.5 }}>
          <InputBase placeholder="搜索艺术品..." inputProps={{ 'aria-label': '搜索艺术品' }} sx={{ ml: 1, flex: 1, fontFamily: 'Helvetica, Arial, sans-serif' }} />
          <IconButton type="button" aria-label="search">
            <SearchIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default SimpleNavbar; 