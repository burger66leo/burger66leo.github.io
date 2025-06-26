/**
 * Three.js 幾何動態背景效果
 * 專為 work-with-us 頁面設計的高性能動態背景
 */

class GeometricBackground {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.geometry = null;
    this.material = null;
    this.mesh = null;
    this.uniforms = null;
    
    // 動畫參數
    this.time = 0;
    this.mouse = { x: 0, y: 0 };
    this.scroll = 0;
    this.isRunning = false;
    
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
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // 創建渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('geometric-canvas'),
      alpha: true,
      antialias: !this.isMobile,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    
    // 創建全屏四邊形幾何
    this.geometry = new THREE.PlaneGeometry(2, 2);
    
    // 設置 uniforms
    this.uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_scroll: { value: 0 },
      u_intensity: { value: this.isMobile ? 0.3 : 0.5 },
      u_color1: { value: new THREE.Color(0xfacf20) }, // 金色
      u_color2: { value: new THREE.Color(0xff6b35) }, // 橙色
      u_color3: { value: new THREE.Color(0x4a90e2) }, // 藍色
      u_alpha: { value: 0.15 }
    };
    
    // 創建材質
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    
    // 創建網格
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    
    this.isRunning = true;
  }

  getVertexShader() {
    return `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  getFragmentShader() {
    return `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_scroll;
      uniform float u_intensity;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform float u_alpha;
      
      varying vec2 vUv;
      
      // Simplex 噪聲函數
      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec2 mod289(vec2 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec3 permute(vec3 x) {
        return mod289(((x*34.0)+1.0)*x);
      }
      
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                           -0.577350269189626,  // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
        
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      
      // 分形噪聲
      float fbm(vec2 uv) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 0.0;
        
        for (int i = 0; i < 4; i++) {
          value += amplitude * snoise(uv);
          uv *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      // 六邊形距離函數
      float hexagon(vec2 uv, float r) {
        uv = abs(uv);
        return max(dot(uv, normalize(vec2(1.0, 1.732))), uv.x) - r;
      }
      
      // 創建幾何圖案
      float geometricPattern(vec2 uv) {
        vec2 grid = vec2(6.0, 6.0);
        vec2 id = floor(uv * grid);
        vec2 gv = fract(uv * grid) - 0.5;
        
        // 添加時間偏移
        float timeOffset = u_time * 0.5 + dot(id, vec2(12.9898, 78.233));
        
        // 基於噪聲的大小變化
        float noise = fbm(id * 0.1 + u_time * 0.2);
        float size = 0.3 + 0.2 * sin(timeOffset + noise * 3.14159);
        
        // 滑鼠影響
        vec2 mouseInfluence = u_mouse * 2.0 - 1.0;
        float mouseDist = length(uv - mouseInfluence * 0.5);
        size += 0.1 * exp(-mouseDist * 3.0);
        
        // 滾動影響
        size += 0.05 * sin(u_scroll * 0.01 + timeOffset);
        
        return 1.0 - smoothstep(0.0, 0.1, hexagon(gv, size));
      }
      
      void main() {
        vec2 uv = vUv;
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        
        // 動態扭曲
        float distortion = fbm(st * 3.0 + u_time * 0.1) * u_intensity;
        uv += distortion * 0.1;
        
        // 幾何圖案
        float pattern = geometricPattern(uv);
        
        // 邊緣漸變
        float edgeFade = smoothstep(0.0, 0.3, st.x) * 
                        smoothstep(0.0, 0.3, st.y) * 
                        smoothstep(0.0, 0.3, 1.0 - st.x) * 
                        smoothstep(0.0, 0.3, 1.0 - st.y);
        
        // 動態顏色混合
        float colorMix1 = sin(u_time * 0.3 + st.x * 2.0) * 0.5 + 0.5;
        float colorMix2 = cos(u_time * 0.2 + st.y * 3.0) * 0.5 + 0.5;
        
        vec3 color = mix(u_color1, u_color2, colorMix1);
        color = mix(color, u_color3, colorMix2 * 0.3);
        
        // 最終顏色
        vec3 finalColor = color * pattern;
        float alpha = pattern * u_alpha * edgeFade;
        
        gl_FragColor = vec4(finalColor, alpha);
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
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.renderer.setSize(width, height);
    this.uniforms.u_resolution.value.set(width, height);
    
    // 根據設備類型調整性能
    this.isMobile = width < 768;
    this.uniforms.u_intensity.value = this.isMobile ? 0.3 : 0.5;
  }

  animate() {
    if (!this.isRunning) return;

    this.time += 0.016; // 約60fps

    // 更新 uniforms
    this.uniforms.u_time.value = this.time;
    this.uniforms.u_mouse.value.set(this.mouse.x, this.mouse.y);
    this.uniforms.u_scroll.value = this.scroll;

    // 渲染
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.animate());
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
    
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
    if (this.renderer) this.renderer.dispose();
    
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  // 公開方法：調整效果強度
  setIntensity(intensity) {
    this.uniforms.u_intensity.value = intensity;
  }

  // 公開方法：調整透明度
  setAlpha(alpha) {
    this.uniforms.u_alpha.value = alpha;
  }

  // 公開方法：更改顏色主題
  setColors(color1, color2, color3) {
    this.uniforms.u_color1.value.setHex(color1);
    this.uniforms.u_color2.value.setHex(color2);
    this.uniforms.u_color3.value.setHex(color3);
  }
}

// 等待DOM和Three.js載入後初始化
function initGeometricBackground() {
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded, retrying...');
    setTimeout(initGeometricBackground, 100);
    return;
  }

  const canvas = document.getElementById('geometric-canvas');
  if (!canvas) {
    console.warn('Geometric canvas not found');
    return;
  }

  // 創建背景實例
  window.geometricBackground = new GeometricBackground();
  
  console.log('Geometric background initialized');
}

// 如果頁面已載入則立即初始化，否則等待載入
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGeometricBackground);
} else {
  initGeometricBackground();
}