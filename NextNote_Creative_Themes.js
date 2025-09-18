/**
 * NextNote Creative Themes Collection
 * Artistic, seasonal, and unique themes for enhanced user experience
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.NextNoteCreativeThemes = (function() {
  const security = window.NextNoteSecurity;
  
  /**
   * Creative and artistic theme collection
   */
  const CREATIVE_THEMES = {
    // Artistic Themes
    'cyberpunk-neon': {
      name: 'Cyberpunk Neon',
      category: 'Artistic',
      description: 'Futuristic neon-lit cyberpunk aesthetic',
      colors: {
        '--hermes-bg': '#0a0a0a',
        '--hermes-text': '#00ff9f',
        '--hermes-border': '#ff0080',
        '--hermes-panel-bg': '#1a0d1a',
        '--hermes-panel-border': '#ff0080',
        '--hermes-button-bg': '#2d1b2d',
        '--hermes-button-hover': '#3d2b3d',
        '--hermes-highlight-bg': '#00ff9f',
        '--hermes-highlight-text': '#000000',
        '--hermes-success-text': '#00ff9f',
        '--hermes-warning-text': '#ffff00',
        '--hermes-error-text': '#ff0080',
        '--hermes-info-text': '#00ffff',
        '--hermes-disabled-text': '#666666',
        '--hermes-input-bg': '#1a0d1a',
        '--hermes-sidebar-bg': '#0d0d0d',
        '--hermes-editor-bg': '#0a0a0a'
      },
      effects: {
        textShadow: '0 0 10px currentColor',
        borderGlow: '0 0 20px var(--hermes-border)',
        backgroundPattern: 'linear-gradient(45deg, transparent 25%, rgba(255,0,128,0.1) 25%, rgba(255,0,128,0.1) 50%, transparent 50%)'
      }
    },

    'retro-synthwave': {
      name: 'Retro Synthwave',
      category: 'Artistic',
      description: '80s synthwave with neon grids and gradients',
      colors: {
        '--hermes-bg': 'linear-gradient(135deg, #1a0033, #330066)',
        '--hermes-text': '#ff6ec7',
        '--hermes-border': '#00d4ff',
        '--hermes-panel-bg': 'linear-gradient(135deg, #2d1b69, #1a0033)',
        '--hermes-panel-border': '#00d4ff',
        '--hermes-button-bg': 'linear-gradient(135deg, #4a0e4e, #2d1b69)',
        '--hermes-button-hover': 'linear-gradient(135deg, #6a1e6e, #4a0e4e)',
        '--hermes-highlight-bg': 'linear-gradient(90deg, #ff6ec7, #00d4ff)',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#39ff14',
        '--hermes-warning-text': '#ffff00',
        '--hermes-error-text': '#ff073a',
        '--hermes-info-text': '#00d4ff',
        '--hermes-disabled-text': '#8a2be2',
        '--hermes-input-bg': 'rgba(26, 0, 51, 0.8)',
        '--hermes-sidebar-bg': 'linear-gradient(180deg, #1a0033, #0d001a)',
        '--hermes-editor-bg': 'linear-gradient(135deg, #1a0033, #330066)'
      }
    },

    'minimalist-zen': {
      name: 'Minimalist Zen',
      category: 'Artistic',
      description: 'Clean, zen-inspired minimalism with subtle accents',
      colors: {
        '--hermes-bg': '#fefefe',
        '--hermes-text': '#2c2c2c',
        '--hermes-border': '#e8e8e8',
        '--hermes-panel-bg': '#fbfbfb',
        '--hermes-panel-border': '#f0f0f0',
        '--hermes-button-bg': '#f8f8f8',
        '--hermes-button-hover': '#f0f0f0',
        '--hermes-highlight-bg': '#6b73ff',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#4caf50',
        '--hermes-warning-text': '#ff9800',
        '--hermes-error-text': '#f44336',
        '--hermes-info-text': '#2196f3',
        '--hermes-disabled-text': '#bdbdbd',
        '--hermes-input-bg': '#ffffff',
        '--hermes-sidebar-bg': '#fafafa',
        '--hermes-editor-bg': '#ffffff'
      }
    },

    // Seasonal Themes
    'spring-bloom': {
      name: 'Spring Bloom',
      category: 'Seasonal',
      description: 'Fresh spring colors with blooming flowers',
      colors: {
        '--hermes-bg': 'linear-gradient(135deg, #e8f5e8, #f0fff0)',
        '--hermes-text': '#2e7d32',
        '--hermes-border': '#81c784',
        '--hermes-panel-bg': 'linear-gradient(135deg, #f1f8e9, #e8f5e8)',
        '--hermes-panel-border': '#a5d6a7',
        '--hermes-button-bg': 'linear-gradient(135deg, #c8e6c9, #a5d6a7)',
        '--hermes-button-hover': 'linear-gradient(135deg, #a5d6a7, #81c784)',
        '--hermes-highlight-bg': 'linear-gradient(90deg, #66bb6a, #4caf50)',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#388e3c',
        '--hermes-warning-text': '#ff8f00',
        '--hermes-error-text': '#d32f2f',
        '--hermes-info-text': '#1976d2',
        '--hermes-disabled-text': '#757575',
        '--hermes-input-bg': '#ffffff',
        '--hermes-sidebar-bg': 'linear-gradient(180deg, #f1f8e9, #e8f5e8)',
        '--hermes-editor-bg': 'linear-gradient(135deg, #e8f5e8, #f0fff0)'
      }
    },

    'summer-sunset': {
      name: 'Summer Sunset',
      category: 'Seasonal',
      description: 'Warm summer sunset with golden hues',
      colors: {
        '--hermes-bg': 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
        '--hermes-text': '#e65100',
        '--hermes-border': '#ffab40',
        '--hermes-panel-bg': 'linear-gradient(135deg, #fff8e1, #fff3e0)',
        '--hermes-panel-border': '#ffcc02',
        '--hermes-button-bg': 'linear-gradient(135deg, #ffe0b2, #ffcc02)',
        '--hermes-button-hover': 'linear-gradient(135deg, #ffcc02, #ffab40)',
        '--hermes-highlight-bg': 'linear-gradient(90deg, #ff9800, #ff5722)',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#689f38',
        '--hermes-warning-text': '#f57c00',
        '--hermes-error-text': '#d84315',
        '--hermes-info-text': '#1976d2',
        '--hermes-disabled-text': '#8d6e63',
        '--hermes-input-bg': '#ffffff',
        '--hermes-sidebar-bg': 'linear-gradient(180deg, #fff8e1, #fff3e0)',
        '--hermes-editor-bg': 'linear-gradient(135deg, #fff3e0, #ffe0b2)'
      }
    },

    'autumn-forest': {
      name: 'Autumn Forest',
      category: 'Seasonal',
      description: 'Rich autumn colors with forest vibes',
      colors: {
        '--hermes-bg': 'linear-gradient(135deg, #3e2723, #5d4037)',
        '--hermes-text': '#ffcc02',
        '--hermes-border': '#ff8f00',
        '--hermes-panel-bg': 'linear-gradient(135deg, #4e342e, #3e2723)',
        '--hermes-panel-border': '#ff8f00',
        '--hermes-button-bg': 'linear-gradient(135deg, #5d4037, #4e342e)',
        '--hermes-button-hover': 'linear-gradient(135deg, #6d4c41, #5d4037)',
        '--hermes-highlight-bg': 'linear-gradient(90deg, #ff8f00, #f57c00)',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#8bc34a',
        '--hermes-warning-text': '#ffc107',
        '--hermes-error-text': '#f44336',
        '--hermes-info-text': '#03a9f4',
        '--hermes-disabled-text': '#8d6e63',
        '--hermes-input-bg': 'rgba(62, 39, 35, 0.8)',
        '--hermes-sidebar-bg': 'linear-gradient(180deg, #3e2723, #2e1e1a)',
        '--hermes-editor-bg': 'linear-gradient(135deg, #3e2723, #5d4037)'
      }
    },

    'winter-aurora': {
      name: 'Winter Aurora',
      category: 'Seasonal',
      description: 'Cool winter theme with aurora borealis colors',
      colors: {
        '--hermes-bg': 'linear-gradient(135deg, #0d1421, #1a237e)',
        '--hermes-text': '#e1f5fe',
        '--hermes-border': '#00bcd4',
        '--hermes-panel-bg': 'linear-gradient(135deg, #1a237e, #0d1421)',
        '--hermes-panel-border': '#00bcd4',
        '--hermes-button-bg': 'linear-gradient(135deg, #283593, #1a237e)',
        '--hermes-button-hover': 'linear-gradient(135deg, #3949ab, #283593)',
        '--hermes-highlight-bg': 'linear-gradient(90deg, #00bcd4, #4fc3f7)',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#4caf50',
        '--hermes-warning-text': '#ffc107',
        '--hermes-error-text': '#f44336',
        '--hermes-info-text': '#00bcd4',
        '--hermes-disabled-text': '#546e7a',
        '--hermes-input-bg': 'rgba(13, 20, 33, 0.8)',
        '--hermes-sidebar-bg': 'linear-gradient(180deg, #0d1421, #0a0f1a)',
        '--hermes-editor-bg': 'linear-gradient(135deg, #0d1421, #1a237e)'
      }
    },

    // Fantasy Themes
    'mystic-forest': {
      name: 'Mystic Forest',
      category: 'Fantasy',
      description: 'Enchanted forest with magical elements',
      colors: {
        '--hermes-bg': 'linear-gradient(135deg, #1b5e20, #2e7d32)',
        '--hermes-text': '#c8e6c9',
        '--hermes-border': '#66bb6a',
        '--hermes-panel-bg': 'linear-gradient(135deg, #2e7d32, #1b5e20)',
        '--hermes-panel-border': '#81c784',
        '--hermes-button-bg': 'linear-gradient(135deg, #388e3c, #2e7d32)',
        '--hermes-button-hover': 'linear-gradient(135deg, #4caf50, #388e3c)',
        '--hermes-highlight-bg': 'linear-gradient(90deg, #8bc34a, #4caf50)',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#a5d6a7',
        '--hermes-warning-text': '#ffcc02',
        '--hermes-error-text': '#ef5350',
        '--hermes-info-text': '#4fc3f7',
        '--hermes-disabled-text': '#81c784',
        '--hermes-input-bg': 'rgba(27, 94, 32, 0.8)',
        '--hermes-sidebar-bg': 'linear-gradient(180deg, #1b5e20, #0d2818)',
        '--hermes-editor-bg': 'linear-gradient(135deg, #1b5e20, #2e7d32)'
      }
    },

    'dragon-fire': {
      name: 'Dragon Fire',
      category: 'Fantasy',
      description: 'Fiery dragon theme with ember effects',
      colors: {
        '--hermes-bg': 'linear-gradient(135deg, #1a0000, #4a0000)',
        '--hermes-text': '#ffab40',
        '--hermes-border': '#ff5722',
        '--hermes-panel-bg': 'linear-gradient(135deg, #4a0000, #1a0000)',
        '--hermes-panel-border': '#ff5722',
        '--hermes-button-bg': 'linear-gradient(135deg, #6a0000, #4a0000)',
        '--hermes-button-hover': 'linear-gradient(135deg, #8a0000, #6a0000)',
        '--hermes-highlight-bg': 'linear-gradient(90deg, #ff5722, #ff9800)',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#4caf50',
        '--hermes-warning-text': '#ffc107',
        '--hermes-error-text': '#f44336',
        '--hermes-info-text': '#03a9f4',
        '--hermes-disabled-text': '#8d6e63',
        '--hermes-input-bg': 'rgba(26, 0, 0, 0.8)',
        '--hermes-sidebar-bg': 'linear-gradient(180deg, #1a0000, #0d0000)',
        '--hermes-editor-bg': 'linear-gradient(135deg, #1a0000, #4a0000)'
      }
    },

    // Productivity Themes
    'focus-mode': {
      name: 'Focus Mode',
      category: 'Productivity',
      description: 'Distraction-free theme for deep work',
      colors: {
        '--hermes-bg': '#1e1e1e',
        '--hermes-text': '#d4d4d4',
        '--hermes-border': '#3e3e3e',
        '--hermes-panel-bg': '#252526',
        '--hermes-panel-border': '#3e3e3e',
        '--hermes-button-bg': '#2d2d30',
        '--hermes-button-hover': '#3e3e42',
        '--hermes-highlight-bg': '#0e639c',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#4ec9b0',
        '--hermes-warning-text': '#dcdcaa',
        '--hermes-error-text': '#f44747',
        '--hermes-info-text': '#9cdcfe',
        '--hermes-disabled-text': '#6a6a6a',
        '--hermes-input-bg': '#1e1e1e',
        '--hermes-sidebar-bg': '#1e1e1e',
        '--hermes-editor-bg': '#1e1e1e'
      }
    },

    'paper-notebook': {
      name: 'Paper Notebook',
      category: 'Productivity',
      description: 'Classic paper notebook feel with lined background',
      colors: {
        '--hermes-bg': '#fefefe',
        '--hermes-text': '#2c2c2c',
        '--hermes-border': '#d0d0d0',
        '--hermes-panel-bg': '#f8f8f8',
        '--hermes-panel-border': '#e0e0e0',
        '--hermes-button-bg': '#f0f0f0',
        '--hermes-button-hover': '#e8e8e8',
        '--hermes-highlight-bg': '#1976d2',
        '--hermes-highlight-text': '#ffffff',
        '--hermes-success-text': '#388e3c',
        '--hermes-warning-text': '#f57c00',
        '--hermes-error-text': '#d32f2f',
        '--hermes-info-text': '#1976d2',
        '--hermes-disabled-text': '#9e9e9e',
        '--hermes-input-bg': '#ffffff',
        '--hermes-sidebar-bg': '#f5f5f5',
        '--hermes-editor-bg': '#fefefe'
      },
      backgroundPattern: 'repeating-linear-gradient(transparent, transparent 24px, #e0e0e0 24px, #e0e0e0 25px)'
    }
  };

  /**
   * Applies a creative theme
   * @param {string} themeId - Theme identifier
   * @returns {boolean} - Success status
   */
  function applyCreativeTheme(themeId) {
    const theme = CREATIVE_THEMES[themeId];
    if (!theme) {
      console.error(`Creative theme ${themeId} not found`);
      return false;
    }

    try {
      const root = document.documentElement;
      
      // Apply theme colors
      Object.entries(theme.colors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });

      // Apply special effects if present
      if (theme.effects) {
        applyThemeEffects(theme.effects);
      }

      // Apply background patterns if present
      if (theme.backgroundPattern) {
        document.body.style.backgroundImage = theme.backgroundPattern;
      } else {
        document.body.style.backgroundImage = 'none';
      }

      // Store current theme
      localStorage.setItem('nextnote_creative_theme', themeId);

      // Apply theme-specific classes
      applyCreativeThemeClasses(theme);

      // Dispatch theme change event
      document.dispatchEvent(new CustomEvent('nextnote:creativeThemeChanged', {
        detail: { themeId, theme }
      }));

      if (security) {
        security.logSecurityEvent('creative_theme_applied', {
          themeId: themeId,
          themeName: theme.name
        });
      }

      return true;

    } catch (error) {
      console.error('Error applying creative theme:', error);
      return false;
    }
  }

  /**
   * Applies special visual effects for themes
   * @param {Object} effects - Effects configuration
   */
  function applyThemeEffects(effects) {
    const style = document.getElementById('creative-theme-effects') || document.createElement('style');
    style.id = 'creative-theme-effects';
    
    let css = '';
    
    if (effects.textShadow) {
      css += `
        .theme-text-glow {
          text-shadow: ${effects.textShadow};
        }
      `;
    }
    
    if (effects.borderGlow) {
      css += `
        .theme-border-glow {
          box-shadow: ${effects.borderGlow};
        }
      `;
    }
    
    if (effects.backgroundPattern) {
      css += `
        .theme-pattern-bg {
          background-image: ${effects.backgroundPattern};
          background-size: 20px 20px;
        }
      `;
    }
    
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Applies theme-specific CSS classes
   * @param {Object} theme - Theme object
   */
  function applyCreativeThemeClasses(theme) {
    const body = document.body;
    
    // Remove existing creative theme classes
    body.classList.remove(
      'theme-artistic', 'theme-seasonal', 'theme-fantasy', 'theme-productivity'
    );
    
    // Add new theme class based on category
    switch (theme.category) {
      case 'Artistic':
        body.classList.add('theme-artistic');
        break;
      case 'Seasonal':
        body.classList.add('theme-seasonal');
        break;
      case 'Fantasy':
        body.classList.add('theme-fantasy');
        break;
      case 'Productivity':
        body.classList.add('theme-productivity');
        break;
    }
  }

  /**
   * Creates a creative theme selector
   * @returns {HTMLElement} - Theme selector element
   */
  function createCreativeThemeSelector() {
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
      border: 1px solid var(--hermes-panel-border);
      border-radius: 12px;
      padding: 30px;
      width: 1000px;
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
    security.safeSetTextContent(title, '🎨 Creative Themes');

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
    Object.entries(CREATIVE_THEMES).forEach(([id, theme]) => {
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
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 15px;
      `;

      themes.forEach(theme => {
        const themeCard = createCreativeThemeCard(theme, overlay);
        themeGrid.appendChild(themeCard);
      });

      categorySection.appendChild(themeGrid);
      dialog.appendChild(categorySection);
    });

    overlay.appendChild(dialog);
    return overlay;
  }

  /**
   * Creates a creative theme card
   * @param {Object} theme - Theme object
   * @param {HTMLElement} overlay - Overlay to close
   * @returns {HTMLElement} - Theme card element
   */
  function createCreativeThemeCard(theme, overlay) {
    const card = document.createElement('div');
    card.style.cssText = `
      border: 2px solid var(--hermes-border);
      border-radius: 8px;
      padding: 15px;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--hermes-bg);
      position: relative;
    `;

    // Theme preview with gradient
    const preview = document.createElement('div');
    preview.style.cssText = `
      height: 80px;
      border-radius: 4px;
      margin-bottom: 10px;
      background: ${theme.colors['--hermes-highlight-bg']};
      position: relative;
      overflow: hidden;
    `;

    // Add pattern overlay if theme has special effects
    if (theme.backgroundPattern) {
      const pattern = document.createElement('div');
      pattern.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: ${theme.backgroundPattern};
        background-size: 20px 20px;
        opacity: 0.3;
      `;
      preview.appendChild(pattern);
    }

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

    // Hover effects
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = 'var(--hermes-highlight-bg)';
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.borderColor = 'var(--hermes-border)';
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    });

    // Click handler
    card.addEventListener('click', () => {
      applyCreativeTheme(theme.id);
      overlay.remove();
    });

    card.appendChild(preview);
    card.appendChild(name);
    card.appendChild(description);

    return card;
  }

  /**
   * Loads saved creative theme
   */
  function loadSavedCreativeTheme() {
    const savedTheme = localStorage.getItem('nextnote_creative_theme');
    if (savedTheme && CREATIVE_THEMES[savedTheme]) {
      applyCreativeTheme(savedTheme);
    }
  }

  // Initialize on load
  loadSavedCreativeTheme();

  // Public API
  return {
    applyCreativeTheme,
    createCreativeThemeSelector,
    loadSavedCreativeTheme,
    
    // Theme library access
    getTheme: (id) => CREATIVE_THEMES[id],
    getAllThemes: () => ({ ...CREATIVE_THEMES }),
    getCategories: () => {
      const categories = new Set();
      Object.values(CREATIVE_THEMES).forEach(theme => {
        categories.add(theme.category);
      });
      return Array.from(categories);
    }
  };
})();
