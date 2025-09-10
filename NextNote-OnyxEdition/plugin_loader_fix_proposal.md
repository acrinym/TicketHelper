# Fix Proposal for `plugin-loader.js`

This document outlines the fix for the regression identified in the pull request comment.

## Current (Broken) Code

The `read_file` tool is showing the following content for `NextNote-OnyxEdition/plugins/plugin-loader.js`. This appears to be the original file content, not the version in the PR.

```javascript
// Plugin Loader
console.log('Plugin Loader Initialized');

const pluginContext = {
  register(name, fn) {
    console.log(`[NextNote Plugin] Registered: ${name}`);
    try { fn(); } catch (e) { console.error(`Error in plugin ${name}`, e); }
  }
};

(async () => {
  const pluginFolder = "plugins/";
  const pluginList = [
    "plugin-resource-manager.js",
    "plugin-fuzzysearch.js",
    "plugin-multinotebook.js",
    "plugin-quickactions.js",
    "plugin-tags.js",
    "plugin-backlinks.js",
    "plugin-templates.js",
    "plugin-reminders.js",
    "plugin-outline.js",
    "plugin-favorites.js",
    "plugin-history.js"
  ];

  for (const plugin of pluginList) {
    const path = pluginFolder + plugin;
    const script = document.createElement('script');
    script.src = path;
    script.defer = true;
    document.body.appendChild(script);
  }
})();
```

## Proposed Fixed Code

The following code will be used to overwrite `NextNote-OnyxEdition/plugins/plugin-loader.js`. This version incorporates the logic from the pull request (loading from `localStorage`) and adds the requested fix (falling back to a default list).

```javascript
// Plugin Loader
// Note: This file is being overwritten to fix a regression.
console.log('Plugin Loader Initialized');

// This event bus is for plugins to communicate with each other and the core app.
window.nextNoteEvents = {
    events: {},
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    },
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(data));
        }
    }
};

// This provides a standardized way for plugins to register themselves.
window.registerNextNotePlugin = (plugin) => {
    console.log(`[NextNote Plugin] Registered: ${plugin.name}`);
    try {
        const app = {
            // Pass the event bus to the plugin
            events: window.nextNoteEvents,
            // A helper function for plugins to get a standardized panel
            getNextNotePluginPanel: (pluginName) => {
                const containerId = 'plugin-container-' + pluginName.toLowerCase().replace(/\s/g, '-');
                let panel = document.getElementById(containerId);
                if (!panel) {
                    const parent = document.getElementById('plugin-panels');
                    if(parent){
                        const newPanel = document.createElement('div');
                        newPanel.id = containerId;
                        newPanel.className = 'plugin-panel';
                        newPanel.innerHTML = `<h3 class="plugin-panel-title">${pluginName}</h3>`;
                        parent.appendChild(newPanel);
                        panel = newPanel;
                    }
                }
                return panel;
            },
            showToast: (message, options = {}) => {
                // This is a placeholder for a toast notification system.
                // In a real app, this would be a more robust implementation.
                alert(message);
            }
        };
        plugin.onLoad(app);
    } catch (e) {
        console.error(`Error loading plugin ${plugin.name}`, e);
    }
};


(async () => {
    const pluginFolder = 'plugins/';

    // Default plugins for a fresh installation, mirroring the original plugin list.
    const defaultPlugins = [
      'plugin-resource-manager.js',
      'plugin-fuzzysearch.js',
      'plugin-multinotebook.js',
      'plugin-quickactions.js',
      'plugin-tags.js',
      'plugin-backlinks.js',
      'plugin-templates.js',
      'plugin-reminders.js',
      'plugin-outline.js',
      'plugin-favorites.js',
      'plugin-history.js',
      'plugin-diagrambuilder.js', // Also include the new plugins
      'plugin-fissio-library.js'
    ];

    // Use stored settings if they exist, otherwise fall back to the default list.
    const storedPlugins = localStorage.getItem("nextnote_enabled_plugins");
    const enabledPlugins = storedPlugins ? JSON.parse(storedPlugins) : defaultPlugins;

    for (const pluginFile of enabledPlugins) {
        // Ensure we don't try to load null/undefined entries
        if (pluginFile) {
            await new Promise((resolve, reject) => {
                const path = pluginFolder + pluginFile;
                const script = document.createElement('script');
                script.src = path;
                script.defer = true;
                script.onload = resolve;
                script.onerror = () => {
                    console.error(`Failed to load plugin: ${pluginFile}`);
                    reject(new Error(`Failed to load plugin: ${pluginFile}`));
                };
                document.body.appendChild(script);
            });
        }
    }
})();
```
