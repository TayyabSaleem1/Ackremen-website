/**
 * privacy.js - Handles the interactive Memory Vault privacy controls:
 * 1. View what Levi remembers
 * 2. Correct inaccurate memories
 * 3. Forget selected information
 */

class PrivacyManager {
  constructor() {
    this.modal = document.getElementById('memoryVaultModal');
    this.openBtn = document.getElementById('privacyViewMemoriesBtn');
    this.correctPromptBtn = document.getElementById('privacyCorrectBtn');
    this.forgetAllBtn = document.getElementById('privacyForgetBtn');
    this.closeBtn = document.getElementById('closeMemoryVaultBtn');
    this.searchBar = document.getElementById('vaultSearchInput');
    this.vaultList = document.getElementById('vaultMemoriesList');
    this.categoryFilter = document.getElementById('vaultCategoryFilter');
    this.itemCountBadge = document.getElementById('vaultItemCount');

    // Local in-memory initial state
    this.memories = [
      {
        id: 'mem-1',
        title: 'User Preference: Summaries must prioritize accuracy',
        category: 'Semantic',
        date: 'Today, 17:20',
        content: 'Configured accuracy threshold = 0.98 for all document summarization workflows.',
        color: '#8b5cf6'
      },
      {
        id: 'mem-2',
        title: 'Workspace Association: FYP_Final_Report.docx',
        category: 'Relational',
        date: 'Yesterday, 21:15',
        content: 'Associated with Visual Studio Code (ackremen-core) and supervisor Dr. Aris Thorne.',
        color: '#06b6d4'
      },
      {
        id: 'mem-3',
        title: 'Routine: Evening Research Session Layout',
        category: 'Procedural',
        date: '3 days ago',
        content: 'Learned multi-window split: Terminal on right (40%), VS Code on left (60%).',
        color: '#10b981'
      },
      {
        id: 'mem-4',
        title: 'Temporal Pattern: Weekday Evenings (8:00 PM - 11:30 PM)',
        category: 'Temporal',
        date: '5 days ago',
        content: 'Autonomous activation of quiet focus profile and background resource optimization.',
        color: '#f59e0b'
      },
      {
        id: 'mem-5',
        title: 'Episodic Record: Sprint 4 Regression Suite Passed',
        category: 'Episodic',
        date: '6 days ago',
        content: 'User accepted 12/12 held-out contextual conversations and 567 regression unit tests.',
        color: '#c084fc'
      }
    ];

    this.init();
  }

  init() {
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.openVault());
    }

    if (this.correctPromptBtn) {
      this.correctPromptBtn.addEventListener('click', () => {
        this.openVault();
        setTimeout(() => {
          const firstEditable = document.querySelector('.edit-memory-btn');
          if (firstEditable) firstEditable.click();
        }, 300);
      });
    }

    if (this.forgetAllBtn) {
      this.forgetAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to forget all temporary contextual memories? Stored offline SQLite memory files will be safely cleared.')) {
          this.memories = [];
          this.renderList();
          if (window.leviNotch) {
            window.leviNotch.setState('action', 'All Context Purged');
            setTimeout(() => window.leviNotch.setState('idle'), 2500);
          }
        }
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeVault());
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeVault();
      });
    }

    if (this.searchBar) {
      this.searchBar.addEventListener('input', () => this.renderList());
    }

    if (this.categoryFilter) {
      this.categoryFilter.addEventListener('change', () => this.renderList());
    }

    this.renderList();
  }

  openVault() {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    this.renderList();
    if (window.leviNotch) {
      window.leviNotch.setState('thinking', 'Local Memory Vault Opened');
      setTimeout(() => window.leviNotch.setState('idle'), 2000);
    }
  }

  closeVault() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  renderList() {
    if (!this.vaultList) return;
    const query = this.searchBar ? this.searchBar.value.toLowerCase() : '';
    const cat = this.categoryFilter ? this.categoryFilter.value : 'all';

    const filtered = this.memories.filter(m => {
      const matchesQ = m.title.toLowerCase().includes(query) || m.content.toLowerCase().includes(query);
      const matchesCat = cat === 'all' || m.category.toLowerCase() === cat.toLowerCase();
      return matchesQ && matchesCat;
    });

    if (this.itemCountBadge) {
      this.itemCountBadge.textContent = `${filtered.length} stored record${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      this.vaultList.innerHTML = `
        <div class="text-center py-12 text-slate-400">
          <svg class="w-12 h-12 mx-auto mb-3 text-slate-500 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <div class="text-sm font-medium">No matching memories in local SQLite vault.</div>
          <div class="text-xs text-slate-500 mt-1">ACKREMEN stores zero residual trace when records are removed.</div>
        </div>
      `;
      return;
    }

    this.vaultList.innerHTML = '';
    filtered.forEach(m => {
      const card = document.createElement('div');
      card.className = 'glass-panel p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200 dark:border-slate-700/50 hover:border-pink-300 transition-all';
      card.innerHTML = `
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-xs px-2.5 py-0.5 rounded-full font-bold font-mono" style="background: ${m.color}22; color: ${m.color}; border: 1px solid ${m.color}44;">
              ${m.category}
            </span>
            <span class="text-xs text-slate-400">${m.date}</span>
          </div>
          <div class="text-sm font-bold text-slate-900 dark:text-slate-100">${m.title}</div>
          <div class="text-xs text-slate-600 dark:text-slate-300">${m.content}</div>
        </div>
        <div class="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
          <button class="edit-memory-btn text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-pink-600 font-bold transition-all" data-id="${m.id}">
            Edit
          </button>
          <button class="delete-memory-btn text-xs px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 font-bold transition-all" data-id="${m.id}">
            Forget
          </button>
        </div>
      `;
      // Hook up actions
      const editBtn = card.querySelector('.edit-memory-btn');
      editBtn.addEventListener('click', () => {
        const newContent = prompt('Edit memory details for Levi:', m.content);
        if (newContent && newContent.trim()) {
          m.content = newContent.trim();
          this.renderList();
          if (window.leviNotch) {
            window.leviNotch.setState('action', 'Memory Corrected');
            setTimeout(() => window.leviNotch.setState('idle'), 2000);
          }
        }
      });

      const delBtn = card.querySelector('.delete-memory-btn');
      delBtn.addEventListener('click', () => {
        this.memories = this.memories.filter(item => item.id !== m.id);
        this.renderList();
        if (window.leviNotch) {
          window.leviNotch.setState('action', 'Memory Forgotten');
          setTimeout(() => window.leviNotch.setState('idle'), 2000);
        }
      });

      this.vaultList.appendChild(card);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.privacyManager = new PrivacyManager();
});
