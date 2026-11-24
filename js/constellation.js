/**
 * constellation.js - Interactive Memory Constellation Canvas
 * Visualizes the 5 memory systems (Episodic, Semantic, Procedural, Temporal, Relational).
 * Allows users to inspect why Levi remembers an item, correct it, or forget it.
 */

class MemoryConstellation {
  constructor() {
    this.canvas = document.getElementById('constellationCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.container = this.canvas.parentElement;

    this.nodes = [];
    this.connections = [];
    this.hoveredNode = null;
    this.selectedNode = null;
    this.mouse = { x: -1000, y: -1000 };
    this.animFrameId = null;

    // Inspection DOM elements
    this.inspectorEl = document.getElementById('memoryInspectorCard');
    this.inspectorTitle = document.getElementById('inspectorTitle');
    this.inspectorType = document.getElementById('inspectorType');
    this.inspectorWhy = document.getElementById('inspectorWhy');
    this.inspectorEntities = document.getElementById('inspectorEntities');
    this.inspectorConfidence = document.getElementById('inspectorConfidence');
    this.forgetBtn = document.getElementById('inspectorForgetBtn');
    this.correctBtn = document.getElementById('inspectorCorrectBtn');

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.setupNodes();
    this.setupEvents();
    this.animate();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  setupNodes() {
    const w = this.width || 800;
    const h = this.height || 500;

    // Predefined memory points reflecting real assistant context
    const data = [
      {
        id: 'pref-accuracy',
        title: 'User Preference: Maximum Accuracy',
        category: 'Semantic Memory',
        color: '#8b5cf6', // Violet
        x: w * 0.48,
        y: h * 0.35,
        radius: 9,
        why: 'Explicitly requested during multi-turn conversation: "remember that accuracy is my priority". Stored in persistent semantic store.',
        entities: ['preference:accuracy', 'confidence:high', 'scope:document_summary'],
        confidence: '99.4%',
        connections: ['doc-report', 'conv-sprint4']
      },
      {
        id: 'doc-report',
        title: 'FYP_Final_Report.docx',
        category: 'Relational Memory',
        color: '#06b6d4', // Cyan
        x: w * 0.32,
        y: h * 0.48,
        radius: 11,
        why: 'Frequently opened alongside VS Code during evening sessions. Linked to supervisor Dr. Aris and research documentation.',
        entities: ['file:docx', 'path:local/docs', 'last_edit:yesterday'],
        confidence: '98.1%',
        connections: ['person-supervisor', 'routine-study', 'app-vscode']
      },
      {
        id: 'app-vscode',
        title: 'Visual Studio Code',
        category: 'Relational Memory',
        color: '#38bdf8', // Light Cyan
        x: w * 0.22,
        y: h * 0.65,
        radius: 10,
        why: 'Primary target application in workspace environment automation. Linked to Python 3.10 and ackremen-core project.',
        entities: ['process:Code.exe', 'workspace:ackremen-core', 'state:verified'],
        confidence: '100%',
        connections: ['routine-study', 'doc-report']
      },
      {
        id: 'routine-study',
        title: 'Routine: Evening Research Session',
        category: 'Procedural Memory',
        color: '#10b981', // Mint
        x: w * 0.38,
        y: h * 0.75,
        radius: 12,
        why: 'Learned workflow triggered between 8:00 PM and 11:30 PM. Restores split-screen layout with terminal and project report.',
        entities: ['trigger:voice_or_time', 'action:split_layout', 'env:dev'],
        confidence: '96.8%',
        connections: ['temp-evening', 'app-vscode', 'doc-report']
      },
      {
        id: 'temp-evening',
        title: 'Temporal Window: 8:00 PM – 11:30 PM',
        category: 'Temporal Memory',
        color: '#f59e0b', // Amber
        x: w * 0.58,
        y: h * 0.82,
        radius: 8,
        why: 'Recurring temporal cluster observed across 14 consecutive days without cloud telemetry.',
        entities: ['temporal:weekday_evenings', 'activity:deep_work'],
        confidence: '94.2%',
        connections: ['routine-study', 'topic-edge']
      },
      {
        id: 'person-supervisor',
        title: 'Dr. Aris Thorne (Project Supervisor)',
        category: 'Relational Memory',
        color: '#a78bfa', // Light violet
        x: w * 0.18,
        y: h * 0.32,
        radius: 8,
        why: 'Referenced as recipient for project report summaries and demonstration feedback.',
        entities: ['role:supervisor', 'department:computing', 'context:review'],
        confidence: '97.5%',
        connections: ['doc-report']
      },
      {
        id: 'conv-sprint4',
        title: 'Interaction: Sprint 4 Demo Verification',
        category: 'Episodic Memory',
        color: '#c084fc', // Violet
        x: w * 0.68,
        y: h * 0.28,
        radius: 10,
        why: 'Previous multi-turn dialogue where Levi successfully verified 60/60 isolated context-memory scenarios.',
        entities: ['timestamp:2026-11-08', 'turn_count:6', 'status:accepted'],
        confidence: '99.0%',
        connections: ['pref-accuracy', 'topic-edge']
      },
      {
        id: 'topic-edge',
        title: 'Topic: Local Qwen & DistilBERT Intent',
        category: 'Semantic Memory',
        color: '#8b5cf6', // Violet
        x: w * 0.78,
        y: h * 0.52,
        radius: 9,
        why: 'Core model architecture referenced in codebase context and local intent classification benchmarks.',
        entities: ['model:qwen-local', 'stt:hybrid-neural', 'privacy:airgapped'],
        confidence: '98.7%',
        connections: ['conv-sprint4', 'temp-evening']
      }
    ];

    this.nodes = data.map(d => ({
      ...d,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      originX: d.x,
      originY: d.y,
      pulse: Math.random() * Math.PI
    }));

    // Select the first node by default to show rich context immediately
    this.selectNode(this.nodes[0]);
  }

  setupEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;

      let found = null;
      for (const node of this.nodes) {
        const dx = this.mouse.x - node.x;
        const dy = this.mouse.y - node.y;
        if (Math.hypot(dx, dy) < node.radius + 8) {
          found = node;
          break;
        }
      }
      this.hoveredNode = found;
      this.canvas.style.cursor = found ? 'pointer' : 'default';
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
      this.hoveredNode = null;
    });

    this.canvas.addEventListener('click', () => {
      if (this.hoveredNode) {
        this.selectNode(this.hoveredNode);
        if (window.leviNotch) {
          window.leviNotch.setState('thinking', `Inspecting: ${this.hoveredNode.title}`);
          setTimeout(() => window.leviNotch.setState('idle'), 2500);
        }
      }
    });

    // Inspector buttons
    if (this.forgetBtn) {
      this.forgetBtn.addEventListener('click', () => {
        if (!this.selectedNode) return;
        this.forgetCurrentNode();
      });
    }

    if (this.correctBtn) {
      this.correctBtn.addEventListener('click', () => {
        if (!this.selectedNode) return;
        const newTitle = prompt('Enter updated preference/fact for Levi:', this.selectedNode.title);
        if (newTitle && newTitle.trim()) {
          this.selectedNode.title = newTitle.trim();
          this.selectNode(this.selectedNode);
          if (window.leviNotch) {
            window.leviNotch.setState('action', 'Memory Corrected');
            setTimeout(() => window.leviNotch.setState('idle'), 2000);
          }
        }
      });
    }
  }

  selectNode(node) {
    this.selectedNode = node;
    if (!this.inspectorEl) return;

    if (this.inspectorTitle) this.inspectorTitle.textContent = node.title;
    if (this.inspectorType) {
      this.inspectorType.textContent = node.category;
      this.inspectorType.style.borderColor = node.color;
      this.inspectorType.style.color = node.color;
    }
    if (this.inspectorWhy) this.inspectorWhy.textContent = node.why;
    if (this.inspectorConfidence) this.inspectorConfidence.textContent = node.confidence;

    if (this.inspectorEntities) {
      this.inspectorEntities.innerHTML = '';
      node.entities.forEach(ent => {
        const span = document.createElement('span');
        span.className = 'code-chip text-xs';
        span.textContent = ent;
        this.inspectorEntities.appendChild(span);
      });
    }
  }

  forgetCurrentNode() {
    if (!this.selectedNode) return;
    const removedId = this.selectedNode.id;
    const title = this.selectedNode.title;

    // Visual feedback
    this.nodes = this.nodes.filter(n => n.id !== removedId);
    
    // Clean connections
    this.nodes.forEach(n => {
      n.connections = n.connections.filter(cId => cId !== removedId);
    });

    if (window.leviNotch) {
      window.leviNotch.setState('action', `Memory purged: ${title.slice(0, 20)}...`);
      setTimeout(() => window.leviNotch.setState('idle'), 2500);
    }

    if (this.nodes.length > 0) {
      this.selectNode(this.nodes[0]);
    } else {
      if (this.inspectorTitle) this.inspectorTitle.textContent = 'All local memories cleared';
      if (this.inspectorWhy) this.inspectorWhy.textContent = 'ACKREMEN stores zero residual trace when memories are purged.';
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update positions gently within radius of origin
    this.nodes.forEach(node => {
      node.pulse += 0.03;
      node.x += node.vx;
      node.y += node.vy;

      // Soft spring back to origin
      const distFromOrigin = Math.hypot(node.x - node.originX, node.y - node.originY);
      if (distFromOrigin > 25) {
        node.vx *= -1;
        node.vy *= -1;
      }

      // Mouse repulsion
      const dMouse = Math.hypot(node.x - this.mouse.x, node.y - this.mouse.y);
      if (dMouse < 90) {
        const angle = Math.atan2(node.y - this.mouse.y, node.x - this.mouse.x);
        node.x += Math.cos(angle) * 1.5;
        node.y += Math.sin(angle) * 1.5;
      }
    });

    // Draw connection lines
    this.nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const target = this.nodes.find(n => n.id === targetId);
        if (!target) return;

        const isHovered = (this.hoveredNode && (this.hoveredNode.id === node.id || this.hoveredNode.id === target.id));
        const isSelected = (this.selectedNode && (this.selectedNode.id === node.id || this.selectedNode.id === target.id));

        this.ctx.beginPath();
        this.ctx.moveTo(node.x, node.y);
        this.ctx.lineTo(target.x, target.y);

        const isDark = document.documentElement.classList.contains('dark');
        if (isSelected) {
          this.ctx.strokeStyle = isDark ? 'rgba(244, 63, 94, 0.85)' : 'rgba(225, 29, 72, 0.75)';
          this.ctx.lineWidth = 2.0;
        } else if (isHovered) {
          this.ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.6)' : 'rgba(2, 132, 199, 0.6)';
          this.ctx.lineWidth = 1.5;
        } else {
          this.ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.12)';
          this.ctx.lineWidth = 1.0;
        }
        this.ctx.stroke();
      });
    });

    // Draw Nodes
    const isDark = document.documentElement.classList.contains('dark');
    this.nodes.forEach(node => {
      const isHovered = (this.hoveredNode && this.hoveredNode.id === node.id);
      const isSelected = (this.selectedNode && this.selectedNode.id === node.id);

      // Outer glow if active
      if (isSelected || isHovered) {
        const glowRadius = node.radius * 2.5;
        const grad = this.ctx.createRadialGradient(node.x, node.y, node.radius * 0.5, node.x, node.y, glowRadius);
        grad.addColorStop(0, node.color + '66');
        grad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Core Node circle
      this.ctx.beginPath();
      const currentRadius = isSelected ? node.radius + 2 : node.radius;
      this.ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = node.color;
      this.ctx.fill();
      this.ctx.lineWidth = isSelected ? 2.5 : 1.5;
      this.ctx.strokeStyle = isDark ? '#ffffff' : '#ffffff';
      this.ctx.stroke();

      // Label with dark/light adaptive color
      this.ctx.font = isSelected ? '700 11px "Plus Jakarta Sans", sans-serif' : '600 10px "Plus Jakarta Sans", sans-serif';
      if (isDark) {
        this.ctx.fillStyle = isSelected ? '#ffffff' : (isHovered ? '#f1f5f9' : 'rgba(226, 232, 240, 0.7)');
      } else {
        this.ctx.fillStyle = isSelected ? '#0f172a' : (isHovered ? '#1e293b' : 'rgba(71, 85, 105, 0.85)');
      }
      this.ctx.textAlign = 'center';
      this.ctx.fillText(node.title, node.x, node.y + node.radius + 15);
    });

    this.animFrameId = requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.memoryConstellation = new MemoryConstellation();
});
