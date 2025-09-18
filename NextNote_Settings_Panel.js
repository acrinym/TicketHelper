/**
 * NextNote Advanced Settings Panel
 * Provides comprehensive user preferences, theme customization, and plugin management
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.NextNoteSettingsPanel = (function() {
  const security = window.NextNoteSecurity;
  
  /**
   * Default settings configuration
   */
  const DEFAULT_SETTINGS = {
    // Appearance settings
    theme: 'light',
    uiSkin: 'rounded', // rounded, square
    spacing: 'cozy', // compact, cozy, spacious
    fontSize: 'medium', // small, medium, large
    fontFamily: 'system', // system, serif, mono, dyslexic
    
    // Accessibility settings
    highContrast: false,
    dyslexiaMode: false,
    reducedMotion: false,
    screenReaderMode: false,
    
    // Editor settings
    autosave: true,
    autosaveInterval: 30000,
    spellCheck: true,
    wordWrap: true,
    lineNumbers: false,
    
    // Behavior settings
    confirmDelete: true,
    showTooltips: true,
    enableSounds: false,
    autoBackup: true,
    
    // Privacy settings
    analytics: false,
    crashReporting: false,
    
    // Plugin settings
    enabledPlugins: [],
    pluginSettings: {}
  };

  /**
   * Current settings (loaded from localStorage)
   */
  let currentSettings = { ...DEFAULT_SETTINGS };

  /**
   * Loads settings from localStorage
   */
  function loadSettings() {
    try {
      const saved = localStorage.getItem('nextnote_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      currentSettings = { ...DEFAULT_SETTINGS };
    }
    
    applySettings();
  }

  /**
   * Saves settings to localStorage
   */
  function saveSettings() {
    try {
      localStorage.setItem('nextnote_settings', JSON.stringify(currentSettings));
      applySettings();
      
      // Dispatch settings changed event
      document.dispatchEvent(new CustomEvent('nextnote:settingsChanged', {
        detail: { settings: { ...currentSettings } }
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  /**
   * Applies current settings to the application
   */
  function applySettings() {
    const root = document.documentElement;
    
    // Apply theme
    applyTheme(currentSettings.theme);
    
    // Apply UI skin
    applyUISkin(currentSettings.uiSkin);
    
    // Apply spacing
    applySpacing(currentSettings.spacing);
    
    // Apply font settings
    applyFontSettings();
    
    // Apply accessibility settings
    applyAccessibilitySettings();
    
    // Apply editor settings
    applyEditorSettings();
  }

  /**
   * Applies theme settings
   * @param {string} themeName - Theme name
   */
  function applyTheme(themeName) {
    const themes = {
      light: {
        '--hermes-bg': '#ffffff',
        '--hermes-text': '#333333',
        '--hermes-border': '#cccccc',
        '--hermes-panel-bg': '#f4f4f4',
        '--hermes-button-bg': '#e9e9e9'
      },
      dark: {
        '--hermes-bg': '#2c2c2c',
        '--hermes-text': '#e0e0e0',
        '--hermes-border': '#555555',
        '--hermes-panel-bg': '#333333',
        '--hermes-button-bg': '#484848'
      },
      'high-contrast': {
        '--hermes-bg': currentSettings.highContrast ? '#000000' : '#ffffff',
        '--hermes-text': currentSettings.highContrast ? '#ffffff' : '#000000',
        '--hermes-border': currentSettings.highContrast ? '#ffffff' : '#000000',
        '--hermes-panel-bg': currentSettings.highContrast ? '#000000' : '#f0f0f0',
        '--hermes-button-bg': currentSettings.highContrast ? '#333333' : '#e0e0e0'
      }
    };

    const themeVars = themes[themeName] || themes.light;
    Object.entries(themeVars).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  }

  /**
   * Applies UI skin settings
   * @param {string} skin - UI skin (rounded, square)
   */
  function applyUISkin(skin) {
    const root = document.documentElement;
    
    if (skin === 'square') {
      root.style.setProperty('--border-radius', '0px');
      root.style.setProperty('--button-radius', '0px');
    } else {
      root.style.setProperty('--border-radius', '8px');
      root.style.setProperty('--button-radius', '6px');
    }
  }

  /**
   * Applies spacing settings
   * @param {string} spacing - Spacing mode (compact, cozy, spacious)
   */
  function applySpacing(spacing) {
    const spacingValues = {
      compact: { base: '4px', large: '8px' },
      cozy: { base: '8px', large: '16px' },
      spacious: { base: '12px', large: '24px' }
    };

    const values = spacingValues[spacing] || spacingValues.cozy;
    document.documentElement.style.setProperty('--spacing-base', values.base);
    document.documentElement.style.setProperty('--spacing-large', values.large);
  }

  /**
   * Applies font settings
   */
  function applyFontSettings() {
    const fontFamilies = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'Georgia, "Times New Roman", serif',
      mono: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
      dyslexic: '"OpenDyslexic", sans-serif'
    };

    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };

    document.documentElement.style.setProperty(
      '--font-family', 
      fontFamilies[currentSettings.fontFamily] || fontFamilies.system
    );
    
    document.documentElement.style.setProperty(
      '--font-size-base', 
      fontSizes[currentSettings.fontSize] || fontSizes.medium
    );
  }

  /**
   * Applies accessibility settings
   */
  function applyAccessibilitySettings() {
    const body = document.body;
    
    // High contrast mode
    body.classList.toggle('high-contrast', currentSettings.highContrast);
    
    // Dyslexia mode
    body.classList.toggle('dyslexia-mode', currentSettings.dyslexiaMode);
    
    // Reduced motion
    if (currentSettings.reducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    } else {
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
    }
    
    // Screen reader mode
    body.classList.toggle('screen-reader-mode', currentSettings.screenReaderMode);
  }

  /**
   * Applies editor settings
   */
  function applyEditorSettings() {
    // Apply to Quill editor if available
    if (window.quill) {
      // Enable/disable spell check
      const editor = window.quill.root;
      editor.spellcheck = currentSettings.spellCheck;
    }
  }

  /**
   * Creates the settings panel dialog
   * @returns {HTMLElement} - Settings panel element
   */
  function createSettingsPanel() {
    const overlay = document.createElement('div');
    overlay.className = 'settings-panel-overlay';
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

    const panel = document.createElement('div');
    panel.className = 'settings-panel';
    panel.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-panel-border);
      border-radius: var(--border-radius, 12px);
      padding: 30px;
      width: 700px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    // Header
    const header = createPanelHeader(overlay);
    panel.appendChild(header);

    // Settings tabs
    const tabContainer = document.createElement('div');
    tabContainer.className = 'settings-tabs';
    tabContainer.style.cssText = `
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--hermes-border);
    `;

    const contentContainer = document.createElement('div');
    contentContainer.className = 'settings-content';

    // Create tabs
    const tabs = [
      { id: 'appearance', label: 'Appearance', icon: '🎨' },
      { id: 'accessibility', label: 'Accessibility', icon: '♿' },
      { id: 'editor', label: 'Editor', icon: '✏️' },
      { id: 'behavior', label: 'Behavior', icon: '⚙️' },
      { id: 'plugins', label: 'Plugins', icon: '🔌' },
      { id: 'privacy', label: 'Privacy', icon: '🔒' }
    ];

    tabs.forEach((tab, index) => {
      const tabButton = createTabButton(tab, index === 0);
      tabButton.addEventListener('click', () => {
        // Update tab styles
        tabContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        tabButton.classList.add('active');
        
        // Show tab content
        showTabContent(contentContainer, tab.id);
      });
      tabContainer.appendChild(tabButton);
    });

    panel.appendChild(tabContainer);
    panel.appendChild(contentContainer);

    // Show first tab by default
    showTabContent(contentContainer, 'appearance');

    // Footer with action buttons
    const footer = createPanelFooter(overlay);
    panel.appendChild(footer);

    overlay.appendChild(panel);
    return overlay;
  }

  /**
   * Creates the panel header
   * @param {HTMLElement} overlay - Overlay element for closing
   * @returns {HTMLElement} - Header element
   */
  function createPanelHeader(overlay) {
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--hermes-border);
      padding-bottom: 15px;
    `;

    const title = document.createElement('h2');
    title.style.cssText = `
      margin: 0;
      color: var(--hermes-text);
      font-size: 1.5em;
    `;
    security.safeSetTextContent(title, '⚙️ Settings');

    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 1.5em;
      cursor: pointer;
      color: var(--hermes-text);
      padding: 5px;
    `;
    security.safeSetTextContent(closeButton, '×');
    closeButton.addEventListener('click', () => overlay.remove());

    header.appendChild(title);
    header.appendChild(closeButton);
    return header;
  }

  /**
   * Creates a tab button
   * @param {Object} tab - Tab configuration
   * @param {boolean} active - Whether tab is active
   * @returns {HTMLElement} - Tab button element
   */
  function createTabButton(tab, active = false) {
    const button = document.createElement('button');
    button.className = active ? 'settings-tab active' : 'settings-tab';
    button.style.cssText = `
      padding: 10px 15px;
      border: none;
      background: ${active ? 'var(--hermes-highlight-bg)' : 'transparent'};
      color: ${active ? 'var(--hermes-highlight-text)' : 'var(--hermes-text)'};
      cursor: pointer;
      border-bottom: 2px solid ${active ? 'var(--hermes-highlight-bg)' : 'transparent'};
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 5px;
    `;

    security.safeSetTextContent(button, `${tab.icon} ${tab.label}`);
    return button;
  }

  /**
   * Shows content for a specific tab
   * @param {HTMLElement} container - Content container
   * @param {string} tabId - Tab identifier
   */
  function showTabContent(container, tabId) {
    container.innerHTML = '';

    switch (tabId) {
      case 'appearance':
        container.appendChild(createAppearanceSettings());
        break;
      case 'accessibility':
        container.appendChild(createAccessibilitySettings());
        break;
      case 'editor':
        container.appendChild(createEditorSettings());
        break;
      case 'behavior':
        container.appendChild(createBehaviorSettings());
        break;
      case 'plugins':
        container.appendChild(createPluginSettings());
        break;
      case 'privacy':
        container.appendChild(createPrivacySettings());
        break;
    }
  }

  /**
   * Creates appearance settings section
   * @returns {HTMLElement} - Appearance settings element
   */
  function createAppearanceSettings() {
    const section = document.createElement('div');
    section.className = 'settings-section';

    const settings = [
      {
        type: 'select',
        key: 'theme',
        label: 'Theme',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'high-contrast', label: 'High Contrast' }
        ]
      },
      {
        type: 'select',
        key: 'uiSkin',
        label: 'UI Style',
        options: [
          { value: 'rounded', label: 'Rounded Corners' },
          { value: 'square', label: 'Square Corners' }
        ]
      },
      {
        type: 'select',
        key: 'spacing',
        label: 'Spacing',
        options: [
          { value: 'compact', label: 'Compact' },
          { value: 'cozy', label: 'Cozy' },
          { value: 'spacious', label: 'Spacious' }
        ]
      },
      {
        type: 'select',
        key: 'fontSize',
        label: 'Font Size',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ]
      },
      {
        type: 'select',
        key: 'fontFamily',
        label: 'Font Family',
        options: [
          { value: 'system', label: 'System Default' },
          { value: 'serif', label: 'Serif' },
          { value: 'mono', label: 'Monospace' },
          { value: 'dyslexic', label: 'Dyslexia-Friendly' }
        ]
      }
    ];

    settings.forEach(setting => {
      section.appendChild(createSettingControl(setting));
    });

    return section;
  }

  /**
   * Creates accessibility settings section
   * @returns {HTMLElement} - Accessibility settings element
   */
  function createAccessibilitySettings() {
    const section = document.createElement('div');
    section.className = 'settings-section';

    const settings = [
      {
        type: 'checkbox',
        key: 'highContrast',
        label: 'High Contrast Mode',
        description: 'Increases contrast for better visibility'
      },
      {
        type: 'checkbox',
        key: 'dyslexiaMode',
        label: 'Dyslexia-Friendly Mode',
        description: 'Uses OpenDyslexic font and improved spacing'
      },
      {
        type: 'checkbox',
        key: 'reducedMotion',
        label: 'Reduce Motion',
        description: 'Minimizes animations and transitions'
      },
      {
        type: 'checkbox',
        key: 'screenReaderMode',
        label: 'Screen Reader Optimization',
        description: 'Optimizes interface for screen readers'
      }
    ];

    settings.forEach(setting => {
      section.appendChild(createSettingControl(setting));
    });

    return section;
  }

  // Additional methods would continue here...
  // Due to length constraints, I'll create the remaining methods in the next file

  /**
   * Creates a setting control element
   * @param {Object} setting - Setting configuration
   * @returns {HTMLElement} - Setting control element
   */
  function createSettingControl(setting) {
    const control = document.createElement('div');
    control.className = 'setting-control';
    control.style.cssText = `
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid var(--hermes-border);
      border-radius: var(--border-radius, 8px);
    `;

    const label = document.createElement('label');
    label.style.cssText = `
      display: block;
      font-weight: bold;
      margin-bottom: 5px;
      color: var(--hermes-text);
    `;
    security.safeSetTextContent(label, setting.label);

    if (setting.description) {
      const description = document.createElement('p');
      description.style.cssText = `
        margin: 5px 0 10px 0;
        color: var(--hermes-disabled-text);
        font-size: 0.9em;
      `;
      security.safeSetTextContent(description, setting.description);
      control.appendChild(description);
    }

    let input;
    if (setting.type === 'checkbox') {
      input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = currentSettings[setting.key];
      input.addEventListener('change', () => {
        currentSettings[setting.key] = input.checked;
      });
    } else if (setting.type === 'select') {
      input = document.createElement('select');
      input.style.cssText = `
        width: 100%;
        padding: 8px;
        border: 1px solid var(--hermes-border);
        border-radius: var(--border-radius, 4px);
        background: var(--hermes-input-bg);
        color: var(--hermes-text);
      `;
      
      setting.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        security.safeSetTextContent(optionElement, option.label);
        if (currentSettings[setting.key] === option.value) {
          optionElement.selected = true;
        }
        input.appendChild(optionElement);
      });
      
      input.addEventListener('change', () => {
        currentSettings[setting.key] = input.value;
      });
    }

    control.appendChild(label);
    if (input) {
      control.appendChild(input);
    }

    return control;
  }

  /**
   * Creates the panel footer with action buttons
   * @param {HTMLElement} overlay - Overlay element for closing
   * @returns {HTMLElement} - Footer element
   */
  function createPanelFooter(overlay) {
    const footer = document.createElement('div');
    footer.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid var(--hermes-border);
    `;

    const resetButton = document.createElement('button');
    resetButton.style.cssText = `
      padding: 10px 20px;
      border: 1px solid var(--hermes-border);
      background: var(--hermes-button-bg);
      color: var(--hermes-text);
      border-radius: var(--border-radius, 6px);
      cursor: pointer;
    `;
    security.safeSetTextContent(resetButton, 'Reset to Defaults');
    resetButton.addEventListener('click', () => {
      if (confirm('Reset all settings to defaults? This cannot be undone.')) {
        currentSettings = { ...DEFAULT_SETTINGS };
        overlay.remove();
        saveSettings();
      }
    });

    const buttonGroup = document.createElement('div');
    buttonGroup.style.cssText = 'display: flex; gap: 10px;';

    const cancelButton = document.createElement('button');
    cancelButton.style.cssText = `
      padding: 10px 20px;
      border: 1px solid var(--hermes-border);
      background: var(--hermes-button-bg);
      color: var(--hermes-text);
      border-radius: var(--border-radius, 6px);
      cursor: pointer;
    `;
    security.safeSetTextContent(cancelButton, 'Cancel');
    cancelButton.addEventListener('click', () => {
      loadSettings(); // Reload original settings
      overlay.remove();
    });

    const saveButton = document.createElement('button');
    saveButton.style.cssText = `
      padding: 10px 20px;
      border: none;
      background: var(--hermes-highlight-bg);
      color: var(--hermes-highlight-text);
      border-radius: var(--border-radius, 6px);
      cursor: pointer;
    `;
    security.safeSetTextContent(saveButton, 'Save Settings');
    saveButton.addEventListener('click', () => {
      if (saveSettings()) {
        overlay.remove();
      }
    });

    buttonGroup.appendChild(cancelButton);
    buttonGroup.appendChild(saveButton);

    footer.appendChild(resetButton);
    footer.appendChild(buttonGroup);

    return footer;
  }

  // Initialize settings on load
  loadSettings();

  // Public API
  return {
    show: () => {
      const panel = createSettingsPanel();
      document.body.appendChild(panel);
      return panel;
    },
    
    loadSettings,
    saveSettings,
    applySettings,
    
    // Settings access
    get: (key) => currentSettings[key],
    set: (key, value) => {
      currentSettings[key] = value;
      return saveSettings();
    },
    
    getAll: () => ({ ...currentSettings }),
    reset: () => {
      currentSettings = { ...DEFAULT_SETTINGS };
      return saveSettings();
    }
  };
})();
