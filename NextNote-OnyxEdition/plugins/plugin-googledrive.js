// plugins/plugin-googledrive.js

window.registerNextNotePlugin({
  name: "GoogleDrive",
  onLoad: function(app) {
    // Google Drive specific styling
    const driveStyle = document.createElement("style");
    driveStyle.textContent = `
      .drive-mode {
        --drive-primary: #4285f4;
        --drive-secondary: #34a853;
        --drive-accent: #ea4335;
        --drive-warning: #fbbc04;
        --drive-light: #f8f9fa;
        --drive-dark: #202124;
      }
      
      .drive-toolbar {
        background: var(--drive-primary);
        color: white;
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 15px;
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }
      
      .drive-toolbar button {
        background: var(--drive-secondary);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }
      
      .drive-toolbar button:hover {
        background: #2d8f47;
      }
      
      .drive-toolbar button.danger {
        background: var(--drive-accent);
      }
      
      .drive-toolbar button.danger:hover {
        background: #d93025;
      }
      
      .drive-file-list {
        background: white;
        border: 1px solid #e8eaed;
        border-radius: 8px;
        padding: 15px;
        margin: 15px 0;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .drive-file-item {
        display: flex;
        align-items: center;
        padding: 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
        margin: 2px 0;
      }
      
      .drive-file-item:hover {
        background: #f1f3f4;
      }
      
      .drive-file-item.selected {
        background: var(--drive-primary);
        color: white;
      }
      
      .drive-file-icon {
        margin-right: 10px;
        font-size: 16px;
      }
      
      .drive-file-info {
        flex: 1;
      }
      
      .drive-file-name {
        font-weight: 500;
        margin-bottom: 2px;
      }
      
      .drive-file-meta {
        font-size: 11px;
        color: #5f6368;
      }
      
      .drive-file-item.selected .drive-file-meta {
        color: rgba(255,255,255,0.8);
      }
      
      .drive-sync-status {
        background: #e8f5e8;
        border: 1px solid #34a853;
        border-radius: 4px;
        padding: 8px;
        margin: 10px 0;
        font-size: 12px;
        color: #137333;
      }
      
      .drive-sync-status.error {
        background: #fce8e6;
        border-color: #ea4335;
        color: #c5221f;
      }
      
      /* Floating button removed - functionality integrated into main toolbar */
      
      .drive-auth-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.5);
        z-index: 5000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .drive-auth-content {
        background: white;
        border-radius: 12px;
        padding: 30px;
        width: 400px;
        max-width: 90vw;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      }
      
      .drive-auth-button {
        background: var(--drive-primary);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        margin: 10px;
      }
      
      .drive-auth-button:hover {
        background: #3367d6;
      }
    `;
    document.head.appendChild(driveStyle);

    // Google Drive state
    let driveMode = false;
    let driveFiles = JSON.parse(localStorage.getItem('nextnote_drive_files') || '[]');
    let driveSyncStatus = JSON.parse(localStorage.getItem('nextnote_drive_sync_status') || '{}');
    let selectedDriveFile = null;
    let isAuthenticated = false;

    // Drive functionality is now integrated into the main toolbar
    // No floating button needed

    function toggleDriveMode() {
      driveMode = !driveMode;
      if (driveMode) {
        enableDriveMode();
        driveToggle.textContent = '📝 Note Mode';
        driveToggle.style.background = '#ea4335';
      } else {
        disableDriveMode();
        driveToggle.textContent = '☁️ Drive';
        driveToggle.style.background = 'var(--drive-primary)';
      }
    }

    function enableDriveMode() {
      document.body.classList.add('drive-mode');
      
      // Add drive toolbar
      addDriveToolbar();
      
      // Check authentication
      checkDriveAuth();
      
      // Load drive files
      loadDriveFiles();
    }

    function disableDriveMode() {
      document.body.classList.remove('drive-mode');
      
      // Remove drive elements
      const driveElements = document.querySelectorAll('.drive-toolbar, .drive-file-list, .drive-sync-status');
      driveElements.forEach(el => el.remove());
    }

    function addDriveToolbar() {
      const toolbar = document.createElement('div');
      toolbar.className = 'drive-toolbar';
      toolbar.innerHTML = `
        <button onclick="authenticateDrive()">🔐 Connect Drive</button>
        <button onclick="syncToDrive()">📤 Sync to Drive</button>
        <button onclick="syncFromDrive()">📥 Sync from Drive</button>
        <button onclick="createDriveBackup()">💾 Create Backup</button>
        <button onclick="restoreFromDrive()">🔄 Restore</button>
        <button onclick="exportToDrive()">📁 Export to Drive</button>
        <button onclick="importFromDrive()">📂 Import from Drive</button>
        <button onclick="showDriveSettings()">⚙️ Settings</button>
      `;
      
      // Insert after main toolbar
      const mainToolbar = document.getElementById('toolbar');
      mainToolbar.parentNode.insertBefore(toolbar, mainToolbar.nextSibling);
    }

    function checkDriveAuth() {
      // Check if we have stored auth token
      const authToken = localStorage.getItem('nextnote_drive_auth');
      if (authToken) {
        isAuthenticated = true;
        showSyncStatus('Connected to Google Drive', 'success');
      } else {
        showSyncStatus('Not connected to Google Drive. Click "Connect Drive" to authenticate.', 'error');
      }
    }

    function authenticateDrive() {
      // For now, we'll simulate authentication
      // In a real implementation, you'd use Google OAuth
      showAuthModal();
    }

    function showAuthModal() {
      const modal = document.createElement('div');
      modal.className = 'drive-auth-modal';
      modal.innerHTML = `
        <div class="drive-auth-content">
          <h3>🔐 Connect to Google Drive</h3>
          <p>To sync your notes with Google Drive, you need to authenticate with Google.</p>
          <p><strong>Note:</strong> This is a demo implementation. In production, you would need:</p>
          <ul style="text-align: left; margin: 20px 0;">
            <li>Google Cloud Project</li>
            <li>OAuth 2.0 credentials</li>
            <li>Google Drive API enabled</li>
          </ul>
          <button class="drive-auth-button" onclick="simulateDriveAuth()">🔐 Simulate Authentication</button>
          <button class="drive-auth-button" onclick="closeAuthModal()" style="background: #5f6368;">Cancel</button>
        </div>
      `;
      
      document.body.appendChild(modal);
    }

    function simulateDriveAuth() {
      // Simulate successful authentication
      localStorage.setItem('nextnote_drive_auth', 'demo_token_' + Date.now());
      isAuthenticated = true;
      showSyncStatus('Successfully connected to Google Drive!', 'success');
      closeAuthModal();
      
      // Create demo files
      createDemoDriveFiles();
    }

    function closeAuthModal() {
      const modal = document.querySelector('.drive-auth-modal');
      if (modal) modal.remove();
    }

    function createDemoDriveFiles() {
      driveFiles = [
        {
          id: 'demo_1',
          name: 'NextNote Backup - ' + new Date().toLocaleDateString(),
          type: 'application/json',
          size: '2.3 KB',
          modified: new Date().toISOString(),
          isBackup: true
        },
        {
          id: 'demo_2',
          name: 'Project Notes',
          type: 'application/json',
          size: '1.8 KB',
          modified: new Date(Date.now() - 86400000).toISOString(),
          isBackup: false
        },
        {
          id: 'demo_3',
          name: 'Personal Journal',
          type: 'application/json',
          size: '3.1 KB',
          modified: new Date(Date.now() - 172800000).toISOString(),
          isBackup: false
        }
      ];
      
      localStorage.setItem('nextnote_drive_files', JSON.stringify(driveFiles));
      renderDriveFiles();
    }

    function loadDriveFiles() {
      renderDriveFiles();
    }

    function renderDriveFiles() {
      // Remove existing file list
      const existing = document.querySelector('.drive-file-list');
      if (existing) existing.remove();
      
      if (!isAuthenticated) {
        showSyncStatus('Please authenticate with Google Drive first', 'error');
        return;
      }
      
      const fileList = document.createElement('div');
      fileList.className = 'drive-file-list';
      
      if (driveFiles.length === 0) {
        fileList.innerHTML = '<p style="text-align: center; color: #5f6368;">No files found in Google Drive</p>';
      } else {
        fileList.innerHTML = '<h4 style="margin-top: 0;">📁 Google Drive Files</h4>';
        
        driveFiles.forEach(file => {
          const fileItem = document.createElement('div');
          fileItem.className = 'drive-file-item';
          fileItem.onclick = () => selectDriveFile(file.id);
          
          const icon = file.isBackup ? '💾' : '📄';
          const type = file.isBackup ? 'Backup' : 'Note';
          
          fileItem.innerHTML = `
            <div class="drive-file-icon">${icon}</div>
            <div class="drive-file-info">
              <div class="drive-file-name">${file.name}</div>
              <div class="drive-file-meta">${type} • ${file.size} • ${new Date(file.modified).toLocaleDateString()}</div>
            </div>
          `;
          
          fileList.appendChild(fileItem);
        });
      }
      
      // Insert after toolbar
      const toolbar = document.querySelector('.drive-toolbar');
      toolbar.parentNode.insertBefore(fileList, toolbar.nextSibling);
    }

    function selectDriveFile(fileId) {
      selectedDriveFile = fileId;
      
      // Update selection
      document.querySelectorAll('.drive-file-item').forEach(item => {
        item.classList.remove('selected');
      });
      
      const selectedItem = document.querySelector(`[onclick*="${fileId}"]`);
      if (selectedItem) {
        selectedItem.classList.add('selected');
      }
    }

    function showSyncStatus(message, type = 'success') {
      // Remove existing status
      const existing = document.querySelector('.drive-sync-status');
      if (existing) existing.remove();
      
      const status = document.createElement('div');
      status.className = `drive-sync-status ${type}`;
      status.textContent = message;
      
      // Insert after toolbar
      const toolbar = document.querySelector('.drive-toolbar');
      toolbar.parentNode.insertBefore(status, toolbar.nextSibling);
    }

    // Drive utility functions
    function syncToDrive() {
      if (!isAuthenticated) {
        alert('Please authenticate with Google Drive first');
        return;
      }
      
      // Export current data
      const sections = app.sections();
      const exportData = {
        title: 'NextNote Sync - ' + new Date().toLocaleString(),
        sections: sections,
        exported: new Date().toISOString(),
        version: '1.0'
      };
      
      // Create backup file
      const backupFile = {
        id: 'backup_' + Date.now(),
        name: 'NextNote Backup - ' + new Date().toLocaleDateString(),
        type: 'application/json',
        size: (JSON.stringify(exportData).length / 1024).toFixed(1) + ' KB',
        modified: new Date().toISOString(),
        isBackup: true,
        data: exportData
      };
      
      driveFiles.unshift(backupFile);
      localStorage.setItem('nextnote_drive_files', JSON.stringify(driveFiles));
      
      renderDriveFiles();
      showSyncStatus('Successfully synced to Google Drive!', 'success');
    }

    function syncFromDrive() {
      if (!isAuthenticated) {
        alert('Please authenticate with Google Drive first');
        return;
      }
      
      if (!selectedDriveFile) {
        alert('Please select a file to sync from');
        return;
      }
      
      const file = driveFiles.find(f => f.id === selectedDriveFile);
      if (!file || !file.data) {
        alert('Selected file does not contain valid data');
        return;
      }
      
      // Import data
      if (file.data.sections) {
        app.sections = () => file.data.sections;
        app.renderSections();
        showSyncStatus('Successfully synced from Google Drive!', 'success');
      }
    }

    function createDriveBackup() {
      if (!isAuthenticated) {
        alert('Please authenticate with Google Drive first');
        return;
      }
      
      syncToDrive();
      alert('Backup created successfully!');
    }

    function restoreFromDrive() {
      if (!isAuthenticated) {
        alert('Please authenticate with Google Drive first');
        return;
      }
      
      if (!selectedDriveFile) {
        alert('Please select a backup file to restore from');
        return;
      }
      
      const file = driveFiles.find(f => f.id === selectedDriveFile);
      if (!file || !file.isBackup) {
        alert('Please select a backup file');
        return;
      }
      
      if (confirm('This will replace all current data. Are you sure?')) {
        syncFromDrive();
      }
    }

    function exportToDrive() {
      if (!isAuthenticated) {
        alert('Please authenticate with Google Drive first');
        return;
      }
      
      const filename = prompt('Enter filename for export:');
      if (!filename) return;
      
      const sections = app.sections();
      const exportData = {
        title: filename,
        sections: sections,
        exported: new Date().toISOString(),
        version: '1.0'
      };
      
      const exportFile = {
        id: 'export_' + Date.now(),
        name: filename + '.json',
        type: 'application/json',
        size: (JSON.stringify(exportData).length / 1024).toFixed(1) + ' KB',
        modified: new Date().toISOString(),
        isBackup: false,
        data: exportData
      };
      
      driveFiles.unshift(exportFile);
      localStorage.setItem('nextnote_drive_files', JSON.stringify(driveFiles));
      
      renderDriveFiles();
      showSyncStatus('Successfully exported to Google Drive!', 'success');
    }

    function importFromDrive() {
      if (!isAuthenticated) {
        alert('Please authenticate with Google Drive first');
        return;
      }
      
      if (!selectedDriveFile) {
        alert('Please select a file to import');
        return;
      }
      
      const file = driveFiles.find(f => f.id === selectedDriveFile);
      if (!file || !file.data) {
        alert('Selected file does not contain valid data');
        return;
      }
      
      if (confirm('Import data from ' + file.name + '?')) {
        syncFromDrive();
      }
    }

    function showDriveSettings() {
      const settings = `
Google Drive Settings

🔐 Authentication: ${isAuthenticated ? 'Connected' : 'Not Connected'}
📁 Files in Drive: ${driveFiles.length}
💾 Last Backup: ${driveFiles.find(f => f.isBackup)?.modified ? new Date(driveFiles.find(f => f.isBackup).modified).toLocaleString() : 'Never'}

Settings:
- Auto-sync on save: Disabled
- Backup frequency: Manual
- Sync conflicts: Ask user
- File format: JSON

Note: This is a demo implementation. Real Google Drive integration requires OAuth 2.0 setup.
      `;
      
      alert(settings);
    }

    // Make functions globally available
    window.authenticateDrive = authenticateDrive;
    window.syncToDrive = syncToDrive;
    window.syncFromDrive = syncFromDrive;
    window.createDriveBackup = createDriveBackup;
    window.restoreFromDrive = restoreFromDrive;
    window.exportToDrive = exportToDrive;
    window.importFromDrive = importFromDrive;
    window.showDriveSettings = showDriveSettings;
    window.simulateDriveAuth = simulateDriveAuth;
    window.closeAuthModal = closeAuthModal;
    window.selectDriveFile = selectDriveFile;
    window.toggleDriveMode = toggleDriveMode;
  }
}); 