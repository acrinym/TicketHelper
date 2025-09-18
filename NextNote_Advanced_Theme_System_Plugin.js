/**
 * NextNote Advanced Theme System Plugin
 * Hermes theme integration with CSS custom properties and real-time switching
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Advanced Theme System',
  version: '1.0.0',
  description: 'Hermes theme integration with CSS custom properties and real-time switching',
  
  onLoad(app) {
    this.currentTheme = localStorage.getItem('nextnote_current_theme') || 'mint';
    this.customThemes = JSON.parse(localStorage.getItem('nextnote_custom_themes') || '{}');
    this.themeHistory = JSON.parse(localStorage.getItem('nextnote_theme_history') || '[]');
    this.setupAdvancedThemeUI(app);
    this.initializeThemeSystem();
    this.loadHermesThemes();
    this.applyTheme(this.currentTheme);
    this.bindThemeEvents(app);
  },

  setupAdvancedThemeUI(app) {
    const panel = app.createPanel('advanced-theme-system', 'Theme Studio');
    
    // Header with theme gradient
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

    // Floating theme icons
    const themeIcons = ['🎨', '🌈', '✨', '🎭', '🌟', '💫'];
    themeIcons.forEach((icon, index) => {
      const floatingIcon = document.createElement('div');
      floatingIcon.style.cssText = `
        position: absolute;
        font-size: 1.3em;
        opacity: 0.2;
        animation: floatTheme ${4 + index}s ease-in-out infinite;
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
    title.innerHTML = '🎨 Theme Studio';

    const themeControls = document.createElement('div');
    themeControls.style.cssText = `
      display: flex;
      gap: 10px;
      z-index: 1;
      position: relative;
    `;

    const randomThemeBtn = document.createElement('button');
    randomThemeBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    randomThemeBtn.textContent = '🎲 Random';
    randomThemeBtn.addEventListener('click', () => this.applyRandomTheme());

    const exportThemeBtn = document.createElement('button');
    exportThemeBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    exportThemeBtn.textContent = '📤 Export';
    exportThemeBtn.addEventListener('click', () => this.exportCurrentTheme());

    themeControls.appendChild(randomThemeBtn);
    themeControls.appendChild(exportThemeBtn);

    header.appendChild(title);
    header.appendChild(themeControls);
    panel.appendChild(header);

    // Theme Selector
    const themeSelector = document.createElement('div');
    themeSelector.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    `;

    themeSelector.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text); display: flex; align-items: center; gap: 8px;">
        🌈 Theme Gallery
      </h4>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; margin-bottom: 20px;">
        ${this.generateThemeGrid()}
      </div>
      
      <div style="display: flex; gap: 10px; align-items: center; margin-top: 15px;">
        <select id="theme-selector" style="
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--hermes-border);
          border-radius: 6px;
          background: var(--hermes-input-bg);
          color: var(--hermes-text);
          font-size: 1em;
        ">
          ${this.generateThemeOptions()}
        </select>
        
        <button onclick="this.applySelectedTheme()" style="
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          background: var(--hermes-success-text);
          color: white;
          cursor: pointer;
          font-weight: bold;
        ">Apply</button>
      </div>
    `;

    panel.appendChild(themeSelector);

    // Theme Customizer
    const themeCustomizer = document.createElement('div');
    themeCustomizer.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    `;

    themeCustomizer.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text); display: flex; align-items: center; gap: 8px;">
        🎭 Theme Customizer
      </h4>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        <div>
          <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">Background Color</label>
          <input type="color" id="bg-color" value="#242e29" style="width: 100%; height: 40px; border: none; border-radius: 4px; cursor: pointer;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">Primary Color</label>
          <input type="color" id="primary-color" value="#97e6b0" style="width: 100%; height: 40px; border: none; border-radius: 4px; cursor: pointer;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">Accent Color</label>
          <input type="color" id="accent-color" value="#29dc91" style="width: 100%; height: 40px; border: none; border-radius: 4px; cursor: pointer;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">Text Color</label>
          <input type="color" id="text-color" value="#f4fff8" style="width: 100%; height: 40px; border: none; border-radius: 4px; cursor: pointer;">
        </div>
      </div>
      
      <div style="margin-top: 15px; display: flex; gap: 10px;">
        <button onclick="this.previewCustomTheme()" style="
          padding: 8px 16px;
          border: 1px solid var(--hermes-border);
          border-radius: 6px;
          background: var(--hermes-button-bg);
          color: var(--hermes-text);
          cursor: pointer;
          font-weight: bold;
        ">👁️ Preview</button>
        
        <button onclick="this.saveCustomTheme()" style="
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          background: var(--hermes-success-text);
          color: white;
          cursor: pointer;
          font-weight: bold;
        ">💾 Save Theme</button>
        
        <button onclick="this.resetToDefault()" style="
          padding: 8px 16px;
          border: 1px solid var(--hermes-error-text);
          border-radius: 6px;
          background: transparent;
          color: var(--hermes-error-text);
          cursor: pointer;
          font-weight: bold;
        ">🔄 Reset</button>
      </div>
    `;

    panel.appendChild(themeCustomizer);

    // Theme History
    const themeHistory = document.createElement('div');
    themeHistory.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
    `;

    themeHistory.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text); display: flex; align-items: center; gap: 8px;">
        📚 Theme History
      </h4>
      
      <div id="theme-history-list" style="
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid var(--hermes-border);
        border-radius: 4px;
        background: var(--hermes-bg);
      ">
        ${this.generateThemeHistory()}
      </div>
    `;

    panel.appendChild(themeHistory);
  },

  generateThemeGrid() {
    const themes = this.getHermesThemes();
    
    return Object.keys(themes).map(themeName => {
      const theme = themes[themeName];
      const bgColor = this.extractColorFromTheme(theme, 'hermes-bg');
      const primaryColor = this.extractColorFromTheme(theme, 'hermes-primary');
      const accentColor = this.extractColorFromTheme(theme, 'hermes-accent');
      
      return `
        <div class="theme-preview" data-theme="${themeName}" style="
          background: linear-gradient(135deg, ${bgColor}, ${primaryColor}, ${accentColor});
          border: 3px solid ${this.currentTheme === themeName ? '#fff' : 'transparent'};
          border-radius: 8px;
          height: 80px;
          cursor: pointer;
          position: relative;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        " onclick="this.applyTheme('${themeName}')" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
          <div style="text-align: center;">
            <div style="font-size: 1.2em; margin-bottom: 4px;">${this.getThemeIcon(themeName)}</div>
            <div style="font-size: 0.8em; text-transform: capitalize;">${themeName}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  generateThemeOptions() {
    const themes = this.getHermesThemes();
    
    return Object.keys(themes).map(themeName => {
      return `<option value="${themeName}" ${this.currentTheme === themeName ? 'selected' : ''}>${themeName.charAt(0).toUpperCase() + themeName.slice(1)}</option>`;
    }).join('');
  },

  generateThemeHistory() {
    if (this.themeHistory.length === 0) {
      return `
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic; padding: 40px;">
          <div style="font-size: 3em; margin-bottom: 15px;">📚</div>
          <div>No theme history</div>
          <div style="font-size: 0.9em; margin-top: 5px;">Start switching themes to build history</div>
        </div>
      `;
    }

    return this.themeHistory.slice(-10).reverse().map((entry, index) => {
      const date = new Date(entry.timestamp).toLocaleString();
      
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
            <span style="font-size: 1.2em;">${this.getThemeIcon(entry.theme)}</span>
            <div>
              <div style="font-weight: bold; color: var(--hermes-text); text-transform: capitalize;">${entry.theme}</div>
              <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">${date}</div>
            </div>
          </div>
          
          <button onclick="this.applyTheme('${entry.theme}')" style="
            padding: 4px 8px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-success-text);
            color: white;
            cursor: pointer;
            font-size: 0.8em;
          ">Apply</button>
        </div>
      `;
    }).join('');
  },

  getThemeIcon(themeName) {
    const icons = {
      'mint': '🌿',
      'ocean': '🌊',
      'sunset': '🌅',
      'forest': '🌲',
      'lavender': '💜',
      'coral': '🪸',
      'midnight': '🌙',
      'autumn': '🍂',
      'cherry': '🌸',
      'emerald': '💚',
      'gold': '✨',
      'slate': '🗿'
    };
    return icons[themeName] || '🎨';
  },

  extractColorFromTheme(themeCSS, colorVar) {
    const match = themeCSS.match(new RegExp(`--${colorVar}:\\s*([^;]+)`));
    return match ? match[1].trim() : '#000000';
  },

  getHermesThemes() {
    return {
      mint: `
        --hermes-bg: #242e29;
        --hermes-bg2: #304039;
        --hermes-primary: #97e6b0;
        --hermes-accent: #29dc91;
        --hermes-card: #304039;
        --hermes-text: #f4fff8;
        --hermes-border: #2dcfa5;
        --hermes-lock: #83c6ae;
        --hermes-error-text: #ff5c5c;
        --hermes-success-text: #4caf50;
        --hermes-info-text: #2196f3;
        --hermes-warning-text: #ff9800;
        --hermes-disabled-text: #888;
        --hermes-disabled-bg: #555;
        --hermes-button-bg: var(--hermes-accent);
        --hermes-button-text: var(--hermes-bg);
        --hermes-button-hover-bg: var(--hermes-primary);
        --hermes-panel-bg: var(--hermes-bg2);
        --hermes-panel-text: var(--hermes-text);
        --hermes-panel-border: var(--hermes-border);
        --hermes-input-bg: var(--hermes-bg);
        --hermes-input-text: var(--hermes-text);
        --hermes-input-border: var(--hermes-accent);
        --hermes-highlight-bg: var(--hermes-primary);
        --hermes-highlight-text: var(--hermes-bg);
      `,
      ocean: `
        --hermes-bg: #1a2332;
        --hermes-bg2: #2a3441;
        --hermes-primary: #64b5f6;
        --hermes-accent: #2196f3;
        --hermes-card: #2a3441;
        --hermes-text: #e3f2fd;
        --hermes-border: #42a5f5;
        --hermes-lock: #81c784;
        --hermes-error-text: #f44336;
        --hermes-success-text: #4caf50;
        --hermes-info-text: #03a9f4;
        --hermes-warning-text: #ff9800;
        --hermes-disabled-text: #888;
        --hermes-disabled-bg: #555;
        --hermes-button-bg: var(--hermes-accent);
        --hermes-button-text: white;
        --hermes-button-hover-bg: var(--hermes-primary);
        --hermes-panel-bg: var(--hermes-bg2);
        --hermes-panel-text: var(--hermes-text);
        --hermes-panel-border: var(--hermes-border);
        --hermes-input-bg: var(--hermes-bg);
        --hermes-input-text: var(--hermes-text);
        --hermes-input-border: var(--hermes-accent);
        --hermes-highlight-bg: var(--hermes-primary);
        --hermes-highlight-text: white;
      `,
      sunset: `
        --hermes-bg: #2d1b1b;
        --hermes-bg2: #3d2b2b;
        --hermes-primary: #ff8a65;
        --hermes-accent: #ff5722;
        --hermes-card: #3d2b2b;
        --hermes-text: #fff3e0;
        --hermes-border: #ff7043;
        --hermes-lock: #ffb74d;
        --hermes-error-text: #f44336;
        --hermes-success-text: #4caf50;
        --hermes-info-text: #2196f3;
        --hermes-warning-text: #ff9800;
        --hermes-disabled-text: #888;
        --hermes-disabled-bg: #555;
        --hermes-button-bg: var(--hermes-accent);
        --hermes-button-text: white;
        --hermes-button-hover-bg: var(--hermes-primary);
        --hermes-panel-bg: var(--hermes-bg2);
        --hermes-panel-text: var(--hermes-text);
        --hermes-panel-border: var(--hermes-border);
        --hermes-input-bg: var(--hermes-bg);
        --hermes-input-text: var(--hermes-text);
        --hermes-input-border: var(--hermes-accent);
        --hermes-highlight-bg: var(--hermes-primary);
        --hermes-highlight-text: white;
      `,
      forest: `
        --hermes-bg: #1b2d1b;
        --hermes-bg2: #2b3d2b;
        --hermes-primary: #81c784;
        --hermes-accent: #4caf50;
        --hermes-card: #2b3d2b;
        --hermes-text: #e8f5e8;
        --hermes-border: #66bb6a;
        --hermes-lock: #aed581;
        --hermes-error-text: #f44336;
        --hermes-success-text: #388e3c;
        --hermes-info-text: #2196f3;
        --hermes-warning-text: #ff9800;
        --hermes-disabled-text: #888;
        --hermes-disabled-bg: #555;
        --hermes-button-bg: var(--hermes-accent);
        --hermes-button-text: white;
        --hermes-button-hover-bg: var(--hermes-primary);
        --hermes-panel-bg: var(--hermes-bg2);
        --hermes-panel-text: var(--hermes-text);
        --hermes-panel-border: var(--hermes-border);
        --hermes-input-bg: var(--hermes-bg);
        --hermes-input-text: var(--hermes-text);
        --hermes-input-border: var(--hermes-accent);
        --hermes-highlight-bg: var(--hermes-primary);
        --hermes-highlight-text: white;
      `,
      lavender: `
        --hermes-bg: #2d1b2d;
        --hermes-bg2: #3d2b3d;
        --hermes-primary: #ce93d8;
        --hermes-accent: #9c27b0;
        --hermes-card: #3d2b3d;
        --hermes-text: #f3e5f5;
        --hermes-border: #ba68c8;
        --hermes-lock: #dda0dd;
        --hermes-error-text: #f44336;
        --hermes-success-text: #4caf50;
        --hermes-info-text: #2196f3;
        --hermes-warning-text: #ff9800;
        --hermes-disabled-text: #888;
        --hermes-disabled-bg: #555;
        --hermes-button-bg: var(--hermes-accent);
        --hermes-button-text: white;
        --hermes-button-hover-bg: var(--hermes-primary);
        --hermes-panel-bg: var(--hermes-bg2);
        --hermes-panel-text: var(--hermes-text);
        --hermes-panel-border: var(--hermes-border);
        --hermes-input-bg: var(--hermes-bg);
        --hermes-input-text: var(--hermes-text);
        --hermes-input-border: var(--hermes-accent);
        --hermes-highlight-bg: var(--hermes-primary);
        --hermes-highlight-text: white;
      `,
      coral: `
        --hermes-bg: #2d1f1f;
        --hermes-bg2: #3d2f2f;
        --hermes-primary: #ffab91;
        --hermes-accent: #ff6f00;
        --hermes-card: #3d2f2f;
        --hermes-text: #fff8e1;
        --hermes-border: #ff8f65;
        --hermes-lock: #ffcc02;
        --hermes-error-text: #f44336;
        --hermes-success-text: #4caf50;
        --hermes-info-text: #2196f3;
        --hermes-warning-text: #ff9800;
        --hermes-disabled-text: #888;
        --hermes-disabled-bg: #555;
        --hermes-button-bg: var(--hermes-accent);
        --hermes-button-text: white;
        --hermes-button-hover-bg: var(--hermes-primary);
        --hermes-panel-bg: var(--hermes-bg2);
        --hermes-panel-text: var(--hermes-text);
        --hermes-panel-border: var(--hermes-border);
        --hermes-input-bg: var(--hermes-bg);
        --hermes-input-text: var(--hermes-text);
        --hermes-input-border: var(--hermes-accent);
        --hermes-highlight-bg: var(--hermes-primary);
        --hermes-highlight-text: white;
      `,
      midnight: `
        --hermes-bg: #0d1117;
        --hermes-bg2: #161b22;
        --hermes-primary: #58a6ff;
        --hermes-accent: #1f6feb;
        --hermes-card: #161b22;
        --hermes-text: #c9d1d9;
        --hermes-border: #30363d;
        --hermes-lock: #ffd700;
        --hermes-error-text: #f85149;
        --hermes-success-text: #3fb950;
        --hermes-info-text: #58a6ff;
        --hermes-warning-text: #d29922;
        --hermes-disabled-text: #7d8590;
        --hermes-disabled-bg: #21262d;
        --hermes-button-bg: var(--hermes-accent);
        --hermes-button-text: white;
        --hermes-button-hover-bg: var(--hermes-primary);
        --hermes-panel-bg: var(--hermes-bg2);
        --hermes-panel-text: var(--hermes-text);
        --hermes-panel-border: var(--hermes-border);
        --hermes-input-bg: var(--hermes-bg);
        --hermes-input-text: var(--hermes-text);
        --hermes-input-border: var(--hermes-accent);
        --hermes-highlight-bg: var(--hermes-primary);
        --hermes-highlight-text: white;
      `,
      autumn: `
        --hermes-bg: #2d1f0d;
        --hermes-bg2: #3d2f1d;
        --hermes-primary: #ffb74d;
        --hermes-accent: #ff8f00;
        --hermes-card: #3d2f1d;
        --hermes-text: #fff8e1;
        --hermes-border: #ffa726;
        --hermes-lock: #ffcc02;
        --hermes-error-text: #f44336;
        --hermes-success-text: #4caf50;
        --hermes-info-text: #2196f3;
        --hermes-warning-text: #ff9800;
        --hermes-disabled-text: #888;
        --hermes-disabled-bg: #555;
        --hermes-button-bg: var(--hermes-accent);
        --hermes-button-text: white;
        --hermes-button-hover-bg: var(--hermes-primary);
        --hermes-panel-bg: var(--hermes-bg2);
        --hermes-panel-text: var(--hermes-text);
        --hermes-panel-border: var(--hermes-border);
        --hermes-input-bg: var(--hermes-bg);
        --hermes-input-text: var(--hermes-text);
        --hermes-input-border: var(--hermes-accent);
        --hermes-highlight-bg: var(--hermes-primary);
        --hermes-highlight-text: white;
      `,
      cherry: `
        --hermes-bg: #2d1a1a;
        --hermes-bg2: #3d2a2a;
        --hermes-primary: #f48fb1;
        --hermes-accent: #e91e63;
        --hermes-card: #3d2a2a;
        --hermes-text: #fce4ec;
        --hermes-border: #f06292;
        --hermes-lock: #ffb3ba;
        --hermes-error-text: #f44336;
        --hermes-success-text: #4caf50;
        --hermes-info-text: #2196f3;
        --hermes-warning-text: #ff9800;
        --hermes-disabled-text: #888;
        --hermes-disabled-bg: #555;
        --hermes-button-bg: var(--hermes-accent);
        --hermes-button-text: white;
        --hermes-button-hover-bg: var(--hermes-primary);
        --hermes-panel-bg: var(--hermes-bg2);
        --hermes-panel-text: var(--hermes-text);
        --hermes-panel-border: var(--hermes-border);
        --hermes-input-bg: var(--hermes-bg);
        --hermes-input-text: var(--hermes-text);
        --hermes-input-border: var(--hermes-accent);
        --hermes-highlight-bg: var(--hermes-primary);
        --hermes-highlight-text: white;
      `,
      emerald: `
        --hermes-bg: #0d2818;
        --hermes-bg2: #1d3828;
        --hermes-primary: #66bb6a;
        --hermes-accent: #00c853;
        --hermes-card: #1d3828;
        --hermes-text: #e8f5e8;
        --hermes-border: #4caf50;
        --hermes-lock: #81c784;
        --hermes-error-text: #f44336;
        --hermes-success-text: #2e7d32;
        --hermes-info-text: #2196f3;
        --hermes-warning-text: #ff9800;
        --hermes-disabled-text: #888;
        --hermes-disabled-bg: #555;
        --hermes-button-bg: var(--hermes-accent);
        --hermes-button-text: white;
        --hermes-button-hover-bg: var(--hermes-primary);
        --hermes-panel-bg: var(--hermes-bg2);
        --hermes-panel-text: var(--hermes-text);
        --hermes-panel-border: var(--hermes-border);
        --hermes-input-bg: var(--hermes-bg);
        --hermes-input-text: var(--hermes-text);
        --hermes-input-border: var(--hermes-accent);
        --hermes-highlight-bg: var(--hermes-primary);
        --hermes-highlight-text: white;
      `,
      gold: `
        --hermes-bg: #2d2416;
        --hermes-bg2: #3d3426;
        --hermes-primary: #ffd54f;
        --hermes-accent: #ffc107;
        --hermes-card: #3d3426;
        --hermes-text: #fffde7;
        --hermes-border: #ffca28;
        --hermes-lock: #fff176;
        --hermes-error-text: #f44336;
        --hermes-success-text: #4caf50;
        --hermes-info-text: #2196f3;
        --hermes-warning-text: #ff6f00;
        --hermes-disabled-text: #888;
        --hermes-disabled-bg: #555;
        --hermes-button-bg: var(--hermes-accent);
        --hermes-button-text: #1a1a1a;
        --hermes-button-hover-bg: var(--hermes-primary);
        --hermes-panel-bg: var(--hermes-bg2);
        --hermes-panel-text: var(--hermes-text);
        --hermes-panel-border: var(--hermes-border);
        --hermes-input-bg: var(--hermes-bg);
        --hermes-input-text: var(--hermes-text);
        --hermes-input-border: var(--hermes-accent);
        --hermes-highlight-bg: var(--hermes-primary);
        --hermes-highlight-text: #1a1a1a;
      `,
      slate: `
        --hermes-bg: #1e293b;
        --hermes-bg2: #334155;
        --hermes-primary: #94a3b8;
        --hermes-accent: #64748b;
        --hermes-card: #334155;
        --hermes-text: #f1f5f9;
        --hermes-border: #475569;
        --hermes-lock: #cbd5e1;
        --hermes-error-text: #ef4444;
        --hermes-success-text: #22c55e;
        --hermes-info-text: #3b82f6;
        --hermes-warning-text: #f59e0b;
        --hermes-disabled-text: #6b7280;
        --hermes-disabled-bg: #374151;
        --hermes-button-bg: var(--hermes-accent);
        --hermes-button-text: white;
        --hermes-button-hover-bg: var(--hermes-primary);
        --hermes-panel-bg: var(--hermes-bg2);
        --hermes-panel-text: var(--hermes-text);
        --hermes-panel-border: var(--hermes-border);
        --hermes-input-bg: var(--hermes-bg);
        --hermes-input-text: var(--hermes-text);
        --hermes-input-border: var(--hermes-accent);
        --hermes-highlight-bg: var(--hermes-primary);
        --hermes-highlight-text: white;
      `
    };
  },

  initializeThemeSystem() {
    // Add CSS for theme system
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatTheme {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-8px) rotate(2deg); }
      }
      
      .theme-preview {
        transition: all 0.3s ease;
      }
      
      .theme-preview:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      }
      
      .theme-transition {
        transition: all 0.3s ease-in-out;
      }
    `;
    document.head.appendChild(style);
  },

  loadHermesThemes() {
    // Themes are defined in getHermesThemes method
    console.log('Hermes themes loaded successfully');
  },

  applyTheme(themeName) {
    const themes = { ...this.getHermesThemes(), ...this.customThemes };
    const theme = themes[themeName];
    
    if (!theme) {
      console.error(`Theme "${themeName}" not found`);
      return;
    }

    // Apply CSS custom properties
    const root = document.documentElement;
    const themeProperties = theme.split(';').filter(prop => prop.trim());
    
    themeProperties.forEach(property => {
      const [key, value] = property.split(':').map(s => s.trim());
      if (key && value) {
        root.style.setProperty(key, value);
      }
    });

    // Update current theme
    this.currentTheme = themeName;
    localStorage.setItem('nextnote_current_theme', themeName);

    // Add to theme history
    this.addToThemeHistory(themeName);

    // Update UI
    this.updateThemeUI();
    this.refreshThemeHistory();

    // Show notification
    this.showNotification(`🎨 Applied "${themeName}" theme`, 'success');
  },

  applyRandomTheme() {
    const themes = Object.keys(this.getHermesThemes());
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    this.applyTheme(randomTheme);
  },

  applySelectedTheme() {
    const selector = document.getElementById('theme-selector');
    if (selector) {
      this.applyTheme(selector.value);
    }
  },

  previewCustomTheme() {
    const bgColor = document.getElementById('bg-color')?.value || '#242e29';
    const primaryColor = document.getElementById('primary-color')?.value || '#97e6b0';
    const accentColor = document.getElementById('accent-color')?.value || '#29dc91';
    const textColor = document.getElementById('text-color')?.value || '#f4fff8';

    const customTheme = `
      --hermes-bg: ${bgColor};
      --hermes-bg2: ${this.adjustBrightness(bgColor, 20)};
      --hermes-primary: ${primaryColor};
      --hermes-accent: ${accentColor};
      --hermes-card: ${this.adjustBrightness(bgColor, 20)};
      --hermes-text: ${textColor};
      --hermes-border: ${accentColor};
      --hermes-lock: ${this.adjustBrightness(primaryColor, 10)};
      --hermes-error-text: #ff5c5c;
      --hermes-success-text: #4caf50;
      --hermes-info-text: #2196f3;
      --hermes-warning-text: #ff9800;
      --hermes-disabled-text: #888;
      --hermes-disabled-bg: #555;
      --hermes-button-bg: ${accentColor};
      --hermes-button-text: ${this.getContrastColor(accentColor)};
      --hermes-button-hover-bg: ${primaryColor};
      --hermes-panel-bg: ${this.adjustBrightness(bgColor, 20)};
      --hermes-panel-text: ${textColor};
      --hermes-panel-border: ${accentColor};
      --hermes-input-bg: ${bgColor};
      --hermes-input-text: ${textColor};
      --hermes-input-border: ${accentColor};
      --hermes-highlight-bg: ${primaryColor};
      --hermes-highlight-text: ${this.getContrastColor(primaryColor)};
    `;

    // Apply preview
    const root = document.documentElement;
    const themeProperties = customTheme.split(';').filter(prop => prop.trim());
    
    themeProperties.forEach(property => {
      const [key, value] = property.split(':').map(s => s.trim());
      if (key && value) {
        root.style.setProperty(key, value);
      }
    });

    this.showNotification('👁️ Custom theme preview applied', 'info');
  },

  saveCustomTheme() {
    const themeName = prompt('Enter a name for your custom theme:');
    if (!themeName || themeName.trim() === '') return;

    const cleanThemeName = themeName.trim().toLowerCase().replace(/\s+/g, '-');
    
    const bgColor = document.getElementById('bg-color')?.value || '#242e29';
    const primaryColor = document.getElementById('primary-color')?.value || '#97e6b0';
    const accentColor = document.getElementById('accent-color')?.value || '#29dc91';
    const textColor = document.getElementById('text-color')?.value || '#f4fff8';

    const customTheme = `
      --hermes-bg: ${bgColor};
      --hermes-bg2: ${this.adjustBrightness(bgColor, 20)};
      --hermes-primary: ${primaryColor};
      --hermes-accent: ${accentColor};
      --hermes-card: ${this.adjustBrightness(bgColor, 20)};
      --hermes-text: ${textColor};
      --hermes-border: ${accentColor};
      --hermes-lock: ${this.adjustBrightness(primaryColor, 10)};
      --hermes-error-text: #ff5c5c;
      --hermes-success-text: #4caf50;
      --hermes-info-text: #2196f3;
      --hermes-warning-text: #ff9800;
      --hermes-disabled-text: #888;
      --hermes-disabled-bg: #555;
      --hermes-button-bg: ${accentColor};
      --hermes-button-text: ${this.getContrastColor(accentColor)};
      --hermes-button-hover-bg: ${primaryColor};
      --hermes-panel-bg: ${this.adjustBrightness(bgColor, 20)};
      --hermes-panel-text: ${textColor};
      --hermes-panel-border: ${accentColor};
      --hermes-input-bg: ${bgColor};
      --hermes-input-text: ${textColor};
      --hermes-input-border: ${accentColor};
      --hermes-highlight-bg: ${primaryColor};
      --hermes-highlight-text: ${this.getContrastColor(primaryColor)};
    `;

    this.customThemes[cleanThemeName] = customTheme;
    localStorage.setItem('nextnote_custom_themes', JSON.stringify(this.customThemes));

    this.applyTheme(cleanThemeName);
    this.updateThemeUI();

    this.showNotification(`💾 Custom theme "${cleanThemeName}" saved successfully`, 'success');
  },

  resetToDefault() {
    this.applyTheme('mint');
    
    // Reset color inputs
    document.getElementById('bg-color').value = '#242e29';
    document.getElementById('primary-color').value = '#97e6b0';
    document.getElementById('accent-color').value = '#29dc91';
    document.getElementById('text-color').value = '#f4fff8';
  },

  exportCurrentTheme() {
    const themes = { ...this.getHermesThemes(), ...this.customThemes };
    const currentThemeData = {
      name: this.currentTheme,
      theme: themes[this.currentTheme],
      exported: new Date().toISOString()
    };

    const dataStr = JSON.stringify(currentThemeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `nextnote-theme-${this.currentTheme}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    this.showNotification(`📤 Theme "${this.currentTheme}" exported successfully`, 'success');
  },

  addToThemeHistory(themeName) {
    const entry = {
      theme: themeName,
      timestamp: new Date().toISOString()
    };

    // Remove existing entry for this theme
    this.themeHistory = this.themeHistory.filter(h => h.theme !== themeName);
    
    // Add new entry
    this.themeHistory.push(entry);
    
    // Keep only last 50 entries
    if (this.themeHistory.length > 50) {
      this.themeHistory = this.themeHistory.slice(-50);
    }

    localStorage.setItem('nextnote_theme_history', JSON.stringify(this.themeHistory));
  },

  updateThemeUI() {
    // Update theme selector
    const selector = document.getElementById('theme-selector');
    if (selector) {
      selector.value = this.currentTheme;
    }

    // Update theme grid
    const themePreviews = document.querySelectorAll('.theme-preview');
    themePreviews.forEach(preview => {
      const themeName = preview.dataset.theme;
      preview.style.border = themeName === this.currentTheme ? '3px solid #fff' : '3px solid transparent';
    });
  },

  refreshThemeHistory() {
    const historyContainer = document.getElementById('theme-history-list');
    if (historyContainer) {
      historyContainer.innerHTML = this.generateThemeHistory();
    }
  },

  // Utility functions
  adjustBrightness(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  },

  getContrastColor(hexColor) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
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

  bindThemeEvents(app) {
    // Listen for theme change events
    app.on('themeChanged', (themeName) => {
      this.applyTheme(themeName);
    });

    // Auto-apply theme on page load
    document.addEventListener('DOMContentLoaded', () => {
      this.applyTheme(this.currentTheme);
    });
  }
});
