import { useState } from 'react';
import { Box, Typography, Container, Grid, FormControl, Select, MenuItem, ToggleButtonGroup, ToggleButton, Dialog, DialogContent, DialogTitle, Button, Chip, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import GalleryGrid from '../components/GalleryGrid';
import galleryImages from '../data/galleryImages.json';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  style: string;
  description: string;
}

const GalleryPage = () => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const artworks = galleryImages as Artwork[];
  const [viewMode, setViewMode] = useState('grid');

  // 关闭详情模态框
  const closeArtworkDetails = () => {
    setSelectedArtwork(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 标题栏 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2, 
        borderBottom: '1px solid #000'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
          艺术主义画廊
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small" sx={{ 
            display: { xs: 'none', sm: 'block' }, 
            minWidth: 120,
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              borderColor: '#000'
            }
          }}>
            <Select defaultValue="time" sx={{ borderRadius: 0 }}>
              <MenuItem value="time">按时间排序</MenuItem>
              <MenuItem value="artist">按艺术家</MenuItem>
              <MenuItem value="style">按艺术流派</MenuItem>
            </Select>
          </FormControl>
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newValue) => newValue && setViewMode(newValue)}
            sx={{ 
              border: '1px solid #000',
              borderRadius: 0,
              '& .MuiToggleButton-root': {
                borderRadius: 0,
                border: 'none',
                borderLeft: '1px solid #000',
                '&:first-of-type': {
                  borderLeft: 'none'
                }
              }
            }}
          >
            <ToggleButton value="list" sx={{ px: 2 }}>
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="grid" sx={{ px: 2 }}>
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      
      {/* 内容区域 */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <GalleryGrid artworks={artworks} onSelect={setSelectedArtwork} />
      </Container>
      
      {/* 作品详情模态框 */}
      <Dialog
        open={selectedArtwork !== null}
        onClose={closeArtworkDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            border: '1px solid #000',
            boxShadow: 'none'
          }
        }}
      >
        {selectedArtwork && (
          <>
            <DialogTitle sx={{ 
              p: 0, 
              position: 'relative',
              borderBottom: '1px solid #000'
            }}>
              <IconButton
                onClick={closeArtworkDetails}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: '#000',
                  zIndex: 1
                }}
              >
                <CloseIcon />
              </IconButton>
              <Box sx={{ 
                width: '100%', 
                height: 300, 
                bgcolor: '#f5f5f5',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <img
                  src={selectedArtwork.imageUrl}
                  alt={selectedArtwork.title}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain' 
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                {selectedArtwork.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedArtwork.artist}, {selectedArtwork.year}
                </Typography>
                <Box sx={{ mx: 2, color: '#999' }}>|</Box>
                <Chip 
                  label={selectedArtwork.style} 
                  sx={{ 
                    bgcolor: '#FF3B30', 
                    color: 'white', 
                    borderRadius: 0,
                    fontWeight: 500
                  }} 
                />
              </Box>
              
              <Typography variant="body1" sx={{ mb: 4 }}>
                {selectedArtwork.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  sx={{ 
                    bgcolor: '#000', 
                    color: '#fff',
                    borderRadius: 0,
                    '&:hover': {
                      bgcolor: '#333'
                    }
                  }}
                >
                  在时间线查看
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    borderColor: '#000',
                    color: '#000',
                    borderRadius: 0,
                    '&:hover': {
                      borderColor: '#000',
                      bgcolor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  查看相关作品
                </Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GalleryPage; 