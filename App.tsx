import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Orientation, ImagePiece, CropConfig } from './types';
import { splitImage } from './utils/imageProcessing';
import { generatePDF, generateZIP } from './utils/exportUtils';
import { GridPreview } from './components/GridPreview';
import { Controls } from './components/Controls';
import { CropModal } from './components/CropModal';

const App: React.FC = () => {
  // State
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [pieces, setPieces] = useState<ImagePiece[]>([]);
  const [rows, setRows] = useState<number>(2);
  const [cols, setCols] = useState<number>(2);
  const [orientation, setOrientation] = useState<Orientation>(Orientation.PORTRAIT);
  const [crop, setCrop] = useState<CropConfig>({ x: 0.5, y: 0.5, scale: 1 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce processing
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSourceImage(e.target?.result as string);
        setCrop({ x: 0.5, y: 0.5, scale: 1 }); // Reset crop on new image
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSourceImage(null);
    setPieces([]);
    setCrop({ x: 0.5, y: 0.5, scale: 1 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropConfirm = (newCrop: CropConfig) => {
    setCrop(newCrop);
    setIsCropModalOpen(false);
  };

  // Re-process image when configs change
  useEffect(() => {
    if (!sourceImage) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsProcessing(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await splitImage(sourceImage, rows, cols, orientation, crop);
        setPieces(result);
      } catch (err) {
        console.error("Error splitting image:", err);
      } finally {
        setIsProcessing(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [sourceImage, rows, cols, orientation, crop]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-8 px-4 mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">
            Divisor de Foto da Hora
          </h1>
          <p className="mt-2 text-gray-500">Transforme suas fotos em posters gigantes usando impressora comum (A4)</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Input and Controls */}
        <section className="space-y-8">
          
          {/* Upload Area */}
          <div className="space-y-4">
            {!sourceImage ? (
              <div 
                onClick={triggerUpload}
                className="group w-full aspect-video bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-400 hover:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
              >
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-600 group-hover:text-gray-800">
                  CLIQUE AQUI PARA ADICIONAR UMA IMAGEM
                </span>
                <span className="text-xs text-gray-400 mt-2">Suporta JPG, PNG, WEBP</span>
              </div>
            ) : (
              <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg group">
                <img 
                  src={sourceImage} 
                  alt="Source" 
                  className="w-full h-full object-contain opacity-80" 
                />
                <button 
                  onClick={removeImage}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-red-500 hover:text-white backdrop-blur-md p-2 rounded-full text-white transition-colors"
                  title="Remover imagem"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur text-white text-xs px-3 py-1 rounded-full">
                  Imagem original carregada
                </div>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>

          <div className="h-px bg-gray-200 w-full" />

          {/* Controls */}
          <Controls 
            rows={rows}
            cols={cols}
            orientation={orientation}
            onRowsChange={setRows}
            onColsChange={setCols}
            onOrientationChange={setOrientation}
            onDownloadPDF={() => generatePDF(pieces, orientation)}
            onDownloadZIP={() => generateZIP(pieces)}
            onEditCrop={() => setIsCropModalOpen(true)}
            hasImage={!!sourceImage}
            isProcessing={isProcessing}
          />

        </section>

        {/* Right Column: Preview */}
        <section className="space-y-4">
           <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-800">Pré-visualização</h3>
            {isProcessing && <span className="text-xs text-blue-600 font-medium animate-pulse">Atualizando...</span>}
           </div>
           
           <GridPreview 
             pieces={pieces}
             rows={rows}
             cols={cols}
             orientation={orientation}
             isLoading={isProcessing}
             hasImage={!!sourceImage}
           />

           <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800 mt-6">
             <p className="font-bold mb-1">Dica de Impressão:</p>
             <p>Ao imprimir o PDF, selecione a opção <strong>"Tamanho Real"</strong> ou <strong>"100%"</strong> nas configurações da impressora.</p>
           </div>
        </section>

      </main>

      {/* Crop Modal */}
      {sourceImage && (
        <CropModal 
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          onConfirm={handleCropConfirm}
          imageSrc={sourceImage}
          initialCrop={crop}
          rows={rows}
          cols={cols}
          orientation={orientation}
        />
      )}
    </div>
  );
};

export default App;