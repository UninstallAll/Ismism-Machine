import { useState } from 'react';
import TimelineView from '../components/TimelineView';
import Timeline from '../components/Timeline/Timeline';
import { TimelineEvent } from '../components/Timeline/types';

interface TimelineItem {
  id: string;
  title: string;
  year: number;
  description: string;
  imageUrl: string;
  artists: string[];
  styleMovement: string;
  influences: string[];
  influencedBy: string[];
}

const TimelinePage = () => {
  // 这里可以从API或JSON文件获取时间线数据
  const timelineItems: TimelineItem[] = [];
  const [viewMode, setViewMode] = useState<'classic' | 'interactive'>('interactive');
  
  // 交互式时间线数据
  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      date: new Date('2023-01-15'),
      title: '项目启动',
      description: '团队开始讨论项目计划和目标',
      category: '规划'
    },
    {
      id: '2',
      date: new Date('2023-02-28'),
      title: '需求分析',
      description: '完成用户需求分析和功能规格说明',
      category: '分析'
    },
    {
      id: '3',
      date: new Date('2023-04-10'),
      title: '设计阶段',
      description: '完成UI/UX设计和原型开发',
      category: '设计'
    },
    {
      id: '4',
      date: new Date('2023-06-05'),
      title: '开发里程碑',
      description: '完成核心功能开发和单元测试',
      category: '开发'
    },
    {
      id: '5',
      date: new Date('2023-07-20'),
      title: '测试阶段',
      description: '进行系统测试和用户验收测试',
      category: '测试'
    },
    {
      id: '6',
      date: new Date('2023-09-01'),
      title: '产品发布',
      description: '正式发布产品并部署到生产环境',
      category: '发布'
    },
    {
      id: '7',
      date: new Date('2023-10-15'),
      title: '用户反馈',
      description: '收集和分析用户反馈，规划后续迭代',
      category: '反馈'
    },
    {
      id: '8',
      date: new Date('2023-12-01'),
      title: '版本更新',
      description: '发布新版本，包含用户反馈的改进',
      category: '更新'
    }
  ];

  return (
    <div className="page-container">
      {/* 标题栏 */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">时间线视图</h1>
        
        <div className="flex space-x-2">
          <div className="mr-4">
            <button 
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1.5 text-sm rounded-l-md ${viewMode === 'interactive' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'}`}
            >
              交互式
            </button>
            <button 
              onClick={() => setViewMode('classic')}
              className={`px-3 py-1.5 text-sm rounded-r-md ${viewMode === 'classic' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'}`}
            >
              经典
            </button>
          </div>
          
          <select className="px-3 py-1.5 border-2 border-gray-400 rounded text-sm hidden sm:block">
            <option>全部时期</option>
            <option>文艺复兴</option>
            <option>现代艺术</option>
            <option>当代艺术</option>
          </select>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="p-4">
        {viewMode === 'classic' ? (
          <TimelineView items={timelineItems} />
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <Timeline 
              events={timelineEvents} 
              height={400} 
              className="mt-2"
            />
            <div className="mt-8 text-center text-gray-600">
              <p>使用鼠标左右拖动时间线查看不同时间点的项目进展</p>
              <p className="text-sm mt-2">悬停在事件上可以查看详细信息</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage; 