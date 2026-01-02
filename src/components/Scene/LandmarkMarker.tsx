import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Landmark } from '../../types';
import { useStore } from '../../store/useStore';

interface LandmarkMarkerProps {
  landmark: Landmark;
  onClick: (landmark: Landmark) => void;
}

// 标记颜色 - 红色
const MARKER_COLOR = '#e53935';

// 建筑高度缩放因子
const HEIGHT_SCALE = 0.05;

export function LandmarkMarker({ landmark, onClick }: LandmarkMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const markerRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const { focusedLandmark, showLabels, isNightMode } = useStore();
  const isFocused = focusedLandmark?.id === landmark.id;
  
  // 计算建筑高度
  const buildingHeight = landmark.height * HEIGHT_SCALE;
  
  // 根据类别获取建筑尺寸
  const getBuildingSize = () => {
    switch (landmark.category) {
      case 'skyscraper':
        return { width: 3, depth: 3 };
      case 'historic':
        return { width: 8, depth: 5 };
      case 'cultural':
        return { width: 6, depth: 6 };
      case 'park':
        return { width: 10, depth: 10 };
      default:
        return { width: 4, depth: 4 };
    }
  };
  
  const buildingSize = getBuildingSize();
  
  // 标记位置 - 建筑顶部上方
  const markerY = buildingHeight + 5;
  
  // 动画 - 竖着自转
  useFrame((state) => {
    if (markerRef.current) {
      // 绕Y轴旋转
      markerRef.current.rotation.y = state.clock.elapsedTime * 1.5;
    }
  });

  // 建筑颜色
  const buildingColor = isNightMode ? '#2a2a3a' : '#d0d0d0';
  const buildingEmissive = isNightMode ? landmark.color : '#000000';
  
  // 处理点击
  const handleClick = (e: THREE.Event) => {
    e.stopPropagation();
    onClick(landmark);
  };

  return (
    <group
      ref={groupRef}
      position={[landmark.position[0], 0, landmark.position[2]]}
    >
      {/* 建筑物模型 */}
      <mesh
        position={[0, buildingHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[buildingSize.width, buildingHeight, buildingSize.depth]} />
        <meshStandardMaterial
          color={buildingColor}
          roughness={0.7}
          metalness={0.2}
          emissive={buildingEmissive}
          emissiveIntensity={isNightMode ? 0.15 : 0}
        />
      </mesh>
      
      {/* 摩天楼顶部装饰 */}
      {landmark.category === 'skyscraper' && buildingHeight > 15 && (
        <mesh position={[0, buildingHeight + 1, 0]}>
          <coneGeometry args={[1.5, 3, 8]} />
          <meshStandardMaterial
            color={buildingColor}
            roughness={0.5}
            metalness={0.3}
            emissive={buildingEmissive}
            emissiveIntensity={isNightMode ? 0.2 : 0}
          />
        </mesh>
      )}
      
      {/* 红色实心圆标记 - 在建筑上方，竖着自转 */}
      <mesh
        ref={markerRef}
        position={[0, markerY, 0]}
        onClick={handleClick}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <circleGeometry args={[hovered || isFocused ? 2.5 : 2, 32]} />
        <meshBasicMaterial
          color={hovered || isFocused ? '#ffffff' : MARKER_COLOR}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 连接线 - 从标记到建筑顶部 */}
      <mesh position={[0, buildingHeight + (markerY - buildingHeight) / 2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, markerY - buildingHeight, 8]} />
        <meshBasicMaterial color={MARKER_COLOR} transparent opacity={0.5} />
      </mesh>
      
      {/* 标签 - 可点击 */}
      {showLabels && (
        <Html
          center
          position={[0, markerY + 4, 0]}
          distanceFactor={25}
          style={{
            pointerEvents: 'auto',
            userSelect: 'none',
            cursor: 'pointer',
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              onClick(landmark);
            }}
            onMouseEnter={() => {
              setHovered(true);
              document.body.style.cursor = 'pointer';
            }}
            onMouseLeave={() => {
              setHovered(false);
              document.body.style.cursor = 'auto';
            }}
            style={{
              background: isNightMode 
                ? 'rgba(10, 10, 26, 0.95)' 
                : 'rgba(255, 255, 255, 0.98)',
              color: isNightMode ? '#f0f6fc' : '#1a1a1a',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: hovered || isFocused 
                ? '0 6px 20px rgba(229, 57, 53, 0.4)' 
                : '0 4px 12px rgba(0,0,0,0.15)',
              borderBottom: `3px solid ${landmark.color}`,
              transition: 'all 0.2s ease',
              transform: hovered || isFocused ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {landmark.nameEn}
          </div>
        </Html>
      )}
    </group>
  );
}
