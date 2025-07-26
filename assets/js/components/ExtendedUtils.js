/* ===========================================
   擴展工具函數庫 - 補充現有 Utils 功能
   =========================================== */

// 擴展現有的 Utils 對象
Utils.extend = {
  // 🎨 顏色工具
  color: {
    hexToRgb: (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },
    
    rgbToHex: (r, g, b) => {
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    },
    
    lighten: (hex, percent) => {
      const rgb = Utils.extend.color.hexToRgb(hex);
      if (!rgb) return hex;
      
      const r = Math.min(255, rgb.r + (255 - rgb.r) * percent / 100);
      const g = Math.min(255, rgb.g + (255 - rgb.g) * percent / 100);
      const b = Math.min(255, rgb.b + (255 - rgb.b) * percent / 100);
      
      return Utils.extend.color.rgbToHex(Math.round(r), Math.round(g), Math.round(b));
    },
    
    darken: (hex, percent) => {
      const rgb = Utils.extend.color.hexToRgb(hex);
      if (!rgb) return hex;
      
      const r = Math.max(0, rgb.r - rgb.r * percent / 100);
      const g = Math.max(0, rgb.g - rgb.g * percent / 100);
      const b = Math.max(0, rgb.b - rgb.b * percent / 100);
      
      return Utils.extend.color.rgbToHex(Math.round(r), Math.round(g), Math.round(b));
    }
  },

  // 📐 數學工具
  math: {
    lerp: (start, end, factor) => start + (end - start) * factor,
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    map: (value, inMin, inMax, outMin, outMax) => {
      return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },
    distance: (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
    angle: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI,
    random: (min, max) => Math.random() * (max - min) + min,
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  },

  // 🧮 數組工具
  array: {
    shuffle: (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },
    
    chunk: (array, size) => {
      const chunks = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    },
    
    unique: (array, key = null) => {
      if (key) {
        const seen = new Set();
        return array.filter(item => {
          const val = item[key];
          if (seen.has(val)) return false;
          seen.add(val);
          return true;
        });
      }
      return [...new Set(array)];
    },
    
    groupBy: (array, key) => {
      return array.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
      }, {});
    }
  },

  // 🎯 DOM 增強
  dom: {
    isInViewport: (element, threshold = 0) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= -threshold &&
        rect.left >= -threshold &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + threshold &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + threshold
      );
    },
    
    getElementCenter: (element) => {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    },
    
    getScrollPercent: () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      return scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    },
    
    waitForImages: (container = document) => {
      const images = container.querySelectorAll('img');
      const promises = Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = resolve;
            img.onerror = resolve;
          }
        });
      });
      return Promise.all(promises);
    }
  },

  // 📱 設備檢測
  device: {
    isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: () => /Android/.test(navigator.userAgent),
    isSafari: () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    isChrome: () => /Chrome/.test(navigator.userAgent),
    isFirefox: () => /Firefox/.test(navigator.userAgent),
    
    getDeviceInfo: () => ({
      isMobile: Utils.isMobile(),
      isTablet: Utils.isTablet(),
      isDesktop: Utils.isDesktop(),
      isTouch: Utils.isTouchDevice(),
      isIOS: Utils.extend.device.isIOS(),
      isAndroid: Utils.extend.device.isAndroid(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    })
  },

  // 🎭 動畫緩動函數
  easing: {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: t => t * t * t * t,
    easeOutQuart: t => 1 - (--t) * t * t * t,
    easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    easeInBack: t => t * t * (2.7 * t - 1.7),
    easeOutBack: t => 1 + (--t) * t * (2.7 * t + 1.7),
    easeInOutBack: t => t < 0.5 
      ? t * t * (7 * t - 2.5) * 2
      : 1 + (--t) * t * 2 * (7 * t + 2.5)
  },

  // 🔧 性能工具
  performance: {
    measure: (name, fn) => {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
      return result;
    },
    
    measureAsync: async (name, fn) => {
      const start = performance.now();
      const result = await fn();
      const end = performance.now();
      console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
      return result;
    },
    
    raf: (callback) => {
      return requestAnimationFrame(callback);
    },
    
    cancelRaf: (id) => {
      cancelAnimationFrame(id);
    }
  },

  // 🌐 URL 和查詢工具
  url: {
    getParam: (param) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    },
    
    setParam: (param, value) => {
      const url = new URL(window.location);
      url.searchParams.set(param, value);
      window.history.replaceState({}, '', url);
    },
    
    removeParam: (param) => {
      const url = new URL(window.location);
      url.searchParams.delete(param);
      window.history.replaceState({}, '', url);
    },
    
    parseUrl: (url) => {
      try {
        const parsed = new URL(url);
        return {
          protocol: parsed.protocol,
          host: parsed.host,
          pathname: parsed.pathname,
          search: parsed.search,
          hash: parsed.hash,
          params: Object.fromEntries(parsed.searchParams)
        };
      } catch (e) {
        return null;
      }
    }
  },

  // 💾 存儲工具
  storage: {
    set: (key, value, expiry = null) => {
      try {
        const item = {
          value: value,
          expiry: expiry ? Date.now() + expiry : null
        };
        localStorage.setItem(key, JSON.stringify(item));
      } catch (e) {
        console.warn('localStorage not available:', e);
      }
    },
    
    get: (key, defaultValue = null) => {
      try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return defaultValue;
        
        const item = JSON.parse(itemStr);
        
        if (item.expiry && Date.now() > item.expiry) {
          localStorage.removeItem(key);
          return defaultValue;
        }
        
        return item.value;
      } catch (e) {
        console.warn('localStorage not available:', e);
        return defaultValue;
      }
    },
    
    remove: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('localStorage not available:', e);
      }
    },
    
    clear: () => {
      try {
        localStorage.clear();
      } catch (e) {
        console.warn('localStorage not available:', e);
      }
    }
  },

  // 📅 日期工具
  date: {
    format: (date, format = 'YYYY-MM-DD') => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      
      return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    },
    
    timeAgo: (date) => {
      const now = new Date();
      const diff = now - new Date(date);
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days}天前`;
      if (hours > 0) return `${hours}小時前`;
      if (minutes > 0) return `${minutes}分鐘前`;
      return '剛剛';
    },
    
    isValid: (date) => {
      return date instanceof Date && !isNaN(date);
    }
  },

  // 🎨 CSS 工具
  css: {
    getCustomProperty: (property) => {
      return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
    },
    
    setCustomProperty: (property, value) => {
      document.documentElement.style.setProperty(property, value);
    },
    
    injectCSS: (css, id = null) => {
      const style = document.createElement('style');
      if (id) style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    },
    
    removeCSS: (id) => {
      const style = document.getElementById(id);
      if (style) style.remove();
    }
  },

  // 🔍 驗證工具
  validate: {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    url: (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    phone: (phone) => /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, '')),
    isEmpty: (value) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.trim() === '';
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === 'object') return Object.keys(value).length === 0;
      return false;
    }
  },

  // 🎪 實用工具
  misc: {
    generateId: (prefix = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    retry: async (fn, maxAttempts = 3, delay = 1000) => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await fn();
        } catch (error) {
          if (attempt === maxAttempts) throw error;
          await Utils.extend.misc.sleep(delay);
        }
      }
    },
    
    pipe: (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value),
    
    compose: (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value),
    
    once: (fn) => {
      let called = false;
      let result;
      return (...args) => {
        if (!called) {
          called = true;
          result = fn(...args);
        }
        return result;
      };
    }
  }
};

// 日誌系統
Utils.log = {
  info: (message, data = null) => {
    console.log(`ℹ️ ${message}`, data || '');
  },
  
  warn: (message, data = null) => {
    console.warn(`⚠️ ${message}`, data || '');
  },
  
  error: (message, error = null) => {
    console.error(`❌ ${message}`, error || '');
  },
  
  success: (message, data = null) => {
    console.log(`✅ ${message}`, data || '');
  },
  
  debug: (message, data = null) => {
    if (window.location.search.includes('debug=true')) {
      console.log(`🐛 ${message}`, data || '');
    }
  }
};

console.log('🚀 ExtendedUtils 已載入，擴展現有 Utils 功能');

// 為了向後相容，也導出到全域
window.ExtendedUtils = Utils.extend;