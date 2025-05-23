import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageDisplay from './ImageDisplay';

interface Image {
  _id: string;
  url?: string;
  base64Data?: string;
  title?: string;
}

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('/api/images');
        setImages(response.data);
      } catch (err) {
        setError('Failed to load images');
        console.error('Error loading images:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="animate-pulse bg-gray-200 h-48 rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-500 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image) => (
        <div key={image._id} className="rounded-lg overflow-hidden shadow-lg">
          <ImageDisplay
            imageId={image._id}
            imageUrl={image.url}
            imageData={image.base64Data}
            alt={image.title || 'Gallery image'}
            className="w-full h-48 object-cover"
          />
          {image.title && (
            <div className="p-4 bg-white">
              <h3 className="text-lg font-semibold">{image.title}</h3>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery; 