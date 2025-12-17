import React from 'react';
import { ImagePiece, Orientation } from '../types';

interface GridPreviewProps {
  pieces: ImagePiece[];
  rows: number;
  cols: number;
  orientation: Orientation;
  isLoading: boolean;
  hasImage: boolean;
}

export const GridPreview: React.FC<GridPreviewProps> = ({ 
  pieces, 
  rows, 
  cols, 
  orientation, 
  isLoading,
  hasImage 
}) => {
  if (!hasImage) {
    return (
      <div className="w-full h-96 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p>Sua pré-visualização aparecerá aqui</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
     return (
      <div className="w-full h-96 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
           <p className="text-sm text-gray-500">Processando imagem...</p>
        </div>
      </div>
    );
  }

  // Calculate aspect ratio for the container to simulate the wall layout
  // A4 Portrait = 0.707, Landscape = 1.414
  const pieceRatio = orientation === Orientation.PORTRAIT ? 0.707 : 1.414;
  
  return (
    <div className="w-full bg-gray-200 p-8 rounded-lg overflow-auto shadow-inner flex justify-center">
      <div 
        className="grid gap-1 bg-white shadow-xl p-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          // Limit maximum width to prevent blowing up the UI, but keep aspect
          width: '100%',
          maxWidth: '800px',
        }}
      >
        {pieces.map((piece) => (
          <div 
            key={piece.id} 
            className="relative bg-gray-50 overflow-hidden border border-gray-100"
            style={{ 
              aspectRatio: `${pieceRatio}`,
            }}
          >
            <img 
              src={piece.dataUrl} 
              alt={`Part ${piece.row}-${piece.col}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border border-black/5 pointer-events-none flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10">
               <span className="text-xs font-mono text-white bg-black/50 px-1 rounded">
                 {piece.col + 1},{piece.row + 1}
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
