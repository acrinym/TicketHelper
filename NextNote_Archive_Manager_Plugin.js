/**
 * NextNote Archive Manager Plugin
 * User interface for creating, loading, and managing NextNote Archives (.nna files)
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Archive Manager',
  version: '1.0.0',
  description: 'Create, load, and manage portable NextNote Archives (.nna files)',
  
  onLoad(app) {
    this.archiveSystem = window.NextNoteArchiveSystem;
    this.setupArchiveUI(app);
    this.initializeArchiveComponents(app);
    this.bindArchiveEvents(app);
  },

  setupArchiveUI(app) {
    const panel = app.createPanel('archive-manager', 'Archive Manager');
    
    // Archive Manager header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, var(--hermes-success-text), var(--hermes-info-text));
      border-radius: 12px;
      color: white;
    `;

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0; color: white; display: flex; align-items: center; gap: 10px;';
    title.innerHTML = '📦 Archive Manager';

    const versionInfo = document.createElement('div');
    versionInfo.style.cssText = `
      padding: 6px 12px;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      font-size: 0.8em;
    `;
    versionInfo.textContent = `v${this.archiveSystem.ARCHIVE_VERSION}`;

    header.appendChild(title);
    header.appendChild(versionInfo);
    panel.appendChild(header);

    // Quick Actions section
    const actionsSection = document.createElement('div');
    actionsSection.style.cssText = 'margin-bottom: 25px;';

    const actionsTitle = document.createElement('h4');
    actionsTitle.style.cssText = 'margin: 0 0 15px 0; color: var(--hermes-text);';
    actionsTitle.textContent = '⚡ Quick Actions';

    const actionsGrid = document.createElement('div');
    actionsGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    `;

    const actions = [
      {
        id: 'create-archive',
        icon: '📦',
        title: 'Create Archive',
        description: 'Export current workspace as .nna file',
        color: 'var(--hermes-success-text)'
      },
      {
        id: 'load-archive',
        icon: '📂',
        title: 'Load Archive',
        description: 'Import workspace from .nna file',
        color: 'var(--hermes-info-text)'
      },
      {
        id: 'merge-archive',
        icon: '🔄',
        title: 'Merge Archive',
        description: 'Combine archive with current workspace',
        color: 'var(--hermes-warning-text)'
      },
      {
        id: 'archive-info',
        icon: 'ℹ️',
        title: 'Archive Info',
        description: 'View current workspace statistics',
        color: 'var(--hermes-highlight-bg)'
      }
    ];

    actions.forEach(action => {
      const actionCard = document.createElement('div');
      actionCard.className = 'archive-action-card';
      actionCard.style.cssText = `
        padding: 20px;
        border: 2px solid var(--hermes-border);
        border-radius: 12px;
        background: var(--hermes-panel-bg);
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
      `;

      actionCard.innerHTML = `
        <div style="font-size: 2em; margin-bottom: 10px; color: ${action.color};">${action.icon}</div>
        <h5 style="margin: 0 0 8px 0; color: var(--hermes-text); font-size: 1.1em;">${action.title}</h5>
        <p style="margin: 0; color: var(--hermes-disabled-text); font-size: 0.9em; line-height: 1.3;">${action.description}</p>
      `;

      actionCard.addEventListener('click', () => this.handleAction(action.id, app));
      actionCard.addEventListener('mouseenter', () => {
        actionCard.style.borderColor = action.color;
        actionCard.style.transform = 'translateY(-2px)';
        actionCard.style.boxShadow = `0 4px 12px ${action.color}20`;
      });
      actionCard.addEventListener('mouseleave', () => {
        actionCard.style.borderColor = 'var(--hermes-border)';
        actionCard.style.transform = 'translateY(0)';
        actionCard.style.boxShadow = 'none';
      });

      actionsGrid.appendChild(actionCard);
    });

    actionsSection.appendChild(actionsTitle);
    actionsSection.appendChild(actionsGrid);
    panel.appendChild(actionsSection);

    // Workspace Statistics section
    const statsSection = document.createElement('div');
    statsSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">📊 Workspace Statistics</h4>
      <div id="workspace-stats" style="
        padding: 20px;
        background: var(--hermes-panel-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 8px;
      ">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px; text-align: center;">
          <div>
            <div id="stats-pages" style="font-size: 1.5em; font-weight: bold; color: var(--hermes-highlight-bg);">0</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Pages</div>
          </div>
          <div>
            <div id="stats-sections" style="font-size: 1.5em; font-weight: bold; color: var(--hermes-success-text);">0</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Sections</div>
          </div>
          <div>
            <div id="stats-attachments" style="font-size: 1.5em; font-weight: bold; color: var(--hermes-info-text);">0</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Attachments</div>
          </div>
          <div>
            <div id="stats-size" style="font-size: 1.5em; font-weight: bold; color: var(--hermes-warning-text);">0 KB</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Total Size</div>
          </div>
        </div>
      </div>
    `;
    panel.appendChild(statsSection);

    // Recent Archives section
    const recentSection = document.createElement('div');
    recentSection.style.cssText = 'margin-top: 25px;';
    recentSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🕒 Recent Archives</h4>
      <div id="recent-archives" style="
        min-height: 100px;
        padding: 15px;
        background: var(--hermes-panel-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 8px;
        color: var(--hermes-disabled-text);
        font-style: italic;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        No recent archives. Create your first archive to get started!
      </div>
    `;
    panel.appendChild(recentSection);

    // Update statistics
    this.updateWorkspaceStats();
  },

  handleAction(actionId, app) {
    switch (actionId) {
      case 'create-archive':
        this.showCreateArchiveDialog(app);
        break;
      case 'load-archive':
        this.showLoadArchiveDialog(app);
        break;
      case 'merge-archive':
        this.showMergeArchiveDialog(app);
        break;
      case 'archive-info':
        this.showArchiveInfoDialog(app);
        break;
    }
  },

  showCreateArchiveDialog(app) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 12px;
      padding: 30px;
      width: 500px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
    `;

    dialog.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: var(--hermes-text); display: flex; align-items: center; gap: 10px;">
        📦 Create NextNote Archive
      </h3>
      <form id="create-archive-form">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Archive Title</label>
          <input type="text" id="archive-title" required value="My NextNote Workspace" style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Description</label>
          <textarea id="archive-description" rows="3" placeholder="Optional description of this workspace..." style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text); resize: vertical;"></textarea>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Author</label>
          <input type="text" id="archive-author" value="NextNote User" style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 10px; font-weight: bold; color: var(--hermes-text);">Include in Archive</label>
          <div style="display: grid; gap: 8px;">
            <label style="display: flex; align-items: center; gap: 8px; color: var(--hermes-text);">
              <input type="checkbox" id="include-settings" checked style="margin: 0;">
              Settings & Preferences
            </label>
            <label style="display: flex; align-items: center; gap: 8px; color: var(--hermes-text);">
              <input type="checkbox" id="include-themes" checked style="margin: 0;">
              Themes & Customizations
            </label>
            <label style="display: flex; align-items: center; gap: 8px; color: var(--hermes-text);">
              <input type="checkbox" id="include-plugins" checked style="margin: 0;">
              Plugin Data
            </label>
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: flex; align-items: center; gap: 8px; color: var(--hermes-text); font-weight: bold;">
            <input type="checkbox" id="enable-encryption" style="margin: 0;">
            Enable Encryption (Password Protection)
          </label>
          <div id="encryption-options" style="margin-top: 10px; display: none;">
            <input type="password" id="archive-password" placeholder="Enter password..." style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
          </div>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" id="cancel-create" style="padding: 10px 20px; border: 1px solid var(--hermes-border); border-radius: 6px; background: var(--hermes-button-bg); color: var(--hermes-text); cursor: pointer;">Cancel</button>
          <button type="submit" style="padding: 10px 20px; border: none; border-radius: 6px; background: var(--hermes-success-text); color: white; cursor: pointer;">Create Archive</button>
        </div>
      </form>
    `;

    // Handle encryption toggle
    dialog.querySelector('#enable-encryption').addEventListener('change', (e) => {
      const options = dialog.querySelector('#encryption-options');
      options.style.display = e.target.checked ? 'block' : 'none';
    });

    dialog.querySelector('#cancel-create').addEventListener('click', () => overlay.remove());
    dialog.querySelector('#create-archive-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.createArchive(dialog, app);
      overlay.remove();
    });

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  },

  async createArchive(dialog, app) {
    try {
      const title = dialog.querySelector('#archive-title').value;
      const description = dialog.querySelector('#archive-description').value;
      const author = dialog.querySelector('#archive-author').value;
      const includeSettings = dialog.querySelector('#include-settings').checked;
      const includeThemes = dialog.querySelector('#include-themes').checked;
      const includePlugins = dialog.querySelector('#include-plugins').checked;
      const enableEncryption = dialog.querySelector('#enable-encryption').checked;
      const password = dialog.querySelector('#archive-password')?.value;

      if (enableEncryption && !password) {
        app.showToast('Password is required for encryption', 'error');
        return;
      }

      app.showToast('Creating archive...', 'info');

      const archiveBlob = await this.archiveSystem.createArchive({
        includeSettings,
        includeThemes,
        includePlugins,
        encryption: enableEncryption,
        password: password,
        compression: true,
        metadata: {
          title,
          description,
          author,
          tags: ['nextnote', 'workspace']
        }
      });

      // Download the archive
      const url = URL.createObjectURL(archiveBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.nna`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Save to recent archives
      this.addToRecentArchives({
        title,
        description,
        author,
        created: new Date().toISOString(),
        size: archiveBlob.size,
        encrypted: enableEncryption
      });

      app.showToast(`Archive "${title}" created successfully!`, 'success');

    } catch (error) {
      console.error('Error creating archive:', error);
      app.showToast(`Failed to create archive: ${error.message}`, 'error');
    }
  },

  showLoadArchiveDialog(app) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.nna,.json';
    input.style.display = 'none';

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await this.loadArchiveFile(file, app);
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  },

  async loadArchiveFile(file, app, mergeMode = false) {
    try {
      app.showToast('Loading archive...', 'info');

      // Check if encryption is needed
      const fileContent = await this.readFileAsText(file);
      let needsPassword = false;
      
      try {
        JSON.parse(fileContent);
      } catch {
        needsPassword = true;
      }

      if (needsPassword) {
        const password = prompt('This archive is encrypted. Please enter the password:');
        if (!password) {
          app.showToast('Password required to load encrypted archive', 'warning');
          return;
        }

        await this.archiveSystem.loadArchive(file, {
          password,
          mergeMode,
          preserveExisting: mergeMode
        });
      } else {
        await this.archiveSystem.loadArchive(file, {
          mergeMode,
          preserveExisting: mergeMode
        });
      }

      app.showToast(`Archive "${file.name}" loaded successfully!`, 'success');
      
      // Refresh the page to show loaded content
      if (confirm('Archive loaded successfully! Refresh the page to see the changes?')) {
        window.location.reload();
      }

    } catch (error) {
      console.error('Error loading archive:', error);
      app.showToast(`Failed to load archive: ${error.message}`, 'error');
    }
  },

  showMergeArchiveDialog(app) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.nna,.json';
    input.style.display = 'none';

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await this.loadArchiveFile(file, app, true); // mergeMode = true
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  },

  showArchiveInfoDialog(app) {
    const stats = this.calculateWorkspaceStats();
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 12px;
      padding: 30px;
      width: 600px;
      max-width: 90vw;
    `;

    dialog.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: var(--hermes-text);">ℹ️ Workspace Information</h3>
      <div style="display: grid; gap: 20px;">
        <div style="padding: 15px; background: var(--hermes-bg); border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: var(--hermes-text);">Content Statistics</h4>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div>📄 Pages: <strong>${stats.pages}</strong></div>
            <div>📁 Sections: <strong>${stats.sections}</strong></div>
            <div>📎 Attachments: <strong>${stats.attachments}</strong></div>
            <div>💾 Total Size: <strong>${stats.totalSize}</strong></div>
          </div>
        </div>
        <div style="padding: 15px; background: var(--hermes-bg); border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: var(--hermes-text);">Archive Compatibility</h4>
          <div>Format Version: <strong>${this.archiveSystem.ARCHIVE_VERSION}</strong></div>
          <div>Encryption: <strong>Supported</strong></div>
          <div>Compression: <strong>Enabled</strong></div>
        </div>
      </div>
      <div style="margin-top: 20px; text-align: right;">
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 10px 20px; border: none; border-radius: 6px; background: var(--hermes-highlight-bg); color: var(--hermes-highlight-text); cursor: pointer;">Close</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  },

  updateWorkspaceStats() {
    const stats = this.calculateWorkspaceStats();
    
    const statsPages = document.getElementById('stats-pages');
    const statsSections = document.getElementById('stats-sections');
    const statsAttachments = document.getElementById('stats-attachments');
    const statsSize = document.getElementById('stats-size');

    if (statsPages) statsPages.textContent = stats.pages;
    if (statsSections) statsSections.textContent = stats.sections;
    if (statsAttachments) statsAttachments.textContent = stats.attachments;
    if (statsSize) statsSize.textContent = stats.totalSize;
  },

  calculateWorkspaceStats() {
    const pages = JSON.parse(localStorage.getItem('nextnote_pages') || '[]');
    const sections = JSON.parse(localStorage.getItem('nextnote_sections') || '[]');
    const attachments = JSON.parse(localStorage.getItem('nextnote_attachments') || '[]');
    
    // Calculate total size
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nextnote_')) {
        totalSize += localStorage.getItem(key).length;
      }
    }

    return {
      pages: pages.length,
      sections: sections.length,
      attachments: attachments.length,
      totalSize: this.formatBytes(totalSize)
    };
  },

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  addToRecentArchives(archiveInfo) {
    const recent = JSON.parse(localStorage.getItem('nextnote_recent_archives') || '[]');
    recent.unshift(archiveInfo);
    
    // Keep only last 10
    if (recent.length > 10) {
      recent.splice(10);
    }
    
    localStorage.setItem('nextnote_recent_archives', JSON.stringify(recent));
    this.updateRecentArchives();
  },

  updateRecentArchives() {
    const recent = JSON.parse(localStorage.getItem('nextnote_recent_archives') || '[]');
    const container = document.getElementById('recent-archives');
    
    if (!container) return;

    if (recent.length === 0) {
      container.innerHTML = 'No recent archives. Create your first archive to get started!';
      return;
    }

    container.innerHTML = recent.slice(0, 5).map(archive => `
      <div style="
        padding: 12px;
        margin-bottom: 8px;
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <div style="font-weight: bold; color: var(--hermes-text);">${archive.title}</div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">
            ${new Date(archive.created).toLocaleDateString()} • ${archive.size ? this.formatBytes(archive.size) : 'Unknown size'}
            ${archive.encrypted ? ' • 🔒 Encrypted' : ''}
          </div>
        </div>
      </div>
    `).join('');
  },

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  initializeArchiveComponents(app) {
    // Initialize archive components
    this.updateRecentArchives();
  },

  bindArchiveEvents(app) {
    // Listen for archive events
    app.on('archiveCreated', (data) => {
      this.updateWorkspaceStats();
      this.updateRecentArchives();
    });

    app.on('archiveLoaded', (data) => {
      this.updateWorkspaceStats();
    });
  }
});
