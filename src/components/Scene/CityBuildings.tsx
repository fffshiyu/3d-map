import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateCityBuildings } from '../../data/landmarks';
import { useStore } from '../../store/useStore';

// 建筑颜色 - 参考原项目
const BUILDING_COLOR_DAY = '#d8d8d8';
const BUILDING_COLOR_NIGHT = '#2a2a3a';

// InstancedMesh 实现 - 高效渲染大量建筑
export function CityBuildings() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const isNightMode = useStore((state) => state.isNightMode);
  
  // 生成建筑数据 - 使用 useMemo 缓存
  const buildings = useMemo(() => generateCityBuildings(), []);
  
  // 临时对象用于矩阵计算
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  // 初始化实例矩阵
  useEffect(() => {
    if (!meshRef.current) return;
    
    buildings.forEach((building, i) => {
      // 设置位置、缩放和旋转
      tempObject.position.set(...building.position);
      tempObject.scale.set(...building.scale);
      tempObject.rotation.y = building.rotation;
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [buildings, tempObject]);
  
  // 动画帧更新（夜间模式发光效果）
  useFrame((state) => {
    if (!meshRef.current || !isNightMode) return;
    
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = 0.08 + Math.sin(state.clock.elapsedTime) * 0.03;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, buildings.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={isNightMode ? BUILDING_COLOR_NIGHT : BUILDING_COLOR_DAY}
        roughness={0.8}
        metalness={0.0}
        emissive={isNightMode ? '#222233' : '#000000'}
        emissiveIntensity={isNightMode ? 0.08 : 0}
      />
    </instancedMesh>
  );
}
