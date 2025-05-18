import { useState } from 'react';
import GalleryGrid from '../components/GalleryGrid';
import galleryImages from '../data/galleryImages.json';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  style: string;
  description: string;
}

const GalleryPage = () => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const artworks = galleryImages as Artwork[];

  // 关闭详情模态框
  const closeArtworkDetails = () => {
    setSelectedArtwork(null);
  };

  return (
    <div className="page-container">
      {/* 标题栏 */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">艺术主义画廊</h1>
        
        <div className="flex space-x-2">
          <select className="px-3 py-1.5 border-2 border-gray-400 rounded text-sm hidden sm:block">
            <option>按时间排序</option>
            <option>按艺术家</option>
            <option>按艺术流派</option>
          </select>
          
          <div className="border-2 border-gray-400 rounded overflow-hidden flex">
            <button className="px-3 py-1.5 bg-white hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <button className="px-3 py-1.5 bg-blue-100 border-l border-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="p-4">
        <GalleryGrid artworks={artworks} onSelect={setSelectedArtwork} />
      </div>
      
      {/* 作品详情模态框 */}
      {selectedArtwork && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={closeArtworkDetails}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <button 
                className="absolute top-4 right-4 rounded-full bg-gray-900 bg-opacity-70 text-white p-2 hover:bg-opacity-90"
                onClick={closeArtworkDetails}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img 
                src={selectedArtwork.imageUrl} 
                alt={selectedArtwork.title} 
                className="w-full h-80 object-contain bg-gray-200"
              />
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedArtwork.title}</h2>
              <div className="flex items-center mb-4">
                <span className="text-gray-900">{selectedArtwork.artist}, {selectedArtwork.year}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-200 text-blue-900 rounded">
                  {selectedArtwork.style}
                </span>
              </div>
              <p className="text-gray-800 leading-relaxed mb-6">{selectedArtwork.description}</p>
              
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900">
                  在时间线查看
                </button>
                <button className="px-4 py-2 border-2 border-gray-400 rounded hover:bg-gray-100">
                  查看相关作品
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage; 