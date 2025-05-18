import { useState, useRef, useEffect, ReactNode } from 'react';

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
    if (e.button !== 0) return; // 只响应左键点击
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = elementRef.current?.getBoundingClientRect();
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
    
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      offsetRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      };
      setIsDragging(true);
    }
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const newX = e.clientX - offsetRef.current.x;
    const newY = e.clientY - offsetRef.current.y;
    
    updatePosition(newX, newY);
  };

  // 处理触摸移动事件
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    
    const newX = e.touches[0].clientX - offsetRef.current.x;
    const newY = e.touches[0].clientY - offsetRef.current.y;
    
    updatePosition(newX, newY);
  };

  // 更新位置的通用函数
  const updatePosition = (x: number, y: number) => {
    let newX = x;
    let newY = y;
    
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
  };

  // 处理鼠标释放事件
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 处理触摸结束事件
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 添加和移除事件监听器
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