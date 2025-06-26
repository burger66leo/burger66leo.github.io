// Apps 頁面特有的 JavaScript 功能

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

// 應用卡片的交互效果
const appCards = document.querySelectorAll('.app-card');
appCards.forEach((card, index) => {
  // 滑鼠懸停時的圖標動畫
  const icon = card.querySelector('.app-icon-placeholder');
  
  card.addEventListener('mouseenter', function() {
    if (icon) {
      icon.style.transform = 'scale(1.1) rotate(5deg)';
      icon.style.transition = 'transform 0.3s ease';
    }
    
    // 為特色應用添加特殊效果
    if (this.classList.contains('featured')) {
      this.style.background = 'linear-gradient(135deg, #1a1a1abd 0%, rgba(250, 207, 32, 0.05) 100%)';
    }
  });
  
  card.addEventListener('mouseleave', function() {
    if (icon) {
      icon.style.transform = 'scale(1) rotate(0deg)';
    }
    
    if (this.classList.contains('featured')) {
      this.style.background = '#161616bd';
    }
  });
  
  // 錯開動畫時間
  card.style.animationDelay = `${index * 0.2}s`;
});

// 功能標籤的互動效果
const featureTags = document.querySelectorAll('.feature-tag');
featureTags.forEach(tag => {
  tag.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.05)';
    this.style.background = 'rgba(250, 207, 32, 0.2)';
  });
  
  tag.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
    this.style.background = 'rgba(250, 207, 32, 0.1)';
  });
});

// 技術標籤的隨機閃爍效果
const techTags = document.querySelectorAll('.tech-tag');
function randomTechHighlight() {
  const randomTag = techTags[Math.floor(Math.random() * techTags.length)];
  if (randomTag) {
    randomTag.style.background = 'rgba(250, 207, 32, 0.1)';
    randomTag.style.color = '#facf20';
    randomTag.style.borderColor = 'rgba(250, 207, 32, 0.2)';
    
    setTimeout(() => {
      randomTag.style.background = 'rgba(255, 255, 255, 0.05)';
      randomTag.style.color = '#e3e3e3';
      randomTag.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }, 2000);
  }
}

// 每3秒隨機高亮一個技術標籤
setInterval(randomTechHighlight, 3000);

// 洞察卡片的交互效果
const insightCards = document.querySelectorAll('.insight-card');
insightCards.forEach((card, index) => {
  card.addEventListener('mouseenter', function() {
    this.style.background = 'linear-gradient(135deg, #1a1a1abd 0%, #161616bd 100%)';
    this.style.borderColor = 'rgba(250, 207, 32, 0.3)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.background = '#161616bd';
    this.style.borderColor = '#7373739a';
  });
  
  // 錯開動畫時間
  card.style.animationDelay = `${index * 0.1}s`;
});

// CTA 按鈕的點擊效果
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

// 添加 CSS 動畫
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// 滾動時的特殊動畫效果
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const enhancedObserver = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 為應用網格添加特殊動畫
      if (entry.target.classList.contains('apps-grid')) {
        const cards = entry.target.querySelectorAll('.app-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 200);
        });
      }
      
      // 為技術堆疊添加動畫
      if (entry.target.classList.contains('tech-stack')) {
        const categories = entry.target.querySelectorAll('.tech-category');
        categories.forEach((category, index) => {
          setTimeout(() => {
            category.style.opacity = '1';
            category.style.transform = 'translateY(0)';
            
            // 為技術標籤添加錯開動畫
            const tags = category.querySelectorAll('.tech-tag');
            tags.forEach((tag, tagIndex) => {
              setTimeout(() => {
                tag.style.opacity = '1';
                tag.style.transform = 'scale(1)';
              }, tagIndex * 50);
            });
          }, index * 150);
        });
      }
    }
  });
}, observerOptions);

// 觀察需要特殊動畫的元素
document.querySelectorAll('.apps-grid, .tech-stack').forEach(el => {
  enhancedObserver.observe(el);
  
  // 初始化動畫狀態
  if (el.classList.contains('apps-grid')) {
    el.querySelectorAll('.app-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'all 0.6s ease';
    });
  }
  
  if (el.classList.contains('tech-stack')) {
    el.querySelectorAll('.tech-category').forEach(category => {
      category.style.opacity = '0';
      category.style.transform = 'translateY(30px)';
      category.style.transition = 'all 0.6s ease';
      
      category.querySelectorAll('.tech-tag').forEach(tag => {
        tag.style.opacity = '0';
        tag.style.transform = 'scale(0.8)';
        tag.style.transition = 'all 0.3s ease';
      });
    });
  }
});