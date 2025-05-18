import { Grid, Card, CardMedia, CardContent, Typography, Box, Button, CardActionArea } from '@mui/material';
import { useState } from 'react';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  style: string;
  description: string;
}

interface GalleryGridProps {
  artworks: Artwork[];
  onSelect: (artwork: Artwork) => void;
}

const GalleryGrid = ({ artworks, onSelect }: GalleryGridProps) => {
  // 处理图片加载错误
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/300x200?text=图片加载失败';
  };

  return (
    <Grid container spacing={3}>
      {artworks.map(artwork => (
        <Grid item xs={12} sm={6} md={4} key={artwork.id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 0,
              border: '1px solid #000',
              boxShadow: 'none',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
            }}
          >
            <CardActionArea onClick={() => onSelect(artwork)}>
              <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={artwork.imageUrl}
                  alt={artwork.title}
                  onError={handleImageError}
                  sx={{
                    objectFit: 'cover',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                />
                <Box 
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    p: 1.5,
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    '.MuiCardActionArea-root:hover &': {
                      opacity: 1
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {artwork.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {artwork.artist}
                  </Typography>
                </Box>
              </Box>
            </CardActionArea>
            
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                {artwork.title}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {artwork.artist}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {artwork.year}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box 
                  component="span" 
                  sx={{ 
                    bgcolor: '#FF3B30', 
                    color: 'white', 
                    fontSize: '0.75rem',
                    px: 1,
                    py: 0.5,
                    fontWeight: 500
                  }}
                >
                  {artwork.style}
                </Box>
                <Button 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(artwork);
                  }}
                  sx={{ 
                    color: '#000',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  查看详情
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default GalleryGrid; 