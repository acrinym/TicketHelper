/**
 * NextNote Safe Toolbar System
 * Replaces unsafe Function() usage with secure event handling
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.NextNoteSafeToolbar = (function() {
  const security = window.NextNoteSecurity;
  
  /**
   * Registry of safe toolbar actions
   * All toolbar actions must be pre-registered here for security
   */
  const TOOLBAR_ACTIONS = {
    // File operations
    'saveCurrentPage': () => {
      if (typeof window.saveCurrentPage === 'function') {
        window.saveCurrentPage();
      }
    },
    
    'exportMarkdown': () => {
      if (typeof window.exportMarkdown === 'function') {
        window.exportMarkdown();
      }
    },
    
    'exportNotebook': () => {
      if (typeof window.exportNotebook === 'function') {
        window.exportNotebook();
      }
    },
    
    'importMarkdown': () => {
      const fileInput = document.getElementById('importFile');
      if (fileInput) {
        fileInput.click();
      }
    },
    
    // Editor operations
    'togglePreview': () => {
      if (typeof window.togglePreview === 'function') {
        window.togglePreview();
      }
    },
    
    'insertImage': () => {
      const fileInput = document.getElementById('imgInput');
      if (fileInput) {
        fileInput.click();
      }
    },
    
    'insertAudio': () => {
      const fileInput = document.getElementById('audioInput');
      if (fileInput) {
        fileInput.click();
      }
    },
    
    'insertGIF': () => {
      const fileInput = document.getElementById('gifInput');
      if (fileInput) {
        fileInput.click();
      }
    },
    
    // Template operations
    'showTemplateSelector': () => {
      if (typeof window.showTemplateSelector === 'function') {
        window.showTemplateSelector();
      }
    },
    
    'createBlankPage': () => {
      if (typeof window.addPage === 'function') {
        window.addPage();
      }
    },
    
    // View operations
    'toggleSidebar': () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        const isHidden = sidebar.style.display === 'none';
        sidebar.style.display = isHidden ? 'flex' : 'none';
      }
    },
    
    'toggleFullscreen': () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    },
    
    // Search operations
    'focusSearch': () => {
      const searchInput = document.getElementById('fuzzySearchBar');
      if (searchInput) {
        searchInput.focus();
      }
    },
    
    // Theme operations
    'switchTheme': (themeName) => {
      if (typeof window.switchTheme === 'function') {
        window.switchTheme(themeName);
      }
    },
    
    // Plugin operations
    'openResourceManager': () => {
      const event = new CustomEvent('nextnote:openResourceManager');
      document.dispatchEvent(event);
    },
    
    'openQuickActions': () => {
      const event = new CustomEvent('nextnote:openQuickActions');
      document.dispatchEvent(event);
    },
    
    // Utility operations
    'showHelp': () => {
      const helpDialog = createHelpDialog();
      document.body.appendChild(helpDialog);
    },
    
    'showSettings': () => {
      if (typeof window.showToolbarCustomization === 'function') {
        window.showToolbarCustomization();
      }
    }
  };

  /**
   * Creates a safe toolbar button
   * @param {Object} buttonConfig - Button configuration
   * @returns {HTMLElement} - Safe button element
   */
  function createSafeButton(buttonConfig) {
    const button = document.createElement('button');
    
    // Set safe text content
    security.safeSetTextContent(button, buttonConfig.label || 'Button');
    
    // Set safe attributes
    if (buttonConfig.title) {
      button.title = security.sanitizeText(buttonConfig.title);
    }
    
    if (buttonConfig.className) {
      button.className = security.sanitizeText(buttonConfig.className);
    }
    
    // Set safe click handler
    if (buttonConfig.action && TOOLBAR_ACTIONS[buttonConfig.action]) {
      button.addEventListener('click', security.createSafeEventHandler((event) => {
        event.preventDefault();
        
        try {
          // Log the action for security monitoring
          security.logSecurityEvent('toolbar_action', {
            action: buttonConfig.action,
            timestamp: Date.now()
          });
          
          // Execute the safe action
          TOOLBAR_ACTIONS[buttonConfig.action](buttonConfig.params);
        } catch (error) {
          console.error('Error executing toolbar action:', error);
          showErrorToast('Failed to execute action: ' + buttonConfig.action);
        }
      }));
    } else {
      console.warn('Unknown or unsafe toolbar action:', buttonConfig.action);
      button.disabled = true;
      button.title = 'Action not available for security reasons';
    }
    
    return button;
  }

  /**
   * Creates a safe toolbar section
   * @param {string} sectionName - Name of the section
   * @param {Array} buttons - Array of button configurations
   * @returns {HTMLElement} - Safe section element
   */
  function createSafeSection(sectionName, buttons) {
    const section = document.createElement('div');
    section.className = 'toolbar-section';
    
    // Add section label
    const label = document.createElement('span');
    label.className = 'toolbar-section-label';
    security.safeSetTextContent(label, sectionName + ':');
    section.appendChild(label);
    
    // Add safe buttons
    buttons.forEach(buttonConfig => {
      if (buttonConfig && typeof buttonConfig === 'object') {
        const button = createSafeButton(buttonConfig);
        section.appendChild(button);
      }
    });
    
    return section;
  }

  /**
   * Safely rebuilds the toolbar with given configuration
   * @param {Object} toolbarConfig - Toolbar configuration
   */
  function rebuildSafeToolbar(toolbarConfig) {
    const toolbar = document.getElementById('toolbar');
    if (!toolbar) {
      console.error('Toolbar element not found');
      return;
    }

    // Clear existing toolbar content (except for fixed elements)
    const fixedElements = toolbar.querySelectorAll('.toolbar-fixed');
    const toolbarSections = toolbar.querySelectorAll('.toolbar-section');
    toolbarSections.forEach(section => section.remove());

    try {
      // Add safe sections
      Object.keys(toolbarConfig).forEach(categoryName => {
        const category = toolbarConfig[categoryName];
        if (category && typeof category === 'object') {
          const enabledButtons = Object.keys(category).filter(buttonKey => {
            const buttonConfig = category[buttonKey];
            return buttonConfig && buttonConfig.enabled !== false;
          }).map(buttonKey => category[buttonKey]);

          if (enabledButtons.length > 0) {
            const section = createSafeSection(categoryName, enabledButtons);
            toolbar.appendChild(section);
          }
        }
      });

      security.logSecurityEvent('toolbar_rebuilt', {
        sectionsCount: Object.keys(toolbarConfig).length
      });

    } catch (error) {
      console.error('Error rebuilding toolbar:', error);
      security.logSecurityEvent('toolbar_rebuild_error', {
        error: error.message
      });
      
      // Fallback: create minimal safe toolbar
      createMinimalToolbar(toolbar);
    }
  }

  /**
   * Creates a minimal safe toolbar as fallback
   * @param {HTMLElement} toolbar - Toolbar element
   */
  function createMinimalToolbar(toolbar) {
    const essentialButtons = [
      { label: '💾 Save', action: 'saveCurrentPage', title: 'Save current page' },
      { label: '📄 Preview', action: 'togglePreview', title: 'Toggle preview mode' },
      { label: '🏞️ Image', action: 'insertImage', title: 'Insert image' },
      { label: '⬇️ Export', action: 'exportMarkdown', title: 'Export as Markdown' }
    ];

    const section = createSafeSection('Essential', essentialButtons);
    toolbar.appendChild(section);
  }

  /**
   * Creates a help dialog
   * @returns {HTMLElement} - Help dialog element
   */
  function createHelpDialog() {
    const overlay = document.createElement('div');
    overlay.className = 'help-dialog-overlay';
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
    dialog.className = 'help-dialog';
    dialog.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-panel-border);
      border-radius: 12px;
      padding: 30px;
      width: 600px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    const helpContent = `
      <h2 style="margin-top: 0; color: var(--hermes-text);">NextNote Help</h2>
      <h3>Keyboard Shortcuts</h3>
      <ul>
        <li><kbd>Ctrl+S</kbd> - Save current page</li>
        <li><kbd>Ctrl+P</kbd> - Open quick actions</li>
        <li><kbd>Ctrl+K</kbd> - Focus search</li>
        <li><kbd>F11</kbd> - Toggle fullscreen</li>
        <li><kbd>Esc</kbd> - Close dialogs</li>
      </ul>
      <h3>Security Features</h3>
      <ul>
        <li>Input sanitization prevents XSS attacks</li>
        <li>File upload validation ensures safety</li>
        <li>Content Security Policy blocks malicious scripts</li>
        <li>Safe toolbar prevents code injection</li>
      </ul>
      <button id="closeHelp" style="margin-top: 20px; padding: 10px 20px; background: var(--hermes-highlight-bg); color: var(--hermes-highlight-text); border: none; border-radius: 6px; cursor: pointer;">Close</button>
    `;

    security.safeSetHTML(dialog, helpContent);

    // Safe close handler
    const closeButton = dialog.querySelector('#closeHelp');
    if (closeButton) {
      closeButton.addEventListener('click', security.createSafeEventHandler(() => {
        overlay.remove();
      }));
    }

    // Close on overlay click
    overlay.addEventListener('click', security.createSafeEventHandler((event) => {
      if (event.target === overlay) {
        overlay.remove();
      }
    }));

    // Close on Escape key
    const handleEscape = security.createSafeEventHandler((event) => {
      if (event.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    });
    document.addEventListener('keydown', handleEscape);

    overlay.appendChild(dialog);
    return overlay;
  }

  /**
   * Shows an error toast message
   * @param {string} message - Error message to display
   */
  function showErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--hermes-error-text);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10001;
      max-width: 300px;
    `;

    security.safeSetTextContent(toast, message);
    document.body.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 5000);
  }

  /**
   * Registers a new safe toolbar action
   * @param {string} actionName - Name of the action
   * @param {Function} actionFunction - Function to execute
   */
  function registerAction(actionName, actionFunction) {
    if (typeof actionName !== 'string' || typeof actionFunction !== 'function') {
      console.error('Invalid action registration:', actionName);
      return false;
    }

    if (TOOLBAR_ACTIONS[actionName]) {
      console.warn('Overriding existing toolbar action:', actionName);
    }

    TOOLBAR_ACTIONS[actionName] = security.createSafeEventHandler(actionFunction);
    security.logSecurityEvent('toolbar_action_registered', { actionName });
    return true;
  }

  // Public API
  return {
    createSafeButton,
    createSafeSection,
    rebuildSafeToolbar,
    registerAction,
    showErrorToast,
    
    // Get available actions (read-only)
    getAvailableActions: () => Object.keys(TOOLBAR_ACTIONS)
  };
})();
