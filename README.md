# Shanghai Landmarks | Real-time 3D Geospatial Visualization

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61dafb?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178c6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Three.js-r160-black?style=flat-square&logo=threedotjs" />
  <img src="https://img.shields.io/badge/OpenStreetMap-API-7EBC6F?style=flat-square&logo=openstreetmap" />
  <img src="https://img.shields.io/badge/Vite-5.0-646cff?style=flat-square&logo=vite" />
</p>

A high-performance 3D geospatial visualization application that renders real-world OpenStreetMap data in a WebGL environment. This project demonstrates advanced frontend engineering capabilities including GPU-accelerated rendering, real-time data processing, and complex state management.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  React 18    │  │  Zustand     │  │  Framer Motion       │  │
│  │  Components  │  │  State Mgmt  │  │  UI Animations       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      3D Rendering Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Three.js    │  │  R3F         │  │  Custom Shaders      │  │
│  │  WebGL Core  │  │  Declarative │  │  GLSL Programs       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                       Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Overpass    │  │  GeoJSON     │  │  Coordinate          │  │
│  │  API Client  │  │  Parser      │  │  Transformation      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Technical Implementations

### 1. Real-time OSM Data Integration

Fetches and processes live OpenStreetMap data via Overpass API, converting GeoJSON geometries to 3D renderable objects.

```typescript
// Coordinate transformation: WGS84 → Scene coordinates
export function latLngToPosition(lat: number, lng: number): [number, number, number] {
  const x = (lng - CENTER.lng) * SCALE_FACTOR;
  const z = -(lat - CENTER.lat) * SCALE_FACTOR;
  return [x, 0, z];
}

// Building height extraction with fallback logic
function getBuildingHeight(tags: OSMTags): number {
  if (tags.height) return parseFloat(tags.height);
  if (tags['building:levels']) return parseInt(tags['building:levels']) * 3;
  return DEFAULT_HEIGHT_BY_TYPE[tags.building] || 12;
}
```

### 2. GPU-Instanced Geometry Rendering

Renders thousands of buildings with minimal draw calls using Three.js InstancedMesh and BufferGeometry merging.

```typescript
// Merge all building geometries into single buffer
const mergedGeometry = useMemo(() => {
  const positions: number[] = [];
  const normals: number[] = [];
  
  buildings.forEach(building => {
    // Generate box vertices for each building
    appendBoxGeometry(positions, normals, building);
  });
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  return geometry;
}, [buildings]);
```

**Performance Metrics:**
- 1000+ buildings rendered at 60fps
- Single draw call for all static geometry
- Memory-efficient buffer reuse

### 3. Declarative 3D Scene Management

Leverages React Three Fiber for component-based 3D scene composition with hooks-based state synchronization.

```typescript
// Scene composition with R3F
<Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
  <Suspense fallback={null}>
    <Environment />
    <OSMBuildings />
    <OSMRoads />
    <LandmarkMarkers onClick={handleLandmarkClick} />
    <CameraController />
  </Suspense>
</Canvas>
```

### 4. Dynamic Camera System

Implements smooth camera transitions with height-aware distance calculation for optimal landmark viewing.

```typescript
// Adaptive camera positioning based on building height
useEffect(() => {
  if (focusedLandmark) {
    const buildingHeight = landmark.height * HEIGHT_SCALE;
    const heightFactor = Math.max(1, buildingHeight / 15);
    const distance = 35 + buildingHeight * 0.8 * heightFactor;
    
    targetPosition.current.set(
      pos[0] + distance * Math.cos(angle),
      Math.max(20, buildingHeight * 0.4 + 15),
      pos[2] + distance * Math.sin(angle)
    );
  }
}, [focusedLandmark]);

// Smooth interpolation in render loop
useFrame(() => {
  camera.position.lerp(targetPosition.current, 0.04);
  controls.target.lerp(targetLookAt.current, 0.04);
});
```

### 5. Optimized State Architecture

Uses Zustand for lightweight, subscription-based state management with async loading coordination.

```typescript
export const useStore = create<AppStore>((set, get) => ({
  buildingsLoaded: false,
  roadsLoaded: false,
  isLoading: true,
  
  setBuildingsLoaded: (loaded) => {
    set({ buildingsLoaded: loaded });
    if (loaded && get().roadsLoaded) set({ isLoading: false });
  },
  
  setRoadsLoaded: (loaded) => {
    set({ roadsLoaded: loaded });
    if (loaded && get().buildingsLoaded) set({ isLoading: false });
  },
}));
```

## Project Structure

```
src/
├── components/
│   ├── Scene/                    # 3D Rendering Components
│   │   ├── index.tsx             # Scene composition & event handling
│   │   ├── OSMBuildings.tsx      # Real OSM building renderer
│   │   ├── OSMRoads.tsx          # Road network renderer
│   │   ├── LandmarkMarker.tsx    # Interactive POI markers
│   │   ├── CameraController.tsx  # Animated camera system
│   │   ├── Ground.tsx            # Terrain plane
│   │   ├── Trees.tsx             # Vegetation instances
│   │   ├── Lights.tsx            # Scene lighting
│   │   └── Environment.tsx       # Fog & background
│   └── UI/                       # React UI Layer
│       ├── Header.tsx            # App bar with sidebar integration
│       ├── WelcomeScreen.tsx     # Loading & entry screen
│       ├── LandmarkDetail.tsx    # POI information panel
│       ├── Compass.tsx           # Navigation control
│       └── Hint.tsx              # User guidance
├── services/
│   └── osmService.ts             # Overpass API client & parser
├── data/
│   └── landmarks.ts              # Shanghai POI dataset
├── store/
│   └── useStore.ts               # Global state management
├── types/
│   └── index.ts                  # TypeScript definitions
└── index.css                     # Design system & theming
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **UI Framework** | React 18 + TypeScript | Component architecture, type safety |
| **3D Engine** | Three.js + React Three Fiber | WebGL rendering, declarative 3D |
| **State** | Zustand | Lightweight global state |
| **Animation** | Framer Motion | UI micro-interactions |
| **Data Source** | OpenStreetMap Overpass API | Real-world geospatial data |
| **Build** | Vite 5 | Fast HMR, optimized bundling |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

## Key Features

- **Real Map Data**: Live OpenStreetMap building and road data for Shanghai Lujiazui district
- **GPU Optimization**: Instanced rendering for 1000+ buildings at 60fps
- **Smooth Interactions**: Two-stage click interaction with animated camera transitions
- **Responsive Design**: Adaptive UI for desktop and mobile
- **Loading State Management**: Coordinated async data loading with visual feedback

## License

MIT License

---

<p align="center">
  <strong>Built with React + Three.js + OpenStreetMap</strong>
</p>
