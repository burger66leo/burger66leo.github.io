/**
 * 統一的網站核心 JavaScript
 * 包含所有頁面共用的功能，避免重複載入和衝突
 */

// ===== 全域配置 =====
window.SiteConfig = {
  debug: true,
  animations: {
    enabled: true,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
};

// ===== 工具函數 =====
const Utils = {
  // 節流函數
  throttle: function(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // DOM 操作
  DOM: {
    ready: function(callback) {
      if (document.readyState !== 'loading') {
        callback();
      } else {
        document.addEventListener('DOMContentLoaded', callback);
      }
    },
    
    select: function(selector, context = document) {
      return context.querySelector(selector);
    },
    
    selectAll: function(selector, context = document) {
      return context.querySelectorAll(selector);
    }
  },

  // 日誌工具
  log: function(message, type = 'info') {
    if (window.SiteConfig.debug) {
      const emoji = { info: '📝', success: '✅', error: '❌', warn: '⚠️' };
      console.log(`${emoji[type] || '📝'} ${message}`);
    }
  }
};

// ===== Navbar 管理系統 =====
class NavbarManager {
  constructor() {
    this.navbar = Utils.DOM.select('#navbar');
    this.menuToggle = Utils.DOM.select('#menuToggle');
    this.nav = Utils.DOM.select('#nav');
    this.lastScrollY = window.scrollY;
    this.init();
  }

  init() {
    if (!this.navbar) return;
    
    this.setupMobileMenu();
    this.setupScrollBehavior();
    Utils.log('Navbar 系統初始化完成');
  }

  setupMobileMenu() {
    if (this.menuToggle && this.nav) {
      this.menuToggle.addEventListener('click', () => {
        this.nav.classList.toggle('active');
        this.menuToggle.classList.toggle('active');
      });
    }
  }

  setupScrollBehavior() {
    const handleScroll = Utils.throttle(() => {
      if (window.scrollY > 50) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
      this.lastScrollY = window.scrollY;
    }, 100);

    window.addEventListener('scroll', handleScroll);
  }
}

// ===== 粒子背景系統 =====
class ParticleBackground {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = Utils.DOM.select(`#${containerId}`);
    this.options = {
      particleCount: options.particleCount || 1000,
      opacity: options.opacity || 0.3,
      color: options.color || '#F3D74E',
      ...options
    };
    
    if (!this.container) {
      Utils.log(`粒子容器 #${containerId} 未找到`, 'error');
      return;
    }
    
    this.init();
  }

  init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      Utils.log('GSAP 或 ScrollTrigger 未載入', 'error');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    this.createParticles();
    this.setupScrollAnimation();
    Utils.log(`粒子背景初始化完成 (${this.options.particleCount} 個粒子)`);
  }

  createParticles() {
    // 清除現有粒子
    this.container.innerHTML = '';
    
    // 創建 SimplexNoise 實例
    const simplex = new SimplexNoise();
    const containerWidth = this.container.offsetWidth || window.innerWidth;
    
    for (let i = 0; i < this.options.particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'circle';
      
      // 噪聲計算
      const n1 = simplex.noise2D(i * 0.003, i * 0.0033);
      const n2 = simplex.noise2D(i * 0.002, i * 0.001);
      
      // 位置計算 - 垂直流動佈局
      const baseX = containerWidth * (-1 / 3);
      const noiseX = n1 * (containerWidth * (4 / 3));
      const finalX = baseX + noiseX;
      
      const rotation = n2 * 270;
      const scaleX = 3 + n1 * 2;
      const scaleY = 3 + n2 * 2;
      
      // 設置樣式
      Object.assign(particle.style, {
        transform: `translateX(${finalX}px) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
        boxShadow: `0 0 0 .2px rgba(243, 215, 78, ${this.options.opacity})`,
        border: 'none',
        opacity: '0'
      });
      
      this.container.appendChild(particle);
    }
  }

  setupScrollAnimation() {
    const circles = this.container.querySelectorAll('.circle');
    const triggerElement = this.container.parentElement || document.body;
    
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        scrub: 0.7,
        start: "top 80%",
        end: "bottom 20%"
      }
    });
    
    circles.forEach(circle => {
      timeline.to(circle, { opacity: 1 });
    });
  }

  // 測試方法
  showAll() {
    const circles = this.container.querySelectorAll('.circle');
    circles.forEach(circle => {
      circle.style.opacity = '1';
    });
    Utils.log(`顯示所有 ${circles.length} 個粒子`, 'success');
  }
}

// ===== 頁面特定功能管理器 =====
class PageManager {
  constructor() {
    this.currentPage = this.detectCurrentPage();
    this.init();
  }

  detectCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('about')) return 'about';
    if (path.includes('apps')) return 'apps';
    if (path.includes('videos')) return 'videos';
    if (path.includes('work-with-us')) return 'work-with-us';
    return 'index';
  }

  init() {
    Utils.log(`當前頁面: ${this.currentPage}`);
    
    // 初始化 Navbar
    new NavbarManager();
    
    // 根據頁面初始化特定功能
    switch (this.currentPage) {
      case 'about':
        this.initAboutPage();
        break;
      case 'index':
        this.initIndexPage();
        break;
      // 其他頁面可以在這裡添加
    }
  }

  initAboutPage() {
    Utils.log('初始化 About 頁面特定功能');
    
    // 初始化粒子背景
    window.particleBackground = new ParticleBackground('particles-background-layer', {
      particleCount: window.innerWidth <= 768 ? 800 : 1200,
      opacity: 0.3
    });

    // 創建全域控制函數
    window.aboutParticleControls = {
      showAll: () => window.particleBackground?.showAll(),
      quickTest: () => {
        Utils.log('快速測試粒子系統');
        window.particleBackground?.showAll();
      }
    };

    // 其他 About 頁面功能...
    this.initStackingCards();
    this.initContentGallery();
    this.initDisclosureToggle();
  }

  initIndexPage() {
    Utils.log('初始化首頁特定功能');
    // 首頁特定功能在這裡實現
  }

  // About 頁面的堆疊卡片功能
  initStackingCards() {
    if (typeof gsap === 'undefined') return;
    
    const cards = gsap.utils.toArray(".stack-card");
    if (cards.length === 0) return;

    let stickDistance = 0;
    let firstCardST = ScrollTrigger.create({
      trigger: cards[0],
      start: "center center"
    });

    let lastCardST = ScrollTrigger.create({
      trigger: cards[cards.length - 1],
      start: "center center"
    });

    cards.forEach((card, index) => {
      var scale = 1 - (cards.length - index) * 0.025;
      
      let scaleDown = gsap.to(card, {
        scale: scale, 
        transformOrigin: "50% -160%",
        ease: "none"
      });

      ScrollTrigger.create({
        trigger: card,
        start: "center center",
        end: () => lastCardST.start + stickDistance,
        pin: true,
        pinSpacing: false,
        animation: scaleDown,
        toggleActions: "restart none none reverse"
      });
    });
    
    Utils.log('堆疊卡片動畫初始化完成');
  }

  // About 頁面的內容畫廊功能
  initContentGallery() {
    if (typeof gsap === 'undefined') return;
    
    const cards = gsap.utils.toArray('.content-card');
    if (cards.length === 0) return;

    let currentIndex = 0;

    const updateCardsLayout = () => {
      cards.forEach((card, index) => {
        const offset = index - currentIndex;
        const distance = Math.abs(offset);
        const xPercent = offset * 80;
        const scale = Math.max(0.4, 1 - distance * 0.15);
        const opacity = distance <= 2 ? (distance <= 1 ? 1 : 0.6) : 0;
        const zIndex = 100 - distance;

        gsap.set(card, { xPercent, scale, opacity, zIndex });
      });
    };

    const showCard = (index) => {
      const targetIndex = ((index % cards.length) + cards.length) % cards.length;
      if (targetIndex === currentIndex) return;
      
      currentIndex = targetIndex;
      updateCardsLayout();
    };

    // 初始化佈局
    updateCardsLayout();

    // 按鈕控制
    Utils.DOM.select(".content-next")?.addEventListener("click", () => showCard(currentIndex + 1));
    Utils.DOM.select(".content-prev")?.addEventListener("click", () => showCard(currentIndex - 1));

    Utils.log('內容畫廊初始化完成');
  }

  // About 頁面的 Disclosure 功能
  initDisclosureToggle() {
    const toggleHeaders = Utils.DOM.selectAll('.disclosure-toggle-header');
    
    toggleHeaders.forEach(header => {
      header.addEventListener('click', function() {
        const targetId = this.getAttribute('data-toggle');
        const content = Utils.DOM.select(`#${targetId}`);
        const isActive = this.classList.contains('active');
        
        // 關閉其他的 toggle
        toggleHeaders.forEach(otherHeader => {
          if (otherHeader !== this) {
            otherHeader.classList.remove('active');
            const otherTargetId = otherHeader.getAttribute('data-toggle');
            const otherContent = Utils.DOM.select(`#${otherTargetId}`);
            otherContent?.classList.remove('active');
          }
        });
        
        // 切換當前 toggle
        if (isActive) {
          this.classList.remove('active');
          content?.classList.remove('active');
        } else {
          this.classList.add('active');
          content?.classList.add('active');
        }
      });
    });
    
    if (toggleHeaders.length > 0) {
      Utils.log(`Disclosure Toggle 初始化完成 (${toggleHeaders.length} 個項目)`);
    }
  }
}

// ===== 初始化 =====
Utils.DOM.ready(() => {
  Utils.log('網站初始化開始');
  new PageManager();
});

// 視窗大小變化時刷新 ScrollTrigger
window.addEventListener('resize', Utils.throttle(() => {
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
}, 250));