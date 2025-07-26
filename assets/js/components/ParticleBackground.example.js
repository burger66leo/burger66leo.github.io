/**
 * ParticleBackground 使用示例和預設配置
 * 提供常見的使用場景和配置模板
 */

// 預設配置模板
const ParticleBackgroundPresets = {
  
  // 經典左偏黃色粒子（首頁使用 - 與 debug 版本保持一致）
  classicLeft: {
    color: '#F3D74E',
    opacity: 0.5,
    offsetX: -1/3,
    offsetRange: 0.3,
    density: 'medium', // 匹配 debug 版本的 3000/2000/1200 粒子數量
    scrollTrigger: true,
    scrollStart: "top 80%",
    scrollEnd: "bottom 20%",
    scrollScrub: 0.7,
    debug: false, // 正式版本關閉 debug
    showAnalysis: false // 正式版本關閉位置分析
  },
  
  // 居中藍色粒子
  centerBlue: {
    color: '#4A90E2',
    opacity: 0.4,
    offsetX: 0,
    offsetRange: 0.4,
    density: 'medium',
    scrollTrigger: true
  },
  
  // 右偏綠色粒子
  rightGreen: {
    color: '#2ECC71',
    opacity: 0.6,
    offsetX: 1/3,
    offsetRange: 0.25,
    density: 'low',
    scrollTrigger: true
  },
  
  // 高密度全屏粒子
  fullScreen: {
    color: '#F3D74E',
    opacity: 0.3,
    offsetX: 0,
    offsetRange: 0.6,
    density: 'high',
    scrollTrigger: false,
    rotation: false,
    scale: false
  },
  
  // 極簡粒子（效能優先）
  minimal: {
    color: '#F3D74E',
    opacity: 0.7,
    offsetX: -1/4,
    offsetRange: 0.2,
    density: 'low',
    scrollTrigger: true,
    rotation: false,
    scale: false,
    lowEndReduction: 0.4
  },
  
  // 調試模式
  debug: {
    color: '#FF0000',
    opacity: 0.8,
    offsetX: -1/3,
    offsetRange: 0.3,
    density: 'low',
    scrollTrigger: true,
    debug: true,
    showAnalysis: true
  }
};

/**
 * 使用示例函數
 */
const ParticleBackgroundExamples = {
  
  /**
   * 基本使用
   */
  basic() {
    const particleBg = new ParticleBackground('#my-container');
    particleBg.init();
    return particleBg;
  },
  
  /**
   * 使用預設配置
   */
  withPreset(presetName = 'classicLeft') {
    const preset = ParticleBackgroundPresets[presetName];
    const particleBg = new ParticleBackground('#my-container', preset);
    particleBg.init();
    return particleBg;
  },
  
  /**
   * 自訂配置
   */
  custom() {
    const particleBg = new ParticleBackground('#my-container', {
      color: '#E74C3C',
      opacity: 0.6,
      offsetX: -0.4,
      density: 'medium',
      scrollStart: "top 90%",
      debug: true
    });
    particleBg.init();
    return particleBg;
  },
  
  /**
   * 多個容器
   */
  multiple() {
    const containers = ['#header-bg', '#content-bg', '#footer-bg'];
    const instances = [];
    
    containers.forEach((selector, index) => {
      const colors = ['#F3D74E', '#4A90E2', '#2ECC71'];
      const offsets = [-1/3, 0, 1/3];
      
      const particleBg = new ParticleBackground(selector, {
        color: colors[index],
        offsetX: offsets[index],
        density: 'low'
      });
      
      particleBg.init();
      instances.push(particleBg);
    });
    
    return instances;
  },
  
  /**
   * 響應式粒子密度
   */
  responsive() {
    const getDensityByScreenSize = () => {
      const width = window.innerWidth;
      if (width > 1200) return 'high';
      if (width > 768) return 'medium';
      return 'low';
    };
    
    const particleBg = new ParticleBackground('#my-container', {
      density: getDensityByScreenSize(),
      color: '#F3D74E'
    });
    
    particleBg.init();
    
    // 視窗大小改變時更新密度
    window.addEventListener('resize', () => {
      particleBg.updateOptions({
        density: getDensityByScreenSize()
      });
    });
    
    return particleBg;
  },
  
  /**
   * 帶動畫控制的粒子
   */
  withControls() {
    const particleBg = new ParticleBackground('#my-container', {
      color: '#F3D74E',
      density: 'medium',
      scrollTrigger: false // 手動控制
    });
    
    particleBg.init();
    
    // 提供控制方法
    return {
      instance: particleBg,
      show: () => particleBg.showAllParticles(),
      hide: () => particleBg.hideAllParticles(),
      changeColor: (color) => particleBg.updateOptions({ color }),
      changeDensity: (density) => particleBg.updateOptions({ density }),
      destroy: () => particleBg.destroy()
    };
  }
};

/**
 * 工具函數
 */
const ParticleBackgroundUtils = {
  
  /**
   * 檢查瀏覽器支援
   */
  checkSupport() {
    const support = {
      gsap: typeof gsap !== 'undefined',
      scrollTrigger: typeof ScrollTrigger !== 'undefined',
      scrollSmoother: typeof ScrollSmoother !== 'undefined',
      css3Transform: 'transform' in document.documentElement.style
    };
    
    console.log('🔍 ParticleBackground 支援檢查:', support);
    return support;
  },
  
  /**
   * 效能評估
   */
  performanceCheck() {
    const performance = {
      cores: navigator.hardwareConcurrency || 2,
      memory: navigator.deviceMemory || 'unknown',
      connection: navigator.connection?.effectiveType || 'unknown',
      isLowEnd: navigator.hardwareConcurrency < 4
    };
    
    console.log('⚡ 設備效能檢查:', performance);
    return performance;
  },
  
  /**
   * 獲取推薦配置
   */
  getRecommendedConfig() {
    const perf = this.performanceCheck();
    
    if (perf.isLowEnd) {
      return {
        ...ParticleBackgroundPresets.minimal,
        density: 'low',
        lowEndReduction: 0.3
      };
    }
    
    return ParticleBackgroundPresets.classicLeft;
  },
  
  /**
   * 批量創建
   */
  createMultiple(configs) {
    const instances = [];
    
    configs.forEach(config => {
      const { selector, options } = config;
      const particleBg = new ParticleBackground(selector, options);
      
      if (particleBg.init()) {
        instances.push(particleBg);
      }
    });
    
    return instances;
  },
  
  /**
   * 全局管理器
   */
  createManager() {
    const instances = new Map();
    
    return {
      create(id, selector, options) {
        const particleBg = new ParticleBackground(selector, options);
        if (particleBg.init()) {
          instances.set(id, particleBg);
          return particleBg;
        }
        return null;
      },
      
      get(id) {
        return instances.get(id);
      },
      
      update(id, options) {
        const instance = instances.get(id);
        if (instance) {
          instance.updateOptions(options);
        }
      },
      
      destroy(id) {
        const instance = instances.get(id);
        if (instance) {
          instance.destroy();
          instances.delete(id);
        }
      },
      
      destroyAll() {
        instances.forEach(instance => instance.destroy());
        instances.clear();
      },
      
      getAll() {
        return Array.from(instances.entries());
      },
      
      count() {
        return instances.size;
      }
    };
  }
};

// 全局可用
if (typeof window !== 'undefined') {
  window.ParticleBackgroundPresets = ParticleBackgroundPresets;
  window.ParticleBackgroundExamples = ParticleBackgroundExamples;
  window.ParticleBackgroundUtils = ParticleBackgroundUtils;
}