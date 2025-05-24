import React from 'react';
import { motion } from 'framer-motion';
import { IArtStyle } from '../types/art';
import { X, User, Image, Info, Palette } from 'lucide-react';

interface ArtMovementDetailProps {
  artStyle: IArtStyle;
  onClose: () => void;
}

const ArtMovementDetail: React.FC<ArtMovementDetailProps> = ({ artStyle, onClose }) => {
  // 获取艺术家头像
  const getArtistAvatar = (artistName: string, index: number) => {
    return `/TestData/artist${(index % 5) + 1}.jpg`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* 头部信息 */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {artStyle.title}
          </h2>
          <p className="text-gray-400 mt-1">
            {artStyle.period ? 
              `${artStyle.period.start} - ${artStyle.period.end}` : 
              `约 ${artStyle.year} 年`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* 主要内容 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左侧：描述和特征 */}
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-lg">简介</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">{artStyle.description}</p>
          </div>

          {/* 代表艺术家 */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-lg">代表艺术家</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {artStyle.artists && artStyle.artists.map((artist, index) => (
                <span 
                  key={index} 
                  className="inline-block px-3 py-1 bg-white/5 rounded-md hover:bg-white/10 transition-colors text-blue-300"
                >
                  {artist}
                </span>
              ))}
            </div>
          </div>

          {artStyle.characteristics && artStyle.characteristics.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">主要特征</h3>
              <ul className="space-y-2">
                {artStyle.characteristics.map((char, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-gray-300">{char}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 右侧：艺术家和作品 */}
        <div className="space-y-4">
          {/* 代表艺术家 */}
          {artStyle.keyArtists && artStyle.keyArtists.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-lg">代表艺术家</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {artStyle.keyArtists.map((artist) => (
                  <div key={artist.id} className="p-3 bg-white/5 rounded-lg">
                    <h4 className="font-medium text-purple-300">{artist.name}</h4>
                    <p className="text-sm text-gray-400">
                      {artist.birthYear} - {artist.deathYear || '现在'}
                    </p>
                    {artist.nationality && (
                      <p className="text-sm text-gray-400">{artist.nationality}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 代表作品 */}
          {artStyle.artworks && artStyle.artworks.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Image className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-lg">代表作品</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {artStyle.artworks.map((artwork) => (
                  <motion.div
                    key={artwork.id}
                    className="group relative overflow-hidden rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                      <h4 className="font-medium text-white">{artwork.title}</h4>
                      <p className="text-sm text-gray-300">{artwork.artist}</p>
                      <p className="text-sm text-gray-400">{artwork.year}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtMovementDetail; 