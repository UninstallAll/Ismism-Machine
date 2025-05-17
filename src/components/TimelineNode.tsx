import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip, Stack } from '@mui/material';

interface TimelineNodeData {
  id: string;
  title: string;
  year: number;
  description: string;
  imageUrl?: string;
  artists: string[];
  styleMovement: string;
  tags?: string[];
}

const TimelineNode = ({ data }: NodeProps<TimelineNodeData>) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
      />
      <Card 
        sx={{ 
          width: 280, 
          maxWidth: 280,
          boxShadow: 3,
          '&:hover': {
            boxShadow: 6,
          }
        }}
      >
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            {data.title} ({data.year})
          </Typography>
          
          {data.imageUrl && (
            <Box 
              component="img"
              src={data.imageUrl}
              alt={data.title}
              sx={{ 
                width: '100%', 
                height: 140, 
                objectFit: 'cover',
                mb: 1,
                borderRadius: 1
              }}
            />
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {data.description}
          </Typography>
          
          <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>
            艺术家:
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1 }}>
            {data.artists.map((artist, index) => (
              <Chip 
                key={index} 
                label={artist} 
                size="small" 
                variant="outlined"
                sx={{ mb: 0.5 }}
              />
            ))}
          </Stack>
          
          {data.tags && data.tags.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {data.tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  size="small"
                  color="secondary"
                  sx={{ mb: 0.5 }}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
      />
    </>
  );
};

export default memo(TimelineNode); 