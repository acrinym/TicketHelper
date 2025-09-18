/**
 * NextNote Multi-Monitor Workspace Plugin
 * Revolutionary multi-monitor workspace system with floating windows and monitor segmentation
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Multi-Monitor Workspace',
  version: '1.0.0',
  description: 'Revolutionary multi-monitor workspace system with floating windows and monitor segmentation',
  
  onLoad(app) {
    this.monitors = [];
    this.workspaces = JSON.parse(localStorage.getItem('nextnote_workspaces') || '[]');
    this.floatingWindows = new Map();
    this.currentWorkspace = null;
    this.windowCounter = 0;
    this.isMultiMonitorSupported = this.checkMultiMonitorSupport();
    this.setupMultiMonitorWorkspaceUI(app);
    this.initializeWorkspaceComponents(app);
    this.bindWorkspaceEvents(app);
    this.detectMonitors();
  },

  checkMultiMonitorSupport() {
    // Check for Screen API support
    return 'getScreenDetails' in window || 'screen' in window;
  },

  async detectMonitors() {
    try {
      if ('getScreenDetails' in window) {
        // Modern Screen API
        const screenDetails = await window.getScreenDetails();
        this.monitors = screenDetails.screens.map((screen, index) => ({
          id: index,
          width: screen.width,
          height: screen.height,
          left: screen.left,
          top: screen.top,
          isPrimary: screen.isPrimary,
          label: screen.label || `Monitor ${index + 1}`,
          workspaces: []
        }));
      } else {
        // Fallback to basic screen info
        this.monitors = [{
          id: 0,
          width: window.screen.width,
          height: window.screen.height,
          left: 0,
          top: 0,
          isPrimary: true,
          label: 'Primary Monitor',
          workspaces: []
        }];
      }
      
      this.updateMonitorDisplay();
    } catch (error) {
      console.warn('Multi-monitor detection failed, using single monitor mode:', error);
      this.monitors = [{
        id: 0,
        width: window.screen.width,
        height: window.screen.height,
        left: 0,
        top: 0,
        isPrimary: true,
        label: 'Primary Monitor',
        workspaces: []
      }];
      this.updateMonitorDisplay();
    }
  },

  setupMultiMonitorWorkspaceUI(app) {
    const panel = app.createPanel('multi-monitor-workspace', 'Multi-Monitor Workspace');
    
    // Header with workspace theme
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
      border-radius: 12px;
      color: white;
      position: relative;
      overflow: hidden;
    `;

    // Floating monitor icons
    const monitorIcons = ['🖥️', '💻', '📱', '🖱️', '⌨️', '🔌'];
    monitorIcons.forEach((icon, index) => {
      const floatingIcon = document.createElement('div');
      floatingIcon.style.cssText = `
        position: absolute;
        font-size: 1.3em;
        opacity: 0.2;
        animation: floatMonitor ${4 + index}s ease-in-out infinite;
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
      font-family: 'Times New Roman', serif;
    `;
    title.innerHTML = '🖥️ Multi-Monitor Workspace';

    const workspaceControls = document.createElement('div');
    workspaceControls.style.cssText = `
      display: flex;
      gap: 10px;
      z-index: 1;
      position: relative;
    `;

    const newWorkspaceBtn = document.createElement('button');
    newWorkspaceBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    newWorkspaceBtn.textContent = '➕ New Workspace';
    newWorkspaceBtn.addEventListener('click', () => this.createWorkspace());

    const detectBtn = document.createElement('button');
    detectBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    detectBtn.textContent = '🔍 Detect Monitors';
    detectBtn.addEventListener('click', () => this.detectMonitors());

    workspaceControls.appendChild(newWorkspaceBtn);
    workspaceControls.appendChild(detectBtn);

    header.appendChild(title);
    header.appendChild(workspaceControls);
    panel.appendChild(header);

    // Monitor Detection Status
    const statusSection = document.createElement('div');
    statusSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    `;

    statusSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: var(--hermes-text);">🖥️ Monitor Detection</h4>
        <div id="monitor-status" style="
          padding: 4px 12px;
          border-radius: 12px;
          background: ${this.isMultiMonitorSupported ? 'var(--hermes-success-text)' : 'var(--hermes-warning-text)'};
          color: white;
          font-size: 0.8em;
          font-weight: bold;
        ">${this.isMultiMonitorSupported ? 'Supported' : 'Limited Support'}</div>
      </div>
      
      <div id="monitors-display" style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      ">
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic; padding: 20px;">
          <div style="font-size: 2em; margin-bottom: 10px;">🖥️</div>
          <div>Detecting monitors...</div>
        </div>
      </div>
    `;

    panel.appendChild(statusSection);

    // Workspace Management
    const workspaceSection = document.createElement('div');
    workspaceSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    `;

    workspaceSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: var(--hermes-text);">🏢 Workspaces</h4>
        <div style="display: flex; gap: 8px;">
          <button onclick="this.saveWorkspaceLayout()" style="
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            background: var(--hermes-success-text);
            color: white;
            cursor: pointer;
            font-size: 0.9em;
          ">💾 Save Layout</button>
          <button onclick="this.exportWorkspace()" style="
            padding: 6px 12px;
            border: 1px solid var(--hermes-border);
            border-radius: 4px;
            background: var(--hermes-button-bg);
            color: var(--hermes-text);
            cursor: pointer;
            font-size: 0.9em;
          ">📤 Export</button>
        </div>
      </div>
      
      <div id="workspaces-list" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 12px;
      ">
        ${this.workspaces.length === 0 ? `
          <div style="
            grid-column: 1 / -1;
            text-align: center;
            color: var(--hermes-disabled-text);
            font-style: italic;
            padding: 40px;
          ">
            <div style="font-size: 3em; margin-bottom: 15px;">🏢</div>
            <div>No workspaces created yet</div>
            <div style="font-size: 0.9em; margin-top: 5px;">Create your first multi-monitor workspace</div>
          </div>
        ` : this.generateWorkspacesList()}
      </div>
    `;

    panel.appendChild(workspaceSection);

    // Floating Windows Manager
    const windowsSection = document.createElement('div');
    windowsSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    `;

    windowsSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: var(--hermes-text);">🪟 Floating Windows</h4>
        <div style="display: flex; gap: 8px;">
          <button onclick="this.createFloatingWindow('document')" style="
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            background: var(--hermes-info-text);
            color: white;
            cursor: pointer;
            font-size: 0.9em;
          ">📄 Document</button>
          <button onclick="this.createFloatingWindow('tools')" style="
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            background: var(--hermes-warning-text);
            color: white;
            cursor: pointer;
            font-size: 0.9em;
          ">🛠️ Tools</button>
          <button onclick="this.createFloatingWindow('reference')" style="
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            background: var(--hermes-success-text);
            color: white;
            cursor: pointer;
            font-size: 0.9em;
          ">📚 Reference</button>
        </div>
      </div>
      
      <div id="floating-windows-list" style="
        max-height: 300px;
        overflow-y: auto;
      ">
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic; padding: 20px;">
          <div style="font-size: 2em; margin-bottom: 10px;">🪟</div>
          <div>No floating windows open</div>
          <div style="font-size: 0.9em; margin-top: 5px;">Create floating windows to work across monitors</div>
        </div>
      </div>
    `;

    panel.appendChild(windowsSection);

    // Monitor Layout Visualizer
    const layoutSection = document.createElement('div');
    layoutSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
    `;

    layoutSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">📐 Monitor Layout</h4>
      
      <div id="layout-visualizer" style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        padding: 20px;
        min-height: 200px;
        position: relative;
        overflow: hidden;
      ">
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic; padding: 40px;">
          <div style="font-size: 3em; margin-bottom: 15px;">📐</div>
          <div>Monitor layout will appear here</div>
        </div>
      </div>
      
      <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
        <button onclick="this.arrangeMonitorsHorizontal()" style="
          padding: 8px 16px;
          border: 1px solid var(--hermes-border);
          border-radius: 4px;
          background: var(--hermes-button-bg);
          color: var(--hermes-text);
          cursor: pointer;
          font-size: 0.9em;
        ">↔️ Horizontal</button>
        <button onclick="this.arrangeMonitorsVertical()" style="
          padding: 8px 16px;
          border: 1px solid var(--hermes-border);
          border-radius: 4px;
          background: var(--hermes-button-bg);
          color: var(--hermes-text);
          cursor: pointer;
          font-size: 0.9em;
        ">↕️ Vertical</button>
        <button onclick="this.arrangeMonitorsGrid()" style="
          padding: 8px 16px;
          border: 1px solid var(--hermes-border);
          border-radius: 4px;
          background: var(--hermes-button-bg);
          color: var(--hermes-text);
          cursor: pointer;
          font-size: 0.9em;
        ">⊞ Grid</button>
      </div>
    `;

    panel.appendChild(layoutSection);
  },

  updateMonitorDisplay() {
    const display = document.getElementById('monitors-display');
    if (!display) return;

    display.innerHTML = this.monitors.map(monitor => `
      <div style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        padding: 15px;
        position: relative;
        ${monitor.isPrimary ? 'border-color: var(--hermes-success-text); border-width: 2px;' : ''}
      ">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <div style="font-size: 1.5em;">${monitor.isPrimary ? '🖥️' : '💻'}</div>
          <div>
            <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 2px;">
              ${monitor.label}
            </div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">
              ${monitor.width} × ${monitor.height}
            </div>
          </div>
          ${monitor.isPrimary ? `
            <div style="
              background: var(--hermes-success-text);
              color: white;
              padding: 2px 6px;
              border-radius: 8px;
              font-size: 0.7em;
              font-weight: bold;
            ">PRIMARY</div>
          ` : ''}
        </div>
        
        <div style="font-size: 0.8em; color: var(--hermes-disabled-text); margin-bottom: 10px;">
          Position: ${monitor.left}, ${monitor.top}
        </div>
        
        <div style="display: flex; gap: 4px;">
          <button onclick="this.assignWorkspaceToMonitor(${monitor.id})" style="
            flex: 1;
            padding: 6px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-info-text);
            color: white;
            cursor: pointer;
            font-size: 0.8em;
          ">📋 Assign Workspace</button>
          <button onclick="this.openWindowOnMonitor(${monitor.id})" style="
            flex: 1;
            padding: 6px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-success-text);
            color: white;
            cursor: pointer;
            font-size: 0.8em;
          ">🪟 Open Window</button>
        </div>
      </div>
    `).join('');

    this.updateLayoutVisualizer();
  },

  updateLayoutVisualizer() {
    const visualizer = document.getElementById('layout-visualizer');
    if (!visualizer || this.monitors.length === 0) return;

    // Calculate scale to fit all monitors in the visualizer
    const maxWidth = Math.max(...this.monitors.map(m => m.left + m.width));
    const maxHeight = Math.max(...this.monitors.map(m => m.top + m.height));
    const minLeft = Math.min(...this.monitors.map(m => m.left));
    const minTop = Math.min(...this.monitors.map(m => m.top));
    
    const totalWidth = maxWidth - minLeft;
    const totalHeight = maxHeight - minTop;
    
    const scale = Math.min(300 / totalWidth, 150 / totalHeight, 0.3);

    visualizer.innerHTML = this.monitors.map(monitor => `
      <div style="
        position: absolute;
        left: ${(monitor.left - minLeft) * scale + 20}px;
        top: ${(monitor.top - minTop) * scale + 20}px;
        width: ${monitor.width * scale}px;
        height: ${monitor.height * scale}px;
        background: ${monitor.isPrimary ? 'var(--hermes-success-text)' : 'var(--hermes-info-text)'};
        border: 2px solid ${monitor.isPrimary ? 'var(--hermes-success-text)' : 'var(--hermes-border)'};
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.7em;
        font-weight: bold;
        opacity: 0.8;
      ">
        ${monitor.label}
        <br>
        ${monitor.width}×${monitor.height}
      </div>
    `).join('');
  },

  generateWorkspacesList() {
    return this.workspaces.map(workspace => `
      <div style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.2s;
      " onclick="this.loadWorkspace('${workspace.id}')" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="font-size: 1.5em;">🏢</div>
          <div style="flex: 1;">
            <div style="font-weight: bold; color: var(--hermes-text); font-size: 0.9em; margin-bottom: 2px;">
              ${workspace.name}
            </div>
            <div style="font-size: 0.7em; color: var(--hermes-disabled-text);">
              ${new Date(workspace.created).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div style="font-size: 0.8em; color: var(--hermes-disabled-text); margin-bottom: 8px;">
          ${workspace.windows?.length || 0} windows • ${workspace.monitors?.length || 0} monitors
        </div>
        <div style="display: flex; gap: 4px;">
          <button onclick="event.stopPropagation(); this.loadWorkspace('${workspace.id}')" style="
            flex: 1;
            padding: 4px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-success-text);
            color: white;
            cursor: pointer;
            font-size: 0.7em;
          ">Load</button>
          <button onclick="event.stopPropagation(); this.duplicateWorkspace('${workspace.id}')" style="
            flex: 1;
            padding: 4px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-info-text);
            color: white;
            cursor: pointer;
            font-size: 0.7em;
          ">Copy</button>
          <button onclick="event.stopPropagation(); this.deleteWorkspace('${workspace.id}')" style="
            flex: 1;
            padding: 4px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-error-text);
            color: white;
            cursor: pointer;
            font-size: 0.7em;
          ">Delete</button>
        </div>
      </div>
    `).join('');
  },

  createWorkspace() {
    const name = prompt('Enter workspace name:') || 'New Workspace';
    
    const workspace = {
      id: crypto.randomUUID(),
      name: name,
      created: new Date().toISOString(),
      monitors: [...this.monitors],
      windows: [],
      layout: 'horizontal'
    };

    this.workspaces.push(workspace);
    this.currentWorkspace = workspace;
    this.saveWorkspaces();
    this.refreshWorkspacesList();
  },

  createFloatingWindow(type) {
    const windowId = `window-${++this.windowCounter}`;
    
    // Create floating window
    const floatingWindow = document.createElement('div');
    floatingWindow.id = windowId;
    floatingWindow.style.cssText = `
      position: fixed;
      top: 100px;
      left: 100px;
      width: 600px;
      height: 400px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      resize: both;
      overflow: hidden;
    `;

    // Window header
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
    `;

    const typeIcons = {
      'document': '📄',
      'tools': '🛠️',
      'reference': '📚'
    };

    header.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.2em;">${typeIcons[type] || '🪟'}</span>
        <span style="font-weight: bold;">${type.charAt(0).toUpperCase() + type.slice(1)} Window</span>
      </div>
      <div style="display: flex; gap: 8px;">
        <button onclick="this.minimizeWindow('${windowId}')" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 3px;
          cursor: pointer;
        ">−</button>
        <button onclick="this.maximizeWindow('${windowId}')" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 3px;
          cursor: pointer;
        ">□</button>
        <button onclick="this.closeFloatingWindow('${windowId}')" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 3px;
          cursor: pointer;
        ">×</button>
      </div>
    `;

    // Window content
    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
      padding: 20px;
      overflow: auto;
      background: white;
    `;

    content.innerHTML = this.getWindowContent(type);

    floatingWindow.appendChild(header);
    floatingWindow.appendChild(content);
    document.body.appendChild(floatingWindow);

    // Make window draggable
    this.makeDraggable(floatingWindow, header);

    // Store window reference
    this.floatingWindows.set(windowId, {
      element: floatingWindow,
      type: type,
      created: new Date().toISOString()
    });

    this.updateFloatingWindowsList();
  },

  getWindowContent(type) {
    switch (type) {
      case 'document':
        return `
          <h3>Document Editor</h3>
          <div contenteditable="true" style="
            min-height: 200px;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 4px;
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
          " placeholder="Start typing your document...">
            This is a floating document editor window. You can drag this window to any monitor and work on your document while having other tools open on different monitors.
          </div>
        `;
      
      case 'tools':
        return `
          <h3>Tools Panel</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">
            <button style="padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa; cursor: pointer;">📝 Text</button>
            <button style="padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa; cursor: pointer;">🖼️ Image</button>
            <button style="padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa; cursor: pointer;">📊 Chart</button>
            <button style="padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa; cursor: pointer;">🔗 Link</button>
            <button style="padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa; cursor: pointer;">📋 Table</button>
            <button style="padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa; cursor: pointer;">🎨 Style</button>
          </div>
        `;
      
      case 'reference':
        return `
          <h3>Reference Materials</h3>
          <div style="background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-bottom: 15px;">
            <h4>Quick Notes</h4>
            <ul>
              <li>Important research points</li>
              <li>Key references and citations</li>
              <li>Project requirements</li>
              <li>Meeting notes and action items</li>
            </ul>
          </div>
          <div style="background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; padding: 15px;">
            <h4>Resources</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <a href="#" style="color: #007bff; text-decoration: none;">📄 Project Documentation</a>
              <a href="#" style="color: #007bff; text-decoration: none;">🔗 External References</a>
              <a href="#" style="color: #007bff; text-decoration: none;">📊 Data Sources</a>
              <a href="#" style="color: #007bff; text-decoration: none;">👥 Team Contacts</a>
            </div>
          </div>
        `;
      
      default:
        return `
          <h3>Floating Window</h3>
          <p>This is a floating window that can be moved across monitors for multi-monitor productivity.</p>
        `;
    }
  },

  makeDraggable(element, handle) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    handle.addEventListener('mousedown', (e) => {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === handle || handle.contains(e.target)) {
        isDragging = true;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
    });

    document.addEventListener('mouseup', () => {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    });
  },

  closeFloatingWindow(windowId) {
    const window = this.floatingWindows.get(windowId);
    if (window) {
      window.element.remove();
      this.floatingWindows.delete(windowId);
      this.updateFloatingWindowsList();
    }
  },

  updateFloatingWindowsList() {
    const list = document.getElementById('floating-windows-list');
    if (!list) return;

    if (this.floatingWindows.size === 0) {
      list.innerHTML = `
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic; padding: 20px;">
          <div style="font-size: 2em; margin-bottom: 10px;">🪟</div>
          <div>No floating windows open</div>
          <div style="font-size: 0.9em; margin-top: 5px;">Create floating windows to work across monitors</div>
        </div>
      `;
      return;
    }

    const windowsHTML = Array.from(this.floatingWindows.entries()).map(([id, window]) => `
      <div style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <div style="font-weight: bold; color: var(--hermes-text); font-size: 0.9em;">
            ${window.type.charAt(0).toUpperCase() + window.type.slice(1)} Window
          </div>
          <div style="font-size: 0.7em; color: var(--hermes-disabled-text);">
            Created: ${new Date(window.created).toLocaleTimeString()}
          </div>
        </div>
        <button onclick="this.closeFloatingWindow('${id}')" style="
          padding: 4px 8px;
          border: none;
          border-radius: 3px;
          background: var(--hermes-error-text);
          color: white;
          cursor: pointer;
          font-size: 0.8em;
        ">Close</button>
      </div>
    `).join('');

    list.innerHTML = windowsHTML;
  },

  assignWorkspaceToMonitor(monitorId) {
    if (!this.currentWorkspace) {
      alert('Please create a workspace first');
      return;
    }

    const monitor = this.monitors.find(m => m.id === monitorId);
    if (monitor) {
      monitor.workspaceId = this.currentWorkspace.id;
      alert(`Workspace "${this.currentWorkspace.name}" assigned to ${monitor.label}`);
    }
  },

  openWindowOnMonitor(monitorId) {
    const monitor = this.monitors.find(m => m.id === monitorId);
    if (!monitor) return;

    // Calculate position for the monitor
    const left = monitor.left + 100;
    const top = monitor.top + 100;

    // Open a new window positioned on the specific monitor
    const newWindow = window.open(
      window.location.href,
      `monitor-${monitorId}`,
      `width=800,height=600,left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (newWindow) {
      // Store reference to the new window
      setTimeout(() => {
        newWindow.document.title = `NextNote - ${monitor.label}`;
      }, 100);
    } else {
      alert('Popup blocked. Please allow popups for multi-monitor functionality.');
    }
  },

  saveWorkspaceLayout() {
    if (!this.currentWorkspace) {
      alert('No active workspace to save');
      return;
    }

    // Save current window positions and monitor assignments
    this.currentWorkspace.windows = Array.from(this.floatingWindows.entries()).map(([id, window]) => ({
      id,
      type: window.type,
      position: {
        x: window.element.offsetLeft,
        y: window.element.offsetTop,
        width: window.element.offsetWidth,
        height: window.element.offsetHeight
      }
    }));

    this.currentWorkspace.monitors = this.monitors.map(monitor => ({
      ...monitor,
      workspaceId: monitor.workspaceId
    }));

    this.saveWorkspaces();
    alert('Workspace layout saved!');
  },

  loadWorkspace(workspaceId) {
    const workspace = this.workspaces.find(w => w.id === workspaceId);
    if (!workspace) return;

    this.currentWorkspace = workspace;

    // Close existing floating windows
    this.floatingWindows.forEach((window, id) => {
      this.closeFloatingWindow(id);
    });

    // Recreate windows from workspace
    if (workspace.windows) {
      workspace.windows.forEach(windowData => {
        this.createFloatingWindow(windowData.type);
        
        // Position the window
        const windowElement = this.floatingWindows.get(`window-${this.windowCounter}`);
        if (windowElement && windowData.position) {
          windowElement.element.style.left = windowData.position.x + 'px';
          windowElement.element.style.top = windowData.position.y + 'px';
          windowElement.element.style.width = windowData.position.width + 'px';
          windowElement.element.style.height = windowData.position.height + 'px';
        }
      });
    }

    alert(`Workspace "${workspace.name}" loaded!`);
  },

  refreshWorkspacesList() {
    const list = document.getElementById('workspaces-list');
    if (list) {
      list.innerHTML = this.workspaces.length === 0 ? `
        <div style="
          grid-column: 1 / -1;
          text-align: center;
          color: var(--hermes-disabled-text);
          font-style: italic;
          padding: 40px;
        ">
          <div style="font-size: 3em; margin-bottom: 15px;">🏢</div>
          <div>No workspaces created yet</div>
          <div style="font-size: 0.9em; margin-top: 5px;">Create your first multi-monitor workspace</div>
        </div>
      ` : this.generateWorkspacesList();
    }
  },

  saveWorkspaces() {
    localStorage.setItem('nextnote_workspaces', JSON.stringify(this.workspaces));
  },

  initializeWorkspaceComponents(app) {
    // Add CSS for multi-monitor workspace
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatMonitor {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-8px) rotate(2deg); }
      }
      
      .floating-window {
        transition: box-shadow 0.2s;
      }
      
      .floating-window:hover {
        box-shadow: 0 8px 25px rgba(0,0,0,0.4);
      }
    `;
    document.head.appendChild(style);
  },

  bindWorkspaceEvents(app) {
    // Listen for workspace events
    app.on('workspaceChanged', (workspaceId) => {
      this.loadWorkspace(workspaceId);
    });

    // Handle window resize for layout updates
    window.addEventListener('resize', () => {
      this.updateLayoutVisualizer();
    });
  }
});
