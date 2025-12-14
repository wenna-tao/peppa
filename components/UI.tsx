import React, { useState } from 'react';
import { useStore } from '../store';
import { AppMode } from '../types';
import { Camera, Hand, Upload, Image as ImageIcon, Sparkles, Box } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind class merging
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const UI: React.FC = () => {
  const { mode, gesture, cameraReady, addPhoto, setMode, photos } = useStore();
  const [showInstructions, setShowInstructions] = useState(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          addPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-6">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-amber-600 bg-clip-text text-transparent">
            Gesture Christmas Tree
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Build your memory tree with hand gestures
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
             <div className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
             {cameraReady ? 'Camera Active' : 'Initializing Camera...'}
          </div>
        </div>

        {/* Upload Button */}
        <label className="cursor-pointer bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center gap-2 group pointer-events-auto">
           <Upload className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
           <span className="font-medium text-sm">Add Photo</span>
           <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {/* State Indicators */}
      <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col gap-4">
         <StatusBadge active={mode === AppMode.TREE} icon={<Sparkles />} label="Tree Mode" />
         <StatusBadge active={mode === AppMode.SCATTERED} icon={<Box />} label="Scattered" />
         <StatusBadge active={mode === AppMode.ZOOM} icon={<ImageIcon />} label="Zoom View" />
      </div>
      
      {/* Gesture Debug / Feedback */}
      <div className="absolute top-1/2 left-6 -translate-y-1/2 w-64">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs space-y-2">
            <h3 className="font-bold text-gray-400 uppercase tracking-wider mb-2">Gesture Detected</h3>
            <div className="flex items-center gap-2">
               <div className={cn("w-3 h-3 rounded-full border border-white/20", gesture.isFist && "bg-red-500 shadow-[0_0_10px_red]")} />
               <span>Fist (Converge)</span>
            </div>
            <div className="flex items-center gap-2">
               <div className={cn("w-3 h-3 rounded-full border border-white/20", gesture.isOpen && "bg-green-500 shadow-[0_0_10px_green]")} />
               <span>Open Hand (Scatter)</span>
            </div>
            <div className="flex items-center gap-2">
               <div className={cn("w-3 h-3 rounded-full border border-white/20", gesture.isPinching && "bg-yellow-500 shadow-[0_0_10px_yellow]")} />
               <span>Pinch (Select Photo)</span>
            </div>
        </div>
      </div>

      {/* Footer / Instructions Toggle */}
      <div className="flex justify-center pointer-events-auto">
        {showInstructions ? (
            <div className="bg-gradient-to-t from-red-900/80 to-black/80 backdrop-blur-lg p-6 rounded-2xl border border-yellow-500/30 max-w-2xl w-full relative">
                <button 
                  onClick={() => setShowInstructions(false)}
                  className="absolute top-4 right-4 text-white/50 hover:text-white"
                >✕</button>
                <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                    <Hand className="w-6 h-6" /> How to Control
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-200">
                    <div className="bg-white/5 p-3 rounded-lg">
                        <strong className="text-red-300 block mb-1">Make a Fist ✊</strong>
                        Converge all particles and photos into the Christmas Tree shape.
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                        <strong className="text-green-300 block mb-1">Open Hand 🖐</strong>
                        Explode the tree! Scatter elements into a floating cloud. Move your hand to rotate.
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                        <strong className="text-yellow-300 block mb-1">Pinch 👌</strong>
                        While scattered, pinch your thumb and index finger to grab and zoom into a random photo.
                    </div>
                </div>
                <div className="mt-4 text-center text-xs text-white/40">
                    Ensure good lighting and show your hand clearly to the camera.
                </div>
            </div>
        ) : (
            <button 
                onClick={() => setShowInstructions(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md"
            >
                Show Instructions
            </button>
        )}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{active: boolean, icon: React.ReactNode, label: string}> = ({ active, icon, label }) => (
    <div className={cn(
        "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-500 border",
        active 
            ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 scale-110 shadow-[0_0_15px_rgba(234,179,8,0.3)]" 
            : "bg-black/20 border-white/5 text-gray-500 scale-100"
    )}>
        <div className="w-6 h-6 mb-1">{icon}</div>
        <span className="text-[10px] uppercase font-bold tracking-wide">{label}</span>
    </div>
);