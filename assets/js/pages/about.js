// About 頁面特有的 JavaScript 功能

// 初始化 GSAP
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}



// 頁面載入時的動畫
document.addEventListener('DOMContentLoaded', function() {
  // 為頁面標題添加淡入動畫
  const pageHeader = document.querySelector('.page-header');
  if (pageHeader) {
    pageHeader.style.opacity = '0';
    pageHeader.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      pageHeader.style.transition = 'all 0.8s ease';
      pageHeader.style.opacity = '1';
      pageHeader.style.transform = 'translateY(0)';
    }, 200);
  }
  
  // 等待庫載入後初始化堆疊卡片，使用更保守的時機
  setTimeout(() => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      // 確保頁面完全載入和渲染完成
      requestAnimationFrame(() => {
        setTimeout(() => {
          initStackingCards();
        }, 200);
      });
    }
  }, 500);
});

// 堆疊卡片效果 - 完全按照 demo 邏輯實現
function initStackingCards() {
  const cards = gsap.utils.toArray(".stack-card");
  
  if (cards.length === 0) return;
  
  // 清除現有的 ScrollTriggers
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars && trigger.vars.id && trigger.vars.id.includes('stack-card')) {
      trigger.kill();
    }
  });
  
  // 等待 DOM 完全穩定
  ScrollTrigger.refresh();
  
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
    // 按照 demo 的縮放公式
    var scale = 1 - (cards.length - index) * 0.025;
    
    // 按照 demo 的動畫設定，但調整 transform-origin
    let scaleDown = gsap.to(card, {
      scale: scale, 
      transformOrigin: "50% -160%",
      ease: "none"
    });

    // 按照 demo 的 ScrollTrigger 設定
    ScrollTrigger.create({
      trigger: card,
      start: "center center",
      end: () => lastCardST.start + stickDistance,
      pin: true,
      pinSpacing: false,
      animation: scaleDown,
      id: `stack-card-${index}`,
      toggleActions: "restart none none reverse"
    });
  });
  
  // 刷新 ScrollTrigger
  ScrollTrigger.refresh();
}

// 視窗大小變化時重新初始化
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, 250);
});

// 基礎交互效果
document.addEventListener('DOMContentLoaded', function() {
  // 內容範疇項目的滑鼠懸停動畫
  const areaItems = document.querySelectorAll('.area-item');
  areaItems.forEach((item) => {
    const icon = item.querySelector('.area-icon');
    
    if (item && icon) {
      item.addEventListener('mouseenter', function() {
        icon.style.transform = 'scale(1.2) rotate(5deg)';
        icon.style.transition = 'transform 0.3s ease';
      });
      
      item.addEventListener('mouseleave', function() {
        icon.style.transform = 'scale(1) rotate(0deg)';
      });
    }
  });
});