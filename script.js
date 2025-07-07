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
  `
};

// --- Application State ---
let db = null;
const notebookList = JSON.parse(localStorage.getItem("notebook_list")) || ["default"];
let currentNotebook = localStorage.getItem("current_notebook") || notebookList[0];

let sections = {};
let attachments = [];
let templates = [];
let versionHistory = {};

let currentSection = null;
let currentPage = null;
let quill;

// --- IndexedDB Core Logic ---
function openDB(name) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("nextnote_" + name, 1);
    request.onupgradeneeded = e => {
      const dbInstance = e.target.result;
      if (!dbInstance.objectStoreNames.contains("data")) {
        dbInstance.createObjectStore("data");
      }
    };
    request.onsuccess = e => {
      db = e.target.result;
      resolve();
    };
    request.onerror = e => reject(e);
  });
}

function idbGet(key, defaultValue) {
  return new Promise((resolve) => {
    if (!db) {
      resolve(defaultValue);
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
    if (!db) {
      reject("Database not open.");
      return;
    }
    const tx = db.transaction("data", "readwrite");
    tx.objectStore("data").put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Notebook Management ---
async function loadNotebook(name) {
  await openDB(name);
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
function migratePages() {
  const now = new Date().toISOString();
  Object.keys(sections).forEach(sec => {
    sections[sec] = sections[sec].map(p => ({
      name: p.name,
      markdown: p.markdown || "",
      id: p.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)),
      created: p.created || now,
      modified: p.modified || now,
      color: p.color || ""
    }));
  });
}

function renderSections() {
  const container = document.getElementById("sections");
  container.innerHTML = "";
  Object.keys(sections).forEach(sec => {
    const secDiv = document.createElement("div");
    secDiv.className = "section";
    const header = document.createElement("div");
    header.className = "section-header";
    const titleSpan = document.createElement("span");
    titleSpan.textContent = sec;
    titleSpan.onclick = () => togglePages(secDiv);
    header.appendChild(titleSpan);
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
    sections[sec].forEach((p, idx) => {
      const pgDiv = document.createElement("div");
      pgDiv.className = "page-title";
      if (p.color) {
        pgDiv.style.backgroundColor = p.color;
      }
      const pgSpan = document.createElement("span");
      pgSpan.textContent = p.name;
      pgSpan.onclick = () => loadPage(sec, idx);
      pgDiv.appendChild(pgSpan);

      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.id = `color-${p.id}`;
      colorInput.value = p.color || "#ffffff";
      colorInput.onchange = (ev) => {
        sections[sec][idx].color = ev.target.value;
        saveSections();
        pgDiv.style.backgroundColor = ev.target.value;
      };
      pgDiv.appendChild(colorInput);

      const pgDel = document.createElement("button");
      pgDel.className = "delete-btn";
      pgDel.textContent = "🗑️";
      pgDel.onclick = (e) => {
        e.stopPropagation();
        sections[sec].splice(idx, 1);
        saveSections();
        renderSections();
      };
      pgDiv.appendChild(pgDel);
      pageList.appendChild(pgDiv);
    });
    secDiv.appendChild(pageList);

    const addPgBtn = document.createElement("button");
    addPgBtn.textContent = "+ Page";
    addPgBtn.onclick = () => {
      const name = prompt("Page Name?");
      if (name) {
        let markdown = "";
        if (templates.length && confirm('Create from template?')) {
          const tpl = newPageWithTemplate();
          if (tpl !== null) { markdown = tpl; }
        }
        const now = new Date().toISOString();
        sections[sec].push({
          name, markdown, id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2), created: now, modified: now, color: ""
        });
        saveSections();
        renderSections();
        loadPage(sec, sections[sec].length - 1);
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
    sections[name] = [];
    saveSections();
    renderSections();
    document.getElementById("newSectionInput").value = "";
  }
}

function loadPage(sec, idx) {
  currentSection = sec;
  currentPage = idx;
  const page = sections[sec][idx];
  const htmlContent = marked.parse(page.markdown || "");
  quill.clipboard.dangerouslyPasteHTML(htmlContent);
  document.getElementById("currentPageName").textContent = sec + " > " + page.name;
  document.getElementById("pageMeta").textContent = `id: ${page.id} created: ${page.created} modified: ${page.modified}`;
  document.getElementById("preview").style.display = "none";
  document.getElementById("quillEditorContainer").style.display = "flex";
  quill.enable(true);
}

function saveCurrentPage() {
  if (currentSection !== null && currentPage !== null) {
    const td = new TurndownService();
    const html = quill.root.innerHTML;
    const page = sections[currentSection][currentPage];
    
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

function renderMarkdown() {
  if (currentSection !== null && currentPage !== null) {
    const raw = sections[currentSection][currentPage].markdown || "";
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

function insertImage(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const fr = new FileReader();
  fr.onload = e => {
    const range = quill.getSelection();
    if (range) {
      quill.insertEmbed(range.index, 'image', e.target.result);
    } else {
      quill.insertEmbed(quill.getLength(), 'image', e.target.result);
    }
  };
  fr.readAsDataURL(file);
}

function exportMarkdown() {
  if (currentSection === null || currentPage === null) return;
  const md = sections[currentSection][currentPage].markdown;
  const blob = new Blob([md], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = sections[currentSection][currentPage].name.replace(/\s+/g, "_") + ".md";
  a.click();
}

function importMarkdown(event) {
  const file = event.target.files[0];
  if (!file || currentSection === null || currentPage === null) return;
  const fr = new FileReader();
  fr.onload = e => {
    sections[currentSection][currentPage].markdown = e.target.result;
    saveSections();
    loadPage(currentSection, currentPage);
  };
  fr.readAsText(file);
}

function saveData() {
  const data = {};
  document.querySelectorAll("#sections > .section").forEach(secDiv => {
    const title = secDiv.querySelector(".section-header span").textContent;
    const existingSectionPages = sections[title] || [];
    const newPagesOrder = [];
    secDiv.querySelectorAll(".page-title span").forEach(pgSpan => {
      const pageName = pgSpan.textContent;
      const originalPage = existingSectionPages.find(p => p.name === pageName);
      if (originalPage) {
        newPagesOrder.push(originalPage);
      } else {
        const now = new Date().toISOString();
        newPagesOrder.push({ name: pageName, markdown: "", id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2), created: now, modified: now, color: "" });
      }
    });
    data[title] = newPagesOrder;
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
        sections[sec].forEach((p,idx)=>{
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
        name.textContent=att.name;
        const insert=document.createElement('button');
        insert.textContent='Insert';
        insert.onclick=()=>insertAttachment(idx);
        const del=document.createElement('button');
        del.textContent='Delete';
        del.onclick=()=>{attachments.splice(idx,1); saveAttachments(); renderAttachments();};
        div.appendChild(name);
        div.appendChild(insert);
        div.appendChild(del);
        panel.appendChild(div);
    });
}

function addAttachments(ev){
    const files=Array.from(ev.target.files);
    files.forEach(file=>{
        const fr=new FileReader();
        fr.onload=e=>{attachments.push({name:file.name,data:e.target.result}); saveAttachments(); renderAttachments();};
        fr.readAsDataURL(file);
    });
    ev.target.value='';
}

function insertAttachment(idx){
    const att=attachments[idx];
    const range=quill.getSelection();
    if(att.data.startsWith('data:image/')){
        if(range){ quill.insertEmbed(range.index,'image',att.data); }
        else { quill.insertEmbed(quill.getLength(),'image',att.data); }
    } else {
        const linkText=att.name;
        const link=`[${linkText}](${att.data})`;
        if(range){ quill.insertText(range.index, link); }
        else { quill.insertText(quill.getLength(), link); }
    }
    toggleAttachments();
}

// --- UI Panels (Templates, History, Palette) ---

function showTemplateManager(){
    const mgr=document.getElementById('templateManager');
    const list=document.getElementById('templateList');
    list.innerHTML='';
    templates.forEach((t,i)=>{
        const div=document.createElement('div');
        div.textContent=t.name;
        const edit=document.createElement('button');
        edit.textContent='Edit';
        edit.onclick=()=>editTemplate(i);
        const del=document.createElement('button');
        del.textContent='Delete';
        del.onclick=()=>{templates.splice(i,1); saveTemplates(); showTemplateManager();};
        div.appendChild(edit);
        div.appendChild(del);
        list.appendChild(div);
    });
    mgr.style.display='flex';
}

function hideTemplateManager(){
    document.getElementById('templateManager').style.display='none';
}

function addTemplate(){
    const name=prompt('Template name?');
    if(!name) return;
    const content=prompt('Template markdown?');
    templates.push({name,markdown:content||''});
    saveTemplates();
    showTemplateManager();
}

function editTemplate(idx){
    const t=templates[idx];
    const name=prompt('Template name?', t.name);
    if(!name) return;
    const content=prompt('Template markdown?', t.markdown);
    templates[idx]={name,markdown:content||''};
    saveTemplates();
    showTemplateManager();
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
    const page=sections[currentSection][currentPage];
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

function newPageWithTemplate(){
    if(!templates.length){ return null; }
    const opts=templates.map((t,i)=>`${i+1}: ${t.name}`).join('\n');
    const choice=prompt(`Choose template number or Cancel for blank:\n${opts}`);
    const idx=parseInt(choice)-1;
    if(!isNaN(idx) && templates[idx]){
        return templates[idx].markdown;
    }
    return '';
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
        sections[sec].forEach((p,idx)=>pages.push({section:sec,index:idx,name:p.name}));
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

// --- Initial Load & Event Listeners ---

window.onload = async function() {
    await loadNotebook(currentNotebook);

    const savedTheme = localStorage.getItem("nextnote-theme") || "light";
    const themeSelect = document.getElementById("themeSelect");
    themeSelect.value = savedTheme;
    document.documentElement.style.cssText = hermesThemes[savedTheme];
    
    themeSelect.onchange = () => {
        document.documentElement.style.cssText = hermesThemes[themeSelect.value];
        localStorage.setItem("nextnote-theme", themeSelect.value);
    };

    quill = new Quill('#quillEditorContainer', {
        theme: 'snow',
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

    document.getElementById("quillEditorContainer").style.display = "none";
    document.getElementById("preview").style.display = "block";
    document.getElementById("preview").innerHTML = "<p>Select a page or create a new one to start writing.</p>";

    setInterval(autoSave, 30000); // Autosave every 30 seconds
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