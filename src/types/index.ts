// 地标类型定义
export interface Landmark {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  position: [number, number, number]; // x, y, z in 3D space
  coordinates: {
    lat: number;
    lng: number;
  };
  height: number; // 建筑高度
  color: string;
  image: string;
  category: 'skyscraper' | 'historic' | 'cultural' | 'park';
}

// 建筑类型定义
export interface Building {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}

// 相机状态
export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// 应用状态
export interface AppState {
  selectedLandmark: Landmark | null;
  isNightMode: boolean;
  showLabels: boolean;
  cameraState: CameraState;
}


