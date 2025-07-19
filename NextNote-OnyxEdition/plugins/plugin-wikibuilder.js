// plugins/plugin-wikibuilder.js

window.registerNextNotePlugin({
  name: "WikiBuilder",
  onLoad: function(app) {
    // Wiki-specific styling
    const wikiStyle = document.createElement("style");
    wikiStyle.textContent = `
      .wiki-mode {
        --wiki-primary: #2c3e50;
        --wiki-secondary: #34495e;
        --wiki-accent: #3498db;
        --wiki-success: #27ae60;
        --wiki-warning: #f39c12;
        --wiki-danger: #e74c3c;
        --wiki-light: #ecf0f1;
        --wiki-dark: #2c3e50;
      }
      
      .wiki-toolbar {
        background: var(--wiki-primary);
        color: white;
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 15px;
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }
      
      .wiki-toolbar button {
        background: var(--wiki-accent);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }
      
      .wiki-toolbar button:hover {
        background: #2980b9;
      }
      
      .wiki-toolbar button.danger {
        background: var(--wiki-danger);
      }
      
      .wiki-toolbar button.danger:hover {
        background: #c0392b;
      }
      
      .wiki-navigation {
        background: var(--wiki-light);
        border: 1px solid #bdc3c7;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
      }
      
      .wiki-breadcrumb {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-bottom: 10px;
        font-size: 14px;
      }
      
      .wiki-breadcrumb a {
        color: var(--wiki-accent);
        text-decoration: none;
        padding: 2px 6px;
        border-radius: 3px;
        transition: background 0.2s;
      }
      
      .wiki-breadcrumb a:hover {
        background: rgba(52, 152, 219, 0.1);
      }
      
      .wiki-related-pages {
        background: white;
        border: 1px solid #ecf0f1;
        border-radius: 6px;
        padding: 12px;
        margin-top: 15px;
      }
      
      .wiki-related-pages h4 {
        margin: 0 0 10px 0;
        color: var(--wiki-primary);
        font-size: 14px;
      }
      
      .wiki-related-pages ul {
        margin: 0;
        padding-left: 20px;
      }
      
      .wiki-related-pages li {
        margin: 3px 0;
      }
      
      .wiki-related-pages a {
        color: var(--wiki-accent);
        text-decoration: none;
      }
      
      .wiki-related-pages a:hover {
        text-decoration: underline;
      }
      
      .wiki-categories {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
        margin: 10px 0;
      }
      
      .wiki-category {
        background: var(--wiki-accent);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        cursor: pointer;
      }
      
      .wiki-category:hover {
        background: #2980b9;
      }
      
      .wiki-edit-history {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 10px;
        margin-top: 15px;
        font-size: 12px;
        color: #6c757d;
      }
      
      .wiki-mode-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: var(--wiki-primary);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(wikiStyle);

    // Wiki state
    let wikiMode = false;
    let wikiCategories = JSON.parse(localStorage.getItem('nextnote_wiki_categories') || '[]');
    let wikiHistory = JSON.parse(localStorage.getItem('nextnote_wiki_history') || '[]');

    // Create wiki mode toggle button
    const wikiToggle = document.createElement('button');
    wikiToggle.className = 'wiki-mode-toggle';
    wikiToggle.textContent = '📚 Wiki Mode';
    wikiToggle.onclick = toggleWikiMode;
    document.body.appendChild(wikiToggle);

    function toggleWikiMode() {
      wikiMode = !wikiMode;
      if (wikiMode) {
        enableWikiMode();
        wikiToggle.textContent = '📝 Note Mode';
        wikiToggle.style.background = '#e74c3c';
      } else {
        disableWikiMode();
        wikiToggle.textContent = '📚 Wiki Mode';
        wikiToggle.style.background = 'var(--wiki-primary)';
      }
    }

    function enableWikiMode() {
      document.body.classList.add('wiki-mode');
      
      // Add wiki toolbar
      addWikiToolbar();
      
      // Add wiki navigation
      addWikiNavigation();
      
      // Add wiki features to current page
      if (app.currentPage()) {
        addWikiFeaturesToPage(app.currentPage());
      }
      
      // Listen for page changes
      app.on('pageSelected', function(data) {
        addWikiFeaturesToPage(data.page);
      });
    }

    function disableWikiMode() {
      document.body.classList.remove('wiki-mode');
      
      // Remove wiki elements
      const wikiElements = document.querySelectorAll('.wiki-toolbar, .wiki-navigation, .wiki-related-pages, .wiki-edit-history');
      wikiElements.forEach(el => el.remove());
    }

    function addWikiToolbar() {
      const toolbar = document.createElement('div');
      toolbar.className = 'wiki-toolbar';
      toolbar.innerHTML = `
        <button onclick="addWikiCategory()">🏷️ Add Category</button>
        <button onclick="showWikiHistory()">📜 History</button>
        <button onclick="exportWiki()">📤 Export Wiki</button>
        <button onclick="importWiki()">📥 Import Wiki</button>
        <button onclick="showWikiStats()">📊 Stats</button>
        <button onclick="createWikiIndex()">📋 Create Index</button>
        <button onclick="showWikiSearch()">🔍 Wiki Search</button>
      `;
      
      // Insert after main toolbar
      const mainToolbar = document.getElementById('toolbar');
      mainToolbar.parentNode.insertBefore(toolbar, mainToolbar.nextSibling);
    }

    function addWikiNavigation() {
      const navigation = document.createElement('div');
      navigation.className = 'wiki-navigation';
      navigation.innerHTML = `
        <div class="wiki-breadcrumb">
          <span>📚</span>
          <a href="#" onclick="goToWikiHome()">Home</a>
          <span>/</span>
          <span id="currentWikiPage">Current Page</span>
        </div>
        <div class="wiki-categories" id="wikiCategories">
          <!-- Categories will be populated here -->
        </div>
      `;
      
      // Insert before editor
      const editor = document.getElementById('quillEditorContainer');
      editor.parentNode.insertBefore(navigation, editor);
      
      updateWikiNavigation();
    }

    function addWikiFeaturesToPage(page) {
      if (!page) return;
      
      // Update breadcrumb
      const breadcrumb = document.getElementById('currentWikiPage');
      if (breadcrumb) {
        breadcrumb.textContent = page.title;
      }
      
      // Add related pages panel
      addRelatedPagesPanel(page);
      
      // Add edit history
      addEditHistory(page);
      
      // Update categories
      updateWikiCategories();
    }

    function addRelatedPagesPanel(page) {
      // Remove existing panel
      const existing = document.querySelector('.wiki-related-pages');
      if (existing) existing.remove();
      
      const relatedPages = findRelatedPages(page);
      
      const panel = document.createElement('div');
      panel.className = 'wiki-related-pages';
      panel.innerHTML = `
        <h4>🔗 Related Pages</h4>
        <ul>
          ${relatedPages.map(p => `<li><a href="#" onclick="selectPage('${p.section.id}', '${p.page.id}')">${p.page.title}</a></li>`).join('')}
        </ul>
      `;
      
      // Insert after editor
      const editor = document.getElementById('quillEditorContainer');
      editor.parentNode.insertBefore(panel, editor.nextSibling);
    }

    function addEditHistory(page) {
      const history = wikiHistory.filter(h => h.pageId === page.id);
      
      const historyPanel = document.createElement('div');
      historyPanel.className = 'wiki-edit-history';
      historyPanel.innerHTML = `
        <strong>📜 Edit History</strong><br>
        Last modified: ${new Date(page.modified).toLocaleString()}<br>
        Created: ${new Date(page.created).toLocaleString()}<br>
        ${history.length > 0 ? `Total edits: ${history.length}` : 'No edit history'}
      `;
      
      // Insert after related pages
      const relatedPages = document.querySelector('.wiki-related-pages');
      if (relatedPages) {
        relatedPages.parentNode.insertBefore(historyPanel, relatedPages.nextSibling);
      }
    }

    function findRelatedPages(page) {
      const related = [];
      const sections = app.sections();
      
      sections.forEach(section => {
        section.pages.forEach(p => {
          if (p.id !== page.id) {
            // Check for wiki links
            const links = extractWikiLinks(p.content || '');
            if (links.includes(page.title)) {
              related.push({ section, page: p });
            }
            
            // Check for tags
            if (p.tags && page.tags) {
              const commonTags = p.tags.filter(tag => page.tags.includes(tag));
              if (commonTags.length > 0) {
                related.push({ section, page: p });
              }
            }
          }
        });
      });
      
      return related.slice(0, 5); // Limit to 5 related pages
    }

    function updateWikiNavigation() {
      const categoriesContainer = document.getElementById('wikiCategories');
      if (!categoriesContainer) return;
      
      categoriesContainer.innerHTML = wikiCategories.map(cat => 
        `<span class="wiki-category" onclick="filterByCategory('${cat}')">${cat}</span>`
      ).join('');
    }

    function updateWikiCategories() {
      const sections = app.sections();
      const allTags = new Set();
      
      sections.forEach(section => {
        section.pages.forEach(page => {
          if (page.tags) {
            page.tags.forEach(tag => allTags.add(tag));
          }
        });
      });
      
      wikiCategories = Array.from(allTags);
      localStorage.setItem('nextnote_wiki_categories', JSON.stringify(wikiCategories));
      updateWikiNavigation();
    }

    // Wiki utility functions
    function addWikiCategory() {
      const category = prompt('Enter category name:');
      if (category && !wikiCategories.includes(category)) {
        wikiCategories.push(category);
        localStorage.setItem('nextnote_wiki_categories', JSON.stringify(wikiCategories));
        updateWikiNavigation();
      }
    }

    function showWikiHistory() {
      const history = wikiHistory.slice(-10); // Last 10 edits
      const historyText = history.map(h => 
        `${new Date(h.timestamp).toLocaleString()}: ${h.pageTitle}`
      ).join('\n');
      
      alert('Recent Wiki Edits:\n\n' + historyText);
    }

    function exportWiki() {
      const sections = app.sections();
      const wikiData = {
        title: 'NextNote Wiki Export',
        sections: sections,
        categories: wikiCategories,
        history: wikiHistory,
        exported: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(wikiData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nextnote-wiki-export.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    function importWiki() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
          try {
            const wikiData = JSON.parse(event.target.result);
            if (wikiData.sections) {
              // Import sections
              app.sections = () => wikiData.sections;
              app.renderSections();
              
              // Import categories
              if (wikiData.categories) {
                wikiCategories = wikiData.categories;
                localStorage.setItem('nextnote_wiki_categories', JSON.stringify(wikiCategories));
              }
              
              // Import history
              if (wikiData.history) {
                wikiHistory = wikiData.history;
                localStorage.setItem('nextnote_wiki_history', JSON.stringify(wikiHistory));
              }
              
              alert('Wiki imported successfully!');
            }
          } catch (err) {
            alert('Failed to import wiki: ' + err.message);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }

    function showWikiStats() {
      const sections = app.sections();
      let totalPages = 0;
      let totalWords = 0;
      
      sections.forEach(section => {
        totalPages += section.pages.length;
        section.pages.forEach(page => {
          const content = page.content || '';
          totalWords += content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        });
      });
      
      const stats = `
📊 Wiki Statistics

📚 Total Sections: ${sections.length}
📄 Total Pages: ${totalPages}
📝 Total Words: ${totalWords.toLocaleString()}
🏷️ Categories: ${wikiCategories.length}
📜 Edit History: ${wikiHistory.length} entries
      `;
      
      alert(stats);
    }

    function createWikiIndex() {
      const sections = app.sections();
      let indexContent = '# 📚 Wiki Index\n\n';
      
      sections.forEach(section => {
        indexContent += `## 📁 ${section.name}\n\n`;
        section.pages.forEach(page => {
          const tags = page.tags ? page.tags.map(t => `\`${t}\``).join(' ') : '';
          indexContent += `- [[${page.title}]] ${tags}\n`;
        });
        indexContent += '\n';
      });
      
      // Create index page
      const indexPage = {
        id: crypto.randomUUID(),
        title: 'Wiki Index',
        content: indexContent,
        tags: ['index', 'wiki'],
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
      
      // Add to first section
      if (sections.length > 0) {
        sections[0].pages.unshift(indexPage);
        app.saveData();
        app.renderSections();
        alert('Wiki index created!');
      }
    }

    function showWikiSearch() {
      const query = prompt('Search wiki pages:');
      if (!query) return;
      
      const sections = app.sections();
      const results = [];
      
      sections.forEach(section => {
        section.pages.forEach(page => {
          const content = page.content || '';
          const searchText = `${page.title} ${content}`.toLowerCase();
          if (searchText.includes(query.toLowerCase())) {
            results.push({ section, page });
          }
        });
      });
      
      if (results.length === 0) {
        alert('No results found.');
        return;
      }
      
      const resultText = results.map(r => 
        `${r.page.title} (${r.section.name})`
      ).join('\n');
      
      alert(`Search Results for "${query}":\n\n${resultText}`);
    }

    function goToWikiHome() {
      // Go to first page of first section
      const sections = app.sections();
      if (sections.length > 0 && sections[0].pages.length > 0) {
        app.selectPage(sections[0].pages[0].id, sections[0].id);
      }
    }

    function filterByCategory(category) {
      const sections = app.sections();
      const filteredPages = [];
      
      sections.forEach(section => {
        section.pages.forEach(page => {
          if (page.tags && page.tags.includes(category)) {
            filteredPages.push({ section, page });
          }
        });
      });
      
      if (filteredPages.length === 0) {
        alert(`No pages found in category "${category}"`);
        return;
      }
      
      const pageList = filteredPages.map(p => 
        `${p.page.title} (${p.section.name})`
      ).join('\n');
      
      alert(`Pages in category "${category}":\n\n${pageList}`);
    }

    // Make functions globally available
    window.addWikiCategory = addWikiCategory;
    window.showWikiHistory = showWikiHistory;
    window.exportWiki = exportWiki;
    window.importWiki = importWiki;
    window.showWikiStats = showWikiStats;
    window.createWikiIndex = createWikiIndex;
    window.showWikiSearch = showWikiSearch;
    window.goToWikiHome = goToWikiHome;
    window.filterByCategory = filterByCategory;
    window.toggleWikiMode = toggleWikiMode;

    // Track edit history
    const originalSave = app.saveCurrentPage;
    app.saveCurrentPage = function() {
      if (originalSave) originalSave();
      
      const currentPage = app.currentPage();
      if (currentPage) {
        wikiHistory.push({
          pageId: currentPage.id,
          pageTitle: currentPage.title,
          timestamp: new Date().toISOString(),
          action: 'edit'
        });
        
        // Keep only last 100 entries
        if (wikiHistory.length > 100) {
          wikiHistory = wikiHistory.slice(-100);
        }
        
        localStorage.setItem('nextnote_wiki_history', JSON.stringify(wikiHistory));
      }
    };
  }
}); 