// plugins/plugin-quickactions.js

window.registerNextNotePlugin({
  name: "QuickActions",
  onLoad: function(app) {
    // --- Create Command Palette Modal ---
    const paletteOverlay = document.createElement("div");
    paletteOverlay.style.display = "none";
    paletteOverlay.style.position = "fixed";
    paletteOverlay.style.top = "0";
    paletteOverlay.style.left = "0";
    paletteOverlay.style.width = "100vw";
    paletteOverlay.style.height = "100vh";
    paletteOverlay.style.background = "rgba(0,0,0,0.25)";
    paletteOverlay.style.zIndex = "5000";
    paletteOverlay.id = "quickActionsOverlay";

    const paletteBox = document.createElement("div");
    paletteBox.style.background = "#222";
    paletteBox.style.color = "#fff";
    paletteBox.style.width = "420px";
    paletteBox.style.maxWidth = "97vw";
    paletteBox.style.margin = "10vh auto";
    paletteBox.style.borderRadius = "11px";
    paletteBox.style.padding = "20px";
    paletteBox.style.boxShadow = "0 6px 30px rgba(0,0,0,0.22)";
    paletteBox.style.position = "relative";
    paletteBox.style.display = "flex";
    paletteBox.style.flexDirection = "column";
    paletteBox.style.gap = "11px";
    paletteOverlay.appendChild(paletteBox);
    document.body.appendChild(paletteOverlay);

    // --- Palette Input Field ---
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Type a command or note title...";
    input.style.width = "100%";
    input.style.fontSize = "1.22em";
    input.style.padding = "8px 13px";
    input.style.borderRadius = "5px";
    input.style.border = "1px solid #666";
    paletteBox.appendChild(input);

    // --- Results Panel ---
    const resultsPanel = document.createElement("div");
    resultsPanel.style.maxHeight = "240px";
    resultsPanel.style.overflowY = "auto";
    resultsPanel.style.background = "rgba(0,0,0,0.10)";
    paletteBox.appendChild(resultsPanel);

    // --- Helper: Collect Command/Action List ---
    function getActions(query) {
      const actions = [
        {
          label: "📝 New Note",
          action: () => {
            if (typeof window.addPage === "function") window.addPage();
            closePalette();
          }
        },
        {
          label: "📂 New Section",
          action: () => {
            if (typeof window.addSection === "function") window.addSection();
            closePalette();
          }
        },
        {
          label: "💾 Save Current Page",
          action: () => {
            if (typeof window.saveCurrentPage === "function") window.saveCurrentPage();
            closePalette();
          }
        },
        {
          label: "👁️ Toggle Preview",
          action: () => {
            if (typeof window.togglePreview === "function") window.togglePreview();
            closePalette();
          }
        },
        {
          label: "📦 Export Notebook",
          action: () => {
            if (window._multiNotebook && typeof window._multiNotebook.exportCurrentNotebook === "function") {
              window._multiNotebook.exportCurrentNotebook();
            }
            closePalette();
          }
        },
        {
          label: "🗂️ Import Notebook",
          action: () => {
            document.querySelector('input[type="file"][accept*="json"]').click();
            closePalette();
          }
        },
        {
          label: "📎 Resource Manager",
          action: () => {
            const overlay = document.getElementById("resourceManagerOverlay");
            if (overlay) overlay.style.display = "block";
            closePalette();
          }
        },
        {
          label: "🔍 Fuzzy Search",
          action: () => {
            const search = document.getElementById("fuzzySearchBar");
            if (search) {
              search.focus();
              search.select();
            }
            closePalette();
          }
        }
      ];
      // Add jump-to-note/page actions:
      let notebook = (window.notebook || window._resourceNotebook || {});
      let sections = notebook.sections || window.sections || [];
      sections.forEach(section => {
        (section.pages || []).forEach(page => {
          actions.push({
            label: `➡️ ${page.title} (${section.name})`,
            action: () => {
              if (typeof window.selectPage === "function") {
                window.selectPage(page.id, section.id);
                closePalette();
              }
            }
          });
        });
      });
      // Filter if query present
      if (query && query.trim()) {
        const q = query.toLowerCase();
        return actions.filter(a => a.label.toLowerCase().includes(q));
      }
      return actions;
    }

    // --- Render Results ---
    function renderResults(query) {
      resultsPanel.innerHTML = "";
      const actions = getActions(query);
      if (actions.length === 0) {
        const none = document.createElement("div");
        none.textContent = "No matches.";
        none.style.color = "#aaa";
        none.style.padding = "13px";
        resultsPanel.appendChild(none);
        return;
      }
      actions.slice(0,16).forEach((action, i) => {
        const entry = document.createElement("div");
        entry.textContent = action.label;
        entry.tabIndex = 0;
        entry.style.padding = "8px 10px";
        entry.style.borderBottom = "1px solid #333";
        entry.style.cursor = "pointer";
        entry.style.background = i === 0 ? "#333" : "#222";
        entry.onmouseenter = () => {
          [...resultsPanel.children].forEach(x => (x.style.background = "#222"));
          entry.style.background = "#333";
          input._highlightedIndex = i;
        };
        entry.onclick = () => {
          action.action();
          closePalette();
        };
        resultsPanel.appendChild(entry);
      });
      input._highlightedIndex = 0;
    }

    // --- Palette Keyboard Navigation ---
    input.addEventListener("input", () => renderResults(input.value));
    input.addEventListener("keydown", function(e) {
      const entries = Array.from(resultsPanel.children);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        input._highlightedIndex = (input._highlightedIndex + 1) % entries.length;
        entries.forEach((x, i) => (x.style.background = i === input._highlightedIndex ? "#333" : "#222"));
        entries[input._highlightedIndex].focus();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        input._highlightedIndex = (input._highlightedIndex - 1 + entries.length) % entries.length;
        entries.forEach((x, i) => (x.style.background = i === input._highlightedIndex ? "#333" : "#222"));
        entries[input._highlightedIndex].focus();
      }
      if (e.key === "Enter") {
        if (entries[input._highlightedIndex]) {
          entries[input._highlightedIndex].click();
        }
      }
      if (e.key === "Escape") {
        closePalette();
      }
    });

    // --- Open/Close Functions ---
    function openPalette() {
      paletteOverlay.style.display = "block";
      input.value = "";
      renderResults("");
      input.focus();
      input._highlightedIndex = 0;
    }
    function closePalette() {
      paletteOverlay.style.display = "none";
    }

    // --- Global Hotkey: Ctrl+K (or Cmd+K) ---
    document.addEventListener("keydown", function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openPalette();
      }
    });

    // --- Click outside closes palette ---
    paletteOverlay.onclick = function(e) {
      if (e.target === paletteOverlay) closePalette();
    };

    // --- Expose to app for debug ---
    window._quickActions = { openPalette, closePalette };
  }
});
