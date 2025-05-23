import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ImageDisplayProps {
  imageId?: string;
  imageUrl?: string;
  imageData?: string;
  alt?: string;
  className?: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageId,
  imageUrl,
  imageData,
  alt = 'Image',
  className = ''
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        setError('');

        // 如果直接提供了图片URL
        if (imageUrl) {
          setImageSrc(imageUrl);
        }
        // 如果提供了Base64数据
        else if (imageData) {
          setImageSrc(imageData.startsWith('data:image') ? imageData : `data:image/jpeg;base64,${imageData}`);
        }
        // 如果提供了图片ID，从后端获取图片
        else if (imageId) {
          const response = await axios.get(`/api/images/${imageId}`, {
            responseType: 'blob'
          });
          const imageBlob = response.data;
          const imageObjectUrl = URL.createObjectURL(imageBlob);
          setImageSrc(imageObjectUrl);
        }
      } catch (err) {
        setError('Failed to load image');
        console.error('Error loading image:', err);
      } finally {
        setLoading(false);
      }
    };

    loadImage();

    // 清理函数
    return () => {
      if (imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageId, imageUrl, imageData]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded-md h-48 w-full" />;
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-500 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`max-w-full h-auto ${className}`}
      onError={() => setError('Failed to load image')}
    />
  );
};

export default ImageDisplay; 