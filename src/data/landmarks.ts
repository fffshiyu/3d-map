import type { Landmark } from '../types';

// 上海陆家嘴中心坐标
const CENTER = {
  lat: 31.2397,
  lng: 121.4998
};

// 坐标转换函数
function latLngToPosition(lat: number, lng: number): [number, number, number] {
  const scale = 8000;
  const x = (lng - CENTER.lng) * scale;
  const z = -(lat - CENTER.lat) * scale;
  return [x, 0, z];
}

// 上海著名地标数据 - 使用真实经纬度坐标
export const SHANGHAI_LANDMARKS: Landmark[] = [
  {
    id: 'oriental-pearl',
    name: '东方明珠',
    nameEn: 'Oriental Pearl Tower',
    description: '上海的标志性建筑，高468米，是亚洲第四高塔。塔内设有旋转餐厅、观光层和上海城市历史发展陈列馆。',
    position: latLngToPosition(31.2397, 121.4998),
    coordinates: { lat: 31.2397, lng: 121.4998 },
    height: 468,
    color: '#FF6B9D',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Pudong_Shanghai_November_2017_panorama.jpg/1280px-Pudong_Shanghai_November_2017_panorama.jpg',
    category: 'skyscraper'
  },
  {
    id: 'shanghai-tower',
    name: '上海中心大厦',
    nameEn: 'Shanghai Tower',
    description: '中国第一高楼，世界第三高楼，高632米。其螺旋上升的外形设计寓意"龙的传人"。',
    position: latLngToPosition(31.2357, 121.5016),
    coordinates: { lat: 31.2357, lng: 121.5016 },
    height: 632,
    color: '#4ECDC4',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Shanghai_Tower_2015.jpg/800px-Shanghai_Tower_2015.jpg',
    category: 'skyscraper'
  },
  {
    id: 'jin-mao',
    name: '金茂大厦',
    nameEn: 'Jin Mao Tower',
    description: '高420.5米，是上海地标性建筑之一。其设计融合了中国传统建筑风格与现代建筑技术。',
    position: latLngToPosition(31.2353, 121.5055),
    coordinates: { lat: 31.2353, lng: 121.5055 },
    height: 420,
    color: '#FFE66D',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Jin_Mao_Tower_2007.jpg/800px-Jin_Mao_Tower_2007.jpg',
    category: 'skyscraper'
  },
  {
    id: 'swfc',
    name: '环球金融中心',
    nameEn: 'Shanghai World Financial Center',
    description: '高492米，因顶部独特的梯形开口设计而被称为"开瓶器"。设有世界最高的观光天阁。',
    position: latLngToPosition(31.2347, 121.5074),
    coordinates: { lat: 31.2347, lng: 121.5074 },
    height: 492,
    color: '#95E1D3',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Shanghai_World_Financial_Center.jpg/800px-Shanghai_World_Financial_Center.jpg',
    category: 'skyscraper'
  },
  {
    id: 'the-bund',
    name: '外滩',
    nameEn: 'The Bund',
    description: '上海的标志性景观，全长1.5公里，汇集了52幢风格各异的历史建筑，被誉为"万国建筑博览群"。',
    position: latLngToPosition(31.2400, 121.4900),
    coordinates: { lat: 31.2400, lng: 121.4900 },
    height: 50,
    color: '#DDA0DD',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/The_Bund_at_Night%2C_Shanghai.jpg/1280px-The_Bund_at_Night%2C_Shanghai.jpg',
    category: 'historic'
  },
  {
    id: 'ifc',
    name: '上海国金中心',
    nameEn: 'Shanghai IFC',
    description: '位于陆家嘴金融贸易区的超高层摩天大楼，是上海重要的商业地标。',
    position: latLngToPosition(31.2380, 121.5030),
    coordinates: { lat: 31.2380, lng: 121.5030 },
    height: 260,
    color: '#98D8C8',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Shanghai_IFC.jpg/800px-Shanghai_IFC.jpg',
    category: 'skyscraper'
  },
  {
    id: 'lujiazui-park',
    name: '陆家嘴中心绿地',
    nameEn: 'Lujiazui Central Green',
    description: '位于陆家嘴金融区中心的大型城市公园，是摩天大楼间的绿色休憩空间。',
    position: latLngToPosition(31.2370, 121.5000),
    coordinates: { lat: 31.2370, lng: 121.5000 },
    height: 5,
    color: '#82E0AA',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Lujiazui_Central_Greenland.jpg/1280px-Lujiazui_Central_Greenland.jpg',
    category: 'park'
  },
  {
    id: 'aquarium',
    name: '上海海洋水族馆',
    nameEn: 'Shanghai Ocean Aquarium',
    description: '亚洲最大的海洋水族馆之一，拥有世界上最长的海底隧道。',
    position: latLngToPosition(31.2410, 121.5010),
    coordinates: { lat: 31.2410, lng: 121.5010 },
    height: 25,
    color: '#F7DC6F',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Shanghai_Ocean_Aquarium.jpg/1280px-Shanghai_Ocean_Aquarium.jpg',
    category: 'cultural'
  }
];

// 树木区域配置 - 分布在陆家嘴周边
const TREE_AREAS = [
  { cx: -70, cz: 40, count: 20, spread: 15 },
  { cx: 70, cz: -50, count: 18, spread: 15 },
  { cx: -60, cz: -60, count: 15, spread: 12 },
  { cx: 60, cz: 50, count: 18, spread: 14 },
  { cx: -80, cz: 0, count: 12, spread: 10 },
  { cx: 0, cz: 70, count: 10, spread: 8 },
  { cx: 0, cz: -70, count: 10, spread: 8 },
  { cx: 80, cz: 0, count: 12, spread: 10 },
];

// 树木数据
export interface TreeData {
  id: string;
  position: [number, number, number];
  scale: number;
  colorVariant: number;
}

// 生成树木数据
export function generateTrees(): TreeData[] {
  const trees: TreeData[] = [];

  TREE_AREAS.forEach((area, areaIndex) => {
    for (let i = 0; i < area.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * area.spread;
      const x = area.cx + Math.cos(angle) * distance;
      const z = area.cz + Math.sin(angle) * distance;

      trees.push({
        id: `tree-${areaIndex}-${i}`,
        position: [x, 0, z],
        scale: 0.6 + Math.random() * 0.6,
        colorVariant: Math.random() > 0.4 ? 0 : 1
      });
    }
  });

  return trees;
}

// 道路配置（备用，如果 OSM 加载失败）
export const ROAD_CONFIG = {
  mainRoads: [
    { x: 0, z: 0, width: 200, height: 5, rotation: 0 },
    { x: 0, z: 0, width: 200, height: 5, rotation: Math.PI / 2 },
  ],
  secondaryRoads: [
    { x: 30, z: 0, width: 80, height: 3, rotation: Math.PI / 2 },
    { x: -30, z: 0, width: 80, height: 3, rotation: Math.PI / 2 },
  ]
};
