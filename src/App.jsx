import React from 'react';
import Timeline from './components/Timeline';

function App() {
  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">主义主义机</h1>
        <p className="text-center text-gray-600">艺术思潮与流派的时间线可视化</p>
      </header>
      
      <main>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">艺术时间线</h2>
          <Timeline />
        </section>
      </main>
      
      <footer className="mt-12 pt-4 border-t text-center text-gray-500 text-sm">
        <p>&copy; 2025 主义主义机 - 一个艺术史探索工具</p>
      </footer>
    </div>
  );
}

export default App; 