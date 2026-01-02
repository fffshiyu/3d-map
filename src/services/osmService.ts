// OpenStreetMap 数据服务
// 使用 Overpass API 获取上海陆家嘴区域的建筑和道路数据

// 上海陆家嘴中心坐标
const CENTER = {
  lat: 31.2397,
  lng: 121.4998
};

// 地图范围（约 1.5km x 1.5km）
const BOUNDS = {
  south: 31.232,
  north: 31.247,
  west: 121.492,
  east: 121.508
};

// 上海中心大厦高度（真实高度632米，作为参考）
const SHANGHAI_TOWER_HEIGHT = 632;
// 3D场景中上海中心大厦的高度
const MAX_3D_HEIGHT = 32; // 632 * 0.05 ≈ 32

// 坐标转换：经纬度 -> 3D 坐标
export function latLngToPosition(lat: number, lng: number, scale: number = 8000): [number, number, number] {
  const x = (lng - CENTER.lng) * scale;
  const z = -(lat - CENTER.lat) * scale;
  return [x, 0, z];
}

// 建筑数据接口
export interface OSMBuilding {
  id: string;
  position: [number, number, number];
  vertices: [number, number][]; // 2D 轮廓点
  height: number;
  levels?: number;
  name?: string;
  type?: string;
}

// 道路数据接口
export interface OSMRoad {
  id: string;
  points: [number, number, number][];
  width: number;
  type: string;
  name?: string;
}

// Overpass API 查询 - 获取建筑
const BUILDINGS_QUERY = `
[out:json][timeout:30];
(
  way["building"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
  relation["building"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
);
out body;
>;
out skel qt;
`;

// Overpass API 查询 - 获取道路
const ROADS_QUERY = `
[out:json][timeout:30];
(
  way["highway"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
);
out body;
>;
out skel qt;
`;

// 获取建筑数据
export async function fetchBuildings(): Promise<OSMBuilding[]> {
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(BUILDINGS_QUERY)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch buildings');
    }
    
    const data = await response.json();
    return parseBuildings(data);
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return [];
  }
}

// 获取道路数据
export async function fetchRoads(): Promise<OSMRoad[]> {
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(ROADS_QUERY)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch roads');
    }
    
    const data = await response.json();
    return parseRoads(data);
  } catch (error) {
    console.error('Error fetching roads:', error);
    return [];
  }
}

// 解析建筑数据
function parseBuildings(data: any): OSMBuilding[] {
  const nodes: Map<number, { lat: number; lon: number }> = new Map();
  const buildings: OSMBuilding[] = [];
  
  // 首先收集所有节点
  data.elements.forEach((element: any) => {
    if (element.type === 'node') {
      nodes.set(element.id, { lat: element.lat, lon: element.lon });
    }
  });
  
  // 解析建筑
  data.elements.forEach((element: any) => {
    if (element.type === 'way' && element.tags?.building) {
      const vertices: [number, number][] = [];
      let centerLat = 0;
      let centerLng = 0;
      let validNodes = 0;
      
      element.nodes.forEach((nodeId: number) => {
        const node = nodes.get(nodeId);
        if (node) {
          const [x, , z] = latLngToPosition(node.lat, node.lon);
          vertices.push([x, z]);
          centerLat += node.lat;
          centerLng += node.lon;
          validNodes++;
        }
      });
      
      if (validNodes > 2) {
        centerLat /= validNodes;
        centerLng /= validNodes;
        
        // 计算建筑高度（真实米数）
        let heightInMeters = 12; // 默认高度 12米（约4层楼）
        
        if (element.tags.height) {
          heightInMeters = parseFloat(element.tags.height) || 12;
        } else if (element.tags['building:levels']) {
          heightInMeters = (parseInt(element.tags['building:levels']) || 4) * 3;
        } else if (element.tags.building === 'skyscraper') {
          heightInMeters = 150 + Math.random() * 100; // 150-250米
        } else if (element.tags.building === 'commercial' || element.tags.building === 'office') {
          heightInMeters = 30 + Math.random() * 50; // 30-80米
        } else if (element.tags.building === 'residential' || element.tags.building === 'apartments') {
          heightInMeters = 20 + Math.random() * 40; // 20-60米
        } else if (element.tags.building === 'retail' || element.tags.building === 'shop') {
          heightInMeters = 8 + Math.random() * 12; // 8-20米
        } else if (element.tags.building === 'house') {
          heightInMeters = 6 + Math.random() * 6; // 6-12米
        }
        
        // 限制普通建筑高度，不能超过地标建筑
        // 上海中心大厦是最高的（632米），其他普通建筑最高200米
        heightInMeters = Math.min(heightInMeters, 200);
        heightInMeters = Math.max(heightInMeters, 5);
        
        // 转换为3D高度（与地标使用相同的缩放因子 0.05）
        const height3D = heightInMeters * 0.05;
        
        const position = latLngToPosition(centerLat, centerLng);
        
        buildings.push({
          id: `building-${element.id}`,
          position,
          vertices,
          height: height3D,
          levels: element.tags['building:levels'],
          name: element.tags.name,
          type: element.tags.building
        });
      }
    }
  });
  
  return buildings;
}

// 解析道路数据
function parseRoads(data: any): OSMRoad[] {
  const nodes: Map<number, { lat: number; lon: number }> = new Map();
  const roads: OSMRoad[] = [];
  
  // 收集节点
  data.elements.forEach((element: any) => {
    if (element.type === 'node') {
      nodes.set(element.id, { lat: element.lat, lon: element.lon });
    }
  });
  
  // 解析道路
  data.elements.forEach((element: any) => {
    if (element.type === 'way' && element.tags?.highway) {
      const points: [number, number, number][] = [];
      
      element.nodes.forEach((nodeId: number) => {
        const node = nodes.get(nodeId);
        if (node) {
          points.push(latLngToPosition(node.lat, node.lon));
        }
      });
      
      if (points.length > 1) {
        // 根据道路类型设置宽度
        let width = 1;
        const type = element.tags.highway;
        
        if (type === 'motorway' || type === 'trunk') {
          width = 4;
        } else if (type === 'primary') {
          width = 3;
        } else if (type === 'secondary') {
          width = 2.5;
        } else if (type === 'tertiary') {
          width = 2;
        } else if (type === 'residential' || type === 'unclassified') {
          width = 1.5;
        } else if (type === 'service') {
          width = 1;
        } else if (type === 'footway' || type === 'path' || type === 'pedestrian') {
          width = 0.8;
        } else if (type === 'cycleway') {
          width = 0.6;
        } else {
          width = 1;
        }
        
        roads.push({
          id: `road-${element.id}`,
          points,
          width,
          type,
          name: element.tags.name
        });
      }
    }
  });
  
  return roads;
}

// 获取所有地图数据
export async function fetchMapData(): Promise<{
  buildings: OSMBuilding[];
  roads: OSMRoad[];
}> {
  const [buildings, roads] = await Promise.all([
    fetchBuildings(),
    fetchRoads()
  ]);
  
  return { buildings, roads };
}
