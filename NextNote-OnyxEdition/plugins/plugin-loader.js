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
