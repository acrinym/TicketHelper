// plugins/plugin-mindmap.js

window.registerNextNotePlugin({
  name: "Mindmap",
  onLoad: function(app) {
    // Mindmap-specific styling
    const mindmapStyle = document.createElement("style");
    mindmapStyle.textContent = `
      .mindmap-mode {
        --mindmap-primary: #8e44ad;
        --mindmap-secondary: #9b59b6;
        --mindmap-accent: #e74c3c;
        --mindmap-success: #27ae60;
        --mindmap-warning: #f39c12;
        --mindmap-info: #3498db;
        --mindmap-light: #f8f9fa;
        --mindmap-dark: #2c3e50;
      }
      
      .mindmap-canvas {
        background: var(--mindmap-light);
        border: 2px solid var(--mindmap-primary);
        border-radius: 12px;
        margin: 15px 0;
        min-height: 400px;
        position: relative;
        overflow: hidden;
      }
      
      .mindmap-node {
        position: absolute;
        background: white;
        border: 2px solid var(--mindmap-primary);
        border-radius: 8px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: var(--mindmap-dark);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.2s;
        min-width: 100px;
        text-align: center;
        user-select: none;
      }
      
      .mindmap-node:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      .mindmap-node.selected {
        border-color: var(--mindmap-accent);
        background: #fff5f5;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
      }
      
      .mindmap-node.root {
        background: var(--mindmap-primary);
        color: white;
        font-weight: bold;
        font-size: 16px;
      }
      
      .mindmap-node.child {
        background: white;
        border-color: var(--mindmap-secondary);
      }
      
      .mindmap-node.grandchild {
        background: #f8f9fa;
        border-color: var(--mindmap-info);
        font-size: 12px;
      }
      
      .mindmap-connection {
        position: absolute;
        background: var(--mindmap-secondary);
        height: 2px;
        transform-origin: left center;
        z-index: -1;
      }
      
      .mindmap-toolbar {
        background: var(--mindmap-primary);
        color: white;
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 15px;
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }
      
      .mindmap-toolbar button {
        background: var(--mindmap-secondary);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }
      
      .mindmap-toolbar button:hover {
        background: #8e44ad;
      }
      
      .mindmap-toolbar button.danger {
        background: var(--mindmap-accent);
      }
      
      .mindmap-toolbar button.danger:hover {
        background: #c0392b;
      }
      
      .mindmap-controls {
        position: absolute;
        top: 10px;
        right: 10px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 8px;
        display: flex;
        gap: 5px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .mindmap-controls button {
        background: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 11px;
      }
      
      .mindmap-controls button:hover {
        background: #e9ecef;
      }
      
      /* Floating button removed - functionality integrated into main toolbar */
      
      .mindmap-node-menu {
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 5px 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        min-width: 120px;
      }
      
      .mindmap-node-menu button {
        display: block;
        width: 100%;
        padding: 6px 12px;
        border: none;
        background: none;
        text-align: left;
        cursor: pointer;
        font-size: 12px;
      }
      
      .mindmap-node-menu button:hover {
        background: #f8f9fa;
      }
      
      .mindmap-node-menu button.danger {
        color: var(--mindmap-accent);
      }
    `;
    document.head.appendChild(mindmapStyle);

    // Mindmap state
    let mindmapMode = false;
    let mindmapData = JSON.parse(localStorage.getItem('nextnote_mindmap_data') || '[]');
    let selectedNode = null;
    let canvas = null;
    let nodes = [];
    let connections = [];

    // Mindmap functionality is now integrated into the main toolbar
    // No floating button needed

    function toggleMindmapMode() {
      mindmapMode = !mindmapMode;
      if (mindmapMode) {
        enableMindmapMode();
      } else {
        disableMindmapMode();
      }
    }

    function enableMindmapMode() {
      document.body.classList.add('mindmap-mode');
      
      // Add mindmap toolbar
      addMindmapToolbar();
      
      // Create mindmap canvas
      createMindmapCanvas();
      
      // Load mindmap data
      loadMindmapData();
      
      // Render mindmap
      renderMindmap();
    }

    function disableMindmapMode() {
      document.body.classList.remove('mindmap-mode');
      
      // Remove mindmap elements
      const mindmapElements = document.querySelectorAll('.mindmap-toolbar, .mindmap-canvas');
      mindmapElements.forEach(el => el.remove());
      
      // Save mindmap data
      saveMindmapData();
    }

    function addMindmapToolbar() {
      const toolbar = document.createElement('div');
      toolbar.className = 'mindmap-toolbar';
      toolbar.innerHTML = `
        <button onclick="addMindmapNode()">➕ Add Node</button>
        <button onclick="addChildNode()">➕ Add Child</button>
        <button onclick="editSelectedNode()">✏️ Edit</button>
        <button onclick="deleteSelectedNode()" class="danger">🗑️ Delete</button>
        <button onclick="exportMindmap()">📤 Export</button>
        <button onclick="importMindmap()">📥 Import</button>
        <button onclick="clearMindmap()" class="danger">🗑️ Clear All</button>
        <button onclick="autoLayout()">🎨 Auto Layout</button>
        <button onclick="saveMindmapAsNote()">💾 Save as Note</button>
      `;
      
      // Insert after main toolbar
      const mainToolbar = document.getElementById('toolbar');
      mainToolbar.parentNode.insertBefore(toolbar, mainToolbar.nextSibling);
    }

    function createMindmapCanvas() {
      canvas = document.createElement('div');
      canvas.className = 'mindmap-canvas';
      canvas.innerHTML = `
        <div class="mindmap-controls">
          <button onclick="zoomIn()">🔍+</button>
          <button onclick="zoomOut()">🔍-</button>
          <button onclick="resetZoom()">🔍</button>
          <button onclick="centerView()">🎯</button>
        </div>
      `;
      
      // Insert before editor
      const editor = document.getElementById('quillEditorContainer');
      editor.parentNode.insertBefore(canvas, editor);
      
      // Add canvas event listeners
      canvas.addEventListener('click', function(e) {
        if (e.target === canvas) {
          deselectNode();
        }
      });
    }

    function loadMindmapData() {
      if (mindmapData.length === 0) {
        // Create default mindmap
        mindmapData = [
          {
            id: 'root',
            text: 'Main Topic',
            x: 400,
            y: 200,
            type: 'root',
            children: []
          }
        ];
      }
    }

    function renderMindmap() {
      if (!canvas) return;
      
      // Clear existing nodes and connections
      nodes.forEach(node => node.remove());
      connections.forEach(conn => conn.remove());
      nodes = [];
      connections = [];
      
      // Create nodes
      mindmapData.forEach(nodeData => {
        createNode(nodeData);
      });
      
      // Create connections
      mindmapData.forEach(nodeData => {
        if (nodeData.children) {
          nodeData.children.forEach(childId => {
            createConnection(nodeData.id, childId);
          });
        }
      });
    }

    function createNode(nodeData) {
      const node = document.createElement('div');
      node.className = `mindmap-node ${nodeData.type}`;
      node.id = `node-${nodeData.id}`;
      node.textContent = nodeData.text;
      node.style.left = nodeData.x + 'px';
      node.style.top = nodeData.y + 'px';
      node.dataset.nodeId = nodeData.id;
      
      // Add event listeners
      node.addEventListener('click', function(e) {
        e.stopPropagation();
        selectNode(nodeData.id);
      });
      
      node.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showNodeMenu(e, nodeData.id);
      });
      
      // Make draggable
      makeNodeDraggable(node, nodeData);
      
      canvas.appendChild(node);
      nodes.push(node);
    }

    function createConnection(fromId, toId) {
      const fromNode = document.getElementById(`node-${fromId}`);
      const toNode = document.getElementById(`node-${toId}`);
      
      if (!fromNode || !toNode) return;
      
      const connection = document.createElement('div');
      connection.className = 'mindmap-connection';
      
      canvas.appendChild(connection);
      connections.push(connection);
      
      updateConnection(connection, fromNode, toNode);
    }

    function updateConnection(connection, fromNode, toNode) {
      const fromRect = fromNode.getBoundingClientRect();
      const toRect = toNode.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      
      const fromX = fromRect.left + fromRect.width / 2 - canvasRect.left;
      const fromY = fromRect.top + fromRect.height / 2 - canvasRect.top;
      const toX = toRect.left + toRect.width / 2 - canvasRect.left;
      const toY = toRect.top + toRect.height / 2 - canvasRect.top;
      
      const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
      const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
      
      connection.style.width = length + 'px';
      connection.style.left = fromX + 'px';
      connection.style.top = fromY + 'px';
      connection.style.transform = `rotate(${angle}deg)`;
    }

    function makeNodeDraggable(node, nodeData) {
      let isDragging = false;
      let startX, startY;
      
      node.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX - nodeData.x;
        startY = e.clientY - nodeData.y;
        node.style.zIndex = '1000';
      });
      
      document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        nodeData.x = e.clientX - startX;
        nodeData.y = e.clientY - startY;
        
        node.style.left = nodeData.x + 'px';
        node.style.top = nodeData.y + 'px';
        
        // Update connections
        updateAllConnections();
      });
      
      document.addEventListener('mouseup', function() {
        if (isDragging) {
          isDragging = false;
          node.style.zIndex = 'auto';
          saveMindmapData();
        }
      });
    }

    function updateAllConnections() {
      connections.forEach((conn, index) => {
        const fromId = mindmapData.find(n => n.children && n.children.includes(mindmapData[index].id))?.id;
        const toId = mindmapData[index].id;
        
        if (fromId) {
          const fromNode = document.getElementById(`node-${fromId}`);
          const toNode = document.getElementById(`node-${toId}`);
          if (fromNode && toNode) {
            updateConnection(conn, fromNode, toNode);
          }
        }
      });
    }

    function selectNode(nodeId) {
      // Deselect previous node
      if (selectedNode) {
        const prevNode = document.getElementById(`node-${selectedNode}`);
        if (prevNode) prevNode.classList.remove('selected');
      }
      
      selectedNode = nodeId;
      const node = document.getElementById(`node-${nodeId}`);
      if (node) {
        node.classList.add('selected');
      }
    }

    function deselectNode() {
      if (selectedNode) {
        const node = document.getElementById(`node-${selectedNode}`);
        if (node) node.classList.remove('selected');
        selectedNode = null;
      }
    }

    function showNodeMenu(e, nodeId) {
      const menu = document.createElement('div');
      menu.className = 'mindmap-node-menu';
      menu.style.left = e.clientX + 'px';
      menu.style.top = e.clientY + 'px';
      menu.innerHTML = `
        <button onclick="editNode('${nodeId}')">✏️ Edit</button>
        <button onclick="addChildToNode('${nodeId}')">➕ Add Child</button>
        <button onclick="deleteNode('${nodeId}')" class="danger">🗑️ Delete</button>
        <button onclick="changeNodeColor('${nodeId}')">🎨 Change Color</button>
      `;
      
      document.body.appendChild(menu);
      
      // Remove menu when clicking outside
      setTimeout(() => {
        document.addEventListener('click', function removeMenu() {
          menu.remove();
          document.removeEventListener('click', removeMenu);
        });
      }, 100);
    }

    // Mindmap utility functions
    function addMindmapNode() {
      const text = prompt('Enter node text:');
      if (!text) return;
      
      const newNode = {
        id: 'node_' + Date.now(),
        text: text,
        x: Math.random() * 300 + 200,
        y: Math.random() * 300 + 100,
        type: 'child',
        children: []
      };
      
      mindmapData.push(newNode);
      createNode(newNode);
      saveMindmapData();
    }

    function addChildNode() {
      if (!selectedNode) {
        alert('Please select a node first');
        return;
      }
      
      const text = prompt('Enter child node text:');
      if (!text) return;
      
      const parentNode = mindmapData.find(n => n.id === selectedNode);
      if (!parentNode) return;
      
      const childNode = {
        id: 'node_' + Date.now(),
        text: text,
        x: parentNode.x + Math.random() * 200 - 100,
        y: parentNode.y + Math.random() * 200 - 100,
        type: 'grandchild',
        children: []
      };
      
      mindmapData.push(childNode);
      parentNode.children.push(childNode.id);
      
      createNode(childNode);
      createConnection(selectedNode, childNode.id);
      saveMindmapData();
    }

    function addChildToNode(nodeId) {
      const text = prompt('Enter child node text:');
      if (!text) return;
      
      const parentNode = mindmapData.find(n => n.id === nodeId);
      if (!parentNode) return;
      
      const childNode = {
        id: 'node_' + Date.now(),
        text: text,
        x: parentNode.x + Math.random() * 200 - 100,
        y: parentNode.y + Math.random() * 200 - 100,
        type: 'grandchild',
        children: []
      };
      
      mindmapData.push(childNode);
      parentNode.children.push(childNode.id);
      
      createNode(childNode);
      createConnection(nodeId, childNode.id);
      saveMindmapData();
    }

    function editSelectedNode() {
      if (!selectedNode) {
        alert('Please select a node first');
        return;
      }
      
      const node = mindmapData.find(n => n.id === selectedNode);
      if (!node) return;
      
      const newText = prompt('Edit node text:', node.text);
      if (newText !== null) {
        node.text = newText;
        const nodeElement = document.getElementById(`node-${selectedNode}`);
        if (nodeElement) {
          nodeElement.textContent = newText;
        }
        saveMindmapData();
      }
    }

    function editNode(nodeId) {
      const node = mindmapData.find(n => n.id === nodeId);
      if (!node) return;
      
      const newText = prompt('Edit node text:', node.text);
      if (newText !== null) {
        node.text = newText;
        const nodeElement = document.getElementById(`node-${nodeId}`);
        if (nodeElement) {
          nodeElement.textContent = newText;
        }
        saveMindmapData();
      }
    }

    function deleteSelectedNode() {
      if (!selectedNode) {
        alert('Please select a node first');
        return;
      }
      
      if (confirm('Delete this node and all its children?')) {
        deleteNode(selectedNode);
      }
    }

    function deleteNode(nodeId) {
      const node = mindmapData.find(n => n.id === nodeId);
      if (!node) return;
      
      // Delete children recursively
      if (node.children) {
        node.children.forEach(childId => {
          deleteNode(childId);
        });
      }
      
      // Remove from parent's children
      mindmapData.forEach(n => {
        if (n.children && n.children.includes(nodeId)) {
          n.children = n.children.filter(id => id !== nodeId);
        }
      });
      
      // Remove from mindmapData
      mindmapData = mindmapData.filter(n => n.id !== nodeId);
      
      // Remove from DOM
      const nodeElement = document.getElementById(`node-${nodeId}`);
      if (nodeElement) {
        nodeElement.remove();
      }
      
      // Re-render connections
      renderMindmap();
      saveMindmapData();
    }

    function exportMindmap() {
      const mindmapExport = {
        title: 'NextNote Mindmap Export',
        data: mindmapData,
        exported: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(mindmapExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nextnote-mindmap-export.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    function importMindmap() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
          try {
            const mindmapExport = JSON.parse(event.target.result);
            if (mindmapExport.data) {
              mindmapData = mindmapExport.data;
              localStorage.setItem('nextnote_mindmap_data', JSON.stringify(mindmapData));
              renderMindmap();
              alert('Mindmap imported successfully!');
            }
          } catch (err) {
            alert('Failed to import mindmap: ' + err.message);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }

    function clearMindmap() {
      if (confirm('Clear entire mindmap?')) {
        mindmapData = [];
        localStorage.setItem('nextnote_mindmap_data', JSON.stringify(mindmapData));
        renderMindmap();
      }
    }

    function autoLayout() {
      // Simple auto-layout algorithm
      const rootNode = mindmapData.find(n => n.type === 'root');
      if (!rootNode) return;
      
      const centerX = 400;
      const centerY = 200;
      const radius = 150;
      
      rootNode.x = centerX;
      rootNode.y = centerY;
      
      if (rootNode.children) {
        const angleStep = (2 * Math.PI) / rootNode.children.length;
        rootNode.children.forEach((childId, index) => {
          const child = mindmapData.find(n => n.id === childId);
          if (child) {
            const angle = index * angleStep;
            child.x = centerX + Math.cos(angle) * radius;
            child.y = centerY + Math.sin(angle) * radius;
          }
        });
      }
      
      renderMindmap();
      saveMindmapData();
    }

    function saveMindmapAsNote() {
      const mindmapText = convertMindmapToText();
      
      // Create a new page with the mindmap
      if (window.sections && window.sections.length > 0) {
        const newPage = {
          id: crypto.randomUUID(),
          title: 'Mindmap - ' + new Date().toLocaleDateString(),
          content: mindmapText,
          tags: ['mindmap'],
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        };
        
        window.sections[0].pages.push(newPage);
        
        // Save data and render
        if (window.saveData) {
          window.saveData();
        }
        if (window.renderSections) {
          window.renderSections();
        }
        if (window.selectPage) {
          window.selectPage(window.sections[0].id, newPage.id);
        }
        
        alert('Mindmap saved as note!');
      } else {
        alert('No sections available. Please create a section first.');
      }
    }

    function convertMindmapToText() {
      let text = '# 🧠 Mindmap\n\n';
      
      function addNode(node, level = 0) {
        const indent = '  '.repeat(level);
        text += `${indent}- ${node.text}\n`;
        
        if (node.children) {
          node.children.forEach(childId => {
            const child = mindmapData.find(n => n.id === childId);
            if (child) {
              addNode(child, level + 1);
            }
          });
        }
      }
      
      const rootNode = mindmapData.find(n => n.type === 'root');
      if (rootNode) {
        addNode(rootNode);
      }
      
      return text;
    }

    function zoomIn() {
      canvas.style.transform = 'scale(1.2)';
    }

    function zoomOut() {
      canvas.style.transform = 'scale(0.8)';
    }

    function resetZoom() {
      canvas.style.transform = 'scale(1)';
    }

    function centerView() {
      canvas.scrollIntoView({ behavior: 'smooth' });
    }

    function changeNodeColor(nodeId) {
      const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
      const node = mindmapData.find(n => n.id === nodeId);
      if (!node) return;
      
      const currentIndex = colors.indexOf(node.color || '#e74c3c');
      const nextIndex = (currentIndex + 1) % colors.length;
      node.color = colors[nextIndex];
      
      const nodeElement = document.getElementById(`node-${nodeId}`);
      if (nodeElement) {
        nodeElement.style.borderColor = node.color;
        nodeElement.style.background = node.color + '20';
      }
      
      saveMindmapData();
    }

    function saveMindmapData() {
      localStorage.setItem('nextnote_mindmap_data', JSON.stringify(mindmapData));
    }

    // Make functions globally available
    window.addMindmapNode = addMindmapNode;
    window.addChildNode = addChildNode;
    window.editSelectedNode = editSelectedNode;
    window.deleteSelectedNode = deleteSelectedNode;
    window.exportMindmap = exportMindmap;
    window.importMindmap = importMindmap;
    window.clearMindmap = clearMindmap;
    window.autoLayout = autoLayout;
    window.saveMindmapAsNote = saveMindmapAsNote;
    window.zoomIn = zoomIn;
    window.zoomOut = zoomOut;
    window.resetZoom = resetZoom;
    window.centerView = centerView;
    window.editNode = editNode;
    window.addChildToNode = addChildToNode;
    window.deleteNode = deleteNode;
    window.changeNodeColor = changeNodeColor;
    window.toggleMindmapMode = toggleMindmapMode;
  }
}); 