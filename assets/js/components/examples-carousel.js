/**
 * 內容範例輪播組件
 */
class ExamplesCarousel {
  constructor() {
    this.slider = document.getElementById('examplesSlider');
    this.slides = this.slider?.querySelectorAll('.example-slide');
    this.prevBtn = document.getElementById('examplesPrevBtn');
    this.nextBtn = document.getElementById('examplesNextBtn');
    this.indicatorsContainer = document.getElementById('examplesIndicators');
    
    this.currentSlide = 0;
    this.totalSlides = this.slides?.length || 0;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000; // 5 秒自動播放
    this.resizeTimeout = null;
    
    if (this.slider && this.totalSlides > 0) {
      this.init();
    }
  }
  
  init() {
    this.createIndicators();
    this.bindEvents();
    this.updateCarousel();
    this.startAutoPlay();
  }
  
  createIndicators() {
    if (!this.indicatorsContainer) return;
    
    this.indicatorsContainer.innerHTML = '';
    for (let i = 0; i < this.totalSlides; i++) {
      const indicator = document.createElement('button');
      indicator.className = `indicator ${i === 0 ? 'active' : ''}`;
      indicator.setAttribute('aria-label', `切換到範例 ${i + 1}`);
      indicator.addEventListener('click', () => this.goToSlide(i));
      this.indicatorsContainer.appendChild(indicator);
    }
  }
  
  bindEvents() {
    // 按鈕事件
    this.prevBtn?.addEventListener('click', () => this.previousSlide());
    this.nextBtn?.addEventListener('click', () => this.nextSlide());
    
    // 鍵盤導航
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.previousSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
    
    // 觸摸手勢支援
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    
    this.slider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
      this.pauseAutoPlay();
    });
    
    this.slider.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    });
    
    this.slider.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;
      
      // 確保是水平滑動
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.nextSlide();
        } else {
          this.previousSlide();
        }
      }
      
      isDragging = false;
      this.startAutoPlay();
    });
    
    // 滑鼠懸停時暫停自動播放
    this.slider.addEventListener('mouseenter', () => this.pauseAutoPlay());
    this.slider.addEventListener('mouseleave', () => this.startAutoPlay());
    
    // 窗口大小調整時重新計算位置
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.updateCarousel();
      }, 250);
    });
  }
  
  updateCarousel() {
    if (!this.slider) return;
    
    // 確保精確對齊 - 計算每個滑塊的精確寬度
    const slideWidth = this.slider.parentElement.offsetWidth;
    const translateX = -this.currentSlide * slideWidth;
    
    // 使用精確的像素值而不是百分比
    this.slider.style.transform = `translateX(${translateX}px)`;
    
    // 更新指示器
    const indicators = this.indicatorsContainer?.querySelectorAll('.indicator');
    indicators?.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentSlide);
    });
    
    // 更新按鈕狀態
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentSlide === 0;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
    }
    
    // GPU 加速優化
    requestAnimationFrame(() => {
      this.slider.style.willChange = 'transform';
      setTimeout(() => {
        this.slider.style.willChange = 'auto';
      }, 500);
    });
  }
  
  goToSlide(index) {
    if (index >= 0 && index < this.totalSlides) {
      this.currentSlide = index;
      this.updateCarousel();
    }
  }
  
  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
    } else {
      this.currentSlide = 0; // 循環到第一張
    }
    this.updateCarousel();
  }
  
  previousSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    } else {
      this.currentSlide = this.totalSlides - 1; // 循環到最後一張
    }
    this.updateCarousel();
  }
  
  startAutoPlay() {
    this.pauseAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }
  
  pauseAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
  
  destroy() {
    this.pauseAutoPlay();
    // 移除事件監聽器
    this.prevBtn?.removeEventListener('click', () => this.previousSlide());
    this.nextBtn?.removeEventListener('click', () => this.nextSlide());
  }
}

// 初始化輪播
document.addEventListener('DOMContentLoaded', () => {
  window.examplesCarousel = new ExamplesCarousel();
});

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExamplesCarousel;
}