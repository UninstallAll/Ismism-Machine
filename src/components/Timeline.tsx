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
  
  // 加载时间线节点
  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

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

  // 处理鼠标滑动
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // 滚动速度
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 滚动左右按钮
  const scrollLeft300px = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight300px = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
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
          onClick={scrollLeft300px}
          variant="ghost" 
          className="rounded-full h-10 w-10 p-0 bg-white/5 hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-sm text-center text-muted-foreground">
          沿时间轴滑动或使用箭头按钮浏览
        </div>
        <Button 
          onClick={scrollRight300px}
          variant="ghost" 
          className="rounded-full h-10 w-10 p-0 bg-white/5 hover:bg-white/10"
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
          className="overflow-x-auto pb-6 pt-6 hide-scrollbar"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {sortedNodes.length > 0 ? (
            <div 
              className="flex items-center" 
              style={{ width: 'max-content', minWidth: '100%', paddingLeft: '50%', paddingRight: '50%' }}
            >
              {sortedNodes.map((node, index) => (
                <motion.div 
                  key={node.id}
                  initial={{ opacity: 0, y: index % 2 === 0 ? 20 : -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`mx-8 ${index % 2 === 0 ? 'mt-8' : 'mb-8'}`}
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
                    <div className="w-72 max-w-72 rounded-lg bg-[#111] p-4 backdrop-blur-md">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          {node.title}
                        </h3>
                      </div>
                      
                      {node.imageUrl && (
                        <div className="w-full h-32 mb-3 rounded-md overflow-hidden">
                          <img
                            src={node.imageUrl}
                            alt={node.title}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                        {node.description}
                      </p>
                      
                      <div className="mb-2">
                        <h4 className="text-xs font-medium text-blue-400 mb-1">艺术家:</h4>
                        <div className="flex flex-wrap gap-1">
                          {node.artists.map((artist, artistIndex) => (
                            <span 
                              key={artistIndex} 
                              className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-300"
                            >
                              {artist}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {node.tags && node.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {node.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex} 
                              className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-3 pt-2 border-t border-white/10">
                        <span className="text-xs font-medium text-purple-400">
                          流派: {node.styleMovement}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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