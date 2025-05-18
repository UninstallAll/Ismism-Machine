import { useState } from 'react';
import DraggableDemo from './DraggableDemo';
import Timeline from './Timeline';

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab = ({ label, isActive, onClick }: TabProps) => (
  <button
    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
      isActive 
        ? 'bg-white border-t border-l border-r border-gray-300 text-blue-600' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

const DragDemo = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'timeline'>('basic');

  return (
    <div className="w-full">
      <div className="border-b border-gray-300 flex">
        <Tab 
          label="基础拖拽演示" 
          isActive={activeTab === 'basic'} 
          onClick={() => setActiveTab('basic')} 
        />
        <Tab 
          label="时间线拖拽" 
          isActive={activeTab === 'timeline'} 
          onClick={() => setActiveTab('timeline')} 
        />
      </div>

      <div className="mt-4 animate-fadeIn">
        {activeTab === 'basic' && (
          <div>
            <h2 className="text-xl font-bold mb-4">基础拖拽组件</h2>
            <p className="mb-4 text-gray-600">
              这个演示展示了基本的拖拽功能，包括边界检测和视觉反馈。
            </p>
            <DraggableDemo />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <h2 className="text-xl font-bold mb-4">时间线拖拽演示</h2>
            <p className="mb-4 text-gray-600">
              这个演示展示了如何使用拖拽功能构建交互式时间线。
              节点可以自由拖动，并且位置会保存到状态中。
            </p>
            <Timeline />
          </div>
        )}
      </div>
    </div>
  );
};

export default DragDemo; 