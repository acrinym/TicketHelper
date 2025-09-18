/**
 * NextNote Advanced Search Plugin
 * Full-text search across all content with smart filtering and organization
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Advanced Search',
  version: '1.0.0',
  description: 'Full-text search with smart filtering, tags, and saved searches',
  
  onLoad(app) {
    this.searchIndex = this.buildSearchIndex();
    this.savedSearches = JSON.parse(localStorage.getItem('nextnote_saved_searches') || '[]');
    this.searchHistory = JSON.parse(localStorage.getItem('nextnote_search_history') || '[]');
    this.setupSearchUI(app);
    this.initializeSearchComponents(app);
    this.bindSearchEvents(app);
  },

  setupSearchUI(app) {
    const panel = app.createPanel('advanced-search', 'Advanced Search');
    
    // Search header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, var(--hermes-info-text), var(--hermes-success-text));
      border-radius: 12px;
      color: white;
    `;

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0; color: white; display: flex; align-items: center; gap: 10px;';
    title.innerHTML = '🔍 Advanced Search';

    const indexInfo = document.createElement('div');
    indexInfo.style.cssText = `
      padding: 6px 12px;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      font-size: 0.8em;
    `;
    indexInfo.textContent = `${Object.keys(this.searchIndex).length} items indexed`;

    header.appendChild(title);
    header.appendChild(indexInfo);
    panel.appendChild(header);

    // Search input section
    const searchSection = document.createElement('div');
    searchSection.style.cssText = 'margin-bottom: 25px;';

    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
      position: relative;
      margin-bottom: 15px;
    `;

    const searchInput = document.createElement('input');
    searchInput.id = 'advanced-search-input';
    searchInput.type = 'text';
    searchInput.placeholder = 'Search across all content...';
    searchInput.style.cssText = `
      width: 100%;
      padding: 15px 50px 15px 20px;
      border: 2px solid var(--hermes-border);
      border-radius: 25px;
      background: var(--hermes-input-bg);
      color: var(--hermes-text);
      font-size: 16px;
      transition: all 0.2s;
    `;

    const searchButton = document.createElement('button');
    searchButton.style.cssText = `
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: var(--hermes-highlight-bg);
      color: var(--hermes-highlight-text);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    `;
    searchButton.innerHTML = '🔍';

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);

    // Search filters
    const filtersContainer = document.createElement('div');
    filtersContainer.style.cssText = `
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    `;

    const filters = [
      { id: 'content-type', label: 'Type', options: ['All', 'Pages', 'Projects', 'Code Files', 'Database Records'] },
      { id: 'date-range', label: 'Date', options: ['Any time', 'Today', 'This week', 'This month', 'This year'] },
      { id: 'sort-by', label: 'Sort', options: ['Relevance', 'Date modified', 'Date created', 'Title A-Z', 'Title Z-A'] }
    ];

    filters.forEach(filter => {
      const select = document.createElement('select');
      select.id = `search-${filter.id}`;
      select.style.cssText = `
        padding: 8px 12px;
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        background: var(--hermes-input-bg);
        color: var(--hermes-text);
        font-size: 14px;
      `;

      filter.options.forEach((option, index) => {
        const optionEl = document.createElement('option');
        optionEl.value = option.toLowerCase().replace(/\s+/g, '-');
        optionEl.textContent = option;
        if (index === 0) optionEl.selected = true;
        select.appendChild(optionEl);
      });

      const label = document.createElement('label');
      label.style.cssText = 'font-size: 14px; color: var(--hermes-text); font-weight: bold;';
      label.textContent = filter.label + ':';

      filtersContainer.appendChild(label);
      filtersContainer.appendChild(select);
    });

    searchSection.appendChild(searchContainer);
    searchSection.appendChild(filtersContainer);
    panel.appendChild(searchSection);

    // Quick actions
    const actionsSection = document.createElement('div');
    actionsSection.style.cssText = 'margin-bottom: 25px;';

    const actionsTitle = document.createElement('h4');
    actionsTitle.style.cssText = 'margin: 0 0 15px 0; color: var(--hermes-text);';
    actionsTitle.textContent = '⚡ Quick Actions';

    const actionsGrid = document.createElement('div');
    actionsGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
    `;

    const actions = [
      { id: 'save-search', icon: '💾', label: 'Save Search' },
      { id: 'clear-search', icon: '🗑️', label: 'Clear All' },
      { id: 'export-results', icon: '📤', label: 'Export Results' },
      { id: 'rebuild-index', icon: '🔄', label: 'Rebuild Index' }
    ];

    actions.forEach(action => {
      const button = document.createElement('button');
      button.style.cssText = `
        padding: 10px;
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        background: var(--hermes-button-bg);
        color: var(--hermes-text);
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: center;
        transition: all 0.2s;
      `;
      button.innerHTML = `${action.icon} ${action.label}`;
      button.addEventListener('click', () => this.handleAction(action.id, app));
      button.addEventListener('mouseenter', () => {
        button.style.borderColor = 'var(--hermes-highlight-bg)';
        button.style.background = 'var(--hermes-button-hover)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.borderColor = 'var(--hermes-border)';
        button.style.background = 'var(--hermes-button-bg)';
      });
      actionsGrid.appendChild(button);
    });

    actionsSection.appendChild(actionsTitle);
    actionsSection.appendChild(actionsGrid);
    panel.appendChild(actionsSection);

    // Search results
    const resultsSection = document.createElement('div');
    resultsSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">📋 Search Results</h4>
      <div id="search-results" style="
        min-height: 200px;
        padding: 20px;
        background: var(--hermes-panel-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 8px;
        color: var(--hermes-disabled-text);
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      ">
        <div style="font-size: 3em; margin-bottom: 15px;">🔍</div>
        <div style="font-size: 1.1em; margin-bottom: 10px; color: var(--hermes-text);">Ready to Search</div>
        <div>Enter a search term to find content across your entire workspace</div>
      </div>
    `;
    panel.appendChild(resultsSection);

    // Saved searches
    const savedSection = document.createElement('div');
    savedSection.style.cssText = 'margin-top: 25px;';
    savedSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">⭐ Saved Searches</h4>
      <div id="saved-searches" style="
        min-height: 100px;
        padding: 15px;
        background: var(--hermes-panel-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 8px;
      "></div>
    `;
    panel.appendChild(savedSection);

    // Bind search events
    searchInput.addEventListener('input', (e) => {
      if (e.target.value.length > 2) {
        this.performSearch(e.target.value);
      } else if (e.target.value.length === 0) {
        this.clearResults();
      }
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch(e.target.value);
      }
    });

    searchButton.addEventListener('click', () => {
      this.performSearch(searchInput.value);
    });

    // Update saved searches display
    this.updateSavedSearches();
  },

  buildSearchIndex() {
    const index = {};
    
    try {
      // Index pages
      const pages = JSON.parse(localStorage.getItem('nextnote_pages') || '[]');
      pages.forEach(page => {
        index[`page_${page.id}`] = {
          type: 'page',
          id: page.id,
          title: page.title || 'Untitled',
          content: this.stripHTML(page.content || ''),
          created: page.created,
          modified: page.modified,
          tags: page.tags || [],
          searchText: `${page.title || ''} ${this.stripHTML(page.content || '')}`.toLowerCase()
        };
      });

      // Index projects
      const projects = JSON.parse(localStorage.getItem('nextnote_projects') || '[]');
      projects.forEach(project => {
        index[`project_${project.id}`] = {
          type: 'project',
          id: project.id,
          title: project.name,
          content: project.description || '',
          created: project.created,
          modified: project.modified,
          searchText: `${project.name} ${project.description || ''}`.toLowerCase()
        };
      });

      // Index code files
      const codeFiles = JSON.parse(localStorage.getItem('nextnote_code_files') || '[]');
      codeFiles.forEach(file => {
        index[`code_${file.id}`] = {
          type: 'code',
          id: file.id,
          title: file.name,
          content: file.content || '',
          language: file.language,
          created: file.created,
          modified: file.modified,
          searchText: `${file.name} ${file.content || ''}`.toLowerCase()
        };
      });

      // Index database records
      const databases = JSON.parse(localStorage.getItem('nextnote_databases') || '[]');
      databases.forEach(db => {
        db.records.forEach(record => {
          const recordText = Object.values(record.data).join(' ');
          index[`db_${record.id}`] = {
            type: 'database',
            id: record.id,
            title: record.data[db.fields.find(f => f.primary)?.id] || 'Untitled Record',
            content: recordText,
            database: db.name,
            created: record.created,
            modified: record.modified,
            searchText: recordText.toLowerCase()
          };
        });
      });

    } catch (error) {
      console.error('Error building search index:', error);
    }

    return index;
  },

  stripHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  },

  performSearch(query) {
    if (!query || query.length < 1) {
      this.clearResults();
      return;
    }

    const results = this.searchContent(query);
    this.displayResults(results, query);
    this.addToSearchHistory(query);
  },

  searchContent(query) {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    const results = [];

    Object.values(this.searchIndex).forEach(item => {
      let score = 0;
      let matches = [];

      searchTerms.forEach(term => {
        // Title matches (higher weight)
        if (item.title.toLowerCase().includes(term)) {
          score += 10;
          matches.push({ type: 'title', term, text: item.title });
        }

        // Content matches
        if (item.searchText.includes(term)) {
          score += 5;
          matches.push({ type: 'content', term, text: this.getContextSnippet(item.searchText, term) });
        }

        // Tag matches (if available)
        if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term))) {
          score += 8;
          matches.push({ type: 'tag', term, text: item.tags.join(', ') });
        }
      });

      if (score > 0) {
        results.push({
          ...item,
          score,
          matches,
          relevance: score / searchTerms.length
        });
      }
    });

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  },

  getContextSnippet(text, term, contextLength = 100) {
    const index = text.indexOf(term);
    if (index === -1) return text.substring(0, contextLength) + '...';

    const start = Math.max(0, index - contextLength / 2);
    const end = Math.min(text.length, index + term.length + contextLength / 2);
    
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
  },

  displayResults(results, query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; color: var(--hermes-disabled-text);">
          <div style="font-size: 3em; margin-bottom: 15px;">🔍</div>
          <div style="font-size: 1.1em; margin-bottom: 10px; color: var(--hermes-text);">No Results Found</div>
          <div>No content matches "${query}". Try different search terms.</div>
        </div>
      `;
      return;
    }

    let html = `
      <div style="margin-bottom: 15px; padding: 10px; background: var(--hermes-bg); border-radius: 6px;">
        <strong style="color: var(--hermes-text);">Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"</strong>
      </div>
    `;

    results.slice(0, 20).forEach(result => {
      html += `
        <div style="
          margin-bottom: 15px;
          padding: 15px;
          background: var(--hermes-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        " onmouseenter="this.style.borderColor='var(--hermes-highlight-bg)'" onmouseleave="this.style.borderColor='var(--hermes-border)'" onclick="this.openSearchResult('${result.type}', '${result.id}')">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <h5 style="margin: 0; color: var(--hermes-text); display: flex; align-items: center; gap: 8px;">
              ${this.getTypeIcon(result.type)} ${result.title}
            </h5>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="
                padding: 2px 8px;
                background: var(--hermes-highlight-bg);
                color: var(--hermes-highlight-text);
                border-radius: 12px;
                font-size: 0.7em;
                text-transform: uppercase;
              ">${result.type}</span>
              <span style="
                padding: 2px 8px;
                background: var(--hermes-info-text);
                color: white;
                border-radius: 12px;
                font-size: 0.7em;
              ">${Math.round(result.relevance)}% match</span>
            </div>
          </div>
          <div style="color: var(--hermes-disabled-text); font-size: 0.9em; line-height: 1.4; margin-bottom: 8px;">
            ${this.highlightMatches(result.content.substring(0, 200) + (result.content.length > 200 ? '...' : ''), query)}
          </div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">
            Modified: ${new Date(result.modified).toLocaleDateString()} • 
            ${result.database ? `Database: ${result.database}` : ''}
            ${result.language ? `Language: ${result.language}` : ''}
          </div>
        </div>
      `;
    });

    resultsContainer.innerHTML = html;
  },

  getTypeIcon(type) {
    const icons = {
      page: '📄',
      project: '📊',
      code: '💻',
      database: '🗄️'
    };
    return icons[type] || '📄';
  },

  highlightMatches(text, query) {
    const terms = query.toLowerCase().split(/\s+/);
    let highlighted = text;
    
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark style="background: var(--hermes-warning-text); color: black; padding: 1px 2px; border-radius: 2px;">$1</mark>');
    });
    
    return highlighted;
  },

  clearResults() {
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; color: var(--hermes-disabled-text);">
          <div style="font-size: 3em; margin-bottom: 15px;">🔍</div>
          <div style="font-size: 1.1em; margin-bottom: 10px; color: var(--hermes-text);">Ready to Search</div>
          <div>Enter a search term to find content across your entire workspace</div>
        </div>
      `;
    }
  },

  handleAction(actionId, app) {
    switch (actionId) {
      case 'save-search':
        this.saveCurrentSearch(app);
        break;
      case 'clear-search':
        this.clearSearch(app);
        break;
      case 'export-results':
        this.exportResults(app);
        break;
      case 'rebuild-index':
        this.rebuildIndex(app);
        break;
    }
  },

  saveCurrentSearch(app) {
    const searchInput = document.getElementById('advanced-search-input');
    if (!searchInput || !searchInput.value.trim()) {
      app.showToast('Enter a search term first', 'warning');
      return;
    }

    const searchName = prompt('Enter a name for this saved search:');
    if (!searchName) return;

    const savedSearch = {
      id: crypto.randomUUID(),
      name: searchName,
      query: searchInput.value.trim(),
      filters: this.getCurrentFilters(),
      created: new Date().toISOString()
    };

    this.savedSearches.push(savedSearch);
    this.saveSavedSearches();
    this.updateSavedSearches();
    app.showToast(`Search "${searchName}" saved successfully!`, 'success');
  },

  getCurrentFilters() {
    return {
      contentType: document.getElementById('search-content-type')?.value || 'all',
      dateRange: document.getElementById('search-date-range')?.value || 'any-time',
      sortBy: document.getElementById('search-sort-by')?.value || 'relevance'
    };
  },

  clearSearch(app) {
    const searchInput = document.getElementById('advanced-search-input');
    if (searchInput) searchInput.value = '';
    this.clearResults();
    app.showToast('Search cleared', 'info');
  },

  exportResults(app) {
    app.showToast('Export functionality coming soon!', 'info');
  },

  rebuildIndex(app) {
    this.searchIndex = this.buildSearchIndex();
    const indexInfo = document.querySelector('.search-header .index-info');
    if (indexInfo) {
      indexInfo.textContent = `${Object.keys(this.searchIndex).length} items indexed`;
    }
    app.showToast('Search index rebuilt successfully!', 'success');
  },

  updateSavedSearches() {
    const container = document.getElementById('saved-searches');
    if (!container) return;

    if (this.savedSearches.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic;">
          No saved searches yet. Save your first search to quickly access it later!
        </div>
      `;
      return;
    }

    container.innerHTML = this.savedSearches.map(search => `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        margin-bottom: 8px;
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        cursor: pointer;
      " onclick="this.loadSavedSearch('${search.id}')">
        <div>
          <div style="font-weight: bold; color: var(--hermes-text);">${search.name}</div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">
            "${search.query}" • Saved: ${new Date(search.created).toLocaleDateString()}
          </div>
        </div>
        <button onclick="event.stopPropagation(); this.deleteSavedSearch('${search.id}')" style="
          padding: 4px 8px;
          border: none;
          border-radius: 3px;
          background: var(--hermes-error-text);
          color: white;
          cursor: pointer;
          font-size: 0.8em;
        ">🗑️</button>
      </div>
    `).join('');
  },

  loadSavedSearch(searchId) {
    const search = this.savedSearches.find(s => s.id === searchId);
    if (!search) return;

    const searchInput = document.getElementById('advanced-search-input');
    if (searchInput) {
      searchInput.value = search.query;
      this.performSearch(search.query);
    }
  },

  deleteSavedSearch(searchId) {
    if (confirm('Are you sure you want to delete this saved search?')) {
      this.savedSearches = this.savedSearches.filter(s => s.id !== searchId);
      this.saveSavedSearches();
      this.updateSavedSearches();
    }
  },

  addToSearchHistory(query) {
    if (!this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      if (this.searchHistory.length > 50) {
        this.searchHistory = this.searchHistory.slice(0, 50);
      }
      localStorage.setItem('nextnote_search_history', JSON.stringify(this.searchHistory));
    }
  },

  saveSavedSearches() {
    localStorage.setItem('nextnote_saved_searches', JSON.stringify(this.savedSearches));
  },

  openSearchResult(type, id) {
    // This would integrate with the main NextNote app to open the specific item
    console.log(`Opening ${type} with ID: ${id}`);
  },

  initializeSearchComponents(app) {
    // Initialize search components
  },

  bindSearchEvents(app) {
    // Listen for content changes to update search index
    app.on('contentUpdated', () => {
      this.searchIndex = this.buildSearchIndex();
    });
  }
});
