import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

export function Environment() {
  const { scene } = useThree();
  const isNightMode = useStore((state) => state.isNightMode);
  
  // 更新场景背景和雾 - 使用 FogExp2 实现四周均匀的雾
  useMemo(() => {
    if (isNightMode) {
      scene.background = new THREE.Color(0x050510);
      // 使用指数雾，四周均匀分布
      scene.fog = new THREE.FogExp2(0x050510, 0.012);
    } else {
      scene.background = new THREE.Color(0xffffff);
      // 使用指数雾，四周均匀分布
      scene.fog = new THREE.FogExp2(0xffffff, 0.008);
    }
  }, [scene, isNightMode]);

  return null;
}

// 星空背景（夜间模式）
export function Stars() {
  const isNightMode = useStore((state) => state.isNightMode);
  
  const starsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    
    for (let i = 0; i < 800; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 150 + Math.random() * 50;
      
      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        Math.abs(r * Math.cos(phi)) + 30,
        r * Math.sin(phi) * Math.sin(theta)
      );
    }
    
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    
    return geometry;
  }, []);

  if (!isNightMode) return null;

  return (
    <points geometry={starsGeometry}>
      <pointsMaterial
        size={0.4}
        color="#ffffff"
        transparent
        opacity={0.7}
        sizeAttenuation={false}
      />
    </points>
  );
}
