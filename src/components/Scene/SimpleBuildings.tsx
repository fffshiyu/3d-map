import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { SHANGHAI_LANDMARKS } from '../../data/landmarks';

// 建筑颜色
const BUILDING_COLOR_DAY = '#d8d8d8';
const BUILDING_COLOR_NIGHT = '#2a2a3a';

// 简化的城市建筑 - 确保不与道路重叠
export function SimpleBuildings() {
  const isNightMode = useStore((state) => state.isNightMode);
  
  const buildingColor = isNightMode ? BUILDING_COLOR_NIGHT : BUILDING_COLOR_DAY;
  
  // 生成建筑数据 - 避开道路和地标
  const buildings = useMemo(() => {
    const result: { x: number; z: number; width: number; depth: number; height: number }[] = [];
    
    // 道路区域（需要避开）
    const isOnRoad = (x: number, z: number) => {
      // 主干道
      if (Math.abs(x) < 2) return true;
      if (Math.abs(z) < 2) return true;
      if (Math.abs(x - 30) < 1.5) return true;
      if (Math.abs(x + 30) < 1.5) return true;
      if (Math.abs(z - 30) < 1.5) return true;
      if (Math.abs(z + 30) < 1.5) return true;
      if (Math.abs(x - 60) < 1.2) return true;
      if (Math.abs(x + 60) < 1.2) return true;
      if (Math.abs(z - 60) < 1.2) return true;
      if (Math.abs(z + 60) < 1.2) return true;
      
      // 次级道路
      for (let roadX = -45; roadX <= 45; roadX += 15) {
        if (Math.abs(x - roadX) < 1) return true;
      }
      for (let roadZ = -45; roadZ <= 45; roadZ += 15) {
        if (Math.abs(z - roadZ) < 1) return true;
      }
      
      return false;
    };
    
    // 地标区域（需要避开）
    const isNearLandmark = (x: number, z: number) => {
      for (const landmark of SHANGHAI_LANDMARKS) {
        const dx = x - landmark.position[0];
        const dz = z - landmark.position[2];
        if (Math.sqrt(dx * dx + dz * dz) < 8) return true;
      }
      return false;
    };
    
    // 在每个街区内放置建筑
    const blockCenters: [number, number][] = [];
    
    // 生成街区中心点
    for (let bx = -52; bx <= 52; bx += 15) {
      for (let bz = -52; bz <= 52; bz += 15) {
        // 避开主干道交叉口
        if (Math.abs(bx) < 5 && Math.abs(bz) < 5) continue;
        blockCenters.push([bx, bz]);
      }
    }
    
    // 在每个街区放置多个建筑
    blockCenters.forEach(([bx, bz]) => {
      const numBuildings = 3 + Math.floor(Math.random() * 4);
      
      for (let i = 0; i < numBuildings; i++) {
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetZ = (Math.random() - 0.5) * 10;
        const x = bx + offsetX;
        const z = bz + offsetZ;
        
        if (isOnRoad(x, z)) continue;
        if (isNearLandmark(x, z)) continue;
        if (Math.sqrt(x * x + z * z) > 80) continue;
        
        // 距离中心越近，建筑越高
        const distFromCenter = Math.sqrt(x * x + z * z);
        const heightFactor = Math.max(0.3, 1 - distFromCenter / 100);
        
        const width = 2 + Math.random() * 3;
        const depth = 2 + Math.random() * 3;
        const height = (3 + Math.random() * 12) * heightFactor;
        
        result.push({ x, z, width, depth, height });
      }
    });
    
    return result;
  }, []);
  
  // 合并所有建筑几何体
  const mergedGeometry = useMemo(() => {
    if (buildings.length === 0) return null;
    
    const positions: number[] = [];
    const normals: number[] = [];
    
    buildings.forEach(building => {
      const { x, z, width, depth, height } = building;
      const hw = width / 2;
      const hd = depth / 2;
      
      // 六个面
      // 前面
      positions.push(
        x - hw, 0, z + hd,
        x + hw, 0, z + hd,
        x + hw, height, z + hd,
        x - hw, 0, z + hd,
        x + hw, height, z + hd,
        x - hw, height, z + hd,
      );
      for (let i = 0; i < 6; i++) normals.push(0, 0, 1);
      
      // 后面
      positions.push(
        x + hw, 0, z - hd,
        x - hw, 0, z - hd,
        x - hw, height, z - hd,
        x + hw, 0, z - hd,
        x - hw, height, z - hd,
        x + hw, height, z - hd,
      );
      for (let i = 0; i < 6; i++) normals.push(0, 0, -1);
      
      // 左面
      positions.push(
        x - hw, 0, z - hd,
        x - hw, 0, z + hd,
        x - hw, height, z + hd,
        x - hw, 0, z - hd,
        x - hw, height, z + hd,
        x - hw, height, z - hd,
      );
      for (let i = 0; i < 6; i++) normals.push(-1, 0, 0);
      
      // 右面
      positions.push(
        x + hw, 0, z + hd,
        x + hw, 0, z - hd,
        x + hw, height, z - hd,
        x + hw, 0, z + hd,
        x + hw, height, z - hd,
        x + hw, height, z + hd,
      );
      for (let i = 0; i < 6; i++) normals.push(1, 0, 0);
      
      // 顶面
      positions.push(
        x - hw, height, z + hd,
        x + hw, height, z + hd,
        x + hw, height, z - hd,
        x - hw, height, z + hd,
        x + hw, height, z - hd,
        x - hw, height, z - hd,
      );
      for (let i = 0; i < 6; i++) normals.push(0, 1, 0);
    });
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    
    return geometry;
  }, [buildings]);

  if (!mergedGeometry) return null;

  return (
    <mesh geometry={mergedGeometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={buildingColor}
        roughness={0.8}
        metalness={0.1}
        emissive={isNightMode ? '#1a1a2a' : '#000000'}
        emissiveIntensity={isNightMode ? 0.1 : 0}
      />
    </mesh>
  );
}


