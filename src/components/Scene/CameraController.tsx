import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

// 建筑高度缩放因子（与 LandmarkMarker 保持一致）
const HEIGHT_SCALE = 0.05;

// 相机控制器 - 处理聚焦动画
export function CameraController() {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  
  const { focusedLandmark, selectedLandmark } = useStore();
  
  // 动画状态
  const animating = useRef(false);
  const targetPosition = useRef(new THREE.Vector3(0, 60, 80));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  
  // 初始位置
  useEffect(() => {
    camera.position.set(0, 60, 80);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
    }
  }, [camera]);
  
  // 聚焦地标 - 根据建筑高度调整距离
  useEffect(() => {
    if (focusedLandmark) {
      const pos = focusedLandmark.position;
      const buildingHeight = focusedLandmark.height * HEIGHT_SCALE;
      
      // 根据建筑高度动态计算距离 - 高建筑需要更远的距离
      const minDistance = 35;
      const heightFactor = Math.max(1, buildingHeight / 15); // 超过15单位的建筑需要更远
      const distance = minDistance + buildingHeight * 0.8 * heightFactor;
      
      // 相机高度也根据建筑高度调整
      const cameraHeight = Math.max(20, buildingHeight * 0.4 + 15);
      
      // 从斜上方观看建筑
      const angle = Math.PI / 4;
      
      targetPosition.current.set(
        pos[0] + distance * Math.cos(angle),
        cameraHeight,
        pos[2] + distance * Math.sin(angle)
      );
      
      // 看向建筑中部偏下
      targetLookAt.current.set(
        pos[0],
        buildingHeight * 0.35,
        pos[2]
      );
      
      animating.current = true;
    } else if (!selectedLandmark) {
      // 重置视角
      targetPosition.current.set(0, 60, 80);
      targetLookAt.current.set(0, 0, 0);
      animating.current = true;
    }
  }, [focusedLandmark, selectedLandmark]);
  
  // 平滑动画
  useFrame(() => {
    if (!animating.current || !controlsRef.current) return;
    
    const speed = 0.04;
    
    // 插值相机位置
    camera.position.lerp(targetPosition.current, speed);
    controlsRef.current.target.lerp(targetLookAt.current, speed);
    
    // 检查是否完成动画
    const posDist = camera.position.distanceTo(targetPosition.current);
    const targetDist = controlsRef.current.target.distanceTo(targetLookAt.current);
    
    if (posDist < 0.1 && targetDist < 0.1) {
      animating.current = false;
    }
    
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={15}
      maxDistance={200}
      maxPolarAngle={Math.PI / 2.1}
      minPolarAngle={Math.PI / 8}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
    />
  );
}
