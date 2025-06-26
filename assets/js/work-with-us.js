/**
 * Work With Us 頁面專用 JavaScript
 * 處理頁面互動和導航效果
 */

// 頁面載入時的動畫和初始化
document.addEventListener('DOMContentLoaded', function() {
  initPageInteractions();
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

function initPageInteractions() {
  // 增強的平滑滾動到錨點
  const tocLinks = document.querySelectorAll('.toc-nav a');
  
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // 添加點擊動畫效果
        this.style.transform = 'scale(0.95)';
        this.style.transition = 'transform 0.1s ease';
        
        // 創建波浪擴散效果
        createRippleEffect(this, e);
        
        setTimeout(() => {
          this.style.transform = 'scale(1)';
        }, 100);
        
        // 計算目標位置
        const offsetTop = targetElement.offsetTop - 120; // 增加一點空間
        
        // 顯示滾動進度指示器
        showScrollProgress();
        
        // 使用自定義的平滑滾動動畫
        smoothScrollTo(offsetTop, 1000, () => {
          // 滾動完成後的回調
          hideScrollProgress();
          highlightTarget(targetElement);
        });
        
        // 更新導航狀態
        updateActiveNavLink(this);
      }
    });
  });
  
  // 滾動時更新導航狀態
  window.addEventListener('scroll', throttle(updateNavOnScroll, 100));
  
  // 視差滾動效果
  window.addEventListener('scroll', throttle(handleParallaxEffects, 16));
  
  // 卡片進入視窗動畫
  observeCardAnimations();
  
  // 增強表單互動
  enhanceFormInteractions();
}


function updateActiveNavLink(activeLink) {
  const tocLinks = document.querySelectorAll('.toc-nav a');
  tocLinks.forEach(link => {
    link.classList.remove('active');
  });
  activeLink.classList.add('active');
}

function updateNavOnScroll() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.pageYOffset + 200;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      const activeLink = document.querySelector(`.toc-nav a[href="#${sectionId}"]`);
      if (activeLink) {
        updateActiveNavLink(activeLink);
      }
    }
  });
}

function handleParallaxEffects() {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.chart-container, .example-card');
  
  parallaxElements.forEach((element, index) => {
    const speed = 0.5 + (index * 0.1);
    const yPos = -(scrolled * speed / 10);
    element.style.transform = `translateY(${yPos}px)`;
  });
}

function observeCardAnimations() {
  const cards = document.querySelectorAll('.testimonial-card, .solution-card, .mode-card, .example-item, .process-step, .contact-item');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      }
    });
  }, observerOptions);
  
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transitionDelay = `${index * 0.1}s`;
    
    cardObserver.observe(card);
  });
}

function enhanceFormInteractions() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    const inputs = contactForm.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
      });
      
      input.addEventListener('blur', function() {
        if (!this.value) {
          this.parentElement.classList.remove('focused');
        }
      });
      
      input.addEventListener('input', function() {
        validateField(this);
      });
    });
    
    contactForm.addEventListener('submit', handleFormSubmit);
  }
}

function validateField(field) {
  const value = field.value.trim();
  const fieldType = field.type;
  const isRequired = field.hasAttribute('required');
  
  let isValid = true;
  
  if (isRequired && !value) {
    isValid = false;
  } else if (fieldType === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    isValid = emailRegex.test(value);
  }
  
  field.parentElement.classList.toggle('error', !isValid);
  field.parentElement.classList.toggle('valid', isValid && value);
  
  return isValid;
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let isFormValid = true;
  
  inputs.forEach(input => {
    if (!validateField(input)) {
      isFormValid = false;
    }
  });
  
  if (isFormValid) {
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('span');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    btnText.style.display = 'none';
    btnLoading.style.display = 'block';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      showSubmissionSuccess();
      form.reset();
      
      btnText.style.display = 'block';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;
      
      inputs.forEach(input => {
        input.parentElement.classList.remove('focused', 'valid', 'error');
      });
    }, 2000);
  } else {
    const firstError = form.querySelector('.error input, .error select, .error textarea');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
  }
}

// 自定義平滑滾動函數
function smoothScrollTo(targetPosition, duration, callback) {
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // 使用 easeInOutCubic 緩動函數
    const ease = progress < 0.5 
      ? 4 * progress * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    window.scrollTo(0, startPosition + distance * ease);
    
    // 更新進度指示器
    updateScrollProgress(progress);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      // 滾動完成，執行回調
      if (callback) callback();
    }
  }
  
  requestAnimationFrame(animation);
}

// 滾動進度指示器
function showScrollProgress() {
  let progressBar = document.getElementById('scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.innerHTML = '<div class="progress-fill"></div>';
    document.body.appendChild(progressBar);
  }
  progressBar.classList.add('visible');
}

function updateScrollProgress(progress) {
  const progressFill = document.querySelector('#scroll-progress .progress-fill');
  if (progressFill) {
    progressFill.style.width = `${progress * 100}%`;
  }
}

function hideScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    progressBar.classList.remove('visible');
    setTimeout(() => {
      updateScrollProgress(0); // 重置進度
    }, 300);
  }
}

// 波浪擴散效果
function createRippleEffect(element, event) {
  const ripple = document.createElement('span');
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: radial-gradient(circle, rgba(250, 207, 32, 0.4) 0%, transparent 70%);
    border-radius: 50%;
    transform: scale(0);
    animation: rippleAnimation 0.6s ease-out;
    pointer-events: none;
    z-index: 0;
  `;
  
  // 確保父元素有相對定位
  const originalPosition = element.style.position;
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  
  element.appendChild(ripple);
  
  // 移除波浪效果
  setTimeout(() => {
    element.removeChild(ripple);
    element.style.position = originalPosition;
    element.style.overflow = '';
  }, 600);
}

// 目標元素高亮效果
function highlightTarget(element) {
  // 移除之前的高亮
  const prevHighlighted = document.querySelector('.section-highlighted');
  if (prevHighlighted) {
    prevHighlighted.classList.remove('section-highlighted');
  }
  
  // 添加高亮效果
  element.classList.add('section-highlighted');
  
  // 3秒後移除高亮
  setTimeout(() => {
    element.classList.remove('section-highlighted');
  }, 3000);
}

// 工具函數
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

// 合作卡片的交互效果
const collabCards = document.querySelectorAll('.collab-card');
collabCards.forEach((card, index) => {
  // 滑鼠懸停時的圖標動畫
  const icon = card.querySelector('.card-icon');
  
  card.addEventListener('mouseenter', function() {
    if (icon) {
      icon.style.transform = 'scale(1.2) rotate(10deg)';
      icon.style.transition = 'transform 0.3s ease';
    }
    
    // 為特色卡片添加特殊效果
    if (this.classList.contains('featured')) {
      this.style.background = 'linear-gradient(135deg, #1a1a1abd 0%, rgba(250, 207, 32, 0.05) 100%)';
    } else {
      this.style.background = 'linear-gradient(135deg, #1a1a1abd 0%, #161616bd 100%)';
    }
  });
  
  card.addEventListener('mouseleave', function() {
    if (icon) {
      icon.style.transform = 'scale(1) rotate(0deg)';
    }
    
    this.style.background = '#161616bd';
  });
  
  // 錯開動畫時間
  card.style.animationDelay = `${index * 0.15}s`;
});

// 優勢項目的交互效果
const advantageItems = document.querySelectorAll('.advantage-item');
advantageItems.forEach((item, index) => {
  const icon = item.querySelector('.advantage-icon');
  
  item.addEventListener('mouseenter', function() {
    if (icon) {
      icon.style.transform = 'scale(1.3) rotate(15deg)';
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
  item.style.animationDelay = `${index * 0.1}s`;
});

// 聯絡方式的交互效果
const contactMethods = document.querySelectorAll('.contact-method');
contactMethods.forEach(method => {
  method.addEventListener('mouseenter', function() {
    const icon = this.querySelector('.method-icon');
    if (icon) {
      icon.style.transform = 'scale(1.2)';
      icon.style.transition = 'transform 0.3s ease';
    }
  });
  
  method.addEventListener('mouseleave', function() {
    const icon = this.querySelector('.method-icon');
    if (icon) {
      icon.style.transform = 'scale(1)';
    }
  });
});

// 表單驗證和提交
const contactForm = document.getElementById('contactForm');
const submitBtn = document.querySelector('.submit-btn');
const btnText = submitBtn.querySelector('span');
const btnLoading = submitBtn.querySelector('.btn-loading');

contactForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // 顯示載入狀態
  btnText.style.display = 'none';
  btnLoading.style.display = 'block';
  submitBtn.disabled = true;
  
  // 收集表單數據
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  
  // 模擬提交過程
  setTimeout(() => {
    // 這裡可以替換為實際的表單提交邏輯
    console.log('表單提交數據:', data);
    
    // 顯示成功訊息
    showSubmissionSuccess();
    
    // 重置表單
    this.reset();
    
    // 恢復按鈕狀態
    btnText.style.display = 'block';
    btnLoading.style.display = 'none';
    submitBtn.disabled = false;
  }, 2000);
});

// 顯示提交成功訊息
function showSubmissionSuccess() {
  const successMessage = document.createElement('div');
  successMessage.className = 'success-message';
  successMessage.innerHTML = `
    <div class="success-content">
      <div class="success-icon">✓</div>
      <h3>提案已送出！</h3>
      <p>感謝您的合作提案，我們會在 48 小時內回覆您。</p>
    </div>
  `;
  
  // 添加樣式
  successMessage.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  
  const successContent = successMessage.querySelector('.success-content');
  successContent.style.cssText = `
    background: #161616;
    padding: 3rem;
    border-radius: 16px;
    text-align: center;
    border: 2px solid #facf20;
    max-width: 400px;
    width: 90%;
  `;
  
  const successIcon = successMessage.querySelector('.success-icon');
  successIcon.style.cssText = `
    font-size: 3rem;
    color: #2ECC71;
    margin-bottom: 1rem;
  `;
  
  const successTitle = successMessage.querySelector('h3');
  successTitle.style.cssText = `
    color: #ffffff;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  `;
  
  const successText = successMessage.querySelector('p');
  successText.style.cssText = `
    color: #e3e3e3;
    line-height: 1.6;
  `;
  
  document.body.appendChild(successMessage);
  
  // 點擊關閉
  successMessage.addEventListener('click', function() {
    this.remove();
  });
  
  // 3秒後自動關閉
  setTimeout(() => {
    if (successMessage.parentNode) {
      successMessage.remove();
    }
  }, 3000);
}

// 表單欄位的動畫效果
const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
formInputs.forEach(input => {
  // 聚焦時的動畫
  input.addEventListener('focus', function() {
    this.style.transform = 'scale(1.02)';
    this.style.transition = 'transform 0.2s ease, border-color 0.3s ease';
  });
  
  input.addEventListener('blur', function() {
    this.style.transform = 'scale(1)';
  });
  
  // 輸入時的即時驗證
  input.addEventListener('input', function() {
    if (this.value.trim() !== '') {
      this.style.borderColor = '#2ECC71';
    } else {
      this.style.borderColor = '#7373739a';
    }
  });
});

// 價格範圍的動畫效果
const priceRanges = document.querySelectorAll('.price-range');
priceRanges.forEach(price => {
  price.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.1)';
    this.style.color = '#fff7a8';
    this.style.transition = 'all 0.3s ease';
  });
  
  price.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
    this.style.color = '#facf20';
  });
});

// 滾動時的特殊動畫效果
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const enhancedObserver = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 為合作類型網格添加特殊動畫
      if (entry.target.classList.contains('collaboration-types')) {
        const cards = entry.target.querySelectorAll('.collab-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 150);
        });
      }
      
      // 為優勢網格添加動畫
      if (entry.target.classList.contains('advantages-grid')) {
        const items = entry.target.querySelectorAll('.advantage-item');
        items.forEach((item, index) => {
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
          }, index * 120);
        });
      }
      
      // 為聯絡區域添加動畫
      if (entry.target.classList.contains('contact-section')) {
        const elements = entry.target.querySelectorAll('.contact-info, .contact-form');
        elements.forEach((element, index) => {
          setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
          }, index * 200);
        });
      }
    }
  });
}, observerOptions);

// 觀察需要特殊動畫的元素
document.querySelectorAll('.collaboration-types, .advantages-grid, .contact-section').forEach(el => {
  enhancedObserver.observe(el);
  
  // 初始化動畫狀態
  if (el.classList.contains('collaboration-types')) {
    el.querySelectorAll('.collab-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'all 0.6s ease';
    });
  }
  
  if (el.classList.contains('advantages-grid')) {
    el.querySelectorAll('.advantage-item').forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px) scale(0.95)';
      item.style.transition = 'all 0.6s ease';
    });
  }
  
  if (el.classList.contains('contact-section')) {
    const contactInfo = el.querySelector('.contact-info');
    const contactForm = el.querySelector('.contact-form');
    
    if (contactInfo) {
      contactInfo.style.opacity = '0';
      contactInfo.style.transform = 'translateX(-30px)';
      contactInfo.style.transition = 'all 0.8s ease';
    }
    
    if (contactForm) {
      contactForm.style.opacity = '0';
      contactForm.style.transform = 'translateX(30px)';
      contactForm.style.transition = 'all 0.8s ease';
    }
  }
});

// 添加 CSS 動畫
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .feature-item {
    transition: all 0.3s ease;
  }
  
  .feature-item:hover {
    color: #facf20;
    transform: translateX(5px);
  }
`;
document.head.appendChild(style);