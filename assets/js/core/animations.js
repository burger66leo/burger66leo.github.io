/* ===========================================
   簡化動畫系統 - 基於測試成功的邏輯
   =========================================== */

class SimpleAnimations {
  constructor() {
    this.isReady = false;
    this.init();
  }

  init() {
    // 等待 DOM 和 GSAP 準備完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startAnimations());
    } else {
      this.startAnimations();
    }
  }

  startAnimations() {
    // 檢查 GSAP 是否可用
    if (typeof gsap === 'undefined') {
      console.warn('GSAP 未載入，啟用降級方案');
      this.fallbackShow();
      return;
    }

    console.log('🎬 開始簡化動畫系統');
    this.isReady = true;

    // 簡單直接的動畫序列
    this.animateHeroElements();
    this.animateNavigation();
    this.setupScrollAnimations();
  }

  // Hero 區域動畫 - Logo 和打字機效果
  animateHeroElements() {
    const heroLogo = document.querySelector('.hero-logo');
    const heroDescription = document.querySelector('.hero-description');

    console.log('✅ 開始 Hero 元素動畫');

    // Logo 動畫
    if (heroLogo) {
      gsap.set(heroLogo, { opacity: 0, y: 30 });
      gsap.to(heroLogo, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
      });
    }

    // 描述文字打字機效果
    if (heroDescription) {
      this.setupTypingEffect(heroDescription, 1.2); // 縮短延遲時間
    }

    console.log('🎬 Hero 動畫序列啟動');
  }

  // 打字機效果
  setupTypingEffect(element, delay) {
    const originalText = element.textContent;
    
    // 設定初始狀態
    gsap.set(element, {
      opacity: 1,
      y: 0
    });

    // 清空文字，添加光標
    element.innerHTML = '<span class="typing-cursor">|</span>';

    // 光標閃爍動畫
    const cursor = element.querySelector('.typing-cursor');
    if (cursor) {
      const cursorTL = gsap.timeline({ repeat: -1 });
      cursorTL.to(cursor, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut"
      }).to(cursor, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.inOut"
      });
    }

    // 延遲後開始打字
    setTimeout(() => {
      this.typeText(element, originalText, {
        speed: 0.1,
        onComplete: () => {
          // 打字完成後讓光標消失
          setTimeout(() => {
            if (cursor) {
              gsap.to(cursor, {
                opacity: 0,
                duration: 0.3,
                delay: 1
              });
            }
          }, 500);
        }
      });
    }, delay * 1000);
  }

  // 打字機實現
  typeText(element, text, options = {}) {
    const { speed = 0.1, onComplete } = options;
    const cursor = element.querySelector('.typing-cursor');
    let currentText = '';
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        currentText += text[charIndex];
        element.innerHTML = currentText + '<span class="typing-cursor">|</span>';
        charIndex++;
      } else {
        clearInterval(typeInterval);
        if (onComplete) onComplete();
      }
    }, speed * 1000);
  }

  // 導航動畫 - 簡化版本
  animateNavigation() {
    const navbar = document.querySelector('.navbar');
    const logo = document.querySelector('.logo');
    const navItems = document.querySelectorAll('nav a');

    if (!navbar) return;

    console.log('🎬 開始導航動畫');

    // Logo 動畫
    if (logo) {
      gsap.fromTo(logo, 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }

    // 導航項目動畫
    if (navItems.length > 0) {
      gsap.fromTo(navItems,
        { opacity: 0, y: -20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.1,
          delay: 0.3,
          ease: "power2.out" 
        }
      );
    }
  }

  // 滾動動畫設置
  setupScrollAnimations() {
    if (typeof ScrollTrigger === 'undefined') {
      console.warn('ScrollTrigger 未載入');
      return;
    }

    console.log('🎬 設置滾動動畫');

    // 區塊淡入
    const sections = document.querySelectorAll('.section, .feature-section');
    sections.forEach(section => {
      gsap.fromTo(section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // 卡片動畫
    const cards = document.querySelectorAll('.feature-card');
    if (cards.length > 0) {
      gsap.fromTo(cards,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cards[0].parentElement,
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        }
      );
      
      // 使用經過驗證的舊版磁性效果 - 效果更理想
      const initMagneticCards = () => {
        const magneticCards = document.querySelectorAll('.card-item--magnetic');
        console.log('🔍 找到磁性卡片:', magneticCards.length);
        console.log('🔍 GSAP 狀態:', typeof gsap !== 'undefined' ? '已載入' : '未載入');
        
        if (magneticCards.length === 0) {
          console.log('❌ 未找到磁性卡片元素');
          return;
        }

        if (typeof gsap !== 'undefined') {
          // 直接使用經過驗證的舊版實現
          console.log('✅ 使用經典磁性效果實現');
          this.setupMagneticCards(magneticCards);
        } else {
          console.log('❌ GSAP 未載入，無法應用磁性效果');
        }
      };

      // 延遲執行確保 GSAP 完全載入
      setTimeout(initMagneticCards, 200);
    }
  }

  // 磁性卡片效果 - 經典理想版本
  setupMagneticCards(cards) {
    console.log('🧲 設置經典磁性卡片效果');
    
    cards.forEach((card, index) => {
      // 防止重複綁定
      if (card.dataset.magneticBound) {
        return;
      }
      card.dataset.magneticBound = 'true';
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // 優化的磁性效果參數
        gsap.to(card, {
          x: x * 0.12,  // 稍微減少強度讓效果更優雅
          y: y * 0.12,
          duration: 0.4,  // 稍微慢一點更平滑
          ease: "power2.out",
          force3D: true  // 強制GPU加速
        });
      });
      
      // 添加hover時的scale效果增強體驗
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      // 合併所有mouseleave效果
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { 
          x: 0, 
          y: 0, 
          scale: 1,
          duration: 0.6,  // 稍微慢一點的回彈更自然
          ease: "elastic.out(1, 0.4)",  // 稍微增加彈性
          force3D: true
        });
      });
    });
    
    console.log(`✅ 經典磁性效果已應用於 ${cards.length} 個卡片`);
  }

  // 降級方案 - 直接顯示所有元素
  fallbackShow() {
    console.log('🎬 啟用降級顯示方案');
    
    const elements = document.querySelectorAll(
      '.hero-logo, .hero-description, .logo, nav a, .feature-section, .feature-card'
    );
    
    elements.forEach(el => {
      if (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }

  // 清理方法
  cleanup() {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
  }
}

// 初始化簡化動畫系統
window.simpleAnimations = new SimpleAnimations();

// 頁面卸載時清理
window.addEventListener('beforeunload', () => {
  if (window.simpleAnimations) {
    window.simpleAnimations.cleanup();
  }
});

console.log('✅ 簡化動畫系統載入完成');