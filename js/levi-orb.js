/**
 * levi-orb.js - Bio-mechanical Organic Core Canvas Renderer
 * Implements exact deformable 64-point parametric mesh, living asymmetric eyes,
 * state-driven morphing, orbital satellite particles, and acoustic arcs.
 */

class LeviOrganicOrb {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.size = options.size || 220;
    this.interactive = options.interactive !== false;

    // States configuration
    this.states = {
      'ready': {
        name: 'Ready',
        color: '#6FE8CE',
        speed: 1900,
        geometry: 'circular',
        desc: 'Gentle circular breathing; calm periodic blinking.'
      },
      'listening': {
        name: 'Listening',
        color: '#68C7FF',
        speed: 820,
        geometry: 'stretchX',
        desc: 'Stretches horizontally; 3 concentric acoustic arcs pulse outward.'
      },
      'thinking': {
        name: 'Thinking',
        color: '#D47AFF',
        speed: 1250,
        geometry: 'droplet',
        desc: 'Morphs into an organic droplet; 4 counter-rotating satellite particles.'
      },
      'processing': {
        name: 'Processing',
        color: '#FFA85C',
        speed: 1250,
        geometry: 'wobble',
        desc: 'Dynamic 6-harmonic wobble; 6 orbiting satellite dots.'
      },
      'speaking': {
        name: 'Speaking',
        color: '#66F0B3',
        speed: 820,
        geometry: 'squash',
        desc: 'Audio-reactive squash & stretch; radiating soundwave arcs.'
      },
      'waiting': {
        name: 'Waiting',
        color: '#FFD467',
        speed: 2500,
        geometry: 'steady',
        desc: 'Steady warm glow awaiting user confirmation.'
      },
      'offline': {
        name: 'Offline',
        color: '#FF647C',
        speed: 3000,
        geometry: 'muted',
        desc: 'Muted crimson glow indicating airgapped secure idle.'
      }
    };

    this.currentState = options.initialState || 'ready';
    this.startTime = performance.now();
    this.animId = null;

    // Eye tracking
    this.lookX = 0;
    this.lookY = 0;
    this.targetLookX = 0;
    this.targetLookY = 0;

    // Setup high DPI
    this.setupCanvas();
    this.bindEvents();
    this.animate();
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.size * dpr;
    this.canvas.height = this.size * dpr;
    this.canvas.style.width = `${this.size}px`;
    this.canvas.style.height = `${this.size}px`;
    this.ctx.scale(dpr, dpr);
  }

  setState(stateKey) {
    if (this.states[stateKey]) {
      this.currentState = stateKey;
      this.startTime = performance.now();
      
      // Update UI state pills if available
      const pills = document.querySelectorAll('.orb-state-btn');
      pills.forEach(p => {
        if (p.getAttribute('data-state') === stateKey) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });

      // Update notch if present
      if (window.updateNotchState) {
        window.updateNotchState(stateKey);
      }
    }
  }

  bindEvents() {
    if (!this.interactive) return;

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      this.targetLookX = Math.max(-1, Math.min(1, dx)) * 4;
      this.targetLookY = Math.max(-1, Math.min(1, dy)) * 3;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.targetLookX = 0;
      this.targetLookY = 0;
    });

    this.canvas.addEventListener('click', () => {
      // Cycle to next state
      const keys = Object.keys(this.states);
      const nextIdx = (keys.indexOf(this.currentState) + 1) % keys.length;
      this.setState(keys[nextIdx]);
    });
  }

  animate() {
    const now = performance.now();
    const elapsed = now - this.startTime;
    const cfg = this.states[this.currentState];
    const cycle = cfg.speed;
    const phase = (elapsed % cycle) / cycle * Math.PI * 2;
    const globalPhase = elapsed * 0.003;

    // Smooth eye interpolation
    this.lookX += (this.targetLookX - this.lookX) * 0.1;
    this.lookY += (this.targetLookY - this.lookY) * 0.1;

    // Dynamic autonomous eye drift during thinking / processing
    if (this.currentState === 'thinking') {
      this.lookX = Math.sin(globalPhase * 1.5) * 4;
      this.lookY = -3 + Math.cos(globalPhase * 1.2) * 2; // looking up
    } else if (this.currentState === 'processing') {
      this.lookX = Math.cos(globalPhase * 3.5) * 3;
      this.lookY = Math.sin(globalPhase * 3.0) * 2.5;
    }

    this.draw(phase, globalPhase, cfg);
    this.animId = requestAnimationFrame(() => this.animate());
  }

  draw(phase, globalPhase, cfg) {
    const ctx = this.ctx;
    const w = this.size;
    const h = this.size;
    const cx = w / 2;
    const cy = h / 2;
    const baseRadius = w * 0.28;

    ctx.clearRect(0, 0, w, h);

    // 1. Radial Breathing Aura
    ctx.save();
    const auraPulse = 1.0 + Math.sin(phase) * 0.06;
    const auraGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.4, cx, cy, baseRadius * 1.6 * auraPulse);
    auraGrad.addColorStop(0, cfg.color + '44');
    auraGrad.addColorStop(0.5, cfg.color + '1A');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 1.6 * auraPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. State-Specific Outer Effects (Acoustic Arcs or Satellite Dots)
    this.drawStateEffects(ctx, cx, cy, baseRadius, phase, globalPhase, cfg);

    // 3. Deformable 64-Point Parametric Core Mesh
    ctx.save();
    ctx.translate(cx, cy);

    // Geometry Transformations per state
    let scaleX = 1.0;
    let scaleY = 1.0;
    if (cfg.geometry === 'stretchX') {
      scaleX = 1.08 + Math.sin(phase) * 0.04;
      scaleY = 0.94 - Math.sin(phase) * 0.03;
    } else if (cfg.geometry === 'squash') {
      scaleY = 1.0 + Math.sin(phase * 1.5) * 0.08;
      scaleX = 2.0 - scaleY;
    }
    ctx.scale(scaleX, scaleY);

    const points = 64;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const theta = (i / points) * Math.PI * 2;
      let r = baseRadius;

      // Base wobble
      r += Math.sin(3 * theta + globalPhase * 2) * (baseRadius * 0.018);

      // State-specific geometry deformation
      if (cfg.geometry === 'droplet') {
        // Droplet morph
        r += (Math.sin(3 * theta + phase) * 0.06 + Math.sin(5 * theta - phase) * 0.04) * baseRadius;
      } else if (cfg.geometry === 'wobble') {
        // Processing harmonic wobble
        r += Math.cos(6 * theta + globalPhase * 5) * (baseRadius * 0.05);
      } else if (cfg.geometry === 'circular') {
        // Gentle organic breathing
        r += Math.sin(phase) * (baseRadius * 0.02);
      }

      const px = Math.cos(theta) * r;
      const py = Math.sin(theta) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    // 3-Stop Radial Core Gradient (-34%, -42%)
    const gradCenterX = -baseRadius * 0.34;
    const gradCenterY = -baseRadius * 0.42;
    const coreGrad = ctx.createRadialGradient(gradCenterX, gradCenterY, baseRadius * 0.08, 0, 0, baseRadius * 1.15);
    coreGrad.addColorStop(0.0, '#272935');  // slate highlight
    coreGrad.addColorStop(0.58, '#090A0F'); // deep midnight
    coreGrad.addColorStop(1.0, '#020308');  // void black

    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Outer Edge Stroke: 1.15px stroke with active state color at 72% opacity
    ctx.strokeStyle = cfg.color + 'B8';
    ctx.lineWidth = 1.25;
    ctx.stroke();

    // 4. Living Eyes Rendering
    this.drawEyes(ctx, baseRadius, phase, globalPhase, cfg);

    ctx.restore();
  }

  drawEyes(ctx, r, phase, globalPhase, cfg) {
    // Natural Blink Physics: pow(max(0, sin(phase * 0.5)), 18)
    let blinkFactor = 1.0;
    if (cfg.geometry === 'wobble') {
      // Rapid intermittent blink in processing
      blinkFactor = 1.0 - Math.pow(Math.max(0, Math.sin(globalPhase * 4.5)), 8);
    } else {
      blinkFactor = 1.0 - Math.pow(Math.max(0, Math.sin(globalPhase * 0.7)), 22);
    }
    blinkFactor = Math.max(0.12, blinkFactor);

    // Big, Cute & Alert proportions matching reference image:
    // Plump capsule width with distinct clean gap separating both eyes
    const eyeW = r * 0.185;
    const eyeH = Math.max(eyeW * 0.22, r * 0.42 * blinkFactor);
    const eyeSpacing = r * 0.235;
    const eyeOffsetY = -r * 0.02 + this.lookY;

    // Linear white-to-soft-ice gradient (#FFFFFF -> #EDF3FF)
    const eyeGrad = ctx.createLinearGradient(0, -eyeH / 2, 0, eyeH / 2);
    eyeGrad.addColorStop(0, '#FFFFFF');
    eyeGrad.addColorStop(0.75, '#FFFFFF');
    eyeGrad.addColorStop(1, '#EDF3FF');
    ctx.fillStyle = eyeGrad;

    // Soft white glow for extra cute luminescence
    ctx.shadowColor = 'rgba(255, 255, 255, 0.75)';
    ctx.shadowBlur = eyeW * 0.5;

    // Capsule helper: ensures compatibility and smooth rounded caps
    const drawEyeCapsule = (w, h) => {
      const radius = w / 2;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-w / 2, -h / 2, w, h, radius);
      } else {
        ctx.arc(-w / 2 + radius, -h / 2 + radius, radius, Math.PI, Math.PI * 1.5);
        ctx.arc(w / 2 - radius, -h / 2 + radius, radius, Math.PI * 1.5, Math.PI * 2);
        ctx.arc(w / 2 - radius, h / 2 - radius, radius, 0, Math.PI * 0.5);
        ctx.arc(-w / 2 + radius, h / 2 - radius, radius, Math.PI * 0.5, Math.PI);
        ctx.closePath();
      }
      ctx.fill();
    };

    // Left Eye (+0.04 rad tilt ~ 2.3 deg upright and alert)
    ctx.save();
    ctx.translate(-eyeSpacing + this.lookX, eyeOffsetY);
    ctx.rotate(0.04);
    drawEyeCapsule(eyeW, eyeH);
    ctx.restore();

    // Right Eye (-0.22 rad tilt ~ -12.5 deg curious inquisitive slant)
    ctx.save();
    ctx.translate(eyeSpacing + this.lookX, eyeOffsetY);
    ctx.rotate(-0.22);
    drawEyeCapsule(eyeW, eyeH);
    ctx.restore();

    // Reset shadow for subsequent draw calls
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  drawStateEffects(ctx, cx, cy, r, phase, globalPhase, cfg) {
    // Listening / Speaking: Acoustic radiating arcs
    if (cfg.geometry === 'stretchX' || cfg.geometry === 'squash') {
      const arcCount = 3;
      for (let i = 1; i <= arcCount; i++) {
        const arcProgress = ((phase + i * 1.8) % (Math.PI * 2)) / (Math.PI * 2);
        const arcR = r * 1.1 + arcProgress * (r * 0.55);
        const arcAlpha = (1.0 - arcProgress) * 0.45;

        ctx.strokeStyle = cfg.color + Math.floor(arcAlpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;

        // Left Acoustic Arc
        ctx.beginPath();
        ctx.arc(cx, cy, arcR, Math.PI * 0.75, Math.PI * 1.25);
        ctx.stroke();

        // Right Acoustic Arc
        ctx.beginPath();
        ctx.arc(cx, cy, arcR, -Math.PI * 0.25, Math.PI * 0.25);
        ctx.stroke();
      }
    }

    // Thinking: 4 Counter-rotating satellite particles
    if (cfg.geometry === 'droplet') {
      const satellites = 4;
      const orbitR = r * 1.35;
      for (let i = 0; i < satellites; i++) {
        const angle = -globalPhase * 1.8 + (i * Math.PI * 2) / satellites;
        const sx = cx + Math.cos(angle) * orbitR;
        const sy = cy + Math.sin(angle) * (orbitR * 0.75);

        ctx.fillStyle = cfg.color;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = cfg.color + '44';
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Processing: 6 Orbiting dots
    if (cfg.geometry === 'wobble') {
      const dots = 6;
      const orbitR = r * 1.3;
      for (let i = 0; i < dots; i++) {
        const angle = globalPhase * 2.5 + (i * Math.PI * 2) / dots;
        const sx = cx + Math.cos(angle) * orbitR;
        const sy = cy + Math.sin(angle) * orbitR;

        ctx.fillStyle = cfg.color;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// Global instance setup
window.LeviOrganicOrb = LeviOrganicOrb;
