import React, { useRef, useEffect } from 'react';

export function TechBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 调整canvas尺寸以填满窗口
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 创建网格点
    const gridPoints: { x: number; y: number; size: number; opacity: number; speed: number }[] = [];
    const gridSize = 40; // 网格大小
    
    for (let x = 0; x < canvas.width + gridSize; x += gridSize) {
      for (let y = 0; y < canvas.height + gridSize; y += gridSize) {
        // 添加一些随机偏移，使网格看起来不那么规则
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;
        
        gridPoints.push({
          x: x + offsetX,
          y: y + offsetY,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          speed: Math.random() * 0.05 + 0.02
        });
      }
    }

    // 绘制函数
    const draw = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 绘制网格点和连线
      for (let i = 0; i < gridPoints.length; i++) {
        const point = gridPoints[i];
        
        // 更新点的不透明度（闪烁效果）
        point.opacity += point.speed;
        if (point.opacity >= 0.7 || point.opacity <= 0.1) {
          point.speed = -point.speed;
        }
        
        // 绘制点
        ctx.beginPath();
        ctx.fillStyle = `rgba(100, 180, 255, ${point.opacity})`;
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 与临近点连线
        for (let j = i + 1; j < gridPoints.length; j++) {
          const neighbor = gridPoints[j];
          const distance = Math.sqrt(
            Math.pow(point.x - neighbor.x, 2) + Math.pow(point.y - neighbor.y, 2)
          );
          
          if (distance < gridSize * 1.5) {
            // 基于距离计算线的不透明度
            const lineOpacity = 0.1 * (1 - distance / (gridSize * 1.5));
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(100, 180, 255, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(neighbor.x, neighbor.y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(draw);
    };
    
    const animationId = requestAnimationFrame(draw);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-25"
    />
  );
} 