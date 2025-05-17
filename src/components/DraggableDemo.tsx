import { useState } from 'react';
import DraggableItem from './DraggableItem';

const DraggableDemo = () => {
  const [positions, setPositions] = useState({
    card1: { x: 50, y: 50 },
    card2: { x: 200, y: 100 },
    card3: { x: 100, y: 250 }
  });

  const handlePositionChange = (id: string, newPosition: { x: number; y: number }) => {
    setPositions(prev => ({
      ...prev,
      [id]: newPosition
    }));
  };

  return (
    <div className="relative w-full h-[600px] bg-gray-100 rounded-lg border border-gray-300 overflow-hidden" id="drag-container">
      <h2 className="text-xl font-bold p-4 text-center bg-white border-b border-gray-300">拖动演示</h2>
      
      <DraggableItem 
        initialPosition={positions.card1}
        onPositionChange={(pos) => handlePositionChange('card1', pos)}
        containerId="drag-container"
        className="bg-blue-100 border border-blue-300 rounded-lg shadow-md p-4 w-64"
      >
        <h3 className="text-lg font-semibold mb-2">可拖动卡片 1</h3>
        <p className="text-sm text-gray-600">你可以拖动这个卡片到容器的任何位置。</p>
      </DraggableItem>
      
      <DraggableItem 
        initialPosition={positions.card2}
        onPositionChange={(pos) => handlePositionChange('card2', pos)}
        containerId="drag-container"
        className="bg-green-100 border border-green-300 rounded-lg shadow-md p-4 w-64"
      >
        <h3 className="text-lg font-semibold mb-2">可拖动卡片 2</h3>
        <p className="text-sm text-gray-600">这个卡片也可以自由拖动。</p>
        <div className="mt-2 p-2 bg-white rounded border border-green-200">
          <p className="text-xs">嵌套内容不会影响拖动</p>
        </div>
      </DraggableItem>
      
      <DraggableItem 
        initialPosition={positions.card3}
        onPositionChange={(pos) => handlePositionChange('card3', pos)}
        containerId="drag-container"
        className="bg-purple-100 border border-purple-300 rounded-lg shadow-md p-4 w-64"
      >
        <h3 className="text-lg font-semibold mb-2">可拖动卡片 3</h3>
        <p className="text-sm text-gray-600">拖动时会有视觉反馈。</p>
        <button className="mt-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
          点击我
        </button>
      </DraggableItem>
      
      <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500">
        当前位置: Card1 (x: {Math.round(positions.card1.x)}, y: {Math.round(positions.card1.y)}) | 
        Card2 (x: {Math.round(positions.card2.x)}, y: {Math.round(positions.card2.y)}) | 
        Card3 (x: {Math.round(positions.card3.x)}, y: {Math.round(positions.card3.y)})
      </div>
    </div>
  );
};

export default DraggableDemo; 