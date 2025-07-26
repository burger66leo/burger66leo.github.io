// 節流函數
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

// 滾動效果（使用節流）
const handleScroll = throttle(function() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
}, 100);

window.addEventListener('scroll', handleScroll);

// 移動端菜單切換
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
  // 菜單切換處理
  const toggleMenu = function() {
    try {
      menuToggle.classList.toggle('active');
      nav.classList.toggle('active');
      
      // 為可訪問性添加 aria 屬性
      const isActive = nav.classList.contains('active');
      nav.setAttribute('aria-hidden', !isActive);
      menuToggle.setAttribute('aria-expanded', isActive);
    } catch (error) {
      console.error('菜單切換失敗:', error);
    }
  };

  menuToggle.addEventListener('click', toggleMenu);

  // 點擊菜單項目後關閉菜單
  const navLinks = nav.querySelectorAll('a');
  if (navLinks.length > 0) {
    // 使用事件委託而不是為每個連結添加監聽器
    nav.addEventListener('click', function(event) {
      if (event.target.tagName === 'A') {
        try {
          menuToggle.classList.remove('active');
          nav.classList.remove('active');
          nav.setAttribute('aria-hidden', 'true');
          menuToggle.setAttribute('aria-expanded', 'false');
        } catch (error) {
          console.error('關閉菜單失敗:', error);
        }
      }
    });
  }
}

// 極簡滾動效果 - 僅淡入
const observerOptions = {
  threshold: 0.15,  // 提高閾值，減少觸發頻率
  rootMargin: '0px 0px -30px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // 一次性效果，觀察後移除
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// 觀察淡入元素
try {
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(el => {
    observer.observe(el);
  });
} catch (error) {
  console.error('滾動效果初始化失敗:', error);
}

// 點擊外部區域關閉菜單
if (menuToggle && nav) {
  const handleClickOutside = function(event) {
    try {
      const isClickInsideNav = nav.contains(event.target);
      const isClickOnToggle = menuToggle.contains(event.target);
      
      if (!isClickInsideNav && !isClickOnToggle && nav.classList.contains('active')) {
        menuToggle.classList.remove('active');
        nav.classList.remove('active');
        nav.setAttribute('aria-hidden', 'true');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    } catch (error) {
      console.error('點擊外部關閉菜單失敗:', error);
    }
  };

  document.addEventListener('click', handleClickOutside);

  // 防止菜單內部點擊時冒泡
  nav.addEventListener('click', function(event) {
    event.stopPropagation();
  });
}

// 添加鍵盤支援
if (menuToggle) {
  menuToggle.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      menuToggle.click();
    }
  });
}