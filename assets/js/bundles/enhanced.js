/* ===========================================
   ENHANCED JS BUNDLE  
   包含：core + GSAP + SimplexNoise + 動畫系統
   適用於：需要動畫效果的頁面（首頁、About、Videos）
   注意：此檔案假設 core JS 和 GSAP 已單獨載入
   =========================================== */

// 確保依賴已載入的檢查
if (typeof gsap === 'undefined') {
  console.error('❌ Enhanced Bundle 錯誤：GSAP 未載入，請先載入 GSAP');
}

// 確保 utils 函數可用
if (typeof window.utils === 'undefined' && typeof initNavbar === 'undefined') {
  console.warn('⚠️ Enhanced Bundle 警告：Core JS 可能未載入');
}

// 3. 內建 SimplexNoise (避免重複載入)
if (typeof SimplexNoise === 'undefined') {
  // SimplexNoise 實現 (簡化版)
  class SimplexNoise {
    constructor() {
      this.grad3 = [
        [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
        [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
        [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
      ];
      
      this.p = [];
      for(let i = 0; i < 256; i++) {
        this.p[i] = Math.floor(Math.random() * 256);
      }
      
      this.perm = [];
      for(let i = 0; i < 512; i++) {
        this.perm[i] = this.p[i & 255];
      }
    }
    
    dot(g, x, y) {
      return g[0] * x + g[1] * y;
    }
    
    noise2D(xin, yin) {
      const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
      const s = (xin + yin) * F2;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      
      const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
      const t = (i + j) * G2;
      const X0 = i - t;
      const Y0 = j - t;
      const x0 = xin - X0;
      const y0 = yin - Y0;
      
      let i1, j1;
      if(x0 > y0) {
        i1 = 1; j1 = 0;
      } else {
        i1 = 0; j1 = 1;
      }
      
      const x1 = x0 - i1 + G2;
      const y1 = y0 - j1 + G2;
      const x2 = x0 - 1.0 + 2.0 * G2;
      const y2 = y0 - 1.0 + 2.0 * G2;
      
      const ii = i & 255;
      const jj = j & 255;
      const gi0 = this.perm[ii + this.perm[jj]] % 12;
      const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
      const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
      
      let t0 = 0.5 - x0 * x0 - y0 * y0;
      let n0 = 0;
      if(t0 >= 0) {
        t0 *= t0;
        n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
      }
      
      let t1 = 0.5 - x1 * x1 - y1 * y1;
      let n1 = 0;
      if(t1 >= 0) {
        t1 *= t1;
        n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
      }
      
      let t2 = 0.5 - x2 * x2 - y2 * y2;
      let n2 = 0;
      if(t2 >= 0) {
        t2 *= t2;
        n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
      }
      
      return 70.0 * (n0 + n1 + n2);
    }
  }
  
  window.SimplexNoise = SimplexNoise;
  console.log('✅ SimplexNoise 已內建載入');
}

console.log('✅ Enhanced JS Bundle 載入完成');