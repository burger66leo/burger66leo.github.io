/**
 * 智能粒子背景系統
 * 根據頁面內容自動調整粒子數量和高度
 */

function initSmartParticleBackground(options = {}) {
  const debugMode = options.debugMode !== false; // 預設開啟除錯模式
  
  if (debugMode) {
    console.log('🎨 初始化智能粒子背景系統');
  }
  
  try {
    // 檢查依賴
    if (typeof gsap === 'undefined') {
      console.error('❌ GSAP 未載入');
      return;
    }
    
    if (typeof SimplexNoise === 'undefined') {
      console.error('❌ SimplexNoise 未載入');
      return;
    }
    
    // 獲取粒子背景層容器
    const particlesContainer = document.querySelector('#particles-background-layer');
    if (!particlesContainer) {
      console.error('❌ particles-background-layer 容器未找到');
      return;
    }
    
    // 清除現有粒子
    particlesContainer.innerHTML = '';
    
    // 計算智能佈局
    const layout = calculateSmartLayout(options);
    
    // 設定容器高度
    particlesContainer.style.height = `${layout.containerHeight}px`;
    particlesContainer.style.maxHeight = `${layout.containerHeight}px`;
    particlesContainer.style.overflow = 'hidden';
    
    // 生成粒子
    generateParticles(particlesContainer, layout);
    
    // 設定動畫
    setupParticleAnimations(particlesContainer, layout);
    
    // 創建控制函數
    createParticleControls(layout);
    
    if (debugMode) {
      console.log('✅ 智能粒子系統初始化完成');
    }
    
  } catch (error) {
    console.error('❌ 智能粒子系統初始化失敗:', error);
    
    // 即使失敗也創建基本控制函數
    if (!window.smartParticleControls) {
      window.smartParticleControls = {
        showAll: () => console.log('❌ 粒子系統未初始化'),
        recalculate: () => {
          console.log('🔄 重新嘗試初始化');
          initSmartParticleBackground();
        },
        diagnose: () => console.log('❌ 粒子系統未初始化'),
        testPageComparison: () => console.log('❌ 粒子系統未初始化')
      };
    }
  }
}

function calculateSmartLayout(options = {}) {
  const debugMode = options.debugMode !== false;
  const isMobile = window.innerWidth <= 768;
  const viewportHeight = window.innerHeight;
  
  // 獲取頁面元素
  const mainContent = document.querySelector('.main-content');
  const pageHeader = document.querySelector('.page-header');
  const footer = document.querySelector('footer');
  
  // 計算實際高度
  const mainContentHeight = mainContent ? mainContent.offsetHeight : 0;
  const pageHeaderHeight = pageHeader ? pageHeader.offsetHeight : 0;
  const footerHeight = footer ? footer.offsetHeight : 100;
  
  // 頁面總高度
  const totalPageHeight = document.body.scrollHeight;
  
  // 智能判斷粒子覆蓋範圍
  let containerHeight;
  if (options.coverageMode === 'content-only') {
    // 只覆蓋內容區域（不包括 footer）
    containerHeight = pageHeaderHeight + mainContentHeight;
  } else if (options.coverageMode === 'full-page') {
    // 覆蓋整個頁面
    containerHeight = totalPageHeight;
  } else if (options.coverageMode === 'to-footer') {
    // 覆蓋到 footer 前（包含所有間距）
    const footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : totalPageHeight;
    containerHeight = footerTop;
    if (debugMode) {
      console.log(`🎯 覆蓋到 Footer 模式: Footer位置 ${footerTop}px`);
    }
  } else {
    // 智能模式：根據內容長度決定，並加上額外緩衝
    const contentScreens = (pageHeaderHeight + mainContentHeight) / viewportHeight;
    
    // 計算到 footer 前的實際距離
    const footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : totalPageHeight;
    const contentEnd = pageHeaderHeight + mainContentHeight;
    const gapToFooter = Math.max(0, footerTop - contentEnd);
    
    if (debugMode) {
      console.log(`📏 間距分析: 內容結束 ${contentEnd}px, Footer開始 ${footerTop}px, 間距 ${gapToFooter}px`);
    }
    
    // 覆蓋到 footer 前（包含間距）
    containerHeight = contentEnd + gapToFooter;
  }
  
  // 正確的粒子流動邏輯！
  // 粒子是垂直向下流動的，每個粒子間距是 19px (margin: -19px auto)
  const particleVerticalSpacing = 19; // 這是CSS中定義的粒子垂直間距
  
  // 計算需要多少粒子來填滿容器高度
  const baseParticleCount = Math.ceil(containerHeight / particleVerticalSpacing);
  
  if (debugMode) {
    console.log(`🧮 一比一粒子計算:`);
    console.log(`  滑動距離: ${scrollDistance}px`);
    console.log(`  每個粒子覆蓋: ${pixelsPerParticle}px`);
    console.log(`  基礎粒子數: ${baseParticleCount}`);
    console.log(`  密度比例: 1 粒子 / ${pixelsPerParticle}px`);
  }
  
  // 只設定最大限制，移除最小限制讓粒子數量真正與頁面高度成正比
  const maxParticles = isMobile ? 15000 : 25000;
  
  // 特殊模式調整
  let finalParticleCount = baseParticleCount;
  
  if (options.increaseTotal) {
    finalParticleCount = Math.floor(baseParticleCount * 1.5); // 增加50%
    if (debugMode) {
      console.log('🔢 增加總數模式：+50%');
    }
  }
  
  // 只應用最大限制，確保效能
  const particleCount = Math.min(maxParticles, finalParticleCount);
  
  if (debugMode) {
    console.log(`  最終粒子數: ${particleCount} (最大限制: ${maxParticles})`);
  }
  
  const layout = {
    containerHeight,
    particleCount,
    pixelsPerParticle,
    isMobile,
    viewportHeight,
    pageHeaderHeight,
    mainContentHeight,
    totalPageHeight,
    scrollDistance
  };
  
  if (debugMode) {
    console.log(`📏 一比一佈局分析:`);
    console.log(`  Header高度: ${pageHeaderHeight}px`);
    console.log(`  主要內容高度: ${mainContentHeight}px`);
    console.log(`  頁面總高度: ${totalPageHeight}px`);
    console.log(`  粒子容器高度: ${containerHeight}px`);
    console.log(`  計算粒子數: ${baseParticleCount} → 實際使用: ${particleCount} 個`);
    console.log(`  粒子密度: 1粒子/${pixelsPerParticle}px`);
  }
  
  return layout;
}

function generateParticles(container, layout) {
  const simplex = new SimplexNoise();
  
  for (let i = 0; i < layout.particleCount; i++) {
    const div = document.createElement('div');
    div.classList.add('circle');
    
    const n1 = simplex.noise2D(i * 0.003, i * 0.0033);
    const n2 = simplex.noise2D(i * 0.002, i * 0.001);
    
    const style = {
      transform: `translate(${n2 * 200}px) rotate(${n2 * 270}deg) scale(${3 + n1 * 2}, ${3 + n2 * 2})`,
      boxShadow: `0 0 0 .2px rgba(248, 220, 85, 0.7)`,
      position: 'relative',
      margin: '-19px auto',
      width: '20px',
      height: '20px',
      borderRadius: '40%',
      opacity: '0'
    };
    
    Object.assign(div.style, style);
    container.appendChild(div);
  }
}

function setupParticleAnimations(container, layout) {
  const circles = container.querySelectorAll('.circle');
  
  if (typeof gsap !== 'undefined' && circles.length > 0) {
    console.log('🎯 設置智能粒子動畫');
    
    const main = gsap.timeline({
      scrollTrigger: {
        scrub: 0.7,
        start: "top 25%",
        end: "bottom bottom"
      }
    });
    
    circles.forEach((circle) => {
      main.to(circle, {
        opacity: 1
      });
    });
    
    console.log('✅ 智能粒子動畫已設置');
  }
}

function createParticleControls(layout) {
  // 儲存當前佈局資訊供全域使用
  window.smartParticleCurrentLayout = layout;
  
  window.smartParticleControls = {
    showAll: () => {
      const circles = document.querySelectorAll('#particles-background-layer .circle');
      circles.forEach(c => c.style.opacity = '1');
      console.log(`✅ 顯示所有 ${circles.length} 個粒子`);
    },
    
    recalculate: () => {
      console.log('🔄 重新計算粒子佈局');
      initSmartParticleBackground();
    },
    
    forceHighDensity: () => {
      console.log('🚀 強制高密度模式重新生成粒子');
      initSmartParticleBackground({
        coverageMode: 'smart',
        forceHighDensity: true,
        debugMode: true
      });
    },
    
    extremeMode: () => {
      console.log('💥 極限模式 - 最大粒子數量');
      initSmartParticleBackground({
        coverageMode: 'smart',
        extremeMode: true,
        debugMode: true
      });
    },
    
    moreParticles: () => {
      console.log('🔢 增加粒子總數');
      initSmartParticleBackground({
        coverageMode: 'smart',
        increaseTotal: true,
        debugMode: true
      });
    },
    
    coverToFooter: () => {
      console.log('🎯 強制覆蓋到 Footer 前');
      initSmartParticleBackground({
        coverageMode: 'to-footer',
        debugMode: true
      });
    },
    
    
    analyzeSpacing: () => {
      console.log('📐 分析粒子間距和分布');
      const circles = document.querySelectorAll('#particles-background-layer .circle');
      const container = document.querySelector('#particles-background-layer');
      
      if (circles.length === 0) {
        console.log('❌ 沒有找到粒子');
        return;
      }
      
      // 分析前10個粒子的位置
      const positions = [];
      circles.forEach((circle, index) => {
        if (index < 10) {
          const rect = circle.getBoundingClientRect();
          const scrollY = window.scrollY;
          const absoluteY = rect.top + scrollY;
          positions.push(absoluteY);
          console.log(`粒子 ${index + 1}: 位置 ${absoluteY.toFixed(1)}px`);
        }
      });
      
      // 計算實際間距
      if (positions.length >= 2) {
        const avgSpacing = (positions[positions.length - 1] - positions[0]) / (positions.length - 1);
        console.log(`📏 前10個粒子平均間距: ${avgSpacing.toFixed(1)}px`);
        console.log(`📏 理論間距: 19px`);
        console.log(`📏 間距差異: ${(avgSpacing - 19).toFixed(1)}px`);
      }
      
      // 分析容器高度與粒子分布
      const containerHeight = container?.offsetHeight || 0;
      const expectedSpacing = containerHeight / circles.length;
      console.log(`📊 容器高度: ${containerHeight}px`);
      console.log(`📊 粒子總數: ${circles.length}`);
      console.log(`📊 期望間距: ${expectedSpacing.toFixed(1)}px`);
    },
    
    checkCoverage: () => {
      console.log('📐 檢查粒子覆蓋範圍');
      
      // 獲取所有重要元素
      const pageHeader = document.querySelector('.page-header');
      const mainContent = document.querySelector('.main-content');
      const footer = document.querySelector('footer');
      const particlesContainer = document.querySelector('#particles-background-layer');
      
      // 獲取特定區塊
      const disclosureSection = document.querySelector('.section:has(h2:contains("Disclosure"))') || 
                               Array.from(document.querySelectorAll('.section')).find(s => s.textContent.includes('Disclosure'));
      const contactSection = document.querySelector('.contact-engagement');
      
      console.log('📊 頁面元素高度分析:');
      console.log('  Page Header:', pageHeader?.offsetHeight || 0, 'px');
      console.log('  Main Content:', mainContent?.offsetHeight || 0, 'px');
      console.log('  Footer:', footer?.offsetHeight || 0, 'px');
      console.log('  粒子容器:', particlesContainer?.offsetHeight || 0, 'px');
      console.log('  頁面總高:', document.body.scrollHeight, 'px');
      
      if (disclosureSection) {
        const disclosureRect = disclosureSection.getBoundingClientRect();
        const disclosureTop = disclosureRect.top + window.scrollY;
        console.log('  Disclosure 區塊位置:', disclosureTop, 'px');
        console.log('  Disclosure 區塊高度:', disclosureSection.offsetHeight, 'px');
      }
      
      if (contactSection) {
        const contactRect = contactSection.getBoundingClientRect();
        const contactTop = contactRect.top + window.scrollY;
        console.log('  保持對話區塊位置:', contactTop, 'px');
        console.log('  保持對話區塊高度:', contactSection.offsetHeight, 'px');
      }
      
      // 檢查粒子是否覆蓋到這些區域
      const containerHeight = particlesContainer?.offsetHeight || 0;
      const footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : 0;
      const mainContentEnd = (pageHeader?.offsetHeight || 0) + (mainContent?.offsetHeight || 0);
      const gapToFooter = footerTop - mainContentEnd;
      
      console.log('🎯 覆蓋檢查:');
      console.log('  Main Content 結束位置:', mainContentEnd, 'px');
      console.log('  Footer 開始位置:', footerTop, 'px');
      console.log('  中間間距:', gapToFooter, 'px');
      console.log('  粒子容器高度:', containerHeight, 'px');
      console.log('  粒子是否覆蓋到 Footer 前:', containerHeight >= footerTop ? '✅' : '❌');
      console.log('  未覆蓋區域:', Math.max(0, footerTop - containerHeight), 'px');
    },
    
    diagnose: () => {
      console.log('🔍 智能粒子診斷:');
      console.log('  佈局信息:', layout);
      console.log('  粒子數量:', document.querySelectorAll('#particles-background-layer .circle').length);
      console.log('  容器高度:', document.querySelector('#particles-background-layer')?.offsetHeight);
    },
    
    testPageComparison: () => {
      console.log('📊 智能粒子密度分析:');
      const currentPage = window.location.pathname;
      const particleCount = document.querySelectorAll('#particles-background-layer .circle').length;
      const containerHeight = document.querySelector('#particles-background-layer')?.offsetHeight || 0;
      const pageHeight = document.body.scrollHeight;
      
      // 計算粒子密度（每像素多少粒子）
      const particleDensity = containerHeight > 0 ? (particleCount / containerHeight).toFixed(4) : 0;
      const scrollDensity = containerHeight > 0 ? (particleCount / containerHeight * 19).toFixed(2) : 0;
      
      console.log(`  當前頁面: ${currentPage}`);
      console.log(`  粒子數量: ${particleCount}`);
      console.log(`  容器高度: ${containerHeight}px`);
      console.log(`  頁面總高: ${pageHeight}px`);
      console.log(`  粒子密度: ${particleDensity} 粒子/px`);
      console.log(`  滑動密度: ${scrollDensity} 粒子/滑動單位`);
      console.log(`  覆蓋率: ${((containerHeight / pageHeight) * 100).toFixed(1)}%`);
      
      // 滑動體驗分析
      console.log('🎯 滑動體驗預測:');
      if (particleDensity >= 0.25 && particleDensity <= 0.35) {
        console.log('  ✅ 理想密度：滑動進度與粒子顯示應該很一致');
      } else if (particleDensity < 0.25) {
        console.log('  ⚠️ 密度較低：滑動時粒子出現可能較快');
      } else {
        console.log('  ⚠️ 密度較高：滑動時粒子出現可能較慢');
      }
      
      // 提供頁面對比建議
      if (currentPage.includes('about')) {
        console.log('  頁面類型: About - 應與其他頁面保持相同密度');
      } else if (currentPage.includes('videos')) {
        console.log('  頁面類型: Videos - 應與其他頁面保持相同密度');
      }
    }
  };
}

// 響應式重新計算
let smartParticleResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(smartParticleResizeTimer);
  smartParticleResizeTimer = setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
    
    // 如果視窗大小變化超過20%，重新計算
    const newHeight = window.innerHeight;
    const currentLayout = window.smartParticleCurrentLayout;
    if (currentLayout && Math.abs(newHeight - currentLayout.viewportHeight) / currentLayout.viewportHeight > 0.2) {
      console.log('📐 視窗大小變化大，重新計算粒子');
      setTimeout(() => {
        initSmartParticleBackground();
      }, 500);
    }
  }, 250);
});

// 導出函數
window.initSmartParticleBackground = initSmartParticleBackground;