import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { AppMode } from '../types';
import { Image } from '@react-three/drei';

const COUNT = 300; // Number of particles (balls/cubes)
const TREE_HEIGHT = 14;
const TREE_RADIUS = 5;

// Helper to generate positions
const getTreePosition = (i: number, count: number) => {
  const y = (i / count) * TREE_HEIGHT - (TREE_HEIGHT / 2); // -7 to 7
  const radius = ((TREE_HEIGHT / 2) - y) * (TREE_RADIUS / TREE_HEIGHT) * 1.5;
  const angle = i * 2.4; // Golden angle approx
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return new THREE.Vector3(x, y, z);
};

const getScatteredPosition = () => {
  return new THREE.Vector3(
    (Math.random() - 0.5) * 25,
    (Math.random() - 0.5) * 25,
    (Math.random() - 0.5) * 15
  );
};

export const MagicTree: React.FC = () => {
  const { mode, photos, selectedPhotoIndex } = useStore();
  
  // -- Instanced Mesh for Gold Spheres --
  const spheresRef = useRef<THREE.InstancedMesh>(null);
  const [sphereTargets] = useState(() => new Float32Array(COUNT * 3));
  const [sphereCurrents] = useState(() => new Float32Array(COUNT * 3)); // Current pos
  
  // -- Instanced Mesh for Red Boxes --
  const boxesRef = useRef<THREE.InstancedMesh>(null);
  const [boxTargets] = useState(() => new Float32Array(COUNT * 3));
  const [boxCurrents] = useState(() => new Float32Array(COUNT * 3));
  
  // Initialize positions
  useEffect(() => {
    for (let i = 0; i < COUNT; i++) {
      // Init Spheres
      const tPos = getTreePosition(i, COUNT);
      const sPos = getScatteredPosition();
      
      // Store tree positions as data, but start scattered or tree based on logic
      // We'll calculate target dynamically in useFrame, but let's init "current"
      sphereCurrents[i * 3] = tPos.x;
      sphereCurrents[i * 3 + 1] = tPos.y;
      sphereCurrents[i * 3 + 2] = tPos.z;

      // Init Boxes (interleaved slightly)
      const bPos = getTreePosition(i + 0.5, COUNT);
      boxCurrents[i * 3] = bPos.x;
      boxCurrents[i * 3 + 1] = bPos.y;
      boxCurrents[i * 3 + 2] = bPos.z;
    }
  }, []);

  // Frame Loop: Interpolation & Animation
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const dummy = new THREE.Object3D();

    // Determine target mode multiplier
    // 0 = tree, 1 = scattered
    const isTree = mode === AppMode.TREE;
    const isZoom = mode === AppMode.ZOOM;

    const moveSpeed = 4 * delta;

    for (let i = 0; i < COUNT; i++) {
      // -- Spheres Logic --
      let tx, ty, tz;
      if (isTree) {
        const v = getTreePosition(i, COUNT);
        tx = v.x; ty = v.y; tz = v.z;
      } else {
        // Scattered noise movement
        tx = Math.sin(i + time * 0.5) * 10 + Math.cos(i * 0.2) * 5;
        ty = Math.cos(i + time * 0.3) * 10 + Math.sin(i * 0.5) * 5;
        tz = Math.sin(i * 0.5 + time * 0.2) * 5;
      }
      
      // Interpolate current to target
      sphereCurrents[i*3] += (tx - sphereCurrents[i*3]) * moveSpeed;
      sphereCurrents[i*3+1] += (ty - sphereCurrents[i*3+1]) * moveSpeed;
      sphereCurrents[i*3+2] += (tz - sphereCurrents[i*3+2]) * moveSpeed;

      dummy.position.set(sphereCurrents[i*3], sphereCurrents[i*3+1], sphereCurrents[i*3+2]);
      
      // Scale down if zoom mode, else normal
      const scale = isZoom ? 0.2 : 1; 
      dummy.scale.setScalar(scale * (0.1 + Math.random() * 0.1)); // tiny variation
      dummy.rotation.set(time, time, time);
      dummy.updateMatrix();
      if (spheresRef.current) spheresRef.current.setMatrixAt(i, dummy.matrix);

      // -- Boxes Logic --
      let bx, by, bz;
      if (isTree) {
         // Boxes are slightly offset in the spiral
        const v = getTreePosition((COUNT - i), COUNT); // Reverse spiral
        bx = v.x; by = v.y; bz = v.z;
      } else {
        bx = Math.cos(i + time * 0.4) * 12;
        by = Math.sin(i + time * 0.4) * 12;
        bz = Math.cos(i * 0.3) * 8;
      }

      boxCurrents[i*3] += (bx - boxCurrents[i*3]) * moveSpeed;
      boxCurrents[i*3+1] += (by - boxCurrents[i*3+1]) * moveSpeed;
      boxCurrents[i*3+2] += (bz - boxCurrents[i*3+2]) * moveSpeed;

      dummy.position.set(boxCurrents[i*3], boxCurrents[i*3+1], boxCurrents[i*3+2]);
      dummy.scale.setScalar(scale * (0.15));
      dummy.rotation.set(time * 0.5, i, time);
      dummy.updateMatrix();
      if (boxesRef.current) boxesRef.current.setMatrixAt(i, dummy.matrix);
    }

    if (spheresRef.current) spheresRef.current.instanceMatrix.needsUpdate = true;
    if (boxesRef.current) boxesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Gold Spheres */}
      <instancedMesh ref={spheresRef} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color="#FFD700" 
          roughness={0.1} 
          metalness={0.8} 
          emissive="#FFD700"
          emissiveIntensity={0.2}
        />
      </instancedMesh>

      {/* Red Boxes */}
      <instancedMesh ref={boxesRef} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#8B0000" 
          roughness={0.4} 
          metalness={0.1}
        />
      </instancedMesh>

      {/* Floating Photos Cloud */}
      <PhotoCloud />
    </group>
  );
};

// Sub-component for Photos
const PhotoCloud: React.FC = () => {
  const { photos, mode, selectedPhotoIndex } = useStore();
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const isTree = mode === AppMode.TREE;
    const isZoom = mode === AppMode.ZOOM;

    groupRef.current.children.forEach((child, i) => {
      // Calculate target position
      let tx, ty, tz, s;
      
      // If Zoom Mode and this is selected
      if (isZoom && selectedPhotoIndex === i) {
        tx = 0; ty = 0; tz = 4; // Front and center
        s = 3; // Big
        // Look at camera
        child.lookAt(state.camera.position);
      } else if (isTree) {
         // Place photos as ornaments in the tree
         // Distribute them evenly
         const tPos = getTreePosition((i * 10) % COUNT, COUNT);
         tx = tPos.x * 1.2; // Slightly outside
         ty = tPos.y;
         tz = tPos.z * 1.2;
         s = 0.8;
         child.lookAt(0, tPos.y, 0); // Face outward
      } else {
         // Scattered
         tx = Math.sin(i * 13.5 + time * 0.2) * 8;
         ty = Math.cos(i * 9.2 + time * 0.1) * 8;
         tz = Math.sin(i * 4.1) * 6;
         s = 1;
         child.lookAt(state.camera.position);
      }

      // Smooth Lerp
      child.position.lerp(new THREE.Vector3(tx, ty, tz), delta * 3);
      const currentScale = child.scale.x;
      const targetScale = s;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 3);
      child.scale.setScalar(nextScale);
    });
  });

  return (
    <group ref={groupRef}>
      {photos.map((photo, index) => (
        <PhotoItem key={photo.id} url={photo.url} />
      ))}
    </group>
  );
};

const PhotoItem: React.FC<{url: string}> = ({ url }) => {
  return (
    <Image 
      url={url} 
      transparent 
      opacity={0.9} 
      side={THREE.DoubleSide}
    />
  );
};