/**
 * NextNote Mind Map & Diagram Plugin
 * Interactive mind mapping, flowcharts, and diagram creation tool
 * Open-source alternative to MindMeister, Lucidchart, and Miro
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Mind Map & Diagrams',
  version: '1.0.0',
  description: 'Interactive mind mapping, flowcharts, and diagram creation',
  
  onLoad(app) {
    this.mindMaps = JSON.parse(localStorage.getItem('nextnote_mindmaps') || '[]');
    this.currentMap = null;
    this.selectedNode = null;
    this.setupMindMapUI(app);
    this.initializeMindMapComponents(app);
    this.bindMindMapEvents(app);
  },

  setupMindMapUI(app) {
    const panel = app.createPanel('mind-map', 'Mind Map & Diagrams');
    
    // Mind Map header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, var(--hermes-info-text), var(--hermes-highlight-bg));
      border-radius: 12px;
      color: white;
    `;

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0; color: white; display: flex; align-items: center; gap: 10px;';
    title.innerHTML = '🧠 Mind Map Studio';

    const newMapBtn = document.createElement('button');
    newMapBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
    `;
    newMapBtn.textContent = '+ New Map';
    newMapBtn.addEventListener('click', () => this.createNewMindMap(app));

    header.appendChild(title);
    header.appendChild(newMapBtn);
    panel.appendChild(header);

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      padding: 10px;
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      flex-wrap: wrap;
    `;

    const tools = [
      { id: 'select', icon: '👆', label: 'Select', active: true },
      { id: 'add-node', icon: '➕', label: 'Add Node' },
      { id: 'connect', icon: '🔗', label: 'Connect' },
      { id: 'delete', icon: '🗑️', label: 'Delete' },
      { id: 'zoom-in', icon: '🔍', label: 'Zoom In' },
      { id: 'zoom-out', icon: '🔎', label: 'Zoom Out' },
      { id: 'center', icon: '🎯', label: 'Center' }
    ];

    tools.forEach(tool => {
      const toolBtn = document.createElement('button');
      toolBtn.className = `mind-map-tool ${tool.active ? 'active' : ''}`;
      toolBtn.style.cssText = `
        padding: 8px 12px;
        border: 1px solid var(--hermes-border);
        border-radius: 4px;
        background: ${tool.active ? 'var(--hermes-highlight-bg)' : 'var(--hermes-button-bg)'};
        color: ${tool.active ? 'var(--hermes-highlight-text)' : 'var(--hermes-text)'};
        cursor: pointer;
        font-size: 0.9em;
        display: flex;
        align-items: center;
        gap: 5px;
      `;
      toolBtn.innerHTML = `${tool.icon} ${tool.label}`;
      toolBtn.addEventListener('click', () => this.selectTool(tool.id));
      toolbar.appendChild(toolBtn);
    });

    panel.appendChild(toolbar);

    // Canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: 500px;
      border: 2px solid var(--hermes-border);
      border-radius: 8px;
      background: var(--hermes-bg);
      overflow: hidden;
      cursor: grab;
    `;

    // Canvas
    const canvas = document.createElement('div');
    canvas.id = 'mind-map-canvas';
    canvas.style.cssText = `
      position: absolute;
      width: 2000px;
      height: 2000px;
      background: 
        radial-gradient(circle at 20px 20px, var(--hermes-border) 1px, transparent 1px),
        radial-gradient(circle at 60px 60px, var(--hermes-border) 1px, transparent 1px);
      background-size: 40px 40px, 40px 40px;
      background-position: 0 0, 20px 20px;
      transform: translate(-900px, -900px) scale(1);
      transform-origin: center;
      transition: transform 0.3s;
    `;

    canvasContainer.appendChild(canvas);
    panel.appendChild(canvasContainer);

    // Properties panel
    const propertiesPanel = document.createElement('div');
    propertiesPanel.id = 'node-properties';
    propertiesPanel.style.cssText = `
      margin-top: 20px;
      padding: 15px;
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      display: none;
    `;
    panel.appendChild(propertiesPanel);

    // Initialize with sample mind map
    this.createSampleMindMap();
  },

  createNewMindMap(app) {
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
      width: 400px;
      max-width: 90vw;
    `;

    dialog.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: var(--hermes-text);">Create New Mind Map</h3>
      <form id="new-mindmap-form">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Map Title</label>
          <input type="text" id="map-title" required style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Template</label>
          <select id="map-template" style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
            <option value="blank">Blank Mind Map</option>
            <option value="project">Project Planning</option>
            <option value="brainstorm">Brainstorming Session</option>
            <option value="flowchart">Process Flowchart</option>
            <option value="org-chart">Organization Chart</option>
          </select>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" id="cancel-mindmap" style="padding: 10px 20px; border: 1px solid var(--hermes-border); border-radius: 6px; background: var(--hermes-button-bg); color: var(--hermes-text); cursor: pointer;">Cancel</button>
          <button type="submit" style="padding: 10px 20px; border: none; border-radius: 6px; background: var(--hermes-highlight-bg); color: var(--hermes-highlight-text); cursor: pointer;">Create</button>
        </div>
      </form>
    `;

    dialog.querySelector('#cancel-mindmap').addEventListener('click', () => overlay.remove());
    dialog.querySelector('#new-mindmap-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = dialog.querySelector('#map-title').value;
      const template = dialog.querySelector('#map-template').value;
      this.createMindMapFromTemplate(title, template, app);
      overlay.remove();
    });

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  },

  createMindMapFromTemplate(title, template, app) {
    const mindMap = {
      id: crypto.randomUUID(),
      title: title,
      template: template,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      nodes: [],
      connections: []
    };

    // Add template-specific nodes
    switch (template) {
      case 'project':
        mindMap.nodes = [
          { id: 'root', text: title, x: 1000, y: 1000, type: 'root', color: '#4caf50' },
          { id: 'planning', text: 'Planning', x: 800, y: 900, type: 'branch', color: '#2196f3' },
          { id: 'execution', text: 'Execution', x: 1200, y: 900, type: 'branch', color: '#ff9800' },
          { id: 'review', text: 'Review', x: 1000, y: 1200, type: 'branch', color: '#9c27b0' }
        ];
        mindMap.connections = [
          { from: 'root', to: 'planning' },
          { from: 'root', to: 'execution' },
          { from: 'root', to: 'review' }
        ];
        break;
      case 'brainstorm':
        mindMap.nodes = [
          { id: 'root', text: title, x: 1000, y: 1000, type: 'root', color: '#ff5722' },
          { id: 'idea1', text: 'Idea 1', x: 800, y: 800, type: 'idea', color: '#ffeb3b' },
          { id: 'idea2', text: 'Idea 2', x: 1200, y: 800, type: 'idea', color: '#ffeb3b' },
          { id: 'idea3', text: 'Idea 3', x: 800, y: 1200, type: 'idea', color: '#ffeb3b' },
          { id: 'idea4', text: 'Idea 4', x: 1200, y: 1200, type: 'idea', color: '#ffeb3b' }
        ];
        mindMap.connections = [
          { from: 'root', to: 'idea1' },
          { from: 'root', to: 'idea2' },
          { from: 'root', to: 'idea3' },
          { from: 'root', to: 'idea4' }
        ];
        break;
      default:
        mindMap.nodes = [
          { id: 'root', text: title, x: 1000, y: 1000, type: 'root', color: '#4caf50' }
        ];
    }

    this.mindMaps.push(mindMap);
    this.currentMap = mindMap;
    this.saveMindMaps();
    this.renderMindMap();
    app.showToast(`Mind map "${title}" created successfully!`, 'success');
  },

  createSampleMindMap() {
    if (this.mindMaps.length === 0) {
      const sampleMap = {
        id: 'sample',
        title: 'NextNote Features',
        template: 'blank',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        nodes: [
          { id: 'root', text: 'NextNote', x: 1000, y: 1000, type: 'root', color: '#4caf50' },
          { id: 'notes', text: 'Note Taking', x: 800, y: 800, type: 'branch', color: '#2196f3' },
          { id: 'plugins', text: 'Plugins', x: 1200, y: 800, type: 'branch', color: '#ff9800' },
          { id: 'themes', text: 'Themes', x: 800, y: 1200, type: 'branch', color: '#9c27b0' },
          { id: 'export', text: 'Export', x: 1200, y: 1200, type: 'branch', color: '#f44336' },
          { id: 'rich-text', text: 'Rich Text', x: 650, y: 700, type: 'leaf', color: '#00bcd4' },
          { id: 'markdown', text: 'Markdown', x: 750, y: 650, type: 'leaf', color: '#00bcd4' }
        ],
        connections: [
          { from: 'root', to: 'notes' },
          { from: 'root', to: 'plugins' },
          { from: 'root', to: 'themes' },
          { from: 'root', to: 'export' },
          { from: 'notes', to: 'rich-text' },
          { from: 'notes', to: 'markdown' }
        ]
      };
      
      this.mindMaps.push(sampleMap);
      this.currentMap = sampleMap;
      this.saveMindMaps();
    } else {
      this.currentMap = this.mindMaps[0];
    }
    
    this.renderMindMap();
  },

  renderMindMap() {
    const canvas = document.getElementById('mind-map-canvas');
    if (!canvas || !this.currentMap) return;

    canvas.innerHTML = '';

    // Render connections first (so they appear behind nodes)
    this.currentMap.connections.forEach(connection => {
      this.renderConnection(connection, canvas);
    });

    // Render nodes
    this.currentMap.nodes.forEach(node => {
      this.renderNode(node, canvas);
    });
  },

  renderNode(node, canvas) {
    const nodeElement = document.createElement('div');
    nodeElement.className = 'mind-map-node';
    nodeElement.dataset.nodeId = node.id;
    
    const size = node.type === 'root' ? 120 : (node.type === 'branch' ? 100 : 80);
    
    nodeElement.style.cssText = `
      position: absolute;
      left: ${node.x - size/2}px;
      top: ${node.y - size/2}px;
      width: ${size}px;
      height: ${size}px;
      background: ${node.color};
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transition: all 0.2s;
      z-index: 10;
      color: white;
      font-weight: bold;
      font-size: ${node.type === 'root' ? '14px' : '12px'};
      text-align: center;
      padding: 5px;
      word-wrap: break-word;
      overflow: hidden;
    `;

    nodeElement.textContent = node.text;

    // Add event listeners
    nodeElement.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectNode(node);
    });

    nodeElement.addEventListener('mouseenter', () => {
      nodeElement.style.transform = 'scale(1.1)';
      nodeElement.style.zIndex = '20';
    });

    nodeElement.addEventListener('mouseleave', () => {
      nodeElement.style.transform = 'scale(1)';
      nodeElement.style.zIndex = '10';
    });

    // Make draggable
    this.makeDraggable(nodeElement, node);

    canvas.appendChild(nodeElement);
  },

  renderConnection(connection, canvas) {
    const fromNode = this.currentMap.nodes.find(n => n.id === connection.from);
    const toNode = this.currentMap.nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return;

    const line = document.createElement('div');
    line.className = 'mind-map-connection';
    
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    line.style.cssText = `
      position: absolute;
      left: ${fromNode.x}px;
      top: ${fromNode.y}px;
      width: ${length}px;
      height: 3px;
      background: linear-gradient(90deg, ${fromNode.color}, ${toNode.color});
      transform-origin: 0 50%;
      transform: rotate(${angle}deg);
      z-index: 1;
      opacity: 0.8;
    `;

    canvas.appendChild(line);
  },

  selectNode(node) {
    // Remove previous selection
    document.querySelectorAll('.mind-map-node').forEach(el => {
      el.style.borderColor = 'white';
    });

    // Select current node
    const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`);
    if (nodeElement) {
      nodeElement.style.borderColor = 'var(--hermes-highlight-bg)';
    }

    this.selectedNode = node;
    this.showNodeProperties(node);
  },

  showNodeProperties(node) {
    const propertiesPanel = document.getElementById('node-properties');
    if (!propertiesPanel) return;

    propertiesPanel.style.display = 'block';
    propertiesPanel.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">Node Properties</h4>
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Text</label>
        <input type="text" id="node-text" value="${node.text}" style="width: 100%; padding: 8px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
      </div>
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Color</label>
        <input type="color" id="node-color" value="${node.color}" style="width: 100%; padding: 8px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg);">
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Type</label>
        <select id="node-type" style="width: 100%; padding: 8px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
          <option value="root" ${node.type === 'root' ? 'selected' : ''}>Root</option>
          <option value="branch" ${node.type === 'branch' ? 'selected' : ''}>Branch</option>
          <option value="leaf" ${node.type === 'leaf' ? 'selected' : ''}>Leaf</option>
          <option value="idea" ${node.type === 'idea' ? 'selected' : ''}>Idea</option>
        </select>
      </div>
      <div style="display: flex; gap: 10px;">
        <button id="update-node" style="flex: 1; padding: 8px; border: none; border-radius: 4px; background: var(--hermes-highlight-bg); color: var(--hermes-highlight-text); cursor: pointer;">Update</button>
        <button id="delete-node" style="flex: 1; padding: 8px; border: none; border-radius: 4px; background: var(--hermes-error-text); color: white; cursor: pointer;">Delete</button>
      </div>
    `;

    // Bind events
    propertiesPanel.querySelector('#update-node').addEventListener('click', () => {
      node.text = propertiesPanel.querySelector('#node-text').value;
      node.color = propertiesPanel.querySelector('#node-color').value;
      node.type = propertiesPanel.querySelector('#node-type').value;
      this.saveMindMaps();
      this.renderMindMap();
    });

    propertiesPanel.querySelector('#delete-node').addEventListener('click', () => {
      this.deleteNode(node);
    });
  },

  deleteNode(node) {
    if (node.type === 'root') {
      alert('Cannot delete root node');
      return;
    }

    // Remove node
    this.currentMap.nodes = this.currentMap.nodes.filter(n => n.id !== node.id);
    
    // Remove connections
    this.currentMap.connections = this.currentMap.connections.filter(c => 
      c.from !== node.id && c.to !== node.id
    );

    this.selectedNode = null;
    document.getElementById('node-properties').style.display = 'none';
    this.saveMindMaps();
    this.renderMindMap();
  },

  makeDraggable(element, node) {
    let isDragging = false;
    let startX, startY, startNodeX, startNodeY;

    element.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Only left click
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startNodeX = node.x;
      startNodeY = node.y;
      element.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      node.x = startNodeX + dx;
      node.y = startNodeY + dy;
      
      element.style.left = `${node.x - 60}px`;
      element.style.top = `${node.y - 60}px`;
      
      // Update connections
      this.renderMindMap();
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = 'pointer';
        this.saveMindMaps();
      }
    });
  },

  selectTool(toolId) {
    // Update tool buttons
    document.querySelectorAll('.mind-map-tool').forEach(btn => {
      btn.classList.remove('active');
      btn.style.background = 'var(--hermes-button-bg)';
      btn.style.color = 'var(--hermes-text)';
    });

    const activeBtn = document.querySelector(`.mind-map-tool:nth-child(${['select', 'add-node', 'connect', 'delete', 'zoom-in', 'zoom-out', 'center'].indexOf(toolId) + 1})`);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.style.background = 'var(--hermes-highlight-bg)';
      activeBtn.style.color = 'var(--hermes-highlight-text)';
    }

    this.currentTool = toolId;

    // Handle tool-specific actions
    switch (toolId) {
      case 'zoom-in':
        this.zoomCanvas(1.2);
        break;
      case 'zoom-out':
        this.zoomCanvas(0.8);
        break;
      case 'center':
        this.centerCanvas();
        break;
    }
  },

  zoomCanvas(factor) {
    const canvas = document.getElementById('mind-map-canvas');
    if (!canvas) return;

    const currentTransform = canvas.style.transform;
    const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
    const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    const newScale = Math.max(0.2, Math.min(3, currentScale * factor));

    canvas.style.transform = currentTransform.replace(/scale\([^)]+\)/, `scale(${newScale})`);
  },

  centerCanvas() {
    const canvas = document.getElementById('mind-map-canvas');
    if (!canvas) return;

    canvas.style.transform = 'translate(-900px, -900px) scale(1)';
  },

  saveMindMaps() {
    localStorage.setItem('nextnote_mindmaps', JSON.stringify(this.mindMaps));
    if (this.currentMap) {
      this.currentMap.modified = new Date().toISOString();
    }
  },

  initializeMindMapComponents(app) {
    // Initialize mind map components
  },

  bindMindMapEvents(app) {
    // Listen for mind map events
    app.on('mindMapUpdated', (data) => {
      this.saveMindMaps();
    });
  }
});
