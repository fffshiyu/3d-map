import { useEffect, useState, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { fetchBuildings, type OSMBuilding } from '../../services/osmService';

// 建筑颜色
const BUILDING_COLOR_DAY = '#d8d8d8';
const BUILDING_COLOR_NIGHT = '#2a2a3a';

// OpenStreetMap 真实建筑组件
export function OSMBuildings() {
  const [buildings, setBuildings] = useState<OSMBuilding[]>([]);
  const isNightMode = useStore((state) => state.isNightMode);
  const setBuildingsLoaded = useStore((state) => state.setBuildingsLoaded);
  const mergedGeometryRef = useRef<THREE.BufferGeometry | null>(null);

  // 获取建筑数据
  useEffect(() => {
    fetchBuildings().then((data) => {
      setBuildings(data);
      setBuildingsLoaded(true);
      console.log(`Loaded ${data.length} buildings from OpenStreetMap`);
    }).catch(() => {
      setBuildingsLoaded(true);
    });
  }, [setBuildingsLoaded]);

  // 合并所有建筑几何体
  const mergedGeometry = useMemo(() => {
    if (buildings.length === 0) return null;

    const positions: number[] = [];
    const normals: number[] = [];

    buildings.forEach((building) => {
      if (building.vertices.length < 3) return;

      // 计算建筑中心和边界
      let minX = Infinity, maxX = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;
      
      building.vertices.forEach(([x, z]) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      });
      
      const centerX = (minX + maxX) / 2;
      const centerZ = (minZ + maxZ) / 2;
      const width = maxX - minX;
      const depth = maxZ - minZ;
      const height = building.height;
      
      // 简化为立方体（减少锯齿）
      const hw = width / 2;
      const hd = depth / 2;
      
      // 前面
      positions.push(
        centerX - hw, 0, centerZ + hd,
        centerX + hw, 0, centerZ + hd,
        centerX + hw, height, centerZ + hd,
        centerX - hw, 0, centerZ + hd,
        centerX + hw, height, centerZ + hd,
        centerX - hw, height, centerZ + hd,
      );
      for (let i = 0; i < 6; i++) normals.push(0, 0, 1);
      
      // 后面
      positions.push(
        centerX + hw, 0, centerZ - hd,
        centerX - hw, 0, centerZ - hd,
        centerX - hw, height, centerZ - hd,
        centerX + hw, 0, centerZ - hd,
        centerX - hw, height, centerZ - hd,
        centerX + hw, height, centerZ - hd,
      );
      for (let i = 0; i < 6; i++) normals.push(0, 0, -1);
      
      // 左面
      positions.push(
        centerX - hw, 0, centerZ - hd,
        centerX - hw, 0, centerZ + hd,
        centerX - hw, height, centerZ + hd,
        centerX - hw, 0, centerZ - hd,
        centerX - hw, height, centerZ + hd,
        centerX - hw, height, centerZ - hd,
      );
      for (let i = 0; i < 6; i++) normals.push(-1, 0, 0);
      
      // 右面
      positions.push(
        centerX + hw, 0, centerZ + hd,
        centerX + hw, 0, centerZ - hd,
        centerX + hw, height, centerZ - hd,
        centerX + hw, 0, centerZ + hd,
        centerX + hw, height, centerZ - hd,
        centerX + hw, height, centerZ + hd,
      );
      for (let i = 0; i < 6; i++) normals.push(1, 0, 0);
      
      // 顶面
      positions.push(
        centerX - hw, height, centerZ + hd,
        centerX + hw, height, centerZ + hd,
        centerX + hw, height, centerZ - hd,
        centerX - hw, height, centerZ + hd,
        centerX + hw, height, centerZ - hd,
        centerX - hw, height, centerZ - hd,
      );
      for (let i = 0; i < 6; i++) normals.push(0, 1, 0);
    });

    if (positions.length === 0) return null;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    
    return geometry;
  }, [buildings]);

  // 清理旧几何体
  useEffect(() => {
    return () => {
      if (mergedGeometryRef.current) {
        mergedGeometryRef.current.dispose();
      }
    };
  }, []);

  if (!mergedGeometry) {
    return null;
  }

  const buildingColor = isNightMode ? BUILDING_COLOR_NIGHT : BUILDING_COLOR_DAY;

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
