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

interface TimelineViewProps {
  items: TimelineItem[];
}

const TimelineView = ({ items }: TimelineViewProps) => {
  // 按年份排序
  const sortedItems = [...items].sort((a, b) => a.year - b.year);
  
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="relative">
        {/* 中心线 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
        
        {sortedItems.map((item, index) => (
          <div 
            key={item.id} 
            className={`relative flex items-center mb-16 ${
              index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            {/* 时间点 */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-blue-500 border-4 border-white shadow-md z-10 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{String(item.year).slice(-2)}</span>
            </div>
            
            {/* 时间线内容 - 交替左右布局 */}
            <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}></div>
            
            <div className="w-5/12 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {item.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {item.year}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm">{item.description}</p>
                
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">主要艺术家:</h4>
                  <div className="flex flex-wrap gap-1">
                    {item.artists.map(artist => (
                      <span key={artist} className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {artist}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="text-gray-500">
                    <span className="font-medium">受影响于:</span> {item.influences.join(", ")}
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">详情</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView; 