// =====================================================
// AI CYBER DETECTIVE 2.0 — Story Mode
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById('progressBar');
  const progressPercent = document.getElementById('progressPercent');
  const scrollProgressEl = document.getElementById('scrollProgress');
  const chapters = document.querySelectorAll('.chapter');

  // Scroll progress tracking
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min((scrollTop / docHeight) * 100, 100);
    
    if (scrollProgressEl) scrollProgressEl.style.width = progress + '%';
    if (progressBar) progressBar.style.width = progress + '%';
    if (progressPercent) progressPercent.textContent = Math.round(progress) + '%';
  }

  window.addEventListener('scroll', updateScrollProgress);

  // Chapter reveal on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  chapters.forEach(ch => observer.observe(ch));

  // Initial check
  updateScrollProgress();

  // Add typing effect to chapter headers on reveal
  chapters.forEach(ch => {
    const h2 = ch.querySelector('h2');
    if (h2) {
      const originalText = h2.textContent;
      const chapterObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          typeText(h2, originalText);
          chapterObserver.disconnect();
        }
      }, { threshold: 0.5 });
      chapterObserver.observe(ch);
    }
  });
});

function typeText(element, text) {
  element.textContent = '';
  element.style.borderRight = '2px solid var(--accent-green)';
  let i = 0;
  const interval = setInterval(() => {
    element.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      setTimeout(() => {
        element.style.borderRight = 'none';
      }, 500);
    }
  }, 40);
}
