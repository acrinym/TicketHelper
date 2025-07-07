// plugins/plugin-templates.js

window.registerNextNotePlugin({
  name: "Templates",
  onLoad: function(app) {
    // --- Template Store (editable by user) ---
    // Each template: {id, name, content (markdown)}
    let templates = JSON.parse(localStorage.getItem("nextnote_templates") || "[]");

    // --- Template Button in Toolbar ---
    const tplBtn = document.createElement("button");
    tplBtn.textContent = "📋 Templates";
    tplBtn.title = "Insert Template";
    tplBtn.style.marginLeft = "0.5em";
    document.getElementById("toolbar").appendChild(tplBtn);

    // --- Modal for Templates ---
    const modal = document.createElement("div");
    modal.style.display = "none";
    modal.style.position = "fixed";
    modal.style.left = 0;
    modal.style.top = 0;
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.background = "rgba(0,0,0,0.18)";
    modal.style.zIndex = 2000;
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";

    const inner = document.createElement("div");
    inner.style.background = "#fff";
    inner.style.margin = "12vh auto";
    inner.style.maxWidth = "420px";
    inner.style.width = "92vw";
    inner.style.borderRadius = "10px";
    inner.style.padding = "28px";
    inner.style.boxShadow = "0 4px 20px rgba(0,0,0,0.17)";
    inner.style.position = "relative";
    inner.style.display = "flex";
    inner.style.flexDirection = "column";
    inner.style.gap = "18px";
    modal.appendChild(inner);

    // Close
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "14px";
    closeBtn.style.right = "18px";
    closeBtn.onclick = () => (modal.style.display = "none");
    inner.appendChild(closeBtn);

    // Header
    const header = document.createElement("h2");
    header.textContent = "Templates";
    header.style.marginTop = "0";
    inner.appendChild(header);

    // --- Template List ---
    const tplList = document.createElement("div");
    tplList.id = "tplList";
    inner.appendChild(tplList);

    // --- Create/Add Template Form ---
    const addForm = document.createElement("div");
    addForm.innerHTML = `
      <input id="tplNameInput" placeholder="Template name..." style="width:49%;margin-bottom:5px"/>
      <textarea id="tplContentInput" placeholder="Template markdown content..." rows="3" style="width:100%"></textarea>
      <button id="tplAddBtn">Add Template</button>
    `;
    inner.appendChild(addForm);

    // Add modal to body
    document.body.appendChild(modal);

    // --- Button opens modal ---
    tplBtn.onclick = function() {
      renderTemplates();
      modal.style.display = "flex";
    };

    // --- Render Template List ---
    function renderTemplates() {
      tplList.innerHTML = "";
      if (!templates.length) {
        tplList.innerHTML = `<div style="color:#888;margin-bottom:10px">No templates saved yet.</div>`;
      }
      templates.forEach((tpl, i) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.gap = "7px";
        row.style.alignItems = "center";
        row.style.margin = "4px 0";
        // Template name
        const name = document.createElement("b");
        name.textContent = tpl.name;
        row.appendChild(name);
        // Insert button
        const useBtn = document.createElement("button");
        useBtn.textContent = "Insert";
        useBtn.onclick = function() {
          if (window.quill) {
            window.quill.clipboard.dangerouslyPasteHTML(window.quill.getSelection(true)?.index || 0, marked.parse(tpl.content));
          } else if (window.insertMarkdown) {
            window.insertMarkdown(tpl.content);
          }
          modal.style.display = "none";
        };
        row.appendChild(useBtn);
        // Delete button
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.style.color = "#b50d0d";
        delBtn.onclick = function() {
          if (confirm("Delete this template?")) {
            templates.splice(i, 1);
            saveTemplates();
            renderTemplates();
          }
        };
        row.appendChild(delBtn);
        tplList.appendChild(row);
      });
    }

    // --- Add Template Handler ---
    inner.querySelector("#tplAddBtn").onclick = function() {
      const name = inner.querySelector("#tplNameInput").value.trim();
      const content = inner.querySelector("#tplContentInput").value.trim();
      if (!name || !content) {
        alert("Template name and content are required.");
        return;
      }
      templates.push({
        id: crypto.randomUUID(),
        name: name,
        content: content
      });
      saveTemplates();
      renderTemplates();
      inner.querySelector("#tplNameInput").value = "";
      inner.querySelector("#tplContentInput").value = "";
    };

    function saveTemplates() {
      localStorage.setItem("nextnote_templates", JSON.stringify(templates));
    }

    // --- Expose for debug ---
    window._templates = {
      templates,
      renderTemplates,
      saveTemplates
    };
  }
});
