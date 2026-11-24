/**
 * notch.js - Controls the signature Top-Centre "Levi Notch" dynamic island
 * Supports Idle, Listening (Waveform), Thinking (Neural Particle Wave), and Validated Action states.
 */

class LeviNotch {
  constructor() {
    this.container = document.getElementById('leviNotch');
    this.statusDot = document.getElementById('notchStatusDot');
    this.statusLabel = document.getElementById('notchStatusLabel');
    this.waveformCanvas = document.getElementById('notchWaveformCanvas');
    this.thinkingCanvas = document.getElementById('notchThinkingCanvas');
    this.actionBadge = document.getElementById('notchActionBadge');

    this.state = 'idle'; // idle | listening | thinking | action | confirm
    this.animFrameId = null;
    this.wavePhase = 0;
    this.thinkingPhase = 0;

    this.init();
  }

  init() {
    if (!this.container) return;

    // Click handler on notch cycles states or triggers demo preview
    this.container.addEventListener('click', () => {
      this.cycleState();
    });

    this.setupCanvases();
    this.setState('idle');
    this.startAnimationLoop();
  }

  setupCanvases() {
    if (this.waveformCanvas) {
      this.waveformCanvas.width = 120;
      this.waveformCanvas.height = 24;
      this.waveCtx = this.waveformCanvas.getContext('2d');
    }
    if (this.thinkingCanvas) {
      this.thinkingCanvas.width = 120;
      this.thinkingCanvas.height = 24;
      this.thinkCtx = this.thinkingCanvas.getContext('2d');
    }
  }

  cycleState() {
    const states = ['idle', 'listening', 'thinking', 'action'];
    const nextIdx = (states.indexOf(this.state) + 1) % states.length;
    this.setState(states[nextIdx]);
  }

  setState(state, customLabel = null) {
    this.state = state;

    // Reset classes
    this.container.className = 'levi-notch';
    this.container.classList.add(`state-${state}`);

    // Hide canvases initially
    if (this.waveformCanvas) this.waveformCanvas.style.display = 'none';
    if (this.thinkingCanvas) this.thinkingCanvas.style.display = 'none';
    if (this.actionBadge) this.actionBadge.style.display = 'none';

    // Status colors
    if (this.statusDot) {
      this.statusDot.style.background = 
        state === 'listening' ? '#06b6d4' :
        state === 'thinking' ? '#8b5cf6' :
        state === 'action' ? '#10b981' :
        state === 'confirm' ? '#f59e0b' : '#10b981';
    }

    switch (state) {
      case 'idle':
        this.statusLabel.textContent = customLabel || 'LEVI · Ready (Offline)';
        this.statusLabel.className = 'text-xs font-bold text-slate-800 dark:text-slate-100';
        break;

      case 'listening':
        this.statusLabel.textContent = customLabel || 'Listening...';
        this.statusLabel.className = 'text-xs font-bold text-pink-600';
        if (this.waveformCanvas) this.waveformCanvas.style.display = 'block';
        break;

      case 'thinking':
        this.statusLabel.textContent = customLabel || 'Swarm Reasoning...';
        this.statusLabel.className = 'text-xs font-bold text-purple-600';
        if (this.thinkingCanvas) this.thinkingCanvas.style.display = 'block';
        break;

      case 'action':
        this.statusLabel.textContent = customLabel || 'Validated Action';
        this.statusLabel.className = 'text-xs font-bold text-emerald-600';
        if (this.actionBadge) {
          this.actionBadge.style.display = 'inline-flex';
          this.actionBadge.textContent = 'VS Code + Report Ready';
        }
        break;

      case 'confirm':
        this.statusLabel.textContent = customLabel || 'Confirmation Required';
        this.statusLabel.className = 'text-xs font-bold text-amber-600';
        break;
    }
  }

  startAnimationLoop() {
    const render = () => {
      this.wavePhase += 0.08;
      this.thinkingPhase += 0.05;

      if (this.state === 'listening' && this.waveCtx) {
        this.drawWaveform();
      } else if (this.state === 'thinking' && this.thinkCtx) {
        this.drawThinkingParticles();
      }

      this.animFrameId = requestAnimationFrame(render);
    };
    render();
  }

  drawWaveform() {
    const ctx = this.waveCtx;
    const w = this.waveformCanvas.width;
    const h = this.waveformCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const bars = 18;
    const barWidth = 3;
    const spacing = (w - (bars * barWidth)) / (bars - 1);

    for (let i = 0; i < bars; i++) {
      const centerFactor = 1 - Math.abs((i - bars / 2) / (bars / 2));
      const dynamicHeight = Math.sin(this.wavePhase + i * 0.45) * 8 * centerFactor + (10 * centerFactor) + 3;
      const x = i * (barWidth + spacing);
      const y = (h - dynamicHeight) / 2;

      const grad = ctx.createLinearGradient(0, y, 0, y + dynamicHeight);
      grad.addColorStop(0, '#67e8f9');
      grad.addColorStop(1, '#06b6d4');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, dynamicHeight, 2);
      ctx.fill();
    }
  }

  drawThinkingParticles() {
    const ctx = this.thinkCtx;
    const w = this.thinkingCanvas.width;
    const h = this.thinkingCanvas.height;
    ctx.clearRect(0, 0, w, h);

    // Smooth flowing dual sine wave representing local model reasoning
    ctx.lineWidth = 2;
    
    // Wave 1 - Violet
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.85)';
    for (let x = 0; x <= w; x += 2) {
      const y = h / 2 + Math.sin(x * 0.08 + this.thinkingPhase * 2) * 5 * Math.sin(x * 0.02);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Wave 2 - Cyan accent
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    for (let x = 0; x <= w; x += 2) {
      const y = h / 2 + Math.cos(x * 0.07 - this.thinkingPhase * 1.5) * 4 * Math.sin(x * 0.025);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

// Global instance attached to window for cross-module coordination
window.leviNotch = null;
document.addEventListener('DOMContentLoaded', () => {
  window.leviNotch = new LeviNotch();
});
