import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Environment, OrbitControls } from '@react-three/drei';
import { MagicTree } from './MagicTree';
import { CameraController } from './CameraController';

export const Scene: React.FC = () => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 12], fov: 45 }}
      gl={{ antialias: false, stencil: false, alpha: false }}
    >
      <color attach="background" args={['#050505']} />
      
      <Suspense fallback={null}>
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} color="#ffffff" />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1.5}
          color="#ffd700" // Gold tint
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff0000" />
        
        <Environment preset="night" />
        
        {/* Main Content */}
        <MagicTree />
        
        <CameraController />
        
        {/* Post Processing for Glow */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        {/* Fallback controls for mouse if hand tracking isn't used/working */}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Suspense>
    </Canvas>
  );
};