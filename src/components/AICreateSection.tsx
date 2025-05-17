import { useState } from 'react';

interface AIStyleOption {
  id: string;
  name: string;
  description: string;
  previewImage: string;
}

const AICreateSection = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // 示例艺术风格
  const artStyles: AIStyleOption[] = [
    {
      id: 'impressionism',
      name: '印象派',
      description: '强调光线和色彩的即时视觉印象，笔触松散可见',
      previewImage: '/styles/impressionism.jpg'
    },
    {
      id: 'cubism',
      name: '立体主义',
      description: '将对象分解为几何形状，从多个角度同时表现',
      previewImage: '/styles/cubism.jpg'
    },
    {
      id: 'surrealism',
      name: '超现实主义',
      description: '结合梦境与现实，创造超越理性的奇特视觉',
      previewImage: '/styles/surrealism.jpg'
    },
    {
      id: 'expressionism',
      name: '表现主义',
      description: '通过扭曲和夸张表达情感，色彩强烈',
      previewImage: '/styles/expressionism.jpg'
    },
    {
      id: 'popart',
      name: '波普艺术',
      description: '融合大众文化元素，鲜艳色彩和重复图案',
      previewImage: '/styles/popart.jpg'
    }
  ];
  
  const handleGenerate = () => {
    if (!prompt || !selectedStyle) return;
    
    setGenerating(true);
    
    // 模拟 AI 生成过程
    setTimeout(() => {
      // 实际项目中这里会调用 AI 生成 API
      setGeneratedImage(`/generated/${selectedStyle}-example.jpg`);
      setGenerating(false);
    }, 2000);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800 mb-2">AI 艺术主义创作实验室</h2>
        <p className="text-sm text-gray-600">
          使用 AI 将您的创意以不同的艺术主义风格呈现。选择一种艺术风格，输入描述，然后生成图像。
        </p>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">1. 选择艺术风格</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {artStyles.map(style => (
              <div
                key={style.id}
                className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedStyle === style.id 
                    ? 'ring-2 ring-blue-500 shadow-md' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedStyle(style.id)}
              >
                <div className="h-32 overflow-hidden">
                  <img 
                    src={style.previewImage} 
                    alt={style.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-medium">{style.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{style.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">2. 输入你的创意描述</h3>
          <div className="space-y-4">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="描述你想创建的图像内容，例如：'一座山顶的城堡，周围环绕着云雾'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {prompt.length} / 200 字
              </div>
              
              <button 
                className={`px-4 py-2 rounded-lg ${
                  !prompt || !selectedStyle || generating
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                onClick={handleGenerate}
                disabled={!prompt || !selectedStyle || generating}
              >
                {generating ? '生成中...' : '生成图像'}
              </button>
            </div>
          </div>
        </div>
        
        {generatedImage && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">3. 你的 AI 生成图像</h3>
            <div className="border rounded-lg overflow-hidden">
              <img 
                src={generatedImage} 
                alt="AI 生成艺术" 
                className="w-full h-full object-contain"
              />
              
              <div className="p-4 bg-gray-50 border-t flex justify-between">
                <div>
                  <span className="text-sm font-medium">风格: </span>
                  <span className="text-sm text-gray-600">
                    {artStyles.find(s => s.id === selectedStyle)?.name}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">
                    下载
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    分享
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AICreateSection; 