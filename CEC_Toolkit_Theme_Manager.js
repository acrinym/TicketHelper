/**
 * CEC Toolkit Advanced Theme Manager
 * Provides comprehensive theming system for the CEC Ticket Helper
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.CECThemeManager = (function() {
  
  /**
   * Comprehensive theme library for CEC Toolkit
   */
  const CEC_THEME_LIBRARY = {
    // Professional Themes
    'professional-light': {
      name: 'Professional Light',
      category: 'Professional',
      description: 'Clean, professional light theme for business use',
      colors: {
        '--cec-bg': '#ffffff',
        '--cec-text': '#2c3e50',
        '--cec-border': '#bdc3c7',
        '--cec-panel-bg': '#f8f9fa',
        '--cec-panel-border': '#dee2e6',
        '--cec-button-bg': '#e9ecef',
        '--cec-button-hover': '#dee2e6',
        '--cec-button-active': '#ced4da',
        '--cec-primary': '#007bff',
        '--cec-primary-hover': '#0056b3',
        '--cec-success': '#28a745',
        '--cec-warning': '#ffc107',
        '--cec-danger': '#dc3545',
        '--cec-info': '#17a2b8',
        '--cec-input-bg': '#ffffff',
        '--cec-input-border': '#ced4da',
        '--cec-input-focus': '#80bdff',
        '--cec-header-bg': '#343a40',
        '--cec-header-text': '#ffffff',
        '--cec-sidebar-bg': '#f1f3f4',
        '--cec-card-bg': '#ffffff',
        '--cec-card-shadow': 'rgba(0,0,0,0.1)'
      }
    },

    'professional-dark': {
      name: 'Professional Dark',
      category: 'Professional',
      description: 'Sophisticated dark theme for professional environments',
      colors: {
        '--cec-bg': '#1a1a1a',
        '--cec-text': '#e9ecef',
        '--cec-border': '#495057',
        '--cec-panel-bg': '#2d3748',
        '--cec-panel-border': '#4a5568',
        '--cec-button-bg': '#4a5568',
        '--cec-button-hover': '#5a6578',
        '--cec-button-active': '#6a7588',
        '--cec-primary': '#4299e1',
        '--cec-primary-hover': '#3182ce',
        '--cec-success': '#48bb78',
        '--cec-warning': '#ed8936',
        '--cec-danger': '#f56565',
        '--cec-info': '#4fd1c7',
        '--cec-input-bg': '#2d3748',
        '--cec-input-border': '#4a5568',
        '--cec-input-focus': '#63b3ed',
        '--cec-header-bg': '#1a202c',
        '--cec-header-text': '#f7fafc',
        '--cec-sidebar-bg': '#2d3748',
        '--cec-card-bg': '#2d3748',
        '--cec-card-shadow': 'rgba(0,0,0,0.3)'
      }
    },

    // Government/Federal Themes
    'federal-blue': {
      name: 'Federal Blue',
      category: 'Government',
      description: 'Official government blue theme for federal agencies',
      colors: {
        '--cec-bg': '#f8f9fa',
        '--cec-text': '#212529',
        '--cec-border': '#6c757d',
        '--cec-panel-bg': '#ffffff',
        '--cec-panel-border': '#dee2e6',
        '--cec-button-bg': '#e9ecef',
        '--cec-button-hover': '#dee2e6',
        '--cec-button-active': '#ced4da',
        '--cec-primary': '#0f4c75',
        '--cec-primary-hover': '#0a3d5c',
        '--cec-success': '#155724',
        '--cec-warning': '#856404',
        '--cec-danger': '#721c24',
        '--cec-info': '#0c5460',
        '--cec-input-bg': '#ffffff',
        '--cec-input-border': '#ced4da',
        '--cec-input-focus': '#3282b8',
        '--cec-header-bg': '#0f4c75',
        '--cec-header-text': '#ffffff',
        '--cec-sidebar-bg': '#e3f2fd',
        '--cec-card-bg': '#ffffff',
        '--cec-card-shadow': 'rgba(15,76,117,0.1)'
      }
    },

    'usda-green': {
      name: 'USDA Forest Green',
      category: 'Government',
      description: 'USDA Forest Service inspired green theme',
      colors: {
        '--cec-bg': '#f1f8e9',
        '--cec-text': '#1b5e20',
        '--cec-border': '#4caf50',
        '--cec-panel-bg': '#e8f5e8',
        '--cec-panel-border': '#a5d6a7',
        '--cec-button-bg': '#c8e6c9',
        '--cec-button-hover': '#a5d6a7',
        '--cec-button-active': '#81c784',
        '--cec-primary': '#2e7d32',
        '--cec-primary-hover': '#1b5e20',
        '--cec-success': '#388e3c',
        '--cec-warning': '#f57c00',
        '--cec-danger': '#d32f2f',
        '--cec-info': '#1976d2',
        '--cec-input-bg': '#ffffff',
        '--cec-input-border': '#a5d6a7',
        '--cec-input-focus': '#4caf50',
        '--cec-header-bg': '#1b5e20',
        '--cec-header-text': '#ffffff',
        '--cec-sidebar-bg': '#e0f2e0',
        '--cec-card-bg': '#ffffff',
        '--cec-card-shadow': 'rgba(46,125,50,0.1)'
      }
    },

    // High Contrast Accessibility Themes
    'high-contrast-light': {
      name: 'High Contrast Light',
      category: 'Accessibility',
      description: 'Maximum contrast light theme for accessibility compliance',
      colors: {
        '--cec-bg': '#ffffff',
        '--cec-text': '#000000',
        '--cec-border': '#000000',
        '--cec-panel-bg': '#ffffff',
        '--cec-panel-border': '#000000',
        '--cec-button-bg': '#f0f0f0',
        '--cec-button-hover': '#e0e0e0',
        '--cec-button-active': '#d0d0d0',
        '--cec-primary': '#0000ff',
        '--cec-primary-hover': '#0000cc',
        '--cec-success': '#008000',
        '--cec-warning': '#ff8000',
        '--cec-danger': '#ff0000',
        '--cec-info': '#0000ff',
        '--cec-input-bg': '#ffffff',
        '--cec-input-border': '#000000',
        '--cec-input-focus': '#0000ff',
        '--cec-header-bg': '#000000',
        '--cec-header-text': '#ffffff',
        '--cec-sidebar-bg': '#f8f8f8',
        '--cec-card-bg': '#ffffff',
        '--cec-card-shadow': 'rgba(0,0,0,0.5)'
      }
    },

    'high-contrast-dark': {
      name: 'High Contrast Dark',
      category: 'Accessibility',
      description: 'Maximum contrast dark theme for accessibility compliance',
      colors: {
        '--cec-bg': '#000000',
        '--cec-text': '#ffffff',
        '--cec-border': '#ffffff',
        '--cec-panel-bg': '#000000',
        '--cec-panel-border': '#ffffff',
        '--cec-button-bg': '#333333',
        '--cec-button-hover': '#555555',
        '--cec-button-active': '#777777',
        '--cec-primary': '#ffff00',
        '--cec-primary-hover': '#cccc00',
        '--cec-success': '#00ff00',
        '--cec-warning': '#ffff00',
        '--cec-danger': '#ff0000',
        '--cec-info': '#00ffff',
        '--cec-input-bg': '#000000',
        '--cec-input-border': '#ffffff',
        '--cec-input-focus': '#ffff00',
        '--cec-header-bg': '#ffffff',
        '--cec-header-text': '#000000',
        '--cec-sidebar-bg': '#111111',
        '--cec-card-bg': '#000000',
        '--cec-card-shadow': 'rgba(255,255,255,0.3)'
      }
    },

    // Material Design Themes
    'material-light': {
      name: 'Material Light',
      category: 'Material',
      description: 'Google Material Design light theme',
      colors: {
        '--cec-bg': '#fafafa',
        '--cec-text': '#212121',
        '--cec-border': '#e0e0e0',
        '--cec-panel-bg': '#ffffff',
        '--cec-panel-border': '#e0e0e0',
        '--cec-button-bg': '#ffffff',
        '--cec-button-hover': '#f5f5f5',
        '--cec-button-active': '#eeeeee',
        '--cec-primary': '#1976d2',
        '--cec-primary-hover': '#1565c0',
        '--cec-success': '#388e3c',
        '--cec-warning': '#f57c00',
        '--cec-danger': '#d32f2f',
        '--cec-info': '#1976d2',
        '--cec-input-bg': '#ffffff',
        '--cec-input-border': '#e0e0e0',
        '--cec-input-focus': '#1976d2',
        '--cec-header-bg': '#1976d2',
        '--cec-header-text': '#ffffff',
        '--cec-sidebar-bg': '#f5f5f5',
        '--cec-card-bg': '#ffffff',
        '--cec-card-shadow': 'rgba(0,0,0,0.12)'
      }
    },

    'material-dark': {
      name: 'Material Dark',
      category: 'Material',
      description: 'Google Material Design dark theme',
      colors: {
        '--cec-bg': '#121212',
        '--cec-text': '#ffffff',
        '--cec-border': '#333333',
        '--cec-panel-bg': '#1e1e1e',
        '--cec-panel-border': '#333333',
        '--cec-button-bg': '#2c2c2c',
        '--cec-button-hover': '#383838',
        '--cec-button-active': '#484848',
        '--cec-primary': '#bb86fc',
        '--cec-primary-hover': '#985eff',
        '--cec-success': '#4caf50',
        '--cec-warning': '#ff9800',
        '--cec-danger': '#cf6679',
        '--cec-info': '#03dac6',
        '--cec-input-bg': '#1e1e1e',
        '--cec-input-border': '#333333',
        '--cec-input-focus': '#bb86fc',
        '--cec-header-bg': '#1f1f1f',
        '--cec-header-text': '#ffffff',
        '--cec-sidebar-bg': '#1a1a1a',
        '--cec-card-bg': '#1e1e1e',
        '--cec-card-shadow': 'rgba(0,0,0,0.4)'
      }
    },

    // Seasonal/Fun Themes
    'autumn-warm': {
      name: 'Autumn Warm',
      category: 'Seasonal',
      description: 'Warm autumn colors for a cozy feel',
      colors: {
        '--cec-bg': '#fdf6e3',
        '--cec-text': '#5d4037',
        '--cec-border': '#d7ccc8',
        '--cec-panel-bg': '#fff8e1',
        '--cec-panel-border': '#d7ccc8',
        '--cec-button-bg': '#ffecb3',
        '--cec-button-hover': '#ffe082',
        '--cec-button-active': '#ffd54f',
        '--cec-primary': '#ff8f00',
        '--cec-primary-hover': '#ef6c00',
        '--cec-success': '#689f38',
        '--cec-warning': '#f57c00',
        '--cec-danger': '#d84315',
        '--cec-info': '#1976d2',
        '--cec-input-bg': '#ffffff',
        '--cec-input-border': '#d7ccc8',
        '--cec-input-focus': '#ff8f00',
        '--cec-header-bg': '#5d4037',
        '--cec-header-text': '#ffffff',
        '--cec-sidebar-bg': '#fff3e0',
        '--cec-card-bg': '#ffffff',
        '--cec-card-shadow': 'rgba(93,64,55,0.1)'
      }
    },

    'winter-cool': {
      name: 'Winter Cool',
      category: 'Seasonal',
      description: 'Cool winter blues and whites',
      colors: {
        '--cec-bg': '#f3f8ff',
        '--cec-text': '#1a237e',
        '--cec-border': '#9fa8da',
        '--cec-panel-bg': '#e8eaf6',
        '--cec-panel-border': '#9fa8da',
        '--cec-button-bg': '#c5cae9',
        '--cec-button-hover': '#9fa8da',
        '--cec-button-active': '#7986cb',
        '--cec-primary': '#3f51b5',
        '--cec-primary-hover': '#303f9f',
        '--cec-success': '#4caf50',
        '--cec-warning': '#ff9800',
        '--cec-danger': '#f44336',
        '--cec-info': '#2196f3',
        '--cec-input-bg': '#ffffff',
        '--cec-input-border': '#9fa8da',
        '--cec-input-focus': '#3f51b5',
        '--cec-header-bg': '#1a237e',
        '--cec-header-text': '#ffffff',
        '--cec-sidebar-bg': '#e1f5fe',
        '--cec-card-bg': '#ffffff',
        '--cec-card-shadow': 'rgba(26,35,126,0.1)'
      }
    }
  };

  /**
   * Current active theme
   */
  let currentTheme = 'professional-light';

  /**
   * Applies a theme to the CEC Toolkit
   * @param {string} themeId - Theme identifier
   * @returns {boolean} - Success status
   */
  function applyTheme(themeId) {
    const theme = CEC_THEME_LIBRARY[themeId];
    if (!theme) {
      console.error(`CEC Theme ${themeId} not found`);
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
      localStorage.setItem('cec_toolkit_current_theme', themeId);

      // Apply theme-specific classes
      applyThemeClasses(theme);

      // Dispatch theme change event
      document.dispatchEvent(new CustomEvent('cec:themeChanged', {
        detail: { themeId, theme }
      }));

      console.log(`CEC Theme applied: ${theme.name}`);
      return true;

    } catch (error) {
      console.error('Error applying CEC theme:', error);
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
    body.classList.remove(
      'cec-theme-professional', 'cec-theme-government', 
      'cec-theme-accessibility', 'cec-theme-material', 'cec-theme-seasonal'
    );
    
    // Add new theme class based on category
    switch (theme.category) {
      case 'Professional':
        body.classList.add('cec-theme-professional');
        break;
      case 'Government':
        body.classList.add('cec-theme-government');
        break;
      case 'Accessibility':
        body.classList.add('cec-theme-accessibility');
        break;
      case 'Material':
        body.classList.add('cec-theme-material');
        break;
      case 'Seasonal':
        body.classList.add('cec-theme-seasonal');
        break;
    }
  }

  /**
   * Creates a theme selector for CEC Toolkit
   * @returns {HTMLElement} - Theme selector element
   */
  function createThemeSelector() {
    const container = document.createElement('div');
    container.className = 'cec-theme-selector';
    container.style.cssText = `
      margin: 20px 0;
      padding: 20px;
      border: 1px solid var(--cec-border);
      border-radius: 8px;
      background: var(--cec-panel-bg);
    `;

    const title = document.createElement('h3');
    title.style.cssText = `
      margin: 0 0 15px 0;
      color: var(--cec-text);
      font-size: 1.2em;
    `;
    title.textContent = '🎨 Choose Theme';

    const themeGrid = document.createElement('div');
    themeGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 15px;
    `;

    // Group themes by category
    const categories = {};
    Object.entries(CEC_THEME_LIBRARY).forEach(([id, theme]) => {
      if (!categories[theme.category]) {
        categories[theme.category] = [];
      }
      categories[theme.category].push({ id, ...theme });
    });

    // Create theme buttons for each category
    Object.entries(categories).forEach(([category, themes]) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.style.cssText = 'margin-bottom: 15px;';

      const categoryLabel = document.createElement('h4');
      categoryLabel.style.cssText = `
        margin: 0 0 10px 0;
        color: var(--cec-text);
        font-size: 1em;
        border-bottom: 1px solid var(--cec-border);
        padding-bottom: 5px;
      `;
      categoryLabel.textContent = category;
      categoryDiv.appendChild(categoryLabel);

      themes.forEach(theme => {
        const button = document.createElement('button');
        button.className = 'cec-theme-button';
        button.style.cssText = `
          display: block;
          width: 100%;
          padding: 10px;
          margin-bottom: 5px;
          border: 2px solid ${theme.id === currentTheme ? 'var(--cec-primary)' : 'var(--cec-border)'};
          border-radius: 6px;
          background: ${theme.id === currentTheme ? 'var(--cec-primary)' : 'var(--cec-button-bg)'};
          color: ${theme.id === currentTheme ? 'var(--cec-header-text)' : 'var(--cec-text)'};
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          font-size: 0.9em;
        `;

        button.innerHTML = `
          <strong>${theme.name}</strong><br>
          <small style="opacity: 0.8;">${theme.description}</small>
        `;

        button.addEventListener('click', () => {
          applyTheme(theme.id);
          // Update all theme buttons
          container.querySelectorAll('.cec-theme-button').forEach(btn => {
            btn.style.border = '2px solid var(--cec-border)';
            btn.style.background = 'var(--cec-button-bg)';
            btn.style.color = 'var(--cec-text)';
          });
          button.style.border = '2px solid var(--cec-primary)';
          button.style.background = 'var(--cec-primary)';
          button.style.color = 'var(--cec-header-text)';
        });

        button.addEventListener('mouseenter', () => {
          if (theme.id !== currentTheme) {
            button.style.background = 'var(--cec-button-hover)';
          }
        });

        button.addEventListener('mouseleave', () => {
          if (theme.id !== currentTheme) {
            button.style.background = 'var(--cec-button-bg)';
          }
        });

        categoryDiv.appendChild(button);
      });

      themeGrid.appendChild(categoryDiv);
    });

    container.appendChild(title);
    container.appendChild(themeGrid);

    return container;
  }

  /**
   * Loads the saved theme on initialization
   */
  function loadSavedTheme() {
    const savedTheme = localStorage.getItem('cec_toolkit_current_theme');
    if (savedTheme && CEC_THEME_LIBRARY[savedTheme]) {
      applyTheme(savedTheme);
    } else {
      applyTheme('professional-light');
    }
  }

  /**
   * Gets the current theme
   * @returns {Object} - Current theme object
   */
  function getCurrentTheme() {
    return {
      id: currentTheme,
      ...CEC_THEME_LIBRARY[currentTheme]
    };
  }

  /**
   * Gets all available themes
   * @returns {Object} - All themes
   */
  function getAllThemes() {
    return { ...CEC_THEME_LIBRARY };
  }

  // Initialize theme system
  loadSavedTheme();

  // Public API
  return {
    applyTheme,
    createThemeSelector,
    getCurrentTheme,
    getAllThemes,
    loadSavedTheme,
    
    // Theme library access
    getTheme: (id) => CEC_THEME_LIBRARY[id],
    getCategories: () => {
      const categories = new Set();
      Object.values(CEC_THEME_LIBRARY).forEach(theme => {
        categories.add(theme.category);
      });
      return Array.from(categories);
    }
  };
})();
