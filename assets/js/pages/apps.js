/* ===========================================
   Apps 頁面 - 全屏滾動設計
   =========================================== */

console.log('🚀 Apps 頁面全屏滾動系統載入');

// 初始化滾動動畫
function initScrollAnimations() {
  console.log('🎬 初始化滾動動畫');

  // 使用 Intersection Observer 處理滾動動畫
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // 如果有 GSAP，使用更豐富的動畫
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(entry.target, 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
          );
        }
      }
    });
  }, observerOptions);

  // 觀察所有應用區域
  const appSections = document.querySelectorAll('.app-section');
  appSections.forEach(section => {
    observer.observe(section);
  });

  console.log(`✅ 已設置 ${appSections.length} 個區域的滾動動畫`);
}

// 初始化應用詳情動畫
function initAppDetailAnimations() {
  console.log('🎨 初始化應用詳情動畫');

  // 為應用圖標添加微動畫
  const appIcons = document.querySelectorAll('.app-icon-large');
  appIcons.forEach(icon => {
    icon.addEventListener('mouseenter', function() {
      if (typeof gsap !== 'undefined') {
        gsap.to(this, {
          scale: 1.1,
          rotation: 5,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      } else {
        this.style.transform = 'scale(1.1) rotate(5deg)';
        this.style.transition = 'transform 0.3s ease';
      }
    });
    
    icon.addEventListener('mouseleave', function() {
      if (typeof gsap !== 'undefined') {
        gsap.to(this, {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      } else {
        this.style.transform = 'scale(1) rotate(0deg)';
      }
    });
  });

  // 功能項目 hover 效果
  const featureItems = document.querySelectorAll('.feature-item, .philosophy-item');
  featureItems.forEach((item, index) => {
    item.addEventListener('mouseenter', function() {
      if (typeof gsap !== 'undefined') {
        gsap.to(this, {
          y: -8,
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
    
    item.addEventListener('mouseleave', function() {
      if (typeof gsap !== 'undefined') {
        gsap.to(this, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
  });

  // CTA 按鈕的漣漪效果
  const ctaButtons = document.querySelectorAll('.cta-button');
  ctaButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      // 創建漣漪效果
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `;
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  console.log('✅ 應用詳情動畫已初始化');
}

// 初始化返回連結動畫
function initBackLinkAnimation() {
  const backLink = document.querySelector('.back-link');
  if (backLink) {
    // 進入動畫
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(backLink,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power2.out", delay: 0.2 }
      );
    }

    // hover 效果增強
    backLink.addEventListener('mouseenter', function() {
      if (typeof gsap !== 'undefined') {
        gsap.to(this, {
          scale: 1.05,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      }
    });
    
    backLink.addEventListener('mouseleave', function() {
      if (typeof gsap !== 'undefined') {
        gsap.to(this, {
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      }
    });

    console.log('✅ 返回連結動畫已初始化');
  }
}

// 平滑滾動功能
function initSmoothScrolling() {
  // 為頁面內錨點添加平滑滾動
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        
        if (typeof gsap !== 'undefined') {
          gsap.to(window, {
            scrollTo: {
              y: target,
              offsetY: 20
            },
            duration: 1,
            ease: "power2.inOut"
          });
        } else {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  console.log('✅ 平滑滾動已初始化');
}

// 主要初始化函數
function initAppsPage() {
  console.log('📱 初始化 Apps 頁面功能');
  
  // 初始化返回連結動畫
  initBackLinkAnimation();
  
  // 初始化滾動動畫
  initScrollAnimations();
  
  // 初始化應用詳情動畫
  initAppDetailAnimations();
  
  // 初始化平滑滾動
  initSmoothScrolling();
  
  console.log('✅ Apps 頁面初始化完成');
}

// 添加必要的 CSS 動畫
const dynamicStyle = document.createElement('style');
dynamicStyle.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* 平滑滾動 */
  html {
    scroll-behavior: smooth;
  }
`;
document.head.appendChild(dynamicStyle);

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', initAppsPage);

// 備用初始化（如果 DOMContentLoaded 已經觸發）
if (document.readyState === 'loading') {
  // DOM 還在載入中，等待 DOMContentLoaded
} else {
  // DOM 已經載入完成
  setTimeout(initAppsPage, 100);
}

// 視窗大小改變時重新整理動畫
window.addEventListener('resize', () => {
  console.log('🔄 視窗大小已改變');
  // 可以在這裡添加響應式邏輯
});

console.log('✅ Apps 頁面腳本載入完成');