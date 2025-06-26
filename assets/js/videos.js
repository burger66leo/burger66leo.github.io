// Videos 頁面特有的 JavaScript 功能

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
const observerOptions = {
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
}, observerOptions);

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
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);

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