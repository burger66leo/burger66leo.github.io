// ===========================================
// 導航欄滾動效果
// ===========================================
function handleNavbarScroll() {
  const navbar = document.getElementById('navbar');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ===========================================
// 滾動動畫功能
// ===========================================
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function checkAnimation() {
  const elements = document.querySelectorAll('.fade-in');
  elements.forEach(element => {
    if (isElementInViewport(element)) {
      element.classList.add('visible');
    }
  });
}

function initScrollAnimation() {
  window.addEventListener('scroll', checkAnimation);
  window.addEventListener('load', checkAnimation);
  // 初始檢查一次
  checkAnimation();
}

// ===========================================
// 平滑滾動功能
// ===========================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ===========================================
// 主題切換功能（可選）
// ===========================================
function initThemeToggle() {
  // 檢查是否有主題切換按鈕
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  // 獲取當前主題
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', currentTheme);
  
  // 主題切換事件
  themeToggle.addEventListener('click', function() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

// ===========================================
// 載入動畫
// ===========================================
function initLoadingAnimation() {
  // 頁面載入完成後移除載入畫面
  window.addEventListener('load', function() {
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
  });
}

// ===========================================
// 錯誤處理
// ===========================================
function handleErrors() {
  window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // 可以在這裡添加錯誤報告邏輯
  });
  
  window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    // 可以在這裡添加錯誤報告邏輯
  });
}

// ===========================================
// 效能優化：節流函數
// ===========================================
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// 優化滾動事件
function optimizeScrollEvents() {
  const throttledScroll = throttle(function() {
    checkAnimation();
  }, 100);
  
  window.addEventListener('scroll', throttledScroll);
}

// ===========================================
// 輔助功能：鍵盤導航
// ===========================================
function initAccessibility() {
  // 確保焦點可見
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('using-keyboard');
    }
  });
  
  document.addEventListener('mousedown', function() {
    document.body.classList.remove('using-keyboard');
  });
}

// ===========================================
// 初始化所有功能
// ===========================================
function init() {
  // 基本功能
  handleNavbarScroll();
  initScrollAnimation();
  initSmoothScroll();
  
  // 可選功能
  initThemeToggle();
  initLoadingAnimation();
  
  // 優化和輔助功能
  handleErrors();
  initAccessibility();
  
  console.log('三稜鏡 prism 網站已載入完成！');
}

// ===========================================
// DOM 載入完成後初始化
// ===========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ===========================================
// 全域工具函數（可在其他地方使用）
// ===========================================
window.PrismUtils = {
  throttle: throttle,
  isElementInViewport: isElementInViewport,
  checkAnimation: checkAnimation
};