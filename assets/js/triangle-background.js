/**
 * 三角形幾何動態背景效果
 * 專為 work-with-us 頁面設計的三角形粒子系統
 */

class TriangleBackground {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.triangleGroup = null;
    this.triangles = [];
    this.uniforms = null;
    
    // 動畫參數
    this.time = 0;
    this.mouse = { x: 0, y: 0 };
    this.scroll = 0;
    this.isRunning = false;
    
    // 三角形參數
    this.triangleCount = window.innerWidth < 768 ? 30 : 60;
    this.animationSpeed = 0.5;
    
    // 性能相關
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.isMobile = window.innerWidth < 768;
    
    this.init();
    this.setupEventListeners();
    this.animate();
  }

  init() {
    // 創建場景
    this.scene = new THREE.Scene();
    
    // 創建相機
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.z = 10;
    
    // 創建渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('triangle-canvas'),
      alpha: true,
      antialias: !this.isMobile,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    
    // 創建三角形群組
    this.triangleGroup = new THREE.Group();
    this.scene.add(this.triangleGroup);
    
    // 創建三角形粒子系統
    this.createTriangleParticleSystem();
    
    this.isRunning = true;
  }

  createTriangleParticleSystem() {
    // 清除現有三角形
    this.triangles.forEach(triangle => {
      this.triangleGroup.remove(triangle.mesh);
    });
    this.triangles = [];

    for (let i = 0; i < this.triangleCount; i++) {
      const triangle = this.createSingleTriangle(i);
      this.triangles.push(triangle);
      this.triangleGroup.add(triangle.mesh);
    }
  }

  createSingleTriangle(index) {
    // 創建等邊三角形幾何
    const size = 0.2 + Math.random() * 0.3;
    const height = size * Math.sqrt(3) / 2;
    
    const vertices = new Float32Array([
      0, height * 2/3, 0,              // 頂點
      -size/2, -height/3, 0,           // 左下
      size/2, -height/3, 0             // 右下
    ]);

    const uvs = new Float32Array([
      0.5, 1.0,    // 頂點 UV
      0.0, 0.0,    // 左下 UV
      1.0, 0.0     // 右下 UV
    ]);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    // 創建材質
    const material = this.createTriangleMaterial();
    
    // 創建網格
    const mesh = new THREE.Mesh(geometry, material);
    
    // 隨機位置
    mesh.position.set(
      (Math.random() - 0.5) * 25,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 5
    );
    
    // 隨機旋轉
    mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    
    // 隨機縮放
    const scale = 0.5 + Math.random() * 1.0;
    mesh.scale.set(scale, scale, scale);

    return {
      mesh: mesh,
      material: material,
      initialPosition: mesh.position.clone(),
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.01
      },
      floatSpeed: 0.5 + Math.random() * 0.5,
      floatRange: 0.5 + Math.random() * 1.0,
      index: index
    };
  }

  createTriangleMaterial() {
    const uniforms = {
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_color1: { value: new THREE.Color(0xfacf20) }, // 金色
      u_color2: { value: new THREE.Color(0xff6b35) }, // 橙色
      u_color3: { value: new THREE.Color(0x4a90e2) }, // 藍色
      u_opacity: { value: this.isMobile ? 0.6 : 0.8 },
      u_intensity: { value: this.isMobile ? 0.3 : 0.5 }
    };

    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: this.getTriangleVertexShader(),
      fragmentShader: this.getTriangleFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
  }

  getTriangleVertexShader() {
    return `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_intensity;
      
      void main() {
        vUv = uv;
        vPosition = position;
        
        // 計算變形效果
        vec3 newPosition = position;
        
        // 三角形頂點動態變形
        float distance = length(position.xy);
        newPosition.z += sin(u_time * 2.0 + distance * 5.0) * 0.1 * u_intensity;
        
        // 三角形邊緣呼吸效果
        float edge = smoothstep(0.0, 0.2, distance);
        float breathe = 1.0 + sin(u_time * 3.0) * 0.05 * edge;
        newPosition.xy *= breathe;
        
        // 滑鼠互動效果
        vec2 mouseInfluence = u_mouse * 2.0 - 1.0;
        float mouseDist = length(newPosition.xy - mouseInfluence);
        newPosition.z += (1.0 / (mouseDist + 1.0)) * 0.2;
        
        vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
        vWorldPosition = worldPosition.xyz;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;
  }

  getTriangleFragmentShader() {
    return `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform float u_opacity;
      uniform float u_intensity;
      
      void main() {
        // 三角形內部漸變效果
        vec2 center = vec2(0.5, 0.33); // 三角形重心
        float distanceFromCenter = length(vUv - center);
        
        // 邊緣檢測
        float edge = 1.0 - smoothstep(0.0, 0.4, distanceFromCenter);
        
        // 動態顏色混合
        float colorMix1 = sin(u_time * 0.5 + vWorldPosition.x * 0.1) * 0.5 + 0.5;
        float colorMix2 = cos(u_time * 0.3 + vWorldPosition.y * 0.1) * 0.5 + 0.5;
        
        vec3 color = mix(u_color1, u_color2, colorMix1);
        color = mix(color, u_color3, colorMix2 * 0.3);
        
        // 邊緣光暈效果
        float glow = edge * (1.0 + sin(u_time * 4.0 + distanceFromCenter * 10.0) * 0.3);
        color += glow * u_color1 * 0.5;
        
        // 動態亮度變化
        float brightness = 0.8 + sin(u_time * 2.0 + vWorldPosition.z * 0.5) * 0.2;
        color *= brightness;
        
        // 透明度計算
        float alpha = edge * u_opacity;
        
        // 淡入淡出效果
        float fadeEdge = smoothstep(0.2, 0.0, distanceFromCenter);
        alpha *= (1.0 - fadeEdge);
        
        gl_FragColor = vec4(color, alpha * u_intensity);
      }
    `;
  }

  setupEventListeners() {
    // 滑鼠移動
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = event.clientX / window.innerWidth;
      this.mouse.y = 1.0 - (event.clientY / window.innerHeight);
    });

    // 滾動
    window.addEventListener('scroll', () => {
      this.scroll = window.pageYOffset;
    });

    // 窗口調整大小
    window.addEventListener('resize', () => {
      this.onWindowResize();
    });

    // 頁面可見性變化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });

    // 點擊波紋效果
    window.addEventListener('click', (event) => {
      if (!this.isMobile) {
        this.createClickRipple(event.clientX, event.clientY);
      }
    });
  }

  createClickRipple(x, y) {
    // 轉換屏幕座標到世界座標
    const mouse = new THREE.Vector2();
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;

    // 創建波紋三角形
    for (let i = 0; i < 5; i++) {
      const triangle = this.createSingleTriangle(-1);
      triangle.mesh.position.set(
        mouse.x * 10,
        mouse.y * 5,
        Math.random() * 2
      );
      
      triangle.mesh.scale.set(0.1, 0.1, 0.1);
      this.triangleGroup.add(triangle.mesh);

      // 動畫效果
      const targetScale = 2 + Math.random();
      const duration = 1000 + Math.random() * 500;

      this.animateRipple(triangle, targetScale, duration);
    }
  }

  animateRipple(triangle, targetScale, duration) {
    const startTime = this.time;
    const startScale = triangle.mesh.scale.x;
    const startOpacity = triangle.material.uniforms.u_opacity.value;

    const animate = () => {
      const elapsed = this.time - startTime;
      const progress = Math.min(elapsed / (duration / 1000), 1);
      
      if (progress < 1) {
        // 縮放動畫
        const scale = startScale + (targetScale - startScale) * progress;
        triangle.mesh.scale.set(scale, scale, scale);
        
        // 透明度動畫
        const opacity = startOpacity * (1 - progress);
        triangle.material.uniforms.u_opacity.value = opacity;
        
        requestAnimationFrame(animate);
      } else {
        // 移除三角形
        this.triangleGroup.remove(triangle.mesh);
        triangle.material.dispose();
        triangle.mesh.geometry.dispose();
      }
    };

    animate();
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    
    // 根據設備類型調整參數
    this.isMobile = width < 768;
    this.triangleCount = this.isMobile ? 30 : 60;
    
    // 重新創建三角形系統
    this.createTriangleParticleSystem();
  }

  animate() {
    if (!this.isRunning) return;

    this.time += 0.016; // 約60fps

    // 更新三角形動畫
    this.triangles.forEach(triangle => {
      this.animateTriangle(triangle);
      this.updateTriangleMaterial(triangle);
    });

    // 更新相機位置（視差效果）
    this.camera.position.x = (this.mouse.x - 0.5) * 2;
    this.camera.position.y = (this.mouse.y - 0.5) * 1;

    // 根據滾動調整整體旋轉
    this.triangleGroup.rotation.y = this.scroll * 0.0005;
    this.triangleGroup.rotation.x = this.scroll * 0.0002;

    // 渲染
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.animate());
  }

  animateTriangle(triangle) {
    const { mesh, rotationSpeed, floatSpeed, floatRange, initialPosition, index } = triangle;

    // 旋轉動畫
    mesh.rotation.x += rotationSpeed.x * this.animationSpeed;
    mesh.rotation.y += rotationSpeed.y * this.animationSpeed;
    mesh.rotation.z += rotationSpeed.z * this.animationSpeed;

    // 漂浮動畫
    const floatOffset = Math.sin(this.time * floatSpeed + index) * floatRange;
    mesh.position.y = initialPosition.y + floatOffset;

    // 水平漂移
    const driftX = Math.cos(this.time * 0.3 + index) * 0.5;
    mesh.position.x = initialPosition.x + driftX;

    // 深度變化
    const depthOffset = Math.sin(this.time * 0.5 + index * 0.5) * 1;
    mesh.position.z = initialPosition.z + depthOffset;

    // 縮放呼吸
    const breatheScale = 1.0 + Math.sin(this.time * 2.0 + index) * 0.1;
    mesh.scale.setScalar(breatheScale);
  }

  updateTriangleMaterial(triangle) {
    const material = triangle.material;
    
    // 更新 uniforms
    material.uniforms.u_time.value = this.time;
    material.uniforms.u_mouse.value.set(this.mouse.x, this.mouse.y);
    
    // 根據滾動位置調整顏色
    const scrollProgress = this.scroll / (document.documentElement.scrollHeight - window.innerHeight);
    
    if (scrollProgress < 0.3) {
      material.uniforms.u_color1.value.setHex(0xfacf20); // 金色
      material.uniforms.u_color2.value.setHex(0xff6b35); // 橙色
      material.uniforms.u_color3.value.setHex(0x4a90e2); // 藍色
    } else if (scrollProgress < 0.7) {
      material.uniforms.u_color1.value.setHex(0x4a90e2); // 藍色
      material.uniforms.u_color2.value.setHex(0x7b68ee); // 紫色
      material.uniforms.u_color3.value.setHex(0xfacf20); // 金色
    } else {
      material.uniforms.u_color1.value.setHex(0xff6b35); // 橙色
      material.uniforms.u_color2.value.setHex(0xfacf20); // 金色
      material.uniforms.u_color3.value.setHex(0x4a90e2); // 藍色
    }
  }

  pause() {
    this.isRunning = false;
  }

  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  destroy() {
    this.pause();
    
    // 清理三角形
    this.triangles.forEach(triangle => {
      triangle.material.dispose();
      triangle.mesh.geometry.dispose();
    });
    
    if (this.renderer) this.renderer.dispose();
    
    // 移除事件監聽器
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    window.removeEventListener('click', this.onClick);
  }

  // 公開方法：調整動畫速度
  setAnimationSpeed(speed) {
    this.animationSpeed = speed;
  }

  // 公開方法：調整三角形數量
  setTriangleCount(count) {
    this.triangleCount = count;
    this.createTriangleParticleSystem();
  }

  // 公開方法：設置顏色主題
  setColorTheme(color1, color2, color3) {
    this.triangles.forEach(triangle => {
      triangle.material.uniforms.u_color1.value.setHex(color1);
      triangle.material.uniforms.u_color2.value.setHex(color2);
      triangle.material.uniforms.u_color3.value.setHex(color3);
    });
  }

  // 公開方法：調整強度
  setIntensity(intensity) {
    this.triangles.forEach(triangle => {
      triangle.material.uniforms.u_intensity.value = intensity;
    });
  }
}

// 等待DOM和Three.js載入後初始化
function initTriangleBackground() {
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded, retrying...');
    setTimeout(initTriangleBackground, 100);
    return;
  }

  const canvas = document.getElementById('triangle-canvas');
  if (!canvas) {
    console.warn('Triangle canvas not found');
    return;
  }

  // 創建三角形背景實例
  window.triangleBackground = new TriangleBackground();
  
  console.log('Triangle background initialized');
}

// 如果頁面已載入則立即初始化，否則等待載入
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTriangleBackground);
} else {
  initTriangleBackground();
}