/**
 * NextNote Icon Manager
 * Provides icon selection functionality for sections and pages using open icon libraries
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.NextNoteIconManager = (function() {
  const security = window.NextNoteSecurity;
  
  /**
   * Open icon libraries and their icons
   * Using only free, open-source icon sets
   */
  const ICON_LIBRARIES = {
    // Material Design Icons (Google, Apache 2.0 License)
    material: {
      name: 'Material Design',
      prefix: 'material-icons',
      icons: [
        'folder', 'folder_open', 'description', 'note', 'article', 'book',
        'library_books', 'bookmark', 'star', 'favorite', 'label', 'tag',
        'work', 'business', 'school', 'home', 'person', 'group',
        'lightbulb', 'psychology', 'science', 'code', 'computer', 'phone',
        'email', 'calendar_today', 'event', 'schedule', 'timer', 'alarm',
        'trending_up', 'analytics', 'assessment', 'bar_chart', 'pie_chart',
        'settings', 'build', 'extension', 'widgets', 'dashboard', 'view_module',
        'category', 'class', 'style', 'palette', 'color_lens', 'brush',
        'edit', 'create', 'draw', 'format_paint', 'text_fields', 'title',
        'subject', 'topic', 'forum', 'chat', 'comment', 'feedback',
        'help', 'info', 'warning', 'error', 'check_circle', 'cancel',
        'add_circle', 'remove_circle', 'play_circle', 'pause_circle',
        'stop_circle', 'record_voice_over', 'mic', 'volume_up', 'headset',
        'image', 'photo', 'camera', 'video_call', 'movie', 'slideshow',
        'map', 'place', 'location_on', 'explore', 'travel_explore', 'flight',
        'directions_car', 'directions_bike', 'directions_walk', 'train',
        'shopping_cart', 'store', 'local_grocery_store', 'restaurant',
        'local_cafe', 'local_bar', 'cake', 'sports_esports', 'fitness_center',
        'spa', 'beach_access', 'nature', 'park', 'eco', 'recycling'
      ]
    },
    
    // Emoji icons (Unicode standard, free to use)
    emoji: {
      name: 'Emoji',
      prefix: 'emoji',
      icons: [
        '📁', '📂', '📄', '📝', '📋', '📊', '📈', '📉', '📌', '📍',
        '🏠', '🏢', '🏫', '🏥', '🏪', '🏭', '🏛️', '🏗️', '🏘️', '🏙️',
        '💡', '🔬', '🔭', '🧪', '⚗️', '🧬', '🔬', '💻', '📱', '⌨️',
        '🖥️', '🖨️', '📷', '📹', '🎥', '📺', '📻', '🎵', '🎶', '🎤',
        '🎧', '🎸', '🎹', '🥁', '🎺', '🎷', '🎻', '🎪', '🎨', '🖌️',
        '🖍️', '✏️', '✒️', '🖊️', '🖋️', '📐', '📏', '📌', '📎', '🔗',
        '⭐', '🌟', '✨', '💫', '🌙', '☀️', '🌈', '☁️', '⛅', '🌤️',
        '🌱', '🌿', '🍀', '🌳', '🌲', '🌴', '🌵', '🌾', '🌺', '🌸',
        '🌼', '🌻', '🌹', '🌷', '🌶️', '🍎', '🍊', '🍋', '🍌', '🍇',
        '🚀', '✈️', '🚁', '🚂', '🚗', '🚲', '⛵', '🏆', '🎯', '🎲'
      ]
    },
    
    // Simple text icons (ASCII-based, always available)
    text: {
      name: 'Text Icons',
      prefix: 'text',
      icons: [
        '[F]', '[D]', '[N]', '[P]', '[B]', '[S]', '[T]', '[W]', '[H]', '[C]',
        '[1]', '[2]', '[3]', '[4]', '[5]', '[6]', '[7]', '[8]', '[9]', '[0]',
        '[A]', '[B]', '[C]', '[D]', '[E]', '[F]', '[G]', '[H]', '[I]', '[J]',
        '[!]', '[?]', '[*]', '[+]', '[-]', '[=]', '[>]', '[<]', '[#]', '[@]',
        '(i)', '(!)', '(?)', '(*)', '(+)', '(-)', '(=)', '(>)', '(<)', '(#)',
        '{F}', '{D}', '{N}', '{P}', '{B}', '{S}', '{T}', '{W}', '{H}', '{C}'
      ]
    }
  };

  /**
   * Creates an icon picker dialog
   * @param {Function} onSelect - Callback function when icon is selected
   * @param {string} currentIcon - Currently selected icon
   * @returns {HTMLElement} - Icon picker dialog
   */
  function createIconPicker(onSelect, currentIcon = '') {
    const overlay = document.createElement('div');
    overlay.className = 'icon-picker-overlay';
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
    dialog.className = 'icon-picker-dialog';
    dialog.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-panel-border);
      border-radius: 12px;
      padding: 20px;
      width: 600px;
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
    security.safeSetTextContent(title, 'Choose an Icon');

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

    // Library tabs
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = `
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--hermes-border);
    `;

    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
      min-height: 300px;
    `;

    // Create tabs for each icon library
    Object.keys(ICON_LIBRARIES).forEach((libraryKey, index) => {
      const library = ICON_LIBRARIES[libraryKey];
      
      const tab = document.createElement('button');
      tab.style.cssText = `
        padding: 10px 20px;
        border: none;
        background: ${index === 0 ? 'var(--hermes-highlight-bg)' : 'transparent'};
        color: ${index === 0 ? 'var(--hermes-highlight-text)' : 'var(--hermes-text)'};
        cursor: pointer;
        border-bottom: 2px solid ${index === 0 ? 'var(--hermes-highlight-bg)' : 'transparent'};
        transition: all 0.2s;
      `;
      security.safeSetTextContent(tab, library.name);

      tab.addEventListener('click', () => {
        // Update tab styles
        tabContainer.querySelectorAll('button').forEach(btn => {
          btn.style.background = 'transparent';
          btn.style.color = 'var(--hermes-text)';
          btn.style.borderBottomColor = 'transparent';
        });
        tab.style.background = 'var(--hermes-highlight-bg)';
        tab.style.color = 'var(--hermes-highlight-text)';
        tab.style.borderBottomColor = 'var(--hermes-highlight-bg)';

        // Show library icons
        showLibraryIcons(contentContainer, library, onSelect, overlay);
      });

      tabContainer.appendChild(tab);
    });

    dialog.appendChild(tabContainer);
    dialog.appendChild(contentContainer);

    // Show first library by default
    showLibraryIcons(contentContainer, ICON_LIBRARIES.material, onSelect, overlay);

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
   * Shows icons from a specific library
   * @param {HTMLElement} container - Container element
   * @param {Object} library - Icon library object
   * @param {Function} onSelect - Selection callback
   * @param {HTMLElement} overlay - Overlay element to close
   */
  function showLibraryIcons(container, library, onSelect, overlay) {
    container.innerHTML = '';

    // Add "no icon" option
    const noIconButton = createIconButton('', 'No Icon', () => {
      onSelect('');
      overlay.remove();
    });
    container.appendChild(noIconButton);

    // Add library icons
    library.icons.forEach(icon => {
      const iconButton = createIconButton(icon, icon, () => {
        onSelect(`${library.prefix}:${icon}`);
        overlay.remove();
      }, library.prefix);
      container.appendChild(iconButton);
    });
  }

  /**
   * Creates an icon button
   * @param {string} icon - Icon identifier
   * @param {string} tooltip - Tooltip text
   * @param {Function} onClick - Click handler
   * @param {string} prefix - Icon prefix
   * @returns {HTMLElement} - Icon button element
   */
  function createIconButton(icon, tooltip, onClick, prefix = '') {
    const button = document.createElement('button');
    button.style.cssText = `
      width: 50px;
      height: 50px;
      margin: 5px;
      border: 2px solid var(--hermes-border);
      border-radius: 8px;
      background: var(--hermes-button-bg);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2em;
      transition: all 0.2s;
    `;

    button.title = tooltip;

    if (icon) {
      if (prefix === 'material-icons') {
        button.innerHTML = `<i class="material-icons">${icon}</i>`;
      } else {
        security.safeSetTextContent(button, icon);
      }
    } else {
      security.safeSetTextContent(button, '∅');
      button.style.color = 'var(--hermes-disabled-text)';
    }

    button.addEventListener('mouseenter', () => {
      button.style.borderColor = 'var(--hermes-highlight-bg)';
      button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.borderColor = 'var(--hermes-border)';
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', onClick);

    return button;
  }

  /**
   * Renders an icon in an element
   * @param {HTMLElement} element - Target element
   * @param {string} iconCode - Icon code (prefix:icon)
   */
  function renderIcon(element, iconCode) {
    if (!element || !iconCode) {
      return;
    }

    const [prefix, icon] = iconCode.split(':');
    
    if (prefix === 'material-icons' && icon) {
      element.innerHTML = `<i class="material-icons">${icon}</i>`;
    } else if (icon) {
      security.safeSetTextContent(element, icon);
    }
  }

  /**
   * Gets the display text for an icon
   * @param {string} iconCode - Icon code (prefix:icon)
   * @returns {string} - Display text
   */
  function getIconDisplay(iconCode) {
    if (!iconCode) {
      return '';
    }

    const [prefix, icon] = iconCode.split(':');
    return icon || '';
  }

  /**
   * Adds icon selection to a section or page
   * @param {string} type - 'section' or 'page'
   * @param {string} id - Section or page ID
   * @param {HTMLElement} titleElement - Title element to add icon to
   */
  function addIconSelection(type, id, titleElement) {
    if (!titleElement) {
      return;
    }

    // Create icon container
    const iconContainer = document.createElement('span');
    iconContainer.className = 'icon-container';
    iconContainer.style.cssText = `
      display: inline-block;
      margin-right: 8px;
      cursor: pointer;
      min-width: 20px;
      text-align: center;
    `;

    // Load existing icon
    const savedIcon = localStorage.getItem(`nextnote_${type}_icon_${id}`);
    if (savedIcon) {
      renderIcon(iconContainer, savedIcon);
    } else {
      security.safeSetTextContent(iconContainer, '📄'); // Default icon
    }

    // Add click handler for icon selection
    iconContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      
      const picker = createIconPicker((selectedIcon) => {
        if (selectedIcon) {
          renderIcon(iconContainer, selectedIcon);
          localStorage.setItem(`nextnote_${type}_icon_${id}`, selectedIcon);
        } else {
          security.safeSetTextContent(iconContainer, '📄');
          localStorage.removeItem(`nextnote_${type}_icon_${id}`);
        }
        
        // Trigger update event
        document.dispatchEvent(new CustomEvent('nextnote:iconChanged', {
          detail: { type, id, icon: selectedIcon }
        }));
      }, savedIcon);
      
      document.body.appendChild(picker);
    });

    // Insert icon at the beginning of title
    titleElement.insertBefore(iconContainer, titleElement.firstChild);
  }

  // Public API
  return {
    createIconPicker,
    renderIcon,
    getIconDisplay,
    addIconSelection,
    
    // Library access (read-only)
    getLibraries: () => ({ ...ICON_LIBRARIES })
  };
})();
