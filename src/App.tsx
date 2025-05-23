import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Gallery from './components/Gallery';
import Timeline from './components/Timeline';
import ArtMovementPage from './pages/ArtMovementPage';
import ArtworkDetailPage from './pages/ArtworkDetailPage';
import { CursorGlow } from './components/ui/cursor-glow';
import { TechBackground } from './components/ui/tech-background';
import { useTimelineStore } from './store/timelineStore';
import { useEffect } from 'react';

function App() {
  const { fetchNodes } = useTimelineStore();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    fetchNodes();
  }, [fetchNodes]);

  return (
    <Router>
      <TechBackground />
      <CursorGlow />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/gallery" replace />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="art-movement/:id" element={<ArtMovementPage />} />
          <Route path="artwork/:id" element={<ArtworkDetailPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App; 