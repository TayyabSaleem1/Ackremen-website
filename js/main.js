/**
 * main.js - Core UI interactions for ACKREMEN Context-Aware Multi-Agent System
 * Coordinates:
 * - Levi Organic Core Canvas instantiation & state switching
 * - Dynamic Notch reactive synchronization
 * - Floating Prompt Bar interactions
 * - Contact & Feedback form handling
 * - Mascot character blink physics
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialize Levi Organic Avatar Orb Canvas
  let leviOrb = null;
  const canvasEl = document.getElementById('leviOrganicCanvas');
  if (canvasEl && window.LeviOrganicOrb) {
    leviOrb = new LeviOrganicOrb('leviOrganicCanvas', {
      size: 240,
      initialState: 'ready',
      interactive: true
    });
  }

  // 2. State Trigger Pills under Orb
  const stateBtns = document.querySelectorAll('.orb-state-btn');
  stateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const stateKey = btn.getAttribute('data-state');
      if (leviOrb && stateKey) {
        leviOrb.setState(stateKey);
      }
    });
  });

  // 3. Dynamic Notch Synchronization & Download Smooth Scroll
  const notchEl = document.getElementById('dynamicNotch');
  const notchLabel = document.getElementById('notchStatusLabel');
  const notchOrbAvatar = document.getElementById('notchOrbAvatar');

  window.updateNotchState = (stateKey) => {
    if (!notchLabel) return;
    const stateNames = {
      'ready': 'Ready',
      'listening': 'Listening...',
      'thinking': 'Thinking...',
      'processing': 'Processing...',
      'speaking': 'Speaking...',
      'waiting': 'Waiting...',
      'offline': 'Offline'
    };
    const stateColors = {
      'ready': '#287F73',
      'listening': '#3A8ED0',
      'thinking': '#D94FB3',
      'processing': '#D97706',
      'speaking': '#059669',
      'waiting': '#B45309',
      'offline': '#DC2626'
    };
    notchLabel.textContent = stateNames[stateKey] || 'Active';
    notchLabel.style.color = stateColors[stateKey] || '#287F73';

    if (notchOrbAvatar) {
      const color = stateColors[stateKey] || '#287F73';
      notchOrbAvatar.style.borderColor = `${color}B3`;
      notchOrbAvatar.style.boxShadow = `0 0 10px 2px ${color}66`;
    }
  };

  // Smoothly glides user to Download button screen and highlights it
  const scrollToDownloadSection = () => {
    const downloadSec = document.getElementById('download');
    if (downloadSec) {
      downloadSec.scrollIntoView({ behavior: 'smooth' });
      const mainDownloadBtn = document.getElementById('mainDownloadBtn');
      if (mainDownloadBtn) {
        mainDownloadBtn.classList.add('ring-4', 'ring-[#D94FB3]/50', 'scale-105');
        setTimeout(() => {
          mainDownloadBtn.classList.remove('ring-4', 'ring-[#D94FB3]/50', 'scale-105');
        }, 1800);
      }
    }
  };

  if (notchEl) {
    notchEl.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToDownloadSection();
    });
  }

  const headerDownloadBtn = document.getElementById('headerDownloadBtn');
  if (headerDownloadBtn) {
    headerDownloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToDownloadSection();
    });
  }

  // Main Download for Windows Button Interaction
  const mainDownloadBtn = document.getElementById('mainDownloadBtn');
  if (mainDownloadBtn) {
    mainDownloadBtn.addEventListener('click', () => {
      mainDownloadBtn.classList.add('scale-95');
      setTimeout(() => mainDownloadBtn.classList.remove('scale-95'), 180);
      showCuteToast('Opening ACKREMEN for Windows installer... ✓');
      if (leviOrb) {
        leviOrb.setState('speaking');
        setTimeout(() => leviOrb.setState('ready'), 2200);
      }
    });
  }

  // 4. Hero Prompt Bar Interactions & Button Micro-Animations
  const promptInput = document.getElementById('promptInput');
  const sendPromptBtn = document.getElementById('sendPromptBtn');

  if (sendPromptBtn && promptInput) {
    sendPromptBtn.addEventListener('click', () => {
      const val = promptInput.value.trim();
      if (!val) return;

      sendPromptBtn.textContent = 'Thinking...';
      sendPromptBtn.classList.add('scale-95');
      setTimeout(() => sendPromptBtn.classList.remove('scale-95'), 180);
      if (leviOrb) leviOrb.setState('thinking');

      setTimeout(() => {
        sendPromptBtn.textContent = 'Executing...';
        if (leviOrb) leviOrb.setState('processing');

        setTimeout(() => {
          sendPromptBtn.textContent = 'Done ✓';
          if (leviOrb) leviOrb.setState('speaking');

          setTimeout(() => {
            sendPromptBtn.textContent = 'Send';
            if (leviOrb) leviOrb.setState('ready');
          }, 2000);
        }, 1500);
      }, 1200);
    });

    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendPromptBtn.click();
    });
  }

  // Cute interactive handlers for Prompt Bar Chips (Attach & Voice)
  const btnAttach = document.getElementById('btnAttach');
  if (btnAttach) {
    btnAttach.addEventListener('click', () => {
      btnAttach.classList.add('scale-90');
      setTimeout(() => btnAttach.classList.remove('scale-90'), 180);
      showCuteToast('📎 Workspace document "FYP_Report.docx" attached ✓');
      if (promptInput && !promptInput.value.includes('[FYP_Report.docx]')) {
        promptInput.value = promptInput.value.trim() + ' [FYP_Report.docx]';
      }
      if (leviOrb) {
        leviOrb.setState('thinking');
        setTimeout(() => leviOrb.setState('ready'), 1400);
      }
    });
  }

  const btnVoice = document.getElementById('btnVoice');
  const btnVoiceLabel = document.getElementById('btnVoiceLabel');
  let isVoiceActive = false;

  if (btnVoice) {
    btnVoice.addEventListener('click', () => {
      isVoiceActive = !isVoiceActive;
      if (isVoiceActive) {
        btnVoice.classList.add('active');
        if (btnVoiceLabel) btnVoiceLabel.textContent = 'Listening...';
        showCuteToast('🎙 Voice Mode Active — speak naturally to Levi');
        if (leviOrb) leviOrb.setState('listening');

        // Auto-complete speech after 3.2s
        setTimeout(() => {
          if (isVoiceActive) {
            isVoiceActive = false;
            btnVoice.classList.remove('active');
            if (btnVoiceLabel) btnVoiceLabel.textContent = 'Voice';
            if (leviOrb) {
              leviOrb.setState('speaking');
              setTimeout(() => leviOrb.setState('ready'), 2200);
            }
          }
        }, 3200);
      } else {
        btnVoice.classList.remove('active');
        if (btnVoiceLabel) btnVoiceLabel.textContent = 'Voice';
        if (leviOrb) leviOrb.setState('ready');
      }
    });
  }

  // 5. Contact / Feedback Form Handling
  window.handleFeedbackSubmit = () => {
    const nameInput = document.getElementById('feedbackName');
    const textInput = document.getElementById('feedbackText');
    const successMsg = document.getElementById('feedbackSuccessMsg');
    const form = document.getElementById('contactFeedbackForm');

    if (successMsg) {
      successMsg.classList.remove('hidden');
      if (form) form.reset();
      if (leviOrb) {
        leviOrb.setState('speaking');
        setTimeout(() => leviOrb.setState('ready'), 2500);
      }
    }
  };

  // 6. Natural Periodic Blink on Avatars
  setInterval(() => {
    const blobs = document.querySelectorAll('.ackremen-logo-blob, .contact-avatar-blob, .notch-avatar-orb');
    blobs.forEach(b => b.classList.add('blinking'));
    setTimeout(() => {
      blobs.forEach(b => b.classList.remove('blinking'));
    }, 200);
  }, 4800);

  // 7. Interactive Serpentine S-Curve Signal Path & Scroll-Driven Interactions
  const maskPath = document.getElementById('signalMaskPath');
  const signalPacket = document.getElementById('signalPacket');
  const basePath = document.getElementById('serpentineBasePath');
  const milestoneCards = document.querySelectorAll('.milestone-glass-card');

  if (maskPath && basePath && milestoneCards.length > 0) {
    const totalLen = basePath.getTotalLength ? basePath.getTotalLength() : 2483.1;
    // Precise arc-length fractions corresponding to each of the 5 milestones
    const stepFractions = [0.1196, 0.3386, 0.5591, 0.7795, 1.0000];
    const milestoneLens = stepFractions.map(f => f * totalLen);

    maskPath.style.strokeDasharray = `${totalLen} ${totalLen}`;
    maskPath.style.strokeDashoffset = `${totalLen}`;

    let currentSignalLen = 0;
    let targetSignalLen = 0;
    let isManualClicking = false;
    let clickTimeout = null;

    // Helper to evaluate and update visual milestone states
    const updateMilestonesState = (activeIdx) => {
      milestoneCards.forEach((card, idx) => {
        const pill = card.querySelector('.signal-status-pill');
        if (idx === activeIdx) {
          card.classList.add('active-milestone', 'milestone-reached');
          if (pill) {
            pill.textContent = '● Active Signal';
            pill.style.background = '#F8EAF2';
            pill.style.color = '#D94FB3';
            pill.style.borderColor = 'rgba(217, 79, 179, 0.4)';
          }
        } else if (idx < activeIdx) {
          card.classList.remove('active-milestone');
          card.classList.add('milestone-reached');
          if (pill) {
            pill.textContent = '✓ Completed';
            pill.style.background = '#ECFDF5';
            pill.style.color = '#10B981';
            pill.style.borderColor = 'rgba(16, 185, 129, 0.35)';
          }
        } else {
          card.classList.remove('active-milestone', 'milestone-reached');
          if (pill) {
            pill.textContent = `Step 0${idx + 1}`;
            pill.style.background = '#F2EEF4';
            pill.style.color = '#625D60';
            pill.style.borderColor = 'rgba(23, 21, 23, 0.12)';
          }
        }
      });
    };

    // Calculate signal target and dynamic box sizes directly based on scroll position
    const handleScrollUpdate = () => {
      if (isManualClicking) return;

      const viewportCenter = window.innerHeight * 0.50; // Optimal reading focus
      const cardCenters = [];
      let closestIdx = 0;
      let minDistance = Infinity;

      milestoneCards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        cardCenters.push(centerY);

        const dist = Math.abs(centerY - viewportCenter);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }

        // Box size increases with scrolling:
        // As a milestone box scrolls toward the viewport focus, its scale expands up to 1.085
        const influenceRange = window.innerHeight * 0.42;
        let scale = 1.0;
        if (dist < influenceRange) {
          const factor = Math.cos((dist / influenceRange) * (Math.PI / 2));
          scale = 1.0 + 0.082 * factor; // Smoothly increases up to 1.082
        }
        card.style.transform = `scale(${scale.toFixed(4)})`;
      });

      // Update active and completed classes
      updateMilestonesState(closestIdx);

      // Compute target signal position along the serpentine curve
      const firstCenter = cardCenters[0];
      const lastCenter = cardCenters[cardCenters.length - 1];

      if (viewportCenter <= firstCenter - 180) {
        // Above milestone 1
        targetSignalLen = 0;
      } else if (viewportCenter <= firstCenter) {
        // Approaching milestone 1
        const t = Math.max(0, (viewportCenter - (firstCenter - 180)) / 180);
        targetSignalLen = milestoneLens[0] * t;
      } else if (viewportCenter >= lastCenter) {
        // Reached or past milestone 5
        targetSignalLen = totalLen;
      } else {
        // Between milestones: interpolate smoothly along curve
        for (let i = 0; i < cardCenters.length - 1; i++) {
          const y1 = cardCenters[i];
          const y2 = cardCenters[i + 1];
          if (viewportCenter >= y1 && viewportCenter <= y2) {
            const t = (viewportCenter - y1) / (y2 - y1);
            targetSignalLen = milestoneLens[i] + t * (milestoneLens[i + 1] - milestoneLens[i]);
            break;
          }
        }
      }
    };

    // Smooth, slow interpolation loop for silky-soft signal travel
    const renderSignalLoop = () => {
      const delta = targetSignalLen - currentSignalLen;
      if (Math.abs(delta) > 0.15) {
        // Gentle lerp factor (0.052) ensures slow, fluid, cinematic travel
        currentSignalLen += delta * 0.052;
        maskPath.style.strokeDashoffset = `${totalLen - currentSignalLen}`;
        if (signalPacket && basePath.getPointAtLength) {
          const pt = basePath.getPointAtLength(currentSignalLen);
          signalPacket.setAttribute('cx', pt.x);
          signalPacket.setAttribute('cy', pt.y);
        }
      }
      requestAnimationFrame(renderSignalLoop);
    };
    requestAnimationFrame(renderSignalLoop);

    // Manual click on milestone: smoothly scrolls to center the card
    window.activateMilestone = (stepNum) => {
      const stepIdx = Math.max(0, Math.min(milestoneCards.length - 1, (parseInt(stepNum, 10) || 1) - 1));
      const targetCard = milestoneCards[stepIdx];
      if (!targetCard) return;

      isManualClicking = true;
      if (clickTimeout) clearTimeout(clickTimeout);

      targetSignalLen = milestoneLens[stepIdx];
      updateMilestonesState(stepIdx);

      const rect = targetCard.getBoundingClientRect();
      const targetScrollY = rect.top + window.pageYOffset - (window.innerHeight * 0.50) + (rect.height / 2);
      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });

      clickTimeout = setTimeout(() => {
        isManualClicking = false;
        handleScrollUpdate();
      }, 700);
    };

    // Card click listeners
    milestoneCards.forEach((card) => {
      card.addEventListener('click', () => {
        const step = card.getAttribute('data-milestone');
        window.activateMilestone(step);
      });
    });

    // Window scroll and resize listeners with passive optimization
    window.addEventListener('scroll', handleScrollUpdate, { passive: true });
    window.addEventListener('resize', handleScrollUpdate, { passive: true });

    // Initial trigger
    handleScrollUpdate();
  }

  // 8. User Flow Tree: Working Demo & Final Node Interactions (Image 3 & 4)
  const flowWorkingDemoNode = document.getElementById('flowWorkingDemoNode');
  if (flowWorkingDemoNode) {
    flowWorkingDemoNode.addEventListener('click', () => {
      flowWorkingDemoNode.classList.add('scale-108');
      setTimeout(() => flowWorkingDemoNode.classList.remove('scale-108'), 350);
      const overviewSec = document.getElementById('overview');
      if (overviewSec) {
        overviewSec.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          if (promptInput) {
            promptInput.focus();
            promptInput.classList.add('ring-2', 'ring-[#D94FB3]');
            setTimeout(() => promptInput.classList.remove('ring-2', 'ring-[#D94FB3]'), 1600);
          }
          if (leviOrb) {
            leviOrb.setState('speaking');
            setTimeout(() => leviOrb.setState('ready'), 2400);
          }
        }, 550);
      }
      showCuteToast('⚡ ACKREMEN Live Working Demo Initialized!');
    });
  }

  const flowFinalNode = document.getElementById('flowFinalNode');
  if (flowFinalNode) {
    flowFinalNode.addEventListener('click', () => {
      flowFinalNode.classList.add('scale-108');
      setTimeout(() => flowFinalNode.classList.remove('scale-108'), 350);
      showCuteToast('ACKREMEN session state preserved safely offline ✓');
    });
  }

  // Cute Floating Toast Notification System
  function showCuteToast(msg) {
    const existing = document.getElementById('cuteToastNotification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'cuteToastNotification';
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-[#171517]/95 backdrop-blur-md text-white text-xs font-semibold shadow-2xl z-50 flex items-center gap-2 border border-white/20 transition-all duration-300 pointer-events-none';
    toast.style.transform = 'translate(-50%, 20px) scale(0.9)';
    toast.style.opacity = '0';
    toast.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#D94FB3] animate-ping shrink-0"></span><span>${msg}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translate(-50%, 0) scale(1)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translate(-50%, 15px) scale(0.92)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 350);
    }, 2500);
  }

  window.showCuteToast = showCuteToast;

});
