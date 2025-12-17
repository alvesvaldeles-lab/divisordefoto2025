export enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

export interface SplitConfig {
  rows: number;
  cols: number;
  orientation: Orientation;
}

export interface ImagePiece {
  id: string;
  dataUrl: string;
  row: number;
  col: number;
}

export interface CropConfig {
  x: number; // 0 to 1 (Pan X)
  y: number; // 0 to 1 (Pan Y)
  scale: number; // 1 to 5 (Zoom)
}
