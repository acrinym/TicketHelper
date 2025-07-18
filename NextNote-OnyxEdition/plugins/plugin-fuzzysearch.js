// plugins/plugin-fuzzysearch.js

window.registerNextNotePlugin({
  name: "FuzzySearch",
  onLoad: function(app) {
    // --- Add Fuse.js to the window if not present (should be loaded from /lib/ or CDN) ---
    if (!window.Fuse) {
      const fuseScript = document.createElement("script");
      fuseScript.src = "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2";
      fuseScript.onload = setupFuzzySearch;
      document.body.appendChild(fuseScript);
    } else {
      setupFuzzySearch();
    }

    function setupFuzzySearch() {
      // --- Add search bar to toolbar ---
      const searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.placeholder = "🔍 Search notes…";
      searchInput.id = "fuzzySearchBar";
      searchInput.style.marginLeft = "1em";
      searchInput.style.padding = "3px 9px";
      searchInput.style.borderRadius = "5px";
      searchInput.style.border = "1px solid #aaa";
      searchInput.style.width = "200px";
      searchInput.autocomplete = "off";
      searchInput.title = "Fuzzy Search All Notes (Enter to jump, Esc to clear)";

      document.getElementById("toolbar").appendChild(searchInput);

      // --- Search Results Dropdown Panel ---
      const resultsPanel = document.createElement("div");
      resultsPanel.id = "fuzzySearchResults";
      resultsPanel.style.position = "absolute";
      resultsPanel.style.background = "#fff";
      resultsPanel.style.boxShadow = "0 2px 12px rgba(0,0,0,0.20)";
      resultsPanel.style.borderRadius = "5px";
      resultsPanel.style.border = "1px solid #ccc";
      resultsPanel.style.maxHeight = "300px";
      resultsPanel.style.overflowY = "auto";
      resultsPanel.style.width = "380px";
      resultsPanel.style.display = "none";
      resultsPanel.style.zIndex = "3002";
      resultsPanel.style.marginTop = "4px";
      document.body.appendChild(resultsPanel);

      // --- Helper: Get All Pages in All Sections (flattened) ---
      function getAllPages() {
        let allPages = [];
        let notebook = (window.notebook || window._resourceNotebook || {});
        let sections = notebook.sections || window.sections || [];
        sections.forEach(section => {
          (section.pages || []).forEach(page => {
            allPages.push({
              section: section.name,
              sectionId: section.id,
              pageTitle: page.title,
              pageId: page.id,
              content: page.markdown || "",
              modified: page.modified,
              created: page.created
            });
          });
        });
        return allPages;
      }

      // --- Helper: Jump to a Page ---
      function jumpToPage(pageId, sectionId) {
        if (typeof window.selectPage === "function") {
          window.selectPage(pageId, sectionId);
        } else {
          // If selectPage is not present, do nothing or show a warning
          alert("Jump function not found (selectPage).");
        }
      }

      // --- Build and Run Search ---
      function runFuzzySearch(query) {
        const allPages = getAllPages();
        if (!window.Fuse || allPages.length === 0) return [];
        const fuse = new window.Fuse(allPages, {
          keys: [
            { name: "pageTitle", weight: 0.5 },
            { name: "content", weight: 0.3 },
            { name: "section", weight: 0.2 }
          ],
          threshold: 0.33,
          includeScore: true,
          ignoreLocation: true,
          minMatchCharLength: 2
        });
        return fuse.search(query, { limit: 12 });
      }

      // --- Render Results Panel ---
      function renderResults(results, query) {
        resultsPanel.innerHTML = "";
        if (!results.length) {
          const noResult = document.createElement("div");
          noResult.textContent = query.trim()
            ? `No results for "${query.trim()}".`
            : "Type to search notes…";
          noResult.style.color = "#888";
          noResult.style.padding = "15px";
          resultsPanel.appendChild(noResult);
          return;
        }
        results.forEach(r => {
          const res = r.item;
          const entry = document.createElement("div");
          entry.className = "fuzzy-search-result";
          entry.style.padding = "9px 11px";
          entry.style.borderBottom = "1px solid #eee";
          entry.style.cursor = "pointer";
          entry.style.display = "flex";
          entry.style.flexDirection = "column";
          entry.style.background = "#fff";
          entry.onmouseenter = () => (entry.style.background = "#f0f7ff");
          entry.onmouseleave = () => (entry.style.background = "#fff");
          entry.onclick = () => {
            resultsPanel.style.display = "none";
            jumpToPage(res.pageId, res.sectionId);
          };
          const titleSpan = document.createElement("span");
          titleSpan.style.fontWeight = "bold";
          titleSpan.style.color = "#1676df";
          titleSpan.textContent = res.pageTitle || "[Untitled]";
          const sectionSpan = document.createElement("span");
          sectionSpan.style.fontSize = "13px";
          sectionSpan.style.color = "#888";
          sectionSpan.textContent = `Section: ${res.section}`;
          entry.appendChild(titleSpan);
          entry.appendChild(sectionSpan);
          // Show snippet if match in content
          if (r.matches && r.matches.some(m => m.key === "content")) {
            const snippet = document.createElement("span");
            snippet.style.fontSize = "12px";
            snippet.style.color = "#444";
            const idx = res.content
              .toLowerCase()
              .indexOf(query.trim().toLowerCase());
            snippet.textContent =
              idx > -1
                ? "..." +
                  res.content.substring(
                    Math.max(0, idx - 20),
                    Math.min(res.content.length, idx + 50)
                  ) +
                  "..."
                : "";
            entry.appendChild(snippet);
          }
          resultsPanel.appendChild(entry);
        });
      }

      // --- Position Results Panel under Input ---
      function positionPanel() {
        const rect = searchInput.getBoundingClientRect();
        resultsPanel.style.left = rect.left + "px";
        resultsPanel.style.top = rect.bottom + window.scrollY + "px";
      }

      // --- Event: On Search Input ---
      searchInput.addEventListener("input", function () {
        const query = searchInput.value.trim();
        if (!query || query.length < 2) {
          resultsPanel.style.display = "none";
          return;
        }
        positionPanel();
        const results = runFuzzySearch(query);
        renderResults(results, query);
        resultsPanel.style.display = "block";
      });

      // --- Keyboard Nav ---
      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          resultsPanel.style.display = "none";
          searchInput.value = "";
          searchInput.blur();
        }
        if (e.key === "Enter") {
          // If first result exists, jump
          const query = searchInput.value.trim();
          const results = runFuzzySearch(query);
          if (results && results.length > 0) {
            resultsPanel.style.display = "none";
            jumpToPage(results[0].item.pageId, results[0].item.sectionId);
            searchInput.blur();
          }
        }
      });

      // --- Hide Results on click outside ---
      document.addEventListener("mousedown", function (e) {
        if (
          e.target !== searchInput &&
          !resultsPanel.contains(e.target)
        ) {
          resultsPanel.style.display = "none";
        }
      });

      // --- Update Results when notebook changes ---
      if (window.addEventListener) {
        window.addEventListener("notebookUpdated", function () {
          // No-op; search index is rebuilt on each input.
        });
      }
    }
  }
});
