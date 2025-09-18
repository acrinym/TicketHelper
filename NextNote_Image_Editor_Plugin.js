/**
 * NextNote Image Editor Plugin
 * Basic image editing with crop, resize, filters, and annotations
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Image Editor',
  version: '1.0.0',
  description: 'Basic image editing with crop, resize, filters, and annotations',
  
  onLoad(app) {
    this.currentImage = null;
    this.canvas = null;
    this.ctx = null;
    this.originalImageData = null;
    this.history = [];
    this.historyIndex = -1;
    this.setupImageEditorUI(app);
    this.initializeImageEditorComponents(app);
    this.bindImageEditorEvents(app);
  },

  setupImageEditorUI(app) {
    const panel = app.createPanel('image-editor', 'Image Editor');
    
    // Image Editor header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 12px;
      color: white;
    `;

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0; color: white; display: flex; align-items: center; gap: 10px;';
    title.innerHTML = '🎨 Image Editor';

    const loadImageBtn = document.createElement('button');
    loadImageBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
    `;
    loadImageBtn.textContent = '📁 Load Image';
    loadImageBtn.addEventListener('click', () => this.loadImage());

    header.appendChild(title);
    header.appendChild(loadImageBtn);
    panel.appendChild(header);

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      padding: 15px;
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      flex-wrap: wrap;
      align-items: center;
    `;

    // Tool groups
    const toolGroups = [
      {
        name: 'Basic',
        tools: [
          { id: 'crop', icon: '✂️', label: 'Crop' },
          { id: 'resize', icon: '📏', label: 'Resize' },
          { id: 'rotate', icon: '🔄', label: 'Rotate' },
          { id: 'flip', icon: '🔀', label: 'Flip' }
        ]
      },
      {
        name: 'Filters',
        tools: [
          { id: 'brightness', icon: '☀️', label: 'Brightness' },
          { id: 'contrast', icon: '🌓', label: 'Contrast' },
          { id: 'saturation', icon: '🎨', label: 'Saturation' },
          { id: 'blur', icon: '🌫️', label: 'Blur' }
        ]
      },
      {
        name: 'Effects',
        tools: [
          { id: 'grayscale', icon: '⚫', label: 'Grayscale' },
          { id: 'sepia', icon: '🟤', label: 'Sepia' },
          { id: 'invert', icon: '🔄', label: 'Invert' },
          { id: 'vintage', icon: '📸', label: 'Vintage' }
        ]
      },
      {
        name: 'Actions',
        tools: [
          { id: 'undo', icon: '↶', label: 'Undo' },
          { id: 'redo', icon: '↷', label: 'Redo' },
          { id: 'reset', icon: '🔄', label: 'Reset' },
          { id: 'save', icon: '💾', label: 'Save' }
        ]
      }
    ];

    toolGroups.forEach(group => {
      const groupDiv = document.createElement('div');
      groupDiv.style.cssText = `
        display: flex;
        gap: 5px;
        padding: 5px;
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        background: var(--hermes-bg);
      `;

      group.tools.forEach(tool => {
        const button = document.createElement('button');
        button.id = `tool-${tool.id}`;
        button.style.cssText = `
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          background: var(--hermes-button-bg);
          color: var(--hermes-text);
          cursor: pointer;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          min-width: 60px;
          transition: all 0.2s;
        `;
        button.innerHTML = `<span style="font-size: 16px;">${tool.icon}</span><span>${tool.label}</span>`;
        button.addEventListener('click', () => this.handleTool(tool.id, app));
        button.addEventListener('mouseenter', () => {
          button.style.background = 'var(--hermes-highlight-bg)';
          button.style.color = 'var(--hermes-highlight-text)';
        });
        button.addEventListener('mouseleave', () => {
          button.style.background = 'var(--hermes-button-bg)';
          button.style.color = 'var(--hermes-text)';
        });
        groupDiv.appendChild(button);
      });

      toolbar.appendChild(groupDiv);
    });

    panel.appendChild(toolbar);

    // Canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = `
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    `;

    // Main canvas area
    const canvasArea = document.createElement('div');
    canvasArea.style.cssText = `
      flex: 1;
      border: 2px dashed var(--hermes-border);
      border-radius: 8px;
      background: var(--hermes-panel-bg);
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    `;

    const canvas = document.createElement('canvas');
    canvas.id = 'image-editor-canvas';
    canvas.style.cssText = `
      max-width: 100%;
      max-height: 100%;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      display: none;
    `;

    const placeholder = document.createElement('div');
    placeholder.id = 'canvas-placeholder';
    placeholder.style.cssText = `
      text-align: center;
      color: var(--hermes-disabled-text);
      padding: 40px;
    `;
    placeholder.innerHTML = `
      <div style="font-size: 4em; margin-bottom: 20px;">🖼️</div>
      <h3 style="color: var(--hermes-text); margin-bottom: 10px;">No Image Loaded</h3>
      <p style="margin-bottom: 20px;">Load an image to start editing</p>
      <button onclick="this.loadImage()" style="
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        background: var(--hermes-highlight-bg);
        color: var(--hermes-highlight-text);
        cursor: pointer;
      ">📁 Choose Image</button>
    `;

    canvasArea.appendChild(canvas);
    canvasArea.appendChild(placeholder);

    // Properties panel
    const propertiesPanel = document.createElement('div');
    propertiesPanel.style.cssText = `
      width: 250px;
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 15px;
    `;

    propertiesPanel.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🔧 Properties</h4>
      <div id="image-properties" style="color: var(--hermes-disabled-text); font-style: italic;">
        No image loaded
      </div>
      
      <h4 style="margin: 20px 0 15px 0; color: var(--hermes-text);">⚙️ Adjustments</h4>
      <div id="image-adjustments">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-size: 12px; color: var(--hermes-text);">Brightness</label>
          <input type="range" id="brightness-slider" min="-100" max="100" value="0" style="width: 100%;">
          <span id="brightness-value" style="font-size: 11px; color: var(--hermes-disabled-text);">0</span>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-size: 12px; color: var(--hermes-text);">Contrast</label>
          <input type="range" id="contrast-slider" min="-100" max="100" value="0" style="width: 100%;">
          <span id="contrast-value" style="font-size: 11px; color: var(--hermes-disabled-text);">0</span>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-size: 12px; color: var(--hermes-text);">Saturation</label>
          <input type="range" id="saturation-slider" min="-100" max="100" value="0" style="width: 100%;">
          <span id="saturation-value" style="font-size: 11px; color: var(--hermes-disabled-text);">0</span>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-size: 12px; color: var(--hermes-text);">Blur</label>
          <input type="range" id="blur-slider" min="0" max="10" value="0" style="width: 100%;">
          <span id="blur-value" style="font-size: 11px; color: var(--hermes-disabled-text);">0</span>
        </div>
        
        <button onclick="this.applyAdjustments()" style="
          width: 100%;
          padding: 8px;
          border: none;
          border-radius: 4px;
          background: var(--hermes-success-text);
          color: white;
          cursor: pointer;
          margin-top: 10px;
        ">Apply Changes</button>
      </div>
    `;

    canvasContainer.appendChild(canvasArea);
    canvasContainer.appendChild(propertiesPanel);
    panel.appendChild(canvasContainer);

    // File input (hidden)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => this.handleImageLoad(e, app));
    panel.appendChild(fileInput);

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fileInput = fileInput;

    // Bind slider events
    this.bindSliderEvents();
  },

  bindSliderEvents() {
    const sliders = ['brightness', 'contrast', 'saturation', 'blur'];
    
    sliders.forEach(slider => {
      const sliderEl = document.getElementById(`${slider}-slider`);
      const valueEl = document.getElementById(`${slider}-value`);
      
      if (sliderEl && valueEl) {
        sliderEl.addEventListener('input', (e) => {
          valueEl.textContent = e.target.value;
          this.previewAdjustments();
        });
      }
    });
  },

  loadImage() {
    this.fileInput.click();
  },

  handleImageLoad(event, app) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.setImage(img, app);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  setImage(img, app) {
    this.currentImage = img;
    
    // Set canvas size
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    
    // Draw image
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(img, 0, 0);
    
    // Store original image data
    this.originalImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    // Show canvas, hide placeholder
    this.canvas.style.display = 'block';
    const placeholder = document.getElementById('canvas-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    
    // Update properties
    this.updateImageProperties();
    
    // Add to history
    this.addToHistory();
    
    app.showToast('Image loaded successfully!', 'success');
  },

  updateImageProperties() {
    const propertiesEl = document.getElementById('image-properties');
    if (!propertiesEl || !this.currentImage) return;

    const fileSize = this.canvas.toDataURL().length * 0.75; // Approximate file size
    propertiesEl.innerHTML = `
      <div style="margin-bottom: 8px;"><strong>Dimensions:</strong> ${this.canvas.width} × ${this.canvas.height}px</div>
      <div style="margin-bottom: 8px;"><strong>Aspect Ratio:</strong> ${(this.canvas.width / this.canvas.height).toFixed(2)}:1</div>
      <div style="margin-bottom: 8px;"><strong>File Size:</strong> ~${(fileSize / 1024).toFixed(1)} KB</div>
      <div><strong>Format:</strong> Canvas (PNG/JPEG export)</div>
    `;
  },

  handleTool(toolId, app) {
    if (!this.currentImage) {
      app.showToast('Please load an image first', 'warning');
      return;
    }

    switch (toolId) {
      case 'crop':
        this.cropImage(app);
        break;
      case 'resize':
        this.resizeImage(app);
        break;
      case 'rotate':
        this.rotateImage(90, app);
        break;
      case 'flip':
        this.flipImage(app);
        break;
      case 'grayscale':
        this.applyFilter('grayscale', app);
        break;
      case 'sepia':
        this.applyFilter('sepia', app);
        break;
      case 'invert':
        this.applyFilter('invert', app);
        break;
      case 'vintage':
        this.applyFilter('vintage', app);
        break;
      case 'undo':
        this.undo(app);
        break;
      case 'redo':
        this.redo(app);
        break;
      case 'reset':
        this.resetImage(app);
        break;
      case 'save':
        this.saveImage(app);
        break;
    }
  },

  cropImage(app) {
    // Simple center crop to square
    const size = Math.min(this.canvas.width, this.canvas.height);
    const x = (this.canvas.width - size) / 2;
    const y = (this.canvas.height - size) / 2;
    
    const imageData = this.ctx.getImageData(x, y, size, size);
    this.canvas.width = size;
    this.canvas.height = size;
    this.ctx.putImageData(imageData, 0, 0);
    
    this.addToHistory();
    this.updateImageProperties();
    app.showToast('Image cropped to square', 'success');
  },

  resizeImage(app) {
    const newWidth = prompt('Enter new width (pixels):', this.canvas.width);
    if (!newWidth || isNaN(newWidth)) return;
    
    const width = parseInt(newWidth);
    const height = Math.round((width / this.canvas.width) * this.canvas.height);
    
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    tempCtx.putImageData(imageData, 0, 0);
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.drawImage(tempCanvas, 0, 0, width, height);
    
    this.addToHistory();
    this.updateImageProperties();
    app.showToast(`Image resized to ${width}×${height}px`, 'success');
  },

  rotateImage(degrees, app) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = this.canvas.height;
    tempCanvas.height = this.canvas.width;
    
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate((degrees * Math.PI) / 180);
    tempCtx.drawImage(this.canvas, -this.canvas.width / 2, -this.canvas.height / 2);
    
    this.canvas.width = tempCanvas.width;
    this.canvas.height = tempCanvas.height;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(tempCanvas, 0, 0);
    
    this.addToHistory();
    this.updateImageProperties();
    app.showToast(`Image rotated ${degrees}°`, 'success');
  },

  flipImage(app) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(this.canvas, -this.canvas.width, 0);
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(tempCanvas, 0, 0);
    
    this.addToHistory();
    app.showToast('Image flipped horizontally', 'success');
  },

  applyFilter(filterType, app) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      switch (filterType) {
        case 'grayscale':
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = data[i + 1] = data[i + 2] = gray;
          break;
        case 'sepia':
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
          break;
        case 'invert':
          data[i] = 255 - r;
          data[i + 1] = 255 - g;
          data[i + 2] = 255 - b;
          break;
        case 'vintage':
          data[i] = Math.min(255, r * 1.2);
          data[i + 1] = Math.min(255, g * 1.1);
          data[i + 2] = Math.min(255, b * 0.8);
          break;
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
    this.addToHistory();
    app.showToast(`${filterType} filter applied`, 'success');
  },

  previewAdjustments() {
    if (!this.originalImageData) return;
    
    const brightness = parseInt(document.getElementById('brightness-slider').value);
    const contrast = parseInt(document.getElementById('contrast-slider').value);
    const saturation = parseInt(document.getElementById('saturation-slider').value);
    
    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData.data),
      this.originalImageData.width,
      this.originalImageData.height
    );
    
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      
      // Apply brightness
      r += brightness * 2.55;
      g += brightness * 2.55;
      b += brightness * 2.55;
      
      // Apply contrast
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;
      
      // Clamp values
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  },

  applyAdjustments() {
    this.addToHistory();
    this.originalImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  },

  addToHistory() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(imageData);
    this.historyIndex++;
    
    // Limit history size
    if (this.history.length > 20) {
      this.history.shift();
      this.historyIndex--;
    }
  },

  undo(app) {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const imageData = this.history[this.historyIndex];
      this.canvas.width = imageData.width;
      this.canvas.height = imageData.height;
      this.ctx.putImageData(imageData, 0, 0);
      this.updateImageProperties();
      app.showToast('Undo successful', 'info');
    } else {
      app.showToast('Nothing to undo', 'warning');
    }
  },

  redo(app) {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const imageData = this.history[this.historyIndex];
      this.canvas.width = imageData.width;
      this.canvas.height = imageData.height;
      this.ctx.putImageData(imageData, 0, 0);
      this.updateImageProperties();
      app.showToast('Redo successful', 'info');
    } else {
      app.showToast('Nothing to redo', 'warning');
    }
  },

  resetImage(app) {
    if (this.originalImageData) {
      this.canvas.width = this.originalImageData.width;
      this.canvas.height = this.originalImageData.height;
      this.ctx.putImageData(this.originalImageData, 0, 0);
      this.addToHistory();
      this.updateImageProperties();
      
      // Reset sliders
      document.getElementById('brightness-slider').value = 0;
      document.getElementById('contrast-slider').value = 0;
      document.getElementById('saturation-slider').value = 0;
      document.getElementById('blur-slider').value = 0;
      
      app.showToast('Image reset to original', 'success');
    }
  },

  saveImage(app) {
    const link = document.createElement('a');
    link.download = `nextnote-edited-${Date.now()}.png`;
    link.href = this.canvas.toDataURL();
    link.click();
    app.showToast('Image saved successfully!', 'success');
  },

  initializeImageEditorComponents(app) {
    // Initialize image editor components
  },

  bindImageEditorEvents(app) {
    // Listen for image editor events
    app.on('imageUpdated', (data) => {
      this.updateImageProperties();
    });
  }
});
