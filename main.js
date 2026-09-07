/**
 * S. Praveenkumar - Gaming Portfolio Core Engine
 * Features:
 * 1. Interactive 3D RPG Cyber Particle Constellation Canvas
 * 2. Web Audio API Retro Sci-Fi SFX Synthesizer with Mute Toggle
 * 3. Interactive Demon Lord Arc Boss HP Battle Widget (18,000 HP)
 * 4. Navigation Spy & Smooth Scrolling
 * 5. Mobile Drawer Menu
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Web Audio API Sound Synthesizer (Retro Gaming SFX)
  // =========================================================================
  class SoundEngine {
    constructor() {
      this.audioCtx = null;
      this.enabled = localStorage.getItem('sp_sfx_enabled') !== 'false'; // default ON
      this.initAudioContext();
    }

    initAudioContext() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }

    ensureRunning() {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }

    playHoverSound() {
      if (!this.enabled || !this.audioCtx) return;
      this.ensureRunning();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    }

    playClickSound() {
      if (!this.enabled || !this.audioCtx) return;
      this.ensureRunning();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    }

    playBossAttackSound() {
      if (!this.enabled || !this.audioCtx) return;
      this.ensureRunning();

      // Dual oscillator impact sound
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      osc1.frequency.setValueAtTime(260, this.audioCtx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(60, this.audioCtx.currentTime + 0.2);

      osc2.frequency.setValueAtTime(520, this.audioCtx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(110, this.audioCtx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.09, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.audioCtx.currentTime + 0.2);
      osc2.stop(this.audioCtx.currentTime + 0.2);
    }

    playVictoryFanfare() {
      if (!this.enabled || !this.audioCtx) return;
      this.ensureRunning();

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const startTime = this.audioCtx.currentTime + idx * 0.1;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('sp_sfx_enabled', this.enabled);
      return this.enabled;
    }
  }

  const sfx = new SoundEngine();

  // =========================================================================
  // 2. Interactive Cyberpunk Particle Constellation Canvas
  // =========================================================================
  const canvas = document.getElementById('cyberCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 140 };

    const PARTICLE_COUNT = window.innerWidth < 768 ? 40 : 85;
    const MAX_DISTANCE = 120;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
        this.isGreen = Math.random() > 0.6; // 40% neon green, 60% purple
        this.baseColor = this.isGreen ? 'rgba(6, 255, 165,' : 'rgba(124, 58, 237,';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce from edges
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Mouse avoidance/interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= Math.cos(angle) * force * 1.5;
            this.y -= Math.sin(angle) * force * 1.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.baseColor} 0.85)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.isGreen ? '#06ffa5' : '#7c3aed';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DISTANCE) {
            const alpha = (1 - dist / MAX_DISTANCE) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      connectParticles();

      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    resize();
    initParticles();
    animate();
  }

  // =========================================================================
  // 3. Header Sound Toggle Setup
  // =========================================================================
  const soundBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');

  function updateSoundButtonUI() {
    if (!soundBtn || !soundIcon) return;
    if (sfx.enabled) {
      soundBtn.classList.remove('muted');
      soundIcon.className = 'fa-solid fa-volume-high';
      soundBtn.title = 'Sound FX: ON (Click to Mute)';
    } else {
      soundBtn.classList.add('muted');
      soundIcon.className = 'fa-solid fa-volume-xmark';
      soundBtn.title = 'Sound FX: MUTED (Click to Enable)';
    }
  }

  if (soundBtn) {
    updateSoundButtonUI();
    soundBtn.addEventListener('click', () => {
      const isNowEnabled = sfx.toggle();
      updateSoundButtonUI();
      if (isNowEnabled) {
        sfx.playClickSound();
      }
    });
  }

  // =========================================================================
  // 4. Attach Audio Triggers to Interactive Elements
  // =========================================================================
  document.querySelectorAll('.sfx-trigger, .btn, .project-btn-primary, .contact-action-btn, .nav-link').forEach((el) => {
    el.addEventListener('mouseenter', () => sfx.playHoverSound());
    el.addEventListener('click', () => sfx.playClickSound());
  });

  document.querySelectorAll('.skill-card, .project-card').forEach((card) => {
    card.addEventListener('mouseenter', () => sfx.playHoverSound());
  });

  // =========================================================================
  // 5. Boss HP Interactive Mini-Game (Project 1: The 10 Skills 3D RPG)
  // =========================================================================
  const MAX_BOSS_HP = 18000;
  let currentBossHp = 18000;
  const bossHpBar = document.getElementById('bossHpBar');
  const bossHpText = document.getElementById('bossHpText');
  const attackBtn = document.getElementById('attackBossBtn');
  const bossWidget = document.getElementById('bossWidget');

  if (attackBtn && bossHpBar && bossHpText) {
    attackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sfx.playBossAttackSound();

      if (currentBossHp <= 0) {
        // Reset Boss
        currentBossHp = MAX_BOSS_HP;
        bossHpBar.style.width = '100%';
        bossHpBar.style.background = 'linear-gradient(90deg, #ef4444, #f59e0b, var(--neon-green))';
        bossHpText.textContent = `${MAX_BOSS_HP.toLocaleString()} / ${MAX_BOSS_HP.toLocaleString()} HP`;
        attackBtn.innerHTML = `<i class="fa-solid fa-wand-sparkles"></i> Strike Boss with AI Skill!`;
        return;
      }

      // Inflict 3,000 to 5,000 Critical Damage
      const damage = Math.floor(Math.random() * 2000) + 3500;
      currentBossHp = Math.max(0, currentBossHp - damage);

      const percentage = (currentBossHp / MAX_BOSS_HP) * 100;
      bossHpBar.style.width = `${percentage}%`;
      bossHpText.textContent = `${currentBossHp.toLocaleString()} / ${MAX_BOSS_HP.toLocaleString()} HP`;

      // Visual Shake Effect on Widget
      if (bossWidget) {
        bossWidget.style.transform = 'scale(0.98)';
        setTimeout(() => {
          bossWidget.style.transform = 'scale(1)';
        }, 100);
      }

      // Check Boss Defeat
      if (currentBossHp === 0) {
        sfx.playVictoryFanfare();
        bossHpText.textContent = '0 / 18,000 HP (BOSS DEFEATED! ⚔️)';
        bossHpBar.style.background = '#64748b';
        attackBtn.innerHTML = `<i class="fa-solid fa-rotate-right"></i> Boss Defeated! Click to Revive Arc`;
      }
    });
  }

  // =========================================================================
  // 6. Navigation Scroll Spy & Header Shrink
  // =========================================================================
  const header = document.querySelector('.hud-header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.hud-nav .nav-link');

  function handleScroll() {
    const scrollY = window.scrollY;

    // Header glow on scroll
    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Active Section Spy
    let currentId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // =========================================================================
  // 7. Mobile Menu Drawer Toggle
  // =========================================================================
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('hudNav');

  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-active');
      sfx.playClickSound();
    });

    // Close menu when a link is clicked
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-active');
      });
    });
  }

  // =========================================================================
  // 8. Console Brand Signature (Easter Egg for Developers)
  // =========================================================================
  console.log(
    `%c[S. Praveenkumar]%c Full Stack Developer & AI Game Creator\n%c📍 Madurai, India • WhatsApp: +91 6382023335`,
    'color: #06ffa5; font-size: 14px; font-weight: bold; background: #08080f; padding: 4px 8px; border: 1px solid #7c3aed; border-radius: 4px;',
    'color: #c4b5fd; font-size: 13px; font-weight: 600; padding: 4px;',
    'color: #94a3b8; font-size: 11px;'
  );
})();
