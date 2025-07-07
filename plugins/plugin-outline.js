// plugins/plugin-outline.js

window.registerNextNotePlugin({
  name: "Outline",
  onLoad: function(app) {
    // --- Style for Outline Panel ---
    const style = document.createElement("style");
    style.textContent = `
      #outlinePanel {
        background: #f6f7fb;
        border: 1px solid #dbe2ef;
        border-radius: 8px;
        padding: 10px 12px 8px 12px;
        margin: 9px 0 10px 0;
        color: #285170;
        font-size: 14px;
        min-height: 26px;
        box-shadow: 0 1px 6px rgba(88,120,176,0.10);
        max-height: 310px;
        overflow-y: auto;
      }
      #outlinePanel h4 {
        margin: 0 0 7px 0;
        font-size: 14px;
        color: #3977b8;
        font-weight: bold;
      }
      .outline-entry {
        cursor: pointer;
        margin: 2px 0 2px 0;
        padding-left: 6px;
        border-left: 2px solid #bed4ec;
        font-size: 13px;
        color: #2c4f74;
        transition: background 0.12s;
        border-radius: 3px;
      }
      .outline-entry:hover {
        background: #ebf1fb;
      }
      .outline-h1 { font-weight: bold; padding-left: 0; border-left: none; }
      .outline-h2 { padding-left: 16px; }
      .outline-h3 { padding-left: 32px; }
      .outline-h4 { padding-left: 48px; }
      .outline-h5 { padding-left: 64px; }
      .outline-h6 { padding-left: 80px; }
    `;
    document.head.appendChild(style);

    // --- UI: Outline Button in Toolbar ---
    const outlineBtn = document.createElement("button");
    outlineBtn.textContent = "🧭 Outline";
    outlineBtn.title = "Show Outline/Headings";
    outlineBtn.style.marginLeft = "0.5em";
    document.getElementById("toolbar").appendChild(outlineBtn);

    // --- Outline Panel ---
    let outlinePanel = document.createElement("div");
    outlinePanel.id = "outlinePanel";
    outlinePanel.style.display = "none";

    // Place after editor
    const editor = document.getElementById("quillEditorContainer");
    if (editor && editor.parentNode) {
      editor.parentNode.insertBefore(outlinePanel, editor.nextSibling);
    }

    // --- Parse Markdown for Headings ---
    function getOutlineFromPage(page) {
      const headings = [];
      if (!page || !page.markdown) return headings;
      // Use regex to find headings
      const lines = page.markdown.split('\n');
      lines.forEach(line => {
        const m = line.match(/^(#+)\s+(.*)$/);
        if (m) {
          const level = m[1].length;
          headings.push({
            level,
            text: m[2].trim(),
            raw: line
          });
        }
      });
      return headings;
    }

    // --- Render Outline Panel ---
    function renderOutlinePanel(page) {
      outlinePanel.innerHTML = "";
      if (!page) {
        outlinePanel.style.display = "none";
        return;
      }
      const headings = getOutlineFromPage(page);
      const header = document.createElement("h4");
      header.textContent = "Outline";
      outlinePanel.appendChild(header);

      if (!headings.length) {
        const none = document.createElement("div");
        none.textContent = "No headings found in this note.";
        none.style.color = "#888";
        none.style.marginTop = "7px";
        outlinePanel.appendChild(none);
        outlinePanel.style.display = "block";
        return;
      }

      headings.forEach(h => {
        const entry = document.createElement("div");
        entry.className = `outline-entry outline-h${h.level}`;
        entry.textContent = h.text;
        entry.title = "Jump to heading";
        entry.onclick = function() {
          scrollToHeading(h.text, h.level);
        };
        outlinePanel.appendChild(entry);
      });
      outlinePanel.style.display = "block";
    }

    // --- Scroll to Heading in Editor Preview ---
    function scrollToHeading(text, level) {
      // Look for corresponding heading in preview
      const preview = document.getElementById("preview");
      if (preview) {
        // Try <h1>..<h6> tags with innerText === text
        for (let i = 1; i <= 6; ++i) {
          if (i !== level) continue;
          const els = preview.querySelectorAll(`h${i}`);
          for (let el of els) {
            if (el.innerText.trim() === text) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              el.style.background = "#e5eefd";
              setTimeout(() => (el.style.background = ""), 900);
              return;
            }
          }
        }
      }
    }

    // --- Button opens/closes outline ---
    let outlineOpen = false;
    outlineBtn.onclick = function() {
      outlineOpen = !outlineOpen;
      outlinePanel.style.display = outlineOpen ? "block" : "none";
    };

    // --- Hook selectPage to update outline ---
    const origSelectPage = window.selectPage;
    window.selectPage = function(pageId, sectionId) {
      if (typeof origSelectPage === "function") origSelectPage(pageId, sectionId);
      const notebook = window.notebook || window._resourceNotebook || {};
      let page = null;
      (notebook.sections || []).forEach(section => {
        (section.pages || []).forEach(p => {
          if (p.id === pageId) page = p;
        });
      });
      if (page) renderOutlinePanel(page);
    };

    // --- On load, render for current page (if any) ---
    setTimeout(function() {
      if (window.currentPage && typeof renderOutlinePanel === "function") {
        renderOutlinePanel(window.currentPage);
      }
    }, 400);

    // Expose for debug
    window._outline = {
      getOutlineFromPage,
      renderOutlinePanel
    };
  }
});
