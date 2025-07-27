// Videos 頁面特有的 JavaScript 功能

// 等待所有依賴載入完成
window.addEventListener('load', function() {
  // 確保 GSAP 已載入
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    // 延遲初始化避免衝突
    setTimeout(() => {
      // 使用智能粒子背景系統，自動調整 videos 頁面的粒子長度
      initSmartParticleBackground({ 
        coverageMode: 'smart', // 智能模式：根據內容長度自動調整
        debugMode: false       // 生產模式，關閉詳細日誌
      });
    }, 100);
  } else {
    console.error('GSAP 或 ScrollTrigger 未載入');
  }
});

// 初始化粒子背景 - 與 About 頁面相同的邏輯
function initParticleBackground() {
  console.log('🎨 初始化粒子背景 - Videos頁面版本');
  
  try {
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
    
    console.log('✅ 容器已找到:', particlesContainer);
    
    // 清除現有粒子
    particlesContainer.innerHTML = '';
    
    // 強制設定粒子容器的高度限制
    
    // 動態計算粒子數量 - 根據實際內容高度
    const isMobile = window.innerWidth <= 768;
    const viewportHeight = window.innerHeight;
    
    // 計算實際內容區域高度
    const mainContent = document.querySelector('.main-content');
    const pageHeader = document.querySelector('.page-header');
    const footer = document.querySelector('footer');
    
    const mainContentHeight = mainContent ? mainContent.offsetHeight : 0;
    const pageHeaderHeight = pageHeader ? pageHeader.offsetHeight : 0;
    const footerHeight = footer ? footer.offsetHeight : 100;
    
    // 實際需要粒子覆蓋的高度 = header + main content（不包括 footer）
    const contentHeight = pageHeaderHeight + mainContentHeight;
    
    // 強制設定粒子容器的高度，確保不超過內容區域
    particlesContainer.style.height = `${contentHeight}px`;
    particlesContainer.style.maxHeight = `${contentHeight}px`;
    particlesContainer.style.overflow = 'hidden';
    
    // 計算需要多少粒子來填滿內容區域（不包括 footer）
    const particleSpacing = 19; 
    const particlesPerScreen = Math.ceil(viewportHeight / particleSpacing);
    const screensToFill = Math.ceil(contentHeight / viewportHeight);
    
    // 減少密度避免粒子過多
    const densityMultiplier = isMobile ? 2 : 4;
    const baseParticleCount = particlesPerScreen * screensToFill * densityMultiplier;
    
    // 限制範圍避免效能問題
    const minParticles = isMobile ? 1500 : 3000;
    const maxParticles = isMobile ? 6000 : 10000;
    const particleCount = Math.min(maxParticles, Math.max(minParticles, baseParticleCount));
    
    console.log(`📏 Videos頁面尺寸分析:`);
    console.log(`  Header高度: ${pageHeaderHeight}px`);
    console.log(`  主要內容高度: ${mainContentHeight}px`);
    console.log(`  總內容高度: ${contentHeight}px (排除footer: ${footerHeight}px)`);
    console.log(`  視窗高度: ${viewportHeight}px`);
    console.log(`  需要填滿: ${screensToFill} 個螢幕`);
    console.log(`  每屏粒子: ${particlesPerScreen} 個`);
    console.log(`  計算粒子數: ${baseParticleCount} → 實際使用: ${particleCount} 個`);
    
    /*------------------------------
    Making some circles noise (按照demo邏輯)
    ------------------------------*/
    const simplex = new SimplexNoise();
    for (let i = 0; i < particleCount; i++) {
      const div = document.createElement('div');
      div.classList.add('circle');
      
      const n1 = simplex.noise2D(i * 0.003, i * 0.0033);
      const n2 = simplex.noise2D(i * 0.002, i * 0.001);
      
      // 完全按照demo的邏輯：translate + rotate + scale
      // 但需要覆蓋CSS中的position和margin設定
      const style = {
        transform: `translate(${n2 * 200}px) rotate(${n2 * 270}deg) scale(${3 + n1 * 2}, ${3 + n2 * 2})`,
        boxShadow: `0 0 0 .2px rgba(248, 220, 85, 0.7)`, // 使用柔和的亮黃色
        position: 'relative', // 確保定位正確
        margin: '-19px auto', // 保持垂直流動
        width: '20px', // 確保尺寸
        height: '20px',
        borderRadius: '40%',
        opacity: '0' // 初始透明
      };
      
      Object.assign(div.style, style);
      
      // 記錄前3個粒子的demo風格變換
      if (i < 3) {
        console.log(`🎨 粒子 ${i + 1} (Videos風格): translate(${(n2 * 200).toFixed(1)}px) rotate(${(n2 * 270).toFixed(1)}deg) scale(${(3 + n1 * 2).toFixed(2)}, ${(3 + n2 * 2).toFixed(2)})`);
      }
      
      particlesContainer.appendChild(div);
    }
    
    // 獲取粒子元素
    const circles = document.querySelectorAll('#particles-background-layer .circle');
    console.log(`✅ ${circles.length} 個圓圈已創建 (Videos風格)`);
    
    /*------------------------------
    Scroll Trigger (按照demo邏輯)
    ------------------------------*/
    if (typeof gsap !== 'undefined' && circles.length > 0) {
      console.log('🎯 設置Videos風格滾動動畫');
      
      const main = gsap.timeline({
        scrollTrigger: {
          scrub: 0.7, // 完全按照demo
          start: "top 25%", // 完全按照demo
          end: "bottom bottom" // 完全按照demo
        }
      });
      
      // 完全按照demo：每個圓圈都加到timeline
      circles.forEach((circle) => {
        main.to(circle, {
          opacity: 1
        });
      });
      
      console.log('✅ Videos風格粒子滾動動畫已設置');
    }
    
    // 創建全局控制函數
    window.videosParticleControls = {
      showAll: () => {
        const circles = document.querySelectorAll('#particles-background-layer .circle');
        circles.forEach(c => c.style.opacity = '1');
        console.log(`✅ 手動顯示所有 ${circles.length} 個粒子`);
      },
      quickTest: () => {
        console.log('🚀 Videos快速測試：立即顯示前200個粒子');
        const circles = document.querySelectorAll('#particles-background-layer .circle');
        circles.forEach((circle, index) => {
          if (index < 200) {
            circle.style.opacity = '1';
            circle.style.backgroundColor = '#F3D74E';
            circle.style.border = '1px solid #F3D74E';
          }
        });
        console.log(`✅ 已顯示前200個粒子，總共${circles.length}個`);
      },
      forceReset: () => {
        console.log('🔄 強制重新初始化粒子系統');
        initParticleBackground();
      },
      checkDimensions: () => {
        const mainContent = document.querySelector('.main-content');
        const pageHeader = document.querySelector('.page-header');
        const footer = document.querySelector('footer');
        const container = document.querySelector('#particles-background-layer');
        
        console.log('📐 當前頁面尺寸:');
        console.log('  Header:', pageHeader ? pageHeader.offsetHeight : 0, 'px');
        console.log('  Main Content:', mainContent ? mainContent.offsetHeight : 0, 'px');
        console.log('  Footer:', footer ? footer.offsetHeight : 0, 'px');
        console.log('  Body總高度:', document.body.scrollHeight, 'px');
        console.log('  粒子容器高度:', container ? container.offsetHeight : 0, 'px');
        console.log('  視窗高度:', window.innerHeight, 'px');
      }
    };
    
    console.log('✅ Videos風格粒子系統初始化完成');
    console.log('🎮 可用控制: videosParticleControls.showAll(), videosParticleControls.quickTest()');
    
    // 監聽內容變化，重新計算粒子
    const observer = new MutationObserver(() => {
      // 延遲重新計算，避免頻繁更新
      setTimeout(() => {
        const newMainContentHeight = mainContent ? mainContent.offsetHeight : 0;
        const newContentHeight = pageHeaderHeight + newMainContentHeight;
        
        // 如果內容高度變化超過 20%，重新初始化粒子
        const heightDifference = Math.abs(newContentHeight - contentHeight) / contentHeight;
        if (heightDifference > 0.2) {
          console.log(`📐 內容高度變化大 (${contentHeight}px → ${newContentHeight}px)，重新生成粒子`);
          initParticleBackground();
        }
      }, 1000);
    });
    
    // 觀察主要內容的變化
    if (mainContent) {
      observer.observe(mainContent, { childList: true, subtree: true });
    }
    
  } catch (error) {
    console.error('❌ Videos頁面粒子系統初始化失敗:', error);
  }
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
});

// 分類篩選功能
const filterButtons = document.querySelectorAll('.filter-btn');
const videoCards = document.querySelectorAll('.video-card');

filterButtons.forEach(button => {
  button.addEventListener('click', function() {
    const category = this.getAttribute('data-category');
    
    // 更新按鈕狀態
    filterButtons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    
    // 篩選影片
    filterVideos(category);
  });
});

function filterVideos(category) {
  videoCards.forEach((card, index) => {
    const cardCategory = card.getAttribute('data-category');
    
    if (category === 'all' || cardCategory === category) {
      // 顯示符合條件的影片
      card.classList.remove('hidden');
      card.classList.add('show');
      
      // 錯開動畫時間
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    } else {
      // 隱藏不符合條件的影片
      card.classList.add('hidden');
      card.classList.remove('show');
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
    }
  });
}

// 影片卡片的交互效果
videoCards.forEach((card, index) => {
  // 滑鼠懸停時的播放圖標動畫
  const playIcon = card.querySelector('.play-icon');
  
  card.addEventListener('mouseenter', function() {
    if (playIcon) {
      playIcon.style.transform = 'scale(1.1)';
      playIcon.style.background = '#facf20';
    }
    
    // 添加輕微的傾斜效果
    this.style.transform = 'translateY(-8px) rotateX(2deg)';
  });
  
  card.addEventListener('mouseleave', function() {
    if (playIcon) {
      playIcon.style.transform = 'scale(1)';
      playIcon.style.background = 'rgba(250, 207, 32, 0.9)';
    }
    
    this.style.transform = 'translateY(0) rotateX(0deg)';
  });
  
  // 點擊效果
  card.addEventListener('click', function() {
    // 創建漣漪效果
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(250, 207, 32, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;
    
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.marginLeft = ripple.style.marginTop = -size / 2 + 'px';
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
    
    // 這裡可以添加跳轉到實際影片的邏輯
    console.log('點擊了影片:', this.querySelector('h3').textContent);
  });
  
  // 錯開初始動畫時間
  card.style.animationDelay = `${index * 0.1}s`;
});

// 製作理念項目的交互效果
const valueItems = document.querySelectorAll('.value-item');
valueItems.forEach((item, index) => {
  const icon = item.querySelector('.value-icon');
  
  item.addEventListener('mouseenter', function() {
    if (icon) {
      icon.style.transform = 'scale(1.2) rotate(10deg)';
      icon.style.transition = 'transform 0.3s ease';
    }
    
    this.style.background = 'linear-gradient(135deg, #1a1a1abd 0%, #161616bd 100%)';
    this.style.borderColor = 'rgba(250, 207, 32, 0.3)';
  });
  
  item.addEventListener('mouseleave', function() {
    if (icon) {
      icon.style.transform = 'scale(1) rotate(0deg)';
    }
    
    this.style.background = '#161616bd';
    this.style.borderColor = '#7373739a';
  });
  
  // 錯開動畫時間
  item.style.animationDelay = `${index * 0.15}s`;
});

// 訂閱按鈕的特殊效果
const subscribeButton = document.querySelector('.subscribe-button');
if (subscribeButton) {
  subscribeButton.addEventListener('mouseenter', function() {
    this.style.background = '#CC0000';
    this.style.transform = 'translateY(-2px) scale(1.05)';
    
    // 為 YouTube 圖標添加旋轉效果
    const icon = this.querySelector('img');
    if (icon) {
      icon.style.transform = 'rotate(360deg)';
      icon.style.transition = 'transform 0.6s ease';
    }
  });
  
  subscribeButton.addEventListener('mouseleave', function() {
    this.style.background = '#FF0000';
    this.style.transform = 'translateY(0) scale(1)';
    
    const icon = this.querySelector('img');
    if (icon) {
      icon.style.transform = 'rotate(0deg)';
    }
  });
}

// 滾動時的特殊動畫效果
const videosObserverOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const enhancedObserver = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 為影片網格添加特殊動畫
      if (entry.target.classList.contains('videos-grid')) {
        const cards = entry.target.querySelectorAll('.video-card:not(.hidden)');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 100);
        });
      }
      
      // 為製作理念區域添加動畫
      if (entry.target.classList.contains('production-values')) {
        const items = entry.target.querySelectorAll('.value-item');
        items.forEach((item, index) => {
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
          }, index * 120);
        });
      }
    }
  });
}, videosObserverOptions);

// 觀察需要特殊動畫的元素
document.querySelectorAll('.videos-grid, .production-values').forEach(el => {
  enhancedObserver.observe(el);
  
  // 初始化動畫狀態
  if (el.classList.contains('videos-grid')) {
    el.querySelectorAll('.video-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'all 0.6s ease';
    });
  }
  
  if (el.classList.contains('production-values')) {
    el.querySelectorAll('.value-item').forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px) scale(0.95)';
      item.style.transition = 'all 0.6s ease';
    });
  }
});

// 添加 CSS 動畫
const videosStyleSheet = document.createElement('style');
videosStyleSheet.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .video-card {
    transform-style: preserve-3d;
  }
  
  .filter-btn {
    position: relative;
    overflow: hidden;
  }
  
  .filter-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(250, 207, 32, 0.3), transparent);
    transition: left 0.5s;
  }
  
  .filter-btn:hover::before {
    left: 100%;
  }
`;
document.head.appendChild(videosStyleSheet);

// 分類標籤的彩色效果
const categoryTags = document.querySelectorAll('.category-tag');
categoryTags.forEach(tag => {
  tag.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.1)';
    this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
  });
  
  tag.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
    this.style.boxShadow = 'none';
  });
});