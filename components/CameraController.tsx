import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { AppMode } from '../types';

export const CameraController: React.FC = () => {
  const { gesture, mode } = useStore();
  const targetPos = useRef(new THREE.Vector3(0, 0, 15));
  
  useFrame((state, delta) => {
    // Determine base position based on mode
    let baseX = 0;
    let baseY = 0;
    let baseZ = 15;

    if (mode === AppMode.TREE) {
        baseZ = 18;
        baseY = 0;
    } else if (mode === AppMode.SCATTERED) {
        // In scattered mode, hand rotation affects camera
        // gesture.handX is 0-1. Map to -1 to 1.
        const rotX = (gesture.handX - 0.5) * 2; // -1 to 1
        const rotY = (gesture.handY - 0.5) * 2;

        baseX = rotX * 10;
        baseY = rotY * 5;
        baseZ = 20;
    } else if (mode === AppMode.ZOOM) {
        baseZ = 10; // Closer
    }

    // Smooth camera movement
    state.camera.position.lerp(new THREE.Vector3(baseX, baseY, baseZ), delta * 2);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
};