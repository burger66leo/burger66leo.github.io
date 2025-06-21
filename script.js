// 滾動效果
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// 移動端菜單切換
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

menuToggle.addEventListener('click', function() {
  menuToggle.classList.toggle('active');
  nav.classList.toggle('active');
});

// 點擊菜單項目後關閉菜單
const navLinks = nav.querySelectorAll('a');
navLinks.forEach(link => {
  link.addEventListener('click', function() {
    menuToggle.classList.remove('active');
    nav.classList.remove('active');
  });
});

// 滾動動畫
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// 觀察所有需要動畫的元素
document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

// 點擊外部區域關閉菜單
document.addEventListener('click', function(event) {
  const isClickInsideNav = nav.contains(event.target);
  const isClickOnToggle = menuToggle.contains(event.target);
  
  if (!isClickInsideNav && !isClickOnToggle && nav.classList.contains('active')) {
    menuToggle.classList.remove('active');
    nav.classList.remove('active');
  }
});

// 防止菜單內部點擊時冒泡
nav.addEventListener('click', function(event) {
  event.stopPropagation();
});