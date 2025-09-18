/**
 * NextNote Typography Studio Plugin
 * Advanced text effects, font management, and animated typography
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Typography Studio',
  version: '1.0.0',
  description: 'Advanced text effects, font management, and animated typography',
  
  onLoad(app) {
    this.customFonts = JSON.parse(localStorage.getItem('nextnote_custom_fonts') || '[]');
    this.textPresets = JSON.parse(localStorage.getItem('nextnote_text_presets') || this.getDefaultPresets());
    this.animatedTexts = JSON.parse(localStorage.getItem('nextnote_animated_texts') || '[]');
    this.currentTextObject = null;
    this.setupTypographyStudioUI(app);
    this.initializeTypographyComponents(app);
    this.bindTypographyEvents(app);
  },

  getDefaultPresets() {
    return [
      {
        id: 'title-bold',
        name: 'Bold Title',
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2c3e50',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        textTransform: 'uppercase',
        letterSpacing: '2px'
      },
      {
        id: 'subtitle-elegant',
        name: 'Elegant Subtitle',
        fontFamily: 'Georgia, serif',
        fontSize: 24,
        fontWeight: 'normal',
        color: '#34495e',
        fontStyle: 'italic',
        letterSpacing: '1px'
      },
      {
        id: 'body-friendly',
        name: 'Friendly Body',
        fontFamily: 'Comic Sans MS, cursive',
        fontSize: 16,
        fontWeight: 'normal',
        color: '#2c3e50',
        lineHeight: '1.6'
      },
      {
        id: 'retro-neon',
        name: 'Retro Neon',
        fontFamily: 'Courier New, monospace',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ff00ff',
        textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff',
        backgroundColor: '#000000',
        padding: '10px'
      }
    ];
  },

  setupTypographyStudioUI(app) {
    const panel = app.createPanel('typography-studio', 'Typography Studio');
    
    // Header with typography theme
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
      border-radius: 12px;
      color: white;
      position: relative;
      overflow: hidden;
    `;

    // Floating letters animation
    const letters = ['A', 'a', 'B', 'b', 'C', 'c', '&', '@', '#'];
    letters.forEach((letter, index) => {
      const floatingLetter = document.createElement('div');
      floatingLetter.style.cssText = `
        position: absolute;
        font-size: ${1.2 + Math.random() * 0.8}em;
        font-weight: ${Math.random() > 0.5 ? 'bold' : 'normal'};
        opacity: 0.2;
        animation: floatText ${3 + index}s ease-in-out infinite;
        animation-delay: ${index * 0.3}s;
        pointer-events: none;
        font-family: ${index % 3 === 0 ? 'serif' : index % 3 === 1 ? 'sans-serif' : 'monospace'};
      `;
      floatingLetter.style.left = `${5 + index * 10}%`;
      floatingLetter.style.top = `${10 + (index % 3) * 25}%`;
      floatingLetter.textContent = letter;
      header.appendChild(floatingLetter);
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
      font-family: 'Comic Sans MS', cursive, sans-serif;
    `;
    title.innerHTML = '✍️ Typography Studio';

    const fontBtn = document.createElement('button');
    fontBtn.style.cssText = `
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
    fontBtn.textContent = '📁 Add Font';
    fontBtn.addEventListener('click', () => this.addCustomFont(app));

    header.appendChild(title);
    header.appendChild(fontBtn);
    panel.appendChild(header);

    // Typography tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = `
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--hermes-border);
    `;

    const tabs = [
      { id: 'text-editor', label: '✍️ Text Editor', icon: '✍️' },
      { id: 'font-library', label: '📚 Font Library', icon: '📚' },
      { id: 'text-effects', label: '✨ Text Effects', icon: '✨' },
      { id: 'presets', label: '🎨 Presets', icon: '🎨' }
    ];

    tabs.forEach((tab, index) => {
      const tabButton = document.createElement('button');
      tabButton.className = `typography-tab ${index === 0 ? 'active' : ''}`;
      tabButton.style.cssText = `
        padding: 12px 20px;
        border: none;
        background: ${index === 0 ? 'var(--hermes-highlight-bg)' : 'transparent'};
        color: ${index === 0 ? 'var(--hermes-highlight-text)' : 'var(--hermes-text)'};
        cursor: pointer;
        border-bottom: 2px solid ${index === 0 ? 'var(--hermes-highlight-bg)' : 'transparent'};
        transition: all 0.2s;
        font-weight: bold;
      `;
      tabButton.textContent = tab.label;
      tabButton.addEventListener('click', () => this.switchTypographyTab(tab.id));
      tabsContainer.appendChild(tabButton);
    });

    panel.appendChild(tabsContainer);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.id = 'typography-content-area';
    contentArea.style.cssText = 'min-height: 500px;';
    panel.appendChild(contentArea);

    // Initialize with text editor
    this.switchTypographyTab('text-editor');
  },

  switchTypographyTab(tabId) {
    // Update tab styles
    document.querySelectorAll('.typography-tab').forEach(tab => {
      tab.style.background = 'transparent';
      tab.style.color = 'var(--hermes-text)';
      tab.style.borderBottomColor = 'transparent';
    });

    const activeTab = document.querySelector(`.typography-tab:nth-child(${['text-editor', 'font-library', 'text-effects', 'presets'].indexOf(tabId) + 1})`);
    if (activeTab) {
      activeTab.style.background = 'var(--hermes-highlight-bg)';
      activeTab.style.color = 'var(--hermes-highlight-text)';
      activeTab.style.borderBottomColor = 'var(--hermes-highlight-bg)';
    }

    // Update content
    const contentArea = document.getElementById('typography-content-area');
    if (!contentArea) return;

    switch (tabId) {
      case 'text-editor':
        contentArea.innerHTML = this.generateTextEditorView();
        this.bindTextEditorEvents();
        break;
      case 'font-library':
        contentArea.innerHTML = this.generateFontLibraryView();
        this.bindFontLibraryEvents();
        break;
      case 'text-effects':
        contentArea.innerHTML = this.generateTextEffectsView();
        this.bindTextEffectsEvents();
        break;
      case 'presets':
        contentArea.innerHTML = this.generatePresetsView();
        this.bindPresetsEvents();
        break;
    }
  },

  generateTextEditorView() {
    return `
      <div class="text-editor-view">
        <!-- Text Input Area -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">✍️ Text Editor</h4>
          
          <textarea id="text-input" placeholder="Enter your text here..." style="
            width: 100%;
            height: 120px;
            padding: 15px;
            border: 1px solid var(--hermes-border);
            border-radius: 6px;
            background: var(--hermes-input-bg);
            color: var(--hermes-text);
            font-family: 'Comic Sans MS', cursive;
            font-size: 16px;
            resize: vertical;
            margin-bottom: 15px;
          ">Welcome to Typography Studio! 🎨</textarea>
          
          <!-- Quick Actions -->
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="this.applyQuickStyle('bold')" style="
              padding: 8px 12px;
              border: none;
              border-radius: 4px;
              background: var(--hermes-info-text);
              color: white;
              cursor: pointer;
              font-weight: bold;
            ">Bold</button>
            <button onclick="this.applyQuickStyle('italic')" style="
              padding: 8px 12px;
              border: none;
              border-radius: 4px;
              background: var(--hermes-info-text);
              color: white;
              cursor: pointer;
              font-style: italic;
            ">Italic</button>
            <button onclick="this.applyQuickStyle('uppercase')" style="
              padding: 8px 12px;
              border: none;
              border-radius: 4px;
              background: var(--hermes-info-text);
              color: white;
              cursor: pointer;
              text-transform: uppercase;
            ">UPPERCASE</button>
            <button onclick="this.applyQuickStyle('shadow')" style="
              padding: 8px 12px;
              border: none;
              border-radius: 4px;
              background: var(--hermes-info-text);
              color: white;
              cursor: pointer;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            ">Shadow</button>
          </div>
        </div>

        <!-- Typography Controls -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🎛️ Typography Controls</h4>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <!-- Font Family -->
            <div>
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">Font Family</label>
              <select id="font-family" style="
                width: 100%;
                padding: 8px;
                border: 1px solid var(--hermes-border);
                border-radius: 4px;
                background: var(--hermes-input-bg);
                color: var(--hermes-text);
              ">
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="'Comic Sans MS', cursive" selected>Comic Sans MS</option>
                <option value="Impact, Arial Black, sans-serif">Impact</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                <option value="Verdana, sans-serif">Verdana</option>
              </select>
            </div>
            
            <!-- Font Size -->
            <div>
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">
                Font Size: <span id="font-size-display">16px</span>
              </label>
              <input type="range" id="font-size" min="8" max="72" value="16" style="
                width: 100%;
                height: 6px;
                border-radius: 3px;
                background: var(--hermes-border);
                outline: none;
                -webkit-appearance: none;
              ">
            </div>
            
            <!-- Font Weight -->
            <div>
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">Font Weight</label>
              <select id="font-weight" style="
                width: 100%;
                padding: 8px;
                border: 1px solid var(--hermes-border);
                border-radius: 4px;
                background: var(--hermes-input-bg);
                color: var(--hermes-text);
              ">
                <option value="100">Thin (100)</option>
                <option value="300">Light (300)</option>
                <option value="400" selected>Normal (400)</option>
                <option value="600">Semi-Bold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="900">Black (900)</option>
              </select>
            </div>
            
            <!-- Text Color -->
            <div>
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">Text Color</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="color" id="text-color" value="#2c3e50" style="
                  width: 40px;
                  height: 32px;
                  border: 1px solid var(--hermes-border);
                  border-radius: 4px;
                  cursor: pointer;
                ">
                <input type="text" id="text-color-hex" value="#2c3e50" style="
                  flex: 1;
                  padding: 8px;
                  border: 1px solid var(--hermes-border);
                  border-radius: 4px;
                  background: var(--hermes-input-bg);
                  color: var(--hermes-text);
                  font-family: monospace;
                ">
              </div>
            </div>
          </div>
          
          <!-- Advanced Controls -->
          <div style="margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <!-- Letter Spacing -->
            <div>
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">
                Letter Spacing: <span id="letter-spacing-display">0px</span>
              </label>
              <input type="range" id="letter-spacing" min="-5" max="20" value="0" style="
                width: 100%;
                height: 4px;
                border-radius: 2px;
                background: var(--hermes-border);
                outline: none;
                -webkit-appearance: none;
              ">
            </div>
            
            <!-- Line Height -->
            <div>
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">
                Line Height: <span id="line-height-display">1.4</span>
              </label>
              <input type="range" id="line-height" min="0.8" max="3" value="1.4" step="0.1" style="
                width: 100%;
                height: 4px;
                border-radius: 2px;
                background: var(--hermes-border);
                outline: none;
                -webkit-appearance: none;
              ">
            </div>
            
            <!-- Text Align -->
            <div>
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">Text Align</label>
              <div style="display: flex; gap: 4px;">
                <button onclick="this.setTextAlign('left')" class="align-btn active" data-align="left" style="
                  flex: 1;
                  padding: 8px;
                  border: 1px solid var(--hermes-border);
                  border-radius: 4px;
                  background: var(--hermes-highlight-bg);
                  color: var(--hermes-highlight-text);
                  cursor: pointer;
                ">⬅️</button>
                <button onclick="this.setTextAlign('center')" class="align-btn" data-align="center" style="
                  flex: 1;
                  padding: 8px;
                  border: 1px solid var(--hermes-border);
                  border-radius: 4px;
                  background: var(--hermes-button-bg);
                  color: var(--hermes-text);
                  cursor: pointer;
                ">⬆️</button>
                <button onclick="this.setTextAlign('right')" class="align-btn" data-align="right" style="
                  flex: 1;
                  padding: 8px;
                  border: 1px solid var(--hermes-border);
                  border-radius: 4px;
                  background: var(--hermes-button-bg);
                  color: var(--hermes-text);
                  cursor: pointer;
                ">➡️</button>
              </div>
            </div>
            
            <!-- Text Transform -->
            <div>
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">Text Transform</label>
              <select id="text-transform" style="
                width: 100%;
                padding: 8px;
                border: 1px solid var(--hermes-border);
                border-radius: 4px;
                background: var(--hermes-input-bg);
                color: var(--hermes-text);
              ">
                <option value="none">None</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Live Preview -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">👁️ Live Preview</h4>
          
          <div id="text-preview" style="
            min-height: 100px;
            padding: 20px;
            background: white;
            border: 2px dashed var(--hermes-border);
            border-radius: 8px;
            font-family: 'Comic Sans MS', cursive;
            font-size: 16px;
            color: #2c3e50;
            line-height: 1.4;
            text-align: left;
          ">Welcome to Typography Studio! 🎨</div>
          
          <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button onclick="this.addToCard()" style="
              padding: 10px 20px;
              border: none;
              border-radius: 6px;
              background: var(--hermes-success-text);
              color: white;
              cursor: pointer;
              font-weight: bold;
            ">➕ Add to Card</button>
            
            <button onclick="this.saveAsPreset()" style="
              padding: 10px 20px;
              border: none;
              border-radius: 6px;
              background: var(--hermes-info-text);
              color: white;
              cursor: pointer;
              font-weight: bold;
            ">💾 Save as Preset</button>
            
            <button onclick="this.exportText()" style="
              padding: 10px 20px;
              border: 1px solid var(--hermes-border);
              border-radius: 6px;
              background: var(--hermes-button-bg);
              color: var(--hermes-text);
              cursor: pointer;
            ">📤 Export</button>
          </div>
        </div>
      </div>
    `;
  },

  generateFontLibraryView() {
    return `
      <div class="font-library-view">
        <!-- System Fonts -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🖥️ System Fonts</h4>
          
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
          ">
            ${this.generateSystemFonts()}
          </div>
        </div>

        <!-- Web Fonts -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🌐 Google Fonts</h4>
          
          <div style="margin-bottom: 15px;">
            <input type="text" id="font-search" placeholder="Search Google Fonts..." style="
              width: 100%;
              padding: 10px;
              border: 1px solid var(--hermes-border);
              border-radius: 6px;
              background: var(--hermes-input-bg);
              color: var(--hermes-text);
            ">
          </div>
          
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
          ">
            ${this.generateGoogleFonts()}
          </div>
        </div>

        <!-- Custom Fonts -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="margin: 0; color: var(--hermes-text);">📁 Custom Fonts</h4>
            <button onclick="this.addCustomFont()" style="
              padding: 8px 16px;
              border: none;
              border-radius: 6px;
              background: var(--hermes-success-text);
              color: white;
              cursor: pointer;
              font-weight: bold;
            ">➕ Add Font</button>
          </div>
          
          <div id="custom-fonts-grid" style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
          ">
            ${this.customFonts.length === 0 ? `
              <div style="
                grid-column: 1 / -1;
                text-align: center;
                color: var(--hermes-disabled-text);
                font-style: italic;
                padding: 40px;
              ">
                <div style="font-size: 3em; margin-bottom: 15px;">📁</div>
                <div>No custom fonts yet</div>
                <div style="font-size: 0.9em; margin-top: 5px;">Upload your own font files (.ttf, .otf, .woff)</div>
              </div>
            ` : this.generateCustomFonts()}
          </div>
        </div>
      </div>
    `;
  },

  generateTextEffectsView() {
    return `
      <div class="text-effects-view">
        <!-- Shadow Effects -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🌑 Shadow Effects</h4>
          
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
          ">
            ${this.generateShadowEffects()}
          </div>
        </div>

        <!-- Animated Effects -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">✨ Animated Effects</h4>
          
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
          ">
            ${this.generateAnimatedEffects()}
          </div>
        </div>

        <!-- Special Effects -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🌟 Special Effects</h4>
          
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
          ">
            ${this.generateSpecialEffects()}
          </div>
        </div>
      </div>
    `;
  },

  generatePresetsView() {
    return `
      <div class="presets-view">
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="margin: 0; color: var(--hermes-text);">🎨 Text Presets</h4>
            <button onclick="this.createNewPreset()" style="
              padding: 8px 16px;
              border: none;
              border-radius: 6px;
              background: var(--hermes-success-text);
              color: white;
              cursor: pointer;
              font-weight: bold;
            ">➕ New Preset</button>
          </div>
          
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
          ">
            ${this.textPresets.map(preset => `
              <div style="
                background: var(--hermes-bg);
                border: 1px solid var(--hermes-border);
                border-radius: 8px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.2s;
              " onclick="this.applyPreset('${preset.id}')" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
                <div style="
                  font-family: ${preset.fontFamily};
                  font-size: ${Math.min(preset.fontSize, 20)}px;
                  font-weight: ${preset.fontWeight};
                  color: ${preset.color};
                  text-shadow: ${preset.textShadow || 'none'};
                  text-transform: ${preset.textTransform || 'none'};
                  letter-spacing: ${preset.letterSpacing || '0px'};
                  background: ${preset.backgroundColor || 'transparent'};
                  padding: ${preset.padding || '0'};
                  margin-bottom: 10px;
                  text-align: center;
                  border-radius: 4px;
                ">Sample Text</div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 4px;">${preset.name}</div>
                    <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">
                      ${preset.fontFamily.split(',')[0]} • ${preset.fontSize}px
                    </div>
                  </div>
                  <div style="display: flex; gap: 4px;">
                    <button onclick="event.stopPropagation(); this.editPreset('${preset.id}')" style="
                      padding: 4px 8px;
                      border: none;
                      border-radius: 3px;
                      background: var(--hermes-info-text);
                      color: white;
                      cursor: pointer;
                      font-size: 0.8em;
                    ">✏️</button>
                    <button onclick="event.stopPropagation(); this.deletePreset('${preset.id}')" style="
                      padding: 4px 8px;
                      border: none;
                      border-radius: 3px;
                      background: var(--hermes-error-text);
                      color: white;
                      cursor: pointer;
                      font-size: 0.8em;
                    ">🗑️</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  generateSystemFonts() {
    const systemFonts = [
      { name: 'Arial', family: 'Arial, sans-serif', category: 'Sans-serif' },
      { name: 'Georgia', family: 'Georgia, serif', category: 'Serif' },
      { name: 'Times New Roman', family: '"Times New Roman", serif', category: 'Serif' },
      { name: 'Courier New', family: '"Courier New", monospace', category: 'Monospace' },
      { name: 'Comic Sans MS', family: '"Comic Sans MS", cursive', category: 'Cursive' },
      { name: 'Impact', family: 'Impact, Arial Black, sans-serif', category: 'Display' },
      { name: 'Trebuchet MS', family: '"Trebuchet MS", sans-serif', category: 'Sans-serif' },
      { name: 'Verdana', family: 'Verdana, sans-serif', category: 'Sans-serif' }
    ];

    return systemFonts.map(font => `
      <div style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.2s;
      " onclick="this.selectFont('${font.family}')" onmouseenter="this.style.borderColor='var(--hermes-highlight-bg)'" onmouseleave="this.style.borderColor='var(--hermes-border)'">
        <div style="
          font-family: ${font.family};
          font-size: 18px;
          color: var(--hermes-text);
          margin-bottom: 8px;
        ">The quick brown fox</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: bold; color: var(--hermes-text); font-size: 0.9em;">${font.name}</div>
            <div style="font-size: 0.7em; color: var(--hermes-disabled-text);">${font.category}</div>
          </div>
          <button onclick="event.stopPropagation(); this.previewFont('${font.family}')" style="
            padding: 4px 8px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-info-text);
            color: white;
            cursor: pointer;
            font-size: 0.8em;
          ">👁️</button>
        </div>
      </div>
    `).join('');
  },

  generateGoogleFonts() {
    const googleFonts = [
      { name: 'Roboto', family: 'Roboto, sans-serif', category: 'Sans-serif' },
      { name: 'Open Sans', family: 'Open Sans, sans-serif', category: 'Sans-serif' },
      { name: 'Lato', family: 'Lato, sans-serif', category: 'Sans-serif' },
      { name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'Sans-serif' },
      { name: 'Playfair Display', family: 'Playfair Display, serif', category: 'Serif' },
      { name: 'Dancing Script', family: 'Dancing Script, cursive', category: 'Handwriting' }
    ];

    return googleFonts.map(font => `
      <div style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.2s;
      " onclick="this.loadGoogleFont('${font.name}', '${font.family}')" onmouseenter="this.style.borderColor='var(--hermes-highlight-bg)'" onmouseleave="this.style.borderColor='var(--hermes-border)'">
        <div style="
          font-family: ${font.family};
          font-size: 18px;
          color: var(--hermes-text);
          margin-bottom: 8px;
        ">The quick brown fox</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: bold; color: var(--hermes-text); font-size: 0.9em;">${font.name}</div>
            <div style="font-size: 0.7em; color: var(--hermes-disabled-text);">${font.category} • Google Fonts</div>
          </div>
          <button onclick="event.stopPropagation(); this.loadGoogleFont('${font.name}', '${font.family}')" style="
            padding: 4px 8px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-success-text);
            color: white;
            cursor: pointer;
            font-size: 0.8em;
          ">📥</button>
        </div>
      </div>
    `).join('');
  },

  generateCustomFonts() {
    return this.customFonts.map(font => `
      <div style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.2s;
      " onclick="this.selectFont('${font.family}')" onmouseenter="this.style.borderColor='var(--hermes-highlight-bg)'" onmouseleave="this.style.borderColor='var(--hermes-border)'">
        <div style="
          font-family: ${font.family};
          font-size: 18px;
          color: var(--hermes-text);
          margin-bottom: 8px;
        ">The quick brown fox</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: bold; color: var(--hermes-text); font-size: 0.9em;">${font.name}</div>
            <div style="font-size: 0.7em; color: var(--hermes-disabled-text);">Custom Font</div>
          </div>
          <button onclick="event.stopPropagation(); this.removeCustomFont('${font.id}')" style="
            padding: 4px 8px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-error-text);
            color: white;
            cursor: pointer;
            font-size: 0.8em;
          ">🗑️</button>
        </div>
      </div>
    `).join('');
  },

  generateShadowEffects() {
    const shadows = [
      { name: 'Soft', value: '2px 2px 4px rgba(0,0,0,0.3)', color: '#4ecdc4' },
      { name: 'Hard', value: '4px 4px 0px rgba(0,0,0,0.8)', color: '#ff6b6b' },
      { name: 'Glow', value: '0 0 10px currentColor', color: '#45b7d1' },
      { name: 'Neon', value: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor', color: '#96ceb4' },
      { name: 'Emboss', value: '1px 1px 0px rgba(255,255,255,0.8), -1px -1px 0px rgba(0,0,0,0.3)', color: '#feca57' },
      { name: 'Inset', value: 'inset 2px 2px 4px rgba(0,0,0,0.3)', color: '#ff9ff3' }
    ];

    return shadows.map(shadow => `
      <button onclick="this.applyShadowEffect('${shadow.value}')" style="
        padding: 15px;
        border: none;
        border-radius: 6px;
        background: ${shadow.color};
        color: white;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;
        text-shadow: ${shadow.value};
        font-weight: bold;
      " onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
        ${shadow.name}
      </button>
    `).join('');
  },

  generateAnimatedEffects() {
    const animations = [
      { name: 'Typewriter', id: 'typewriter', color: '#667eea' },
      { name: 'Fade In', id: 'fadeIn', color: '#764ba2' },
      { name: 'Bounce', id: 'bounce', color: '#f093fb' },
      { name: 'Pulse', id: 'pulse', color: '#f5576c' },
      { name: 'Rainbow', id: 'rainbow', color: '#4ecdc4' },
      { name: 'Wave', id: 'wave', color: '#ff6b6b' }
    ];

    return animations.map(anim => `
      <button onclick="this.applyAnimatedEffect('${anim.id}')" style="
        padding: 15px;
        border: none;
        border-radius: 6px;
        background: ${anim.color};
        color: white;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;
        font-weight: bold;
      " onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
        ${anim.name}
      </button>
    `).join('');
  },

  generateSpecialEffects() {
    const effects = [
      { name: 'Gradient', id: 'gradient', color: '#667eea' },
      { name: 'Outline', id: 'outline', color: '#764ba2' },
      { name: '3D', id: 'threed', color: '#f093fb' },
      { name: 'Fire', id: 'fire', color: '#f5576c' },
      { name: 'Ice', id: 'ice', color: '#4ecdc4' },
      { name: 'Glitch', id: 'glitch', color: '#ff6b6b' }
    ];

    return effects.map(effect => `
      <button onclick="this.applySpecialEffect('${effect.id}')" style="
        padding: 15px;
        border: none;
        border-radius: 6px;
        background: ${effect.color};
        color: white;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;
        font-weight: bold;
      " onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
        ${effect.name}
      </button>
    `).join('');
  },

  bindTextEditorEvents() {
    // Bind all text editor controls
    const textInput = document.getElementById('text-input');
    const preview = document.getElementById('text-preview');
    
    if (textInput && preview) {
      textInput.addEventListener('input', () => {
        preview.textContent = textInput.value || 'Sample Text';
      });
    }

    // Font controls
    const fontFamily = document.getElementById('font-family');
    const fontSize = document.getElementById('font-size');
    const fontWeight = document.getElementById('font-weight');
    const textColor = document.getElementById('text-color');
    const letterSpacing = document.getElementById('letter-spacing');
    const lineHeight = document.getElementById('line-height');
    const textTransform = document.getElementById('text-transform');

    if (fontFamily) {
      fontFamily.addEventListener('change', () => {
        if (preview) preview.style.fontFamily = fontFamily.value;
      });
    }

    if (fontSize) {
      fontSize.addEventListener('input', () => {
        const size = fontSize.value + 'px';
        if (preview) preview.style.fontSize = size;
        const display = document.getElementById('font-size-display');
        if (display) display.textContent = size;
      });
    }

    if (fontWeight) {
      fontWeight.addEventListener('change', () => {
        if (preview) preview.style.fontWeight = fontWeight.value;
      });
    }

    if (textColor) {
      textColor.addEventListener('input', () => {
        if (preview) preview.style.color = textColor.value;
        const hex = document.getElementById('text-color-hex');
        if (hex) hex.value = textColor.value;
      });
    }

    if (letterSpacing) {
      letterSpacing.addEventListener('input', () => {
        const spacing = letterSpacing.value + 'px';
        if (preview) preview.style.letterSpacing = spacing;
        const display = document.getElementById('letter-spacing-display');
        if (display) display.textContent = spacing;
      });
    }

    if (lineHeight) {
      lineHeight.addEventListener('input', () => {
        if (preview) preview.style.lineHeight = lineHeight.value;
        const display = document.getElementById('line-height-display');
        if (display) display.textContent = lineHeight.value;
      });
    }

    if (textTransform) {
      textTransform.addEventListener('change', () => {
        if (preview) preview.style.textTransform = textTransform.value;
      });
    }
  },

  bindFontLibraryEvents() {
    // Font library events
  },

  bindTextEffectsEvents() {
    // Text effects events
  },

  bindPresetsEvents() {
    // Presets events
  },

  setTextAlign(align) {
    const preview = document.getElementById('text-preview');
    if (preview) {
      preview.style.textAlign = align;
    }

    // Update button states
    document.querySelectorAll('.align-btn').forEach(btn => {
      btn.style.background = 'var(--hermes-button-bg)';
      btn.style.color = 'var(--hermes-text)';
    });

    const activeBtn = document.querySelector(`[data-align="${align}"]`);
    if (activeBtn) {
      activeBtn.style.background = 'var(--hermes-highlight-bg)';
      activeBtn.style.color = 'var(--hermes-highlight-text)';
    }
  },

  applyPreset(presetId) {
    const preset = this.textPresets.find(p => p.id === presetId);
    if (!preset) return;

    // Apply preset to text editor
    const preview = document.getElementById('text-preview');
    if (preview) {
      Object.assign(preview.style, {
        fontFamily: preset.fontFamily,
        fontSize: preset.fontSize + 'px',
        fontWeight: preset.fontWeight,
        color: preset.color,
        textShadow: preset.textShadow || 'none',
        textTransform: preset.textTransform || 'none',
        letterSpacing: preset.letterSpacing || '0px',
        backgroundColor: preset.backgroundColor || 'transparent',
        padding: preset.padding || '20px'
      });
    }

    // Update controls
    this.updateControlsFromPreset(preset);
  },

  updateControlsFromPreset(preset) {
    const controls = {
      'font-family': preset.fontFamily,
      'font-size': preset.fontSize,
      'font-weight': preset.fontWeight,
      'text-color': preset.color,
      'letter-spacing': preset.letterSpacing ? parseInt(preset.letterSpacing) : 0,
      'line-height': preset.lineHeight || 1.4,
      'text-transform': preset.textTransform || 'none'
    };

    Object.entries(controls).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
      }
    });

    // Update displays
    const displays = {
      'font-size-display': preset.fontSize + 'px',
      'letter-spacing-display': (preset.letterSpacing || '0px'),
      'line-height-display': preset.lineHeight || '1.4'
    };

    Object.entries(displays).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  },

  addCustomFont(app) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ttf,.otf,.woff,.woff2';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fontData = e.target.result;
          const fontName = file.name.replace(/\.[^/.]+$/, "");
          
          // Create font face
          const fontFace = new FontFace(fontName, fontData);
          fontFace.load().then(() => {
            document.fonts.add(fontFace);
            
            const customFont = {
              id: crypto.randomUUID(),
              name: fontName,
              family: fontName,
              file: file.name,
              addedAt: new Date().toISOString()
            };
            
            this.customFonts.push(customFont);
            this.saveCustomFonts();
            this.switchTypographyTab('font-library'); // Refresh view
            
            if (app) app.showToast(`Font "${fontName}" added successfully!`, 'success');
          }).catch(() => {
            if (app) app.showToast('Failed to load font file', 'error');
          });
        };
        reader.readAsArrayBuffer(file);
      }
    };
    
    input.click();
  },

  saveCustomFonts() {
    localStorage.setItem('nextnote_custom_fonts', JSON.stringify(this.customFonts));
  },

  saveTextPresets() {
    localStorage.setItem('nextnote_text_presets', JSON.stringify(this.textPresets));
  },

  initializeTypographyComponents(app) {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatText {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-8px) rotate(2deg); }
      }
      
      @keyframes typewriter {
        from { width: 0; }
        to { width: 100%; }
      }
      
      @keyframes rainbow {
        0% { color: #ff0000; }
        16% { color: #ff8000; }
        33% { color: #ffff00; }
        50% { color: #00ff00; }
        66% { color: #0080ff; }
        83% { color: #8000ff; }
        100% { color: #ff0000; }
      }
    `;
    document.head.appendChild(style);
  },

  bindTypographyEvents(app) {
    // Listen for typography events
    app.on('textUpdated', () => {
      this.saveTextPresets();
    });
  }
});
