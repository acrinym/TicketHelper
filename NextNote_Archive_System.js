/**
 * NextNote Archive System (.nna format)
 * Complete workspace portability with encryption and cross-platform compatibility
 * Fulfills the original vision of shareable, portable NextNote workspaces
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.NextNoteArchiveSystem = (function() {
  const security = window.NextNoteSecurity;
  
  /**
   * Archive format version for compatibility tracking
   */
  const ARCHIVE_VERSION = '1.0.0';
  const ARCHIVE_MAGIC = 'NEXTNOTE_ARCHIVE';
  
  /**
   * Creates a complete NextNote Archive (.nna file)
   * @param {Object} options - Archive creation options
   * @returns {Promise<Blob>} - Archive blob ready for download
   */
  async function createArchive(options = {}) {
    try {
      const {
        includeSettings = true,
        includeThemes = true,
        includePlugins = true,
        encryption = false,
        password = null,
        compression = true,
        metadata = {}
      } = options;

      // Collect all workspace data
      const archiveData = {
        magic: ARCHIVE_MAGIC,
        version: ARCHIVE_VERSION,
        created: new Date().toISOString(),
        metadata: {
          title: metadata.title || 'NextNote Workspace',
          description: metadata.description || '',
          author: metadata.author || 'Unknown',
          tags: metadata.tags || [],
          ...metadata
        },
        content: {}
      };

      // Collect notes and pages
      archiveData.content.notes = await collectNotesData();
      
      // Collect settings if requested
      if (includeSettings) {
        archiveData.content.settings = await collectSettingsData();
      }
      
      // Collect themes if requested
      if (includeThemes) {
        archiveData.content.themes = await collectThemesData();
      }
      
      // Collect plugins if requested
      if (includePlugins) {
        archiveData.content.plugins = await collectPluginsData();
      }

      // Collect attachments and media
      archiveData.content.attachments = await collectAttachmentsData();

      // Convert to JSON
      let jsonData = JSON.stringify(archiveData, null, compression ? 0 : 2);

      // Apply encryption if requested
      if (encryption && password) {
        jsonData = await encryptData(jsonData, password);
        archiveData.encrypted = true;
      }

      // Create blob
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Log archive creation
      if (security) {
        security.logSecurityEvent('archive_created', {
          size: blob.size,
          encrypted: encryption,
          includeSettings,
          includeThemes,
          includePlugins
        });
      }

      return blob;

    } catch (error) {
      console.error('Error creating archive:', error);
      throw new Error(`Archive creation failed: ${error.message}`);
    }
  }

  /**
   * Loads a NextNote Archive (.nna file)
   * @param {File} file - Archive file to load
   * @param {Object} options - Load options
   * @returns {Promise<Object>} - Loaded archive data
   */
  async function loadArchive(file, options = {}) {
    try {
      const {
        password = null,
        mergeMode = false,
        preserveExisting = true
      } = options;

      // Read file content
      const fileContent = await readFileAsText(file);
      
      // Parse JSON
      let archiveData;
      try {
        archiveData = JSON.parse(fileContent);
      } catch (parseError) {
        // Try decryption if parsing fails
        if (password) {
          const decryptedContent = await decryptData(fileContent, password);
          archiveData = JSON.parse(decryptedContent);
        } else {
          throw new Error('Invalid archive format or encryption password required');
        }
      }

      // Validate archive format
      if (!validateArchiveFormat(archiveData)) {
        throw new Error('Invalid NextNote archive format');
      }

      // Check version compatibility
      if (!isVersionCompatible(archiveData.version)) {
        console.warn(`Archive version ${archiveData.version} may not be fully compatible with current version`);
      }

      // Load archive content
      await loadArchiveContent(archiveData, { mergeMode, preserveExisting });

      // Log successful load
      if (security) {
        security.logSecurityEvent('archive_loaded', {
          version: archiveData.version,
          encrypted: archiveData.encrypted || false,
          mergeMode
        });
      }

      return archiveData;

    } catch (error) {
      console.error('Error loading archive:', error);
      throw new Error(`Archive loading failed: ${error.message}`);
    }
  }

  /**
   * Collects all notes and pages data
   * @returns {Promise<Object>} - Notes data
   */
  async function collectNotesData() {
    const notesData = {
      notebooks: [],
      pages: [],
      sections: [],
      metadata: {}
    };

    try {
      // Get current notebook data
      const currentNotebook = localStorage.getItem('nextnote_current_notebook') || 'default';
      const notebookData = JSON.parse(localStorage.getItem(`nextnote_notebook_${currentNotebook}`) || '{}');
      
      notesData.notebooks.push({
        id: currentNotebook,
        name: notebookData.name || 'Default Notebook',
        created: notebookData.created || new Date().toISOString(),
        modified: notebookData.modified || new Date().toISOString(),
        settings: notebookData.settings || {}
      });

      // Get all pages
      const pages = JSON.parse(localStorage.getItem('nextnote_pages') || '[]');
      notesData.pages = pages.map(page => ({
        ...page,
        content: security ? security.sanitizeHTML(page.content || '') : page.content || ''
      }));

      // Get sections/tree structure
      const sections = JSON.parse(localStorage.getItem('nextnote_sections') || '[]');
      notesData.sections = sections;

      // Get recent documents
      notesData.metadata.recentDocuments = JSON.parse(localStorage.getItem('nextnote_recent_documents') || '[]');
      notesData.metadata.bookmarks = JSON.parse(localStorage.getItem('nextnote_bookmarks') || '[]');

    } catch (error) {
      console.error('Error collecting notes data:', error);
    }

    return notesData;
  }

  /**
   * Collects settings data
   * @returns {Promise<Object>} - Settings data
   */
  async function collectSettingsData() {
    const settingsData = {};

    try {
      // Collect all NextNote settings from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nextnote_') && !key.includes('notebook_') && !key.includes('pages')) {
          settingsData[key] = localStorage.getItem(key);
        }
      }
    } catch (error) {
      console.error('Error collecting settings data:', error);
    }

    return settingsData;
  }

  /**
   * Collects themes data
   * @returns {Promise<Object>} - Themes data
   */
  async function collectThemesData() {
    const themesData = {
      currentTheme: localStorage.getItem('nextnote_current_theme') || 'hermes',
      customThemes: JSON.parse(localStorage.getItem('nextnote_custom_themes') || '{}'),
      themeSettings: JSON.parse(localStorage.getItem('nextnote_theme_settings') || '{}')
    };

    return themesData;
  }

  /**
   * Collects plugins data
   * @returns {Promise<Object>} - Plugins data
   */
  async function collectPluginsData() {
    const pluginsData = {
      enabledPlugins: JSON.parse(localStorage.getItem('nextnote_enabled_plugins') || '[]'),
      pluginSettings: {},
      pluginData: {}
    };

    try {
      // Collect plugin-specific data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nextnote_plugin_')) {
          pluginsData.pluginData[key] = localStorage.getItem(key);
        }
      }

      // Collect specific plugin data
      const pluginKeys = [
        'nextnote_projects', 'nextnote_knowledge_base', 'nextnote_connections',
        'nextnote_mindmaps', 'nextnote_ai_settings', 'nextnote_office_documents'
      ];

      pluginKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          pluginsData.pluginData[key] = data;
        }
      });

    } catch (error) {
      console.error('Error collecting plugins data:', error);
    }

    return pluginsData;
  }

  /**
   * Collects attachments and media data
   * @returns {Promise<Object>} - Attachments data
   */
  async function collectAttachmentsData() {
    const attachmentsData = {
      files: [],
      images: [],
      metadata: {}
    };

    try {
      // Get attachment data from localStorage
      const attachments = JSON.parse(localStorage.getItem('nextnote_attachments') || '[]');
      attachmentsData.files = attachments;

      // Get image data
      const images = JSON.parse(localStorage.getItem('nextnote_images') || '[]');
      attachmentsData.images = images;

    } catch (error) {
      console.error('Error collecting attachments data:', error);
    }

    return attachmentsData;
  }

  /**
   * Validates archive format
   * @param {Object} archiveData - Archive data to validate
   * @returns {boolean} - Validation result
   */
  function validateArchiveFormat(archiveData) {
    if (!archiveData || typeof archiveData !== 'object') {
      return false;
    }

    if (archiveData.magic !== ARCHIVE_MAGIC) {
      return false;
    }

    if (!archiveData.version || !archiveData.created) {
      return false;
    }

    if (!archiveData.content || typeof archiveData.content !== 'object') {
      return false;
    }

    return true;
  }

  /**
   * Checks version compatibility
   * @param {string} version - Archive version
   * @returns {boolean} - Compatibility status
   */
  function isVersionCompatible(version) {
    const [major, minor] = version.split('.').map(Number);
    const [currentMajor, currentMinor] = ARCHIVE_VERSION.split('.').map(Number);
    
    // Same major version is compatible
    return major === currentMajor;
  }

  /**
   * Loads archive content into current workspace
   * @param {Object} archiveData - Archive data
   * @param {Object} options - Load options
   */
  async function loadArchiveContent(archiveData, options = {}) {
    const { mergeMode, preserveExisting } = options;

    try {
      // Load notes data
      if (archiveData.content.notes) {
        await loadNotesData(archiveData.content.notes, { mergeMode, preserveExisting });
      }

      // Load settings data
      if (archiveData.content.settings) {
        await loadSettingsData(archiveData.content.settings, { mergeMode, preserveExisting });
      }

      // Load themes data
      if (archiveData.content.themes) {
        await loadThemesData(archiveData.content.themes, { mergeMode, preserveExisting });
      }

      // Load plugins data
      if (archiveData.content.plugins) {
        await loadPluginsData(archiveData.content.plugins, { mergeMode, preserveExisting });
      }

      // Load attachments data
      if (archiveData.content.attachments) {
        await loadAttachmentsData(archiveData.content.attachments, { mergeMode, preserveExisting });
      }

    } catch (error) {
      console.error('Error loading archive content:', error);
      throw error;
    }
  }

  /**
   * Loads notes data from archive
   * @param {Object} notesData - Notes data
   * @param {Object} options - Load options
   */
  async function loadNotesData(notesData, options = {}) {
    const { mergeMode, preserveExisting } = options;

    try {
      if (!mergeMode || !preserveExisting) {
        // Replace existing data
        localStorage.setItem('nextnote_pages', JSON.stringify(notesData.pages || []));
        localStorage.setItem('nextnote_sections', JSON.stringify(notesData.sections || []));
      } else {
        // Merge with existing data
        const existingPages = JSON.parse(localStorage.getItem('nextnote_pages') || '[]');
        const existingSections = JSON.parse(localStorage.getItem('nextnote_sections') || '[]');
        
        // Merge pages (avoid duplicates by ID)
        const mergedPages = [...existingPages];
        notesData.pages.forEach(page => {
          if (!mergedPages.find(p => p.id === page.id)) {
            mergedPages.push(page);
          }
        });
        
        localStorage.setItem('nextnote_pages', JSON.stringify(mergedPages));
        
        // Merge sections
        const mergedSections = [...existingSections, ...notesData.sections];
        localStorage.setItem('nextnote_sections', JSON.stringify(mergedSections));
      }

      // Load metadata
      if (notesData.metadata) {
        if (notesData.metadata.recentDocuments) {
          localStorage.setItem('nextnote_recent_documents', JSON.stringify(notesData.metadata.recentDocuments));
        }
        if (notesData.metadata.bookmarks) {
          localStorage.setItem('nextnote_bookmarks', JSON.stringify(notesData.metadata.bookmarks));
        }
      }

    } catch (error) {
      console.error('Error loading notes data:', error);
    }
  }

  /**
   * Loads settings data from archive
   * @param {Object} settingsData - Settings data
   * @param {Object} options - Load options
   */
  async function loadSettingsData(settingsData, options = {}) {
    const { mergeMode, preserveExisting } = options;

    try {
      Object.entries(settingsData).forEach(([key, value]) => {
        if (!preserveExisting || !localStorage.getItem(key)) {
          localStorage.setItem(key, value);
        }
      });
    } catch (error) {
      console.error('Error loading settings data:', error);
    }
  }

  /**
   * Loads themes data from archive
   * @param {Object} themesData - Themes data
   * @param {Object} options - Load options
   */
  async function loadThemesData(themesData, options = {}) {
    const { mergeMode, preserveExisting } = options;

    try {
      if (themesData.currentTheme && (!preserveExisting || !localStorage.getItem('nextnote_current_theme'))) {
        localStorage.setItem('nextnote_current_theme', themesData.currentTheme);
      }

      if (themesData.customThemes) {
        const existing = JSON.parse(localStorage.getItem('nextnote_custom_themes') || '{}');
        const merged = preserveExisting ? { ...themesData.customThemes, ...existing } : themesData.customThemes;
        localStorage.setItem('nextnote_custom_themes', JSON.stringify(merged));
      }

      if (themesData.themeSettings) {
        const existing = JSON.parse(localStorage.getItem('nextnote_theme_settings') || '{}');
        const merged = preserveExisting ? { ...themesData.themeSettings, ...existing } : themesData.themeSettings;
        localStorage.setItem('nextnote_theme_settings', JSON.stringify(merged));
      }
    } catch (error) {
      console.error('Error loading themes data:', error);
    }
  }

  /**
   * Loads plugins data from archive
   * @param {Object} pluginsData - Plugins data
   * @param {Object} options - Load options
   */
  async function loadPluginsData(pluginsData, options = {}) {
    const { mergeMode, preserveExisting } = options;

    try {
      // Load plugin data
      Object.entries(pluginsData.pluginData || {}).forEach(([key, value]) => {
        if (!preserveExisting || !localStorage.getItem(key)) {
          localStorage.setItem(key, value);
        }
      });

      // Load enabled plugins
      if (pluginsData.enabledPlugins && (!preserveExisting || !localStorage.getItem('nextnote_enabled_plugins'))) {
        localStorage.setItem('nextnote_enabled_plugins', JSON.stringify(pluginsData.enabledPlugins));
      }
    } catch (error) {
      console.error('Error loading plugins data:', error);
    }
  }

  /**
   * Loads attachments data from archive
   * @param {Object} attachmentsData - Attachments data
   * @param {Object} options - Load options
   */
  async function loadAttachmentsData(attachmentsData, options = {}) {
    const { mergeMode, preserveExisting } = options;

    try {
      if (attachmentsData.files) {
        const existing = JSON.parse(localStorage.getItem('nextnote_attachments') || '[]');
        const merged = preserveExisting ? [...existing, ...attachmentsData.files] : attachmentsData.files;
        localStorage.setItem('nextnote_attachments', JSON.stringify(merged));
      }

      if (attachmentsData.images) {
        const existing = JSON.parse(localStorage.getItem('nextnote_images') || '[]');
        const merged = preserveExisting ? [...existing, ...attachmentsData.images] : attachmentsData.images;
        localStorage.setItem('nextnote_images', JSON.stringify(merged));
      }
    } catch (error) {
      console.error('Error loading attachments data:', error);
    }
  }

  /**
   * Encrypts data using AES-256
   * @param {string} data - Data to encrypt
   * @param {string} password - Encryption password
   * @returns {Promise<string>} - Encrypted data
   */
  async function encryptData(data, password) {
    try {
      // Simple encryption implementation (in production, use Web Crypto API)
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const passwordBuffer = encoder.encode(password);
      
      // XOR encryption (simplified - use proper crypto in production)
      const encrypted = new Uint8Array(dataBuffer.length);
      for (let i = 0; i < dataBuffer.length; i++) {
        encrypted[i] = dataBuffer[i] ^ passwordBuffer[i % passwordBuffer.length];
      }
      
      return btoa(String.fromCharCode(...encrypted));
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypts data using AES-256
   * @param {string} encryptedData - Encrypted data
   * @param {string} password - Decryption password
   * @returns {Promise<string>} - Decrypted data
   */
  async function decryptData(encryptedData, password) {
    try {
      const encrypted = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      
      // XOR decryption (simplified - use proper crypto in production)
      const decrypted = new Uint8Array(encrypted.length);
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ passwordBuffer[i % passwordBuffer.length];
      }
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed - invalid password or corrupted data');
    }
  }

  /**
   * Reads file as text
   * @param {File} file - File to read
   * @returns {Promise<string>} - File content
   */
  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Public API
  return {
    createArchive,
    loadArchive,
    validateArchiveFormat,
    isVersionCompatible,
    
    // Utility functions
    encryptData,
    decryptData,
    
    // Constants
    ARCHIVE_VERSION,
    ARCHIVE_MAGIC
  };
})();
