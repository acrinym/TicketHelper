// plugins/plugin-diagrambuilder.js

window.registerNextNotePlugin({
  name: "DiagramBuilder",
  onLoad: function(app) {
    // Diagram-specific styling
    const diagramStyle = document.createElement("style");
    diagramStyle.textContent = `
      .diagram-mode {
        --diagram-primary: #2c3e50;
        --diagram-secondary: #34495e;
        --diagram-accent: #3498db;
        --diagram-success: #27ae60;
        --diagram-warning: #f39c12;
        --diagram-danger: #e74c3c;
        --diagram-light: #ecf0f1;
        --diagram-dark: #2c3e50;
      }
      
      .diagram-canvas {
        background: white;
        border: 2px solid var(--diagram-primary);
        border-radius: 12px;
        margin: 15px 0;
        min-height: 500px;
        position: relative;
        overflow: hidden;
        background-image: 
          linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px);
        background-size: 20px 20px;
        transform-origin: top left;
        cursor: grab;
      }
      
      .diagram-canvas.panning {
        cursor: grabbing;
      }
      
      .diagram-canvas .grid-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px);
        background-size: 20px 20px;
        pointer-events: none;
        z-index: 0;
      }
      
      .selection-box {
        position: absolute;
        border: 2px dashed var(--diagram-accent);
        background: rgba(52, 152, 219, 0.1);
        pointer-events: none;
        z-index: 1000;
      }
      
      .diagram-shape {
        position: absolute;
        background: white;
        border: 2px solid var(--diagram-primary);
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        color: var(--diagram-dark);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.2s;
        min-width: 80px;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        user-select: none;
        padding: 8px;
      }
      
      .diagram-shape:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      .diagram-shape.selected {
        border-color: var(--diagram-accent);
        background: #fff5f5;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
      }
      
      .diagram-shape.rectangle {
        border-radius: 4px;
      }
      
      .diagram-shape.circle {
        border-radius: 50%;
        min-width: 60px;
        min-height: 60px;
      }
      
      .diagram-shape.diamond {
        transform: rotate(45deg);
        border-radius: 4px;
      }
      
      .diagram-shape.diamond .shape-text {
        transform: rotate(-45deg);
      }
      
      .diagram-shape.hexagon {
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      }
      
      .diagram-shape.arrow {
        background: transparent !important;
        border: none !important;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: visible;
      }
      
      /* Right arrow (default) */
      .diagram-shape.arrow::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 80%;
        height: 4px;
        background: var(--diagram-primary);
        border-radius: 2px;
      }
      
      .diagram-shape.arrow::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 12px solid var(--diagram-primary);
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
      }
      
      /* Left arrow */
      .diagram-shape.arrow.left::before {
        left: 20%;
        width: 80%;
      }
      
      .diagram-shape.arrow.left::after {
        right: auto;
        left: 0;
        border-left: none;
        border-right: 12px solid var(--diagram-primary);
      }
      
      /* Bidirectional arrow */
      .diagram-shape.arrow.bidirectional::before {
        left: 15%;
        width: 70%;
      }
      
      .diagram-shape.arrow.bidirectional::after {
        right: 0;
        border-left: 12px solid var(--diagram-primary);
      }
      
      .diagram-shape.arrow.bidirectional .arrow-head-left {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-right: 12px solid var(--diagram-primary);
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
      }
      
      /* Vertical arrows */
      .diagram-shape.arrow.up::before {
        left: 50%;
        top: 20%;
        transform: translateX(-50%);
        width: 4px;
        height: 80%;
      }
      
      .diagram-shape.arrow.up::after {
        right: auto;
        left: 50%;
        top: 0;
        transform: translateX(-50%);
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 12px solid var(--diagram-primary);
        border-top: none;
      }
      
      .diagram-shape.arrow.down::before {
        left: 50%;
        top: 0;
        transform: translateX(-50%);
        width: 4px;
        height: 80%;
      }
      
      .diagram-shape.arrow.down::after {
        right: auto;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 12px solid var(--diagram-primary);
        border-bottom: none;
      }
      
      .arrow-text {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        color: var(--diagram-dark);
        border: 1px solid var(--diagram-primary);
        white-space: nowrap;
        z-index: 10;
      }
      
      .diagram-connector {
        position: absolute;
        background: var(--diagram-primary);
        height: 2px;
        transform-origin: left center;
        z-index: 1;
      }
      
      .diagram-connector.arrow {
        background: none;
        border-top: 2px solid var(--diagram-primary);
      }
      
      .diagram-connector.arrow::after {
        content: '';
        position: absolute;
        right: -8px;
        top: -5px;
        width: 0;
        height: 0;
        border-left: 8px solid var(--diagram-primary);
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
      }
      
      .diagram-toolbar {
        background: var(--diagram-primary);
        color: white;
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 15px;
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }
      
      .diagram-toolbar button {
        background: var(--diagram-secondary);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }
      
      .diagram-toolbar button:hover {
        background: var(--diagram-accent);
      }
      
      .diagram-toolbar button.active {
        background: var(--diagram-accent);
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
      }
      
      .diagram-toolbar button.danger {
        background: var(--diagram-danger);
      }
      
      .diagram-toolbar button.danger:hover {
        background: #c0392b;
      }
      
      .diagram-palette {
        position: absolute;
        top: 10px;
        left: 10px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
      }
      
      .diagram-palette button {
        background: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 8px;
        cursor: pointer;
        font-size: 11px;
        width: 60px;
      }
      
      .diagram-palette button:hover {
        background: #e9ecef;
      }
      
      .diagram-palette button.active {
        background: var(--diagram-accent);
        color: white;
      }
      
      .diagram-properties {
        position: absolute;
        top: 10px;
        right: 10px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
        min-width: 200px;
        display: none;
      }
      
      .diagram-properties.show {
        display: block;
      }
      
      .diagram-properties input,
      .diagram-properties select {
        width: 100%;
        padding: 4px;
        margin: 2px 0;
        border: 1px solid #ddd;
        border-radius: 3px;
        font-size: 11px;
      }
      
      .diagram-properties label {
        font-size: 11px;
        font-weight: bold;
        color: var(--diagram-dark);
      }
      
      /* Floating button removed - functionality integrated into main toolbar */
      
      .diagram-connector-point {
        position: absolute;
        width: 8px;
        height: 8px;
        background: var(--diagram-accent);
        border: 2px solid white;
        border-radius: 50%;
        cursor: crosshair;
        z-index: 10;
      }
      
      .diagram-connector-point:hover {
        background: var(--diagram-danger);
        transform: scale(1.2);
      }
    `;
    document.head.appendChild(diagramStyle);

    // Diagram state
    let diagramMode = false;
    let diagramData = JSON.parse(localStorage.getItem('nextnote_diagram_data') || '[]');
    let selectedShape = null;
    let selectedConnector = null;
    let canvas = null;
    let shapes = [];
    let connectors = [];
    let currentTool = 'select';
    let isConnecting = false;
    let connectionStart = null;
    
    // Enhanced features state
    let undoStack = [];
    let redoStack = [];
    let maxUndoSteps = 50;
    let gridSize = 20;
    let snapToGrid = true;
    let canvasZoom = 1;
    let canvasPanX = 0;
    let canvasPanY = 0;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let selectedShapes = []; // For multi-selection
    let isMultiSelecting = false;
    let selectionBox = null;

    // Diagram functionality is now integrated into the main toolbar
    // No floating button needed

    function toggleDiagramMode() {
      diagramMode = !diagramMode;
      if (diagramMode) {
        enableDiagramMode();
      } else {
        disableDiagramMode();
      }
    }

    function enableDiagramMode() {
      document.body.classList.add('diagram-mode');
      
      // Add diagram toolbar
      addDiagramToolbar();
      
      // Create diagram canvas
      createDiagramCanvas();
      
      // Load diagram data
      loadDiagramData();
      
      // Render diagram
      renderDiagram();
    }

    function disableDiagramMode() {
      document.body.classList.remove('diagram-mode');
      
      // Remove diagram elements
      const diagramElements = document.querySelectorAll('.diagram-toolbar, .diagram-canvas, .diagram-palette, .diagram-properties');
      diagramElements.forEach(el => el.remove());
      
      // Save diagram data
      saveDiagramData();
    }

    function addDiagramToolbar() {
      const toolbar = document.createElement('div');
      toolbar.className = 'diagram-toolbar';
      toolbar.innerHTML = `
        <button onclick="setTool('select')" class="active">👆 Select</button>
        <button onclick="setTool('rectangle')">⬜ Rectangle</button>
        <button onclick="setTool('circle')">⭕ Circle</button>
        <button onclick="setTool('diamond')">💎 Diamond</button>
        <button onclick="setTool('hexagon')">⬡ Hexagon</button>
        <button onclick="setTool('arrow')">➡️ Arrow</button>
        <button onclick="setTool('arrow-left')">⬅️ Left</button>
        <button onclick="setTool('arrow-bidirectional')">⬌ Bidirectional</button>
        <button onclick="setTool('arrow-up')">⬆️ Up</button>
        <button onclick="setTool('arrow-down')">⬇️ Down</button>
        <button onclick="setTool('text')">📝 Text</button>
        <button onclick="setTool('connector')">🔗 Connector</button>
        <button onclick="showSelectedProperties()" id="propertiesBtn" disabled>⚙️ Properties</button>
        <button onclick="deleteSelected()" class="danger">🗑️ Delete</button>
        <button onclick="undoAction()" id="undoBtn" disabled>↶ Undo</button>
        <button onclick="redoAction()" id="redoBtn" disabled>↷ Redo</button>
        <button onclick="toggleSnapToGrid()" id="snapBtn">🔗 Snap</button>
        <button onclick="zoomIn()">🔍+</button>
        <button onclick="zoomOut()">🔍-</button>
        <button onclick="resetZoom()">🔍</button>
        <button onclick="exportAsPNG()">📷 PNG</button>
        <button onclick="exportAsSVG()">🎨 SVG</button>
        <button onclick="exportDiagram()">📤 Export</button>
        <button onclick="importDiagram()">📥 Import</button>
        <button onclick="clearDiagram()" class="danger">🗑️ Clear All</button>
        <button onclick="autoLayout()">🎨 Auto Layout</button>
        <button onclick="saveDiagramAsNote()">💾 Save as Note</button>
      `;
      
      // Insert after main toolbar
      const mainToolbar = document.getElementById('toolbar');
      mainToolbar.parentNode.insertBefore(toolbar, mainToolbar.nextSibling);
    }

    function createDiagramCanvas() {
      canvas = document.createElement('div');
      canvas.className = 'diagram-canvas';
      
      // Add grid overlay
      const gridOverlay = document.createElement('div');
      gridOverlay.className = 'grid-overlay';
      canvas.appendChild(gridOverlay);
      
      // Add shape palette
      const palette = document.createElement('div');
      palette.className = 'diagram-palette';
      palette.innerHTML = `
        <button onclick="setTool('select')" class="active">👆 Select</button>
        <button onclick="setTool('rectangle')">⬜ Rectangle</button>
        <button onclick="setTool('circle')">⭕ Circle</button>
        <button onclick="setTool('diamond')">💎 Diamond</button>
        <button onclick="setTool('hexagon')">⬡ Hexagon</button>
        <button onclick="setTool('arrow')">➡️ Arrow</button>
        <button onclick="setTool('arrow-left')">⬅️ Left</button>
        <button onclick="setTool('arrow-bidirectional')">⬌ Bidirectional</button>
        <button onclick="setTool('arrow-up')">⬆️ Up</button>
        <button onclick="setTool('arrow-down')">⬇️ Down</button>
        <button onclick="setTool('text')">📝 Text</button>
        <button onclick="setTool('connector')">🔗 Connect</button>
      `;
      canvas.appendChild(palette);
      
      // Add properties panel
      const properties = document.createElement('div');
      properties.className = 'diagram-properties';
      properties.innerHTML = `
        <h4 style="margin: 0 0 10px 0;">Properties</h4>
        <label>Text:</label>
        <input type="text" id="shapeText" onchange="updateSelectedText()">
        <label>Width:</label>
        <input type="number" id="shapeWidth" onchange="updateSelectedSize()">
        <label>Height:</label>
        <input type="number" id="shapeHeight" onchange="updateSelectedSize()">
        <label>Color:</label>
        <input type="color" id="shapeColor" onchange="updateSelectedColor()">
        <label>Border:</label>
        <input type="color" id="shapeBorder" onchange="updateSelectedBorder()">
        <label>Font Size:</label>
        <input type="number" id="shapeFontSize" onchange="updateSelectedFont()">
      `;
      canvas.appendChild(properties);
      
      // Insert before editor
      const editor = document.getElementById('quillEditorContainer');
      editor.parentNode.insertBefore(canvas, editor);
      
      // Add enhanced canvas event listeners
      setupCanvasEventListeners();
    }

    function loadDiagramData() {
      if (diagramData.length === 0) {
        // Create default diagram
        diagramData = {
          shapes: [],
          connectors: []
        };
      }
    }

    function renderDiagram() {
      if (!canvas) return;
      
      // Clear existing shapes and connectors
      shapes.forEach(shape => shape.remove());
      connectors.forEach(conn => conn.remove());
      shapes = [];
      connectors = [];
      
      // Create shapes
      diagramData.shapes.forEach(shapeData => {
        createShape(shapeData);
      });
      
      // Create connectors
      diagramData.connectors.forEach(connectorData => {
        createConnector(connectorData);
      });
    }

    function createShape(shapeData) {
      const shape = document.createElement('div');
      shape.className = `diagram-shape ${shapeData.type}`;
      shape.id = `shape-${shapeData.id}`;
      
      // Special handling for arrow shapes
      if (shapeData.type === 'arrow') {
        const arrowDirection = shapeData.direction || 'right';
        shape.className = `diagram-shape ${shapeData.type} ${arrowDirection}`;
        
        if (arrowDirection === 'bidirectional') {
          shape.innerHTML = `
            <div class="arrow-head-left"></div>
            <div class="arrow-text">${shapeData.text}</div>
          `;
        } else {
          shape.innerHTML = `<div class="arrow-text">${shapeData.text}</div>`;
        }
        
        shape.style.width = shapeData.width + 'px';
        shape.style.height = shapeData.height + 'px';
        shape.style.backgroundColor = 'transparent';
        shape.style.border = 'none';
      } else {
        // Regular shapes
        shape.innerHTML = `<div class="shape-text">${shapeData.text}</div>`;
        shape.style.width = shapeData.width + 'px';
        shape.style.height = shapeData.height + 'px';
        shape.style.backgroundColor = shapeData.color || 'white';
        shape.style.borderColor = shapeData.borderColor || 'var(--diagram-primary)';
        shape.style.fontSize = (shapeData.fontSize || 12) + 'px';
      }
      
      shape.style.left = shapeData.x + 'px';
      shape.style.top = shapeData.y + 'px';
      shape.dataset.shapeId = shapeData.id;
      
      // Add event listeners
      shape.addEventListener('click', function(e) {
        e.stopPropagation();
        selectShape(shapeData.id);
      });
      
      // Make draggable
      makeShapeDraggable(shape, shapeData);
      
      // Add connection points
      addConnectionPoints(shape, shapeData);
      
      canvas.appendChild(shape);
      shapes.push(shape);
    }

    function createConnector(connectorData) {
      const connector = document.createElement('div');
      connector.className = `diagram-connector ${connectorData.style}`;
      connector.id = `connector-${connectorData.id}`;
      connector.dataset.connectorId = connectorData.id;
      
      canvas.appendChild(connector);
      connectors.push(connector);
      
      updateConnector(connector, connectorData);
    }

    function updateConnector(connector, connectorData) {
      const fromShape = document.getElementById(`shape-${connectorData.from}`);
      const toShape = document.getElementById(`shape-${connectorData.to}`);
      
      if (!fromShape || !toShape) return;
      
      const fromRect = fromShape.getBoundingClientRect();
      const toRect = toShape.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      
      const fromX = fromRect.left + fromRect.width / 2 - canvasRect.left;
      const fromY = fromRect.top + fromRect.height / 2 - canvasRect.top;
      const toX = toRect.left + toRect.width / 2 - canvasRect.left;
      const toY = toRect.top + toRect.height / 2 - canvasRect.top;
      
      const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
      const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
      
      connector.style.width = length + 'px';
      connector.style.left = fromX + 'px';
      connector.style.top = fromY + 'px';
      connector.style.transform = `rotate(${angle}deg)`;
    }

    function addConnectionPoints(shape, shapeData) {
      const points = [
        { x: 0, y: 0.5, name: 'left' },
        { x: 1, y: 0.5, name: 'right' },
        { x: 0.5, y: 0, name: 'top' },
        { x: 0.5, y: 1, name: 'bottom' }
      ];
      
      points.forEach(point => {
        const pointEl = document.createElement('div');
        pointEl.className = 'diagram-connector-point';
        pointEl.style.left = (point.x * 100) + '%';
        pointEl.style.top = (point.y * 100) + '%';
        pointEl.dataset.point = point.name;
        pointEl.dataset.shapeId = shapeData.id;
        
        pointEl.addEventListener('click', function(e) {
          e.stopPropagation();
          handleConnectionPoint(shapeData.id, point.name);
        });
        
        shape.appendChild(pointEl);
      });
    }

    function handleConnectionPoint(shapeId, pointName) {
      if (currentTool === 'connector') {
        if (!isConnecting) {
          // Start connection
          isConnecting = true;
          connectionStart = { shapeId, pointName };
          alert('Click another shape to complete the connection');
        } else {
          // Complete connection
          if (connectionStart.shapeId !== shapeId) {
            const connectorData = {
              id: 'connector_' + Date.now(),
              from: connectionStart.shapeId,
              to: shapeId,
              style: 'arrow'
            };
            
            diagramData.connectors.push(connectorData);
            createConnector(connectorData);
            saveDiagramData();
          }
          
          isConnecting = false;
          connectionStart = null;
        }
      }
    }

    function makeShapeDraggable(shape, shapeData) {
      let isDragging = false;
      let startX, startY;
      
      shape.addEventListener('mousedown', function(e) {
        if (currentTool === 'select') {
          isDragging = true;
          startX = e.clientX - shapeData.x;
          startY = e.clientY - shapeData.y;
          shape.style.zIndex = '1000';
        }
      });
      
      document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        // Apply snap to grid during dragging
        const snappedPos = snapToGridPosition(e.clientX - startX, e.clientY - startY);
        
        shapeData.x = snappedPos.x;
        shapeData.y = snappedPos.y;
        
        shape.style.left = shapeData.x + 'px';
        shape.style.top = shapeData.y + 'px';
        
        // Update connectors
        updateAllConnectors();
      });
      
      document.addEventListener('mouseup', function() {
        if (isDragging) {
          isDragging = false;
          shape.style.zIndex = 'auto';
          saveDiagramData();
        }
      });
    }

    function updateAllConnectors() {
      connectors.forEach(conn => {
        const connectorId = conn.dataset.connectorId;
        const connectorData = diagramData.connectors.find(c => c.id === connectorId);
        if (connectorData) {
          updateConnector(conn, connectorData);
        }
      });
    }

    function selectShape(shapeId) {
      deselectAll();
      selectedShape = shapeId;
      const shape = document.getElementById(`shape-${shapeId}`);
      if (shape) {
        shape.classList.add('selected');
        // Enable properties button
        const propertiesBtn = document.getElementById('propertiesBtn');
        if (propertiesBtn) {
          propertiesBtn.disabled = false;
        }
      }
    }

    function deselectAll() {
      if (selectedShape) {
        const shape = document.getElementById(`shape-${selectedShape}`);
        if (shape) shape.classList.remove('selected');
        selectedShape = null;
      }
      if (selectedConnector) {
        const connector = document.getElementById(`connector-${selectedConnector}`);
        if (connector) connector.classList.remove('selected');
        selectedConnector = null;
      }
      hideProperties();
      
      // Disable properties button
      const propertiesBtn = document.getElementById('propertiesBtn');
      if (propertiesBtn) {
        propertiesBtn.disabled = true;
      }
    }

    function showProperties(shapeId) {
      const shapeData = diagramData.shapes.find(s => s.id === shapeId);
      if (!shapeData) return;
      
      const properties = document.querySelector('.diagram-properties');
      properties.classList.add('show');
      
      document.getElementById('shapeText').value = shapeData.text;
      document.getElementById('shapeWidth').value = shapeData.width;
      document.getElementById('shapeHeight').value = shapeData.height;
      document.getElementById('shapeColor').value = shapeData.color || '#ffffff';
      document.getElementById('shapeBorder').value = shapeData.borderColor || '#2c3e50';
      document.getElementById('shapeFontSize').value = shapeData.fontSize || 12;
    }

    function hideProperties() {
      const properties = document.querySelector('.diagram-properties');
      properties.classList.remove('show');
    }

    function showSelectedProperties() {
      if (selectedShape) {
        showProperties(selectedShape);
      }
    }

    // Diagram utility functions
    function setTool(tool) {
      currentTool = tool;
      
      // Update toolbar buttons
      document.querySelectorAll('.diagram-toolbar button').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');
      
      // Update palette buttons
      document.querySelectorAll('.diagram-palette button').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Handle canvas click for shape creation
      if (tool !== 'select' && tool !== 'connector') {
        canvas.style.cursor = 'crosshair';
        canvas.onclick = function(e) {
          if (e.target === canvas) {
            createShapeAtPosition(e.clientX, e.clientY, tool);
          }
        };
      } else {
        canvas.style.cursor = 'default';
        canvas.onclick = function(e) {
          if (e.target === canvas) {
            deselectAll();
          }
        };
      }
    }

    function createShapeAtPosition(x, y, type) {
      const canvasRect = canvas.getBoundingClientRect();
      
      // Set appropriate dimensions for different shape types
      let width, height, offsetX, offsetY;
      let arrowDirection = 'right';
      
      if (type === 'circle') {
        width = 80;
        height = 80;
        offsetX = 40;
        offsetY = 40;
      } else if (type === 'arrow') {
        width = 100;
        height = 20;
        offsetX = 50;
        offsetY = 10;
        arrowDirection = 'right';
      } else if (type === 'arrow-left') {
        width = 100;
        height = 20;
        offsetX = 50;
        offsetY = 10;
        arrowDirection = 'left';
        type = 'arrow';
      } else if (type === 'arrow-bidirectional') {
        width = 100;
        height = 20;
        offsetX = 50;
        offsetY = 10;
        arrowDirection = 'bidirectional';
        type = 'arrow';
      } else if (type === 'arrow-up') {
        width = 20;
        height = 100;
        offsetX = 10;
        offsetY = 50;
        arrowDirection = 'up';
        type = 'arrow';
      } else if (type === 'arrow-down') {
        width = 20;
        height = 100;
        offsetX = 10;
        offsetY = 50;
        arrowDirection = 'down';
        type = 'arrow';
      } else {
        width = 120;
        height = 60;
        offsetX = 60;
        offsetY = 30;
      }
      
      // Apply snap to grid
      const snappedPos = snapToGridPosition(x - canvasRect.left - offsetX, y - canvasRect.top - offsetY);
      
      const shapeData = {
        id: 'shape_' + Date.now(),
        type: type,
        text: type === 'arrow' ? '→' : type.charAt(0).toUpperCase() + type.slice(1),
        x: snappedPos.x,
        y: snappedPos.y,
        width: width,
        height: height,
        color: '#ffffff',
        borderColor: '#2c3e50',
        fontSize: 12
      };
      
      // Add arrow direction if it's an arrow
      if (type === 'arrow') {
        shapeData.direction = arrowDirection;
      }
      
      // Save to undo stack before adding shape
      saveToUndoStack();
      
      diagramData.shapes.push(shapeData);
      createShape(shapeData);
      saveDiagramData();
    }

    function deleteSelected() {
      if (selectedShape) {
        // Remove shape and its connectors
        diagramData.shapes = diagramData.shapes.filter(s => s.id !== selectedShape);
        diagramData.connectors = diagramData.connectors.filter(c => 
          c.from !== selectedShape && c.to !== selectedShape
        );
        
        const shape = document.getElementById(`shape-${selectedShape}`);
        if (shape) shape.remove();
        
        selectedShape = null;
        renderDiagram();
        saveDiagramData();
      }
    }

    function updateSelectedText() {
      if (!selectedShape) return;
      
      const text = document.getElementById('shapeText').value;
      const shapeData = diagramData.shapes.find(s => s.id === selectedShape);
      if (shapeData) {
        shapeData.text = text;
        const shape = document.getElementById(`shape-${selectedShape}`);
        if (shape) {
          if (shapeData.type === 'arrow') {
            const arrowText = shape.querySelector('.arrow-text');
            if (arrowText) {
              arrowText.textContent = text;
            }
          } else {
            const shapeText = shape.querySelector('.shape-text');
            if (shapeText) {
              shapeText.textContent = text;
            }
          }
        }
        saveDiagramData();
      }
    }

    function updateSelectedSize() {
      if (!selectedShape) return;
      
      const width = parseInt(document.getElementById('shapeWidth').value);
      const height = parseInt(document.getElementById('shapeHeight').value);
      const shapeData = diagramData.shapes.find(s => s.id === selectedShape);
      if (shapeData) {
        shapeData.width = width;
        shapeData.height = height;
        const shape = document.getElementById(`shape-${selectedShape}`);
        if (shape) {
          shape.style.width = width + 'px';
          shape.style.height = height + 'px';
        }
        updateAllConnectors();
        saveDiagramData();
      }
    }

    function updateSelectedColor() {
      if (!selectedShape) return;
      
      const color = document.getElementById('shapeColor').value;
      const shapeData = diagramData.shapes.find(s => s.id === selectedShape);
      if (shapeData) {
        shapeData.color = color;
        const shape = document.getElementById(`shape-${selectedShape}`);
        if (shape) {
          shape.style.backgroundColor = color;
        }
        saveDiagramData();
      }
    }

    function updateSelectedBorder() {
      if (!selectedShape) return;
      
      const borderColor = document.getElementById('shapeBorder').value;
      const shapeData = diagramData.shapes.find(s => s.id === selectedShape);
      if (shapeData) {
        shapeData.borderColor = borderColor;
        const shape = document.getElementById(`shape-${selectedShape}`);
        if (shape) {
          shape.style.borderColor = borderColor;
        }
        saveDiagramData();
      }
    }

    function updateSelectedFont() {
      if (!selectedShape) return;
      
      const fontSize = parseInt(document.getElementById('shapeFontSize').value);
      const shapeData = diagramData.shapes.find(s => s.id === selectedShape);
      if (shapeData) {
        shapeData.fontSize = fontSize;
        const shape = document.getElementById(`shape-${selectedShape}`);
        if (shape) {
          shape.style.fontSize = fontSize + 'px';
        }
        saveDiagramData();
      }
    }

    function exportDiagram() {
      const diagramExport = {
        title: 'NextNote Diagram Export',
        data: diagramData,
        exported: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(diagramExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nextnote-diagram-export.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    function importDiagram() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
          try {
            const diagramExport = JSON.parse(event.target.result);
            if (diagramExport.data) {
              diagramData = diagramExport.data;
              localStorage.setItem('nextnote_diagram_data', JSON.stringify(diagramData));
              renderDiagram();
              alert('Diagram imported successfully!');
            }
          } catch (err) {
            alert('Failed to import diagram: ' + err.message);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }

    function clearDiagram() {
      if (confirm('Clear entire diagram?')) {
        diagramData = { shapes: [], connectors: [] };
        localStorage.setItem('nextnote_diagram_data', JSON.stringify(diagramData));
        renderDiagram();
      }
    }

    function autoLayout() {
      // Simple auto-layout algorithm
      const centerX = 300;
      const centerY = 200;
      const radius = 150;
      
      diagramData.shapes.forEach((shape, index) => {
        const angle = (index * 2 * Math.PI) / diagramData.shapes.length;
        shape.x = centerX + Math.cos(angle) * radius;
        shape.y = centerY + Math.sin(angle) * radius;
      });
      
      renderDiagram();
      saveDiagramData();
    }

    function saveDiagramAsNote() {
      const diagramText = convertDiagramToText();
      
      // Create a new page with the diagram
      if (currentSection) {
        const newPage = {
          id: crypto.randomUUID(),
          title: 'Diagram - ' + new Date().toLocaleDateString(),
          content: diagramText,
          tags: ['diagram', 'flowchart'],
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        };
        
        currentSection.pages.push(newPage);
        saveData();
        renderSections();
        selectPage(currentSection.id, newPage.id);
        
        alert('Diagram saved as note!');
      } else {
        alert('Please create a section first!');
      }
    }

    function convertDiagramToText() {
      let text = '# 📐 Diagram\n\n';
      
      text += '## Shapes\n\n';
      diagramData.shapes.forEach(shape => {
        text += `- **${shape.text}** (${shape.type}) at (${Math.round(shape.x)}, ${Math.round(shape.y)})\n`;
      });
      
      text += '\n## Connections\n\n';
      diagramData.connectors.forEach(connector => {
        const fromShape = diagramData.shapes.find(s => s.id === connector.from);
        const toShape = diagramData.shapes.find(s => s.id === connector.to);
        if (fromShape && toShape) {
          text += `- ${fromShape.text} → ${toShape.text}\n`;
        }
      });
      
      return text;
    }

    function saveDiagramData() {
      localStorage.setItem('nextnote_diagram_data', JSON.stringify(diagramData));
    }

    // Enhanced Features Functions
    
    function setupCanvasEventListeners() {
      // Basic click handling
      canvas.addEventListener('click', function(e) {
        if (e.target === canvas) {
          deselectAll();
        }
      });
      
      // Pan functionality
      canvas.addEventListener('mousedown', function(e) {
        if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle click or Alt+left click
          e.preventDefault();
          isPanning = true;
          panStartX = e.clientX - canvasPanX;
          panStartY = e.clientY - canvasPanY;
          canvas.classList.add('panning');
        }
      });
      
      document.addEventListener('mousemove', function(e) {
        if (isPanning) {
          canvasPanX = e.clientX - panStartX;
          canvasPanY = e.clientY - panStartY;
          updateCanvasTransform();
        }
      });
      
      document.addEventListener('mouseup', function() {
        if (isPanning) {
          isPanning = false;
          canvas.classList.remove('panning');
        }
      });
      
      // Zoom with mouse wheel
      canvas.addEventListener('wheel', function(e) {
        if (e.ctrlKey) {
          e.preventDefault();
          const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
          const newZoom = Math.max(0.1, Math.min(3, canvasZoom * zoomFactor));
          setZoom(newZoom, e.offsetX, e.offsetY);
        }
      });
    }
    
    function updateCanvasTransform() {
      canvas.style.transform = `translate(${canvasPanX}px, ${canvasPanY}px) scale(${canvasZoom})`;
    }
    
    function setZoom(zoom, centerX = 0, centerY = 0) {
      canvasZoom = zoom;
      updateCanvasTransform();
    }
    
    function zoomIn() {
      setZoom(Math.min(3, canvasZoom * 1.2));
    }
    
    function zoomOut() {
      setZoom(Math.max(0.1, canvasZoom / 1.2));
    }
    
    function resetZoom() {
      canvasZoom = 1;
      canvasPanX = 0;
      canvasPanY = 0;
      updateCanvasTransform();
    }
    
    function toggleSnapToGrid() {
      snapToGrid = !snapToGrid;
      const snapBtn = document.getElementById('snapBtn');
      if (snapBtn) {
        snapBtn.classList.toggle('active', snapToGrid);
      }
    }
    
    function snapToGridPosition(x, y) {
      if (!snapToGrid) return { x, y };
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
      };
    }
    
    function saveToUndoStack() {
      const state = JSON.stringify(diagramData);
      undoStack.push(state);
      if (undoStack.length > maxUndoSteps) {
        undoStack.shift();
      }
      redoStack = []; // Clear redo stack when new action is performed
      updateUndoRedoButtons();
    }
    
    function undoAction() {
      if (undoStack.length === 0) return;
      
      const currentState = JSON.stringify(diagramData);
      redoStack.push(currentState);
      
      const previousState = undoStack.pop();
      diagramData = JSON.parse(previousState);
      
      renderDiagram();
      updateUndoRedoButtons();
    }
    
    function redoAction() {
      if (redoStack.length === 0) return;
      
      const currentState = JSON.stringify(diagramData);
      undoStack.push(currentState);
      
      const nextState = redoStack.pop();
      diagramData = JSON.parse(nextState);
      
      renderDiagram();
      updateUndoRedoButtons();
    }
    
    function updateUndoRedoButtons() {
      const undoBtn = document.getElementById('undoBtn');
      const redoBtn = document.getElementById('redoBtn');
      
      if (undoBtn) undoBtn.disabled = undoStack.length === 0;
      if (redoBtn) redoBtn.disabled = redoStack.length === 0;
    }
    
    function exportAsPNG() {
      if (!canvas) return;
      
      // Create a temporary canvas for rendering
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      // Get canvas dimensions
      const rect = canvas.getBoundingClientRect();
      tempCanvas.width = rect.width;
      tempCanvas.height = rect.height;
      
      // Set background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Convert canvas to data URL
      const dataURL = tempCanvas.toDataURL('image/png');
      
      // Download
      const link = document.createElement('a');
      link.download = 'diagram.png';
      link.href = dataURL;
      link.click();
    }
    
    function exportAsSVG() {
      if (!canvas) return;
      
      const svgWidth = 800;
      const svgHeight = 600;
      
      let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
      svg += `<rect width="100%" height="100%" fill="white"/>`;
      
      // Add shapes as SVG elements
      diagramData.shapes.forEach(shape => {
        if (shape.type === 'rectangle') {
          svg += `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${shape.color || 'white'}" stroke="${shape.borderColor || '#2c3e50'}" stroke-width="2"/>`;
          svg += `<text x="${shape.x + shape.width/2}" y="${shape.y + shape.height/2}" text-anchor="middle" dominant-baseline="middle" font-size="12">${shape.text}</text>`;
        } else if (shape.type === 'circle') {
          svg += `<circle cx="${shape.x + shape.width/2}" cy="${shape.y + shape.height/2}" r="${Math.min(shape.width, shape.height)/2}" fill="${shape.color || 'white'}" stroke="${shape.borderColor || '#2c3e50'}" stroke-width="2"/>`;
          svg += `<text x="${shape.x + shape.width/2}" y="${shape.y + shape.height/2}" text-anchor="middle" dominant-baseline="middle" font-size="12">${shape.text}</text>`;
        }
        // Add more shape types as needed
      });
      
      svg += '</svg>';
      
      // Download
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'diagram.svg';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }

    // Make functions globally available
    window.setTool = setTool;
    window.deleteSelected = deleteSelected;
    window.exportDiagram = exportDiagram;
    window.importDiagram = importDiagram;
    window.clearDiagram = clearDiagram;
    window.autoLayout = autoLayout;
    window.saveDiagramAsNote = saveDiagramAsNote;
    window.updateSelectedText = updateSelectedText;
    window.updateSelectedSize = updateSelectedSize;
    window.updateSelectedColor = updateSelectedColor;
    window.updateSelectedBorder = updateSelectedBorder;
    window.updateSelectedFont = updateSelectedFont;
    window.showSelectedProperties = showSelectedProperties;
    window.toggleDiagramMode = toggleDiagramMode;
    
    // Enhanced features exports
    window.undoAction = undoAction;
    window.redoAction = redoAction;
    window.toggleSnapToGrid = toggleSnapToGrid;
    window.zoomIn = zoomIn;
    window.zoomOut = zoomOut;
    window.resetZoom = resetZoom;
    window.exportAsPNG = exportAsPNG;
    window.exportAsSVG = exportAsSVG;
  }
}); 