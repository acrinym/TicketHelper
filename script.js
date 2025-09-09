// NextNote v1.1.0 (Refactored)

const hermesThemes = {
  light: `
    --hermes-bg:#f0f0f0; --hermes-text:#333; --hermes-border:#999; --hermes-button-bg:#e9e9e9; --hermes-button-text:#333; --hermes-button-hover-bg:#dcdcdc; --hermes-panel-bg:#fdfdfd; --hermes-panel-text:#333; --hermes-panel-border:#ccc; --hermes-input-bg:#fff; --hermes-input-text:#333; --hermes-input-border:#bbb; --hermes-accent-bar-bg:#d0d0d0; --hermes-highlight-bg:#007bff; --hermes-highlight-text:#fff; --hermes-disabled-text:#aaa; --hermes-error-text:#dc3545; --hermes-success-text:#28a745; --hermes-warning-text:#ffc107; --hermes-info-text:#17a2b8; --hermes-link-color:#007bff; --hermes-link-hover-color:#0056b3;
  `,
  dark: `
    --hermes-bg:#2c2c2c; --hermes-text:#e0e0e0; --hermes-border:#555; --hermes-button-bg:#484848; --hermes-button-text:#e0e0e0; --hermes-button-hover-bg:#585858; --hermes-panel-bg:#333; --hermes-panel-text:#e0e0e0; --hermes-panel-border:#444; --hermes-input-bg:#3a3a3a; --hermes-input-text:#e0e0e0; --hermes-input-border:#666; --hermes-accent-bar-bg:#1e1e1e; --hermes-highlight-bg:#007bff; --hermes-highlight-text:#fff; --hermes-disabled-text:#777; --hermes-error-text:#f5c6cb; --hermes-success-text:#c3e6cb; --hermes-warning-text:#ffeeba; --hermes-info-text:#bee5eb; --hermes-link-color:#6cb2eb; --hermes-link-hover-color:#3490dc;
  `,
  phoenix: `
    --hermes-bg:#fff3e0; --hermes-text:#4e342e; --hermes-border:#ff8f00; --hermes-button-bg:#ffcc80; --hermes-button-text:#4e342e; --hermes-button-hover-bg:#ffb74d; --hermes-panel-bg:#fff8e1; --hermes-panel-text:#4e342e; --hermes-panel-border:#ffd180; --hermes-input-bg:#fff; --hermes-input-text:#4e342e; --hermes-input-border:#ffc260; --hermes-accent-bar-bg:#ff6f00; --hermes-highlight-bg:#ff6f00; --hermes-highlight-text:#fff; --hermes-disabled-text:#aaa; --hermes-error-text:#dc3545; --hermes-success-text:#28a745; --hermes-warning-text:#ffc107; --hermes-info-text:#17a2b8; --hermes-link-color:#ff6f00; --hermes-link-hover-color:#e65c00;
  `,
  red: `
    --hermes-bg:#1a1a1a; --hermes-text:#ffebee; --hermes-border:#b71c1c; --hermes-button-bg:#d32f2f; --hermes-button-text:#ffebee; --hermes-button-hover-bg:#b71c1c; --hermes-panel-bg:#2c2c2c; --hermes-panel-text:#ffebee; --hermes-panel-border:#d32f2f; --hermes-input-bg:#2c2c2c; --hermes-input-text:#ffebee; --hermes-input-border:#d32f2f; --hermes-accent-bar-bg:#d32f2f; --hermes-highlight-bg:#ff5252; --hermes-highlight-text:#fff; --hermes-disabled-text:#777; --hermes-error-text:#f5c6cb; --hermes-success-text:#c3e6cb; --hermes-warning-text:#ffeeba; --hermes-info-text:#bee5eb; --hermes-link-color:#ff5252; --hermes-link-hover-color:#ff1744;
  `
};

// --- Application State ---
const nextNoteEvents = {
    events: {},
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    },
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(data));
        }
    }
};
let db = null;
let useLocalStorageFallback = false;
const notebookList = JSON.parse(localStorage.getItem("notebook_list")) || ["default"];
let currentNotebook = localStorage.getItem("current_notebook") || notebookList[0];

let sections = {};
let attachments = [];
let templates = [];
let versionHistory = {};

let currentSection = null;
let currentPage = null;
let quill;
let autosaveInterval = parseInt(localStorage.getItem("autosave-interval")) || 30000;
let autosaveTimer = null;
let editorFontSize = parseInt(localStorage.getItem("editor-font-size")) || 16;
let enabledPlugins = JSON.parse(localStorage.getItem("nextnote_enabled_plugins")) || [];

// --- IndexedDB Core Logic ---
function openDB(name) {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      console.warn('IndexedDB unavailable, using localStorage fallback');
      useLocalStorageFallback = true;
      db = null;
      resolve();
      return;
    }
    const request = indexedDB.open("nextnote_" + name, 2); // Version updated to 2
    request.onupgradeneeded = e => {
      const dbInstance = e.target.result;
      if (!dbInstance.objectStoreNames.contains("data")) {
        dbInstance.createObjectStore("data");
      }
      if (!dbInstance.objectStoreNames.contains("attachments_store")) {
        dbInstance.createObjectStore("attachments_store");
      }
    };
    request.onsuccess = e => {
      db = e.target.result;
      resolve();
    };
    request.onerror = e => {
      console.error('IndexedDB open failed, using localStorage fallback', e);
      useLocalStorageFallback = true;
      db = null;
      resolve();
    };
  });
}

function idbGet(key, defaultValue) {
  return new Promise((resolve) => {
    if (useLocalStorageFallback || !db) {
      try {
        const v = localStorage.getItem(`nextnote_${currentNotebook}_${key}`);
        resolve(v ? JSON.parse(v) : defaultValue);
      } catch (e) {
        console.error('localStorage get failed', e);
        resolve(defaultValue);
      }
      return;
    }
    const tx = db.transaction("data", "readonly");
    const req = tx.objectStore("data").get(key);
    req.onsuccess = () => resolve(req.result !== undefined ? req.result : defaultValue);
    req.onerror = () => resolve(defaultValue);
  });
}

function idbSet(key, value) {
  return new Promise((resolve, reject) => {
    if (useLocalStorageFallback || !db) {
      try {
        localStorage.setItem(`nextnote_${currentNotebook}_${key}` , JSON.stringify(value));
        resolve();
      } catch (e) {
        console.error('localStorage set failed', e);
        resolve();
      }
      return;
    }
    const tx = db.transaction("data", "readwrite");
    tx.objectStore("data").put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function idbGetAttachment(key) {
    return new Promise((resolve, reject) => {
        if (useLocalStorageFallback || !db) {
            console.warn("Attachments not supported in localStorage fallback mode.");
            resolve(null);
            return;
        }
        const tx = db.transaction("attachments_store", "readonly");
        const req = tx.objectStore("attachments_store").get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e);
    });
}

function idbSetAttachment(key, value) {
    return new Promise((resolve, reject) => {
        if (useLocalStorageFallback || !db) {
            console.warn("Attachments not supported in localStorage fallback mode.");
            resolve();
            return;
        }
        const tx = db.transaction("attachments_store", "readwrite");
        tx.objectStore("attachments_store").put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

function idbDeleteAttachment(key) {
    return new Promise((resolve, reject) => {
        if (useLocalStorageFallback || !db) {
            console.warn("Attachments not supported in localStorage fallback mode.");
            resolve();
            return;
        }
        const tx = db.transaction("attachments_store", "readwrite");
        const req = tx.objectStore("attachments_store").delete(key);
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject(e);
    });
}

function b64toBlob(b64Data, contentType='', sliceSize=512) {
    const byteCharacters = atob(b64Data.split(',')[1]);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

function migrateAttachments() {
    // This is a one-time migration for users who have old base64 attachments.
    let migrationNeeded = false;
    const newAttachments = attachments.map(att => {
        if (att.data) { // Old format detected
            migrationNeeded = true;
            const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
            // We need to convert the base64 data back to a blob.
            const blob = b64toBlob(att.data, att.name.endsWith('.png') ? 'image/png' : 'application/octet-stream');
            idbSetAttachment(id, blob);
            return {
                id: id,
                name: att.name,
                type: blob.type,
                size: blob.size
            };
        }
        return att; // Already in new format
    });

    if (migrationNeeded) {
        attachments = newAttachments;
        saveAttachments(); // Save the new metadata array
    }
}

// --- Notebook Management ---
async function loadNotebook(name) {
  try {
    await openDB(name);
  } catch (e) {
    console.error('Failed to open database', e);
  }
  currentNotebook = name;
  localStorage.setItem("current_notebook", name);

  const [s, a, t, h] = await Promise.all([
    idbGet("sections_v4", {}),
    idbGet("attachments_v1", []),
    idbGet("templates_v1", []),
    idbGet("history_v1", {})
  ]);

  sections = s;
  attachments = a;
  templates = t;
  versionHistory = h;

  migrateAttachments();
  migrateSections();
  migratePages();
  renderSections();
  populateNotebookSelect();
}

function switchNotebook(ev) {
  loadNotebook(ev.target.value);
}

function createNotebook() {
  const name = prompt('New notebook name?');
  if (!name || notebookList.includes(name)) {
    if (name) alert("A notebook with this name already exists.");
    return;
  }
  notebookList.push(name);
  saveNotebookList();
  loadNotebook(name);
}

function saveNotebookList() {
  localStorage.setItem("notebook_list", JSON.stringify(notebookList));
}

function populateNotebookSelect() {
  const sel = document.getElementById('notebookSelect');
  if (!sel) return;
  sel.innerHTML = '';
  notebookList.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n;
    opt.textContent = n;
    sel.appendChild(opt);
  });
  sel.value = currentNotebook;
}

// --- Data Saving Wrappers ---
function saveSections() { return idbSet("sections_v4", sections); }
function saveAttachments() { return idbSet("attachments_v1", attachments); }
function saveTemplates() { return idbSet("templates_v1", templates); }
function saveHistory() { return idbSet("history_v1", versionHistory); }

// --- Version History ---
function addVersion(id, timestamp, markdown) {
  if (!versionHistory[id]) versionHistory[id] = [];
  versionHistory[id].push({ timestamp, markdown });
  if (versionHistory[id].length > 20) versionHistory[id].shift(); // Keep last 20 versions
  saveHistory();
}

// --- Core App Logic ---
function migrateSections() {
  Object.keys(sections).forEach(sec => {
    if (Array.isArray(sections[sec])) {
      sections[sec] = { color: "", icon: "", pages: sections[sec] };
    } else {
      sections[sec].color = sections[sec].color || "";
      sections[sec].icon = sections[sec].icon || "";
      sections[sec].pages = sections[sec].pages || [];
    }
  });
}

function migratePages() {
  const now = new Date().toISOString();
  Object.keys(sections).forEach(sec => {
    const secObj = sections[sec];
    secObj.pages = (secObj.pages || []).map(p => ({
      name: p.name,
      markdown: p.markdown || "",
      id: p.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)),
      created: p.created || now,
      modified: p.modified || now,
      color: p.color || "",
      icon: p.icon || ""
    }));
  });
}

function renderSections() {
  const container = document.getElementById("sections");
  container.innerHTML = "";
  Object.keys(sections).forEach(sec => {
    const secObj = sections[sec];
    const secDiv = document.createElement("div");
    secDiv.className = "section";
    if (secObj.color) {
      secDiv.style.backgroundColor = secObj.color;
    }
    const header = document.createElement("div");
    header.className = "section-header";

    const iconSpan = document.createElement("span");
    iconSpan.textContent = secObj.icon || "";
    header.appendChild(iconSpan);

    const titleSpan = document.createElement("span");
    titleSpan.className = "section-title";
    titleSpan.textContent = sec;
    titleSpan.onclick = () => togglePages(secDiv);
    header.appendChild(titleSpan);

    const colorInputSec = document.createElement("input");
    colorInputSec.type = "color";
    colorInputSec.value = secObj.color || "#ffffff";
    colorInputSec.onchange = (ev) => {
      sections[sec].color = ev.target.value;
      saveSections();
      secDiv.style.backgroundColor = ev.target.value;
    };
    header.appendChild(colorInputSec);

    const iconBtnSec = document.createElement("button");
    iconBtnSec.className = "icon-btn";
    iconBtnSec.textContent = "🔣";
    iconBtnSec.onclick = () => {
      const emo = prompt("Icon (emoji)?", secObj.icon || "");
      if (emo !== null) {
        sections[sec].icon = emo;
        saveSections();
        renderSections();
      }
    };
    header.appendChild(iconBtnSec);
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "🗑️";
    delBtn.onclick = () => {
      delete sections[sec];
      saveSections();
      renderSections();
    };
    header.appendChild(delBtn);
    secDiv.appendChild(header);

    const pageList = document.createElement("div");
    pageList.className = "pages";
    sections[sec].pages.forEach((p, idx) => {
      const pgDiv = document.createElement("div");
      pgDiv.className = "page-title";
      if (p.color) {
        pgDiv.style.backgroundColor = p.color;
      }

      const iconSpan = document.createElement("span");
      iconSpan.textContent = p.icon || "";
      pgDiv.appendChild(iconSpan);

      const pgSpan = document.createElement("span");
      pgSpan.className = "page-title-text";
      pgSpan.textContent = p.name;
      pgSpan.onclick = () => loadPage(sec, idx);
      pgDiv.appendChild(pgSpan);

      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.id = `color-${p.id}`;
      colorInput.value = p.color || "#ffffff";
      colorInput.onchange = (ev) => {
        sections[sec].pages[idx].color = ev.target.value;
        saveSections();
        pgDiv.style.backgroundColor = ev.target.value;
      };
      pgDiv.appendChild(colorInput);

      const iconBtn = document.createElement("button");
      iconBtn.className = "icon-btn";
      iconBtn.textContent = "🔣";
      iconBtn.onclick = (e) => {
        e.stopPropagation();
        const emo = prompt("Icon (emoji)?", p.icon || "");
        if (emo !== null) {
          sections[sec].pages[idx].icon = emo;
          saveSections();
          renderSections();
        }
      };
      pgDiv.appendChild(iconBtn);

      const pgDel = document.createElement("button");
      pgDel.className = "delete-btn";
      pgDel.textContent = "🗑️";
      pgDel.onclick = (e) => {
        e.stopPropagation();
        sections[sec].pages.splice(idx, 1);
        saveSections();
        renderSections();
      };
      pgDiv.appendChild(pgDel);
      pageList.appendChild(pgDiv);
    });
    secDiv.appendChild(pageList);

    const addPgBtn = document.createElement("button");
    addPgBtn.textContent = "+ Page";
    addPgBtn.onclick = async () => {
        const name = prompt("Page Name?");
        if (name) {
            let markdown = '';
            if (templates.length > 0 && confirm('Create from template?')) {
                const tpl = await newPageWithTemplate();
                if (tpl !== null) { // tpl will be null if cancelled
                    markdown = tpl;
                } else {
                    return; // User cancelled template selection
                }
            }

            const now = new Date().toISOString();
            sections[sec].pages.push({
                name,
                markdown,
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
                created: now,
                modified: now,
                color: "",
                icon: ""
            });
            saveSections();
            renderSections();
            loadPage(sec, sections[sec].pages.length - 1);
        }
    };
    secDiv.appendChild(addPgBtn);
    container.appendChild(secDiv);
  });

  Sortable.create(container, { animation: 150, handle: ".section-header", onEnd: saveData });
  document.querySelectorAll(".pages").forEach(pl => {
    Sortable.create(pl, { animation: 150, onUpdate: saveData });
  });
}

function togglePages(secDiv) {
  const pages = secDiv.querySelector(".pages");
  pages.style.display = pages.style.display === "none" ? "block" : "none";
}

function addSection() {
  const name = document.getElementById("newSectionInput").value.trim();
  if (name && !sections[name]) {
    sections[name] = { color: "", icon: "", pages: [] };
    saveSections();
    renderSections();
    document.getElementById("newSectionInput").value = "";
  }
}

function loadPage(sec, idx) {
  currentSection = sec;
  currentPage = idx;
  const page = sections[sec].pages[idx];
  const htmlContent = marked.parse(page.markdown || "");
  quill.clipboard.dangerouslyPasteHTML(htmlContent);
  document.getElementById("currentPageName").textContent = sec + " > " + page.name;
  document.getElementById("pageMeta").textContent = `id: ${page.id} created: ${page.created} modified: ${page.modified}`;
  nextNoteEvents.emit('pageSelected', page);
  document.getElementById("preview").style.display = "none";
  document.getElementById("quillEditorContainer").style.display = "flex";
  quill.enable(true);
}

function saveCurrentPage() {
  if (currentSection !== null && currentPage !== null) {
    const td = new TurndownService();
    const html = quill.root.innerHTML;
    const page = sections[currentSection].pages[currentPage];
    
    addVersion(page.id, page.modified, page.markdown); // Save previous version
    
    page.markdown = td.turndown(html);
    page.modified = new Date().toISOString();
    
    saveSections();
    document.getElementById("pageMeta").textContent = `id: ${page.id} created: ${page.created} modified: ${page.modified}`;
    renderMarkdown();
  }
}

function autoSave() {
  saveCurrentPage();
}

function startAutosave() {
  if (autosaveTimer) clearInterval(autosaveTimer);
  autosaveTimer = setInterval(autoSave, autosaveInterval);
}

function renderMarkdown() {
  if (currentSection !== null && currentPage !== null) {
    const raw = sections[currentSection].pages[currentPage].markdown || "";
    document.getElementById("preview").innerHTML = marked.parse(raw);
  } else {
    document.getElementById("preview").innerHTML = "<p>Select a page to see its preview.</p>";
  }
}

function togglePreview() {
  const ed = document.getElementById("quillEditorContainer");
  const pv = document.getElementById("preview");
  if (pv.style.display === "none") {
    saveCurrentPage();
    renderMarkdown();
    pv.style.display = "block";
    ed.style.display = "none";
    quill.enable(false);
  } else {
    pv.style.display = "none";
    ed.style.display = "flex";
    quill.enable(true);
  }
}

async function insertImage(ev) {
    const file = ev.target.files[0];
    if (!file) return;

    // Use a temporary event object to pass to addAttachments
    const tempEvent = {
        target: {
            files: [file],
            value: '' // to be cleared
        }
    };
    await addAttachments(tempEvent);

    // The new attachment is the last one in the array
    const newAttachmentIndex = attachments.length - 1;
    await insertAttachment(newAttachmentIndex);

    // Clear the file input value
    ev.target.value = '';
}

function exportMarkdown() {
  if (currentSection === null || currentPage === null) return;
  const md = sections[currentSection].pages[currentPage].markdown;
  const blob = new Blob([md], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = sections[currentSection].pages[currentPage].name.replace(/\s+/g, "_") + ".md";
  a.click();
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function exportNotebook() {
    console.log("Starting notebook export...");

    // 1. Create a deep copy of sections to avoid modifying the original data
    const notebookData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        notebookName: currentNotebook,
        sections: JSON.parse(JSON.stringify(sections)),
        templates: JSON.parse(JSON.stringify(templates)),
        attachments: [] // We will populate this below
    };

    // 2. Process attachments
    for (const attMeta of attachments) {
        try {
            const blob = await idbGetAttachment(attMeta.id);
            if (blob) {
                const data = await blobToBase64(blob);
                notebookData.attachments.push({
                    ...attMeta,
                    data: data // Add base64 data to the export
                });
            }
        } catch (e) {
            console.error(`Could not export attachment ${attMeta.name}:`, e);
        }
    }

    // 3. Create and download the JSON file
    const jsonString = JSON.stringify(notebookData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNotebook}.nextnote.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Notebook export complete.");
}

async function importNotebook(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);

            // Basic validation
            if (!data.notebookName || !data.sections) {
                throw new Error("Invalid notebook file format.");
            }

            // Prompt for a new notebook name
            const newNotebookName = prompt(`Enter a name for the imported notebook:`, `${data.notebookName}-imported`);
            if (newNotebookName === null) {
                alert("Import cancelled.");
                return;
            }
            if (!newNotebookName.trim() || notebookList.includes(newNotebookName)) {
                alert("Invalid or duplicate notebook name. Please try again.");
                return;
            }

            // Create and switch to the new notebook
            notebookList.push(newNotebookName);
            saveNotebookList();
            await openDB(newNotebookName); // This sets up the new DB
            currentNotebook = newNotebookName;
            localStorage.setItem("current_notebook", newNotebookName);


            // Import sections and templates
            await idbSet("sections_v4", data.sections || {});
            await idbSet("templates_v1", data.templates || []);

            // Import attachments
            const importedAttachmentsMeta = [];
            if (data.attachments && Array.isArray(data.attachments)) {
                for (const att of data.attachments) {
                    if (att.data) {
                        const blob = b64toBlob(att.data, att.type);
                        await idbSetAttachment(att.id, blob);
                        // Save metadata without the 'data' field
                        const { data, ...meta } = att;
                        importedAttachmentsMeta.push(meta);
                    }
                }
            }
            await idbSet("attachments_v1", importedAttachmentsMeta);

            alert(`Notebook "${newNotebookName}" imported successfully! The application will now reload.`);
            location.reload();

        } catch (err) {
            console.error("Failed to import notebook:", err);
            alert("Error importing notebook. See console for details.");
        } finally {
            // Reset file input so the same file can be loaded again
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}

function importMarkdown(event) {
  const file = event.target.files[0];
  if (!file || currentSection === null || currentPage === null) return;
  const fr = new FileReader();
  fr.onload = e => {
    sections[currentSection].pages[currentPage].markdown = e.target.result;
    saveSections();
    loadPage(currentSection, currentPage);
  };
  fr.readAsText(file);
}

function saveData() {
  const data = {};
  document.querySelectorAll("#sections > .section").forEach(secDiv => {
    const title = secDiv.querySelector(".section-header .section-title").textContent;
    const existingSection = sections[title] || { color:"", icon:"", pages:[] };
    const newPagesOrder = [];
    secDiv.querySelectorAll(".page-title").forEach(pgDiv => {
      const pageName = pgDiv.querySelector(".page-title-text").textContent;
      const originalPage = existingSection.pages.find(p => p.name === pageName);
      if (originalPage) {
        newPagesOrder.push(originalPage);
      } else {
        const now = new Date().toISOString();
        newPagesOrder.push({ name: pageName, markdown: "", id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2), created: now, modified: now, color: "", icon: "" });
      }
    });
    data[title] = { color: existingSection.color, icon: existingSection.icon, pages: newPagesOrder };
  });
  sections = data;
  saveSections();
}

function updateSearch() {
    const term=document.getElementById('searchInput').value.trim();
    const resDiv=document.getElementById('searchResults');
    resDiv.innerHTML='';
    if(!term){ resDiv.style.display='none'; return; }
    const pages=[];
    Object.keys(sections).forEach(sec=>{
        sections[sec].pages.forEach((p,idx)=>{
            pages.push({section:sec,index:idx,name:p.name,markdown:p.markdown});
        });
    });
    const fuse=new Fuse(pages,{keys:['name','markdown'],threshold:0.4});
    const results=fuse.search(term).slice(0,10);
    results.forEach(r=>{
        const div=document.createElement('div');
        div.className='search-result';
        div.textContent=`${r.item.section} > ${r.item.name}`;
        div.onclick=()=>{ loadPage(r.item.section,r.item.index); resDiv.style.display='none'; document.getElementById('searchInput').value=''; };
        resDiv.appendChild(div);
    });
    resDiv.style.display=results.length?'block':'none';
}

function toggleAttachments() {
    const panel=document.getElementById('attachmentsPanel');
    panel.style.display=panel.style.display==='block'?'none':'block';
    if(panel.style.display==='block') renderAttachments();
}

function renderAttachments(){
    const panel=document.getElementById('attachmentsPanel');
    panel.innerHTML='';
    const addBtn=document.createElement('button');
    addBtn.textContent='+ Add';
    addBtn.onclick=()=>document.getElementById('attachmentInput').click();
    panel.appendChild(addBtn);
    attachments.forEach((att,idx)=>{
        const div=document.createElement('div');
        div.className='attachment-item';
        const name=document.createElement('span');
        name.textContent = `${att.name} (${att.size ? (att.size / 1024).toFixed(2) + ' KB' : 'N/A'})`; // Display size too
        const insert=document.createElement('button');
        insert.textContent='Insert';
        insert.onclick=()=>insertAttachment(idx);
        const del=document.createElement('button');
        del.textContent='Delete';
        del.onclick= async ()=>{
            const attMeta = attachments[idx];
            if (attMeta) {
                await idbDeleteAttachment(attMeta.id);
                attachments.splice(idx,1);
                saveAttachments();
                renderAttachments();
            }
        };
        div.appendChild(name);
        div.appendChild(insert);
        div.appendChild(del);
        panel.appendChild(div);
    });
}

async function addAttachments(ev){
    const files=Array.from(ev.target.files);
    for (const file of files) {
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        const attachmentMeta = {
            id: id,
            name: file.name,
            type: file.type,
            size: file.size,
        };
        await idbSetAttachment(id, file); // Store the file Blob
        attachments.push(attachmentMeta);
    }
    saveAttachments(); // This now saves the metadata array
    renderAttachments();
    ev.target.value='';
}

async function insertAttachment(idx){
    const attMeta = attachments[idx];
    if (!attMeta) return;

    const blob = await idbGetAttachment(attMeta.id);
    if (!blob) {
        alert('Error: Attachment data not found.');
        return;
    }

    const range = quill.getSelection();
    const reader = new FileReader();

    reader.onload = e => {
        const dataUrl = e.target.result;
        if (attMeta.type.startsWith('image/')) {
            if(range){ quill.insertEmbed(range.index, 'image', dataUrl); }
            else { quill.insertEmbed(quill.getLength(), 'image', dataUrl); }
        } else {
            // For non-image files, we can't embed them.
            // A common approach is to link to them, but blobs don't have a permanent URL.
            // For now, we'll just insert the name as text.
            // A more advanced implementation might upload the file and get a URL.
            const linkText = attMeta.name;
            if(range){ quill.insertText(range.index, linkText); }
            else { quill.insertText(quill.getLength(), linkText); }
        }
    };

    reader.readAsDataURL(blob);
    toggleAttachments();
}

// --- UI Panels (Templates, History, Palette) ---

function hideTemplateManager(){
    document.getElementById('templateManager').style.display='none';
}

function showTemplateManager() {
    const mgr = document.getElementById('templateManager');
    const listDiv = document.getElementById('templateList');
    const nameInput = document.getElementById('templateNameInput');
    const contentInput = document.getElementById('templateContentInput');
    const idInput = document.getElementById('templateId');

    function renderList() {
        listDiv.innerHTML = '';
        templates.forEach((t, i) => {
            const div = document.createElement('div');
            div.textContent = t.name;
            div.dataset.index = i;
            div.onclick = () => loadTemplateForEditing(i);
            listDiv.appendChild(div);
        });
    }

    function clearEditor() {
        idInput.value = '';
        nameInput.value = '';
        contentInput.value = '';
    }

    function loadTemplateForEditing(index) {
        const t = templates[index];
        if (t) {
            idInput.value = index;
            nameInput.value = t.name;
            contentInput.value = t.markdown;
        }
    }

    document.getElementById('newTemplateBtn').onclick = clearEditor;

    document.getElementById('saveTemplateBtn').onclick = () => {
        const name = nameInput.value.trim();
        const markdown = contentInput.value;
        const id = idInput.value;

        if (!name) {
            alert("Template name cannot be empty.");
            return;
        }

        if (id !== '') {
            // Update existing template
            templates[id] = { name, markdown };
        } else {
            // Create new template
            if (templates.some(t => t.name === name)) {
                alert("A template with this name already exists.");
                return;
            }
            templates.push({ name, markdown });
        }
        saveTemplates();
        renderList();
        clearEditor();
    };

    document.getElementById('deleteTemplateBtn').onclick = () => {
        const id = idInput.value;
        if (id !== '' && confirm('Are you sure you want to delete this template?')) {
            templates.splice(id, 1);
            saveTemplates();
            renderList();
            clearEditor();
        }
    };

    renderList();
    clearEditor();
    mgr.style.display = 'flex';
}

function showHistory(){
    const panel=document.getElementById('historyPanel');
    const list=document.getElementById('historyList');
    list.innerHTML='';
    if(currentSection===null||currentPage===null){
        list.textContent='No page selected';
        panel.style.display='flex';
        return;
    }
    const page=sections[currentSection].pages[currentPage];
    const hist=(versionHistory[page.id]||[]).slice().reverse();
    hist.forEach((h)=>{
        const div=document.createElement('div');
        const info=document.createElement('span');
        info.textContent=new Date(h.timestamp).toLocaleString();
        const btn=document.createElement('button');
        btn.textContent='Restore';
        btn.onclick=()=>{page.markdown=h.markdown; loadPage(currentSection,currentPage); hideHistory(); saveSections();};
        div.appendChild(info);
        div.appendChild(btn);
        list.appendChild(div);
    });
    panel.style.display='flex';
}

function hideHistory(){
    document.getElementById('historyPanel').style.display='none';
}

function newPageWithTemplate() {
    return new Promise(resolve => {
        if (!templates.length) {
            resolve(null); // No templates exist, so resolve with null.
            return;
        }

        const overlay = document.getElementById('templateSelector');
        const listDiv = document.getElementById('templateSelectorList');
        listDiv.innerHTML = '';

        templates.forEach((t, i) => {
            const div = document.createElement('div');
            div.textContent = t.name;
            div.style.cursor = 'pointer';
            div.style.padding = '5px';
            div.onclick = () => {
                overlay.style.display = 'none';
                resolve(t.markdown);
            };
            listDiv.appendChild(div);
        });

        // Add a "Blank Page" option
        const blankDiv = document.createElement('div');
        blankDiv.textContent = "Blank Page";
        blankDiv.style.cursor = 'pointer';
        blankDiv.style.padding = '5px';
        blankDiv.style.marginTop = '10px';
        blankDiv.onclick = () => {
            overlay.style.display = 'none';
            resolve(''); // Resolve with empty string for blank page
        };
        listDiv.appendChild(blankDiv);

        const cancelButton = overlay.querySelector('button');
        const originalOnclick = cancelButton.onclick;
        cancelButton.onclick = () => {
            originalOnclick();
            resolve(null); // Resolve with null on cancel
        }

        overlay.style.display = 'flex';
    });
}

function showCommandPalette(){
    const overlay=document.getElementById('commandPalette');
    const input=document.getElementById('commandInput');
    document.getElementById('commandResults').innerHTML='';
    input.value='';
    overlay.style.display='flex';
    input.focus();
}

function hideCommandPalette(){
    document.getElementById('commandPalette').style.display='none';
}

function updateCommandResults(){
    const term=document.getElementById('commandInput').value.trim();
    const container=document.getElementById('commandResults');
    container.innerHTML='';
    if(!term) return;
    const pages=[];
    Object.keys(sections).forEach(sec=>{
        sections[sec].pages.forEach((p,idx)=>pages.push({section:sec,index:idx,name:p.name}));
    });
    const fuse=new Fuse(pages,{keys:['name'],threshold:0.4});
    const results=fuse.search(term).slice(0,10);
    results.forEach(r=>{
        const div=document.createElement('div');
        div.textContent=`${r.item.section} > ${r.item.name}`;
        div.onclick=()=>{loadPage(r.item.section,r.item.index); hideCommandPalette();};
        container.appendChild(div);
    });
}

function renderPluginManager() {
    const pluginListDiv = document.getElementById('pluginList');
    pluginListDiv.innerHTML = '';

    const availablePlugins = [
        'plugin-backlinks.js',
        'plugin-favorites.js',
        'plugin-fuzzysearch.js',
        'plugin-history.js',
        'plugin-multinotebook.js',
        'plugin-outline.js',
        'plugin-quickactions.js',
        'plugin-reminders.js',
        'plugin-resource-manager.js',
        'plugin-tags.js',
        'plugin-templates.js'
    ];

    availablePlugins.forEach(pluginFile => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = pluginFile;
        checkbox.checked = enabledPlugins.includes(pluginFile);

        checkbox.onchange = () => {
            if (checkbox.checked) {
                if (!enabledPlugins.includes(pluginFile)) {
                    enabledPlugins.push(pluginFile);
                }
            } else {
                const index = enabledPlugins.indexOf(pluginFile);
                if (index > -1) {
                    enabledPlugins.splice(index, 1);
                }
            }
            localStorage.setItem("nextnote_enabled_plugins", JSON.stringify(enabledPlugins));
            alert("Plugin changes will take effect after reloading the application.");
        };

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + pluginFile.replace('plugin-', '').replace('.js', '')));
        pluginListDiv.appendChild(label);
        pluginListDiv.appendChild(document.createElement('br'));
    });
}

function showSettingsPanel(){
    document.getElementById('settingsPanel').style.display='flex';
    renderPluginManager(); // Add this call
    showSettingsSection('appearance');
}

function hideSettingsPanel(){
    document.getElementById('settingsPanel').style.display='none';
}

function showSettingsSection(section){
    document.querySelectorAll('#settingsContent > div').forEach(div=>div.classList.remove('active'));
    const target=document.getElementById('settings-'+section);
    if(target) target.classList.add('active');
}

function getNextNotePluginPanel(pluginName) {
    const container = document.getElementById('plugin-container');
    if (!container) return null;

    const panel = document.createElement('div');
    panel.className = 'plugin-panel';

    const header = document.createElement('div');
    header.className = 'plugin-panel-header';
    header.textContent = pluginName;
    header.onclick = () => {
        const content = panel.querySelector('.plugin-panel-content');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
    };

    const content = document.createElement('div');
    content.className = 'plugin-panel-content';

    panel.appendChild(header);
    panel.appendChild(content);
    container.appendChild(panel);

    return content; // Return the content div for the plugin to populate
}

// --- Initial Load & Event Listeners ---

window.onload = async function() {
    await loadNotebook(currentNotebook);

    const redThemeLink = document.createElement('link');
    redThemeLink.rel = 'stylesheet';
    redThemeLink.href = 'css.css';
    redThemeLink.id = 'redThemeStylesheet';
    redThemeLink.disabled = true;
    document.head.appendChild(redThemeLink);

    const themeSelect = document.getElementById("themeSelect");
    Object.keys(hermesThemes).forEach(t=>{
        const opt=document.createElement('option');
        opt.value=t;
        opt.textContent=t.charAt(0).toUpperCase()+t.slice(1);
        themeSelect.appendChild(opt);
    });
    themeSelect.value = localStorage.getItem("nextnote-theme") || "light";
    document.documentElement.style.cssText = hermesThemes[themeSelect.value];
    document.documentElement.style.setProperty('--editor-font-size', editorFontSize + 'px');
    if (themeSelect.value === 'red') {
        redThemeLink.disabled = false;
        document.body.classList.add('red-led-theme');
    }

    themeSelect.onchange = () => {
        document.documentElement.style.cssText = hermesThemes[themeSelect.value];
        localStorage.setItem("nextnote-theme", themeSelect.value);
        if (themeSelect.value === 'red') {
            redThemeLink.disabled = false;
            document.body.classList.add('red-led-theme');
        } else {
            redThemeLink.disabled = true;
            document.body.classList.remove('red-led-theme');
        }
    };

    const fontInput=document.getElementById('fontSizeInput');
    fontInput.value=editorFontSize;
    fontInput.onchange=(e)=>{
        editorFontSize=parseInt(e.target.value)||16;
        document.documentElement.style.setProperty('--editor-font-size', editorFontSize + 'px');
        localStorage.setItem('editor-font-size', editorFontSize);
    };

    const autoInput=document.getElementById('autosaveInput');
    autoInput.value=autosaveInterval;
    autoInput.onchange=(e)=>{
        autosaveInterval=parseInt(e.target.value)||30000;
        localStorage.setItem('autosave-interval', autosaveInterval);
        startAutosave();
    };

    quill = new Quill('#quillEditorContainer', {
        theme: 'snow',
        placeholder: 'Select a page or create a new one to start writing.',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
    // expose globally for plugins like template manager/resource manager
    window.quill = quill;

    // basic handler for inserting images when the toolbar image button is clicked
    quill.getModule('toolbar').addHandler('image', () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.addEventListener('change', () => {
            const file = input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const range = quill.getSelection();
                quill.insertEmbed(range ? range.index : quill.getLength(), 'image', e.target.result);
            };
            reader.readAsDataURL(file);
        });
        input.click();
    });

    document.getElementById("quillEditorContainer").style.display = "flex";
    quill.enable(false);
    quill.root.innerHTML = "<p>Select a page or create a new one to start writing.</p>";
    document.getElementById("preview").style.display = "none";

    startAutosave();
    // Notify plugin system that NextNote finished loading
    document.dispatchEvent(new Event('NextNoteReady'));
};

document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveCurrentPage();
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        showCommandPalette();
    }
    if (event.key === 'Escape') {
        hideCommandPalette();
        hideHistory();
        hideSettingsPanel();
    }
});

document.getElementById('commandInput').addEventListener('input', updateCommandResults);
document.getElementById('commandInput').addEventListener('keydown', function(ev) {
    if (ev.key === 'Enter') {
        const first = document.querySelector('#commandResults div');
        if (first) { first.click(); }
    } else if (ev.key === 'Escape') {
        hideCommandPalette();
    }
});