import React from 'react';

interface ArtistStats {
  id: string;
  name: string;
  worksCount: number;
  years: string;
  dominantStyles: string[];
}

interface StyleStats {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  artistsCount: number;
  worksCount: number;
  influences: string[];
}

interface StatsDisplayProps {
  topArtists: ArtistStats[];
  topStyles: StyleStats[];
  decadeData: { decade: string; worksCount: number }[];
}

interface StatItem {
  label: string;
  value: number;
  color: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-3xl font-bold mt-2 mb-2">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="p-3 rounded-full bg-blue-50 text-blue-500">
        {icon}
      </div>
    </div>
  </div>
);

const StatsDisplay: React.FC<StatsDisplayProps> = ({ topArtists, topStyles, decadeData }) => {
  // 示例数据
  const movementCountByPeriod = [
    { label: '1800-1850', value: 8, color: '#3b82f6' },
    { label: '1850-1900', value: 15, color: '#10b981' },
    { label: '1900-1950', value: 24, color: '#f59e0b' },
    { label: '1950-2000', value: 18, color: '#ef4444' },
    { label: '2000-现在', value: 12, color: '#8b5cf6' },
  ];
  
  const topArtistsData = [
    { name: '毕加索', count: 78, percentage: 78 },
    { name: '莫奈', count: 72, percentage: 72 },
    { name: '梵高', count: 68, percentage: 68 },
    { name: '塞尚', count: 56, percentage: 56 },
    { name: '达利', count: 45, percentage: 45 },
  ];
  
  // 图表元素渲染
  const renderBarChart = (data: StatItem[]) => {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className="flex flex-col space-y-3">
        {data.map(item => (
          <div key={item.label} className="flex items-center">
            <span className="text-sm w-24 text-gray-600">{item.label}</span>
            <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 flex items-center pl-3"
                style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color 
                }}
              >
                <span className="text-xs font-medium text-white">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-8">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="艺术主义总数" 
          value={77} 
          description="记录在数据库中的艺术流派总数" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard 
          title="艺术家总数" 
          value={486} 
          description="记录在数据库中的艺术家总数" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard 
          title="作品总数" 
          value={3824} 
          description="记录在数据库中的艺术作品总数" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard 
          title="新增条目" 
          value={124} 
          description="过去 30 天内添加的新条目" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        />
      </div>
  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 各时期艺术主义数量 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">按时期划分的艺术主义数量</h2>
          {renderBarChart(movementCountByPeriod)}
        </div>
  
        {/* 作品数量最多的艺术家 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">作品数量最多的艺术家</h2>
          <div className="space-y-4">
            {topArtistsData.map(artist => (
              <div key={artist.name} className="flex flex-col">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{artist.name}</span>
                  <span className="text-sm text-gray-500">{artist.count} 件作品</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${artist.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsDisplay; 