// plugins/plugin-reminders.js

window.registerNextNotePlugin({
  name: "Reminders",
  onLoad: function(app) {
    // --- Style for To-Do Panel ---
    const style = document.createElement("style");
    style.textContent = `
      #remindersPanel {
        background: #fdf8e1;
        border: 1px solid #edd895;
        border-radius: 7px;
        padding: 10px 13px 8px 13px;
        margin: 10px 0 10px 0;
        color: #725409;
        font-size: 14px;
        min-height: 32px;
        box-shadow: 0 1px 8px rgba(186,158,70,0.10);
      }
      #remindersPanel h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        color: #c09613;
        font-weight: bold;
      }
      .reminder-entry {
        display: flex;
        align-items: center;
        margin: 2px 0 2px 0;
        gap: 5px;
      }
      .reminder-entry input[type=checkbox] {
        accent-color: #c0a409;
      }
      .reminder-delete {
        color: #b52121;
        font-size: 15px;
        background: none;
        border: none;
        cursor: pointer;
        margin-left: 7px;
      }
    `;
    document.head.appendChild(style);

    // --- UI: Add Reminders Panel under editor ---
    function renderRemindersPanel(page) {
      let panel = document.getElementById("remindersPanel");
      if (panel) panel.remove();
      if (!page) return;

      panel = document.createElement("div");
      panel.id = "remindersPanel";

      const header = document.createElement("h4");
      header.textContent = "⏰ Reminders / To-Dos";
      panel.appendChild(header);

      // Add input for new todo
      const inputWrap = document.createElement("div");
      inputWrap.style.marginBottom = "6px";
      const newInput = document.createElement("input");
      newInput.type = "text";
      newInput.placeholder = "Add new reminder or to-do…";
      newInput.style.width = "85%";
      newInput.style.fontSize = "13px";
      newInput.onkeydown = function(e) {
        if (e.key === "Enter" && newInput.value.trim()) {
          addReminder(page, newInput.value.trim());
          newInput.value = "";
        }
      };
      inputWrap.appendChild(newInput);
      panel.appendChild(inputWrap);

      // Render existing reminders
      (page.reminders || []).forEach((rem, idx) => {
        const entry = document.createElement("div");
        entry.className = "reminder-entry";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!rem.done;
        checkbox.onchange = function() {
          page.reminders[idx].done = checkbox.checked;
          saveNotebook();
          renderRemindersPanel(page);
        };
        entry.appendChild(checkbox);

        const label = document.createElement("span");
        label.textContent = rem.text;
        label.style.textDecoration = rem.done ? "line-through" : "";
        label.style.color = rem.done ? "#aaa" : "#725409";
        entry.appendChild(label);

        // Delete button
        const delBtn = document.createElement("button");
        delBtn.textContent = "✕";
        delBtn.className = "reminder-delete";
        delBtn.title = "Delete reminder";
        delBtn.onclick = function() {
          if (confirm("Delete this reminder?")) {
            page.reminders.splice(idx, 1);
            saveNotebook();
            renderRemindersPanel(page);
          }
        };
        entry.appendChild(delBtn);

        panel.appendChild(entry);
      });

      // Insert below editor
      const editor = document.getElementById("quillEditorContainer");
      if (editor && editor.parentNode) {
        editor.parentNode.insertBefore(panel, editor.nextSibling);
      }
    }

    function addReminder(page, text) {
      if (!page.reminders) page.reminders = [];
      page.reminders.push({ text, done: false, created: new Date().toISOString() });
      saveNotebook();
      renderRemindersPanel(page);
    }

    function saveNotebook() {
      if (window._multiNotebook && typeof window._multiNotebook.saveNotebook === "function") {
        window._multiNotebook.saveNotebook(window._multiNotebook.currentNotebookIndex || 0);
      }
    }

    // --- Hook into page select to show reminders ---
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
      if (page) renderRemindersPanel(page);
    };

    // --- On load, render for current page (if any) ---
    setTimeout(function() {
      if (window.currentPage && typeof renderRemindersPanel === "function") {
        renderRemindersPanel(window.currentPage);
      }
    }, 400);

    // Expose for debug
    window._reminders = {
      renderRemindersPanel,
      addReminder
    };
  }
});
