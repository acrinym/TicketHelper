// plugins/plugin-backlinks.js

window.registerNextNotePlugin({
  name: "Backlinks",
  onLoad: function(app) {
    // --- Style for Backlinks Panel ---
    const style = document.createElement("style");
    style.textContent = `
      #backlinksPanel {
        background: #f2f6ff;
        border: 1px solid #bed1f7;
        border-radius: 7px;
        padding: 9px 13px 9px 13px;
        margin: 9px 0 8px 0;
        color: #225087;
        font-size: 14px;
        min-height: 32px;
        box-shadow: 0 1px 8px rgba(58,110,190,0.07);
      }
      #backlinksPanel h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        color: #1655b5;
        font-weight: bold;
      }
      .backlink-entry {
        margin: 3px 0 3px 0;
        cursor: pointer;
        border-bottom: 1px solid #e6e6e6;
        padding-bottom: 2px;
        transition: background 0.15s;
      }
      .backlink-entry:hover {
        background: #eaf4ff;
      }
    `;
    document.head.appendChild(style);

    // --- Utility: Get Notebook ---
    function getNotebook() {
      if (window.notebook) return window.notebook;
      if (window._resourceNotebook) return window._resourceNotebook;
      return { sections: window.sections || [], resources: [], settings: {} };
    }

    // --- Helper: Find all links (wiki-style [[Note Title]] or direct links) in Markdown ---
    function extractLinks(markdown) {
      const links = [];
      // Wiki links: [[...]]
      const wikiRE = /\[\[([^\]]+)\]\]/g;
      let match;
      while ((match = wikiRE.exec(markdown))) {
        links.push(match[1].trim());
      }
      // Markdown links: [label](link) -- not used for backlinks, but can be indexed if needed
      return links;
    }

    // --- Find pages that link to the given page title ---
    function findBacklinksForTitle(title) {
      const notebook = getNotebook();
      let backlinks = [];
      (notebook.sections || []).forEach(section => {
        (section.pages || []).forEach(page => {
          const links = extractLinks(page.markdown || "");
          if (links.includes(title)) {
            backlinks.push({
              section: section,
              page: page
            });
          }
        });
      });
      return backlinks;
    }

    // --- Backlinks Panel UI ---
    function renderBacklinksPanelForCurrentPage(page) {
      // Remove old panel if any
      const existing = document.getElementById("backlinksPanel");
      if (existing) existing.remove();

      // Only render if page exists
      if (!page || !page.title) return;

      const panel = document.createElement("div");
      panel.id = "backlinksPanel";

      const header = document.createElement("h4");
      header.textContent = "🔗 Backlinks";
      panel.appendChild(header);

      const backlinks = findBacklinksForTitle(page.title);

      if (!backlinks.length) {
        const none = document.createElement("div");
        none.textContent = "No backlinks found.";
        none.style.color = "#aaa";
        none.style.margin = "7px 0 0 0";
        panel.appendChild(none);
      } else {
        backlinks.forEach(entry => {
          const div = document.createElement("div");
          div.className = "backlink-entry";
          div.innerHTML = `<b>${entry.page.title}</b> <span style="font-size:12px;color:#888;">(${entry.section.name})</span>`;
          div.title = "Jump to page";
          div.onclick = function() {
            if (typeof window.selectPage === "function") {
              window.selectPage(entry.page.id, entry.section.id);
            }
          };
          panel.appendChild(div);
        });
      }

      // Insert panel after editor (or above, if you want)
      const editor = document.getElementById("quillEditorContainer");
      if (editor && editor.parentNode) {
        editor.parentNode.insertBefore(panel, editor.nextSibling);
      }
    }

    // --- Page-to-Page Wiki-Linking: clickable [[Note Title]] in editor preview ---
    function linkifyWikiLinks(text) {
      // Replace [[Note Title]] with clickable span
      return text.replace(/\[\[([^\]]+)\]\]/g, function(_, p1) {
        return `<span class="wikilink" data-link="${p1}">[[${p1}]]</span>`;
      });
    }

    // --- Add CSS for wikilinks in preview ---
    const wikiStyle = document.createElement("style");
    wikiStyle.textContent = `
      .wikilink {
        color: #3481ea;
        cursor: pointer;
        border-bottom: 1px dotted #3481ea;
        padding: 0 2px;
        border-radius: 2px;
        transition: background 0.1s;
      }
      .wikilink:hover {
        background: #ecf2fb;
      }
    `;
    document.head.appendChild(wikiStyle);

    // --- Make wikilinks clickable in preview ---
    function hookPreviewLinks() {
      setTimeout(() => {
        document.querySelectorAll('.wikilink').forEach(link => {
          link.onclick = function(e) {
            const title = link.getAttribute('data-link');
            // Find page by title
            const notebook = getNotebook();
            let found = false;
            (notebook.sections || []).forEach(section => {
              (section.pages || []).forEach(page => {
                if (page.title === title) {
                  if (typeof window.selectPage === "function") {
                    window.selectPage(page.id, section.id);
                    found = true;
                  }
                }
              });
            });
            if (!found) {
              alert('Note not found: ' + title);
            }
          };
        });
      }, 150);
    }

    // --- Patch your preview renderer (assume #preview innerHTML) ---
    const origRenderPreview = window.renderPreview;
    window.renderPreview = function(content) {
      // Call original if present
      if (typeof origRenderPreview === "function") origRenderPreview(content);
      // Then, post-process preview to linkify
      const preview = document.getElementById("preview");
      if (preview) {
        preview.innerHTML = linkifyWikiLinks(preview.innerHTML);
        hookPreviewLinks();
      }
    };

    // --- Patch selectPage to show backlinks for selected page ---
    const origSelectPage = window.selectPage;
    window.selectPage = function(pageId, sectionId) {
      if (typeof origSelectPage === "function") origSelectPage(pageId, sectionId);
      // Find current page object
      const notebook = getNotebook();
      let found = null;
      (notebook.sections || []).forEach(section => {
        (section.pages || []).forEach(page => {
          if (page.id === pageId) found = page;
        });
      });
      renderBacklinksPanelForCurrentPage(found);
    };

    // --- On initial load, show backlinks for the current page (if any) ---
    setTimeout(function() {
      if (window.currentPage && typeof renderBacklinksPanelForCurrentPage === "function") {
        renderBacklinksPanelForCurrentPage(window.currentPage);
      }
    }, 400);

    // --- Expose for debug
    window._backlinks = {
      extractLinks,
      findBacklinksForTitle,
      renderBacklinksPanelForCurrentPage,
      linkifyWikiLinks
    };
  }
});
