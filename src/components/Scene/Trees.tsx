import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { generateTrees } from '../../data/landmarks';
import { useStore } from '../../store/useStore';

// 树木颜色 - 参考原项目
const TREE_COLOR_LIGHT = '#7cb342';
const TREE_COLOR_DARK = '#558b2f';
const TREE_COLOR_NIGHT = '#1a3a1a';
const TRUNK_COLOR_DAY = '#8B4513';
const TRUNK_COLOR_NIGHT = '#2a1a0a';

// 树木组件 - 使用 InstancedMesh 高效渲染
export function Trees() {
  const crownRef = useRef<THREE.InstancedMesh>(null);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const isNightMode = useStore((state) => state.isNightMode);
  
  // 生成树木数据
  const trees = useMemo(() => generateTrees(), []);
  
  // 临时对象用于矩阵计算
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  // 初始化树木实例
  useEffect(() => {
    if (!crownRef.current || !trunkRef.current) return;
    
    trees.forEach((tree, i) => {
      const scale = tree.scale;
      const radius = 1.2 + (i % 10) * 0.08; // 用索引替代随机，保证一致性
      const trunkHeight = 0.8 + (i % 5) * 0.08;
      
      // 树冠位置和缩放
      tempObject.position.set(tree.position[0], trunkHeight + radius * 0.7 * scale, tree.position[2]);
      tempObject.scale.set(radius * scale, radius * scale, radius * scale);
      tempObject.updateMatrix();
      crownRef.current!.setMatrixAt(i, tempObject.matrix);
      
      // 树干位置和缩放
      tempObject.position.set(tree.position[0], trunkHeight / 2 * scale, tree.position[2]);
      tempObject.scale.set(radius * 0.2 * scale, trunkHeight * scale, radius * 0.2 * scale);
      tempObject.updateMatrix();
      trunkRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    
    crownRef.current.instanceMatrix.needsUpdate = true;
    trunkRef.current.instanceMatrix.needsUpdate = true;
  }, [trees, tempObject]);

  // 根据夜间模式选择颜色
  const crownColor = isNightMode ? TREE_COLOR_NIGHT : TREE_COLOR_LIGHT;
  const trunkColor = isNightMode ? TRUNK_COLOR_NIGHT : TRUNK_COLOR_DAY;

  return (
    <group>
      {/* 树冠 - 球形 */}
      <instancedMesh
        ref={crownRef}
        args={[undefined, undefined, trees.length]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial
          color={crownColor}
          roughness={0.85}
          metalness={0}
        />
      </instancedMesh>
      
      {/* 树干 - 圆柱形 */}
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, trees.length]}
        castShadow
      >
        <cylinderGeometry args={[1, 1.2, 1, 6]} />
        <meshStandardMaterial
          color={trunkColor}
          roughness={0.9}
          metalness={0}
        />
      </instancedMesh>
    </group>
  );
}
