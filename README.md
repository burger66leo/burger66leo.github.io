# 三稜鏡 prizm 官方網站

## 項目簡介

三稜鏡 prizm 是一個結合科技洞察、品牌分析、系統性思辨的中文內容頻道。本項目為其官方網站，展示品牌理念、應用開發作品、精選影片內容與合作資訊。

## 技術架構

### 🗂️ 檔案結構

```
burger66leo.github.io/
├── index.html                 # 首頁
├── 404.html                  # 404 錯誤頁面
├── CNAME                     # GitHub Pages 域名配置
├── CLAUDE.md                 # Claude Code 開發指南
├── README.md                 # 項目說明文件
├── assets/                   # 靜態資源
│   ├── css/                  # 樣式表
│   │   ├── variables.css     # CSS 變數定義
│   │   ├── base.css         # 基礎樣式
│   │   ├── components.css   # 通用元件樣式
│   │   ├── main.css         # 主要樣式
│   │   ├── responsive.css   # 響應式設計
│   │   ├── about.css        # 關於我們頁面樣式
│   │   ├── apps.css         # 應用展示頁面樣式
│   │   ├── videos.css       # 影片展示頁面樣式
│   │   └── work-with-us.css # 合作頁面樣式
│   ├── js/                  # JavaScript
│   │   ├── utils.js         # 通用工具函數
│   │   ├── main.js          # 主要功能
│   │   ├── about.js         # 關於我們頁面功能
│   │   ├── apps.js          # 應用展示頁面功能
│   │   ├── videos.js        # 影片展示頁面功能
│   │   └── work-with-us.js  # 合作頁面功能
│   ├── images/              # 圖片資源
│   │   ├── logo-icon.webp   # 品牌圖標
│   │   ├── logo-banner.png  # 橫幅 Logo
│   │   └── logo.png         # 主要 Logo
│   ├── videos/              # 影片資源
│   │   └── hero.mp4         # 首頁背景影片
│   ├── fonts/               # 字體檔案
│   └── icons/               # 圖標檔案
├── pages/                   # 子頁面
│   ├── about.html           # 關於我們
│   ├── apps.html            # 我們的應用
│   ├── videos.html          # 精選影片
│   └── work-with-us.html    # 與我們合作
└── links/                   # Link-in-bio 頁面
    ├── index.html           # 連結導航頁面
    └── links.css            # 連結頁面樣式
```

### 🎨 設計系統

#### CSS 變數系統
- **顏色變數**: 主要金色調 (#facf20)、深色背景系列、文字顏色階層
- **字體大小**: 從 xs (0.7rem) 到 6xl (3rem) 的階層系統
- **間距系統**: 從 xs (0.25rem) 到 5xl (8rem) 的一致間距
- **圓角規範**: 從 sm (8px) 到 full (50%) 的圓角系統
- **陰影效果**: 多層次陰影與特殊金色陰影效果

#### 響應式斷點
- **小手機**: 480px 以下
- **手機**: 768px 以下  
- **平板**: 1024px 以下
- **桌面**: 1024px 以上
- **高解析度**: 1400px 以上

### ⚡ 技術特色

#### 模組化架構
- **CSS 分層**: variables → base → components → main → page-specific → responsive
- **JavaScript 分離**: 通用工具、主要功能、頁面特定功能
- **清晰的檔案組織**: 按功能與類型分類的資料夾結構

#### 性能優化
- **圖片優化**: WebP 格式支援與降級方案
- **CSS 最佳化**: 變數系統減少重複代碼
- **JavaScript 工具**: 節流、防抖、懶加載等性能優化工具

#### 用戶體驗
- **動畫系統**: 滾動動畫、懸停效果、過渡動畫
- **互動回饋**: 漣漪效果、狀態變化、載入動畫
- **無障礙設計**: 語義化 HTML、鍵盤導航、螢幕閱讀器支援

## 開發指南

### 本地開發

```bash
# 啟動本地伺服器
python -m http.server 8000
# 或使用 Node.js
npx serve .
# 或使用 PHP
php -S localhost:8000
```

### 檔案修改指南

#### 添加新頁面
1. 在 `pages/` 資料夾創建 HTML 檔案
2. 在 `assets/css/` 創建對應的 CSS 檔案
3. 在 `assets/js/` 創建對應的 JS 檔案
4. 更新導航連結

#### 修改樣式
1. **變數修改**: 在 `assets/css/variables.css` 修改全域變數
2. **基礎樣式**: 在 `assets/css/base.css` 修改基礎元素樣式
3. **元件樣式**: 在 `assets/css/components.css` 修改通用元件
4. **頁面樣式**: 在對應的頁面 CSS 檔案修改特定樣式
5. **響應式**: 在 `assets/css/responsive.css` 修改斷點樣式

#### 添加功能
1. **通用功能**: 在 `assets/js/utils.js` 添加工具函數
2. **主要功能**: 在 `assets/js/main.js` 添加全域功能
3. **頁面功能**: 在對應的頁面 JS 檔案添加特定功能

## 部署說明

### GitHub Pages
本項目部署在 GitHub Pages，推送到 `main` 分支後會自動部署。

### 自定義域名
透過 `CNAME` 檔案配置自定義域名。

## 瀏覽器支援

- **現代瀏覽器**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **移動瀏覽器**: iOS Safari 14+, Chrome Mobile 88+
- **特殊支援**: CSS Grid, Flexbox, CSS Variables, ES6+

## 品牌資源

### 色彩系統
- **主要金色**: #facf20 (品牌主色)
- **淺金色**: #fff7a8 (漸變與高亮)
- **深色背景**: #212121 (主要背景)
- **卡片背景**: #161616bd (半透明卡片)

### Logo 使用
- **圖標**: logo-icon.webp (40x40px，用於導航)
- **橫幅**: logo-banner.png (用於 Link-in-bio)
- **主要**: logo.png (用於首頁 Hero)

## 聯絡資訊

- **官方網站**: https://prizm.com.tw
- **YouTube**: https://www.youtube.com/@prizm66
- **商業合作**: collab@prizm.com.tw
- **一般聯絡**: hi@prizm.com.tw

---

© 2025 三稜鏡 prizm. All rights reserved.