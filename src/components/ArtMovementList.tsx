import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ArtMovement {
  _id: string;
  name: string;
  startYear: number;
  endYear: number;
  description: string;
  keyArtists: string[];
  characteristics: string[];
  imageUrl?: string;
}

const ArtMovementList: React.FC = () => {
  const [artMovements, setArtMovements] = useState<ArtMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtMovements = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/artmovements');
        setArtMovements(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch art movements');
        setLoading(false);
      }
    };

    fetchArtMovements();
  }, []);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Art Movements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artMovements.map((movement) => (
          <div key={movement._id} className="bg-white rounded-lg shadow-md p-4">
            {movement.imageUrl && (
              <img
                src={movement.imageUrl}
                alt={movement.name}
                className="w-full h-48 object-cover rounded-t-lg mb-4"
              />
            )}
            <h3 className="text-xl font-semibold mb-2">{movement.name}</h3>
            <p className="text-gray-600 mb-2">
              {movement.startYear} - {movement.endYear}
            </p>
            <p className="text-gray-700 mb-4">{movement.description}</p>
            <div className="mb-2">
              <h4 className="font-semibold">Key Artists:</h4>
              <ul className="list-disc list-inside">
                {movement.keyArtists.map((artist, index) => (
                  <li key={index}>{artist}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Characteristics:</h4>
              <ul className="list-disc list-inside">
                {movement.characteristics.map((characteristic, index) => (
                  <li key={index}>{characteristic}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtMovementList; 