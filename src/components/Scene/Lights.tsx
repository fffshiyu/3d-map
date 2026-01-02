import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

export function Lights() {
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const isNightMode = useStore((state) => state.isNightMode);
  
  // 动态光照
  useFrame((state) => {
    if (!directionalRef.current) return;
    
    // 太阳位置动画（可选）
    const time = state.clock.elapsedTime * 0.1;
    directionalRef.current.position.x = Math.sin(time) * 50;
    directionalRef.current.position.z = Math.cos(time) * 50;
  });

  return (
    <>
      {/* 环境光 */}
      <ambientLight
        intensity={isNightMode ? 0.1 : 0.6}
        color={isNightMode ? '#1a1a4e' : '#ffffff'}
      />
      
      {/* 主方向光（太阳/月亮） */}
      <directionalLight
        ref={directionalRef}
        position={[50, 100, 50]}
        intensity={isNightMode ? 0.3 : 1.2}
        color={isNightMode ? '#6b7db3' : '#fffaea'}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      {/* 半球光 */}
      <hemisphereLight
        args={[
          isNightMode ? '#1a1a4e' : '#87CEEB',
          isNightMode ? '#0a0a2e' : '#8B4513',
          isNightMode ? 0.2 : 0.4
        ]}
      />
      
      {/* 夜间城市点光源 */}
      {isNightMode && (
        <>
          <pointLight
            position={[0, 20, 0]}
            intensity={0.5}
            color="#ff6b9d"
            distance={80}
          />
          <pointLight
            position={[25, 30, -15]}
            intensity={0.4}
            color="#4ecdc4"
            distance={60}
          />
          <pointLight
            position={[-30, 15, 10]}
            intensity={0.3}
            color="#dda0dd"
            distance={50}
          />
        </>
      )}
    </>
  );
}


