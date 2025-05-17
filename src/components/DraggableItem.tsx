import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';

interface DraggableItemProps {
  children: ReactNode;
  initialPosition?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  containerId?: string;
  className?: string;
}

const DraggableItem = ({
  children,
  initialPosition = { x: 0, y: 0 },
  onPositionChange,
  containerId,
  className = ''
}: DraggableItemProps) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  // 处理触摸开始事件
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      offsetRef.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
  };

  // 处理鼠标移动事件
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    let newX = e.clientX - offsetRef.current.x;
    let newY = e.clientY - offsetRef.current.y;
    
    // 如果指定了容器，确保元素不会超出容器边界
    if (containerId && elementRef.current) {
      const container = document.getElementById(containerId);
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = elementRef.current.getBoundingClientRect();
        
        newX = Math.max(0, Math.min(newX, containerRect.width - elementRect.width));
        newY = Math.max(0, Math.min(newY, containerRect.height - elementRect.height));
      }
    }
    
    setPosition({ x: newX, y: newY });
    onPositionChange?.({ x: newX, y: newY });
  }, [isDragging, containerId, onPositionChange]);

  // 处理触摸移动事件
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    
    let newX = e.touches[0].clientX - offsetRef.current.x;
    let newY = e.touches[0].clientY - offsetRef.current.y;
    
    // 如果指定了容器，确保元素不会超出容器边界
    if (containerId && elementRef.current) {
      const container = document.getElementById(containerId);
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = elementRef.current.getBoundingClientRect();
        
        newX = Math.max(0, Math.min(newX, containerRect.width - elementRect.width));
        newY = Math.max(0, Math.min(newY, containerRect.height - elementRect.height));
      }
    }
    
    setPosition({ x: newX, y: newY });
    onPositionChange?.({ x: newX, y: newY });
  }, [isDragging, containerId, onPositionChange]);

  // 处理鼠标释放事件
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 处理触摸结束事件
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 添加和移除事件监听器
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={elementRef}
      className={`draggable ${isDragging ? 'dragging' : ''} ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        position: 'absolute',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {children}
    </div>
  );
};

export default DraggableItem; 