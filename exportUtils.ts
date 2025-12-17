import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { ImagePiece, Orientation } from '../types';

export const generatePDF = (pieces: ImagePiece[], orientation: Orientation) => {
  // jsPDF orientation: 'p' for portrait, 'l' for landscape
  const pdfOrientation = orientation === Orientation.PORTRAIT ? 'p' : 'l';
  const pdf = new jsPDF(pdfOrientation, 'mm', 'a4');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pieces.forEach((piece, index) => {
    if (index > 0) {
      pdf.addPage();
    }
    // Add image filling the full page
    pdf.addImage(piece.dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
    
    // Note: Numbers removed as per request to produce clean final images
  });

  pdf.save('poster-gigante.pdf');
};

export const generateZIP = async (pieces: ImagePiece[]) => {
  const zip = new JSZip();
  const folder = zip.folder("partes-poster");

  pieces.forEach((piece) => {
    // Remove base64 header
    const base64Data = piece.dataUrl.split(',')[1];
    folder?.file(`parte-${piece.row + 1}-${piece.col + 1}.jpg`, base64Data, { base64: true });
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'poster-imagens.zip');
};
