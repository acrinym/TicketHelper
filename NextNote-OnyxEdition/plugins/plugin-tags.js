// plugins/plugin-tags.js

window.registerNextNotePlugin({
  name: "Tags",
  onLoad: function(app) {
    // --- Style for Tag Elements ---
    const tagStyle = document.createElement("style");
    tagStyle.textContent = `
      .tag-chip {
        display: inline-block;
        background: #e0eaff;
        color: #1557b2;
        border-radius: 8px;
        padding: 2px 10px 2px 8px;
        margin: 0 5px 4px 0;
        font-size: 13px;
        line-height: 1.5;
        cursor: pointer;
        transition: background 0.12s;
        border: 1px solid #b5cfff;
      }
      .tag-chip:hover {
        background: #cbe2ff;
      }
      .tag-delete {
        margin-left: 4px;
        font-size: 12px;
        color: #d02b2b;
        cursor: pointer;
      }
      #tagSidebarHeader {
        font-weight: bold;
        font-size: 15px;
        margin-top: 8px;
        margin-bottom: 3px;
      }
      #tagsSidebar {
        margin: 10px 0 10px 0;
        border-top: 1px solid #dbe2ee;
        padding-top: 10px;
        min-height: 30px;
      }
    `;
    document.head.appendChild(tagStyle);

    // --- Create Tag Sidebar ---
    const sidebar = document.getElementById("sidebar");
    const tagHeader = document.createElement("div");
    tagHeader.id = "tagSidebarHeader";
    tagHeader.textContent = "Tags";
    sidebar.appendChild(tagHeader);

    const tagsSidebar = document.createElement("div");
    tagsSidebar.id = "tagsSidebar";
    sidebar.appendChild(tagsSidebar);

    // --- Tag Filter Input ---
    const tagFilterInput = document.createElement("input");
    tagFilterInput.type = "text";
    tagFilterInput.placeholder = "Filter notes by tag…";
    tagFilterInput.style.width = "98%";
    tagFilterInput.style.margin = "2px 0 7px 0";
    tagsSidebar.appendChild(tagFilterInput);

    // --- Helper: Get Tag Data Structure ---
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

    function getTags() {
      // Gather all unique tags from all pages
      const tags = new Set();
      const notebook = getNotebook();
      (notebook.sections || []).forEach(section => {
        (section.pages || []).forEach(page => {
          (page.tags || []).forEach(tag => tags.add(tag));
        });
      });
      return Array.from(tags).sort();
    }

    function getPagesByTag(tag) {
      const notebook = getNotebook();
      let results = [];
      (notebook.sections || []).forEach(section => {
        (section.pages || []).forEach(page => {
          if ((page.tags || []).includes(tag)) {
            results.push({
              section: section,
              page: page
            });
          }
        });
      });
      return results;
    }

    // --- Sidebar Tag Cloud Rendering ---
    function renderTagSidebar() {
      // Remove previous tags
      Array.from(tagsSidebar.querySelectorAll(".tag-chip, .tag-group")).forEach(n => n.remove());
      const tags = getTags();
      if (tags.length === 0) {
        const noTags = document.createElement("div");
        noTags.textContent = "No tags yet.";
        noTags.style.color = "#888";
        tagsSidebar.appendChild(noTags);
        return;
      }
      tags.forEach(tag => {
        const chip = document.createElement("span");
        chip.className = "tag-chip";
        chip.textContent = tag;
        chip.onclick = function() {
          // Filter sections/pages to only those with this tag
          filterNotesByTag(tag);
        };
        tagsSidebar.appendChild(chip);
      });
    }

    // --- Tag Filtering Logic ---
    function filterNotesByTag(tag) {
      // Visually select notes/pages in sidebar that match the tag
      const notebook = getNotebook();
      const pageEls = document.querySelectorAll(".page-title");
      pageEls.forEach(el => el.style.background = "");
      (notebook.sections || []).forEach(section => {
        (section.pages || []).forEach(page => {
          if ((page.tags || []).includes(tag)) {
            const el = document.getElementById(`page-${page.id}`);
            if (el) {
              el.style.background = "#fff8c9";
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        });
      });
    }

    tagFilterInput.addEventListener("input", function() {
      const query = tagFilterInput.value.trim().toLowerCase();
      if (!query) {
        renderTagSidebar();
        return;
      }
      Array.from(tagsSidebar.querySelectorAll(".tag-chip")).forEach(chip => {
        chip.style.display = chip.textContent.toLowerCase().includes(query) ? "" : "none";
      });
    });

    // --- Add Tag UI to Page Editor ---
    function renderTagEditorForCurrentPage(page) {
      let tagEditor = document.getElementById("tagEditor");
      if (!tagEditor) {
        tagEditor = document.createElement("div");
        tagEditor.id = "tagEditor";
        tagEditor.style.margin = "7px 0 8px 0";
        tagEditor.style.padding = "4px";
        tagEditor.style.background = "#f4f8ff";
        tagEditor.style.borderRadius = "5px";
        tagEditor.innerHTML = `<b>Tags:</b> `;
        // Add to editor panel
        document.getElementById("quillEditorContainer").parentNode.insertBefore(tagEditor, document.getElementById("quillEditorContainer"));
      } else {
        tagEditor.innerHTML = `<b>Tags:</b> `;
      }
      // Existing tags
      (page.tags || []).forEach(tag => {
        const chip = document.createElement("span");
        chip.className = "tag-chip";
        chip.textContent = tag;
        // Tag delete button
        const del = document.createElement("span");
        del.textContent = "✕";
        del.className = "tag-delete";
        del.title = "Remove tag";
        del.onclick = function(e) {
          e.stopPropagation();
          removeTagFromPage(page, tag);
        };
        chip.appendChild(del);
        tagEditor.appendChild(chip);
      });
      // Add tag input
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Add tag…";
      input.style.marginLeft = "5px";
      input.style.fontSize = "12px";
      input.style.border = "1px solid #b5cfff";
      input.style.borderRadius = "4px";
      input.style.padding = "2px 7px";
      input.style.width = "95px";
      input.onkeydown = function(e) {
        if (e.key === "Enter" && input.value.trim()) {
          addTagToPage(page, input.value.trim());
          input.value = "";
        }
      };
      tagEditor.appendChild(input);
    }

    // --- Tag CRUD ---
    function addTagToPage(page, tag) {
      if (!page.tags) page.tags = [];
      if (!page.tags.includes(tag)) {
        page.tags.push(tag);
        saveNotebook();
        renderTagEditorForCurrentPage(page);
        renderTagSidebar();
      }
    }
    function removeTagFromPage(page, tag) {
      if (!page.tags) return;
      page.tags = page.tags.filter(t => t !== tag);
      saveNotebook();
      renderTagEditorForCurrentPage(page);
      renderTagSidebar();
    }

    function saveNotebook() {
      if (window._multiNotebook && typeof window._multiNotebook.saveNotebook === "function") {
        window._multiNotebook.saveNotebook(window._multiNotebook.currentNotebookIndex || 0);
      }
    }

    // --- Hook into page change to show tag editor ---
    const originalSelectPage = window.selectPage;
    window.selectPage = function(pageId, sectionId) {
      if (typeof originalSelectPage === "function") originalSelectPage(pageId, sectionId);
      const notebook = getNotebook();
      let page = null;
      (notebook.sections || []).forEach(section => {
        (section.pages || []).forEach(p => {
          if (p.id === pageId) page = p;
        });
      });
      if (page) renderTagEditorForCurrentPage(page);
    };

    // --- On load, render tag cloud ---
    renderTagSidebar();
    // On page load, if there is a current page, show its tags
    setTimeout(function() {
      if (window.currentPage && typeof renderTagEditorForCurrentPage === "function") {
        renderTagEditorForCurrentPage(window.currentPage);
      }
    }, 300);
    // Expose for debug
    window._tags = {
      getTags,
      getPagesByTag,
      renderTagSidebar,
      addTagToPage,
      removeTagFromPage
    };
  }
});
