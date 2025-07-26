// About 頁面特有的 JavaScript 功能

// 等待所有依賴載入完成
window.addEventListener('load', function() {
  // 確保 GSAP 已載入
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    // 延遲初始化避免衝突
    setTimeout(() => {
      initStackingCards();
      initContentGallery();
    }, 100);
  } else {
    console.error('GSAP 或 ScrollTrigger 未載入');
  }
});

// 堆疊卡片效果 - 完全按照 demo 邏輯實現
function initStackingCards() {
  const cards = gsap.utils.toArray(".stack-card");
  
  if (cards.length === 0) return;
  
  // 清除所有現有的 ScrollTriggers 避免衝突
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars && trigger.vars.trigger && 
        (trigger.vars.trigger.classList?.contains('stack-card') || 
         trigger.vars.id?.includes('stack-card'))) {
      trigger.kill();
    }
  });
  
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
      id: `stack-card-${index}`,
      toggleActions: "restart none none reverse"
    });
  });
  
  console.log('✅ 堆疊卡片動畫初始化完成');
}

// 視窗大小變化時重新初始化
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, 250);
});

// 內容畫廊動畫系統 - 完全按照 demo code 重新設計
function initContentGallery() {
  console.log('🎬 初始化內容畫廊動畫 - 重新設計版本');
  
  // 清除衝突的 ScrollTriggers
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars && trigger.vars.trigger?.classList?.contains('content-gallery')) {
      trigger.kill();
    }
  });

  // 完全按照 demo 的邏輯
  let iteration = 0;
  
  const spacing = 0.1,
        snap = gsap.utils.snap(spacing),
        cards = gsap.utils.toArray('.content-card'),
        seamlessLoop = buildSeamlessLoop(cards, spacing),
        scrub = gsap.to(seamlessLoop, {
            totalTime: 0,
            duration: 0.5,
            ease: "power3",
            paused: true
        }),
        trigger = ScrollTrigger.create({
            trigger: ".content-gallery",
            start: "top center",
            end: "bottom center",
            scrub: 0.05, // 更低的靈敏度
            // 移除 pin，讓頁面可以正常滾動
            onUpdate(self) {
                if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
                    wrapForward(self);
                } else if (self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
                    wrapBackward(self);
                } else {
                    scrub.vars.totalTime = snap((iteration + self.progress) * seamlessLoop.duration());
                    scrub.invalidate().restart();
                    self.wrapping = false;
                }
            }
        });

  function wrapForward(trigger) {
      iteration++;
      trigger.wrapping = true;
      // 重置進度，繼續循環
      trigger.progress(0.01);
      setTimeout(() => trigger.wrapping = false, 100);
  }

  function wrapBackward(trigger) {
      iteration--;
      if (iteration < 0) {
          iteration = 9;
          seamlessLoop.totalTime(seamlessLoop.totalTime() + seamlessLoop.duration() * 10);
          scrub.pause();
      }
      trigger.wrapping = true;
      // 重置進度，繼續循環
      trigger.progress(0.99);
      setTimeout(() => trigger.wrapping = false, 100);
  }

  function scrubTo(totalTime) {
      // 處理循環邊界
      let progress = (totalTime - seamlessLoop.duration() * iteration) / seamlessLoop.duration();
      if (progress > 1) {
          wrapForward(trigger);
      } else if (progress < 0) {
          wrapBackward(trigger);
      } else {
          scrub.vars.totalTime = totalTime;
          scrub.invalidate().restart();
      }
  }

  // 按鈕控制
  document.querySelector(".content-next")?.addEventListener("click", () => 
      scrubTo(scrub.vars.totalTime + spacing)
  );
  document.querySelector(".content-prev")?.addEventListener("click", () => 
      scrubTo(scrub.vars.totalTime - spacing)
  );

  // Demo 風格的初始化 - 簡單淡入第一張卡片內容
  gsap.to('.content-card', {opacity: 1, delay: 0.1, duration: 0.3});

  console.log(`✅ Demo 重新設計版本初始化完成`);
}

// 建立無限循環的水平滑動動畫 - 完全按照 Demo 原始碼
function buildSeamlessLoop(items, spacing) {
    let overlap = Math.ceil(1 / spacing), // number of EXTRA animations on either side of the start/end to accommodate the seamless looping
        startTime = items.length * spacing + 0.5, // the time on the rawSequence at which we'll start the seamless loop
        loopTime = (items.length + overlap) * spacing + 1, // the spot at the end where we loop back to the startTime 
        rawSequence = gsap.timeline({paused: true}), // this is where all the "real" animations live
        seamlessLoop = gsap.timeline({ // this merely scrubs the playhead of the rawSequence so that it appears to seamlessly loop
            paused: true,
            repeat: -1, // to accommodate infinite scrolling/looping
            onRepeat() { // works around a super rare edge case bug that's fixed GSAP 3.6.1
                this._time === this._dur && (this._tTime += this._dur - 0.01);
            }
        }),
        l = items.length + overlap * 2,
        time = 0,
        i, index, item;

    // set initial state of items - 完全按照 demo
    gsap.set(items, {xPercent: 400, opacity: 0, scale: 0});

    // now loop through and create all the animations in a staggered fashion. Remember, we must create EXTRA animations at the end to accommodate the seamless looping.
    for (i = 0; i < l; i++) {
        index = i % items.length;
        item = items[index];
        time = i * spacing;
        rawSequence.fromTo(item, {scale: 0, opacity: 0}, {scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false}, time)
                   .fromTo(item, {xPercent: 400}, {xPercent: -400, duration: 1, ease: "none", immediateRender: false}, time);
        i <= items.length && seamlessLoop.add("label" + i, time);
    }
    
    // here's where we set up the scrubbing of the playhead to make it appear seamless. 
    rawSequence.time(startTime);
    seamlessLoop.to(rawSequence, {
        time: loopTime,
        duration: loopTime - startTime,
        ease: "none"
    }).fromTo(rawSequence, {time: overlap * spacing + 1}, {
        time: startTime,
        duration: startTime - (overlap * spacing + 1),
        immediateRender: false,
        ease: "none"
    });
    
    console.log(`📊 Demo 原始版本無縫循環建立完成，總長度: ${seamlessLoop.duration()}`);
    
    return seamlessLoop;
}

