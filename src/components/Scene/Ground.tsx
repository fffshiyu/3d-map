import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

// 地面颜色 - 纯色，无锯齿
const GROUND_COLOR_DAY = '#f0ebe0';
const GROUND_COLOR_NIGHT = '#0d0d18';

export function Ground() {
  const isNightMode = useStore((state) => state.isNightMode);
  
  const groundColor = isNightMode ? GROUND_COLOR_NIGHT : GROUND_COLOR_DAY;

  // 高分辨率圆形地面，边缘平滑
  const geometry = useMemo(() => {
    return new THREE.CircleGeometry(180, 256);
  }, []);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      <meshBasicMaterial
        color={groundColor}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
