import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';
import { X, Info, Users, Lightbulb } from 'lucide-react';
import { IArtStyle } from '../types/art';

interface ArtMovementDetailProps {
  artStyle: IArtStyle;
  onClose?: () => void;
}

export default function ArtMovementDetail({ artStyle, onClose }: ArtMovementDetailProps) {
  const [activeTab, setActiveTab] = useState(0);

  // 使用标签页分类显示内容
  const tabs = [
    { key: 'description', name: '描述', icon: <Info className="w-4 h-4" /> },
    { key: 'artists', name: '艺术家', icon: <Users className="w-4 h-4" /> },
    { key: 'influences', name: '影响', icon: <Lightbulb className="w-4 h-4" /> },
  ];

  // 获取作品图片
  const getArtworkImages = () => {
    if (artStyle.images && artStyle.images.length > 0) {
      return artStyle.images;
    }
    
    // 如果没有提供图片，生成8张测试图片
    return Array.from({ length: 8 }, (_, i) => 
      artStyle.imageUrl || `/TestData/${10001 + ((i + artStyle.year) % 30)}.jpg`
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* 标题栏 */}
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/60">{artStyle.year}</span>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {artStyle.title}
          </h2>
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
            {artStyle.styleMovement}
          </span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧内容区 - 不再允许独立滚动 */}
        <div className="w-3/5 p-4 flex flex-col">
          <Tab.Group onChange={setActiveTab}>
            <Tab.List className="flex space-x-1 border-b border-white/10 mb-4">
              {tabs.map((tab) => (
                <Tab
                  key={tab.key}
                  className={({ selected }: { selected: boolean }) =>
                    `flex items-center gap-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors outline-none ${
                      selected 
                        ? 'border-blue-500 text-blue-400' 
                        : 'border-transparent text-white/60 hover:text-white/80'
                    }`
                  }
                >
                  {tab.icon}
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2 flex-1 overflow-auto">
              <Tab.Panel className="prose prose-invert max-w-none h-full">
                <p className="text-white/80 leading-relaxed">{artStyle.description}</p>
              </Tab.Panel>
              <Tab.Panel className="h-full overflow-auto">
                <ul className="space-y-2">
                  {artStyle.artists.map((artist, index) => (
                    <li key={index} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                        {artist.charAt(0)}
                      </div>
                      <span>{artist}</span>
                    </li>
                  ))}
                </ul>
              </Tab.Panel>
              <Tab.Panel className="h-full overflow-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white/60 mb-2">受影响自</h3>
                    <div className="flex flex-wrap gap-2">
                      {artStyle.influencedBy.map((style, index) => (
                        <span key={index} className="px-2 py-1 bg-white/5 text-white/80 text-xs rounded-full">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white/60 mb-2">影响了</h3>
                    <div className="flex flex-wrap gap-2">
                      {artStyle.influences.map((style, index) => (
                        <span key={index} className="px-2 py-1 bg-white/5 text-white/80 text-xs rounded-full">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
        
        {/* 右侧艺术作品展示 - 允许独立滚动 */}
        <div className="w-2/5 bg-black/20 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-white/60 mb-3 sticky top-0 bg-black/60 py-2 backdrop-blur-sm z-10">代表作品</h3>
          <div className="grid grid-cols-2 gap-3">
            {getArtworkImages().map((image, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="aspect-square bg-black/30 rounded-lg overflow-hidden group"
              >
                <img 
                  src={image} 
                  alt={`${artStyle.title}作品${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 