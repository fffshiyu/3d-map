import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    camera: {
        fov: 45,
        near: 0.1,
        far: 1000,
        // Start with 45 degree angled view
        position: { x: 0, y: 80, z: 80 },
        lookAt: { x: 0, y: 0, z: 0 }
    },
    map: {
        size: 400,
        gridSize: 15
    },
    colors: {
        ground: 0xf5f0e8,
        groundDark: 0xe8e0d0,
        road: 0xffffff,
        roadLine: 0xd0d0d0,
        building: 0xd8d8d8,
        tree: 0x7cb342,
        treeDark: 0x558b2f,
        marker: 0xff4757,
        markerGlow: 0xff6b7a
    },
    postProcessing: true
};

// ============================================
// LOCATIONS DATA - English
// ============================================
const LOCATIONS = [
    {
        id: 'beijing',
        name: 'Beijing',
        category: 'Historic Capital',
        description: 'Capital of China with over 3,000 years of history. Home to the Forbidden City and the Great Wall.',
        position: { x: 25, z: -30 },
        image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
        rating: '4.9'
    },
    {
        id: 'shanghai',
        name: 'Shanghai',
        category: 'Modern Metropolis',
        description: 'China\'s largest city and financial hub. A blend of East and West culture.',
        position: { x: 45, z: 10 },
        image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800',
        rating: '4.8'
    },
    {
        id: 'hangzhou',
        name: 'Hangzhou',
        category: 'Paradise on Earth',
        description: 'Famous for the scenic West Lake. One of China\'s most beautiful cities.',
        position: { x: 35, z: 25 },
        image: 'https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=800',
        rating: '4.9'
    },
    {
        id: 'xian',
        name: 'Xi\'an',
        category: 'Ancient Capital',
        description: 'Former capital of 13 dynasties. Home to the Terracotta Warriors.',
        position: { x: -20, z: -20 },
        image: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=800',
        rating: '4.8'
    },
    {
        id: 'chengdu',
        name: 'Chengdu',
        category: 'Land of Abundance',
        description: 'Home of giant pandas. Famous for laid-back lifestyle and spicy cuisine.',
        position: { x: -35, z: 15 },
        image: 'https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=800',
        rating: '4.7'
    },
    {
        id: 'guilin',
        name: 'Guilin',
        category: 'Natural Wonder',
        description: 'Karst mountain landscapes. The Li River scenery is world-renowned.',
        position: { x: -10, z: 35 },
        image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800',
        rating: '4.9'
    },
    {
        id: 'suzhou',
        name: 'Suzhou',
        category: 'Garden City',
        description: 'Classical gardens are UNESCO World Heritage sites. Venice of the East.',
        position: { x: 50, z: -15 },
        image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800',
        rating: '4.8'
    },
    {
        id: 'lijiang',
        name: 'Lijiang',
        category: 'Ancient Town',
        description: 'UNESCO World Heritage old town. Gateway to the Jade Dragon Snow Mountain.',
        position: { x: -45, z: 0 },
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
        rating: '4.7'
    }
];

// ============================================
// MAIN APPLICATION CLASS
// ============================================
class Map3DApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;
        this.markers = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clock = new THREE.Clock();
        this.isNightMode = false;
        this.treeTexture = null;
        this.textureLoader = new THREE.TextureLoader();
        this.focusedMarker = null; // Track focused marker
        
        this.init();
    }
    
    async init() {
        await this.setupScene();
        await this.loadTextures();
        this.createGround();
        this.createGridLines();
        this.createRoads();
        this.createTrees();
        this.createBuildings();
        this.createMarkers();
        this.setupLighting();
        this.setupPostProcessing();
        this.setupControls();
        this.setupEventListeners();
        this.setupUI();
        this.animate();
        
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 800);
    }
    
    async loadTextures() {
        return new Promise((resolve) => {
            this.treeTexture = this.textureLoader.load('greenNormal.png', () => {
                resolve();
            }, undefined, () => {
                // If texture fails to load, continue without it
                this.treeTexture = null;
                resolve();
            });
            
            if (this.treeTexture) {
                this.treeTexture.wrapS = THREE.RepeatWrapping;
                this.treeTexture.wrapT = THREE.RepeatWrapping;
            }
        });
    }
    
    // ----------------------------------------
    // Scene Setup
    // ----------------------------------------
    async setupScene() {
        const container = document.getElementById('canvas-container');
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        this.scene.fog = new THREE.Fog(0xffffff, 120, 280);
        
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        this.camera.position.set(
            CONFIG.camera.position.x,
            CONFIG.camera.position.y,
            CONFIG.camera.position.z
        );
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        container.appendChild(this.renderer.domElement);
    }
    
    // ----------------------------------------
    // Ground
    // ----------------------------------------
    createGround() {
        const size = CONFIG.map.size;
        
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.ground,
            roughness: 0.95,
            metalness: 0.0
        });
        
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }
    
    // ----------------------------------------
    // Grid Lines
    // ----------------------------------------
    createGridLines() {
        const size = CONFIG.map.size;
        const gridGroup = new THREE.Group();
        const gridMaterial = new THREE.LineBasicMaterial({ 
            color: CONFIG.colors.groundDark,
            transparent: true,
            opacity: 0.15
        });
        
        const step = CONFIG.map.gridSize;
        const halfSize = size / 2;
        
        for (let i = -halfSize; i <= halfSize; i += step) {
            const hPoints = [
                new THREE.Vector3(-halfSize, 0.02, i),
                new THREE.Vector3(halfSize, 0.02, i)
            ];
            const hGeometry = new THREE.BufferGeometry().setFromPoints(hPoints);
            gridGroup.add(new THREE.Line(hGeometry, gridMaterial));
            
            const vPoints = [
                new THREE.Vector3(i, 0.02, -halfSize),
                new THREE.Vector3(i, 0.02, halfSize)
            ];
            const vGeometry = new THREE.BufferGeometry().setFromPoints(vPoints);
            gridGroup.add(new THREE.Line(vGeometry, gridMaterial));
        }
        
        this.scene.add(gridGroup);
    }
    
    // ----------------------------------------
    // Trees - Simple spheres
    // ----------------------------------------
    createTrees() {
        const treeGroup = new THREE.Group();
        
        const treeAreas = [
            // Inner areas
            { cx: -55, cz: -45, count: 25, spread: 25 },
            { cx: 60, cz: -50, count: 22, spread: 22 },
            { cx: -50, cz: 50, count: 25, spread: 25 },
            { cx: 55, cz: 55, count: 20, spread: 20 },
            { cx: 0, cz: -65, count: 30, spread: 30 },
            { cx: 0, cz: 65, count: 25, spread: 28 },
            { cx: 70, cz: 0, count: 15, spread: 18 },
            { cx: -70, cz: 0, count: 15, spread: 18 },
            { cx: 20, cz: -10, count: 10, spread: 12 },
            { cx: -15, cz: 8, count: 8, spread: 10 },
            { cx: 30, cz: 40, count: 12, spread: 15 },
            // Outer areas for bigger map
            { cx: -100, cz: -80, count: 35, spread: 40 },
            { cx: 100, cz: -80, count: 35, spread: 40 },
            { cx: -100, cz: 80, count: 35, spread: 40 },
            { cx: 100, cz: 80, count: 35, spread: 40 },
            { cx: 0, cz: -120, count: 40, spread: 45 },
            { cx: 0, cz: 120, count: 40, spread: 45 },
            { cx: -120, cz: 0, count: 30, spread: 35 },
            { cx: 120, cz: 0, count: 30, spread: 35 },
            { cx: -80, cz: -100, count: 25, spread: 30 },
            { cx: 80, cz: -100, count: 25, spread: 30 },
            { cx: -80, cz: 100, count: 25, spread: 30 },
            { cx: 80, cz: 100, count: 25, spread: 30 }
        ];
        
        treeAreas.forEach(area => {
            for (let i = 0; i < area.count; i++) {
                const tree = this.createTree();
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * area.spread;
                tree.position.x = area.cx + Math.cos(angle) * distance;
                tree.position.z = area.cz + Math.sin(angle) * distance;
                treeGroup.add(tree);
            }
        });
        
        this.scene.add(treeGroup);
    }
    
    createTree() {
        const group = new THREE.Group();
        
        const radius = 1.2 + Math.random() * 1.5;
        
        // Short brown trunk
        const trunkHeight = 0.8 + Math.random() * 0.4;
        const trunkRadius = radius * 0.2;
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 6);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Brown
            roughness: 0.9,
            metalness: 0.0
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        group.add(trunk);
        
        // Green sphere crown with texture
        const crownGeometry = new THREE.SphereGeometry(radius, 16, 12);
        const color = Math.random() > 0.4 ? CONFIG.colors.tree : CONFIG.colors.treeDark;
        
        const crownMaterialOptions = {
            color: color,
            roughness: 0.85,
            metalness: 0.0
        };
        
        // Apply texture if loaded
        if (this.treeTexture) {
            crownMaterialOptions.normalMap = this.treeTexture;
            crownMaterialOptions.normalScale = new THREE.Vector2(0.5, 0.5);
        }
        
        const crownMaterial = new THREE.MeshStandardMaterial(crownMaterialOptions);
        
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.y = trunkHeight + radius * 0.7;
        crown.castShadow = true;
        crown.receiveShadow = true;
        group.add(crown);
        
        const scale = 0.6 + Math.random() * 0.6;
        group.scale.setScalar(scale);
        
        return group;
    }
    
    // ----------------------------------------
    // Roads
    // ----------------------------------------
    createRoads() {
        const roadGroup = new THREE.Group();
        
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.road,
            roughness: 0.8
        });
        
        const lineMaterial = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.roadLine,
            roughness: 0.7
        });
        
        const roads = [
            { x: 0, z: 0, width: CONFIG.map.size * 0.9, height: 5, rotation: 0 },
            { x: 0, z: 0, width: CONFIG.map.size * 0.9, height: 5, rotation: Math.PI / 2 },
            { x: 25, z: 0, width: 80, height: 3, rotation: Math.PI / 2 },
            { x: -25, z: 0, width: 80, height: 3, rotation: Math.PI / 2 },
            { x: 0, z: 25, width: 90, height: 3, rotation: 0 },
            { x: 0, z: -25, width: 90, height: 3, rotation: 0 }
        ];
        
        roads.forEach(road => {
            const geometry = new THREE.PlaneGeometry(road.width, road.height);
            const roadMesh = new THREE.Mesh(geometry, roadMaterial);
            roadMesh.rotation.x = -Math.PI / 2;
            roadMesh.rotation.z = road.rotation;
            roadMesh.position.set(road.x, 0.03, road.z);
            roadMesh.receiveShadow = true;
            roadGroup.add(roadMesh);
            
            const lineGeometry = new THREE.PlaneGeometry(road.width, 0.15);
            const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
            lineMesh.rotation.x = -Math.PI / 2;
            lineMesh.rotation.z = road.rotation;
            lineMesh.position.set(road.x, 0.04, road.z);
            roadGroup.add(lineMesh);
        });
        
        this.scene.add(roadGroup);
    }
    
    // ----------------------------------------
    // Buildings
    // ----------------------------------------
    createBuildings() {
        const buildingGroup = new THREE.Group();
        
        const clusters = [
            { cx: 25, cz: -30, count: 15, spread: 12, maxHeight: 12 },
            { cx: 45, cz: 10, count: 18, spread: 10, maxHeight: 16 },
            { cx: 35, cz: 25, count: 12, spread: 8, maxHeight: 10 },
            { cx: -20, cz: -20, count: 10, spread: 8, maxHeight: 8 },
            { cx: -35, cz: 15, count: 8, spread: 7, maxHeight: 7 },
            { cx: -10, cz: 35, count: 5, spread: 5, maxHeight: 5 },
            { cx: 50, cz: -15, count: 8, spread: 7, maxHeight: 8 },
            { cx: -45, cz: 0, count: 6, spread: 6, maxHeight: 6 }
        ];
        
        clusters.forEach(cluster => {
            for (let i = 0; i < cluster.count; i++) {
                const building = this.createBuilding(cluster.maxHeight);
                const angle = Math.random() * Math.PI * 2;
                const distance = 2 + Math.random() * cluster.spread;
                building.position.x = cluster.cx + Math.cos(angle) * distance;
                building.position.z = cluster.cz + Math.sin(angle) * distance;
                buildingGroup.add(building);
            }
        });
        
        this.scene.add(buildingGroup);
    }
    
    createBuilding(maxHeight) {
        const width = 1.5 + Math.random() * 2.5;
        const depth = 1.5 + Math.random() * 2.5;
        const height = 2 + Math.random() * maxHeight;
        
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.building,
            roughness: 0.8,
            metalness: 0.0
        });
        
        const building = new THREE.Mesh(geometry, material);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        building.rotation.y = Math.floor(Math.random() * 4) * (Math.PI / 2);
        
        return building;
    }
    
    // ----------------------------------------
    // Markers - Pin style with sphere and cone
    // ----------------------------------------
    createMarkers() {
        LOCATIONS.forEach(location => {
            const marker = this.createMarker(location);
            this.markers.push(marker);
            this.scene.add(marker);
        });
    }
    
    createMarker(location) {
        const group = new THREE.Group();
        group.userData = { location };
        
        // Main sphere
        const sphereGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.marker,
            roughness: 0.3,
            metalness: 0.2,
            emissive: CONFIG.colors.marker,
            emissiveIntensity: 0.3
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.y = 5;
        sphere.castShadow = true;
        group.add(sphere);
        
        // Cone pointer
        const coneGeometry = new THREE.ConeGeometry(0.8, 3, 8);
        const coneMaterial = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.marker,
            roughness: 0.3,
            emissive: CONFIG.colors.marker,
            emissiveIntensity: 0.2
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.position.y = 2;
        cone.rotation.x = Math.PI;
        cone.castShadow = true;
        group.add(cone);
        
        // Ground ring
        const ringGeometry = new THREE.RingGeometry(2, 3, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: CONFIG.colors.marker,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.05;
        group.add(ring);
        
        // Pulse ring
        const pulseGeometry = new THREE.RingGeometry(2.5, 3.5, 32);
        const pulseMaterial = new THREE.MeshBasicMaterial({
            color: CONFIG.colors.marker,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
        pulse.rotation.x = -Math.PI / 2;
        pulse.position.y = 0.03;
        pulse.userData.isPulse = true;
        group.add(pulse);
        
        group.position.set(location.position.x, 0, location.position.z);
        
        return group;
    }
    
    // ----------------------------------------
    // Lighting
    // ----------------------------------------
    setupLighting() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(this.ambientLight);
        
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.sunLight.position.set(50, 80, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 250;
        this.sunLight.shadow.camera.left = -150;
        this.sunLight.shadow.camera.right = 150;
        this.sunLight.shadow.camera.top = 150;
        this.sunLight.shadow.camera.bottom = -150;
        this.sunLight.shadow.bias = -0.0001;
        this.scene.add(this.sunLight);
        
        const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.2);
        fillLight.position.set(-40, 30, -40);
        this.scene.add(fillLight);
        
        this.hemiLight = new THREE.HemisphereLight(0x87ceeb, 0xe8e0d0, 0.3);
        this.scene.add(this.hemiLight);
    }
    
    // ----------------------------------------
    // Post Processing
    // ----------------------------------------
    setupPostProcessing() {
        if (!CONFIG.postProcessing) return;
        
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.2,
            0.4,
            0.9
        );
        this.composer.addPass(this.bloomPass);
        
        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);
    }
    
    // ----------------------------------------
    // Controls
    // ----------------------------------------
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.screenSpacePanning = true;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 200;
        this.controls.maxPolarAngle = Math.PI / 2.2;
        this.controls.minPolarAngle = 0.05; // Allow near top-down view
        this.controls.target.set(0, 0, 0);
        
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.enablePan = true;
        this.controls.panSpeed = 1.5;
        this.controls.rotateSpeed = 0.8;
        this.controls.zoomSpeed = 1.2;
        
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        
        this.controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };
        
        this.controls.addEventListener('change', () => {
            this.updateCompass();
        });
    }
    
    updateCompass() {
        const compass = document.getElementById('compass');
        if (compass) {
            const angle = Math.atan2(
                this.camera.position.x - this.controls.target.x,
                this.camera.position.z - this.controls.target.z
            );
            const needle = compass.querySelector('.compass-needle');
            if (needle) {
                needle.style.transform = `rotate(${-angle * (180 / Math.PI)}deg)`;
            }
        }
    }
    
    // ----------------------------------------
    // Event Listeners
    // ----------------------------------------
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        this.renderer.domElement.addEventListener('click', (e) => this.onMouseClick(e));
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        this.renderer.domElement.addEventListener('pointerdown', () => this.hideDragHint());
        this.renderer.domElement.addEventListener('wheel', () => this.hideDragHint());
    }
    
    hideDragHint() {
        const hint = document.getElementById('drag-hint');
        if (hint) {
            hint.classList.add('hidden');
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersects = this.raycaster.intersectObjects(
            this.markers.flatMap(m => m.children),
            true
        );
        
        if (intersects.length > 0) {
            let marker = intersects[0].object;
            while (marker.parent && !marker.userData.location) {
                marker = marker.parent;
            }
            
            if (marker.userData.location) {
                // If this marker is already focused, show detail
                if (this.focusedMarker === marker) {
                    this.showLocationDetail(marker.userData.location);
                } else {
                    // First click: focus on this marker
                    this.focusOnMarker(marker);
                }
            }
        } else {
            // Clicked elsewhere, unfocus current marker
            this.focusedMarker = null;
        }
    }
    
    focusOnMarker(marker) {
        this.focusedMarker = marker;
        const location = marker.userData.location;
        
        // Animate camera to angled view focusing on marker (farther distance)
        const targetPosition = new THREE.Vector3(
            location.position.x + 45,
            50,
            location.position.z + 45
        );
        
        const targetLookAt = new THREE.Vector3(
            location.position.x,
            0,
            location.position.z
        );
        
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const duration = 1200;
        const startTime = Date.now();
        
        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, eased);
            this.controls.target.lerpVectors(startTarget, targetLookAt, eased);
            this.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        
        animateCamera();
    }
    
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersects = this.raycaster.intersectObjects(
            this.markers.flatMap(m => m.children),
            true
        );
        
        document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
        
        // Hover effect
        this.markers.forEach(marker => {
            const isHovered = intersects.length > 0 && 
                intersects.some(i => {
                    let obj = i.object;
                    while (obj.parent) {
                        if (obj === marker) return true;
                        obj = obj.parent;
                    }
                    return false;
                });
            
            const targetScale = isHovered ? 1.15 : 1;
            marker.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
        });
    }
    
    // ----------------------------------------
    // UI Setup
    // ----------------------------------------
    setupUI() {
        const exploreBtn = document.getElementById('explore-btn');
        exploreBtn?.addEventListener('click', () => this.startExploring());
        
        const toggleLocations = document.getElementById('toggle-locations');
        toggleLocations?.addEventListener('click', () => this.toggleSidebar());
        
        const toggleMenu = document.getElementById('toggle-menu');
        toggleMenu?.addEventListener('click', () => this.toggleSidebar());
        
        const closeSidebar = document.getElementById('close-sidebar');
        closeSidebar?.addEventListener('click', () => this.closeSidebar());
        
        const closeDetail = document.getElementById('close-detail');
        closeDetail?.addEventListener('click', () => this.closeLocationDetail());
        
        const toggleEffects = document.getElementById('toggle-effects');
        toggleEffects?.addEventListener('click', () => this.toggleNightMode());
        
        // Compass click - return to initial view
        const compass = document.getElementById('compass');
        compass?.addEventListener('click', () => this.resetView());
        
        this.populateLocationsList();
    }
    
    resetView() {
        // Animate camera back to initial position
        const targetPosition = new THREE.Vector3(
            CONFIG.camera.position.x,
            CONFIG.camera.position.y,
            CONFIG.camera.position.z
        );
        
        const targetLookAt = new THREE.Vector3(0, 0, 0);
        
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const duration = 1000;
        const startTime = Date.now();
        
        // Clear focused marker
        this.focusedMarker = null;
        
        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, eased);
            this.controls.target.lerpVectors(startTarget, targetLookAt, eased);
            this.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        
        animateCamera();
    }
    
    startExploring() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const mapScreen = document.getElementById('map-screen');
        
        welcomeScreen?.classList.remove('active');
        mapScreen?.classList.add('active');
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('locations-sidebar');
        const menuBtn = document.getElementById('toggle-menu');
        const locBtn = document.getElementById('toggle-locations');
        
        sidebar?.classList.toggle('open');
        menuBtn?.classList.toggle('active');
        locBtn?.classList.toggle('active');
    }
    
    closeSidebar() {
        const sidebar = document.getElementById('locations-sidebar');
        const menuBtn = document.getElementById('toggle-menu');
        const locBtn = document.getElementById('toggle-locations');
        
        sidebar?.classList.remove('open');
        menuBtn?.classList.remove('active');
        locBtn?.classList.remove('active');
    }
    
    populateLocationsList() {
        const list = document.getElementById('locations-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        LOCATIONS.forEach(location => {
            const item = document.createElement('li');
            item.className = 'location-item';
            item.innerHTML = `
                <div class="location-dot"></div>
                <div>
                    <div class="location-name">${location.name}</div>
                    <div class="location-category">${location.category}</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.focusOnLocation(location);
                this.closeSidebar();
            });
            
            list.appendChild(item);
        });
    }
    
    focusOnLocation(location) {
        // Find the marker for this location and focus on it
        const marker = this.markers.find(m => m.userData.location.id === location.id);
        if (marker) {
            this.focusOnMarker(marker);
        }
    }
    
    showLocationDetail(location) {
        const detailPanel = document.getElementById('location-detail');
        const detailImage = document.getElementById('detail-image');
        const detailTitle = document.getElementById('detail-title');
        const detailDescription = document.getElementById('detail-description');
        const detailCategory = document.getElementById('detail-category');
        const detailRating = document.getElementById('detail-rating');
        
        if (detailImage) detailImage.src = location.image;
        if (detailTitle) detailTitle.textContent = location.name;
        if (detailDescription) detailDescription.textContent = location.description;
        if (detailCategory) detailCategory.textContent = location.category;
        if (detailRating) detailRating.textContent = location.rating;
        
        detailPanel?.classList.add('open');
    }
    
    closeLocationDetail() {
        const detailPanel = document.getElementById('location-detail');
        detailPanel?.classList.remove('open');
    }
    
    toggleNightMode() {
        this.isNightMode = !this.isNightMode;
        const toggleBtn = document.getElementById('toggle-effects');
        
        if (this.isNightMode) {
            this.scene.background = new THREE.Color(0x0a0a1a);
            this.scene.fog = new THREE.Fog(0x0a0a1a, 60, 180);
            this.sunLight.intensity = 0.15;
            this.sunLight.color.setHex(0x4169e1);
            this.ambientLight.intensity = 0.12;
            this.hemiLight.intensity = 0.08;
            
            if (this.bloomPass) this.bloomPass.strength = 0.5;
            
            this.markers.forEach(marker => {
                marker.children.forEach(child => {
                    if (child.material?.emissiveIntensity !== undefined) {
                        child.material.emissiveIntensity = 0.7;
                    }
                });
            });
            
            toggleBtn?.classList.add('active');
        } else {
            this.scene.background = new THREE.Color(0xffffff);
            this.scene.fog = new THREE.Fog(0xffffff, 120, 280);
            this.sunLight.intensity = 1.0;
            this.sunLight.color.setHex(0xffffff);
            this.ambientLight.intensity = 0.7;
            this.hemiLight.intensity = 0.3;
            
            if (this.bloomPass) this.bloomPass.strength = 0.2;
            
            this.markers.forEach(marker => {
                marker.children.forEach(child => {
                    if (child.material?.emissiveIntensity !== undefined) {
                        child.material.emissiveIntensity = 0.3;
                    }
                });
            });
            
            toggleBtn?.classList.remove('active');
        }
    }
    
    // ----------------------------------------
    // Animation Loop
    // ----------------------------------------
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        
        // Animate markers
        this.markers.forEach((marker, index) => {
            const floatOffset = Math.sin(time * 1.5 + index * 0.6) * 0.25;
            
            marker.children.forEach(child => {
                if (child.position.y > 1 && !child.userData.isPulse) {
                    if (child.userData.baseY === undefined) {
                        child.userData.baseY = child.position.y;
                    }
                    child.position.y = child.userData.baseY + floatOffset;
                }
                
                if (child.userData.isPulse) {
                    const pulseScale = 1 + Math.sin(time * 2.5 + index * 0.8) * 0.35;
                    child.scale.setScalar(pulseScale);
                    child.material.opacity = 0.35 - Math.sin(time * 2.5 + index * 0.8) * 0.2;
                }
            });
        });
        
        this.controls.update();
        
        if (this.composer && CONFIG.postProcessing) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    new Map3DApp();
});
