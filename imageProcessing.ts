import { Orientation, ImagePiece, CropConfig } from '../types';

// A4 Dimensions in mm
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
// Overlap in mm (0mm - removed as requested)
const OVERLAP_MM = 0; 

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

export const splitImage = async (
  imageSrc: string,
  rows: number,
  cols: number,
  orientation: Orientation,
  crop: CropConfig = { x: 0.5, y: 0.5, scale: 1 }
): Promise<ImagePiece[]> => {
  const img = await loadImage(imageSrc);
  
  // 1. Calculate the Aspect Ratio of the total poster grid (The "View Window")
  const pageW = orientation === Orientation.PORTRAIT ? A4_WIDTH_MM : A4_HEIGHT_MM;
  const pageH = orientation === Orientation.PORTRAIT ? A4_HEIGHT_MM : A4_WIDTH_MM;
  
  const totalGridWidthMM = cols * pageW;
  const totalGridHeightMM = rows * pageH;
  const gridRatio = totalGridWidthMM / totalGridHeightMM;

  // 2. Determine the source area based on "Cover" fit + User Crop
  const imgRatio = img.width / img.height;
  
  let baseRenderW, baseRenderH;
  // Calculate the dimensions of the "Virtual Grid" mapped onto the image (at 1x zoom, centered)
  if (imgRatio > gridRatio) {
    // Image is wider than grid: Grid height = Image height
    baseRenderH = img.height;
    baseRenderW = img.height * gridRatio;
  } else {
    // Image is taller than grid: Grid width = Image width
    baseRenderW = img.width;
    baseRenderH = img.width / gridRatio;
  }

  // Apply Zoom (Scale)
  // Zooming in means the Capture Box gets SMALLER relative to the image
  const captureW = baseRenderW / crop.scale;
  const captureH = baseRenderH / crop.scale;

  // Calculate Limits for Pan
  // The capture box can move within the image bounds
  const maxX = img.width - captureW;
  const maxY = img.height - captureH;

  // Apply Pan (Crop X/Y)
  // crop.x = 0 -> left align (sx=0), crop.x = 1 -> right align (sx=maxX)
  const sx = maxX * crop.x;
  const sy = maxY * crop.y;

  // Now (sx, sy, captureW, captureH) is the region of the source image 
  // that corresponds strictly to the grid lines (0mm overlap).

  // 3. Calculate Overlap in Pixels
  // We need to know how many source pixels correspond to 1mm
  // We use the vertical dimension for scale reference
  const pixelsPerMM = captureH / totalGridHeightMM;
  const overlapPx = OVERLAP_MM * pixelsPerMM;

  // 4. Generate Tiles
  const cellW = captureW / cols;
  const cellH = captureH / rows;

  const pieces: ImagePiece[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Set canvas size for a single tile. 
  // We make it large enough to hold the cell + overlaps.
  // Note: We keep the resolution high based on the source image quality.
  const targetCanvasW = cellW + (2 * overlapPx);
  const targetCanvasH = cellH + (2 * overlapPx);
  
  canvas.width = targetCanvasW;
  canvas.height = targetCanvasH;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Default: Fill with white (for edges where image runs out)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Determine the source rectangle for this tile (including overlap)
      const tileSx = sx + (c * cellW) - overlapPx;
      const tileSy = sy + (r * cellH) - overlapPx;
      const tileSw = cellW + (2 * overlapPx);
      const tileSh = cellH + (2 * overlapPx);

      // Draw to canvas
      // drawImage handles clipping if source coords are out of bounds, 
      // but we want to place it correctly on the destination.
      
      // Intersection logic:
      const safeSx = Math.max(0, tileSx);
      const safeSy = Math.max(0, tileSy);
      const safeRight = Math.min(img.width, tileSx + tileSw);
      const safeBottom = Math.min(img.height, tileSy + tileSh);
      
      const safeSw = safeRight - safeSx;
      const safeSh = safeBottom - safeSy;

      if (safeSw > 0 && safeSh > 0) {
        // Calculate where to draw on canvas
        const dx = safeSx - tileSx; 
        const dy = safeSy - tileSy;

        ctx.drawImage(
          img,
          safeSx, safeSy, safeSw, safeSh,
          dx, dy, safeSw, safeSh
        );
      }
      
      pieces.push({
        id: `r${r}-c${c}`,
        dataUrl: canvas.toDataURL('image/jpeg', 0.95),
        row: r,
        col: c
      });
    }
  }

  return pieces;
};