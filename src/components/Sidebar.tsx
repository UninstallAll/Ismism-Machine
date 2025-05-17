import { useState } from 'react';

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

interface SidebarProps {
  categories: Category[];
  onCategorySelect: (categoryId: string, subcategoryId?: string) => void;
}

const Sidebar = ({ categories, onCategorySelect }: SidebarProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [startYear, setStartYear] = useState<string>('');
  const [endYear, setEndYear] = useState<string>('');
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  const handleYearFilter = () => {
    console.log(`Filtering by years: ${startYear || '不限'} - ${endYear || '不限'}`);
    // 这里可以实现年份过滤逻辑
  };

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white shadow-md overflow-y-auto z-40">
      <div className="p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">艺术主义分类</h2>
        
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category.id} className="mb-3">
              <button 
                className="flex justify-between items-center w-full p-2 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <span 
                  className="font-medium" 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    onCategorySelect(category.id);
                  }}
                >
                  {category.name}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 transition-transform ${expandedCategories[category.id] ? 'transform rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedCategories[category.id] && (
                <div className="ml-4 mt-1 space-y-1">
                  {category.subcategories.map(subcat => (
                    <button
                      key={subcat.id}
                      className="block w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-md transition-colors"
                      onClick={() => onCategorySelect(category.id, subcat.id)}
                    >
                      {subcat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">时间筛选</h2>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="起始年份"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
            />
            <span className="text-gray-500 flex items-center">-</span>
            <input
              type="text"
              placeholder="结束年份"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
            />
          </div>
          
          <button 
            className="w-full py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            onClick={handleYearFilter}
          >
            应用筛选
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">相关视图</h2>
        <div className="space-y-2">
          <button className="block w-full p-2 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors">风格对比分析</button>
          <button className="block w-full p-2 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors">艺术家关系网络</button>
          <button className="block w-full p-2 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors">地理分布图</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 