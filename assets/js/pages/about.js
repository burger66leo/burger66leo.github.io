// About 頁面特有的 JavaScript 功能

// 簡化的 Navbar 功能
function initAboutNavbar() {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }

  // 滾動時改變 navbar 樣式
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });
  
  console.log('✅ About Navbar 初始化完成');
}

// 等待所有依賴載入完成
window.addEventListener('load', function() {
  // 初始化 navbar
  initAboutNavbar();
  
  // 確保 GSAP 已載入
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    // 延遲初始化避免衝突
    setTimeout(() => {
      // 使用智能粒子背景系統，自動調整 about 頁面的粒子長度
      if (typeof initSmartParticleBackground === 'function') {
        initSmartParticleBackground({ 
          coverageMode: 'smart', // 智能模式：根據內容長度自動調整
          debugMode: true        // 開啟除錯模式以診斷問題
        });
      } else {
        console.error('❌ initSmartParticleBackground 函數未載入');
      }
      initStackingCards();
      initContentGallery();
      initDisclosureToggle();
      // initMouseFollow3D(); // 取消 3D 效果
      initMagneticCards();
    }, 100);
  } else {
    console.error('GSAP 或 ScrollTrigger 未載入');
  }
});

// 舊的粒子背景函數已移除，現在使用智能粒子背景系統

// 堆疊卡片效果
function initStackingCards() {
  const cards = gsap.utils.toArray(".stack-card");
  
  if (cards.length === 0) return;
  
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
      toggleActions: "restart none none reverse"
    });
  });
  
  console.log('✅ 堆疊卡片動畫初始化完成');
}

// 內容畫廊動畫系統
function initContentGallery() {
  console.log('🎬 初始化內容畫廊動畫');
  
  const cards = gsap.utils.toArray('.content-card');
  
  if (cards.length === 0) {
    console.log('❌ 找不到卡片');
    return;
  }
  
  console.log(`✅ 找到 ${cards.length} 個卡片`);
  
  let currentIndex = 0;
  
  // 更新所有卡片的位置和縮放
  function updateCardsLayout() {
    cards.forEach((card, index) => {
      const offset = index - currentIndex;
      const distance = Math.abs(offset);
      const xPercent = offset * 80;
      const scale = Math.max(0.4, 1 - distance * 0.15);
      const opacity = distance <= 2 ? (distance <= 1 ? 1 : 0.6) : 0;
      const zIndex = 100 - distance;
      
      gsap.set(card, { xPercent, scale, opacity, zIndex });
    });
  }
  
  function showCard(index, isFromScroll = false) {
    const targetIndex = ((index % cards.length) + cards.length) % cards.length;
    if (targetIndex === currentIndex) return;
    
    currentIndex = targetIndex;
    
    cards.forEach((card, cardIndex) => {
      const offset = cardIndex - currentIndex;
      const distance = Math.abs(offset);
      const xPercent = offset * 80;
      const scale = Math.max(0.4, 1 - distance * 0.15);
      const opacity = distance <= 2 ? (distance <= 1 ? 1 : 0.6) : 0;
      const zIndex = 100 - distance;
      
      gsap.to(card, {
        xPercent, scale, opacity, zIndex,
        duration: isFromScroll ? 0.3 : 0.6,
        ease: "power2.out"
      });
    });
  }
  
  // 初始化佈局
  updateCardsLayout();
  
  // 按鈕控制
  document.querySelector(".content-next")?.addEventListener("click", () => {
    showCard(currentIndex + 1);
  });
  
  document.querySelector(".content-prev")?.addEventListener("click", () => {
    showCard(currentIndex - 1);
  });
  
  console.log('✅ 內容畫廊初始化完成');
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

// 滑鼠跟隨3D效果
function initMouseFollow3D() {
  console.log('🎯 初始化滑鼠跟隨3D效果');
  
  const creatorCard = document.querySelector('.creator-card');
  if (!creatorCard) {
    console.log('❌ 找不到 creator-card 元素');
    return;
  }
  
  let isHovering = false;
  
  // 滑鼠進入卡片區域
  creatorCard.addEventListener('mouseenter', () => {
    isHovering = true;
    console.log('🖱️ 滑鼠進入3D跟隨區域');
  });
  
  // 滑鼠離開卡片區域
  creatorCard.addEventListener('mouseleave', () => {
    isHovering = false;
    console.log('🖱️ 滑鼠離開3D跟隨區域');
    
    // 恢復到初始狀態
    gsap.to(creatorCard, {
      duration: 0.6,
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      ease: "power2.out"
    });
  });
  
  // 滑鼠移動跟隨效果 - 優化為真正的實時跟隨
  let animationId = null;
  
  creatorCard.addEventListener('mousemove', (e) => {
    if (!isHovering) return;
    
    // 取消之前的動畫幀，確保最新的位置被使用
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    // 在下一個動畫幀中執行更新，確保流暢性
    animationId = requestAnimationFrame(() => {
      // 獲取卡片的位置和尺寸
      const rect = creatorCard.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // 計算滑鼠相對於卡片中心的位置 (-1 到 1)
      let mouseX = (e.clientX - centerX) / (rect.width / 2);
      let mouseY = (e.clientY - centerY) / (rect.height / 2);
      
      // 限制範圍到 -0.7 到 0.7，減少邊緣效果
      mouseX = Math.max(-0.7, Math.min(0.7, mouseX));
      mouseY = Math.max(-0.7, Math.min(0.7, mouseY));
      
      // 添加緩動函數讓邊緣效果更自然
      const easeValue = (val) => {
        return val * (2 - Math.abs(val)); // 二次緩動，邊緣效果遞減
      };
      
      mouseX = easeValue(mouseX);
      mouseY = easeValue(mouseY);
      
      // 減小最大旋轉角度和位移
      const maxRotation = 10; // 最大旋轉角度 10 度
      const maxTranslate = 5; // 最大位移 5px
      const rotateY = mouseX * maxRotation;
      const rotateX = -mouseY * maxRotation; // 反向，讓效果更自然
      const translateX = mouseX * maxTranslate;
      const translateY = mouseY * maxTranslate;
      
      // 直接設置 CSS transform，最快的更新方式
      creatorCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) translateY(${translateY}px)`;
    });
  });
  
  console.log('✅ 滑鼠跟隨3D效果初始化完成');
}

// 磁力卡片效果 - 複用首頁邏輯
function initMagneticCards() {
  console.log('🧲 初始化磁力卡片效果');
  
  const magneticCards = document.querySelectorAll('.card-item--magnetic');
  console.log('🔍 找到磁性卡片:', magneticCards.length);
  
  if (magneticCards.length === 0) {
    console.log('❌ 未找到磁性卡片元素');
    return;
  }

  if (typeof gsap === 'undefined') {
    console.log('❌ GSAP 未載入，無法應用磁性效果');
    return;
  }

  console.log('✅ 開始設置磁性卡片效果');
  
  magneticCards.forEach((card, index) => {
    // 防止重複綁定
    if (card.dataset.magneticBound) {
      return;
    }
    card.dataset.magneticBound = 'true';
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // 使用與首頁相同的磁性效果參數
      gsap.to(card, {
        x: x * 0.12,  // 優化的磁性強度
        y: y * 0.12,
        duration: 0.4,  // 平滑的動畫時間
        ease: "power2.out",
        force3D: true  // 強制GPU加速
      });
    });
    
    // 添加hover時的scale效果
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    // mouseleave時恢復原狀
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { 
        x: 0, 
        y: 0, 
        scale: 1,
        duration: 0.6,  // 自然的回彈時間
        ease: "elastic.out(1, 0.4)",  // 彈性回彈效果
        force3D: true
      });
    });
  });
  
  console.log(`✅ 磁性效果已應用於 ${magneticCards.length} 個卡片`);
}

// 視窗大小變化時重新初始化
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
    
    // 智能粒子系統已有自己的響應式處理
    // 這裡只需要處理其他組件的響應式更新
  }, 250);
});