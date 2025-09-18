/**
 * NextNote Advanced Theme Manager
 * Provides comprehensive theming system with Material Design and custom themes
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.NextNoteThemeManager = (function() {
  const security = window.NextNoteSecurity;
  
  /**
   * Comprehensive theme library with Material Design and custom variations
   */
  const THEME_LIBRARY = {
    // Light Themes
    'light-default': {
      name: 'Light Default',
      category: 'Light',
      description: 'Clean, minimal light theme',
      colors: {
        '--hermes-bg': '#ffffff',
        '--hermes-text': '#212121',
        '--hermes-border': '#e0e0e0',
        '--hermes-panel-bg': '#fafafa',
        '--hermes-panel-border': '#e0e0e0',
        '--hermes-button-bg': '#f5f5f5',
        '--hermes-button-hover': '#eeeeee',
        '--hermes-highlight-bg': '#2196f3',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#4caf50',
        '--hermes-warning-text': '#ff9800',
        '--hermes-error-text': '#f44336',
        '--hermes-info-text': '#2196f3',
        '--hermes-disabled-text': '#9e9e9e',
        '--hermes-input-bg': '#ffffff',
        '--hermes-sidebar-bg': '#f8f9fa',
        '--hermes-editor-bg': '#ffffff'
      }
    },

    'light-material': {
      name: 'Material Light',
      category: 'Light',
      description: 'Google Material Design light theme',
      colors: {
        '--hermes-bg': '#fafafa',
        '--hermes-text': '#212121',
        '--hermes-border': '#e1e1e1',
        '--hermes-panel-bg': '#ffffff',
        '--hermes-panel-border': '#e1e1e1',
        '--hermes-button-bg': '#ffffff',
        '--hermes-button-hover': '#f5f5f5',
        '--hermes-highlight-bg': '#1976d2',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#388e3c',
        '--hermes-warning-text': '#f57c00',
        '--hermes-error-text': '#d32f2f',
        '--hermes-info-text': '#1976d2',
        '--hermes-disabled-text': '#757575',
        '--hermes-input-bg': '#ffffff',
        '--hermes-sidebar-bg': '#f5f5f5',
        '--hermes-editor-bg': '#ffffff'
      }
    },

    'light-warm': {
      name: 'Warm Light',
      category: 'Light',
      description: 'Warm, cozy light theme with cream tones',
      colors: {
        '--hermes-bg': '#fefcf8',
        '--hermes-text': '#3e2723',
        '--hermes-border': '#d7ccc8',
        '--hermes-panel-bg': '#fff8e1',
        '--hermes-panel-border': '#d7ccc8',
        '--hermes-button-bg': '#f3e5ab',
        '--hermes-button-hover': '#ede7b1',
        '--hermes-highlight-bg': '#ff8f00',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#689f38',
        '--hermes-warning-text': '#ef6c00',
        '--hermes-error-text': '#d84315',
        '--hermes-info-text': '#ff8f00',
        '--hermes-disabled-text': '#8d6e63',
        '--hermes-input-bg': '#ffffff',
        '--hermes-sidebar-bg': '#fff3e0',
        '--hermes-editor-bg': '#fefcf8'
      }
    },

    // Dark Themes
    'dark-default': {
      name: 'Dark Default',
      category: 'Dark',
      description: 'Sleek dark theme for low-light environments',
      colors: {
        '--hermes-bg': '#1e1e1e',
        '--hermes-text': '#e0e0e0',
        '--hermes-border': '#404040',
        '--hermes-panel-bg': '#2d2d2d',
        '--hermes-panel-border': '#404040',
        '--hermes-button-bg': '#383838',
        '--hermes-button-hover': '#484848',
        '--hermes-highlight-bg': '#0d7377',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#66bb6a',
        '--hermes-warning-text': '#ffb74d',
        '--hermes-error-text': '#ef5350',
        '--hermes-info-text': '#42a5f5',
        '--hermes-disabled-text': '#757575',
        '--hermes-input-bg': '#2d2d2d',
        '--hermes-sidebar-bg': '#252525',
        '--hermes-editor-bg': '#1e1e1e'
      }
    },

    'dark-material': {
      name: 'Material Dark',
      category: 'Dark',
      description: 'Google Material Design dark theme',
      colors: {
        '--hermes-bg': '#121212',
        '--hermes-text': '#ffffff',
        '--hermes-border': '#333333',
        '--hermes-panel-bg': '#1e1e1e',
        '--hermes-panel-border': '#333333',
        '--hermes-button-bg': '#2c2c2c',
        '--hermes-button-hover': '#383838',
        '--hermes-highlight-bg': '#bb86fc',
        '--hermes-highlight-text': '#000000',
        '--hermes-success-text': '#4caf50',
        '--hermes-warning-text': '#ff9800',
        '--hermes-error-text': '#cf6679',
        '--hermes-info-text': '#03dac6',
        '--hermes-disabled-text': '#666666',
        '--hermes-input-bg': '#1e1e1e',
        '--hermes-sidebar-bg': '#1a1a1a',
        '--hermes-editor-bg': '#121212'
      }
    },

    'dark-blue': {
      name: 'Midnight Blue',
      category: 'Dark',
      description: 'Deep blue dark theme inspired by night sky',
      colors: {
        '--hermes-bg': '#0d1421',
        '--hermes-text': '#e3f2fd',
        '--hermes-border': '#1e3a8a',
        '--hermes-panel-bg': '#1e293b',
        '--hermes-panel-border': '#1e3a8a',
        '--hermes-button-bg': '#334155',
        '--hermes-button-hover': '#475569',
        '--hermes-highlight-bg': '#3b82f6',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#10b981',
        '--hermes-warning-text': '#f59e0b',
        '--hermes-error-text': '#ef4444',
        '--hermes-info-text': '#06b6d4',
        '--hermes-disabled-text': '#64748b',
        '--hermes-input-bg': '#1e293b',
        '--hermes-sidebar-bg': '#0f172a',
        '--hermes-editor-bg': '#0d1421'
      }
    },

    // High Contrast Themes
    'high-contrast-light': {
      name: 'High Contrast Light',
      category: 'Accessibility',
      description: 'Maximum contrast light theme for accessibility',
      colors: {
        '--hermes-bg': '#ffffff',
        '--hermes-text': '#000000',
        '--hermes-border': '#000000',
        '--hermes-panel-bg': '#ffffff',
        '--hermes-panel-border': '#000000',
        '--hermes-button-bg': '#f0f0f0',
        '--hermes-button-hover': '#e0e0e0',
        '--hermes-highlight-bg': '#0000ff',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#008000',
        '--hermes-warning-text': '#ff8000',
        '--hermes-error-text': '#ff0000',
        '--hermes-info-text': '#0000ff',
        '--hermes-disabled-text': '#808080',
        '--hermes-input-bg': '#ffffff',
        '--hermes-sidebar-bg': '#f8f8f8',
        '--hermes-editor-bg': '#ffffff'
      }
    },

    'high-contrast-dark': {
      name: 'High Contrast Dark',
      category: 'Accessibility',
      description: 'Maximum contrast dark theme for accessibility',
      colors: {
        '--hermes-bg': '#000000',
        '--hermes-text': '#ffffff',
        '--hermes-border': '#ffffff',
        '--hermes-panel-bg': '#000000',
        '--hermes-panel-border': '#ffffff',
        '--hermes-button-bg': '#333333',
        '--hermes-button-hover': '#555555',
        '--hermes-highlight-bg': '#ffff00',
        '--hermes-highlight-text': '#000000',
        '--hermes-success-text': '#00ff00',
        '--hermes-warning-text': '#ffff00',
        '--hermes-error-text': '#ff0000',
        '--hermes-info-text': '#00ffff',
        '--hermes-disabled-text': '#808080',
        '--hermes-input-bg': '#000000',
        '--hermes-sidebar-bg': '#111111',
        '--hermes-editor-bg': '#000000'
      }
    },

    // Colorful Themes
    'nature-green': {
      name: 'Nature Green',
      category: 'Colorful',
      description: 'Calming green theme inspired by nature',
      colors: {
        '--hermes-bg': '#f1f8e9',
        '--hermes-text': '#1b5e20',
        '--hermes-border': '#a5d6a7',
        '--hermes-panel-bg': '#e8f5e8',
        '--hermes-panel-border': '#a5d6a7',
        '--hermes-button-bg': '#c8e6c9',
        '--hermes-button-hover': '#a5d6a7',
        '--hermes-highlight-bg': '#4caf50',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#2e7d32',
        '--hermes-warning-text': '#ef6c00',
        '--hermes-error-text': '#c62828',
        '--hermes-info-text': '#1976d2',
        '--hermes-disabled-text': '#757575',
        '--hermes-input-bg': '#ffffff',
        '--hermes-sidebar-bg': '#e0f2e0',
        '--hermes-editor-bg': '#f1f8e9'
      }
    },

    'ocean-blue': {
      name: 'Ocean Blue',
      category: 'Colorful',
      description: 'Refreshing blue theme inspired by the ocean',
      colors: {
        '--hermes-bg': '#e3f2fd',
        '--hermes-text': '#0d47a1',
        '--hermes-border': '#90caf9',
        '--hermes-panel-bg': '#e1f5fe',
        '--hermes-panel-border': '#90caf9',
        '--hermes-button-bg': '#bbdefb',
        '--hermes-button-hover': '#90caf9',
        '--hermes-highlight-bg': '#2196f3',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#388e3c',
        '--hermes-warning-text': '#f57c00',
        '--hermes-error-text': '#d32f2f',
        '--hermes-info-text': '#1976d2',
        '--hermes-disabled-text': '#757575',
        '--hermes-input-bg': '#ffffff',
        '--hermes-sidebar-bg': '#e0f7fa',
        '--hermes-editor-bg': '#e3f2fd'
      }
    },

    'sunset-orange': {
      name: 'Sunset Orange',
      category: 'Colorful',
      description: 'Warm orange theme inspired by sunset',
      colors: {
        '--hermes-bg': '#fff3e0',
        '--hermes-text': '#e65100',
        '--hermes-border': '#ffcc80',
        '--hermes-panel-bg': '#ffeaa7',
        '--hermes-panel-border': '#ffcc80',
        '--hermes-button-bg': '#ffe0b2',
        '--hermes-button-hover': '#ffcc80',
        '--hermes-highlight-bg': '#ff9800',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#388e3c',
        '--hermes-warning-text': '#f57c00',
        '--hermes-error-text': '#d32f2f',
        '--hermes-info-text': '#1976d2',
        '--hermes-disabled-text': '#757575',
        '--hermes-input-bg': '#ffffff',
        '--hermes-sidebar-bg': '#fff8e1',
        '--hermes-editor-bg': '#fff3e0'
      }
    }
  };

  /**
   * Current active theme
   */
  let currentTheme = 'light-default';

  /**
   * Applies a theme to the application
   * @param {string} themeId - Theme identifier
   * @returns {boolean} - Success status
   */
  function applyTheme(themeId) {
    const theme = THEME_LIBRARY[themeId];
    if (!theme) {
      console.error(`Theme ${themeId} not found`);
      return false;
    }

    try {
      const root = document.documentElement;
      
      // Apply all theme colors
      Object.entries(theme.colors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });

      // Store current theme
      currentTheme = themeId;
      localStorage.setItem('nextnote_current_theme', themeId);

      // Apply theme-specific classes
      applyThemeClasses(theme);

      // Dispatch theme change event
      document.dispatchEvent(new CustomEvent('nextnote:themeChanged', {
        detail: { themeId, theme }
      }));

      security.logSecurityEvent('theme_applied', {
        themeId: themeId,
        themeName: theme.name
      });

      return true;

    } catch (error) {
      console.error('Error applying theme:', error);
      return false;
    }
  }

  /**
   * Applies theme-specific CSS classes
   * @param {Object} theme - Theme object
   */
  function applyThemeClasses(theme) {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast', 'theme-colorful');
    
    // Add new theme class based on category
    switch (theme.category) {
      case 'Light':
        body.classList.add('theme-light');
        break;
      case 'Dark':
        body.classList.add('theme-dark');
        break;
      case 'Accessibility':
        body.classList.add('theme-high-contrast');
        break;
      case 'Colorful':
        body.classList.add('theme-colorful');
        break;
    }
  }

  /**
   * Creates a theme selector dialog
   * @returns {HTMLElement} - Theme selector dialog
   */
  function createThemeSelector() {
    const overlay = document.createElement('div');
    overlay.className = 'theme-selector-overlay';
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
    dialog.className = 'theme-selector-dialog';
    dialog.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-panel-border);
      border-radius: 12px;
      padding: 30px;
      width: 900px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    // Header
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
    security.safeSetTextContent(title, '🎨 Choose Theme');

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
    dialog.appendChild(header);

    // Theme categories
    const categories = {};
    Object.entries(THEME_LIBRARY).forEach(([id, theme]) => {
      if (!categories[theme.category]) {
        categories[theme.category] = [];
      }
      categories[theme.category].push({ id, ...theme });
    });

    // Create theme grid for each category
    Object.entries(categories).forEach(([category, themes]) => {
      const categorySection = document.createElement('div');
      categorySection.style.cssText = 'margin-bottom: 30px;';

      const categoryTitle = document.createElement('h3');
      categoryTitle.style.cssText = `
        color: var(--hermes-text);
        margin-bottom: 15px;
        border-bottom: 1px solid var(--hermes-border);
        padding-bottom: 5px;
      `;
      security.safeSetTextContent(categoryTitle, category);
      categorySection.appendChild(categoryTitle);

      const themeGrid = document.createElement('div');
      themeGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
      `;

      themes.forEach(theme => {
        const themeCard = createThemeCard(theme, overlay);
        themeGrid.appendChild(themeCard);
      });

      categorySection.appendChild(themeGrid);
      dialog.appendChild(categorySection);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    overlay.appendChild(dialog);
    return overlay;
  }

  /**
   * Creates a theme card
   * @param {Object} theme - Theme object
   * @param {HTMLElement} overlay - Overlay to close
   * @returns {HTMLElement} - Theme card element
   */
  function createThemeCard(theme, overlay) {
    const card = document.createElement('div');
    card.className = 'theme-card';
    card.style.cssText = `
      border: 2px solid ${theme.id === currentTheme ? 'var(--hermes-highlight-bg)' : 'var(--hermes-border)'};
      border-radius: 8px;
      padding: 15px;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--hermes-bg);
      position: relative;
    `;

    // Theme preview
    const preview = document.createElement('div');
    preview.style.cssText = `
      height: 60px;
      border-radius: 4px;
      margin-bottom: 10px;
      display: flex;
      overflow: hidden;
    `;

    // Create color swatches
    const primaryColors = [
      theme.colors['--hermes-bg'],
      theme.colors['--hermes-panel-bg'],
      theme.colors['--hermes-highlight-bg'],
      theme.colors['--hermes-text']
    ];

    primaryColors.forEach(color => {
      const swatch = document.createElement('div');
      swatch.style.cssText = `
        flex: 1;
        background: ${color};
      `;
      preview.appendChild(swatch);
    });

    // Theme name
    const name = document.createElement('h4');
    name.style.cssText = `
      margin: 0 0 5px 0;
      color: var(--hermes-text);
      font-size: 1.1em;
    `;
    security.safeSetTextContent(name, theme.name);

    // Theme description
    const description = document.createElement('p');
    description.style.cssText = `
      margin: 0;
      color: var(--hermes-disabled-text);
      font-size: 0.9em;
      line-height: 1.3;
    `;
    security.safeSetTextContent(description, theme.description);

    // Current theme indicator
    if (theme.id === currentTheme) {
      const indicator = document.createElement('div');
      indicator.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: var(--hermes-highlight-bg);
        color: var(--hermes-highlight-text);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: bold;
      `;
      security.safeSetTextContent(indicator, 'ACTIVE');
      card.appendChild(indicator);
    }

    // Hover effects
    card.addEventListener('mouseenter', () => {
      if (theme.id !== currentTheme) {
        card.style.borderColor = 'var(--hermes-highlight-bg)';
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }
    });

    card.addEventListener('mouseleave', () => {
      if (theme.id !== currentTheme) {
        card.style.borderColor = 'var(--hermes-border)';
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
      }
    });

    // Click handler
    card.addEventListener('click', () => {
      applyTheme(theme.id);
      overlay.remove();
    });

    card.appendChild(preview);
    card.appendChild(name);
    card.appendChild(description);

    return card;
  }

  /**
   * Loads the saved theme on initialization
   */
  function loadSavedTheme() {
    const savedTheme = localStorage.getItem('nextnote_current_theme');
    if (savedTheme && THEME_LIBRARY[savedTheme]) {
      applyTheme(savedTheme);
    } else {
      applyTheme('light-default');
    }
  }

  /**
   * Gets the current theme
   * @returns {Object} - Current theme object
   */
  function getCurrentTheme() {
    return {
      id: currentTheme,
      ...THEME_LIBRARY[currentTheme]
    };
  }

  /**
   * Gets all available themes
   * @returns {Object} - All themes
   */
  function getAllThemes() {
    return { ...THEME_LIBRARY };
  }

  /**
   * Gets themes by category
   * @param {string} category - Theme category
   * @returns {Array} - Themes in category
   */
  function getThemesByCategory(category) {
    return Object.entries(THEME_LIBRARY)
      .filter(([id, theme]) => theme.category === category)
      .map(([id, theme]) => ({ id, ...theme }));
  }

  // Initialize theme system
  loadSavedTheme();

  // Public API
  return {
    applyTheme,
    createThemeSelector,
    getCurrentTheme,
    getAllThemes,
    getThemesByCategory,
    loadSavedTheme,
    
    // Theme library access
    getTheme: (id) => THEME_LIBRARY[id],
    getCategories: () => {
      const categories = new Set();
      Object.values(THEME_LIBRARY).forEach(theme => {
        categories.add(theme.category);
      });
      return Array.from(categories);
    }
  };
})();
