// plugins/plugin-favorites.js

window.registerNextNotePlugin({
  name: "Favorites",
  onLoad: function(app) {
    // --- Add "Star" Button to Editor Toolbar ---
    const favBtn = document.createElement("button");
    favBtn.textContent = "⭐";
    favBtn.title = "Star/Unstar this page";
    favBtn.style.marginLeft = "0.5em";
    document.getElementById("toolbar").appendChild(favBtn);

    // --- Add Favorites Sidebar Section ---
    const sidebar = document.getElementById("sidebar");
    const favHeader = document.createElement("div");
    favHeader.textContent = "⭐ Favorites";
    favHeader.style.fontWeight = "bold";
    favHeader.style.margin = "18px 0 3px 0";
    sidebar.appendChild(favHeader);

    const favList = document.createElement("div");
    favList.id = "favList";
    sidebar.appendChild(favList);

    // --- Helpers for Favorites Data ---
    function getNotebook() {
      if (window.notebook) return window.notebook;
      if (window._resourceNotebook) return window._resourceNotebook;
      if (window.sections && Array.isArray(window.sections)) {
        return { sections: window.sections, resources: [], settings: {} };
      }
      // Try to get sections from global scope
      if (typeof window.getSections === 'function') {
        const sections = window.getSections();
        if (sections && Array.isArray(sections)) {
          return { sections: sections, resources: [], settings: {} };
        }
      }
      return { sections: [], resources: [], settings: {} };
    }

    function getFavoritePages() {
      const notebook = getNotebook();
      const favorites = [];
      const sections = Array.isArray(notebook.sections) ? notebook.sections : [];
      sections.forEach(section => {
        const pages = Array.isArray(section.pages) ? section.pages : [];
        pages.forEach(page => {
          if (page.favorited) {
            favorites.push({section, page});
          }
        });
      });
      return favorites;
    }

    function toggleFavorite(page) {
      page.favorited = !page.favorited;
      saveNotebook();
      renderFavoritesSidebar();
      updateStarButton(page);
    }

    function saveNotebook() {
      if (window._multiNotebook && typeof window._multiNotebook.saveNotebook === "function") {
        window._multiNotebook.saveNotebook(window._multiNotebook.currentNotebookIndex || 0);
      }
    }

    function updateStarButton(page) {
      if (!page) return;
      favBtn.textContent = page.favorited ? "⭐" : "☆";
      favBtn.style.color = page.favorited ? "#e2b000" : "#444";
    }

    function renderFavoritesSidebar() {
      favList.innerHTML = "";
      const favorites = getFavoritePages();
      if (!favorites.length) {
        favList.innerHTML = "<div style='color:#888;'>No favorites yet.</div>";
        return;
      }
      favorites.forEach(({section, page}) => {
        const entry = document.createElement("div");
        entry.style.cursor = "pointer";
        entry.style.fontSize = "14px";
        entry.style.margin = "2px 0";
        entry.innerHTML = `<span style="color:#e2b000;">★</span> ${page.title} <span style="color:#bbb;font-size:12px;">(${section.name})</span>`;
        entry.onclick = function() {
          if (typeof window.selectPage === "function") {
            window.selectPage(page.id, section.id);
          }
        };
        favList.appendChild(entry);
      });
    }

    // --- Hook up button to current page ---
    favBtn.onclick = function() {
      const notebook = getNotebook();
      let page = null;
      const sections = Array.isArray(notebook.sections) ? notebook.sections : [];
      sections.forEach(section => {
        const pages = Array.isArray(section.pages) ? section.pages : [];
        pages.forEach(p => {
          if (p.id === window.currentPage?.id) page = p;
        });
      });
      if (page) toggleFavorite(page);
    };

    // --- Patch selectPage to update star button ---
    const origSelectPage = window.selectPage;
    window.selectPage = function(pageId, sectionId) {
      if (typeof origSelectPage === "function") origSelectPage(pageId, sectionId);
      const notebook = getNotebook();
      let page = null;
      const sections = Array.isArray(notebook.sections) ? notebook.sections : [];
      sections.forEach(section => {
        const pages = Array.isArray(section.pages) ? section.pages : [];
        pages.forEach(p => {
          if (p.id === pageId) page = p;
        });
      });
      updateStarButton(page);
    };

    // --- On load, show star for current page and render sidebar ---
    setTimeout(function() {
      if (window.currentPage && typeof updateStarButton === "function") {
        updateStarButton(window.currentPage);
      }
      renderFavoritesSidebar();
    }, 400);

    // Expose for debug
    window._favorites = {
      getFavoritePages,
      renderFavoritesSidebar,
      toggleFavorite
    };
  }
});
