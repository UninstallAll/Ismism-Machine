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
    <div className="flex flex-col">
      {/* 标题栏 */}
      <div className="flex justify-between items-center p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">{artStyle.year}</span>
          <h2 className="text-xl font-semibold text-white">
            {artStyle.title}
          </h2>
          <span className="text-xs text-white/60">{artStyle.styleMovement}</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex overflow-hidden">
        {/* 左侧内容区 */}
        <div className="w-3/5 p-3 flex flex-col">
          <Tab.Group onChange={setActiveTab}>
            <Tab.List className="flex space-x-1 border-b border-white/10 mb-3">
              {tabs.map((tab) => (
                <Tab
                  key={tab.key}
                  className={({ selected }: { selected: boolean }) =>
                    `flex items-center gap-1 px-3 py-2 text-sm border-b-2 outline-none ${
                      selected 
                        ? 'border-blue-500 text-white' 
                        : 'border-transparent text-white/60 hover:text-white/80'
                    }`
                  }
                >
                  {tab.icon}
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2 flex-1">
              <Tab.Panel className="max-w-none h-full overflow-auto pr-2 max-h-[300px]">
                <p className="text-white/80 leading-relaxed">{artStyle.description}</p>
                
                {artStyle.tags && artStyle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {artStyle.tags.map((tag, index) => (
                      <span key={index} className="text-xs text-white/60">
                        {tag}
                        {index < artStyle.tags!.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </Tab.Panel>
              <Tab.Panel className="h-full overflow-auto pr-2 max-h-[300px]">
                <ul className="space-y-2">
                  {artStyle.artists.map((artist, index) => (
                    <li key={index} className="flex items-center gap-2 p-1">
                      <span>{artist}</span>
                    </li>
                  ))}
                </ul>
              </Tab.Panel>
              <Tab.Panel className="h-full overflow-auto pr-2 max-h-[300px]">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm text-white/60 mb-1">受影响自</h3>
                    <div className="flex flex-wrap gap-2">
                      {artStyle.influencedBy.map((style, index) => (
                        <span key={index} className="text-sm text-white/80">
                          {style}
                          {index < artStyle.influencedBy.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm text-white/60 mb-1">影响了</h3>
                    <div className="flex flex-wrap gap-2">
                      {artStyle.influences.map((style, index) => (
                        <span key={index} className="text-sm text-white/80">
                          {style}
                          {index < artStyle.influences.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
        
        {/* 右侧艺术作品展示 */}
        <div className="w-2/5 p-3 overflow-y-auto max-h-[350px]">
          <h3 className="text-sm text-white/60 mb-2 sticky top-0 bg-black/50 py-1 z-10">代表作品</h3>
          <div className="grid grid-cols-2 gap-2">
            {getArtworkImages().map((image, index) => (
              <div 
                key={index}
                className="aspect-square bg-black/30 rounded overflow-hidden"
              >
                <img 
                  src={image} 
                  alt={`${artStyle.title}作品${index + 1}`}
                  className="w-full h-full object-cover" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 