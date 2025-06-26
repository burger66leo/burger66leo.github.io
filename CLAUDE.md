# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for "三稜鏡 prizm" (Prism), a content creation company focused on technology videos, brand planning, and app development. The site is hosted on GitHub Pages and features:

- Main landing page with hero video and responsive design
- Link-in-bio page for social media navigation
- Custom 404 error page with interactive elements
- Traditional Chinese content with modern web design

## Site Structure

- `/index.html` - Main homepage with hero video, company intro, and feature cards
- `/links/` - Link-in-bio page with social links and embedded YouTube video
- `/404.html` - Custom 404 error page with animations
- `/style.css` - Main CSS with comprehensive responsive design (RWD)
- `/links/links.css` - Styles specific to the links page
- `/script.js` - JavaScript for navigation, animations, and interactive features
- `/assets/` - Media files (images, videos, fonts, icons)

## Development Commands

This is a static HTML/CSS/JS website with no build process. Development can be done by:

1. **Local Development**: Open `index.html` directly in browser or use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

2. **Testing**: Manual testing across different devices and screen sizes
   - Mobile-first responsive design with breakpoints at 1024px, 768px, 480px, 360px
   - Test video autoplay and navigation interactions

## Technical Architecture

### Responsive Design (RWD)
- Mobile-first approach with comprehensive media queries
- Breakpoints: 1024px (tablet), 768px (mobile landscape), 480px (mobile), 360px (small mobile)
- Special handling for landscape orientation on mobile devices
- Optimized navigation with hamburger menu on mobile

### JavaScript Features
- Intersection Observer API for scroll animations
- Mobile navigation toggle with click-outside-to-close
- Navbar scroll effects with backdrop blur
- Parallax mouse movement effects on 404 page

### CSS Architecture
- BEM-like naming conventions
- Modular sections with clear separation
- CSS custom properties for consistent theming
- Smooth transitions and hover effects
- Comprehensive mobile optimization

### Content Strategy
- Chinese language content (zh-Hant)
- Brand colors: Gold gradient (#facf20, #fff7a8) on dark theme
- Professional typography with proper line spacing
- Video-first design with hero background video

## File Organization

```
├── index.html          # Main homepage
├── links/
│   ├── index.html      # Link-in-bio page
│   └── links.css       # Links page styles
├── style.css           # Main stylesheet
├── script.js           # Main JavaScript
├── 404.html           # Custom error page
└── assets/
    ├── images/        # Logo and brand images
    ├── videos/        # Hero background video
    ├── fonts/         # Custom fonts (if any)
    └── icons/         # Brand icons
```

## Key Features to Maintain

1. **Video Performance**: Hero video is optimized with proper fallbacks
2. **Mobile Experience**: Touch-friendly navigation and proper viewport handling
3. **Social Integration**: External links to YouTube, Instagram, Facebook, email
4. **Brand Consistency**: Maintain gold/dark theme and typography
5. **Performance**: Lightweight, no external dependencies except Simple Icons CDN

## Common Maintenance Tasks

- Update social media links in both index.html and links/index.html
- Modify company information in the main content sections
- Add new feature cards by following existing HTML structure
- Update embedded YouTube video ID in links page
- Maintain responsive design when adding new content

## Deployment

The site is deployed via GitHub Pages. Changes pushed to the main branch are automatically deployed. The CNAME file contains the custom domain configuration.