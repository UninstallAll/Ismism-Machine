import React, { useState, useEffect, useRef } from 'react';
import { useTimelineStore } from '../store/timelineStore';

interface Position {
  x: number;
  y: number;
}

interface NodeProps {
  id: string;
  title: string;
  year: number;
  description: string;
  position?: Position;
  tags?: string[];
}

interface DraggableNodeProps {
  node: NodeProps;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({ node }) => {
  const updateNodePosition = useTimelineStore(state => state.updateNodePosition);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>(node.position || { x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  
  // 开始拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只响应左键点击
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      offsetRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      setIsDragging(true);
    }
  };
  
  // 处理触摸开始事件
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      offsetRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      };
      setIsDragging(true);
    }
  };
  
  // 拖拽中
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const newX = e.clientX - offsetRef.current.x;
    const newY = e.clientY - offsetRef.current.y;
    
    setPosition({ x: newX, y: newY });
  };
  
  // 处理触摸移动
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    
    const newX = e.touches[0].clientX - offsetRef.current.x;
    const newY = e.touches[0].clientY - offsetRef.current.y;
    
    setPosition({ x: newX, y: newY });
  };
  
  // 结束拖拽
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      
      // 更新存储中的位置
      updateNodePosition(node.id, position);
    }
  };
  
  // 处理触摸结束
  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      
      // 更新存储中的位置
      updateNodePosition(node.id, position);
    }
  };
  
  useEffect(() => {
    const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e);
    const mouseUpHandler = () => handleMouseUp();
    const touchMoveHandler = (e: TouchEvent) => handleTouchMove(e);
    const touchEndHandler = () => handleTouchEnd();
    
    if (isDragging) {
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      document.addEventListener('touchmove', touchMoveHandler, { passive: false });
      document.addEventListener('touchend', touchEndHandler);
    }
    
    return () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      document.removeEventListener('touchmove', touchMoveHandler);
      document.removeEventListener('touchend', touchEndHandler);
    };
  }, [isDragging, position.x, position.y]);
  
  return (
    <div 
      ref={nodeRef}
      className={`absolute p-4 bg-white rounded-lg shadow-md border-2 ${
        isDragging ? 'border-blue-500 cursor-grabbing' : 'border-gray-200 cursor-grab'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: isDragging ? 10 : 1,
        width: '200px',
        userSelect: 'none',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <h3 className="text-lg font-bold">{node.title}</h3>
      <div className="text-sm text-gray-600">{node.year}</div>
      <p className="mt-2 text-sm">{node.description}</p>
      
      {/* 标签 */}
      <div className="mt-2 flex flex-wrap gap-1">
        {node.tags && node.tags.map(tag => (
          <span 
            key={tag} 
            className="px-2 py-1 bg-gray-100 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DraggableNode; 