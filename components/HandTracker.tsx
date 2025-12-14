import React, { useEffect, useRef } from 'react';
import mpHands from '@mediapipe/hands';
import { useStore } from '../store';
import { AppMode } from '../types';

export const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>(0);
  const { setGesture, setCameraReady, setMode, mode, photos, setSelectedPhotoIndex } = useStore();
  
  // Debounce logic for state switching to prevent flickering
  const lastStateChange = useRef<number>(0);
  const gestureHistory = useRef<string[]>([]);
  
  useEffect(() => {
    if (!videoRef.current) return;
    const videoElement = videoRef.current;

    // Handle ESM import interoperability for MediaPipe
    // The library usually exports the class on the default object when imported this way
    // @ts-ignore
    const HandsClass = mpHands.Hands || mpHands;

    const hands = new HandsClass({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    // Manual Camera Implementation to avoid @mediapipe/camera_utils import issues
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        
        videoElement.srcObject = stream;
        
        await new Promise<void>((resolve) => {
          videoElement.onloadedmetadata = () => {
            videoElement.play();
            resolve();
          };
        });

        setCameraReady(true);

        const frameLoop = async () => {
          if (videoElement.paused || videoElement.ended) return;
          
          // Send frame to mediapipe
          await hands.send({ image: videoElement });
          
          // Loop
          requestRef.current = requestAnimationFrame(frameLoop);
        };
        
        frameLoop();

      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoElement.srcObject) {
         const tracks = (videoElement.srcObject as MediaStream).getTracks();
         tracks.forEach(track => track.stop());
      }
      hands.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onResults = (results: any) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setGesture({ isFist: false, isOpen: false, isPinching: false });
      return;
    }

    const landmarks = results.multiHandLandmarks[0];

    // --- Gesture Recognition Logic ---

    // 1. Detect Open Hand vs Fist
    // Check if fingers are extended relative to the wrist/palm
    const isFingerExtended = (tipIdx: number, pipIdx: number) => {
      const wrist = landmarks[0];
      const tip = landmarks[tipIdx];
      const pip = landmarks[pipIdx];
      
      const distTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
      const distPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
      return distTip > distPip;
    };

    const indexOpen = isFingerExtended(8, 6);
    const middleOpen = isFingerExtended(12, 10);
    const ringOpen = isFingerExtended(16, 14);
    const pinkyOpen = isFingerExtended(20, 18);
    const thumbOpen = isFingerExtended(4, 2); 

    const openCount = [indexOpen, middleOpen, ringOpen, pinkyOpen, thumbOpen].filter(Boolean).length;
    
    const isFist = openCount <= 1; 
    const isOpen = openCount >= 4;

    // 2. Detect Pinch (Thumb tip close to Index tip)
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
    const isPinching = pinchDist < 0.05; 

    // 3. Hand Position (Centroid of Palm)
    const handX = 1 - (landmarks[0].x + landmarks[5].x + landmarks[17].x) / 3; // Mirror X
    const handY = (landmarks[0].y + landmarks[5].y + landmarks[17].y) / 3;

    // Update Store with raw data
    setGesture({
      isFist,
      isOpen,
      isPinching,
      handX,
      handY
    });

    // --- State Machine Logic (Debounced) ---
    const now = Date.now();
    if (now - lastStateChange.current > 1000) { // 1 second cooldown
      
      // Accumulate history for stability
      gestureHistory.current.push(isFist ? 'fist' : isOpen ? 'open' : isPinching ? 'pinch' : 'neutral');
      if (gestureHistory.current.length > 10) gestureHistory.current.shift();

      const recentMostCommon = gestureHistory.current.sort((a,b) =>
        gestureHistory.current.filter(v => v===a).length - gestureHistory.current.filter(v => v===b).length
      ).pop();

      if (recentMostCommon === 'fist' && mode !== AppMode.TREE) {
        setMode(AppMode.TREE);
        setSelectedPhotoIndex(null); 
        lastStateChange.current = now;
      } 
      else if (recentMostCommon === 'open' && mode === AppMode.TREE) {
        setMode(AppMode.SCATTERED);
        lastStateChange.current = now;
      }
      else if (recentMostCommon === 'pinch' && mode === AppMode.SCATTERED) {
         setMode(AppMode.ZOOM);
         const nextIndex = Math.floor(Math.random() * photos.length);
         setSelectedPhotoIndex(nextIndex);
         lastStateChange.current = now;
      }
      else if (recentMostCommon === 'open' && mode === AppMode.ZOOM) {
          setMode(AppMode.SCATTERED);
          setSelectedPhotoIndex(null);
          lastStateChange.current = now;
      }
    }
  };

  return (
    <>
      <video
        ref={videoRef}
        className="input_video"
        playsInline
        muted
      />
    </>
  );
};