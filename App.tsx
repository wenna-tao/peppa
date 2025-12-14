import React, { useEffect } from 'react';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { HandTracker } from './components/HandTracker';
import { useStore } from './store';
import { AppMode } from './types';

const App: React.FC = () => {
  const { addPhoto } = useStore();

  useEffect(() => {
    // Add some default placeholder photos
    const placeholders = [
      'https://picsum.photos/400/400?random=1',
      'https://picsum.photos/400/600?random=2',
      'https://picsum.photos/600/400?random=3',
      'https://picsum.photos/400/400?random=4',
      'https://picsum.photos/400/500?random=5',
    ];
    placeholders.forEach(url => addPhoto(url));
  }, [addPhoto]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <UI />
      </div>

      {/* Computer Vision Layer (Hidden Video + Logic) */}
      <HandTracker />
    </div>
  );
};

export default App;