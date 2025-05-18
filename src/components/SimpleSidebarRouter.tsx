import React from 'react';
import { NavLink } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemButton, ListItemText, Typography, Box } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import BrushIcon from '@mui/icons-material/Brush';

interface SimpleSidebarRouterProps {
  isOpen: boolean;
}

const SimpleSidebarRouter: React.FC<SimpleSidebarRouterProps> = ({ isOpen }) => {
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={isOpen}
      sx={{
        width: 250,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 250,
          boxSizing: 'border-box',
          top: '64px',
          height: 'calc(100% - 64px)',
          borderRight: '1px solid #000',
          borderRadius: 0,
          boxShadow: 'none',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', borderBottom: '2px solid #FF3B30', pb: 1 }}>
          导航菜单
        </Typography>
        <List sx={{ p: 0 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton component={NavLink} to="/gallery" sx={{ border: '1px solid #000', borderRadius: 0, '&.active': { backgroundColor: '#000', color: '#fff' }, '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' } }}>
              <ImageIcon sx={{ mr: 2 }} />
              <ListItemText primary="艺术主义画廊" primaryTypographyProps={{ fontWeight: 500, letterSpacing: '0.02em' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton component={NavLink} to="/timeline" sx={{ border: '1px solid #000', borderRadius: 0, '&.active': { backgroundColor: '#000', color: '#fff' }, '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' } }}>
              <TimelineIcon sx={{ mr: 2 }} />
              <ListItemText primary="时间线视图" primaryTypographyProps={{ fontWeight: 500, letterSpacing: '0.02em' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton component={NavLink} to="/stats" sx={{ border: '1px solid #000', borderRadius: 0, '&.active': { backgroundColor: '#000', color: '#fff' }, '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' } }}>
              <BarChartIcon sx={{ mr: 2 }} />
              <ListItemText primary="数据统计分析" primaryTypographyProps={{ fontWeight: 500, letterSpacing: '0.02em' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton component={NavLink} to="/ai-create" sx={{ border: '1px solid #000', borderRadius: 0, borderLeft: '4px solid #FF3B30', '&.active': { backgroundColor: '#000', color: '#fff' }, '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' } }}>
              <BrushIcon sx={{ mr: 2 }} />
              <ListItemText primary="AI 创作实验室" primaryTypographyProps={{ fontWeight: 500, letterSpacing: '0.02em' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default SimpleSidebarRouter; 