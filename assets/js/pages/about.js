// About 頁面特有的 JavaScript 功能

// 等待所有依賴載入完成
window.addEventListener('load', function() {
  // 確保 GSAP 已載入
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    // 延遲初始化避免衝突
    setTimeout(() => {
      initStackingCards();
      initContentGallery();
      initDisclosureToggle();
    }, 100);
  } else {
    console.error('GSAP 或 ScrollTrigger 未載入');
  }
});

// 堆疊卡片效果 - 完全按照 demo 邏輯實現
function initStackingCards() {
  const cards = gsap.utils.toArray(".stack-card");
  
  if (cards.length === 0) return;
  
  // 清除所有現有的 ScrollTriggers 避免衝突
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars && trigger.vars.trigger && 
        (trigger.vars.trigger.classList?.contains('stack-card') || 
         trigger.vars.id?.includes('stack-card'))) {
      trigger.kill();
    }
  });
  
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
      id: `stack-card-${index}`,
      toggleActions: "restart none none reverse"
    });
  });
  
  console.log('✅ 堆疊卡片動畫初始化完成');
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

// 內容畫廊動畫系統 - 重新開始，最簡化版本
function initContentGallery() {
  console.log('🎬 重新開始：最簡化內容畫廊動畫');
  
  // 先測試最基本的情況：只顯示第一張卡片在中心
  const cards = gsap.utils.toArray('.content-card');
  
  if (cards.length === 0) {
    console.log('❌ 找不到卡片');
    return;
  }
  
  console.log(`✅ 找到 ${cards.length} 個卡片`);
  
  // 只清除內容畫廊相關的 ScrollTriggers，不影響堆疊卡片
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars && trigger.vars.trigger && 
        trigger.vars.trigger.classList?.contains('content-gallery')) {
      trigger.kill();
    }
  });
  
  // 測試按鈕控制
  let currentIndex = 0;
  
  // 初始化一排卡片的位置和縮放
  updateCardsLayout();
  
  console.log('🎯 一排卡片佈局：中心最大，兩邊漸小');
  
  // 更新所有卡片的位置和縮放
  function updateCardsLayout() {
    cards.forEach((card, index) => {
      const offset = index - currentIndex; // 相對於當前卡片的偏移
      const distance = Math.abs(offset); // 距離中心的絕對距離
      
      // 計算位置 (每張卡片間距 80%)
      const xPercent = offset * 80;
      
      // 計算縮放 (中心 = 1, 每遠離一張卡片縮小 0.15)
      const scale = Math.max(0.4, 1 - distance * 0.15);
      
      // 計算透明度 (最遠顯示3張卡片)
      const opacity = distance <= 2 ? (distance <= 1 ? 1 : 0.6) : 0;
      
      // 計算 z-index (中心最高)
      const zIndex = 100 - distance;
      
      gsap.set(card, {
        xPercent: xPercent,
        scale: scale,
        opacity: opacity,
        zIndex: zIndex
      });
      
      console.log(`卡片 ${index + 1}: offset=${offset}, xPercent=${xPercent}, scale=${scale.toFixed(2)}, opacity=${opacity}`);
    });
  }
  
  function showCard(index, isFromScroll = false) {
    const targetIndex = ((index % cards.length) + cards.length) % cards.length;
    
    // 避免切換到同一張卡片
    if (targetIndex === currentIndex) return;
    
    // 更新當前索引
    currentIndex = targetIndex;
    
    // 重新計算所有卡片的位置和縮放
    cards.forEach((card, cardIndex) => {
      const offset = cardIndex - currentIndex;
      const distance = Math.abs(offset);
      
      const xPercent = offset * 80;
      const scale = Math.max(0.4, 1 - distance * 0.15);
      const opacity = distance <= 2 ? (distance <= 1 ? 1 : 0.6) : 0;
      const zIndex = 100 - distance;
      
      gsap.to(card, {
        xPercent: xPercent,
        scale: scale,
        opacity: opacity,
        zIndex: zIndex,
        duration: isFromScroll ? 0.3 : 0.6,
        ease: "power2.out"
      });
    });
    
    console.log(`🎯 切換到卡片 ${currentIndex + 1} ${isFromScroll ? '[滾動]' : '[按鈕]'}`);
  }
  
  // 按鈕控制
  document.querySelector(".content-next")?.addEventListener("click", () => {
    showCard(currentIndex + 1);
  });
  
  document.querySelector(".content-prev")?.addEventListener("click", () => {
    showCard(currentIndex - 1);
  });
  
  // 添加滾動控制
  ScrollTrigger.create({
    trigger: ".content-gallery",
    start: "top center",
    end: "bottom center",
    scrub: 0.1, // 調整滾動敏感度
    onUpdate(self) {
      const progress = self.progress;
      const targetIndex = Math.round(progress * (cards.length - 1));
      
      // 只有當目標索引改變時才切換
      if (targetIndex !== currentIndex) {
        console.log(`📜 滾動觸發切換到卡片 ${targetIndex + 1} (進度: ${progress.toFixed(3)})`);
        showCard(targetIndex, true); // 標記為滾動觸發
      }
    }
  });
  
  console.log('✅ 橫向滑動系統初始化完成 - 支援按鈕和滾動控制');
}

// Disclosure toggle 功能
function initDisclosureToggle() {
  console.log('🎛️ 初始化 Disclosure Toggle 功能');
  
  const toggleHeaders = document.querySelectorAll('.disclosure-toggle-header');
  
  if (toggleHeaders.length === 0) {
    console.log('❌ 找不到 toggle headers');
    return;
  }
  
  toggleHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const targetId = this.getAttribute('data-toggle');
      const content = document.getElementById(targetId);
      const isActive = this.classList.contains('active');
      
      // 關閉所有其他的 toggle
      toggleHeaders.forEach(otherHeader => {
        if (otherHeader !== this) {
          otherHeader.classList.remove('active');
          const otherTargetId = otherHeader.getAttribute('data-toggle');
          const otherContent = document.getElementById(otherTargetId);
          if (otherContent) {
            otherContent.classList.remove('active');
          }
        }
      });
      
      // 切換當前 toggle
      if (isActive) {
        this.classList.remove('active');
        content.classList.remove('active');
      } else {
        this.classList.add('active');
        content.classList.add('active');
      }
      
      console.log(`🎛️ Toggle ${targetId}: ${isActive ? '關閉' : '開啟'}`);
    });
  });
  
  console.log(`✅ Disclosure Toggle 初始化完成 (${toggleHeaders.length} 個項目)`);
}

