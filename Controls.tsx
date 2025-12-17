import React from 'react';
import { Orientation } from '../types';
import { Columns, Rows, FileText, Download, Image as ImageIcon, Crop } from 'lucide-react';

interface ControlsProps {
  rows: number;
  cols: number;
  orientation: Orientation;
  onRowsChange: (val: number) => void;
  onColsChange: (val: number) => void;
  onOrientationChange: (val: Orientation) => void;
  onDownloadPDF: () => void;
  onDownloadZIP: () => void;
  onEditCrop: () => void;
  hasImage: boolean;
  isProcessing: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  rows,
  cols,
  orientation,
  onRowsChange,
  onColsChange,
  onOrientationChange,
  onDownloadPDF,
  onDownloadZIP,
  onEditCrop,
  hasImage,
  isProcessing
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Selecione o Número de Folhas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Columns Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Columns size={18} />
              COLUNAS (Largura)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => onColsChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                disabled={!hasImage}
              />
              <span className="w-12 text-center py-1 px-2 bg-gray-100 rounded font-bold text-gray-700">
                {cols}
              </span>
            </div>
          </div>

          {/* Rows Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Rows size={18} />
              LINHAS (Altura)
            </label>
            <div className="flex items-center gap-4">
               <input
                type="range"
                min="1"
                max="10"
                value={rows}
                onChange={(e) => onRowsChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                disabled={!hasImage}
              />
              <span className="w-12 text-center py-1 px-2 bg-gray-100 rounded font-bold text-gray-700">
                {rows}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Orientation */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Formato da Folha (A4)</h3>
        <div className="flex gap-6">
          <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${orientation === Orientation.LANDSCAPE ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
            <input
              type="radio"
              name="orientation"
              value={Orientation.LANDSCAPE}
              checked={orientation === Orientation.LANDSCAPE}
              onChange={() => onOrientationChange(Orientation.LANDSCAPE)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              disabled={!hasImage}
            />
            <span className="font-medium text-gray-700">Horizontal</span>
          </label>
          <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${orientation === Orientation.PORTRAIT ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
            <input
              type="radio"
              name="orientation"
              value={Orientation.PORTRAIT}
              checked={orientation === Orientation.PORTRAIT}
              onChange={() => onOrientationChange(Orientation.PORTRAIT)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              disabled={!hasImage}
            />
            <span className="font-medium text-gray-700">Vertical</span>
          </label>
        </div>
      </div>
      
      {/* Edit Crop Button */}
      <div>
         <button
           onClick={onEditCrop}
           disabled={!hasImage}
           className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 disabled:bg-gray-100 disabled:text-gray-400 py-3 px-6 rounded-lg font-bold transition"
         >
           <Crop size={20} />
           AJUSTAR RECORTE E POSIÇÃO
         </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={onDownloadPDF}
          disabled={!hasImage || isProcessing}
          className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-bold shadow-lg transform transition active:scale-95"
        >
          <FileText size={20} />
          BAIXAR PDF
        </button>
        <button
          onClick={onDownloadZIP}
          disabled={!hasImage || isProcessing}
          className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 border-2 border-gray-800 text-gray-900 py-3 px-6 rounded-lg font-bold shadow-lg transform transition active:scale-95"
        >
          <ImageIcon size={20} />
          BAIXAR IMAGENS (ZIP)
        </button>
      </div>

      {/* Summary */}
      {hasImage && (
        <div className="text-center text-sm text-gray-500">
          Total de folhas: <strong className="text-gray-900">{rows * cols}</strong> (Tamanho final aprox: {cols * 21}cm x {rows * 29.7}cm se A4)
        </div>
      )}
    </div>
  );
};
