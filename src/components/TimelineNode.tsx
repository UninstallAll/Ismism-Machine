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
      <div className="p-0.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
        <div 
          className="w-72 max-w-72 rounded-lg bg-[#111] p-4 backdrop-blur-md"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {data.title}
            </h3>
            <span className="text-sm bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full">
              {data.year}
            </span>
          </div>
          
          {data.imageUrl && (
            <div 
              className="w-full h-32 mb-3 rounded-md overflow-hidden"
            >
              <img
                src={data.imageUrl}
                alt={data.title}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
          )}
          
          <p className="text-sm text-gray-300 mb-3 line-clamp-3">
            {data.description}
          </p>
          
          <div className="mb-2">
            <h4 className="text-xs font-medium text-blue-400 mb-1">艺术家:</h4>
            <div className="flex flex-wrap gap-1">
              {data.artists.map((artist, index) => (
                <span 
                  key={index} 
                  className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-300"
                >
                  {artist}
                </span>
              ))}
            </div>
          </div>
          
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {data.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="mt-3 pt-2 border-t border-white/10">
            <span className="text-xs font-medium text-purple-400">
              流派: {data.styleMovement}
            </span>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
      />
    </>
  );
};

export default memo(TimelineNode); 