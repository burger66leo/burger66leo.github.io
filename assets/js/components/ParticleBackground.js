/**
 * 粒子背景組件 - 可復用的粒子背景效果
 * 基於 SimplexNoise 和 GSAP ScrollTrigger
 * 
 * 使用方式：
 * const particleBg = new ParticleBackground('#container', {
 *   color: '#F3D74E',
 *   offsetX: -1/3,
 *   density: 'medium'
 * });
 * particleBg.init();
 */

class ParticleBackground {
  constructor(containerSelector, options = {}) {
    // 基本配置
    this.containerSelector = containerSelector;
    this.container = null;
    this.particles = [];
    this.simplex = null;
    this.scrollTrigger = null;
    
    // 預設選項
    this.options = {
      // 視覺配置
      color: '#F3D74E',                    // 粒子顏色（網站統一黃色）
      opacity: 0.5,                       // 粒子透明度
      offsetX: -1/3,                      // X軸偏移比例（負值向左，正值向右）
      offsetRange: 0.3,                   // 噪聲變化範圍比例
      
      // 粒子密度配置
      density: 'medium',                  // 'low', 'medium', 'high', 'custom'
      customCount: null,                  // 自訂粒子數量（當 density='custom' 時使用）
      
      // 滾動配置
      scrollTrigger: true,                // 是否啟用滾動觸發
      scrollStart: "top 80%",             // 滾動開始點
      scrollEnd: "bottom 20%",            // 滾動結束點
      scrollScrub: 0.7,                   // 滾動平滑度
      
      // 效能配置
      lowEndReduction: 0.6,               // 低端設備粒子數量比例
      enableScrollSmoother: true,         // 是否啟用 ScrollSmoother
      
      // 調試配置
      debug: false,                       // 是否啟用調試模式
      showAnalysis: false,                // 是否顯示位置分析
      
      // 動畫配置
      rotation: true,                     // 是否啟用旋轉
      scale: true,                        // 是否啟用縮放
      scaleRange: [1, 5],                 // 縮放範圍
      
      ...options
    };
    
    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
  }
  
  /**
   * 初始化組件
   */
  async init() {
    try {
      if (this.options.debug) {
        console.log('🌟 ParticleBackground 初始化開始', this.options);
      }
      
      // 檢查依賴
      if (!this.checkDependencies()) {
        return false;
      }
      
      // 初始化容器
      if (!this.initContainer()) {
        return false;
      }
      
      // 創建 SimplexNoise 實例
      this.initSimplex();
      
      // 生成粒子
      this.generateParticles();
      
      // 設置滾動動畫
      if (this.options.scrollTrigger) {
        this.setupScrollAnimation();
      }
      
      // 設置 ScrollSmoother（可選）
      if (this.options.enableScrollSmoother) {
        this.setupScrollSmoother();
      }
      
      if (this.options.debug) {
        console.log('✅ ParticleBackground 初始化完成');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ ParticleBackground 初始化失敗:', error);
      return false;
    }
  }
  
  /**
   * 檢查必要依賴
   */
  checkDependencies() {
    if (typeof gsap === 'undefined') {
      console.error('❌ ParticleBackground 需要 GSAP 庫');
      return false;
    }
    
    if (this.options.scrollTrigger && typeof ScrollTrigger === 'undefined') {
      console.error('❌ ParticleBackground 需要 GSAP ScrollTrigger 插件');
      return false;
    }
    
    return true;
  }
  
  /**
   * 初始化容器
   */
  initContainer() {
    this.container = document.querySelector(this.containerSelector);
    
    if (!this.container) {
      console.error(`❌ 找不到容器: ${this.containerSelector}`);
      return false;
    }
    
    // 確保容器有相對定位
    const computedStyle = getComputedStyle(this.container);
    if (computedStyle.position === 'static') {
      this.container.style.position = 'relative';
    }
    
    if (this.options.debug) {
      console.log('✅ 容器初始化完成:', this.container);
    }
    
    return true;
  }
  
  /**
   * 初始化 SimplexNoise
   */
  initSimplex() {
    // 檢查是否已有全局 SimplexNoise
    if (typeof SimplexNoise !== 'undefined') {
      this.simplex = new SimplexNoise();
    } else {
      // 內建簡化版本
      this.simplex = this.createSimplexNoise();
    }
    
    if (this.options.debug) {
      console.log('✅ SimplexNoise 初始化完成');
    }
  }
  
  /**
   * 創建內建 SimplexNoise（如果沒有全局版本）
   */
  createSimplexNoise() {
    return new (class {
      constructor() {
        this.grad3 = [
          [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
          [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
          [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
        
        this.p = [];
        for(let i = 0; i < 256; i++) {
          this.p[i] = Math.floor(Math.random() * 256);
        }
        
        this.perm = [];
        for(let i = 0; i < 512; i++) {
          this.perm[i] = this.p[i & 255];
        }
      }
      
      dot(g, x, y) {
        return g[0] * x + g[1] * y;
      }
      
      noise2D(xin, yin) {
        const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        const s = (xin + yin) * F2;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        
        const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;
        
        let i1, j1;
        if(x0 > y0) {
          i1 = 1; j1 = 0;
        } else {
          i1 = 0; j1 = 1;
        }
        
        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1.0 + 2.0 * G2;
        const y2 = y0 - 1.0 + 2.0 * G2;
        
        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this.perm[ii + this.perm[jj]] % 12;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
        
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        let n0 = 0;
        if(t0 >= 0) {
          t0 *= t0;
          n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
        }
        
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        let n1 = 0;
        if(t1 >= 0) {
          t1 *= t1;
          n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
        }
        
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        let n2 = 0;
        if(t2 >= 0) {
          t2 *= t2;
          n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
        }
        
        return 70.0 * (n0 + n1 + n2);
      }
    })();
  }
  
  /**
   * 獲取粒子數量
   */
  getParticleCount() {
    if (this.options.density === 'custom' && this.options.customCount) {
      return this.options.customCount;
    }
    
    const width = window.innerWidth;
    let baseCount;
    
    switch (this.options.density) {
      case 'low':
        baseCount = width > 1200 ? 1500 : width > 768 ? 1000 : 600;
        break;
      case 'high':
        baseCount = width > 1200 ? 5000 : width > 768 ? 3500 : 2000;
        break;
      case 'medium':
      default:
        baseCount = width > 1200 ? 3000 : width > 768 ? 2000 : 1200;
        break;
    }
    
    // 低端設備優化
    const isLowEnd = navigator.hardwareConcurrency < 4;
    if (isLowEnd) {
      baseCount = Math.floor(baseCount * this.options.lowEndReduction);
    }
    
    return baseCount;
  }
  
  /**
   * 生成粒子
   */
  generateParticles() {
    const particleCount = this.getParticleCount();
    const containerWidth = this.container.offsetWidth;
    const positionInfo = { minX: 0, maxX: 0, positions: [] };
    
    if (this.options.debug) {
      console.log(`🎨 生成 ${particleCount} 個粒子`);
    }
    
    // 清除現有粒子
    this.clearParticles();
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.createParticle(i, containerWidth, positionInfo);
      this.particles.push(particle);
      this.container.appendChild(particle);
    }
    
    if (this.options.showAnalysis) {
      this.logPositionAnalysis(positionInfo);
    }
    
    if (this.options.debug) {
      console.log(`✅ ${this.particles.length} 個粒子已創建`);
    }
  }
  
  /**
   * 創建單個粒子
   */
  createParticle(index, containerWidth, positionInfo) {
    const div = document.createElement('div');
    div.classList.add('circle'); // 使用與 debug 版本一致的類名
    
    // 使用 SimplexNoise 生成位置
    const n1 = this.simplex.noise2D(index * 0.003, index * 0.0033);
    const n2 = this.simplex.noise2D(index * 0.002, index * 0.001);
    
    // 計算位置
    const baseOffset = containerWidth * this.options.offsetX;
    const noiseOffset = n2 * (containerWidth * this.options.offsetRange);
    const translateX = baseOffset + noiseOffset;
    const translateY = 0; // 流式佈局
    
    // 計算變換
    const rotation = this.options.rotation ? n2 * 270 : 0;
    const scaleX = this.options.scale ? 
      this.options.scaleRange[0] + n1 * (this.options.scaleRange[1] - this.options.scaleRange[0]) : 1;
    const scaleY = this.options.scale ? 
      this.options.scaleRange[0] + n2 * (this.options.scaleRange[1] - this.options.scaleRange[0]) : 1;
    
    // 記錄位置信息
    if (positionInfo) {
      positionInfo.positions.push({ index, translateX, translateY, rotation, scaleX, scaleY });
      positionInfo.minX = Math.min(positionInfo.minX, translateX);
      positionInfo.maxX = Math.max(positionInfo.maxX, translateX);
    }
    
    // 解析顏色
    const colorRgba = this.parseColor(this.options.color, this.options.opacity);
    
    // 應用樣式
    const style = {
      position: 'absolute',
      width: '20px',
      height: '20px',
      borderRadius: '40%',
      opacity: '0',
      margin: '-19px auto',
      transition: 'transform 1s cubic-bezier(0.14, 0.15, 0.13, 0.99)',
      pointerEvents: 'none',
      zIndex: '1',
      transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
      boxShadow: `0 0 0 .2px ${colorRgba}`,
      border: 'none'
    };
    
    Object.assign(div.style, style);
    
    return div;
  }
  
  /**
   * 解析顏色字符串為 RGBA
   */
  parseColor(color, opacity) {
    // 如果已經是 RGBA 格式
    if (color.startsWith('rgba')) {
      return color;
    }
    
    // 如果是 RGB 格式
    if (color.startsWith('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    
    // 如果是 HEX 格式
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // 預設返回黃色
    return `rgba(243, 215, 78, ${opacity})`;
  }
  
  /**
   * 設置滾動動畫
   */
  setupScrollAnimation() {
    if (!this.options.scrollTrigger || this.particles.length === 0) {
      return;
    }
    
    // 註冊 ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    const triggerElement = this.container.parentElement || this.container;
    
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        scrub: this.options.scrollScrub,
        start: this.options.scrollStart,
        end: this.options.scrollEnd
      }
    });
    
    // 為所有粒子設置動畫
    this.particles.forEach(particle => {
      timeline.to(particle, {
        opacity: 1
      });
    });
    
    this.scrollTrigger = timeline.scrollTrigger;
    
    if (this.options.debug) {
      console.log('✅ 滾動動畫已設置');
    }
  }
  
  /**
   * 設置 ScrollSmoother（可選）
   */
  setupScrollSmoother() {
    if (typeof ScrollSmoother === 'undefined') {
      if (this.options.debug) {
        console.log('ℹ️ ScrollSmoother 未載入，跳過');
      }
      return;
    }
    
    try {
      // 檢查是否已經有 ScrollSmoother 實例
      if (ScrollSmoother.get()) {
        if (this.options.debug) {
          console.log('ℹ️ ScrollSmoother 已存在，跳過創建');
        }
        return;
      }
      
      ScrollSmoother.create({
        content: '#content',
        wrapper: '#wrapper',
        smooth: 1,
        effects: false
      });
      
      if (this.options.debug) {
        console.log('✅ ScrollSmoother 已設置');
      }
    } catch (error) {
      if (this.options.debug) {
        console.log('⚠️ ScrollSmoother 設置失敗:', error);
      }
    }
  }
  
  /**
   * 清除所有粒子
   */
  clearParticles() {
    this.particles.forEach(particle => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
    this.particles = [];
  }
  
  /**
   * 輸出位置分析日誌
   */
  logPositionAnalysis(positionInfo) {
    console.log('📊 粒子位置分析報告:');
    console.log(`   水平分佈範圍: ${positionInfo.minX.toFixed(1)}px 到 ${positionInfo.maxX.toFixed(1)}px`);
    console.log(`   總寬度跨度: ${(positionInfo.maxX - positionInfo.minX).toFixed(1)}px`);
    console.log(`   容器大小:`, this.container.getBoundingClientRect());
    console.log(`   前5個粒子位置:`, positionInfo.positions.slice(0, 5));
  }
  
  /**
   * 更新粒子配置
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    if (this.options.debug) {
      console.log('🔄 更新粒子配置:', newOptions);
    }
    
    // 重新生成粒子
    this.generateParticles();
    
    // 重新設置滾動動畫
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }
    
    if (this.options.scrollTrigger) {
      this.setupScrollAnimation();
    }
  }
  
  /**
   * 顯示所有粒子（調試用）
   */
  showAllParticles() {
    this.particles.forEach(particle => {
      particle.style.opacity = '1';
    });
  }
  
  /**
   * 隱藏所有粒子（調試用）
   */
  hideAllParticles() {
    this.particles.forEach(particle => {
      particle.style.opacity = '0';
    });
  }
  
  /**
   * 銷毀組件
   */
  destroy() {
    // 清除粒子
    this.clearParticles();
    
    // 清除 ScrollTrigger
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
      this.scrollTrigger = null;
    }
    
    // 清除引用
    this.container = null;
    this.simplex = null;
    
    if (this.options.debug) {
      console.log('🗑️ ParticleBackground 已銷毀');
    }
  }
  
  /**
   * 獲取組件狀態
   */
  getStatus() {
    return {
      initialized: !!this.container,
      particleCount: this.particles.length,
      hasScrollTrigger: !!this.scrollTrigger,
      containerSize: this.container ? this.container.getBoundingClientRect() : null,
      options: { ...this.options }
    };
  }
}

// 導出為全局變數（如果在瀏覽器環境）
if (typeof window !== 'undefined') {
  window.ParticleBackground = ParticleBackground;
}

// 支持 ES6 模組
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticleBackground;
}