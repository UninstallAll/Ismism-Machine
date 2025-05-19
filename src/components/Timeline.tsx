import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { useTimelineStore } from '../store/timelineStore';
import { useSearchParams, useLocation } from 'react-router-dom';

const Timeline: React.FC = () => {
  const { nodes: timelineNodes, fetchNodes } = useTimelineStore();
  const [searchTerm, setSearchTerm] = useState('');
  const timelineRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  
  // 节点引用，用于滚动到特定节点
  const nodeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 加载时间线节点
  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  // 从URL参数获取艺术主义名称并设置搜索条件或滚动到该节点
  useEffect(() => {
    const styleParam = searchParams.get('style');
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

      {/* 顶部时间轴 */}
      <div className="relative mb-8 mt-4" ref={timelineRef}>
        {/* 时间轴线 */}
        <div className="h-1 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 w-full"></div>
        
        {/* 年份标记 */}
        <div className="flex justify-between mt-2">
          <div className="text-xs text-blue-400">{minYear}</div>
          <div className="text-xs text-blue-400">{Math.floor(minYear + timeRange * 0.25)}</div>
          <div className="text-xs text-blue-400">{Math.floor(minYear + timeRange * 0.5)}</div>
          <div className="text-xs text-blue-400">{Math.floor(minYear + timeRange * 0.75)}</div>
          <div className="text-xs text-blue-400">{maxYear}</div>
        </div>
      </div>

      {/* 艺术主义行列表 */}
      <div className="space-y-6">
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
                  
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {node.title}
                  </h3>
                  
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
                
                <div className="mt-3 pt-2 border-t border-white/10">
                  <span className="text-sm font-medium text-purple-400">
                    {node.styleMovement}
                  </span>
                </div>
              </div>
              
              {/* 右侧：艺术主义图片网格 */}
              <div className="w-full md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-2">
                {/* 显示该艺术主义的图片 */}
                {(node.images && node.images.length > 0 ? node.images.slice(0, 4) : [...Array(4)].map((_, i) => 
                  `/TestData/${10001 + ((index * 4 + i) % 30)}.jpg`
                )).map((imageUrl, imgIndex) => (
                  <div key={imgIndex} className="aspect-square rounded-md overflow-hidden">
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