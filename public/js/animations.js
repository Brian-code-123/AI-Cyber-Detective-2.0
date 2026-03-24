/**
 * =====================================================
 * NeoTrace — Enhanced Animations & Visual Effects
 * =====================================================
 * 
 * Advanced background animations using Canvas + CSS
 * - Animated particle background
 * - Gradient waves
 * - Interactive hover effects
 * - Performance optimized
 */

// ═══════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEM FOR BACKGROUND ANIMATION
// ═══════════════════════════════════════════════════════════════════════

class ParticleBackground {
  constructor(containerId = 'particle-canvas') {
    // Don't initialize if container doesn't exist
    const container = document.getElementById(containerId);
    if (!container) return;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.particles = [];
    this.container = container;
    
    // Clear any existing canvas
    container.innerHTML = '';
    container.appendChild(this.canvas);
    
    this.setup();
    this.createParticles();
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', () => this.setup());
  }

  setup() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Set canvas styles
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '-1';
    this.canvas.style.pointerEvents = 'none';
  }

  createParticles() {
    this.particles = [];
    const particleCount = Math.ceil((this.width * this.height) / 15000);
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: this.getRandomColor(),
      });
    }
  }

  getRandomColor() {
    const colors = [
      'rgba(59, 130, 246, ', // Blue
      'rgba(99, 102, 241, ', // Indigo
      'rgba(139, 92, 246, ', // Purple
      'rgba(236, 72, 153, ', // Pink
      'rgba(34, 197, 94, ', // Green
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  animate = () => {
    // Clear canvas with slight fade effect
    this.ctx.fillStyle = 'rgba(10, 10, 30, 0.02)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Update and draw particles
    for (let particle of this.particles) {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x = this.width;
      if (particle.x > this.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.height;
      if (particle.y > this.height) particle.y = 0;

      // Apply gravity effect
      particle.vy += 0.0001;

      // Draw particle
      this.ctx.fillStyle = particle.color + particle.opacity + ')';
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw connections between nearby particles
    this.drawConnections();

    requestAnimationFrame(this.animate);
  };

  drawConnections() {
    const maxDistance = 150;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.3;
          this.ctx.strokeStyle = `rgba(100, 150, 255, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// GRADIENT ANIMATION
// ═══════════════════════════════════════════════════════════════════════

class GradientWave {
  constructor(containerId = 'gradient-wave') {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.container = container;
    this.angle = 0;
    this.animate();
  }

  animate = () => {
    this.angle += 0.5;
    const gradient = `linear-gradient(
      ${this.angle}deg,
      rgba(59, 130, 246, 0.05) 0%,
      rgba(139, 92, 246, 0.05) 25%,
      rgba(236, 72, 153, 0.05) 50%,
      rgba(34, 197, 94, 0.05) 75%,
      rgba(59, 130, 246, 0.05) 100%
    )`;

    this.container.style.background = gradient;
    requestAnimationFrame(this.animate);
  };
}

// ═══════════════════════════════════════════════════════════════════════
// INIT: AUTO-START ANIMATIONS ON PAGE LOAD
// ═══════════════════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
  });
} else {
  initAnimations();
}

function initAnimations() {
  // Create particle background canvas container if it doesn't exist
  if (!document.getElementById('particle-canvas')) {
    const canvas = document.createElement('div');
    canvas.id = 'particle-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    document.body.insertBefore(canvas, document.body.firstChild);
  }

  // Initialize particle system with slight delay for performance
  setTimeout(() => {
    new ParticleBackground('particle-canvas');
  }, 100);

  // Add gradient wave support (if element exists)
  if (document.getElementById('gradient-wave')) {
    new GradientWave('gradient-wave');
  }

  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT FOR MODULAR USE
// ═══════════════════════════════════════════════════════════════════════
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ParticleBackground, GradientWave };
}
