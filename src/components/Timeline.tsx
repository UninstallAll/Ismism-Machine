import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { useTimelineStore } from '../store/timelineStore';

const Timeline: React.FC = () => {
  const { nodes: timelineNodes, fetchNodes } = useTimelineStore();
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // 加载时间线节点
  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  // 监听滚动位置，控制箭头显示
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const position = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      setShowLeftArrow(position > 20);
      setShowRightArrow(position < maxScroll - 20);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 筛选节点
  const filteredNodes = timelineNodes.filter(node => 
    searchTerm === '' || 
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.artists.some(artist => artist.toLowerCase().includes(searchTerm.toLowerCase())) ||
    node.styleMovement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 按年份排序
  const sortedNodes = [...filteredNodes].sort((a, b) => a.year - b.year);

  // 处理鼠标滑动 - 加强版
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    // 改变鼠标样式
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2.5; // 增加滚动速度
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = 'default';
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    }
  };

  // 滚动左右按钮 - 增加滚动量
  const scrollLeft500px = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -500, behavior: 'smooth' });
    }
  };

  const scrollRight500px = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 500, behavior: 'smooth' });
    }
  };

  // 计算节点间距
  const getNodeSpacing = (nodesCount: number) => {
    if (nodesCount <= 3) return 'mx-16';
    if (nodesCount <= 6) return 'mx-10';
    if (nodesCount <= 12) return 'mx-6';
    return 'mx-3'; // 更紧凑的间距
  };

  return (
    <div className="flex flex-col h-full">
      {/* 标题和搜索栏 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-center">
            艺术主义时间线
          </h1>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <div className="flex items-center p-2 px-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input
                  type="text"
                  placeholder="搜索时间线节点..."
                  className="bg-transparent border-none outline-none text-sm text-muted-foreground w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="border border-white/10 hover:bg-white/5 gap-2"
              >
                <Filter className="h-4 w-4" />
                筛选艺术流派
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 时间线控制按钮 */}
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={scrollLeft500px}
          variant="ghost" 
          className={`rounded-full h-10 w-10 p-0 transition-opacity duration-300 ${
            showLeftArrow ? 'bg-white/5 hover:bg-white/10 opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-sm text-center text-muted-foreground">
          沿时间轴滑动或使用箭头按钮浏览
        </div>
        <Button 
          onClick={scrollRight500px}
          variant="ghost" 
          className={`rounded-full h-10 w-10 p-0 transition-opacity duration-300 ${
            showRightArrow ? 'bg-white/5 hover:bg-white/10 opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* 水平时间线容器 */}
      <div className="relative mb-10">
        {/* 中轴线 */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30"></div>
        
        {/* 滚动容器 */}
        <div 
          ref={containerRef}
          className="overflow-x-auto pb-6 pt-6 hide-scrollbar relative"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {sortedNodes.length > 0 ? (
            <div 
              className="flex items-center" 
              style={{ 
                width: 'max-content', 
                minWidth: '100%', 
                padding: '0 1rem'
              }}
            >
              {/* 开始标记 */}
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <div className="text-xs text-blue-400 mt-1">开始</div>
              </div>

              {/* 节点容器 - 使用flex布局平均分配空间 */}
              <div className="flex items-center justify-between flex-1 px-4 min-w-[calc(100%-120px)]">
                {sortedNodes.map((node, index) => (
                  <motion.div 
                    key={node.id}
                    initial={{ opacity: 0, y: index % 2 === 0 ? 20 : -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`${index % 2 === 0 ? 'mt-8' : 'mb-8'} ${getNodeSpacing(sortedNodes.length)}`}
                    style={{ transformOrigin: 'center center' }}
                  >
                    {/* 连接到中轴线的线 */}
                    <div 
                      className={`w-0.5 bg-gradient-to-b from-transparent via-blue-400 to-transparent mx-auto ${
                        index % 2 === 0 ? 'h-10 -mt-10' : 'h-10 -mb-6'
                      }`}
                    ></div>
                    
                    {/* 年份标记 */}
                    <div className="flex justify-center mb-2">
                      <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                        {node.year}
                      </div>
                    </div>
                    
                    {/* 内容卡片 */}
                    <div className="p-0.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                      <div className="w-60 max-w-60 rounded-lg bg-[#111] p-3 backdrop-blur-md">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent line-clamp-1">
                            {node.title}
                          </h3>
                        </div>
                        
                        {node.imageUrl && (
                          <div className="w-full h-24 mb-2 rounded-md overflow-hidden">
                            <img
                              src={node.imageUrl}
                              alt={node.title}
                              className="w-full h-full object-cover transition-transform hover:scale-105"
                            />
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-300 mb-2 line-clamp-2">
                          {node.description}
                        </p>
                        
                        <div className="mb-2">
                          <h4 className="text-xs font-medium text-blue-400 mb-0.5">艺术家:</h4>
                          <div className="flex flex-wrap gap-1">
                            {node.artists.slice(0, 3).map((artist, artistIndex) => (
                              <span 
                                key={artistIndex} 
                                className="px-1.5 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-300"
                              >
                                {artist}
                              </span>
                            ))}
                            {node.artists.length > 3 && (
                              <span className="text-xs text-blue-300">+{node.artists.length - 3}</span>
                            )}
                          </div>
                        </div>
                        
                        {node.tags && node.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {node.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span 
                                key={tagIndex} 
                                className="px-1.5 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {node.tags.length > 2 && (
                              <span className="text-xs text-purple-300">+{node.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-2 pt-1 border-t border-white/10">
                          <span className="text-xs font-medium text-purple-400 truncate block">
                            {node.styleMovement}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 结束标记 */}
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-12 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                <div className="text-xs text-purple-400 mt-1">结束</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="p-5 bg-[rgba(15,15,20,0.7)] backdrop-blur-sm border border-white/10 rounded-lg shadow-glow-sm mb-4">
                <Search className="h-10 w-10 text-gray-400 mb-2" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">未找到时间线节点</h3>
              <p className="text-gray-500">请尝试不同的搜索条件</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline; 