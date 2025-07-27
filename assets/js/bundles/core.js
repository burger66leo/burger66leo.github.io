/* ===========================================
   CORE JS BUNDLE
   包含：基礎工具函數 + 主要邏輯
   適用於：所有頁面的基礎功能
   注意：不使用 document.write，改為直接載入
   =========================================== */

// 檢查 core 函數是否可用
if (typeof window.utils === 'undefined' && typeof initNavbar === 'undefined') {
  console.warn('⚠️ Core Bundle 警告：請確保已載入 core/utils.js 和 core/main.js');
}

console.log('✅ Core JS Bundle 載入完成');