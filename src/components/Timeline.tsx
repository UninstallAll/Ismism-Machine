import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, ArrowRight, X, GripHorizontal, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { useTimelineStore } from '../store/timelineStore';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import ArtMovementDetail from './ArtMovementDetail';
import { useToast } from "../components/ui/use-toast";
import { IArtStyle } from '../types/art';

// 开发模式下启用性能分析
const isDev = import.meta.env.DEV;
const logPerformance = (label: string, startTime: number) => {
  if (isDev) {
    console.log(`[Performance] ${label}: ${performance.now() - startTime}ms`);
  }
};

// 添加隐藏滚动条的CSS样式
const hideScrollbarStyle = {
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  'scrollbarWidth': 'none',
  '-ms-overflow-style': 'none',
};

// 添加CSS样式到文档头部，控制悬停效果
const addHoverStyles = () => {
  // 检查是否已经存在该样式
  if (!document.getElementById('timeline-hover-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'timeline-hover-styles';
    styleElement.textContent = `
      .hover-trigger:hover + .hover-target {
        display: block !important;
      }
      .hover-target:hover {
        display: block !important;
      }
    `;
    document.head.appendChild(styleElement);
  }
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
  
  // 当前选中的艺术主义节点
  const [selectedNode, setSelectedNode] = useState<IArtStyle | null>(null);
  
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
  
  // 艺术主义名称行拖动状态
  // const [isNameRowDragging, setIsNameRowDragging] = useState(false);
  // const [nameRowStartX, setNameRowStartX] = useState(0);
  // const [nameRowStartPosition, setNameRowStartPosition] = useState(0);
  // const nameRowRef = useRef<HTMLDivElement>(null);

  // 图片缓存映射，减少重复请求
  const imgCache = useRef<Map<string, string>>(new Map());

  // 使用记忆化优化筛选和排序后的节点列表
  const sortedNodes = React.useMemo(() => {
    // 筛选节点
    const filteredNodes = timelineNodes.filter(node => 
      searchTerm === '' || 
      node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.artists.some(artist => artist.toLowerCase().includes(searchTerm.toLowerCase())) ||
      node.styleMovement.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 排序节点
    return [...filteredNodes].sort((a, b) => a.year - b.year);
  }, [timelineNodes, searchTerm]);

  // 计算时间轴的最小和最大年份
  const { minYear, maxYear, timeRange } = React.useMemo(() => {
    const min = sortedNodes.length > 0 ? sortedNodes[0].year : 1800;
    const max = sortedNodes.length > 0 ? sortedNodes[sortedNodes.length - 1].year : 2023;
    return { 
      minYear: min, 
      maxYear: max, 
      timeRange: max - min 
    };
  }, [sortedNodes]);
  
  // 加载时间线节点
  useEffect(() => {
    fetchNodes();
    
    // 添加悬停样式
    addHoverStyles();
    
    // 预加载常用的图片资源
    const preloadImages = () => {
      const imagesToPreload = Array.from({ length: 10 }).map((_, i) => `/TestData/1004${i}.jpg`);
      imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };
    preloadImages();
    
    // 组件卸载时清理样式
    return () => {
      const styleElement = document.getElementById('timeline-hover-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [fetchNodes]);

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
  const getPositionPercentage = useCallback((year: number) => {
    if (isDev) {
      const startTime = performance.now();
      // 基础位置百分比
      const basePercentage = ((year - minYear) / timeRange) * 100;
      // 应用时间轴位置偏移
      const result = basePercentage + timelinePosition;
      
      // 仅在大量调用时记录性能数据（避免日志过多）
      if (Math.random() < 0.01) { 
        logPerformance("getPositionPercentage", startTime);
      }
      
      return result;
    } else {
      // 基础位置百分比
      const basePercentage = ((year - minYear) / timeRange) * 100;
      // 应用时间轴位置偏移
      return basePercentage + timelinePosition;
    }
  }, [minYear, timeRange, timelinePosition]);
  
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
  
  const handleThumbnailMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
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

  // 处理艺术主义时间线点击
  const handleArtMovementLineClick = (node: IArtStyle, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 拖动过程中不触发点击
    if (isDragging || isThumbnailDragging) {
      return;
    }
    
    // 设置当前选中节点
    const isSelecting = node.id !== selectedNode?.id;
    setSelectedNode(isSelecting ? node : null);
    
    // 保存当前位置
    savePositions();
    
    // 如果是选中了节点，调整时间轴位置使得节点的年份点位于时间轴上
    if (isSelecting) {
      // 计算需要的偏移量使该艺术主义的年份点位于时间轴可见位置
      const yearPosition = ((node.year - minYear) / timeRange) * 100;
      const centerOffset = 50 - yearPosition;
      setTimelinePosition(centerOffset);
      
      // 使用两阶段滚动：先滚动到时间点位置，再滚动到详情中心位置
      setTimeout(() => {
        // 找到时间点的引用元素
        const timePointElement = document.getElementById(`year-${node.year}`);
        
        // 找到时间轴元素和其容器
        const timelineTrack = document.querySelector('.absolute.top-1\\/2.left-0.right-0.h-0\\.5.bg-white\\/5');
        const timelineContainer = timelineRef.current;
        
        // 第一阶段：立即滚动到时间点与时间轴线对齐的位置
        if (timePointElement && timelineTrack && timelineContainer) {
          const timePointRect = timePointElement.getBoundingClientRect();
          const trackRect = timelineTrack.getBoundingClientRect();
          const containerRect = timelineContainer.getBoundingClientRect();
          
          // 计算时间轴容器底部的位置
          const timelineBottom = containerRect.bottom;
          
          // 计算让时间点完全对齐到时间轴线所需的滚动位置
          const alignScrollPosition = window.pageYOffset + trackRect.top - timePointRect.height/2;
          
          // 立即滚动到对齐位置（不使用平滑滚动）
          window.scrollTo({
            top: alignScrollPosition,
            behavior: 'auto'
          });
          
          // 第二阶段：等待详情元素渲染后，滚动到视觉最佳位置
          setTimeout(() => {
            // 等待动画完成后再获取元素，确保获取到完全展开的元素
            const detailElement = nodeRefs.current[node.id]?.querySelector('.bg-black\\/30.rounded-lg');
            const nameElement = nodeRefs.current[node.id]?.querySelector('.text-lg.font-semibold');
            
            if (detailElement && nameElement) {
              const detailRect = detailElement.getBoundingClientRect();
              const nameRect = nameElement.getBoundingClientRect();
              const viewportHeight = window.innerHeight;
              
              // 重新获取时间轴线、容器和时间点位置（因为页面已经滚动）
              const updatedTrackRect = timelineTrack.getBoundingClientRect();
              const updatedContainerRect = timelineContainer.getBoundingClientRect();
              const updatedTimePointRect = timePointElement.getBoundingClientRect();
              
              // 确保时间点仍然与时间轴对齐
              const updatedAlignPosition = window.pageYOffset + updatedTrackRect.top - updatedTimePointRect.height/2;
              
              // 计算详情元素的中心位置
              const detailCenter = detailRect.top + detailRect.height / 2;
              
              // 计算视口中心位置
              const viewportCenter = window.scrollY + viewportHeight / 2;
              
              // 计算需要滚动的距离使得详情元素居中显示
              const detailCenterOffset = detailCenter - viewportCenter;
              
              // 计算名称元素顶部与时间轴底部的距离
              const nameToTimelineDistance = nameRect.top - updatedContainerRect.bottom;
              
              // 如果名称会移动到高于时间轴的位置，计算最大允许的上移距离
              let maxUpwardOffset = 0;
              if (nameToTimelineDistance < 20) { // 保持至少20px的间距
                maxUpwardOffset = nameToTimelineDistance - 20;
              }
              
              // 默认情况下，尝试将详情完全居中
              let finalScrollPosition = window.scrollY + detailCenterOffset;
              
              // 如果居中会导致标题靠近或高于时间轴，则进行限制
              if (finalScrollPosition < updatedAlignPosition + maxUpwardOffset) {
                finalScrollPosition = updatedAlignPosition + maxUpwardOffset;
              }
              
              // 平滑滚动到最终位置
              window.scrollTo({
                top: Math.max(finalScrollPosition, 0), // 确保不会滚动到负值位置
                behavior: 'smooth'
              });
            }
          }, 300); // 增加延迟，确保详情动画完全展开
        }
      }, 50); // 等待时间轴位置调整
    }
  };
  
  // 单独处理时间点标记的点击
  const handleTimePointClick = (node: IArtStyle, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 拖动过程中不触发点击
    if (isDragging || isThumbnailDragging) {
      return;
    }
    
    // 设置当前选中节点
    const isSelecting = node.id !== selectedNode?.id;
    setSelectedNode(isSelecting ? node : null);
    
    // 如果该艺术主义有图片，显示第一张图片的大图预览
    if (node.images && node.images.length > 0) {
      const imgIndex = 0; // 默认显示第一张图片
      const image = getThumbnailUrl(node, imgIndex);
      const artistIndex = imgIndex % node.artists.length;
      setPreviewImage({
        src: image,
        title: node.title,
        artist: node.artists[artistIndex] || '未知艺术家',
        year: node.year
      });
    }
    
    // 保存当前位置
    savePositions();
    
    // 如果是选中了节点，调整时间轴位置使得节点的年份点位于时间轴上
    if (isSelecting) {
      // 计算需要的偏移量使该艺术主义的年份点位于时间轴可见位置
      const yearPosition = ((node.year - minYear) / timeRange) * 100;
      const centerOffset = 50 - yearPosition;
      setTimelinePosition(centerOffset);
      
      // 使用两阶段滚动：先滚动到时间点位置，再滚动到详情中心位置
      setTimeout(() => {
        // 找到时间点的引用元素
        const timePointElement = document.getElementById(`year-${node.year}`);
        
        // 找到时间轴元素和其容器
        const timelineTrack = document.querySelector('.absolute.top-1\\/2.left-0.right-0.h-0\\.5.bg-white\\/5');
        const timelineContainer = timelineRef.current;
        
        // 第一阶段：立即滚动到时间点与时间轴线对齐的位置
        if (timePointElement && timelineTrack && timelineContainer) {
          const timePointRect = timePointElement.getBoundingClientRect();
          const trackRect = timelineTrack.getBoundingClientRect();
          const containerRect = timelineContainer.getBoundingClientRect();
          
          // 计算时间轴容器底部的位置
          const timelineBottom = containerRect.bottom;
          
          // 计算让时间点完全对齐到时间轴线所需的滚动位置
          const alignScrollPosition = window.pageYOffset + trackRect.top - timePointRect.height/2;
          
          // 立即滚动到对齐位置（不使用平滑滚动）
          window.scrollTo({
            top: alignScrollPosition,
            behavior: 'auto'
          });
          
          // 第二阶段：等待详情元素渲染后，滚动到视觉最佳位置
          setTimeout(() => {
            // 等待动画完成后再获取元素，确保获取到完全展开的元素
            const detailElement = nodeRefs.current[node.id]?.querySelector('.bg-black\\/30.rounded-lg');
            const nameElement = nodeRefs.current[node.id]?.querySelector('.text-lg.font-semibold');
            
            if (detailElement && nameElement) {
              const detailRect = detailElement.getBoundingClientRect();
              const nameRect = nameElement.getBoundingClientRect();
              const viewportHeight = window.innerHeight;
              
              // 重新获取时间轴线、容器和时间点位置（因为页面已经滚动）
              const updatedTrackRect = timelineTrack.getBoundingClientRect();
              const updatedContainerRect = timelineContainer.getBoundingClientRect();
              const updatedTimePointRect = timePointElement.getBoundingClientRect();
              
              // 确保时间点仍然与时间轴对齐
              const updatedAlignPosition = window.pageYOffset + updatedTrackRect.top - updatedTimePointRect.height/2;
              
              // 计算详情元素的中心位置
              const detailCenter = detailRect.top + detailRect.height / 2;
              
              // 计算视口中心位置
              const viewportCenter = window.scrollY + viewportHeight / 2;
              
              // 计算需要滚动的距离使得详情元素居中显示
              const detailCenterOffset = detailCenter - viewportCenter;
              
              // 计算名称元素顶部与时间轴底部的距离
              const nameToTimelineDistance = nameRect.top - updatedContainerRect.bottom;
              
              // 如果名称会移动到高于时间轴的位置，计算最大允许的上移距离
              let maxUpwardOffset = 0;
              if (nameToTimelineDistance < 20) { // 保持至少20px的间距
                maxUpwardOffset = nameToTimelineDistance - 20;
              }
              
              // 默认情况下，尝试将详情完全居中
              let finalScrollPosition = window.scrollY + detailCenterOffset;
              
              // 如果居中会导致标题靠近或高于时间轴，则进行限制
              if (finalScrollPosition < updatedAlignPosition + maxUpwardOffset) {
                finalScrollPosition = updatedAlignPosition + maxUpwardOffset;
              }
              
              // 平滑滚动到最终位置
              window.scrollTo({
                top: Math.max(finalScrollPosition, 0), // 确保不会滚动到负值位置
                behavior: 'smooth'
              });
            }
          }, 300); // 增加延迟，确保详情动画完全展开
        }
      }, 50); // 等待时间轴位置调整
    }
  };
  
  // 关闭艺术主义详情
  const handleCloseDetail = () => {
    setSelectedNode(null);
    setHighlightedNodeId(null);
  };

  // 跳转到艺术主义详情页（保留原来的功能）
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
    const fallbackSrc = `/TestData/1004${index % 10}.jpg`;
    
    // 如果缓存中已有此图片的替代路径，直接使用
    const originalSrc = target.getAttribute('data-original-src') || '';
    if (originalSrc && imgCache.current.has(originalSrc)) {
      target.src = imgCache.current.get(originalSrc) || fallbackSrc;
    } else {
      // 否则设置为默认备用图片
      target.src = fallbackSrc;
      
      // 记录原图路径到备用图片路径的映射
      if (originalSrc) {
        imgCache.current.set(originalSrc, fallbackSrc);
      }
    }
    
    // 避免无限循环加载
    target.onerror = null;
  };

  // 获取缩略图路径，优先使用节点自带图片，否则使用备用图片
  const getThumbnailUrl = (node: IArtStyle, imgIndex: number) => {
    // 检查是否已经有缓存的路径
    const nodeImgKey = `${node.id}-${imgIndex}`;
    if (imgCache.current.has(nodeImgKey)) {
      return imgCache.current.get(nodeImgKey) as string;
    }
    
    // 没有缓存，尝试使用节点的图片
    if (node.images && node.images.length > 0 && node.images[imgIndex]) {
      const imgUrl = node.images[imgIndex];
      imgCache.current.set(nodeImgKey, imgUrl);
      return imgUrl;
    }
    
    // 使用备用图片
    const fallbackSrc = `/TestData/1004${imgIndex % 10}.jpg`;
    imgCache.current.set(nodeImgKey, fallbackSrc);
    return fallbackSrc;
  };

  const { toast } = useToast();

  // 处理"现在"按钮点击
  const handleNowClick = () => {
    // ... existing code ...
  };

  const [previewImage, setPreviewImage] = useState<{src: string, title: string, artist: string, year: number} | null>(null);

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
            
            {selectedNode && (
              <Button 
                variant="outline"
                size="sm"
                onClick={handleCloseDetail}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-sm"
              >
                <X className="h-3.5 w-3.5" />
                关闭详情
              </Button>
            )}
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
                    transform: 'translateX(-50%)',
                    top: '0',
                    marginTop: '2px'
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

      {/* 选中的艺术主义详情或艺术主义行列表 */}
      <AnimatePresence mode="wait">
        {sortedNodes.length > 0 ? (
          <motion.div 
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 mt-4 overflow-auto"
            ref={timelineListRef}
          >
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
                    
                    {/* 时间点标记 - 可点击显示详情 */}
                    <div 
                      id={`year-${node.year}`}
                      className="absolute top-1/2 w-3 h-3 bg-blue-500 rounded-full z-10 cursor-pointer hover:bg-blue-400 hover:scale-125 transition-all"
                      style={{ 
                        left: `${getPositionPercentage(node.year)}%`,
                        transform: 'translate(-50%, -50%)',
                        marginTop: '0' // 确保与时间轴线对齐
                      }}
                      onClick={(e) => handleTimePointClick(node, e)}
                    ></div>
                  
                    {/* 时间点之后的缩略图容器 */}
                    <div 
                      className="absolute top-0 h-full overflow-x-auto cursor-grab active:cursor-grabbing hide-scrollbar bg-transparent group hover:bg-blue-500/5 transition-colors rounded-md"
                      style={{ 
                        left: `${getPositionPercentage(node.year)}%`,
                        right: '0',
                        paddingLeft: '10px',
                        width: '100vw' // 使用视口宽度，确保容器足够宽
                      }}
                      ref={el => thumbnailsRef.current[node.id] = el}
                      onMouseDown={(e) => handleThumbnailMouseDown(e, node.id)}
                      onMouseUp={handleThumbnailMouseUp}
                      onMouseLeave={(e) => handleThumbnailMouseLeave(e)}
                      onMouseMove={(e) => handleThumbnailMouseMove(e, node.id)}
                    >
                      <div className="flex items-center h-full gap-2 pr-4 pl-2" style={{ width: 'max-content', paddingRight: '200px' }}>
                        <GripHorizontal className="h-4 w-4 text-white/30 group-hover:text-white/60 flex-shrink-0 transition-colors" />
                        {/* 缩略图 - 限制数量为5个，提高性能 */}
                        {Array.from({ length: Math.min(5, node.images?.length || 5) }).map((_, imgIndex) => (
                          <div 
                            key={imgIndex} 
                            className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0 border border-white/10 hover:border-blue-400 transition-colors bg-black/20 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              
                              // 打开图片预览而不是导航
                              const image = getThumbnailUrl(node, imgIndex);
                              const artistIndex = imgIndex % node.artists.length;
                              setPreviewImage({
                                src: image,
                                title: node.title,
                                artist: node.artists[artistIndex] || '未知艺术家',
                                year: node.year + (imgIndex % 10)
                              });
                            }}
                          >
                            <img
                              src={getThumbnailUrl(node, imgIndex)}
                              alt={`${node.title} artwork ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              data-original-src={node.images?.[imgIndex] || ''}
                              onError={(e) => handleImageError(e, imgIndex)}
                            />
                          </div>
                        ))}
                  </div>
                </div>
                  </div>
                </div>
                
                {/* 艺术主义名称和信息 - 仅显示名称和年份，位置不变 */}
                <div className="w-full pl-4 relative">
                  {/* 名称和年份行 */}
                  <div 
                    className="flex items-center gap-3 relative group px-3 py-2 hover:bg-blue-500/10 rounded-md transition-colors cursor-pointer hover-trigger"
                    onClick={(e) => {
                      // 点击整行时在页面内显示详情
                      // 除非点击的是年份按钮
                      if (!(e.target as HTMLElement).closest('.year-btn')) {
                        handleArtMovementLineClick(node, e);
                      }
                    }}
                  >
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation(); // 防止触发父元素的点击事件
                        handleArtMovementLineClick(node, e);
                      }}
                    >
                      {node.title}
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                    
                    <div 
                      className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm cursor-pointer year-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // 防止触发父元素的点击事件
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
                  
                  {/* 艺术主义详情展开区 - 仅当选中时显示 */}
                  {selectedNode && selectedNode.id === node.id && (
                    <motion.div 
                      key={`detail-inline`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 mb-4 w-full"
                    >
                      <div className="bg-black/30 rounded-lg overflow-hidden">
                        <ArtMovementDetail artStyle={selectedNode} onClose={handleCloseDetail} />
                      </div>
                    </motion.div>
                  )}
              </div>
            </motion.div>
            ))}
            {/* 底部额外留白空间 */}
            <div className="h-40"></div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-5 bg-[rgba(15,15,20,0.7)] backdrop-blur-sm border border-white/10 rounded-lg shadow-glow-sm mb-4">
              <Search className="h-10 w-10 text-gray-400 mb-2" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">未找到时间线节点</h3>
            <p className="text-gray-500">请尝试不同的搜索条件</p>
          </div>
        )}
      </AnimatePresence>
      
      {/* 大图预览弹窗 */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-4xl max-h-[80vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={previewImage.src} 
                alt={`${previewImage.title} 作品详图`} 
                className="max-h-[80vh] max-w-full object-contain rounded-md" 
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 backdrop-blur-sm">
                <h3 className="text-white font-medium">
                  {previewImage.title}
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  {previewImage.artist} (c. {previewImage.year})
                </p>
                <button 
                  className="absolute top-2 right-2 text-white/70 hover:text-white"
                  onClick={() => setPreviewImage(null)}
                >
                  <X className="w-6 h-6" />
                </button>
      </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timeline; 