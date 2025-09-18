/**
 * NextNote Visual Card Studio Plugin
 * HyperStudio/KidPix-style visual card system with multimedia authoring
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Visual Card Studio',
  version: '1.0.0',
  description: 'HyperStudio-style visual card system with multimedia authoring and animations',
  
  onLoad(app) {
    this.cardStacks = JSON.parse(localStorage.getItem('nextnote_card_stacks') || '[]');
    this.currentStack = null;
    this.currentCard = null;
    this.selectedObjects = [];
    this.isRecording = false;
    this.animationData = [];
    this.setupVisualCardStudioUI(app);
    this.initializeCardStudioComponents(app);
    this.bindCardStudioEvents(app);
  },

  setupVisualCardStudioUI(app) {
    const panel = app.createPanel('visual-card-studio', 'Visual Card Studio');
    
    // Header with retro styling
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
      border-radius: 12px;
      color: white;
      position: relative;
      overflow: hidden;
    `;

    // Add retro pattern overlay
    const pattern = document.createElement('div');
    pattern.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255,255,255,0.1) 10px,
        rgba(255,255,255,0.1) 20px
      );
      pointer-events: none;
    `;
    header.appendChild(pattern);

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
      font-family: 'Comic Sans MS', cursive, sans-serif;
    `;
    title.innerHTML = '🎨 Visual Card Studio';

    const newStackBtn = document.createElement('button');
    newStackBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      z-index: 1;
      position: relative;
      transition: all 0.3s;
      font-family: 'Comic Sans MS', cursive, sans-serif;
    `;
    newStackBtn.textContent = '✨ New Stack';
    newStackBtn.addEventListener('click', () => this.createNewStack(app));
    newStackBtn.addEventListener('mouseenter', () => {
      newStackBtn.style.background = 'rgba(255,255,255,0.3)';
      newStackBtn.style.transform = 'scale(1.05)';
    });
    newStackBtn.addEventListener('mouseleave', () => {
      newStackBtn.style.background = 'rgba(255,255,255,0.2)';
      newStackBtn.style.transform = 'scale(1)';
    });

    header.appendChild(title);
    header.appendChild(newStackBtn);
    panel.appendChild(header);

    // Toolbar with retro tools
    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
      display: flex;
      gap: 5px;
      margin-bottom: 20px;
      padding: 10px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 8px;
      flex-wrap: wrap;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    `;

    const toolGroups = [
      {
        name: 'Navigation',
        tools: [
          { id: 'prev-card', icon: '⬅️', label: 'Previous', color: '#ff6b6b' },
          { id: 'next-card', icon: '➡️', label: 'Next', color: '#ff6b6b' },
          { id: 'add-card', icon: '➕', label: 'Add Card', color: '#4ecdc4' },
          { id: 'delete-card', icon: '🗑️', label: 'Delete', color: '#ff4757' }
        ]
      },
      {
        name: 'Objects',
        tools: [
          { id: 'add-text', icon: '📝', label: 'Text', color: '#45b7d1' },
          { id: 'add-image', icon: '🖼️', label: 'Image', color: '#96ceb4' },
          { id: 'add-shape', icon: '🔷', label: 'Shape', color: '#feca57' },
          { id: 'add-button', icon: '🔘', label: 'Button', color: '#ff9ff3' }
        ]
      },
      {
        name: 'Animation',
        tools: [
          { id: 'record', icon: '⏺️', label: 'Record', color: '#ff6b6b' },
          { id: 'play', icon: '▶️', label: 'Play', color: '#4ecdc4' },
          { id: 'stop', icon: '⏹️', label: 'Stop', color: '#ff4757' },
          { id: 'timeline', icon: '📊', label: 'Timeline', color: '#45b7d1' }
        ]
      },
      {
        name: 'Media',
        tools: [
          { id: 'sound', icon: '🔊', label: 'Sound', color: '#96ceb4' },
          { id: 'music', icon: '🎵', label: 'Music', color: '#feca57' },
          { id: 'effects', icon: '✨', label: 'Effects', color: '#ff9ff3' },
          { id: 'library', icon: '📚', label: 'Library', color: '#54a0ff' }
        ]
      }
    ];

    toolGroups.forEach(group => {
      const groupDiv = document.createElement('div');
      groupDiv.style.cssText = `
        display: flex;
        gap: 3px;
        padding: 5px;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 6px;
        background: rgba(255,255,255,0.1);
      `;

      group.tools.forEach(tool => {
        const button = document.createElement('button');
        button.id = `tool-${tool.id}`;
        button.style.cssText = `
          padding: 8px;
          border: none;
          border-radius: 6px;
          background: ${tool.color};
          color: white;
          cursor: pointer;
          font-size: 16px;
          min-width: 40px;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          position: relative;
        `;
        button.innerHTML = tool.icon;
        button.title = tool.label;
        
        button.addEventListener('click', () => this.handleTool(tool.id, app));
        button.addEventListener('mouseenter', () => {
          button.style.transform = 'scale(1.1) translateY(-2px)';
          button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        });
        button.addEventListener('mouseleave', () => {
          button.style.transform = 'scale(1) translateY(0)';
          button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        });
        
        groupDiv.appendChild(button);
      });

      toolbar.appendChild(groupDiv);
    });

    panel.appendChild(toolbar);

    // Main workspace
    const workspace = document.createElement('div');
    workspace.style.cssText = `
      display: flex;
      gap: 15px;
      height: 600px;
    `;

    // Card canvas area
    const canvasArea = document.createElement('div');
    canvasArea.style.cssText = `
      flex: 1;
      background: #f0f0f0;
      border: 3px solid #333;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      background-image: 
        radial-gradient(circle at 25% 25%, #fff 2px, transparent 2px),
        radial-gradient(circle at 75% 75%, #fff 2px, transparent 2px);
      background-size: 20px 20px;
    `;

    const canvas = document.createElement('div');
    canvas.id = 'card-canvas';
    canvas.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      background: white;
      cursor: crosshair;
    `;

    const cardInfo = document.createElement('div');
    cardInfo.id = 'card-info';
    cardInfo.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 12px;
      font-family: 'Comic Sans MS', cursive, sans-serif;
    `;
    cardInfo.textContent = 'No stack selected';

    canvasArea.appendChild(canvas);
    canvasArea.appendChild(cardInfo);

    // Properties panel
    const propertiesPanel = document.createElement('div');
    propertiesPanel.style.cssText = `
      width: 250px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 8px;
      padding: 15px;
      color: white;
      overflow-y: auto;
    `;

    propertiesPanel.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: white; font-family: 'Comic Sans MS', cursive;">🎛️ Properties</h4>
      <div id="object-properties" style="color: white;">
        <div style="text-align: center; padding: 20px; font-style: italic; opacity: 0.8;">
          Select an object to edit properties
        </div>
      </div>
      
      <h4 style="margin: 20px 0 15px 0; color: white; font-family: 'Comic Sans MS', cursive;">🎨 Quick Effects</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <button onclick="this.applyEffect('bounce')" style="
          padding: 8px;
          border: none;
          border-radius: 6px;
          background: #ff6b6b;
          color: white;
          cursor: pointer;
          font-size: 12px;
        ">Bounce</button>
        <button onclick="this.applyEffect('fade')" style="
          padding: 8px;
          border: none;
          border-radius: 6px;
          background: #4ecdc4;
          color: white;
          cursor: pointer;
          font-size: 12px;
        ">Fade</button>
        <button onclick="this.applyEffect('spin')" style="
          padding: 8px;
          border: none;
          border-radius: 6px;
          background: #45b7d1;
          color: white;
          cursor: pointer;
          font-size: 12px;
        ">Spin</button>
        <button onclick="this.applyEffect('glow')" style="
          padding: 8px;
          border: none;
          border-radius: 6px;
          background: #96ceb4;
          color: white;
          cursor: pointer;
          font-size: 12px;
        ">Glow</button>
      </div>

      <h4 style="margin: 20px 0 15px 0; color: white; font-family: 'Comic Sans MS', cursive;">🎵 Audio</h4>
      <div id="audio-controls">
        <button onclick="this.toggleBackgroundMusic()" style="
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 6px;
          background: #feca57;
          color: white;
          cursor: pointer;
          margin-bottom: 8px;
        ">🎵 Background Music</button>
        <button onclick="this.addSoundEffect()" style="
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 6px;
          background: #ff9ff3;
          color: white;
          cursor: pointer;
        ">🔊 Sound Effect</button>
      </div>
    `;

    workspace.appendChild(canvasArea);
    workspace.appendChild(propertiesPanel);
    panel.appendChild(workspace);

    // Card stack selector
    const stackSelector = document.createElement('div');
    stackSelector.style.cssText = `
      margin-top: 15px;
      padding: 15px;
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
    `;

    stackSelector.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">📚 Card Stacks</h4>
      <div id="stack-list" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
      ">
        ${this.cardStacks.length === 0 ? `
          <div style="
            text-align: center;
            color: var(--hermes-disabled-text);
            font-style: italic;
            padding: 40px;
            grid-column: 1 / -1;
          ">
            <div style="font-size: 3em; margin-bottom: 15px;">🎨</div>
            <div>No card stacks yet!</div>
            <div style="font-size: 0.9em; margin-top: 5px;">Create your first multimedia presentation</div>
          </div>
        ` : this.generateStackCards()}
      </div>
    `;

    panel.appendChild(stackSelector);

    // Bind canvas events
    this.bindCanvasEvents(canvas, app);
  },

  generateStackCards() {
    return this.cardStacks.map(stack => `
      <div style="
        background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
        border-radius: 8px;
        padding: 15px;
        color: white;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
        overflow: hidden;
      " onclick="this.openStack('${stack.id}')" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
        <div style="
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
          pointer-events: none;
        "></div>
        <div style="position: relative; z-index: 1;">
          <div style="font-size: 1.5em; margin-bottom: 8px;">🎭</div>
          <div style="font-weight: bold; margin-bottom: 5px; font-family: 'Comic Sans MS', cursive;">${stack.name}</div>
          <div style="font-size: 0.8em; opacity: 0.9;">${stack.cards.length} cards</div>
          <div style="font-size: 0.7em; opacity: 0.7; margin-top: 5px;">
            Created: ${new Date(stack.created).toLocaleDateString()}
          </div>
        </div>
      </div>
    `).join('');
  },

  createNewStack(app) {
    const name = prompt('Enter a name for your new card stack:');
    if (!name) return;

    const stack = {
      id: crypto.randomUUID(),
      name: name.trim(),
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      cards: [{
        id: crypto.randomUUID(),
        name: 'Card 1',
        objects: [],
        background: '#ffffff',
        audio: null,
        animations: []
      }],
      settings: {
        cardSize: { width: 640, height: 480 },
        defaultFont: 'Comic Sans MS',
        autoPlay: false
      }
    };

    this.cardStacks.push(stack);
    this.saveCardStacks();
    this.openStack(stack.id);
    app.showToast(`Card stack "${name}" created!`, 'success');
    
    // Refresh the stack list
    this.refreshStackList();
  },

  openStack(stackId) {
    this.currentStack = this.cardStacks.find(s => s.id === stackId);
    if (!this.currentStack) return;

    this.currentCard = this.currentStack.cards[0];
    this.renderCurrentCard();
    this.updateCardInfo();
  },

  renderCurrentCard() {
    const canvas = document.getElementById('card-canvas');
    if (!canvas || !this.currentCard) return;

    // Clear canvas
    canvas.innerHTML = '';
    canvas.style.background = this.currentCard.background;

    // Render objects
    this.currentCard.objects.forEach(obj => {
      const element = this.createObjectElement(obj);
      canvas.appendChild(element);
    });
  },

  createObjectElement(obj) {
    const element = document.createElement('div');
    element.id = obj.id;
    element.className = 'card-object';
    element.style.cssText = `
      position: absolute;
      left: ${obj.x}px;
      top: ${obj.y}px;
      width: ${obj.width}px;
      height: ${obj.height}px;
      cursor: move;
      user-select: none;
      z-index: ${obj.zIndex || 1};
    `;

    switch (obj.type) {
      case 'text':
        element.innerHTML = obj.content;
        element.style.cssText += `
          font-family: ${obj.fontFamily || 'Comic Sans MS'};
          font-size: ${obj.fontSize || 16}px;
          color: ${obj.color || '#000000'};
          font-weight: ${obj.fontWeight || 'normal'};
          text-align: ${obj.textAlign || 'left'};
          background: ${obj.backgroundColor || 'transparent'};
          border: ${obj.border || 'none'};
          border-radius: ${obj.borderRadius || 0}px;
          padding: ${obj.padding || 5}px;
        `;
        break;
      
      case 'image':
        const img = document.createElement('img');
        img.src = obj.src;
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: ${obj.objectFit || 'contain'};
          border-radius: ${obj.borderRadius || 0}px;
        `;
        element.appendChild(img);
        break;
      
      case 'shape':
        element.style.cssText += `
          background: ${obj.backgroundColor || '#ff6b6b'};
          border: ${obj.border || 'none'};
          border-radius: ${obj.borderRadius || 0}px;
        `;
        if (obj.shape === 'circle') {
          element.style.borderRadius = '50%';
        }
        break;
      
      case 'button':
        element.innerHTML = obj.content || 'Button';
        element.style.cssText += `
          background: ${obj.backgroundColor || '#4ecdc4'};
          color: ${obj.color || 'white'};
          border: none;
          border-radius: 6px;
          font-family: 'Comic Sans MS', cursive;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        `;
        break;
    }

    // Add click handler for selection
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectObject(obj.id);
    });

    // Add drag functionality
    this.makeDraggable(element, obj);

    return element;
  },

  makeDraggable(element, obj) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    element.addEventListener('mousedown', (e) => {
      if (this.isRecording) {
        this.recordMovement(obj.id, 'start', { x: obj.x, y: obj.y });
      }
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = obj.x;
      startTop = obj.y;
      
      element.style.zIndex = '1000';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      obj.x = startLeft + deltaX;
      obj.y = startTop + deltaY;
      
      element.style.left = obj.x + 'px';
      element.style.top = obj.y + 'px';
      
      if (this.isRecording) {
        this.recordMovement(obj.id, 'move', { x: obj.x, y: obj.y });
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        element.style.zIndex = obj.zIndex || '1';
        
        if (this.isRecording) {
          this.recordMovement(obj.id, 'end', { x: obj.x, y: obj.y });
        }
        
        this.saveCardStacks();
      }
    });
  },

  handleTool(toolId, app) {
    switch (toolId) {
      case 'prev-card':
        this.navigateCard(-1);
        break;
      case 'next-card':
        this.navigateCard(1);
        break;
      case 'add-card':
        this.addNewCard(app);
        break;
      case 'delete-card':
        this.deleteCurrentCard(app);
        break;
      case 'add-text':
        this.addTextObject(app);
        break;
      case 'add-image':
        this.addImageObject(app);
        break;
      case 'add-shape':
        this.addShapeObject(app);
        break;
      case 'add-button':
        this.addButtonObject(app);
        break;
      case 'record':
        this.toggleRecording(app);
        break;
      case 'play':
        this.playAnimations(app);
        break;
      case 'stop':
        this.stopAnimations(app);
        break;
      case 'timeline':
        this.openTimeline(app);
        break;
      case 'sound':
        this.addSoundEffect(app);
        break;
      case 'music':
        this.toggleBackgroundMusic(app);
        break;
      case 'effects':
        this.openEffectsPanel(app);
        break;
      case 'library':
        this.openMediaLibrary(app);
        break;
    }
  },

  addTextObject(app) {
    if (!this.currentCard) {
      app.showToast('Please select a card first', 'warning');
      return;
    }

    const text = prompt('Enter text:') || 'Sample Text';
    const obj = {
      id: crypto.randomUUID(),
      type: 'text',
      content: text,
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      fontFamily: 'Comic Sans MS',
      fontSize: 16,
      color: '#000000',
      backgroundColor: 'transparent',
      zIndex: this.currentCard.objects.length + 1
    };

    this.currentCard.objects.push(obj);
    this.renderCurrentCard();
    this.saveCardStacks();
    app.showToast('Text object added!', 'success');
  },

  addImageObject(app) {
    if (!this.currentCard) {
      app.showToast('Please select a card first', 'warning');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const obj = {
            id: crypto.randomUUID(),
            type: 'image',
            src: e.target.result,
            x: 100,
            y: 100,
            width: 150,
            height: 150,
            objectFit: 'contain',
            zIndex: this.currentCard.objects.length + 1
          };

          this.currentCard.objects.push(obj);
          this.renderCurrentCard();
          this.saveCardStacks();
          app.showToast('Image added!', 'success');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  },

  addShapeObject(app) {
    if (!this.currentCard) {
      app.showToast('Please select a card first', 'warning');
      return;
    }

    const shapes = ['rectangle', 'circle', 'triangle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    const obj = {
      id: crypto.randomUUID(),
      type: 'shape',
      shape: shape,
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      borderRadius: shape === 'circle' ? 50 : 0,
      zIndex: this.currentCard.objects.length + 1
    };

    this.currentCard.objects.push(obj);
    this.renderCurrentCard();
    this.saveCardStacks();
    app.showToast(`${shape} shape added!`, 'success');
  },

  addButtonObject(app) {
    if (!this.currentCard) {
      app.showToast('Please select a card first', 'warning');
      return;
    }

    const text = prompt('Enter button text:') || 'Click Me!';
    const obj = {
      id: crypto.randomUUID(),
      type: 'button',
      content: text,
      x: 200,
      y: 200,
      width: 120,
      height: 40,
      backgroundColor: '#4ecdc4',
      color: 'white',
      action: 'alert("Button clicked!")',
      zIndex: this.currentCard.objects.length + 1
    };

    this.currentCard.objects.push(obj);
    this.renderCurrentCard();
    this.saveCardStacks();
    app.showToast('Button added!', 'success');
  },

  toggleRecording(app) {
    this.isRecording = !this.isRecording;
    const recordBtn = document.getElementById('tool-record');
    
    if (this.isRecording) {
      recordBtn.style.background = '#ff4757';
      recordBtn.style.animation = 'pulse 1s infinite';
      this.animationData = [];
      app.showToast('Recording started! Move objects to record animations', 'info');
    } else {
      recordBtn.style.background = '#ff6b6b';
      recordBtn.style.animation = 'none';
      app.showToast('Recording stopped!', 'success');
    }
  },

  recordMovement(objectId, action, position) {
    this.animationData.push({
      timestamp: Date.now(),
      objectId: objectId,
      action: action,
      position: position
    });
  },

  updateCardInfo() {
    const cardInfo = document.getElementById('card-info');
    if (cardInfo && this.currentStack && this.currentCard) {
      const cardIndex = this.currentStack.cards.indexOf(this.currentCard) + 1;
      cardInfo.textContent = `${this.currentStack.name} - Card ${cardIndex}/${this.currentStack.cards.length}`;
    }
  },

  navigateCard(direction) {
    if (!this.currentStack) return;
    
    const currentIndex = this.currentStack.cards.indexOf(this.currentCard);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < this.currentStack.cards.length) {
      this.currentCard = this.currentStack.cards[newIndex];
      this.renderCurrentCard();
      this.updateCardInfo();
    }
  },

  selectObject(objectId) {
    // Remove previous selection
    document.querySelectorAll('.card-object').forEach(el => {
      el.style.outline = 'none';
    });

    // Add selection to current object
    const element = document.getElementById(objectId);
    if (element) {
      element.style.outline = '2px dashed #ff6b6b';
      this.selectedObjects = [objectId];
    }
  },

  refreshStackList() {
    const stackList = document.getElementById('stack-list');
    if (stackList) {
      stackList.innerHTML = this.cardStacks.length === 0 ? `
        <div style="
          text-align: center;
          color: var(--hermes-disabled-text);
          font-style: italic;
          padding: 40px;
          grid-column: 1 / -1;
        ">
          <div style="font-size: 3em; margin-bottom: 15px;">🎨</div>
          <div>No card stacks yet!</div>
          <div style="font-size: 0.9em; margin-top: 5px;">Create your first multimedia presentation</div>
        </div>
      ` : this.generateStackCards();
    }
  },

  saveCardStacks() {
    localStorage.setItem('nextnote_card_stacks', JSON.stringify(this.cardStacks));
  },

  bindCanvasEvents(canvas, app) {
    canvas.addEventListener('click', (e) => {
      if (e.target === canvas) {
        // Deselect all objects
        document.querySelectorAll('.card-object').forEach(el => {
          el.style.outline = 'none';
        });
        this.selectedObjects = [];
      }
    });
  },

  initializeCardStudioComponents(app) {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      .card-object:hover {
        filter: brightness(1.1);
      }
      
      .card-object.selected {
        outline: 2px dashed #ff6b6b !important;
      }
    `;
    document.head.appendChild(style);
  },

  bindCardStudioEvents(app) {
    // Listen for card studio events
    app.on('cardUpdated', () => {
      this.saveCardStacks();
    });
  }
});
