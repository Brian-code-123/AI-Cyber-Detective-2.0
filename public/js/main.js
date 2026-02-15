// =====================================================
// AI CYBER DETECTIVE 2.0 — Main Shared JavaScript
// =====================================================

// Matrix Rain Effect
function initMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`アイウエオカキクケコサシスセソタチツテトナニヌネノ';
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = new Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(10, 14, 23, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 50);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Mobile Nav Toggle
function initNavToggle() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('show'));
    });
  }
}

// Animate stat numbers
function animateCounters() {
  document.querySelectorAll('.stat-number[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2000;
    const start = performance.now();
    
    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(target * eased);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(update);
        observer.disconnect();
      }
    });
    observer.observe(el);
  });
}

// Scroll reveal animation
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.style.animationDelay = entry.target.dataset.delay || '0s';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.chapter, .card, .chart-container, .tool-panel, .result-panel').forEach(el => {
    observer.observe(el);
  });
}

// Active nav link
function setActiveNavLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initMatrixRain();
  initNavToggle();
  animateCounters();
  initScrollReveal();
  setActiveNavLink();
  initI18n();
});
