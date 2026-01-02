import * as THREE from 'three';
import { useMemo } from 'react';
import { useStore } from '../../store/useStore';

// 道路颜色
const ROAD_COLOR_DAY = '#d0c8c0';
const ROAD_COLOR_NIGHT = '#1a1a2a';

// 简化的道路网格 - 确保与建筑区域吻合
export function SimpleRoads() {
  const isNightMode = useStore((state) => state.isNightMode);
  
  const roadColor = isNightMode ? ROAD_COLOR_NIGHT : ROAD_COLOR_DAY;
  
  // 创建道路几何体
  const roadGeometry = useMemo(() => {
    const roads: { x: number; z: number; width: number; length: number; rotation: number }[] = [];
    
    // 主干道 - 南北向
    roads.push({ x: 0, z: 0, width: 3, length: 200, rotation: 0 });
    roads.push({ x: 30, z: 0, width: 2.5, length: 200, rotation: 0 });
    roads.push({ x: -30, z: 0, width: 2.5, length: 200, rotation: 0 });
    roads.push({ x: 60, z: 0, width: 2, length: 180, rotation: 0 });
    roads.push({ x: -60, z: 0, width: 2, length: 180, rotation: 0 });
    
    // 主干道 - 东西向
    roads.push({ x: 0, z: 0, width: 3, length: 200, rotation: Math.PI / 2 });
    roads.push({ x: 0, z: 30, width: 2.5, length: 200, rotation: Math.PI / 2 });
    roads.push({ x: 0, z: -30, width: 2.5, length: 200, rotation: Math.PI / 2 });
    roads.push({ x: 0, z: 60, width: 2, length: 180, rotation: Math.PI / 2 });
    roads.push({ x: 0, z: -60, width: 2, length: 180, rotation: Math.PI / 2 });
    
    // 次级道路 - 南北向
    for (let x = -45; x <= 45; x += 15) {
      if (x !== 0 && x !== 30 && x !== -30) {
        roads.push({ x, z: 0, width: 1.5, length: 160, rotation: 0 });
      }
    }
    
    // 次级道路 - 东西向
    for (let z = -45; z <= 45; z += 15) {
      if (z !== 0 && z !== 30 && z !== -30) {
        roads.push({ x: 0, z, width: 1.5, length: 160, rotation: Math.PI / 2 });
      }
    }
    
    // 合并所有道路几何体
    const positions: number[] = [];
    const y = 0.02;
    
    roads.forEach(road => {
      const halfWidth = road.width / 2;
      const halfLength = road.length / 2;
      
      // 计算旋转后的四个顶点
      const cos = Math.cos(road.rotation);
      const sin = Math.sin(road.rotation);
      
      const corners = [
        [-halfLength, -halfWidth],
        [halfLength, -halfWidth],
        [halfLength, halfWidth],
        [-halfLength, halfWidth],
      ];
      
      const transformed = corners.map(([lx, lw]) => [
        road.x + lx * cos - lw * sin,
        road.z + lx * sin + lw * cos,
      ]);
      
      // 两个三角形
      positions.push(
        transformed[0][0], y, transformed[0][1],
        transformed[1][0], y, transformed[1][1],
        transformed[2][0], y, transformed[2][1],
        
        transformed[0][0], y, transformed[0][1],
        transformed[2][0], y, transformed[2][1],
        transformed[3][0], y, transformed[3][1],
      );
    });
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);

  return (
    <mesh geometry={roadGeometry}>
      <meshBasicMaterial
        color={roadColor}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}


