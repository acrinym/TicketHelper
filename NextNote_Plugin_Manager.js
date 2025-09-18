/**
 * NextNote Plugin Manager
 * Provides secure plugin loading with error isolation and dependency management
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.NextNotePluginManager = (function() {
  const security = window.NextNoteSecurity;
  
  /**
   * Plugin registry and state management
   */
  const pluginRegistry = new Map();
  const loadedPlugins = new Map();
  const failedPlugins = new Map();
  const pluginDependencies = new Map();
  
  /**
   * Plugin loading states
   */
  const PLUGIN_STATES = {
    PENDING: 'pending',
    LOADING: 'loading',
    LOADED: 'loaded',
    FAILED: 'failed',
    DISABLED: 'disabled'
  };

  /**
   * Safe plugin API that plugins can access
   */
  const SAFE_PLUGIN_API = {
    // Core application access (read-only)
    getQuill: () => window.quill,
    getCurrentPage: () => window.currentPage,
    getCurrentSection: () => window.currentSection,
    getSections: () => [...(window.sections || [])], // Return copy to prevent modification
    
    // Safe DOM access
    getElementById: (id) => {
      const element = document.getElementById(id);
      return element && element.closest('#main, #sidebar') ? element : null;
    },
    
    // Safe event system
    on: (event, handler) => {
      if (typeof handler === 'function') {
        document.addEventListener(`nextnote:${event}`, security.createSafeEventHandler(handler));
      }
    },
    
    emit: (event, data) => {
      const safeData = security.sanitizeText(JSON.stringify(data || {}));
      document.dispatchEvent(new CustomEvent(`nextnote:${event}`, { 
        detail: JSON.parse(safeData) 
      }));
    },
    
    // Safe UI creation
    createPanel: (pluginName, title) => {
      return createSafePluginPanel(pluginName, title);
    },
    
    // Safe storage access
    getStorage: (key) => {
      try {
        const value = localStorage.getItem(`nextnote_plugin_${key}`);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Plugin storage read error:', error);
        return null;
      }
    },
    
    setStorage: (key, value) => {
      try {
        const sanitizedValue = security.sanitizeText(JSON.stringify(value));
        localStorage.setItem(`nextnote_plugin_${key}`, sanitizedValue);
        return true;
      } catch (error) {
        console.error('Plugin storage write error:', error);
        return false;
      }
    },
    
    // Safe HTTP requests
    fetch: async (url, options = {}) => {
      if (!security.isValidURL(url)) {
        throw new Error('Invalid URL for plugin request');
      }
      
      // Limit request options for security
      const safeOptions = {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body
      };
      
      // Remove potentially dangerous options
      delete safeOptions.credentials;
      delete safeOptions.mode;
      
      return fetch(url, safeOptions);
    },
    
    // Utility functions
    showToast: (message, type = 'info') => {
      showPluginToast(security.sanitizeText(message), type);
    },
    
    logError: (error, context = {}) => {
      security.logSecurityEvent('plugin_error', {
        error: error.message || error,
        context: context
      });
    }
  };

  /**
   * Loads a plugin with error isolation
   * @param {string} pluginPath - Path to the plugin file
   * @param {Object} manifest - Plugin manifest (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async function loadPlugin(pluginPath, manifest = {}) {
    const pluginName = manifest.name || extractPluginNameFromPath(pluginPath);
    
    try {
      // Check if plugin is already loaded
      if (loadedPlugins.has(pluginName)) {
        console.warn(`Plugin ${pluginName} is already loaded`);
        return true;
      }

      // Set loading state
      pluginRegistry.set(pluginName, {
        path: pluginPath,
        manifest: manifest,
        state: PLUGIN_STATES.LOADING,
        loadTime: Date.now()
      });

      // Check dependencies
      if (manifest.dependencies && !await checkDependencies(manifest.dependencies)) {
        throw new Error(`Dependencies not met for plugin ${pluginName}`);
      }

      // Create isolated environment for plugin
      const pluginEnvironment = createPluginEnvironment(pluginName);
      
      // Load plugin script with timeout
      const loadPromise = loadPluginScript(pluginPath, pluginEnvironment);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Plugin load timeout')), 10000);
      });

      await Promise.race([loadPromise, timeoutPromise]);

      // Mark as loaded
      pluginRegistry.get(pluginName).state = PLUGIN_STATES.LOADED;
      loadedPlugins.set(pluginName, pluginEnvironment);

      security.logSecurityEvent('plugin_loaded', {
        pluginName: pluginName,
        loadTime: Date.now() - pluginRegistry.get(pluginName).loadTime
      });

      return true;

    } catch (error) {
      console.error(`Failed to load plugin ${pluginName}:`, error);
      
      // Mark as failed
      pluginRegistry.set(pluginName, {
        path: pluginPath,
        manifest: manifest,
        state: PLUGIN_STATES.FAILED,
        error: error.message
      });
      
      failedPlugins.set(pluginName, error);
      
      security.logSecurityEvent('plugin_load_failed', {
        pluginName: pluginName,
        error: error.message
      });

      return false;
    }
  }

  /**
   * Creates an isolated environment for a plugin
   * @param {string} pluginName - Name of the plugin
   * @returns {Object} - Plugin environment
   */
  function createPluginEnvironment(pluginName) {
    const environment = {
      name: pluginName,
      api: { ...SAFE_PLUGIN_API },
      state: {},
      cleanup: []
    };

    // Add plugin-specific API methods
    environment.api.getName = () => pluginName;
    environment.api.getState = () => ({ ...environment.state });
    environment.api.setState = (newState) => {
      Object.assign(environment.state, newState);
    };

    // Add cleanup registration
    environment.api.onUnload = (cleanupFunction) => {
      if (typeof cleanupFunction === 'function') {
        environment.cleanup.push(cleanupFunction);
      }
    };

    return environment;
  }

  /**
   * Loads a plugin script in an isolated environment
   * @param {string} pluginPath - Path to the plugin script
   * @param {Object} environment - Plugin environment
   * @returns {Promise<void>}
   */
  function loadPluginScript(pluginPath, environment) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = pluginPath;
      script.defer = true;

      // Create isolated registration function
      const originalRegister = window.registerNextNotePlugin;
      window.registerNextNotePlugin = (plugin) => {
        try {
          if (!plugin || typeof plugin !== 'object') {
            throw new Error('Invalid plugin object');
          }

          if (typeof plugin.onLoad !== 'function') {
            throw new Error('Plugin must have onLoad function');
          }

          // Call plugin onLoad with safe API
          plugin.onLoad(environment.api);
          
          // Store plugin reference
          environment.plugin = plugin;
          
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          // Restore original registration function
          window.registerNextNotePlugin = originalRegister;
        }
      };

      script.onload = () => {
        // If no plugin was registered, consider it a failure
        setTimeout(() => {
          if (!environment.plugin) {
            window.registerNextNotePlugin = originalRegister;
            reject(new Error('Plugin did not register itself'));
          }
        }, 1000);
      };

      script.onerror = () => {
        window.registerNextNotePlugin = originalRegister;
        reject(new Error('Failed to load plugin script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Checks if plugin dependencies are met
   * @param {Array<string>} dependencies - Array of dependency names
   * @returns {Promise<boolean>} - True if all dependencies are met
   */
  async function checkDependencies(dependencies) {
    if (!Array.isArray(dependencies)) {
      return true;
    }

    for (const dependency of dependencies) {
      if (!loadedPlugins.has(dependency)) {
        console.error(`Missing dependency: ${dependency}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Extracts plugin name from file path
   * @param {string} path - Plugin file path
   * @returns {string} - Plugin name
   */
  function extractPluginNameFromPath(path) {
    const filename = path.split('/').pop();
    return filename.replace(/^plugin-/, '').replace(/\.js$/, '');
  }

  /**
   * Creates a safe plugin panel in the sidebar
   * @param {string} pluginName - Name of the plugin
   * @param {string} title - Panel title
   * @returns {HTMLElement} - Panel element
   */
  function createSafePluginPanel(pluginName, title) {
    const containerId = `plugin-panel-${pluginName.toLowerCase().replace(/\s/g, '-')}`;
    
    // Check if panel already exists
    let panel = document.getElementById(containerId);
    if (panel) {
      return panel;
    }

    // Create new panel
    const pluginPanels = document.getElementById('pluginPanels');
    if (!pluginPanels) {
      console.error('Plugin panels container not found');
      return null;
    }

    panel = document.createElement('div');
    panel.id = containerId;
    panel.className = 'plugin-panel';
    
    const header = document.createElement('h3');
    header.className = 'plugin-panel-title';
    security.safeSetTextContent(header, title || pluginName);
    panel.appendChild(header);

    const content = document.createElement('div');
    content.className = 'plugin-panel-content';
    panel.appendChild(content);

    pluginPanels.appendChild(panel);
    return content;
  }

  /**
   * Shows a toast message from a plugin
   * @param {string} message - Message to display
   * @param {string} type - Toast type (info, success, warning, error)
   */
  function showPluginToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `plugin-toast plugin-toast-${type}`;
    
    const colors = {
      info: 'var(--hermes-info-text)',
      success: 'var(--hermes-success-text)',
      warning: 'var(--hermes-warning-text)',
      error: 'var(--hermes-error-text)'
    };

    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10001;
      max-width: 300px;
      margin-bottom: 10px;
    `;

    security.safeSetTextContent(toast, message);
    document.body.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 4000);
  }

  /**
   * Unloads a plugin and cleans up its resources
   * @param {string} pluginName - Name of the plugin to unload
   * @returns {boolean} - Success status
   */
  function unloadPlugin(pluginName) {
    try {
      const environment = loadedPlugins.get(pluginName);
      if (!environment) {
        return false;
      }

      // Run cleanup functions
      environment.cleanup.forEach(cleanupFn => {
        try {
          cleanupFn();
        } catch (error) {
          console.error(`Error in plugin cleanup for ${pluginName}:`, error);
        }
      });

      // Remove plugin panel
      const panelId = `plugin-panel-${pluginName.toLowerCase().replace(/\s/g, '-')}`;
      const panel = document.getElementById(panelId);
      if (panel) {
        panel.remove();
      }

      // Remove from registries
      loadedPlugins.delete(pluginName);
      pluginRegistry.delete(pluginName);

      security.logSecurityEvent('plugin_unloaded', { pluginName });
      return true;

    } catch (error) {
      console.error(`Error unloading plugin ${pluginName}:`, error);
      return false;
    }
  }

  /**
   * Gets the status of all plugins
   * @returns {Object} - Plugin status information
   */
  function getPluginStatus() {
    const status = {
      loaded: Array.from(loadedPlugins.keys()),
      failed: Array.from(failedPlugins.keys()),
      total: pluginRegistry.size
    };

    return status;
  }

  // Public API
  return {
    loadPlugin,
    unloadPlugin,
    getPluginStatus,
    showPluginToast,
    
    // Plugin state constants
    STATES: PLUGIN_STATES,
    
    // Registry access (read-only)
    getRegistry: () => new Map(pluginRegistry),
    getLoaded: () => Array.from(loadedPlugins.keys()),
    getFailed: () => Array.from(failedPlugins.keys())
  };
})();
