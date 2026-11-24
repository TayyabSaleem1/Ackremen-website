/**
 * pipeline.js - Coordinates the interactive multi-turn conversation and 5-stage pipeline animation:
 * Voice → Understanding → Context → Safe action → Memory
 */

class InteractivePipeline {
  constructor() {
    this.steps = [
      {
        turn: 'user',
        speaker: 'You',
        text: 'Levi, open VS Code and my project report.',
        activeStage: 'voice',
        stageTitle: 'Voice Input Detected',
        stageDesc: 'Hybrid offline STT converts speech stream to text token sequence.',
        notchState: 'listening',
        notchMsg: 'Listening: "Levi, open VS Code..."'
      },
      {
        turn: 'system',
        speaker: 'ACKREMEN Pipeline',
        text: 'Intent: [launch_environment] | Slots: [app: "vscode", file: "project_report"]',
        activeStage: 'understanding',
        stageTitle: 'Intent & Entity Extraction',
        stageDesc: 'DistilBERT identifies environment setup intent without cloud roundtrip.',
        notchState: 'thinking',
        notchMsg: 'Understanding: [launch_environment]'
      },
      {
        turn: 'system',
        speaker: 'ACKREMEN Pipeline',
        text: 'Resolving context: Locating "FYP_Final_Report.docx" & active Python environment...',
        activeStage: 'context',
        stageTitle: 'Context Resolution',
        stageDesc: 'Relational memory links "project report" to active research directory.',
        notchState: 'thinking',
        notchMsg: 'Context: Linked to FYP_Final_Report.docx'
      },
      {
        turn: 'system',
        speaker: 'ACKREMEN Pipeline',
        text: 'Safe Action Validated: Launching Code.exe with parameter --file FYP_Final_Report.docx',
        activeStage: 'safe-action',
        stageTitle: 'Validated Computer Action',
        stageDesc: 'Permission & safety boundary checks process target against destructive heuristics.',
        notchState: 'action',
        notchMsg: 'Validated Action: Launched VS Code'
      },
      {
        turn: 'assistant',
        speaker: 'Levi',
        text: 'Your project environment is ready.',
        activeStage: 'safe-action',
        stageTitle: 'Environment Synchronized',
        stageDesc: 'Windows workspace restored. Ready for subsequent contextual queries.',
        notchState: 'idle',
        notchMsg: 'Levi · Ready (Offline)'
      },
      {
        turn: 'user',
        speaker: 'You',
        text: 'Summarize the report and remember that accuracy is my priority.',
        activeStage: 'voice',
        stageTitle: 'Follow-up Voice Query',
        stageDesc: 'User continues multi-turn session with an explicit memory directive.',
        notchState: 'listening',
        notchMsg: 'Listening: "Summarize the report..."'
      },
      {
        turn: 'system',
        speaker: 'ACKREMEN Pipeline',
        text: 'Understanding multi-turn intent: [summarize_active_doc] + [store_preference: accuracy]',
        activeStage: 'understanding',
        stageTitle: 'Multi-turn Parsing',
        stageDesc: 'Identifies document summary request and long-term user preference slot.',
        notchState: 'thinking',
        notchMsg: 'Reasoning: Local Qwen Context'
      },
      {
        turn: 'system',
        speaker: 'ACKREMEN Pipeline',
        text: 'Updating Semantic Memory: { key: "preference:summary_metric", value: "accuracy", weight: 0.99 }',
        activeStage: 'memory',
        stageTitle: 'Structured Memory Commit',
        stageDesc: 'Committed to local semantic store. Separated from temporary chat history.',
        notchState: 'thinking',
        notchMsg: 'Memory: Saved accuracy preference'
      },
      {
        turn: 'assistant',
        speaker: 'Levi',
        text: 'I’ll keep that preference in mind for future project recommendations.',
        activeStage: 'memory',
        stageTitle: 'Memory Acknowledged',
        stageDesc: 'Contextual preference stored in local SQLite vector index with full user auditability.',
        notchState: 'idle',
        notchMsg: 'Levi · Preference Stored'
      }
    ];

    this.currentStepIdx = 0;
    this.isPlaying = false;
    this.playTimer = null;

    // DOM References
    this.chatContainer = document.getElementById('pipelineChatMessages');
    this.playBtn = document.getElementById('pipelinePlayBtn');
    this.stepBtn = document.getElementById('pipelineStepBtn');
    this.resetBtn = document.getElementById('pipelineResetBtn');
    this.stageInfoTitle = document.getElementById('pipelineStageTitle');
    this.stageInfoDesc = document.getElementById('pipelineStageDesc');

    this.init();
  }

  init() {
    if (!this.chatContainer) return;

    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }
    if (this.stepBtn) {
      this.stepBtn.addEventListener('click', () => this.nextStep());
    }
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.reset());
    }

    this.renderCurrentState();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    if (this.playBtn) {
      this.playBtn.innerHTML = `
        <svg class="w-4 h-4 inline-block mr-1 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg> Pause
      `;
    }

    const run = () => {
      if (!this.isPlaying) return;
      if (this.currentStepIdx < this.steps.length - 1) {
        this.nextStep();
        this.playTimer = setTimeout(run, 2400);
      } else {
        this.pause();
      }
    };
    run();
  }

  pause() {
    this.isPlaying = false;
    clearTimeout(this.playTimer);
    if (this.playBtn) {
      this.playBtn.innerHTML = `
        <svg class="w-4 h-4 inline-block mr-1 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg> Play Demo Flow
      `;
    }
  }

  nextStep() {
    if (this.currentStepIdx < this.steps.length - 1) {
      this.currentStepIdx++;
    } else {
      this.currentStepIdx = 0;
    }
    this.renderCurrentState();
  }

  reset() {
    this.pause();
    this.currentStepIdx = 0;
    this.renderCurrentState();
    if (window.leviNotch) {
      window.leviNotch.setState('idle');
    }
  }

  renderCurrentState() {
    const cur = this.steps[this.currentStepIdx];

    // Highlight pipeline node
    const stageIds = ['stage-voice', 'stage-understanding', 'stage-context', 'stage-safe-action', 'stage-memory'];
    stageIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('border-[#E8438B]', 'bg-[#FFF0F6]');
      }
    });

    const activeEl = document.getElementById(`stage-${cur.activeStage}`);
    if (activeEl) {
      activeEl.classList.add('border-[#E8438B]', 'bg-[#FFF0F6]');
    }

    // Update Stage description
    if (this.stageInfoTitle) this.stageInfoTitle.textContent = cur.stageTitle;
    if (this.stageInfoDesc) this.stageInfoDesc.textContent = cur.stageDesc;

    // Render Chat Bubbles up to currentStepIdx
    if (this.chatContainer) {
      this.chatContainer.innerHTML = '';
      for (let i = 0; i <= this.currentStepIdx; i++) {
        const item = this.steps[i];
        if (item.turn === 'system') continue; // keep main chat conversation clean

        const msgDiv = document.createElement('div');
        msgDiv.className = `flex gap-2.5 mb-3 transition-all duration-300 items-end ${item.turn === 'user' ? 'justify-end' : 'justify-start'}`;

        if (item.turn === 'user') {
          msgDiv.innerHTML = `
            <div class="chat-bubble-user-pink text-left">
              <div class="text-[10px] font-bold text-white/80 mb-0.5">You</div>
              <div>${item.text}</div>
            </div>
          `;
        } else {
          msgDiv.innerHTML = `
            <div class="levi-avatar-blob shrink-0" style="width: 26px; height: 26px; border-radius: 30%;">
              <div class="levi-eyes-container" style="gap: 3px;">
                <div class="levi-eye-pill" style="width: 3px; height: 6px;"></div>
                <div class="levi-eye-pill" style="width: 3px; height: 6px;"></div>
              </div>
            </div>
            <div class="chat-bubble-assistant-white text-left">
              <div class="flex items-center gap-1.5 text-[10px] font-bold text-[#111317] mb-0.5">
                <span>LEVI</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-[#ECFDF5] border border-[#A7F3D0] rounded text-[#10B981] font-mono">Offline</span>
              </div>
              <div class="text-xs text-[#111317]">${item.text}</div>
            </div>
          `;
        }
        this.chatContainer.appendChild(msgDiv);
      }
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    // Trigger Levi Notch update
    if (window.leviNotch) {
      window.leviNotch.setState(cur.notchState, cur.notchMsg);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.interactivePipeline = new InteractivePipeline();
});
