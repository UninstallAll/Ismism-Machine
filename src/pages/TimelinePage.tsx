import TimelineView from '../components/TimelineView';

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

  return (
    <div className="page-container">
      {/* 标题栏 */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">时间线视图</h1>
        
        <div className="flex space-x-2">
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
        <TimelineView items={timelineItems} />
      </div>
    </div>
  );
};

export default TimelinePage; 