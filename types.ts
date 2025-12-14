export enum AppMode {
  TREE = 'TREE',
  SCATTERED = 'SCATTERED',
  ZOOM = 'ZOOM'
}

export interface PhotoData {
  id: string;
  url: string;
}

export interface HandGesture {
  isFist: boolean;
  isOpen: boolean;
  isPinching: boolean;
  handX: number; // Normalized 0-1
  handY: number; // Normalized 0-1
}

// Augment JSX namespace to allow R3F elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}