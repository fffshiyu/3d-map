// 自定义建筑着色器 - 展示高级 WebGL 技能

export const buildingVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const buildingFragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform bool uIsNight;
  uniform float uHeight;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  
  // 窗户灯光效果
  float windowLight(vec2 uv, float time) {
    vec2 grid = fract(uv * vec2(4.0, 8.0));
    float window = step(0.2, grid.x) * step(grid.x, 0.8) * 
                   step(0.1, grid.y) * step(grid.y, 0.9);
    
    // 随机闪烁
    float flicker = sin(time * 2.0 + uv.x * 10.0 + uv.y * 15.0) * 0.5 + 0.5;
    return window * mix(0.3, 1.0, flicker);
  }
  
  void main() {
    vec3 color = uColor;
    
    // 基于高度的渐变
    float heightGradient = smoothstep(0.0, 1.0, vPosition.y / uHeight);
    
    if (uIsNight) {
      // 夜间模式 - 窗户发光效果
      float light = windowLight(vUv, uTime);
      vec3 windowColor = vec3(1.0, 0.9, 0.7);
      color = mix(color * 0.3, windowColor, light * 0.8);
      
      // 顶部更亮
      color += vec3(0.1, 0.15, 0.2) * heightGradient;
    } else {
      // 日间模式 - 简单光照
      float diffuse = max(dot(vNormal, normalize(vec3(1.0, 1.0, 0.5))), 0.0);
      color = color * (0.5 + diffuse * 0.5);
      
      // 高度渐变
      color = mix(color, color * 1.2, heightGradient * 0.3);
    }
    
    // 环境光遮蔽
    float ao = smoothstep(0.0, 0.3, vPosition.y / uHeight);
    color *= mix(0.7, 1.0, ao);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// 地标发光着色器
export const glowVertexShader = `
  varying vec3 vNormal;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const glowFragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uIntensity;
  
  varying vec3 vNormal;
  
  void main() {
    // Fresnel 边缘发光
    vec3 viewDirection = normalize(cameraPosition);
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDirection)), 3.0);
    
    // 脉冲动画
    float pulse = sin(uTime * 2.0) * 0.2 + 0.8;
    
    vec3 glow = uColor * fresnel * uIntensity * pulse;
    
    gl_FragColor = vec4(glow, fresnel * 0.5);
  }
`;

// 地面着色器
export const groundVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const groundFragmentShader = `
  uniform bool uIsNight;
  uniform float uTime;
  uniform vec3 uDayColor;
  uniform vec3 uNightColor;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // 网格线
  float grid(vec2 uv, float size) {
    vec2 grid = abs(fract(uv * size - 0.5) - 0.5) / fwidth(uv * size);
    return 1.0 - min(min(grid.x, grid.y), 1.0);
  }
  
  void main() {
    vec3 baseColor = uIsNight ? uNightColor : uDayColor;
    
    // 距离中心的渐变
    float dist = length(vPosition.xz) / 100.0;
    float fade = 1.0 - smoothstep(0.5, 1.0, dist);
    
    // 网格线
    float gridLine = grid(vUv, 50.0) * 0.15;
    
    vec3 color = baseColor;
    
    if (uIsNight) {
      // 夜间发光网格
      color += vec3(0.0, 0.5, 1.0) * gridLine * 0.5;
    } else {
      color += vec3(0.5) * gridLine;
    }
    
    // 边缘淡出
    color *= fade;
    
    gl_FragColor = vec4(color, fade);
  }
`;


