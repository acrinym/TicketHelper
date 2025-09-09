// Plugin Loader
console.log('Plugin Loader Initialized');

// Store registered plugins
window.nextNotePlugins = [];

// API exposed to individual plugin scripts
window.registerNextNotePlugin = function(plugin) {
  if (!plugin || !plugin.name) return;
  console.log(`[NextNote Plugin] Registered: ${plugin.name}`);
  window.nextNotePlugins.push(plugin);
};

let nextNoteReady = false;
let pluginsLoaded = false;

function runPlugins() {
  if (!(nextNoteReady && pluginsLoaded)) return;

  const app = {
      quill: window.quill,
      getNextNotePluginPanel: window.getNextNotePluginPanel,
      events: window.nextNoteEvents,
      // Add other APIs here in the future
  };

  window.nextNotePlugins.forEach(p => {
    try {
      if (typeof p.onLoad === 'function') {
        p.onLoad(app);
      }
    } catch (e) {
      console.error(`Error in plugin ${p.name}`, e);
    }
  });
}

document.addEventListener('NextNoteReady', () => {
  nextNoteReady = true;
  runPlugins();
});

(async () => {
  const pluginFolder = 'plugins/';
  const enabledPlugins = JSON.parse(localStorage.getItem("nextnote_enabled_plugins")) || [];

  for (const plugin of enabledPlugins) {
    await new Promise(resolve => {
      const path = pluginFolder + plugin;
      const script = document.createElement('script');
      script.src = path;
      script.onload = resolve;
      script.onerror = resolve;
      document.body.appendChild(script);
    });
  }

  pluginsLoaded = true;
  runPlugins();
})();
