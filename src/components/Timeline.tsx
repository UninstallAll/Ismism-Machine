import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, ArrowRight, GripHorizontal, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { useTimelineStore } from '../store/timelineStore';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

// 添加隐藏滚动条的CSS样式
const hideScrollbarStyle = {
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  'scrollbarWidth': 'none',
  '-ms-overflow-style': 'none',
};

// 创建一个会话存储键
const TIMELINE_POSITION_KEY = 'timeline_position';
const TIMELINE_SCROLL_POSITION_KEY = 'timeline_scroll_position';

const Timeline: React.FC = () => {
  const { nodes: timelineNodes, fetchNodes } = useTimelineStore();
  const [searchTerm, setSearchTerm] = useState('');
  const timelineRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const timelineListRef = useRef<HTMLDivElement>(null);
  
  // 改为直接使用时间轴位置状态
  const [timelinePosition, setTimelinePosition] = useState(0); // 0 表示中间位置，正负表示向左右偏移
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // 节点引用，用于滚动到特定节点
  const nodeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 拖动相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startPosition, setStartPosition] = useState(0);
  
  // 缩略图拖动状态
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);
  const [thumbnailStartX, setThumbnailStartX] = useState(0);
  const [thumbnailScrollLeft, setThumbnailScrollLeft] = useState(0);
  
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

  // 计算时间轴的最小和最大年份
  const minYear = sortedNodes.length > 0 ? sortedNodes[0].year : 1800;
  const maxYear = sortedNodes.length > 0 ? sortedNodes[sortedNodes.length - 1].year : 2023;
  const timeRange = maxYear - minYear;
  
  // 加载时恢复时间轴位置和滚动位置
  useEffect(() => {
    const savedPosition = sessionStorage.getItem(TIMELINE_POSITION_KEY);
    const savedScrollPosition = sessionStorage.getItem(TIMELINE_SCROLL_POSITION_KEY);
    const lastViewedArtMovement = sessionStorage.getItem('last_viewed_art_movement');
    
    // 如果有上次查看的艺术主义，从详情页返回时直接定位
    if (lastViewedArtMovement && location.pathname === '/timeline') {
      const artMovement = timelineNodes.find(node => node.id === lastViewedArtMovement);
      if (artMovement && timelineContainerRef.current) {
        // 计算需要的偏移量使该艺术主义的年份居中
        const yearPosition = ((artMovement.year - minYear) / timeRange) * 100;
        const centerOffset = 50 - yearPosition;
        
        // 直接设置位置，不需要动画效果
        setTimelinePosition(centerOffset);
        
        // 直接滚动到该艺术主义，不使用平滑滚动
        if (nodeRefs.current[lastViewedArtMovement]) {
          nodeRefs.current[lastViewedArtMovement]?.scrollIntoView({
            block: 'center'
          });
          
          // 高亮显示
          setHighlightedNodeId(lastViewedArtMovement);
          
          // 略微延时后取消高亮
          setTimeout(() => {
            setHighlightedNodeId(null);
          }, 2000);
          
          // 清除上次查看记录，避免下次进入页面重复定位
          sessionStorage.removeItem('last_viewed_art_movement');
        }
      }
    } else {
      // 没有特定艺术主义需要定位时，恢复上次保存的位置
      if (savedPosition) {
        setTimelinePosition(parseFloat(savedPosition));
      }
      
      if (savedScrollPosition && timelineListRef.current) {
        // 直接设置滚动位置，不使用动画
        timelineListRef.current.scrollTop = parseFloat(savedScrollPosition);
      }
    }
  }, [location.pathname, minYear, timeRange, timelineNodes]);

  // 保存时间轴位置和滚动位置
  const savePositions = () => {
    sessionStorage.setItem(TIMELINE_POSITION_KEY, timelinePosition.toString());
    if (timelineListRef.current) {
      sessionStorage.setItem(TIMELINE_SCROLL_POSITION_KEY, timelineListRef.current.scrollTop.toString());
    }
  };

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
          
          // 计算需要的偏移量使该艺术主义的年份居中显示
          const yearPosition = ((targetNode.year - minYear) / timeRange) * 100;
          const centerOffset = 50 - yearPosition;
          setTimelinePosition(centerOffset);
          
          if (nodeRefs.current[targetNode.id]) {
            nodeRefs.current[targetNode.id]?.scrollIntoView({ 
              block: 'center'
            });
            
            // 3秒后取消高亮
            setTimeout(() => {
              setHighlightedNodeId(null);
            }, 3000);
          }
        }
      }, 100); // 减少等待时间
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
            
            // 计算需要的偏移量使该艺术主义的年份居中显示
            const yearPosition = ((closestNode.year - minYear) / timeRange) * 100;
            const centerOffset = 50 - yearPosition;
            setTimelinePosition(centerOffset);
            
            if (nodeRefs.current[closestNode.id]) {
              nodeRefs.current[closestNode.id]?.scrollIntoView({ 
                block: 'center'
              });
              
              // 3秒后取消高亮
              setTimeout(() => {
                setHighlightedNodeId(null);
              }, 3000);
            }
          }
        }, 100);
      }
    }
  }, [searchParams, timelineNodes]);

  // 计算每个节点在时间轴上的位置百分比（考虑时间轴位置）
  const getPositionPercentage = (year: number) => {
    // 基础位置百分比
    const basePercentage = ((year - minYear) / timeRange) * 100;
    // 应用时间轴位置偏移
    return basePercentage + timelinePosition;
  };
  
  // 生成时间轴上的年份标记
  const generateYearMarks = () => {
    if (timeRange === 0) return [];
    
    // 创建更均匀分布的年份标记点
    const numMarks = 20; // 标记点数量
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
    // 计算滚动量，每次滚动50%的宽度
    const scrollAmount = 50;
    
    if (direction === 'left') {
      // 向左滚动，增加位置值（内容向右移）
      setTimelinePosition(prev => prev + scrollAmount);
    } else {
      // 向右滚动，减少位置值（内容向左移）
      setTimelinePosition(prev => prev - scrollAmount);
    }
  };
  
  // 点击年份，跳转到对应时间的艺术主义
  const handleYearClick = (year: number) => {
    // 查找最接近该年份的节点
    const sortedByYear = [...sortedNodes].sort((a, b) => 
      Math.abs(a.year - year) - Math.abs(b.year - year)
    );
    
    if (sortedByYear.length > 0) {
      const closestNode = sortedByYear[0];
      
      // 直接高亮相关节点
      setHighlightedNodeId(closestNode.id);
      
      // 调整时间轴位置，让对应的年份居中显示
      const yearPosition = ((year - minYear) / timeRange) * 100;
      const centerOffset = 50 - yearPosition;
      setTimelinePosition(centerOffset);
      
      if (nodeRefs.current[closestNode.id]) {
        // 直接滚动到目标位置，不使用平滑效果
        nodeRefs.current[closestNode.id]?.scrollIntoView({ 
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
    setIsDragging(true);
    setStartX(e.clientX);
    setStartPosition(timelinePosition);
    
    // 防止文本选择
    document.body.style.userSelect = 'none';
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = '';
  };
  
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.userSelect = '';
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    
    // 计算鼠标移动距离
    const dx = e.clientX - startX;
    
    // 计算移动幅度，相对于时间轴宽度的百分比
    const containerWidth = timelineContainerRef.current?.clientWidth || 1000;
    const movePercent = (dx / containerWidth) * 100;
    
    // 更新时间轴位置，拖动系数可以调整拖动的灵敏度
    const dragFactor = 4; // 增加拖动灵敏度因子
    setTimelinePosition(startPosition + movePercent * dragFactor);
  };
  
  // 处理缩略图区域的鼠标拖动
  const handleThumbnailMouseDown = (e: React.MouseEvent<HTMLDivElement>, nodeId: string) => {
    if (!thumbnailsRef.current[nodeId]) return;
    setIsThumbnailDragging(true);
    setThumbnailStartX(e.pageX - thumbnailsRef.current[nodeId]!.offsetLeft);
    setThumbnailScrollLeft(thumbnailsRef.current[nodeId]!.scrollLeft);
    // 防止事件冒泡，避免触发节点点击事件
    e.stopPropagation();
    // 防止文本选择
    document.body.style.userSelect = 'none';
  };
  
  const handleThumbnailMouseUp = () => {
    setIsThumbnailDragging(false);
    document.body.style.userSelect = '';
  };
  
  const handleThumbnailMouseLeave = () => {
    if (isThumbnailDragging) {
      setIsThumbnailDragging(false);
      document.body.style.userSelect = '';
    }
  };
  
  const handleThumbnailMouseMove = (e: React.MouseEvent<HTMLDivElement>, nodeId: string) => {
    if (!isThumbnailDragging || !thumbnailsRef.current[nodeId]) return;
    e.preventDefault();
    const x = e.pageX - thumbnailsRef.current[nodeId]!.offsetLeft;
    const walk = (x - thumbnailStartX) * 3; // 增加滚动速度因子
    thumbnailsRef.current[nodeId]!.scrollLeft = thumbnailScrollLeft - walk;
    // 防止事件冒泡
    e.stopPropagation();
  };

  // 跳转到艺术主义详情页
  const navigateToArtMovement = (artMovementId: string) => {
    // 保存当前位置信息，并记录当前查看的艺术主义ID
    savePositions();
    sessionStorage.setItem('last_viewed_art_movement', artMovementId);
    // 跳转到详情页
    navigate(`/art-movement/${artMovementId}`);
  };

  // 处理图片加载错误，使用备用图片
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
    const target = e.target as HTMLImageElement;
    target.src = `/TestData/1004${index % 10}.jpg`;
    // 避免无限循环加载
    target.onerror = null;
  };

  // 获取缩略图路径，优先使用节点自带图片，否则使用备用图片
  const getThumbnailUrl = (node: any, imgIndex: number) => {
    if (node.images && node.images.length > 0 && node.images[imgIndex]) {
      return node.images[imgIndex];
    }
    return `/TestData/1004${imgIndex % 10}.jpg`;
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
          <div className="relative h-10 mb-2" ref={timelineContainerRef}>
            {/* 年份标记，支持水平滚动和鼠标拖动 */}
            <div 
              className="absolute left-0 right-0 mt-2 hide-scrollbar cursor-grab active:cursor-grabbing" 
              style={{ 
                overflow: 'hidden', 
                height: '30px',
                userSelect: 'none'
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {/* 年份标记背景轨道 */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 transform -translate-y-1/2"></div>
              
              {/* 年份标记 - 使用绝对定位和时间轴位置 */}
              {yearMarks.map((year, index) => (
                <button
                  key={index}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 hover:scale-110 transition-all cursor-pointer px-2 py-1 rounded-full absolute bg-transparent"
                  style={{ 
                    left: `${getPositionPercentage(year)}%`,
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
      <div className="space-y-6 mt-4 overflow-auto" ref={timelineListRef}>
        {sortedNodes.length > 0 ? (
          <>
            {sortedNodes.map((node, index) => (
              <motion.div 
                key={node.id}
                ref={el => nodeRefs.current[node.id] = el}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`flex flex-col items-start gap-2 border-b border-white/10 pb-3 
                  ${highlightedNodeId === node.id ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-2 -mx-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}`}
              >
                {/* 艺术主义时间轴位置标记 */}
                <div className="w-full relative h-12 overflow-hidden">
                  {/* 内容容器，用于横向滚动时间轴 */}
                  <div className="w-full h-full relative">
                    {/* 蓝色线 */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500/20 transform -translate-y-1/2"></div>
                    
                    {/* 时间点标记 */}
                    <div 
                      id={`year-${node.year}`}
                      className="absolute top-1/2 w-0.5 h-6 bg-blue-500 z-10"
                      style={{ 
                        left: `${getPositionPercentage(node.year)}%`,
                        transform: 'translateX(-50%)',
                      }}
                    ></div>
                    
                    {/* 时间点之后的缩略图容器 */}
                    <div 
                      className="absolute top-0 h-full overflow-x-auto cursor-grab active:cursor-grabbing hide-scrollbar bg-transparent"
                      style={{ 
                        left: `${getPositionPercentage(node.year)}%`,
                        right: '0',
                        paddingLeft: '10px',
                        width: '100vw' // 使用视口宽度，确保容器足够宽
                      }}
                      ref={el => thumbnailsRef.current[node.id] = el}
                      onMouseDown={(e) => handleThumbnailMouseDown(e, node.id)}
                      onMouseUp={handleThumbnailMouseUp}
                      onMouseLeave={handleThumbnailMouseLeave}
                      onMouseMove={(e) => handleThumbnailMouseMove(e, node.id)}
                    >
                      <div className="flex items-center h-full gap-2 pr-4 pl-2" style={{ width: 'max-content', paddingRight: '200px' }}>
                        <GripHorizontal className="h-4 w-4 text-white/30 flex-shrink-0" />
                        {/* 缩略图 - 限制数量为5个，提高性能 */}
                        {Array.from({ length: Math.min(5, node.images?.length || 5) }).map((_, imgIndex) => (
                          <div 
                            key={imgIndex} 
                            className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0 border border-white/10 hover:border-blue-400 transition-colors bg-black/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToArtMovement(node.id);
                            }}
                          >
                            <img
                              src={getThumbnailUrl(node, imgIndex)}
                              alt={`${node.title} artwork ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => handleImageError(e, imgIndex)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 艺术主义名称和信息 - 仅显示名称和年份，位置不变 */}
                <div className="w-full pl-4">
                  <div 
                    className="flex items-center gap-2 relative group cursor-pointer"
                    onMouseEnter={(e) => {
                      // 悬停时显示详情
                      const target = e.currentTarget.nextElementSibling as HTMLElement;
                      if (target) target.style.display = 'block';
                    }}
                    onMouseLeave={(e) => {
                      // 离开时隐藏详情
                      const target = e.currentTarget.nextElementSibling as HTMLElement;
                      if (target) target.style.display = 'none';
                    }}
                  >
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 flex items-center gap-1"
                      onClick={() => navigateToArtMovement(node.id)}
                    >
                      {node.title}
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                    
                    <div 
                      className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm cursor-pointer"
                      onClick={() => {
                        // 点击年份，同步调整时间轴位置
                        if (timelineContainerRef.current) {
                          const containerWidth = timelineContainerRef.current.clientWidth;
                          const yearPosition = ((node.year - minYear) / timeRange) * 100;
                          // 计算需要的偏移量使点击的年份居中
                          const centerOffset = 50 - yearPosition;
                          setTimelinePosition(centerOffset);
                        }
                      }}
                    >
                      {node.year}
                    </div>
                  </div>
                  
                  {/* 悬停时显示的详情 */}
                  <div 
                    className="hidden mt-2 bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-white/10 shadow-lg z-20 absolute w-[500px] max-w-[90vw]"
                  >
                    <p className="text-sm text-gray-300 mb-3">
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
                </div>
              </motion.div>
            ))}
            {/* 底部额外留白空间 */}
            <div className="h-40"></div>
          </>
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