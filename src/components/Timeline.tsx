import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useTimelineStore } from '../store/timelineStore';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

const Timeline: React.FC = () => {
  const { nodes: timelineNodes, fetchNodes } = useTimelineStore();
  const [searchTerm, setSearchTerm] = useState('');
  const timelineRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [timelineScroll, setTimelineScroll] = useState(0);
  const timelineYearsRef = useRef<HTMLDivElement>(null);
  
  // 节点引用，用于滚动到特定节点
  const nodeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 拖动相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // 加载时间线节点
  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  // 从URL参数获取艺术主义名称并设置搜索条件或滚动到该节点
  useEffect(() => {
    const styleParam = searchParams.get('style');
    const yearParam = searchParams.get('year');
    
    if (styleParam) {
      // 设置搜索条件为URL参数中的艺术主义名称
      setSearchTerm(styleParam);
      
      // 等待节点加载和渲染后，滚动到该节点
      setTimeout(() => {
        const targetNode = timelineNodes.find(node => 
          node.title.toLowerCase() === styleParam.toLowerCase() || 
          node.styleMovement.toLowerCase() === styleParam.toLowerCase()
        );
        
        if (targetNode) {
          // 设置高亮节点ID
          setHighlightedNodeId(targetNode.id);
          
          if (nodeRefs.current[targetNode.id]) {
            nodeRefs.current[targetNode.id]?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'center'
            });
            
            // 3秒后取消高亮
            setTimeout(() => {
              setHighlightedNodeId(null);
            }, 3000);
          }
        }
      }, 500); // 给予足够时间让节点渲染
    } else if (yearParam) {
      // 如果有年份参数，查找最接近该年份的节点
      const year = parseInt(yearParam, 10);
      if (!isNaN(year)) {
        setTimeout(() => {
          // 按照年份排序的节点
          const sortedByYear = [...timelineNodes].sort((a, b) => 
            Math.abs(a.year - year) - Math.abs(b.year - year)
          );
          
          if (sortedByYear.length > 0) {
            const closestNode = sortedByYear[0];
            setHighlightedNodeId(closestNode.id);
            
            if (nodeRefs.current[closestNode.id]) {
              nodeRefs.current[closestNode.id]?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
              });
              
              // 3秒后取消高亮
              setTimeout(() => {
                setHighlightedNodeId(null);
              }, 3000);
            }
          }
        }, 500);
      }
    }
  }, [searchParams, timelineNodes]);

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

  // 计算时间轴的最小和最大年份
  const minYear = sortedNodes.length > 0 ? sortedNodes[0].year : 1800;
  const maxYear = sortedNodes.length > 0 ? sortedNodes[sortedNodes.length - 1].year : 2023;
  const timeRange = maxYear - minYear;
  
  // 计算每个节点在时间轴上的位置百分比
  const getPositionPercentage = (year: number) => {
    return ((year - minYear) / timeRange) * 100;
  };
  
  // 生成时间轴上的年份标记
  const generateYearMarks = () => {
    if (timeRange === 0) return [];
    
    // 创建更均匀分布的年份标记点
    const numMarks = 12; // 标记点数量
    const marks = [];
    
    for (let i = 0; i <= numMarks; i++) {
      const year = Math.round(minYear + (timeRange * i) / numMarks);
      marks.push(year);
    }
    
    return marks;
  };
  
  // 时间轴年份标记点
  const yearMarks = generateYearMarks();
  
  // 滚动时间轴
  const scrollTimeline = (direction: 'left' | 'right') => {
    if (!timelineYearsRef.current) return;
    
    const container = timelineYearsRef.current;
    const scrollWidth = container.scrollWidth;
    const containerWidth = container.clientWidth;
    const maxScroll = scrollWidth - containerWidth;
    
    // 计算滚动量，每次滚动视窗宽度的25%
    const scrollAmount = containerWidth * 0.25;
    const currentScroll = container.scrollLeft;
    
    let newScroll;
    if (direction === 'left') {
      newScroll = Math.max(0, currentScroll - scrollAmount);
    } else {
      newScroll = Math.min(maxScroll, currentScroll + scrollAmount);
    }
    
    container.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };
  
  // 点击年份，跳转到对应时间的艺术主义
  const handleYearClick = (year: number) => {
    // 查找最接近该年份的节点
    const sortedByYear = [...sortedNodes].sort((a, b) => 
      Math.abs(a.year - year) - Math.abs(b.year - year)
    );
    
    if (sortedByYear.length > 0) {
      const closestNode = sortedByYear[0];
      setHighlightedNodeId(closestNode.id);
      
      if (nodeRefs.current[closestNode.id]) {
        nodeRefs.current[closestNode.id]?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        
        // 3秒后取消高亮
        setTimeout(() => {
          setHighlightedNodeId(null);
        }, 3000);
      }
    }
  };

  // 处理鼠标拖动
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineYearsRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - timelineYearsRef.current.offsetLeft);
    setScrollLeft(timelineYearsRef.current.scrollLeft);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !timelineYearsRef.current) return;
    e.preventDefault();
    const x = e.pageX - timelineYearsRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 滚动速度因子
    timelineYearsRef.current.scrollLeft = scrollLeft - walk;
  };

  // 跳转到艺术主义详情页
  const navigateToArtMovement = (artMovementId: string) => {
    navigate(`/art-movement/${artMovementId}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 标题和搜索栏 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-14"
      >
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-center">
            艺术主义时间线
          </h1>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="搜索艺术主义..." 
                  className="pl-10 pr-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 顶部时间轴 - 固定在页面顶部，紧贴导航栏 */}
      <div className="sticky top-16 bg-background z-10 border-b border-white/5 shadow-md -mt-8">
        <div className="relative px-8" ref={timelineRef}>
          {/* 时间轴线 */}
          <div className="h-1 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 w-full rounded-full mt-3"></div>
          
          {/* 滑动按钮 */}
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-black/40 text-white hover:bg-black/60 z-10 h-8 w-8 p-1 border border-white/10"
            onClick={() => scrollTimeline('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-black/40 text-white hover:bg-black/60 z-10 h-8 w-8 p-1 border border-white/10"
            onClick={() => scrollTimeline('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          {/* 年份标记容器，提供固定高度 */}
          <div className="relative h-10 mb-2">
            {/* 年份标记，支持水平滚动和鼠标拖动 */}
            <div 
              className="absolute left-0 right-0 mt-2 hide-scrollbar cursor-grab active:cursor-grabbing" 
              ref={timelineYearsRef}
              style={{ overflow: 'hidden', height: '30px' }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {/* 年份标记背景轨道 */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 transform -translate-y-1/2"></div>
              
              {yearMarks.map((year, index) => (
                <button
                  key={index}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 hover:scale-110 transition-all cursor-pointer px-2 py-1 rounded-full absolute"
                  style={{ 
                    left: `${(year - minYear) / timeRange * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                  onClick={() => handleYearClick(year)}
                >
                  <div className="absolute bottom-full mb-1 w-1 h-1 bg-blue-400 rounded-full left-1/2 transform -translate-x-1/2"></div>
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 艺术主义行列表 */}
      <div className="space-y-6 mt-4">
        {sortedNodes.length > 0 ? (
          sortedNodes.map((node, index) => (
            <motion.div 
              key={node.id}
              ref={el => nodeRefs.current[node.id] = el}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`flex flex-col md:flex-row items-start gap-4 border-b border-white/10 pb-6 
                ${highlightedNodeId === node.id ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 -mx-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}`}
            >
              {/* 左侧：艺术主义名称和信息 */}
              <div className="w-full md:w-1/3">
                <div className="flex items-center gap-2 mb-2">
                  {/* 时间点标记 */}
                  <div 
                    className="absolute top-0 w-0.5 h-6 bg-blue-500"
                    style={{ 
                      left: `${getPositionPercentage(node.year)}%`,
                      transform: 'translateX(-50%)',
                      marginTop: '-24px'
                    }}
                  ></div>
                  
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 flex items-center gap-1"
                    onClick={() => navigateToArtMovement(node.id)}
                  >
                    {node.title}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                  
                  <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                    {node.year}
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                  {node.description}
                </p>
                
                <div className="mb-3">
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
                
                <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm font-medium text-purple-400">
                    {node.styleMovement}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1 h-auto"
                    onClick={() => navigateToArtMovement(node.id)}
                  >
                    查看详情 <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
              
              {/* 右侧：艺术主义图片网格 */}
              <div className="w-full md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-2">
                {/* 显示该艺术主义的图片 */}
                {(node.images && node.images.length > 0 ? node.images.slice(0, 4) : [...Array(4)].map((_, i) => 
                  `/TestData/${10001 + ((index * 4 + i) % 30)}.jpg`
                )).map((imageUrl, imgIndex) => (
                  <div 
                    key={imgIndex} 
                    className="aspect-square rounded-md overflow-hidden cursor-pointer"
                    onClick={() => navigateToArtMovement(node.id)}
                  >
                    <img
                      src={imageUrl}
                      alt={`${node.title} artwork ${imgIndex + 1}`}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                      onError={(e) => {
                        // 图片加载失败时使用备用图片
                        const target = e.target as HTMLImageElement;
                        target.src = `/TestData/${10001 + ((index * 4 + imgIndex) % 30)}.jpg`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ))
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
  );
};

export default Timeline; 