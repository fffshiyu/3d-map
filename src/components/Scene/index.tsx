import { Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { OSMBuildings } from './OSMBuildings';
import { OSMRoads } from './OSMRoads';
import { LandmarkMarker } from './LandmarkMarker';
import { Ground } from './Ground';
import { Trees } from './Trees';
import { CameraController } from './CameraController';
import { Lights } from './Lights';
import { Environment, Stars } from './Environment';
import { SHANGHAI_LANDMARKS } from '../../data/landmarks';
import { useStore } from '../../store/useStore';
import type { Landmark } from '../../types';

export function Scene() {
  const { 
    focusedLandmark, 
    setFocusedLandmark, 
    setSelectedLandmark,
  } = useStore();

  // 处理地标点击 - 两阶段交互
  const handleLandmarkClick = useCallback((landmark: Landmark) => {
    if (focusedLandmark?.id === landmark.id) {
      // 第二次点击 - 显示详情
      setSelectedLandmark(landmark);
    } else {
      // 第一次点击 - 聚焦
      setFocusedLandmark(landmark);
      setSelectedLandmark(null);
    }
  }, [focusedLandmark, setFocusedLandmark, setSelectedLandmark]);

  // 点击空白处重置
  const handleCanvasClick = useCallback(() => {
    if (focusedLandmark && !useStore.getState().selectedLandmark) {
      setFocusedLandmark(null);
    }
  }, [focusedLandmark, setFocusedLandmark]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ 
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      camera={{
        fov: 45,
        near: 0.1,
        far: 500,
      }}
      onPointerMissed={handleCanvasClick}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <Suspense fallback={null}>
        {/* 环境设置 */}
        <Environment />
        <Stars />
        
        {/* 光照 */}
        <Lights />
        
        {/* 相机控制 */}
        <CameraController />
        
        {/* 地面 */}
        <Ground />
        
        {/* OpenStreetMap 真实数据 */}
        <OSMRoads />
        <OSMBuildings />
        
        {/* 树木 */}
        <Trees />
        
        {/* 地标标记 */}
        {SHANGHAI_LANDMARKS.map((landmark) => (
          <LandmarkMarker
            key={landmark.id}
            landmark={landmark}
            onClick={handleLandmarkClick}
          />
        ))}
        
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
