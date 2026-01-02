import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { fetchRoads, type OSMRoad } from '../../services/osmService';

// 道路颜色 - 与地面形成对比
const ROAD_COLOR_DAY = '#c0b8b0';
const ROAD_COLOR_NIGHT = '#1e1e2a';

// OpenStreetMap 真实道路组件
export function OSMRoads() {
  const [roads, setRoads] = useState<OSMRoad[]>([]);
  const isNightMode = useStore((state) => state.isNightMode);
  const setRoadsLoaded = useStore((state) => state.setRoadsLoaded);

  // 获取道路数据
  useEffect(() => {
    fetchRoads().then((data) => {
      setRoads(data);
      setRoadsLoaded(true);
      console.log(`Loaded ${data.length} roads from OpenStreetMap`);
    }).catch(() => {
      setRoadsLoaded(true);
    });
  }, [setRoadsLoaded]);

  // 合并所有道路几何体
  const mergedGeometry = useMemo(() => {
    if (roads.length === 0) return null;

    const positions: number[] = [];
    const y = 0.03; // 稍微抬高避免z-fighting

    roads.forEach((road) => {
      if (road.points.length < 2) return;

      // 增加道路宽度使其更平滑
      const width = Math.max(road.width * 1.3, 1);

      for (let i = 0; i < road.points.length - 1; i++) {
        const start = road.points[i];
        const end = road.points[i + 1];
        
        const dx = end[0] - start[0];
        const dz = end[2] - start[2];
        const length = Math.sqrt(dx * dx + dz * dz);
        
        if (length < 0.05) continue;
        
        // 计算垂直方向
        const nx = -dz / length * width / 2;
        const nz = dx / length * width / 2;
        
        // 两个三角形组成一个道路段
        positions.push(
          start[0] + nx, y, start[2] + nz,
          start[0] - nx, y, start[2] - nz,
          end[0] + nx, y, end[2] + nz,
          
          start[0] - nx, y, start[2] - nz,
          end[0] - nx, y, end[2] - nz,
          end[0] + nx, y, end[2] + nz,
        );
      }
    });

    if (positions.length === 0) return null;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    
    return geometry;
  }, [roads]);

  if (!mergedGeometry) {
    return null;
  }

  const roadColor = isNightMode ? ROAD_COLOR_NIGHT : ROAD_COLOR_DAY;

  return (
    <mesh geometry={mergedGeometry}>
      <meshBasicMaterial
        color={roadColor}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
