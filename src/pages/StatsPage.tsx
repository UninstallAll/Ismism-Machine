import StatsDisplay from '../components/StatsDisplay';

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

interface DecadeStats {
  decade: string;
  worksCount: number;
}

const StatsPage = () => {
  // 这里可以从API或JSON文件获取统计数据
  const topArtists: ArtistStats[] = [];
  const topStyles: StyleStats[] = [];
  const decadeData: DecadeStats[] = [];

  return (
    <div className="page-container">
      {/* 标题栏 */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">数据统计分析</h1>
        
        <div className="flex space-x-2">
          <select className="px-3 py-1.5 border-2 border-gray-400 rounded text-sm hidden sm:block">
            <option>全部数据</option>
            <option>按地区</option>
            <option>按年代</option>
            <option>按流派</option>
          </select>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="p-4">
        <StatsDisplay 
          topArtists={topArtists} 
          topStyles={topStyles} 
          decadeData={decadeData}
        />
      </div>
    </div>
  );
};

export default StatsPage; 