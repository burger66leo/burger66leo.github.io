// 觀眾證詞輪播功能
class TestimonialsCarousel {
  constructor() {
    this.slider = document.getElementById('testimonialsSlider');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.indicatorsContainer = document.getElementById('carouselIndicators');
    
    if (!this.slider) return;
    
    this.slides = this.slider.children;
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 4000; // 4秒自動輪播，更頻繁一些
    
    this.init();
  }
  
  init() {
    this.createIndicators();
    this.bindEvents();
    this.preloadSlides();
    this.updateSlider();
    this.startAutoPlay();
    
    // 初始時顯示第一張
    this.updateIndicators();
  }
  
  preloadSlides() {
    // 預載所有卡片，確保內容渲染完成
    Array.from(this.slides).forEach((slide, index) => {
      const content = slide.querySelector('.testimonial-content');
      if (content) {
        // 強制瀏覽器計算所有元素的佈局
        content.offsetHeight;
        content.offsetWidth;
        
        // 添加載入完成的標記
        slide.classList.add('preloaded');
      }
    });
  }
  
  createIndicators() {
    // 清空指示器容器
    this.indicatorsContainer.innerHTML = '';
    
    // 為每個證詞創建指示器
    for (let i = 0; i < this.slides.length; i++) {
      const indicator = document.createElement('div');
      indicator.className = 'indicator';
      indicator.setAttribute('data-index', i);
      
      // 添加點擊事件
      indicator.addEventListener('click', () => {
        this.goToSlide(i);
      });
      
      this.indicatorsContainer.appendChild(indicator);
    }
  }
  
  bindEvents() {
    // 前一個按鈕
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.previousSlide();
      });
    }
    
    // 下一個按鈕
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.nextSlide();
      });
    }
    
    // 鍵盤支援
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.previousSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      }
    });
    
    // 滑鼠懸停時暫停自動播放（可選，註解掉讓它一直播放）
    // this.slider.addEventListener('mouseenter', () => {
    //   this.stopAutoPlay();
    // });
    
    // this.slider.addEventListener('mouseleave', () => {
    //   this.startAutoPlay();
    // });
    
    // 觸控支援
    this.addTouchSupport();
  }
  
  addTouchSupport() {
    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let deltaY = 0;
    
    this.slider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      // 觸控時暫時停止，但會自動重啟
    }, { passive: true });
    
    this.slider.addEventListener('touchmove', (e) => {
      if (!startX || !startY) return;
      
      deltaX = e.touches[0].clientX - startX;
      deltaY = e.touches[0].clientY - startY;
    }, { passive: true });
    
    this.slider.addEventListener('touchend', () => {
      if (!startX || !startY) return;
      
      // 檢查是否為水平滑動且滑動距離足夠
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.previousSlide();
        } else {
          this.nextSlide();
        }
      }
      
      // 重置
      startX = 0;
      startY = 0;
      deltaX = 0;
      deltaY = 0;
    }, { passive: true });
  }
  
  nextSlide() {
    if (this.isTransitioning) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.updateSlider();
    
    // 重新啟動自動播放和進度條
    this.startAutoPlay();
  }
  
  previousSlide() {
    if (this.isTransitioning) return;
    
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.updateSlider();
    
    // 重新啟動自動播放和進度條
    this.startAutoPlay();
  }
  
  goToSlide(index) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.currentIndex = index;
    this.updateSlider();
    
    // 重新啟動自動播放和進度條
    this.startAutoPlay();
  }
  
  updateSlider() {
    if (!this.slider) return;
    
    this.isTransitioning = true;
    
    // 強制重排以確保瀏覽器準備好渲染
    this.slider.offsetHeight;
    
    // 使用 requestAnimationFrame 確保在下一個渲染幀執行
    requestAnimationFrame(() => {
      // 計算位移
      const translateX = -this.currentIndex * 100;
      this.slider.style.transform = `translateX(${translateX}%)`;
      
      // 更新指示器
      this.updateIndicators();
      
      // 更新按鈕狀態
      this.updateButtons();
    });
    
    // 監聽轉場結束事件
    const handleTransitionEnd = () => {
      this.isTransitioning = false;
      this.slider.removeEventListener('transitionend', handleTransitionEnd);
    };
    
    this.slider.addEventListener('transitionend', handleTransitionEnd);
    
    // 備用計時器，防止事件未觸發
    setTimeout(() => {
      this.isTransitioning = false;
    }, 600);
  }
  
  updateIndicators() {
    const indicators = this.indicatorsContainer.children;
    
    for (let i = 0; i < indicators.length; i++) {
      indicators[i].classList.toggle('active', i === this.currentIndex);
    }
  }
  
  updateButtons() {
    // 這個輪播是無限循環的，所以按鈕不需要禁用
    // 如果需要線性模式，可以在這裡禁用首尾按鈕
  }
  
  startAutoPlay() {
    this.stopAutoPlay(); // 先清除現有的定時器
    
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }
  
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
  
  // 公共方法：手動控制
  play() {
    this.startAutoPlay();
  }
  
  pause() {
    this.stopAutoPlay();
  }
  
  // 銷毀實例
  destroy() {
    this.stopAutoPlay();
    // 移除事件監聽器等清理工作
  }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
  // 檢查是否在 work-with-us 頁面
  if (document.getElementById('testimonialsSlider')) {
    window.testimonialsCarousel = new TestimonialsCarousel();
  }
});

// 頁面可見性 API - 當頁面隱藏時暫停自動播放
document.addEventListener('visibilitychange', () => {
  if (window.testimonialsCarousel) {
    if (document.hidden) {
      window.testimonialsCarousel.pause();
    } else {
      window.testimonialsCarousel.play();
    }
  }
});