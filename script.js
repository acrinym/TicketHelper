    const hermesThemes = {
      light: `
        --hermes-bg:#f0f0f0;
        --hermes-text:#333;
        --hermes-border:#999;
        --hermes-button-bg:#e9e9e9;
        --hermes-button-text:#333;
        --hermes-button-hover-bg:#dcdcdc;
        --hermes-panel-bg:#fdfdfd;
        --hermes-panel-text:#333;
        --hermes-panel-border:#ccc;
        --hermes-input-bg:#fff;
        --hermes-input-text:#333;
        --hermes-input-border:#bbb;
        --hermes-accent-bar-bg:#d0d0d0;
        --hermes-highlight-bg:#007bff;
        --hermes-highlight-text:#fff;
        --hermes-disabled-text:#aaa;
        --hermes-error-text:#dc3545;
        --hermes-success-text:#28a745;
        --hermes-warning-text:#ffc107;
        --hermes-info-text:#17a2b8;
        --hermes-link-color:#007bff;
        --hermes-link-hover-color:#0056b3;
      `,
      dark: `
        --hermes-bg:#2c2c2c;
        --hermes-text:#e0e0e0;
        --hermes-border:#555;
        --hermes-button-bg:#484848;
        --hermes-button-text:#e0e0e0;
        --hermes-button-hover-bg:#585858;
        --hermes-panel-bg:#333;
        --hermes-panel-text:#e0e0e0;
        --hermes-panel-border:#444;
        --hermes-input-bg:#3a3a3a;
        --hermes-input-text:#e0e0e0;
        --hermes-input-border:#666;
        --hermes-accent-bar-bg:#1e1e1e;
        --hermes-highlight-bg:#007bff;
        --hermes-highlight-text:#fff;
        --hermes-disabled-text:#777;
        --hermes-error-text:#f5c6cb;
        --hermes-success-text:#c3e6cb;
        --hermes-warning-text:#ffeeba;
        --hermes-info-text:#bee5eb;
        --hermes-link-color:#6cb2eb;
        --hermes-link-hover-color:#3490dc;
      `,
      phoenix: `
        --hermes-bg:#fff3e0;
        --hermes-text:#4e342e;
        --hermes-border:#ff8f00;
        --hermes-button-bg:#ffcc80;
        --hermes-button-text:#4e342e;
        --hermes-button-hover-bg:#ffb74d;
        --hermes-panel-bg:#fff8e1;
        --hermes-panel-text:#4e342e;
        --hermes-panel-border:#ffd180;
        --hermes-input-bg:#fff;
        --hermes-input-text:#4e342e;
        --hermes-input-border:#ffc260;
        --hermes-accent-bar-bg:#ff6f00;
        --hermes-highlight-bg:#ff6f00;
        --hermes-highlight-text:#fff;
        --hermes-disabled-text:#aaa;
        --hermes-error-text:#dc3545;
        --hermes-success-text:#28a745;
        --hermes-warning-text:#ffc107;
        --hermes-info-text:#17a2b8;
        --hermes-link-color:#ff6f00;
        --hermes-link-hover-color:#e65c00;
      `
      // Add more themes as needed...
    };
  let db;
  let currentNotebook = localStorage.getItem("currentNotebook") || "default";
  let notebooks = JSON.parse(localStorage.getItem("notebook_list")) || ["default"];

  let sections = {};
  let attachments = [];
  let templates = [];

    function loadData(key, def){
      return new Promise(res=>{
        if(!db){res(def); return;}
        const tx=db.transaction('data','readonly');
        const req=tx.objectStore('data').get(key);
        req.onsuccess=()=>res(req.result!==undefined?req.result:def);
        req.onerror=()=>res(def);
      });
    }

    function openNotebook(name){
      return new Promise((resolve,reject)=>{
        const req=indexedDB.open('nextnote_'+name,1);
        req.onupgradeneeded=e=>{
          const db=e.target.result;
          if(!db.objectStoreNames.contains('data')){db.createObjectStore('data');}
        };
        req.onsuccess=e=>{
          db=e.target.result;
          currentNotebook=name;
          if(!notebooks.includes(name)){
            notebooks.push(name);
            localStorage.setItem('notebook_list', JSON.stringify(notebooks));
          }
          localStorage.setItem('currentNotebook', name);
          Promise.all([
            loadData('sections',{}),
            loadData('attachments',[]),
            loadData('templates',[])
          ]).then(([s,a,t])=>{
            sections=s; attachments=a; templates=t; migratePages(); renderSections(); resolve();
          });
        };
        req.onerror=e=>reject(e);
      });
    }

    function updateNotebookSelect(){
      const sel=document.getElementById('notebookSelect');
      if(!sel) return;
      sel.innerHTML='';
      notebooks.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});
      sel.value=currentNotebook;
    }

    function newNotebook(){
      const name=prompt('New notebook name?');
      if(!name) return;
      openNotebook(name).then(updateNotebookSelect);
    }

    function switchNotebook(ev){
      openNotebook(ev.target.value).then(updateNotebookSelect);
    }
    
    function saveData(key,data){
      return new Promise(res=>{
        if(!db){res();return;}
        const tx=db.transaction('data','readwrite');
        tx.objectStore('data').put(data,key).onsuccess=()=>res();
      });
    }

    function saveAttachments(){
      return saveData('attachments', attachments);
    }

    function saveTemplates(){
      return saveData('templates', templates);
    }
    function migratePages(){
      const now = new Date().toISOString();
      Object.keys(sections).forEach(sec=>{
        sections[sec] = sections[sec].map(p=>({
          name: p.name,
          markdown: p.markdown||"",
          id: p.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)),
          created: p.created || now,
          modified: p.modified || now,
          color: p.color || ""
        }));
      });
    }
    let currentSection = null;
    let currentPage = null;
    let quill; // Declared global quill instance

    function saveToStorage(){
      return saveData('sections', sections);
    }

    function renderSections(){
      const container = document.getElementById("sections");
      container.innerHTML="";
      Object.keys(sections).forEach(sec=>{
        const secDiv=document.createElement("div");
        secDiv.className="section";
        // header
        const header=document.createElement("div");
        header.className="section-header";
        const titleSpan=document.createElement("span");
        titleSpan.textContent=sec;
        titleSpan.onclick=()=>togglePages(secDiv);
        header.appendChild(titleSpan);
        const delBtn=document.createElement("button");
        delBtn.className="delete-btn"; delBtn.textContent="🗑️";
        delBtn.onclick=()=>{ delete sections[sec]; saveToStorage(); renderSections(); };
        header.appendChild(delBtn);
        secDiv.appendChild(header);
        // pages
        const pageList=document.createElement("div");
        pageList.className="pages";
        sections[sec].forEach((p,idx)=>{
          const pgDiv=document.createElement("div");
          pgDiv.className="page-title";
          if (p.color) {
            pgDiv.style.backgroundColor = p.color;
          }

          const pgSpan=document.createElement("span");
          pgSpan.textContent=p.name;
          pgSpan.onclick=()=>loadPage(sec,idx);
          pgDiv.appendChild(pgSpan);

          const colorInput=document.createElement("input");
          colorInput.type="color";
          colorInput.id=`color-${p.id}`;
          colorInput.value=p.color||"#ffffff";
          colorInput.onchange=(ev)=>{
            sections[sec][idx].color=ev.target.value;
            saveToStorage();
            pgDiv.style.backgroundColor=ev.target.value;
          };
          pgDiv.appendChild(colorInput);

          const pgDel=document.createElement("button");
          pgDel.className="delete-btn"; pgDel.textContent="🗑️";
          pgDel.onclick=(e)=>{ e.stopPropagation(); sections[sec].splice(idx,1); saveToStorage(); renderSections(); };
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
          const tpl = newPageWithTemplate(sec);
          if (tpl !== null) { markdown = tpl; }
        }
        const now = new Date().toISOString();
        sections[sec].push({ name, markdown, id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2), created: now, modified: now, color: "" });
        saveToStorage();
        renderSections();
        loadPage(sec, sections[sec].length - 1);
      }
    };
    secDiv.appendChild(addPgBtn);
    container.appendChild(secDiv);
  });
      // Sortable
      Sortable.create(container,{animation:150, handle:".section-header", onEnd:saveData});
      document.querySelectorAll(".pages").forEach(pl=>{
        Sortable.create(pl,{animation:150,onUpdate:saveData});
      });
    }

    function togglePages(secDiv){
      const pages=secDiv.querySelector(".pages");
      pages.style.display = pages.style.display==="none"?"block":"none";
    }

    function addSection(){
      const name=document.getElementById("newSectionInput").value.trim();
      if(name&&!sections[name]){
        sections[name]=[]; saveToStorage(); renderSections(); document.getElementById("newSectionInput").value="";
      }
    }

    function loadPage(sec,idx){
      currentSection=sec; currentPage=idx;
      const page=sections[sec][idx];
      // Quill works best with HTML directly, so convert markdown first
      const htmlContent=marked.parse(page.markdown||"");
      quill.clipboard.dangerouslyPasteHTML(htmlContent); // Load HTML into Quill
      document.getElementById("currentPageName").textContent=sec+" > "+page.name;
      document.getElementById("pageMeta").textContent = `id: ${page.id} created: ${page.created} modified: ${page.modified}`;
      document.getElementById("preview").style.display="none";
      document.getElementById("quillEditorContainer").style.display="flex"; // Show Quill editor
      quill.enable(true); // Ensure Quill is enabled
    }

    function saveCurrentPage(){
      if(currentSection!==null && currentPage!==null){
        const td=new TurndownService();
        const html=quill.root.innerHTML;
        const page = sections[currentSection][currentPage];
        page.history = page.history || [];
        page.history.push({timestamp: page.modified || new Date().toISOString(), markdown: page.markdown});
        if(page.history.length>20) page.history.shift();
        page.markdown = td.turndown(html);
        page.modified = new Date().toISOString();
        saveToStorage();
        document.getElementById("pageMeta").textContent = `id: ${page.id} created: ${page.created} modified: ${page.modified}`;
        renderMarkdown();
      }
    }

    function renderMarkdown(){
      if (currentSection !== null && currentPage !== null) { // Ensure a page is selected
        const raw=sections[currentSection][currentPage].markdown||"";
        document.getElementById("preview").innerHTML=marked.parse(raw);
      } else {
        document.getElementById("preview").innerHTML="<p>Select a page to see its preview.</p>";
      }
    }

    function togglePreview(){
      const ed=document.getElementById("quillEditorContainer");
      const pv=document.getElementById("preview");
      if(pv.style.display==="none"){
        saveCurrentPage(); // Save current Quill content before preview
        renderMarkdown();
        pv.style.display="block";
        ed.style.display="none";
        quill.enable(false); // Disable Quill editor when preview is active
      } else {
        pv.style.display="none";
        ed.style.display="flex";
        quill.enable(true); // Enable Quill editor when switching back
      }
    }

    // Keep execCmd for potential future custom commands not handled by Quill
    function execCmd(cmd,val=null){
      // Quill handles most commands internally, but this function can be used for custom ones
      // document.execCommand(cmd,false,val); // This would bypass Quill's internal handling
      // For Quill-specific commands, use quill.format() or other Quill APIs
      // document.getElementById("quillEditorContainer").focus(); // Focus on Quill's editor
    }

    function insertImage(ev){
      const file=ev.target.files[0]; if(!file) return;
      const fr=new FileReader();
      fr.onload=e=>{
        const range = quill.getSelection(); // Get current cursor position
        if (range) {
          quill.insertEmbed(range.index, 'image', e.target.result);
        } else {
          quill.insertEmbed(quill.getLength(), 'image', e.target.result); // Insert at end if no selection
        }
      };
      fr.readAsDataURL(file);
    }

    function exportMarkdown(){
      if(currentSection===null||currentPage===null) return;
      const md=sections[currentSection][currentPage].markdown;
      const blob=new Blob([md],{type:"text/markdown"});
      const a=document.createElement("a");
      a.href=URL.createObjectURL(blob);
      a.download=sections[currentSection][currentPage].name.replace(/\s+/g,"_")+".md";
      a.click();
    }

    function importMarkdown(event){
      const file=event.target.files[0]; if(!file||currentSection===null||currentPage===null) return;
      const fr=new FileReader();
      fr.onload=e=>{ sections[currentSection][currentPage].markdown=e.target.result; saveToStorage(); loadPage(currentSection,currentPage); };
      fr.readAsText(file);
    }

    function saveData(){
      // reorder sections and pages into sections object
      const data={};
      document.querySelectorAll("#sections > .section").forEach(secDiv=>{
        const title=secDiv.querySelector(".section-header span").textContent;
        // Find the correct section from the original 'sections' object to preserve existing markdown
        const existingSectionPages = sections[title] || [];
        
        const newPagesOrder = [];
        secDiv.querySelectorAll(".page-title span").forEach(pgSpan => {
            const pageName = pgSpan.textContent;
            // Find the original page data with metadata
            const originalPage = existingSectionPages.find(p => p.name === pageName);
            if(originalPage){
              newPagesOrder.push(originalPage);
            } else {
              const now = new Date().toISOString();
              newPagesOrder.push({name: pageName, markdown: "", id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2), created: now, modified: now, color: ""});
            }
        });
        data[title] = newPagesOrder;
      });
      sections=data; saveToStorage();
    }

    function updateSearch(){
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

function toggleAttachments(){
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
// Template management
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

    function newPageWithTemplate(sec){
      if(!templates.length){
        return null;
      }
      const opts=templates.map((t,i)=>`${i+1}: ${t.name}`).join('\n');
      const choice=prompt(`Choose template number or Cancel for blank:\n${opts}`);
      const idx=parseInt(choice)-1;
      if(!isNaN(idx) && templates[idx]){
        return templates[idx].markdown;
      }
      return '';
    }

    // Command palette
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

    // Theme setup
    const themeSelect=document.getElementById("themeSelect");
    Object.keys(hermesThemes).forEach(name=>{
      const opt=document.createElement("option"); opt.value=name; opt.textContent=name; themeSelect.appendChild(opt);
    });
    themeSelect.onchange=()=>{
      document.documentElement.style.cssText=hermesThemes[themeSelect.value];
      localStorage.setItem("nextnote-theme", themeSelect.value);
    };
    
    // Load
    window.onload=function(){
      openNotebook(currentNotebook).then(()=>{
        updateNotebookSelect();
      });

      const savedTheme=localStorage.getItem("nextnote-theme")||"light";
      themeSelect.value=savedTheme;
      document.documentElement.style.cssText=hermesThemes[savedTheme];

      quill = new Quill('#quillEditorContainer', {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
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

      setInterval(()=>{ saveCurrentPage(); saveToStorage(); }, 10000);
    };

    document.addEventListener('keydown', function(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        console.log("Hotkey triggered: Saving page...");
        saveCurrentPage();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        showCommandPalette();
      }
      if(event.key === 'Escape') {
        hideCommandPalette();
      }
    });

    document.getElementById('commandInput').addEventListener('input', updateCommandResults);
    document.getElementById('commandInput').addEventListener('keydown', function(ev){
      if(ev.key==='Enter'){
        const first=document.querySelector('#commandResults div');
        if(first){ first.click(); }
      } else if(ev.key==='Escape'){
        hideCommandPalette();
      }
    });