// 通用工具函數

// DOM 操作工具
const DOM = {
  // 選擇器
  $(selector) {
    return document.querySelector(selector);
  },
  
  $$(selector) {
    return document.querySelectorAll(selector);
  },
  
  // 創建元素
  create(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content;
    return element;
  },
  
  // 添加事件監聽器
  on(element, event, handler) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (element) {
      element.addEventListener(event, handler);
    }
  },
  
  // 移除事件監聽器
  off(element, event, handler) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (element) {
      element.removeEventListener(event, handler);
    }
  },
  
  // 切換類名
  toggleClass(element, className) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (element) {
      element.classList.toggle(className);
    }
  },
  
  // 添加類名
  addClass(element, className) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (element) {
      element.classList.add(className);
    }
  },
  
  // 移除類名
  removeClass(element, className) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (element) {
      element.classList.remove(className);
    }
  }
};

// 動畫工具
const Animation = {
  // 淡入動畫
  fadeIn(element, duration = 300) {
    if (typeof element === 'string') {
      element = DOM.$(element);
    }
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.display = 'block';
    element.style.transition = `opacity ${duration}ms ease`;
    
    setTimeout(() => {
      element.style.opacity = '1';
    }, 10);
  },
  
  // 淡出動畫
  fadeOut(element, duration = 300) {
    if (typeof element === 'string') {
      element = DOM.$(element);
    }
    if (!element) return;
    
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.style.display = 'none';
    }, duration);
  },
  
  // 滑入動畫
  slideIn(element, direction = 'up', duration = 600) {
    if (typeof element === 'string') {
      element = DOM.$(element);
    }
    if (!element) return;
    
    const transforms = {
      up: 'translateY(30px)',
      down: 'translateY(-30px)',
      left: 'translateX(30px)',
      right: 'translateX(-30px)'
    };
    
    element.style.opacity = '0';
    element.style.transform = transforms[direction];
    element.style.transition = `all ${duration}ms ease`;
    
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translate(0, 0)';
    }, 10);
  },
  
  // 漣漪效果
  ripple(element, event) {
    if (typeof element === 'string') {
      element = DOM.$(element);
    }
    if (!element || !event) return;
    
    const ripple = DOM.create('span', 'ripple-effect');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-animation 0.6s linear;
      pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
};

// 交集觀察器工具
const Observer = {
  // 滾動動畫觀察器
  scrollAnimation(elements, options = {}) {
    const defaultOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observerOptions = { ...defaultOptions, ...options };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);
    
    if (typeof elements === 'string') {
      elements = DOM.$$(elements);
    }
    
    elements.forEach(el => observer.observe(el));
    
    return observer;
  },
  
  // 懶加載圖片
  lazyImages(selector = 'img[data-src]') {
    const images = DOM.$$(selector);
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    return imageObserver;
  }
};

// 工具函數
const Utils = {
  // 節流函數
  throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // 防抖函數
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },
  
  // 平滑滾動
  smoothScrollTo(target, duration = 800) {
    const targetElement = typeof target === 'string' ? DOM.$(target) : target;
    if (!targetElement) return;
    
    const targetPosition = targetElement.offsetTop;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuart(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function easeInOutQuart(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t * t * t + b;
      t -= 2;
      return -c / 2 * (t * t * t * t - 2) + b;
    }
    
    requestAnimationFrame(animation);
  },
  
  // 格式化數字
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },
  
  // 複製到剪貼板
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // 降級方案
      const textArea = DOM.create('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        return true;
      } catch (err) {
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    }
  },
  
  // 檢測設備類型
  isMobile() {
    return window.innerWidth <= 768;
  },
  
  isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  },
  
  isDesktop() {
    return window.innerWidth > 1024;
  },
  
  // 檢測觸控設備
  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
};

// 通知系統
const Notification = {
  show(message, type = 'info', duration = 5000) {
    const notification = DOM.create('div', `notification ${type}`, message);
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    // 設置背景顏色
    const colors = {
      success: '#2ECC71',
      error: '#E74C3C',
      warning: '#F39C12',
      info: '#4A90E2'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // 顯示動畫
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自動隱藏
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
    
    // 點擊關閉
    notification.addEventListener('click', () => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
    
    return notification;
  }
};

// 添加 CSS 動畫
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease;
  }
  
  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .lazy {
    filter: blur(5px);
    transition: filter 0.3s;
  }
`;
document.head.appendChild(style);

// 導出到全域
window.DOM = DOM;
window.Animation = Animation;
window.Observer = Observer;
window.Utils = Utils;
window.Notification = Notification;