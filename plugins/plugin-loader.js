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
  window.nextNotePlugins.forEach(p => {
    try {
      if (typeof p.onLoad === 'function') {
        p.onLoad(window);
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
  const pluginList = [
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
    'plugin-history.js'
  ];

  for (const plugin of pluginList) {
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
