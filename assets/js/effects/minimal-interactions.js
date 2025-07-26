/* ===========================================
   極簡互動系統 - 去除過度動畫效果
   =========================================== */

// 極簡設計原則：
// 1. 僅保留功能性互動
// 2. 移除裝飾性動畫
// 3. 簡化視覺反饋
// 4. 專注使用者體驗

class MinimalInteractions {
  constructor() {
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupScrollEffects();
    this.setupFormInteractions();
    this.setupMinimalAnimations();
  }

  // ===========================================
  // 導航系統 - 僅保留基本功能
  // ===========================================
  setupNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    const navbar = document.getElementById('navbar');

    // 移動端菜單切換 - 簡化版
    if (menuToggle && nav) {
      menuToggle.addEventListener('click', () => {
        const isActive = nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // 僅設定必要的 aria 屬性
        nav.setAttribute('aria-hidden', !isActive);
        menuToggle.setAttribute('aria-expanded', isActive);
      });

      // 點擊外部關閉菜單
      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
          nav.classList.remove('active');
          menuToggle.classList.remove('active');
          nav.setAttribute('aria-hidden', 'true');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // 滾動導航效果 - 僅改變樣式類別
    if (navbar) {
      const handleScroll = () => {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      };

      // 使用節流提升效能
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      });
    }
  }

  // ===========================================
  // 滾動效果 - 極簡版
  // ===========================================
  setupScrollEffects() {
    // 僅保留淡入效果，移除複雜的 transform
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // 一次性效果，不需要重複觀察
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // 觀察需要淡入的元素
    document.querySelectorAll('.fade-in').forEach(el => {
      observer.observe(el);
    });
  }

  // ===========================================
  // 表單互動 - 簡化反饋
  // ===========================================
  setupFormInteractions() {
    // 表單驗證 - 簡單狀態變化
    document.querySelectorAll('input, textarea, select').forEach(input => {
      // 焦點狀態
      input.addEventListener('focus', function() {
        this.classList.add('focused');
      });

      input.addEventListener('blur', function() {
        this.classList.remove('focused');
        
        // 簡單驗證狀態
        if (this.hasAttribute('required') && !this.value.trim()) {
          this.classList.add('error');
        } else {
          this.classList.remove('error');
        }
      });
    });

    // 按鈕點擊 - 僅狀態變化
    document.querySelectorAll('button, .btn').forEach(btn => {
      btn.addEventListener('click', function() {
        // 簡單的點擊反饋
        this.classList.add('clicked');
        setTimeout(() => {
          this.classList.remove('clicked');
        }, 150);
      });
    });
  }

  // ===========================================
  // 極簡動畫 - 僅功能性效果
  // ===========================================
  setupMinimalAnimations() {
    // 卡片懸停 - 僅邊框變化
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.classList.add('hovered');
      });

      card.addEventListener('mouseleave', function() {
        this.classList.remove('hovered');
      });
    });

    // 連結懸停 - 僅顏色變化
    document.querySelectorAll('a').forEach(link => {
      // CSS 已處理懸停效果，無需 JavaScript
    });
  }

  // ===========================================
  // 通知系統 - 極簡版
  // ===========================================
  static showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 簡單的樣式
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 16px',
      borderRadius: '2px',
      border: '1px solid',
      zIndex: '10000',
      opacity: '0',
      transition: 'opacity 0.3s ease'
    });

    // 根據類型設定顏色
    const colors = {
      info: { bg: '#f8f9fa', border: '#dee2e6', color: '#495057' },
      success: { bg: '#d4edda', border: '#c3e6cb', color: '#155724' },
      error: { bg: '#f8d7da', border: '#f5c6cb', color: '#721c24' },
      warning: { bg: '#fff3cd', border: '#ffeaa7', color: '#856404' }
    };

    const style = colors[type];
    Object.assign(notification.style, {
      backgroundColor: style.bg,
      borderColor: style.border,
      color: style.color
    });

    document.body.appendChild(notification);

    // 淡入
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
    });

    // 自動移除
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // ===========================================
  // 工具方法
  // ===========================================
  static fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.min(progress / duration, 1);
      
      element.style.opacity = opacity;
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  }

  static fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = initialOpacity * (1 - Math.min(progress / duration, 1));
      
      element.style.opacity = opacity;
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    }
    
    requestAnimationFrame(animate);
  }
}

// ===========================================
// CSS 輔助類別 - 極簡動畫
// ===========================================
const minimalStyles = `
/* 極簡淡入效果 */
.fade-in {
  opacity: 0;
  transition: opacity 0.4s ease;
}

.fade-in.visible {
  opacity: 1;
}

/* 表單狀態 */
.focused {
  border-color: var(--primary-yellow) !important;
}

.error {
  border-color: #dc3545 !important;
}

/* 按鈕點擊狀態 */
.clicked {
  opacity: 0.8;
}

/* 卡片懸停狀態 */
.card.hovered {
  border-color: rgba(74, 92, 106, 0.3) !important;
}

/* 移除所有過度動畫 */
.no-animations * {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}
`;

// 注入極簡樣式
const styleSheet = document.createElement('style');
styleSheet.textContent = minimalStyles;
document.head.appendChild(styleSheet);

// 初始化極簡互動系統
document.addEventListener('DOMContentLoaded', () => {
  new MinimalInteractions();
});

// 提供關閉動畫的選項（輔助功能）
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('no-animations');
}

// 導出給其他模組使用
window.MinimalInteractions = MinimalInteractions;