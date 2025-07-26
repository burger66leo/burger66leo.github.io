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

// 極簡動畫工具 - 僅保留必要效果
const Animation = {
  // 極簡淡入
  fadeIn(element, duration = 300) {
    if (typeof element === 'string') {
      element = DOM.$(element);
    }
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.display = 'block';
    element.style.transition = `opacity ${duration}ms ease`;
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
  },
  
  // 極簡淡出
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
  }
  
  // 移除所有transform動畫和漣漪效果
};

// 極簡觀察器工具
const Observer = {
  // 極簡滾動觀察器 - 一次性效果
  scrollAnimation(elements, options = {}) {
    const defaultOptions = {
      threshold: 0.15,  // 提高閾值
      rootMargin: '0px 0px -30px 0px'
    };
    
    const observerOptions = { ...defaultOptions, ...options };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // 一次性效果，觀察後移除
          observer.unobserve(entry.target);
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

// 極簡通知系統
const Notification = {
  show(message, type = 'info', duration = 4000) {
    const notification = DOM.create('div', `notification ${type}`, message);
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 2px;
      border: 1px solid;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    // 極簡色彩方案
    const colors = {
      success: { bg: '#d4edda', border: '#c3e6cb', color: '#155724' },
      error: { bg: '#f8d7da', border: '#f5c6cb', color: '#721c24' },
      warning: { bg: '#fff3cd', border: '#ffeaa7', color: '#856404' },
      info: { bg: '#f8f9fa', border: '#dee2e6', color: '#495057' }
    };
    
    const style = colors[type] || colors.info;
    Object.assign(notification.style, {
      backgroundColor: style.bg,
      borderColor: style.border,
      color: style.color
    });
    
    document.body.appendChild(notification);
    
    // 極簡顯示效果
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
    });
    
    // 自動隱藏
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, duration);
    
    // 點擊關閉
    notification.addEventListener('click', () => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    });
    
    return notification;
  }
};

// 極簡 CSS 樣式
const style = document.createElement('style');
style.textContent = `
  /* 極簡淡入效果 */
  .fade-in {
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  .fade-in.visible {
    opacity: 1;
  }
  
  /* 懶加載圖片 */
  .lazy {
    opacity: 0.5;
    transition: opacity 0.3s ease;
  }
  
  /* 移除所有transform和複雜動畫 */
`;
document.head.appendChild(style);

// 導出到全域
window.DOM = DOM;
window.Animation = Animation;
window.Observer = Observer;
window.Utils = Utils;
window.Notification = Notification;