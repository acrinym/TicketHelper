// plugins/plugin-multinotebook.js

window.registerNextNotePlugin({
  name: "MultiNotebook",
  onLoad: function(app) {
    // --- Add Multi-Notebook Dropdown to Toolbar ---
    const notebookSelect = document.createElement("select");
    notebookSelect.id = "notebookSelect";
    notebookSelect.style.marginLeft = "1em";
    notebookSelect.title = "Switch Notebook";

    // Populate with default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "📒 Current Notebook";
    notebookSelect.appendChild(defaultOption);

    // Notebook state in memory
    let notebooks = []; // {id, name, data}
    let currentNotebookIndex = 0;

    // UI Buttons
    const importBtn = document.createElement("button");
    importBtn.textContent = "🗂️ Import";
    importBtn.title = "Import Notebook (.json/.zip)";
    importBtn.onclick = function() {
      importFileInput.click();
    };

    const exportBtn = document.createElement("button");
    exportBtn.textContent = "💾 Export";
    exportBtn.title = "Export Current Notebook (.json)";
    exportBtn.onclick = function() {
      exportCurrentNotebook();
    };

    const newBtn = document.createElement("button");
    newBtn.textContent = "➕ New";
    newBtn.title = "Create New Notebook";
    newBtn.onclick = function() {
      createNewNotebook();
    };

    const importFileInput = document.createElement("input");
    importFileInput.type = "file";
    importFileInput.accept = ".json,application/json";
    importFileInput.style.display = "none";
    importFileInput.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const imported = JSON.parse(event.target.result);
          addNotebook(imported.title || "Imported Notebook", imported);
          alert("Notebook imported!");
        } catch (err) {
          alert("Failed to import notebook: " + err);
        }
      };
      reader.readAsText(file);
    };

    // Append controls to toolbar
    document.getElementById("toolbar").appendChild(notebookSelect);
    document.getElementById("toolbar").appendChild(importBtn);
    document.getElementById("toolbar").appendChild(exportBtn);
    document.getElementById("toolbar").appendChild(newBtn);
    document.body.appendChild(importFileInput);

    // --- Core Notebook Functions ---

    function addNotebook(name, data) {
      const id = crypto.randomUUID();
      notebooks.push({id, name, data});
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = "📒 " + name;
      notebookSelect.appendChild(opt);
      notebookSelect.value = id;
      currentNotebookIndex = notebooks.length - 1;
      loadNotebook(currentNotebookIndex);
    }

    function createNewNotebook() {
      const name = prompt("Notebook name?");
      if (!name) return;
      const emptyData = {
        title: name,
        sections: [],
        resources: [],
        settings: {},
        id: crypto.randomUUID(),
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
      addNotebook(name, emptyData);
    }

    function saveNotebook(index) {
      // This would persist to disk/localStorage if desired (not implemented here)
      if (notebooks[index]) {
        notebooks[index].data = serializeCurrentNotebook();
      }
    }

    function loadNotebook(index) {
      if (notebooks[index]) {
        const notebook = notebooks[index].data;
        // If your app uses window.notebook, window.sections, etc
        if (window.notebook) {
          Object.assign(window.notebook, notebook);
        } else {
          window.notebook = notebook;
        }
        window.sections = notebook.sections;
        if (typeof window.renderSections === "function") {
          window.renderSections();
        }
        if (typeof window.refreshCurrentPage === "function") {
          window.refreshCurrentPage();
        }
        if (typeof window.dispatchEvent === "function") {
          window.dispatchEvent(new Event("notebookUpdated"));
        }
      }
    }

    function exportCurrentNotebook() {
      const notebook = serializeCurrentNotebook();
      const str = JSON.stringify(notebook, null, 2);
      const blob = new Blob([str], {type:"application/json"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (notebook.title || "notebook") + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function serializeCurrentNotebook() {
      if (window.notebook) {
        return window.notebook;
      }
      // Fallback to old structure
      return {
        title: "Legacy Notebook",
        sections: window.sections || [],
        resources: (window.notebook && window.notebook.resources) || [],
        settings: (window.notebook && window.notebook.settings) || {},
        id: window.notebook && window.notebook.id || crypto.randomUUID(),
        created: window.notebook && window.notebook.created || new Date().toISOString(),
        modified: new Date().toISOString()
      };
    }

    // --- Notebook Switcher Handler ---
    notebookSelect.onchange = function() {
      const idx = notebooks.findIndex(n => n.id === notebookSelect.value);
      if (idx > -1) {
        currentNotebookIndex = idx;
        loadNotebook(idx);
      }
    };

    // --- Initial Population: create default notebook if none loaded ---
    if (typeof window.notebook === "object" && window.notebook.sections) {
      addNotebook(window.notebook.title || "Default Notebook", window.notebook);
    } else if (window.sections) {
      addNotebook("Legacy", {
        title: "Legacy Notebook",
        sections: window.sections,
        resources: [],
        settings: {},
        id: crypto.randomUUID(),
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      });
    } else {
      createNewNotebook();
    }

    // --- Expose for debugging ---
    window._multiNotebook = {
      notebooks,
      addNotebook,
      createNewNotebook,
      saveNotebook,
      loadNotebook,
      exportCurrentNotebook,
      serializeCurrentNotebook
    };
  }
});
