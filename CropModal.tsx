import React, { useState, useRef, useEffect } from 'react';
import { CropConfig, Orientation } from '../types';
import { X, Check, ZoomIn } from 'lucide-react';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (crop: CropConfig) => void;
  imageSrc: string;
  initialCrop: CropConfig;
  rows: number;
  cols: number;
  orientation: Orientation;
}

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  imageSrc,
  initialCrop,
  rows,
  cols,
  orientation
}) => {
  const [crop, setCrop] = useState<CropConfig>(initialCrop);
  
  // Calculate Grid Aspect Ratio
  const A4_W = orientation === Orientation.PORTRAIT ? 210 : 297;
  const A4_H = orientation === Orientation.PORTRAIT ? 297 : 210;
  const gridRatio = (cols * A4_W) / (rows * A4_H);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) setCrop(initialCrop);
  }, [isOpen, initialCrop]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Ajustar Recorte e Posição</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-gray-900 relative overflow-hidden flex items-center justify-center p-8 select-none">
          
          {/* Container restricts max size */}
          <div className="relative w-full h-full max-h-[60vh] flex items-center justify-center">
             
             {/* The Mask/Viewport - Displays the aspect ratio */}
             {/* We use a clever trick: Render the image, and put a huge border around a transparent box */}
             {/* Actually simpler: Render image behind, overlay box on top */}
             
             <div 
                className="relative overflow-hidden shadow-2xl bg-black"
                style={{
                  aspectRatio: `${gridRatio}`,
                  height: gridRatio > 1 ? 'auto' : '100%',
                  width: gridRatio > 1 ? '100%' : 'auto',
                  maxHeight: '100%',
                  maxWidth: '100%',
                  border: '2px solid rgba(255,255,255,0.8)'
                }}
             >
                {/* The Image inside the viewport */}
                {/* We need to apply Pan and Zoom here. 
                    However, the math in imageProcessing assumes "Cover" logic.
                    To match that visually:
                    - We need the image to at least cover the viewport.
                    - Then apply scale (zoom).
                    - Then apply translate (pan).
                */}
                <img 
                  src={imageSrc}
                  alt="Crop Target"
                  className="absolute max-w-none origin-center transition-transform duration-75"
                  style={{
                    // Centering logic is complex in CSS alone without knowing image aspect ratio.
                    // Instead, we use object-fit cover behavior via background or specialized styles.
                    // Let's emulate the "Cover" logic + transforms.
                    
                    // Simple hack: Make image HUGE and centered, then transform.
                    // This is hard to match exactly with the JS logic without knowing dimensions.
                    
                    // Alternative: Use percentage based translation on a container that fills the viewport?
                    // If we set width/height to 100% * scale.
                    // And transform translate based on x/y.
                    
                    top: '50%',
                    left: '50%',
                    minWidth: '100%',
                    minHeight: '100%',
                    // If image is wider than viewport, height=100%, width=auto.
                    // If image is taller, width=100%, height=auto.
                    // This is 'object-fit: cover'.
                    // We can achieve this with CSS transform translate(-50%, -50%).
                    
                    // Now, add the user's Scale.
                    // Now, add the user's Pan.
                    // Pan X=0 should align Left edge of image to Left edge of viewport.
                    // Pan X=1 should align Right edge of image to Right edge of viewport.
                    
                    // This CSS translation is tricky.
                    // Let's simplify: Just visual approximation for user.
                    // "Zoom" scales the image up.
                    // "X/Y" translates the image.
                    
                    transform: `translate(-50%, -50%) scale(${crop.scale}) translate(${(0.5 - crop.x) * 100}%, ${(0.5 - crop.y) * 100}%)`,
                    
                    // Wait:
                    // crop.x = 0.5 (Center). Delta = 0. translate(0).
                    // crop.x = 0 (Left). Delta = 50%. translate(50%). (Moves image Right so left edge aligns?)
                    // If I want left edge of image to align with left edge of viewport.
                    // The center of image is at 50% of viewport.
                    // Default centered: Image Center at Viewport Center.
                    // Pan Left (x=0): We want Image Center to move Right? No, we want Viewport to move Left.
                    // So Image moves Right.
                    // Yes: translate(50%, ...) moves image right.
                  }} 
                />
                
                {/* Grid Lines for reference */}
                <div 
                   className="absolute inset-0 grid pointer-events-none opacity-30"
                   style={{
                     gridTemplateColumns: `repeat(${cols}, 1fr)`,
                     gridTemplateRows: `repeat(${rows}, 1fr)`
                   }}
                >
                  {Array.from({ length: cols * rows }).map((_, i) => (
                    <div key={i} className="border border-white/50"></div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 bg-white space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="flex justify-between text-sm font-semibold text-gray-700">
                <span>Zoom</span>
                <span>{crop.scale.toFixed(1)}x</span>
              </label>
              <input 
                type="range" min="1" max="5" step="0.1"
                value={crop.scale}
                onChange={(e) => setCrop({...crop, scale: Number(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-2">
              <label className="flex justify-between text-sm font-semibold text-gray-700">
                <span>Posição Horizontal</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.01"
                value={crop.x}
                onChange={(e) => setCrop({...crop, x: Number(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-2">
              <label className="flex justify-between text-sm font-semibold text-gray-700">
                <span>Posição Vertical</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.01"
                value={crop.y}
                onChange={(e) => setCrop({...crop, y: Number(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <button 
            onClick={() => onConfirm(crop)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition"
          >
            <Check size={24} />
            Confirmar Recorte
          </button>
        </div>

      </div>
    </div>
  );
};
