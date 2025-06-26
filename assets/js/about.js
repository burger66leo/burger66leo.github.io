// About 頁面特有的 JavaScript 功能

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

// 理念卡片的交互效果
const philosophyCards = document.querySelectorAll('.philosophy-card');
philosophyCards.forEach((card, index) => {
  // 滑鼠懸停時的額外效果
  card.addEventListener('mouseenter', function() {
    this.style.background = 'linear-gradient(135deg, #1a1a1abd 0%, #161616bd 100%)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.background = '#161616bd';
  });
  
  // 錯開動畫時間
  card.style.animationDelay = `${index * 0.1}s`;
});

// 內容範疇項目的交互效果
const areaItems = document.querySelectorAll('.area-item');
areaItems.forEach((item, index) => {
  // 滑鼠懸停時圖標動畫
  const icon = item.querySelector('.area-icon');
  
  item.addEventListener('mouseenter', function() {
    if (icon) {
      icon.style.transform = 'scale(1.2) rotate(5deg)';
      icon.style.transition = 'transform 0.3s ease';
    }
  });
  
  item.addEventListener('mouseleave', function() {
    if (icon) {
      icon.style.transform = 'scale(1) rotate(0deg)';
    }
  });
  
  // 錯開動畫時間
  item.style.animationDelay = `${index * 0.15}s`;
});

// 滾動時的額外動畫效果
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const enhancedObserver = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 為不同類型的元素添加不同的動畫效果
      if (entry.target.classList.contains('philosophy-grid')) {
        const cards = entry.target.querySelectorAll('.philosophy-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 100);
        });
      }
      
      if (entry.target.classList.contains('content-areas')) {
        const items = entry.target.querySelectorAll('.area-item');
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
document.querySelectorAll('.philosophy-grid, .content-areas').forEach(el => {
  enhancedObserver.observe(el);
  
  // 初始化動畫狀態
  if (el.classList.contains('philosophy-grid')) {
    el.querySelectorAll('.philosophy-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'all 0.6s ease';
    });
  }
  
  if (el.classList.contains('content-areas')) {
    el.querySelectorAll('.area-item').forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px) scale(0.95)';
      item.style.transition = 'all 0.6s ease';
    });
  }
});