import React from 'react';
import { useTimelineStore } from '../timelineStore';

// 这是一个简单的可拖拽节点组件
// 在实际项目中，可能需要替换为使用Framer Motion或React DnD等库实现更复杂的拖拽功能
const DraggableNode = ({ node }) => {
  const updateNodePosition = useTimelineStore(state => state.updateNodePosition);
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState(node.position || { x: 0, y: 0 });
  
  // 拖拽相关状态
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  
  // 开始拖拽
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    // 添加全局事件监听
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // 拖拽中
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    setPosition(newPosition);
  };
  
  // 结束拖拽
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // 更新存储中的位置
    updateNodePosition(node.id, position);
    
    // 移除全局事件监听
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  React.useEffect(() => {
    // 组件卸载时确保移除事件监听
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  return (
    <div 
      className={`absolute p-4 bg-white rounded-lg shadow-md border-2 ${
        isDragging ? 'border-blue-500 cursor-grabbing' : 'border-gray-200 cursor-grab'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: isDragging ? 10 : 1,
        width: '200px'
      }}
      onMouseDown={handleMouseDown}
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