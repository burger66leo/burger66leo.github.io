/* ===========================================
   動畫組件系統 - 可復用的動畫效果
   =========================================== */

class AnimationComponents {
  constructor() {
    this.isGSAPAvailable = typeof gsap !== 'undefined';
    this.defaultOptions = {
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.1
    };
  }

  // 🧲 磁性效果 - 優化版本
  static magneticEffect(elements, options = {}) {
    const settings = {
      strength: 0.15,
      duration: 0.3,
      elasticDuration: 0.6,
      elasticEase: "elastic.out(1, 0.3)",
      ...options
    };

    if (typeof gsap === 'undefined') {
      console.warn('GSAP 未載入，磁性效果需要 GSAP');
      return;
    }

    const elementsArray = NodeList.prototype.isPrototypeOf(elements) ? 
      Array.from(elements) : [elements].filter(el => el);

    if (elementsArray.length === 0) {
      console.warn('沒有找到有效的元素來應用磁性效果');
      return;
    }

    elementsArray.forEach((element, index) => {
      // 確保元素存在且為有效的DOM元素
      if (!element || !element.addEventListener) {
        console.warn(`跳過無效元素 ${index}`);
        return;
      }

      // 添加磁性標記以防重複綁定
      if (element.dataset.magneticBound) {
        return;
      }
      element.dataset.magneticBound = 'true';

      let isAnimating = false;

      element.addEventListener('mousemove', (e) => {
        if (isAnimating) return;
        isAnimating = true;

        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(element, {
          x: x * settings.strength,
          y: y * settings.strength,
          duration: settings.duration,
          ease: "power2.out",
          onComplete: () => {
            isAnimating = false;
          }
        });
      });
      
      element.addEventListener('mouseleave', () => {
        gsap.to(element, { 
          x: 0, 
          y: 0, 
          duration: settings.elasticDuration, 
          ease: settings.elasticEase,
          onComplete: () => {
            isAnimating = false;
          }
        });
      });
    });

    console.log(`🧲 磁性效果已應用於 ${elementsArray.length} 個元素`);
  }

  // ✨ 滾動淡入效果
  static fadeInOnScroll(elements, options = {}) {
    const settings = {
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse",
      stagger: 0.15,
      y: 50,
      opacity: 0,
      duration: 0.8,
      ...options
    };

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // CSS 降級方案
      const elementsArray = NodeList.prototype.isPrototypeOf(elements) ? 
        Array.from(elements) : [elements];
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.1 });

      elementsArray.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
      });
      return;
    }

    const elementsArray = NodeList.prototype.isPrototypeOf(elements) ? 
      Array.from(elements) : [elements];

    elementsArray.forEach(element => {
      gsap.fromTo(element,
        { opacity: settings.opacity, y: settings.y },
        {
          opacity: 1,
          y: 0,
          duration: settings.duration,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: settings.start,
            end: settings.end,
            toggleActions: settings.toggleActions
          }
        }
      );
    });

    console.log(`✨ 滾動淡入效果已應用於 ${elementsArray.length} 個元素`);
  }

  // 🌊 波浪動畫
  static waveAnimation(elements, options = {}) {
    const settings = {
      stagger: 0.1,
      duration: 0.6,
      y: 100,
      opacity: 0,
      ease: "sine.out",
      ...options
    };

    if (typeof gsap === 'undefined') {
      console.warn('GSAP 未載入，波浪動畫需要 GSAP');
      return;
    }

    // 先重置
    gsap.set(elements, { opacity: settings.opacity, y: settings.y });
    
    gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: settings.duration,
      stagger: settings.stagger,
      ease: settings.ease
    });

    console.log(`🌊 波浪動畫已播放`);
  }

  // ⚡ 打字機效果
  static typewriterEffect(element, text, options = {}) {
    const settings = {
      speed: 0.1,
      showCursor: true,
      cursorChar: '|',
      delay: 0,
      onComplete: null,
      ...options
    };

    if (!element) return;

    const originalText = text || element.textContent;
    
    // 設置初始狀態
    if (typeof gsap !== 'undefined') {
      gsap.set(element, { opacity: 1, y: 0 });
    }

    // 清空文字，添加光標
    const cursorHTML = settings.showCursor ? 
      `<span class="typing-cursor" style="color: var(--primary-yellow); animation: blink 1s infinite;">${settings.cursorChar}</span>` : '';
    
    element.innerHTML = cursorHTML;

    setTimeout(() => {
      let currentText = '';
      let charIndex = 0;

      const typeInterval = setInterval(() => {
        if (charIndex < originalText.length) {
          currentText += originalText[charIndex];
          element.innerHTML = currentText + cursorHTML;
          charIndex++;
        } else {
          clearInterval(typeInterval);
          
          // 完成後處理光標
          if (settings.showCursor) {
            setTimeout(() => {
              const cursor = element.querySelector('.typing-cursor');
              if (cursor && typeof gsap !== 'undefined') {
                gsap.to(cursor, {
                  opacity: 0,
                  duration: 0.3,
                  delay: 1
                });
              }
            }, 500);
          }
          
          if (settings.onComplete) settings.onComplete();
        }
      }, settings.speed * 1000);
    }, settings.delay);

    console.log('⚡ 打字機效果已開始');
  }

  // 💫 3D 翻轉效果
  static flipOnHover(elements, options = {}) {
    const settings = {
      rotationY: 15,
      rotationX: 10,
      scale: 1.05,
      duration: 0.4,
      perspective: 1000,
      ...options
    };

    if (typeof gsap === 'undefined') {
      console.warn('GSAP 未載入，3D 翻轉效果需要 GSAP');
      return;
    }

    const elementsArray = NodeList.prototype.isPrototypeOf(elements) ? 
      Array.from(elements) : [elements];

    elementsArray.forEach(element => {
      element.addEventListener('mouseenter', () => {
        gsap.to(element, {
          rotationY: settings.rotationY,
          rotationX: settings.rotationX,
          scale: settings.scale,
          duration: settings.duration,
          ease: "power2.out",
          transformPerspective: settings.perspective
        });
      });
      
      element.addEventListener('mouseleave', () => {
        gsap.to(element, {
          rotationY: 0,
          rotationX: 0,
          scale: 1,
          duration: settings.duration,
          ease: "power2.out"
        });
      });
    });

    console.log(`💫 3D 翻轉效果已應用於 ${elementsArray.length} 個元素`);
  }

  // 🌟 液體變形效果
  static liquidEffect(element, options = {}) {
    const settings = {
      scaleX1: 1.2,
      scaleX2: 0.8,
      scaleY2: 1.2,
      duration1: 0.1,
      duration2: 0.2,
      duration3: 0.3,
      ease: "elastic.out(1, 0.3)",
      ...options
    };

    if (typeof gsap === 'undefined') {
      console.warn('GSAP 未載入，液體效果需要 GSAP');
      return;
    }

    const tl = gsap.timeline();
    tl.to(element, { scaleX: settings.scaleX1, duration: settings.duration1 })
      .to(element, { 
        scaleX: settings.scaleX2, 
        scaleY: settings.scaleY2, 
        duration: settings.duration2 
      })
      .to(element, { 
        scaleX: 1, 
        scaleY: 1, 
        duration: settings.duration3, 
        ease: settings.ease 
      });

    console.log('🌟 液體變形效果已播放');
  }

  // 🎯 視差滾動效果
  static parallaxScroll(elements, options = {}) {
    const settings = {
      speed: 0.5,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      ...options
    };

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP + ScrollTrigger 未載入，視差效果需要完整的 GSAP');
      return;
    }

    const elementsArray = NodeList.prototype.isPrototypeOf(elements) ? 
      Array.from(elements) : [elements];

    elementsArray.forEach((element, index) => {
      const speed = Array.isArray(settings.speed) ? 
        settings.speed[index] || settings.speed[0] : settings.speed;
      
      gsap.to(element, {
        y: -100 * speed,
        scrollTrigger: {
          trigger: element,
          start: settings.start,
          end: settings.end,
          scrub: settings.scrub
        }
      });
    });

    console.log(`🎯 視差滾動效果已應用於 ${elementsArray.length} 個元素`);
  }

  // 🎪 組合動畫預設
  static presets = {
    // 卡片進入動畫
    cardEntrance: (elements) => {
      AnimationComponents.fadeInOnScroll(elements, {
        y: 30,
        stagger: 0.15,
        duration: 0.6
      });
    },

    // 標題分解動畫
    titleSplit: (element, text) => {
      if (typeof gsap === 'undefined') return;
      
      const originalText = text || element.textContent;
      element.innerHTML = originalText.split('').map(char => 
        `<span style="display: inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('');
      
      const letters = element.querySelectorAll('span');
      gsap.fromTo(letters, 
        { opacity: 0, y: 50, rotationX: -90 },
        { 
          opacity: 1, 
          y: 0, 
          rotationX: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: "back.out(1.7)"
        }
      );
    },

    // Hero 進入動畫
    heroEntrance: (logoElement, textElement) => {
      if (typeof gsap === 'undefined') return;
      
      const tl = gsap.timeline();
      
      if (logoElement) {
        tl.fromTo(logoElement, 
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
      }
      
      if (textElement) {
        tl.add(() => {
          AnimationComponents.typewriterEffect(textElement, null, { delay: 0.5 });
        }, '-=0.5');
      }
    }
  };

  // 🛠 工具方法
  static utils = {
    // 檢查 GSAP 可用性
    isGSAPAvailable: () => typeof gsap !== 'undefined',
    
    // 檢查 ScrollTrigger 可用性
    isScrollTriggerAvailable: () => typeof ScrollTrigger !== 'undefined',
    
    // 元素轉陣列
    toArray: (elements) => {
      return NodeList.prototype.isPrototypeOf(elements) ? 
        Array.from(elements) : [elements];
    },

    // 隨機延遲
    randomDelay: (min = 0, max = 1) => Math.random() * (max - min) + min,

    // 緩動函數
    easing: {
      easeInOut: (t) => t * t * (3.0 - 2.0 * t),
      bounce: "elastic.out(1, 0.3)",
      smooth: "power2.out"
    }
  };
}

// CSS 關鍵幀動畫（降級方案）
const cssAnimations = `
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
`;

// 將 CSS 動畫注入頁面
if (!document.querySelector('#animation-components-css')) {
  const style = document.createElement('style');
  style.id = 'animation-components-css';
  style.textContent = cssAnimations;
  document.head.appendChild(style);
}

console.log('🎭 AnimationComponents 已載入');

// 導出到全域
window.AnimationComponents = AnimationComponents;