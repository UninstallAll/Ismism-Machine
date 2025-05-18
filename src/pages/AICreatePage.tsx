import AICreateSection from '../components/AICreateSection';

const AICreatePage = () => {
  return (
    <div className="page-container">
      {/* 标题栏 */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">AI 创作实验室</h1>
        
        <div className="flex space-x-2">
          <select className="px-3 py-1.5 border-2 border-gray-400 rounded text-sm hidden sm:block">
            <option>生成图像</option>
            <option>风格迁移</option>
            <option>创意混合</option>
            <option>艺术解析</option>
          </select>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="p-4">
        <AICreateSection />
      </div>
    </div>
  );
};

export default AICreatePage; 