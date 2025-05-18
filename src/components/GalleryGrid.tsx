interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  style: string;
  description: string;
}

interface GalleryGridProps {
  artworks: Artwork[];
  onSelect: (artwork: Artwork) => void;
}

const GalleryGrid = ({ artworks, onSelect }: GalleryGridProps) => {
  // 处理图片加载错误
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/300x200?text=图片加载失败';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {artworks.map(artwork => (
        <div 
          key={artwork.id} 
          className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          onClick={() => onSelect(artwork)}
        >
          <div className="h-48 overflow-hidden relative">
            <img 
              src={artwork.imageUrl} 
              alt={artwork.title} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h4 className="text-white font-bold truncate">{artwork.title}</h4>
                <p className="text-white/80 text-sm">{artwork.artist}</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-1 truncate">{artwork.title}</h3>
            <div className="flex justify-between mb-2">
              <p className="text-sm text-gray-600">{artwork.artist}</p>
              <p className="text-sm text-gray-500">{artwork.year}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {artwork.style}
              </span>
              <button 
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(artwork);
                }}
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GalleryGrid; 