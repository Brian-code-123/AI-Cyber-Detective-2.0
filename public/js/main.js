// =====================================================
// NeoTrace — Main Shared JavaScript
// =====================================================

// Mobile Nav Toggle
function initNavToggle() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('show'));
    });
  }
}

// Animate stat numbers
function animateCounters() {
  document.querySelectorAll('.stat-number[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const isFloat = String(el.dataset.count).includes('.');
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isFloat ? (target * eased).toFixed(1) : Math.floor(target * eased).toLocaleString();
      el.textContent = prefix + current + suffix;
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
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.chapter, .card, .chart-container, .tool-panel, .result-panel, .news-item').forEach(el => {
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

// =====================================================
// Calendar Widget
// =====================================================
let calendarDate = new Date();

function initCalendar() {
  renderCalendar();
}

function changeMonth(delta) {
  calendarDate.setMonth(calendarDate.getMonth() + delta);
  renderCalendar();
}

function renderCalendar() {
  const monthEl = document.getElementById('calendarMonth');
  const daysEl = document.getElementById('calendarDays');
  if (!monthEl || !daysEl) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  monthEl.textContent = monthNames[month] + ' ' + year;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  let html = '';
  // Day labels (matches CSS .day-label)
  ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
    html += '<div class="day-label">' + d + '</div>';
  });

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="day-cell other-month"></div>';
  }

  // Day cells (matches CSS .day-cell, .day-cell.today)
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    html += '<div class="day-cell' + (isToday ? ' today' : '') + '">' + d + '</div>';
  }

  daysEl.innerHTML = html;
}

// =====================================================
// Initialize
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  animateCounters();
  initScrollReveal();
  setActiveNavLink();
  initCalendar();
  initI18n();
});
