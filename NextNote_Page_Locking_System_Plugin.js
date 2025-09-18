/**
 * NextNote Page Locking System Plugin
 * Lock/unlock individual pages to prevent accidental edits with visual indicators
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Page Locking System',
  version: '1.0.0',
  description: 'Lock/unlock individual pages to prevent accidental edits with visual indicators',
  
  onLoad(app) {
    this.lockedPages = JSON.parse(localStorage.getItem('nextnote_locked_pages') || '{}');
    this.setupPageLockingUI(app);
    this.initializeLockingComponents(app);
    this.bindLockingEvents(app);
    this.applyExistingLocks(app);
  },

  setupPageLockingUI(app) {
    const panel = app.createPanel('page-locking-system', 'Page Security');
    
    // Header with security theme
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #2c1810, #8b4513, #daa520, #ffd700);
      border-radius: 12px;
      color: white;
      position: relative;
      overflow: hidden;
    `;

    // Floating lock icons
    const lockIcons = ['🔒', '🔐', '🗝️', '🛡️', '🔑', '⚡'];
    lockIcons.forEach((icon, index) => {
      const floatingIcon = document.createElement('div');
      floatingIcon.style.cssText = `
        position: absolute;
        font-size: 1.3em;
        opacity: 0.2;
        animation: floatLock ${4 + index}s ease-in-out infinite;
        animation-delay: ${index * 0.4}s;
        pointer-events: none;
      `;
      floatingIcon.style.left = `${8 + index * 14}%`;
      floatingIcon.style.top = `${15 + (index % 2) * 50}%`;
      floatingIcon.textContent = icon;
      header.appendChild(floatingIcon);
    });

    const title = document.createElement('h3');
    title.style.cssText = `
      margin: 0; 
      color: white; 
      display: flex; 
      align-items: center; 
      gap: 10px;
      z-index: 1;
      position: relative;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    `;
    title.innerHTML = '🔒 Page Security';

    const lockControls = document.createElement('div');
    lockControls.style.cssText = `
      display: flex;
      gap: 10px;
      z-index: 1;
      position: relative;
    `;

    const lockAllBtn = document.createElement('button');
    lockAllBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    lockAllBtn.textContent = '🔒 Lock All';
    lockAllBtn.addEventListener('click', () => this.lockAllPages(app));

    const unlockAllBtn = document.createElement('button');
    unlockAllBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    unlockAllBtn.textContent = '🔓 Unlock All';
    unlockAllBtn.addEventListener('click', () => this.unlockAllPages(app));

    lockControls.appendChild(lockAllBtn);
    lockControls.appendChild(unlockAllBtn);

    header.appendChild(title);
    header.appendChild(lockControls);
    panel.appendChild(header);

    // Lock Status Dashboard
    const dashboard = document.createElement('div');
    dashboard.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    `;

    dashboard.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text); display: flex; align-items: center; gap: 8px;">
        🛡️ Security Dashboard
      </h4>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
        <div style="
          background: var(--hermes-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 6px;
          padding: 15px;
          text-align: center;
        ">
          <div style="font-size: 2em; margin-bottom: 5px;">🔒</div>
          <div style="font-weight: bold; color: var(--hermes-text);" id="locked-count">0</div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Locked Pages</div>
        </div>
        
        <div style="
          background: var(--hermes-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 6px;
          padding: 15px;
          text-align: center;
        ">
          <div style="font-size: 2em; margin-bottom: 5px;">🔓</div>
          <div style="font-weight: bold; color: var(--hermes-text);" id="unlocked-count">0</div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Unlocked Pages</div>
        </div>
        
        <div style="
          background: var(--hermes-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 6px;
          padding: 15px;
          text-align: center;
        ">
          <div style="font-size: 2em; margin-bottom: 5px;">📊</div>
          <div style="font-weight: bold; color: var(--hermes-text);" id="total-pages">0</div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Total Pages</div>
        </div>
        
        <div style="
          background: var(--hermes-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 6px;
          padding: 15px;
          text-align: center;
        ">
          <div style="font-size: 2em; margin-bottom: 5px;">🛡️</div>
          <div style="font-weight: bold; color: var(--hermes-text);" id="security-level">Medium</div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Security Level</div>
        </div>
      </div>
      
      <div style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        padding: 15px;
      ">
        <h5 style="margin: 0 0 10px 0; color: var(--hermes-text);">🔐 Lock Settings</h5>
        
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <label style="display: flex; align-items: center; gap: 8px; color: var(--hermes-text);">
            <input type="checkbox" id="auto-lock-new-pages" style="margin: 0;">
            <span>🔒 Auto-lock new pages</span>
          </label>
          
          <label style="display: flex; align-items: center; gap: 8px; color: var(--hermes-text);">
            <input type="checkbox" id="show-lock-warnings" checked style="margin: 0;">
            <span>⚠️ Show lock warnings</span>
          </label>
          
          <label style="display: flex; align-items: center; gap: 8px; color: var(--hermes-text);">
            <input type="checkbox" id="require-confirmation" checked style="margin: 0;">
            <span>❓ Require confirmation for unlock</span>
          </label>
          
          <label style="display: flex; align-items: center; gap: 8px; color: var(--hermes-text);">
            <input type="checkbox" id="visual-indicators" checked style="margin: 0;">
            <span>👁️ Show visual lock indicators</span>
          </label>
        </div>
      </div>
    `;

    panel.appendChild(dashboard);

    // Locked Pages List
    const lockedPagesList = document.createElement('div');
    lockedPagesList.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
    `;

    lockedPagesList.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text); display: flex; align-items: center; gap: 8px;">
        🔒 Locked Pages
      </h4>
      
      <div id="locked-pages-list" style="
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid var(--hermes-border);
        border-radius: 4px;
        background: var(--hermes-bg);
      ">
        ${this.generateLockedPagesList(app)}
      </div>
    `;

    panel.appendChild(lockedPagesList);

    // Update dashboard
    this.updateDashboard(app);
  },

  generateLockedPagesList(app) {
    const lockedPages = Object.keys(this.lockedPages).filter(pageId => this.lockedPages[pageId]);
    
    if (lockedPages.length === 0) {
      return `
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic; padding: 40px;">
          <div style="font-size: 3em; margin-bottom: 15px;">🔓</div>
          <div>No locked pages</div>
          <div style="font-size: 0.9em; margin-top: 5px;">All pages are currently unlocked</div>
        </div>
      `;
    }

    return lockedPages.map(pageId => {
      const [sectionName, pageIndex] = pageId.split('::');
      const sections = app.sections();
      const page = sections[sectionName] && sections[sectionName][parseInt(pageIndex)];
      
      if (!page) return '';
      
      return `
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 15px;
          border-bottom: 1px solid var(--hermes-border);
          transition: all 0.2s;
        " onmouseenter="this.style.background='var(--hermes-highlight-bg)'" onmouseleave="this.style.background='transparent'">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2em;">🔒</span>
            <div>
              <div style="font-weight: bold; color: var(--hermes-text);">${page.name}</div>
              <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">in ${sectionName}</div>
            </div>
          </div>
          
          <div style="display: flex; gap: 8px;">
            <button onclick="this.unlockPage('${pageId}')" style="
              padding: 4px 8px;
              border: none;
              border-radius: 3px;
              background: var(--hermes-success-text);
              color: white;
              cursor: pointer;
              font-size: 0.8em;
            ">🔓 Unlock</button>
            <button onclick="this.viewPage('${pageId}')" style="
              padding: 4px 8px;
              border: 1px solid var(--hermes-border);
              border-radius: 3px;
              background: var(--hermes-button-bg);
              color: var(--hermes-text);
              cursor: pointer;
              font-size: 0.8em;
            ">👁️ View</button>
          </div>
        </div>
      `;
    }).join('');
  },

  initializeLockingComponents(app) {
    // Add CSS for locking system
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatLock {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-8px) rotate(2deg); }
      }
      
      @keyframes lockPulse {
        0%, 100% { opacity: 0.7; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.1); }
      }
      
      @keyframes lockShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
      }
      
      .page-locked {
        position: relative;
        opacity: 0.7;
        pointer-events: none;
      }
      
      .page-locked::before {
        content: '🔒';
        position: absolute;
        top: 5px;
        right: 5px;
        font-size: 1.2em;
        z-index: 10;
        animation: lockPulse 2s infinite;
      }
      
      .page-locked-sidebar {
        background: linear-gradient(90deg, var(--hermes-bg), rgba(255, 193, 7, 0.1)) !important;
        border-left: 3px solid #ffc107 !important;
      }
      
      .page-locked-sidebar::after {
        content: '🔒';
        margin-left: 8px;
        opacity: 0.7;
      }
      
      .lock-warning {
        background: linear-gradient(135deg, #fff3cd, #ffeaa7);
        border: 1px solid #ffc107;
        border-radius: 6px;
        padding: 10px 15px;
        margin: 10px 0;
        color: #856404;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: lockShake 0.5s ease-in-out;
      }
      
      .lock-button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2em;
        padding: 4px;
        border-radius: 3px;
        transition: all 0.2s;
      }
      
      .lock-button:hover {
        background: var(--hermes-highlight-bg);
        transform: scale(1.1);
      }
      
      .editor-locked {
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(255, 193, 7, 0.05) 10px,
          rgba(255, 193, 7, 0.05) 20px
        );
        position: relative;
      }
      
      .editor-locked::before {
        content: '🔒 This page is locked. Click the lock icon to unlock it.';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 193, 7, 0.9);
        color: #856404;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(style);

    // Add lock buttons to existing pages
    this.addLockButtonsToPages(app);
  },

  addLockButtonsToPages(app) {
    // Add lock buttons to sidebar pages
    const observer = new MutationObserver(() => {
      this.updatePageLockIndicators(app);
    });

    // Observe sidebar changes
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      observer.observe(sidebar, { childList: true, subtree: true });
    }

    // Add lock button to editor toolbar
    this.addEditorLockButton(app);
  },

  addEditorLockButton(app) {
    const toolbar = document.getElementById('toolbar');
    if (!toolbar) return;

    const lockButton = document.createElement('button');
    lockButton.id = 'page-lock-toggle';
    lockButton.className = 'lock-button';
    lockButton.style.cssText = `
      margin-left: 10px;
      padding: 8px 12px;
      border: 2px solid var(--hermes-border);
      border-radius: 6px;
      background: var(--hermes-button-bg);
      color: var(--hermes-text);
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    lockButton.innerHTML = '🔓 Unlocked';
    
    lockButton.addEventListener('click', () => {
      const currentPage = app.currentPage();
      const currentSection = app.currentSection();
      
      if (currentPage && currentSection) {
        const pageId = `${currentSection}::${app.sections()[currentSection].indexOf(currentPage)}`;
        this.togglePageLock(pageId, app);
      }
    });

    toolbar.appendChild(lockButton);
  },

  updatePageLockIndicators(app) {
    // Update sidebar indicators
    const pageElements = document.querySelectorAll('[data-page-id]');
    pageElements.forEach(element => {
      const pageId = element.dataset.pageId;
      if (this.isPageLocked(pageId)) {
        element.classList.add('page-locked-sidebar');
      } else {
        element.classList.remove('page-locked-sidebar');
      }
    });

    // Update editor lock button
    this.updateEditorLockButton(app);
    
    // Update editor state
    this.updateEditorLockState(app);
  },

  updateEditorLockButton(app) {
    const lockButton = document.getElementById('page-lock-toggle');
    if (!lockButton) return;

    const currentPage = app.currentPage();
    const currentSection = app.currentSection();
    
    if (currentPage && currentSection) {
      const pageId = `${currentSection}::${app.sections()[currentSection].indexOf(currentPage)}`;
      const isLocked = this.isPageLocked(pageId);
      
      lockButton.innerHTML = isLocked ? '🔒 Locked' : '🔓 Unlocked';
      lockButton.style.background = isLocked ? '#ffc107' : 'var(--hermes-button-bg)';
      lockButton.style.color = isLocked ? '#856404' : 'var(--hermes-text)';
    } else {
      lockButton.innerHTML = '🔓 No Page';
      lockButton.style.background = 'var(--hermes-disabled-bg)';
      lockButton.style.color = 'var(--hermes-disabled-text)';
    }
  },

  updateEditorLockState(app) {
    const editor = document.getElementById('editor');
    const quillEditor = document.querySelector('.ql-editor');
    
    const currentPage = app.currentPage();
    const currentSection = app.currentSection();
    
    if (currentPage && currentSection) {
      const pageId = `${currentSection}::${app.sections()[currentSection].indexOf(currentPage)}`;
      const isLocked = this.isPageLocked(pageId);
      
      if (isLocked) {
        if (editor) editor.classList.add('editor-locked');
        if (quillEditor) {
          quillEditor.setAttribute('contenteditable', 'false');
          quillEditor.style.pointerEvents = 'none';
        }
        
        // Show lock warning
        this.showLockWarning();
      } else {
        if (editor) editor.classList.remove('editor-locked');
        if (quillEditor) {
          quillEditor.setAttribute('contenteditable', 'true');
          quillEditor.style.pointerEvents = 'auto';
        }
        
        // Hide lock warning
        this.hideLockWarning();
      }
    }
  },

  showLockWarning() {
    const showWarnings = document.getElementById('show-lock-warnings')?.checked !== false;
    if (!showWarnings) return;

    // Remove existing warning
    this.hideLockWarning();

    const warning = document.createElement('div');
    warning.id = 'lock-warning';
    warning.className = 'lock-warning';
    warning.innerHTML = `
      <span style="font-size: 1.5em;">🔒</span>
      <div>
        <strong>This page is locked!</strong><br>
        <span style="font-size: 0.9em;">Click the lock button in the toolbar to unlock and edit this page.</span>
      </div>
    `;

    const editor = document.getElementById('editor');
    if (editor) {
      editor.insertBefore(warning, editor.firstChild);
    }
  },

  hideLockWarning() {
    const warning = document.getElementById('lock-warning');
    if (warning) {
      warning.remove();
    }
  },

  togglePageLock(pageId, app) {
    const isCurrentlyLocked = this.isPageLocked(pageId);
    const requireConfirmation = document.getElementById('require-confirmation')?.checked !== false;
    
    if (isCurrentlyLocked && requireConfirmation) {
      if (!confirm('Are you sure you want to unlock this page? It will become editable again.')) {
        return;
      }
    }
    
    if (isCurrentlyLocked) {
      this.unlockPage(pageId, app);
    } else {
      this.lockPage(pageId, app);
    }
  },

  lockPage(pageId, app) {
    this.lockedPages[pageId] = true;
    this.saveLockedPages();
    this.updatePageLockIndicators(app);
    this.updateDashboard(app);
    this.refreshLockedPagesList(app);
    
    // Show notification
    this.showNotification('🔒 Page locked successfully', 'success');
  },

  unlockPage(pageId, app) {
    this.lockedPages[pageId] = false;
    this.saveLockedPages();
    this.updatePageLockIndicators(app);
    this.updateDashboard(app);
    this.refreshLockedPagesList(app);
    
    // Show notification
    this.showNotification('🔓 Page unlocked successfully', 'success');
  },

  lockAllPages(app) {
    if (!confirm('Are you sure you want to lock ALL pages? This will prevent editing of all pages.')) {
      return;
    }

    const sections = app.sections();
    let lockedCount = 0;

    Object.keys(sections).forEach(sectionName => {
      sections[sectionName].forEach((page, index) => {
        const pageId = `${sectionName}::${index}`;
        this.lockedPages[pageId] = true;
        lockedCount++;
      });
    });

    this.saveLockedPages();
    this.updatePageLockIndicators(app);
    this.updateDashboard(app);
    this.refreshLockedPagesList(app);
    
    this.showNotification(`🔒 Locked ${lockedCount} pages successfully`, 'success');
  },

  unlockAllPages(app) {
    if (!confirm('Are you sure you want to unlock ALL pages? This will make all pages editable.')) {
      return;
    }

    const unlockedCount = Object.keys(this.lockedPages).filter(pageId => this.lockedPages[pageId]).length;
    
    this.lockedPages = {};
    this.saveLockedPages();
    this.updatePageLockIndicators(app);
    this.updateDashboard(app);
    this.refreshLockedPagesList(app);
    
    this.showNotification(`🔓 Unlocked ${unlockedCount} pages successfully`, 'success');
  },

  isPageLocked(pageId) {
    return this.lockedPages[pageId] === true;
  },

  updateDashboard(app) {
    const sections = app.sections();
    let totalPages = 0;
    let lockedCount = 0;

    Object.keys(sections).forEach(sectionName => {
      totalPages += sections[sectionName].length;
      sections[sectionName].forEach((page, index) => {
        const pageId = `${sectionName}::${index}`;
        if (this.isPageLocked(pageId)) {
          lockedCount++;
        }
      });
    });

    const unlockedCount = totalPages - lockedCount;
    const securityLevel = lockedCount === 0 ? 'Low' : 
                         lockedCount === totalPages ? 'Maximum' :
                         lockedCount > totalPages / 2 ? 'High' : 'Medium';

    // Update dashboard numbers
    const lockedCountEl = document.getElementById('locked-count');
    const unlockedCountEl = document.getElementById('unlocked-count');
    const totalPagesEl = document.getElementById('total-pages');
    const securityLevelEl = document.getElementById('security-level');

    if (lockedCountEl) lockedCountEl.textContent = lockedCount;
    if (unlockedCountEl) unlockedCountEl.textContent = unlockedCount;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;
    if (securityLevelEl) securityLevelEl.textContent = securityLevel;
  },

  refreshLockedPagesList(app) {
    const listContainer = document.getElementById('locked-pages-list');
    if (listContainer) {
      listContainer.innerHTML = this.generateLockedPagesList(app);
    }
  },

  viewPage(pageId, app) {
    const [sectionName, pageIndex] = pageId.split('::');
    // Navigate to the page (this would depend on NextNote's navigation API)
    if (app.selectPage) {
      app.selectPage(sectionName, parseInt(pageIndex));
    }
  },

  applyExistingLocks(app) {
    // Apply locks to pages that were previously locked
    setTimeout(() => {
      this.updatePageLockIndicators(app);
      this.updateDashboard(app);
    }, 500);
  },

  saveLockedPages() {
    localStorage.setItem('nextnote_locked_pages', JSON.stringify(this.lockedPages));
  },

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
      color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
      border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
      border-radius: 6px;
      padding: 12px 20px;
      z-index: 10000;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  bindLockingEvents(app) {
    // Listen for page changes
    app.on('pageChanged', () => {
      this.updateEditorLockButton(app);
      this.updateEditorLockState(app);
    });

    // Listen for section changes
    app.on('sectionChanged', () => {
      this.updateDashboard(app);
      this.refreshLockedPagesList(app);
    });

    // Auto-lock new pages if setting is enabled
    app.on('pageAdded', (pageId) => {
      const autoLock = document.getElementById('auto-lock-new-pages')?.checked;
      if (autoLock) {
        this.lockPage(pageId, app);
      }
    });
  }
});
