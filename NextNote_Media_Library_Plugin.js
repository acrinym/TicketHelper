/**
 * NextNote Media Library Plugin
 * CC0/Creative Commons and Giphy integration for multimedia content
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Media Library',
  version: '1.0.0',
  description: 'CC0/Creative Commons and Giphy integration for multimedia content',
  
  onLoad(app) {
    this.mediaLibrary = JSON.parse(localStorage.getItem('nextnote_media_library') || '[]');
    this.favorites = JSON.parse(localStorage.getItem('nextnote_media_favorites') || '[]');
    this.searchHistory = JSON.parse(localStorage.getItem('nextnote_search_history') || '[]');
    this.currentSearch = '';
    this.currentResults = [];
    this.setupMediaLibraryUI(app);
    this.initializeMediaComponents(app);
    this.bindMediaEvents(app);
  },

  setupMediaLibraryUI(app) {
    const panel = app.createPanel('media-library', 'Media Library');
    
    // Header with media theme
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #ff9a9e, #fecfef, #fecfef, #fad0c4);
      border-radius: 12px;
      color: white;
      position: relative;
      overflow: hidden;
    `;

    // Floating media icons
    const mediaIcons = ['🖼️', '🎵', '🎬', '📸', '🎨', '✨'];
    mediaIcons.forEach((icon, index) => {
      const floatingIcon = document.createElement('div');
      floatingIcon.style.cssText = `
        position: absolute;
        font-size: 1.5em;
        opacity: 0.3;
        animation: float ${3 + index}s ease-in-out infinite;
        animation-delay: ${index * 0.5}s;
        pointer-events: none;
      `;
      floatingIcon.style.left = `${10 + index * 15}%`;
      floatingIcon.style.top = `${20 + (index % 2) * 40}%`;
      floatingIcon.textContent = icon;
      header.appendChild(floatingIcon);
    });

    const title = document.createElement('h3');
    title.style.cssText = `
      margin: 0; 
      color: white; 
      display: flex; 
      align-items: center; 
      gap: 10px;
      z-index: 1;
      position: relative;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      font-family: 'Comic Sans MS', cursive, sans-serif;
    `;
    title.innerHTML = '📚 Media Library';

    const uploadBtn = document.createElement('button');
    uploadBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      z-index: 1;
      position: relative;
      transition: all 0.3s;
      font-family: 'Comic Sans MS', cursive, sans-serif;
    `;
    uploadBtn.textContent = '📤 Upload Media';
    uploadBtn.addEventListener('click', () => this.uploadMedia(app));

    header.appendChild(title);
    header.appendChild(uploadBtn);
    panel.appendChild(header);

    // Search interface
    const searchSection = document.createElement('div');
    searchSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    `;

    searchSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🔍 Search Media</h4>
      
      <!-- Search Tabs -->
      <div style="display: flex; margin-bottom: 15px; border-bottom: 1px solid var(--hermes-border);">
        <button class="search-tab active" data-source="giphy" style="
          padding: 10px 20px;
          border: none;
          background: var(--hermes-highlight-bg);
          color: var(--hermes-highlight-text);
          cursor: pointer;
          border-bottom: 2px solid var(--hermes-highlight-bg);
          font-weight: bold;
        ">🎭 Giphy</button>
        <button class="search-tab" data-source="unsplash" style="
          padding: 10px 20px;
          border: none;
          background: transparent;
          color: var(--hermes-text);
          cursor: pointer;
          border-bottom: 2px solid transparent;
        ">📸 Unsplash</button>
        <button class="search-tab" data-source="pixabay" style="
          padding: 10px 20px;
          border: none;
          background: transparent;
          color: var(--hermes-text);
          cursor: pointer;
          border-bottom: 2px solid transparent;
        ">🎨 Pixabay</button>
        <button class="search-tab" data-source="freesound" style="
          padding: 10px 20px;
          border: none;
          background: transparent;
          color: var(--hermes-text);
          cursor: pointer;
          border-bottom: 2px solid transparent;
        ">🔊 Freesound</button>
      </div>

      <!-- Search Input -->
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <input type="text" id="media-search-input" placeholder="Search for images, GIFs, sounds..." style="
          flex: 1;
          padding: 12px;
          border: 1px solid var(--hermes-border);
          border-radius: 6px;
          background: var(--hermes-input-bg);
          color: var(--hermes-text);
          font-size: 14px;
        ">
        <button onclick="this.searchMedia()" style="
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          background: var(--hermes-success-text);
          color: white;
          cursor: pointer;
          font-weight: bold;
        ">🔍 Search</button>
      </div>

      <!-- Search Filters -->
      <div style="display: flex; gap: 15px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="color: var(--hermes-text); font-weight: bold;">Type:</label>
          <select id="media-type-filter" style="
            padding: 6px;
            border: 1px solid var(--hermes-border);
            border-radius: 4px;
            background: var(--hermes-input-bg);
            color: var(--hermes-text);
          ">
            <option value="all">All</option>
            <option value="photo">Photos</option>
            <option value="illustration">Illustrations</option>
            <option value="vector">Vectors</option>
          </select>
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="color: var(--hermes-text); font-weight: bold;">Size:</label>
          <select id="media-size-filter" style="
            padding: 6px;
            border: 1px solid var(--hermes-border);
            border-radius: 4px;
            background: var(--hermes-input-bg);
            color: var(--hermes-text);
          ">
            <option value="all">All Sizes</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="color: var(--hermes-text); font-weight: bold;">License:</label>
          <select id="media-license-filter" style="
            padding: 6px;
            border: 1px solid var(--hermes-border);
            border-radius: 4px;
            background: var(--hermes-input-bg);
            color: var(--hermes-text);
          ">
            <option value="cc0">CC0 (Public Domain)</option>
            <option value="cc">Creative Commons</option>
            <option value="all">All Licenses</option>
          </select>
        </div>
      </div>

      <!-- Search History -->
      <div style="margin-top: 15px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="color: var(--hermes-text); font-weight: bold; font-size: 0.9em;">Recent Searches:</span>
        </div>
        <div id="search-history" style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${this.searchHistory.slice(0, 8).map(term => `
            <button onclick="this.quickSearch('${term}')" style="
              padding: 4px 8px;
              border: 1px solid var(--hermes-border);
              border-radius: 12px;
              background: var(--hermes-bg);
              color: var(--hermes-text);
              cursor: pointer;
              font-size: 0.8em;
              transition: all 0.2s;
            " onmouseenter="this.style.background='var(--hermes-highlight-bg)'; this.style.color='var(--hermes-highlight-text)'" onmouseleave="this.style.background='var(--hermes-bg)'; this.style.color='var(--hermes-text)'">
              ${term}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    panel.appendChild(searchSection);

    // Results area
    const resultsSection = document.createElement('div');
    resultsSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    `;

    resultsSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: var(--hermes-text);">🎯 Search Results</h4>
        <div id="results-info" style="color: var(--hermes-disabled-text); font-size: 0.9em;">
          Search for media to see results
        </div>
      </div>
      
      <div id="media-results" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        min-height: 200px;
      ">
        <div style="
          grid-column: 1 / -1;
          text-align: center;
          color: var(--hermes-disabled-text);
          font-style: italic;
          padding: 60px 20px;
        ">
          <div style="font-size: 4em; margin-bottom: 20px;">🔍</div>
          <div style="font-size: 1.2em; margin-bottom: 10px;">Ready to Search!</div>
          <div>Use the search above to find amazing CC0 images, GIFs, and sounds</div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div id="pagination" style="
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin-top: 20px;
        display: none;
      ">
        <button onclick="this.previousPage()" style="
          padding: 8px 12px;
          border: 1px solid var(--hermes-border);
          border-radius: 4px;
          background: var(--hermes-button-bg);
          color: var(--hermes-text);
          cursor: pointer;
        ">← Previous</button>
        <span id="page-info" style="color: var(--hermes-text); font-weight: bold;">Page 1 of 1</span>
        <button onclick="this.nextPage()" style="
          padding: 8px 12px;
          border: 1px solid var(--hermes-border);
          border-radius: 4px;
          background: var(--hermes-button-bg);
          color: var(--hermes-text);
          cursor: pointer;
        ">Next →</button>
      </div>
    `;

    panel.appendChild(resultsSection);

    // My Library section
    const librarySection = document.createElement('div');
    librarySection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
    `;

    librarySection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: var(--hermes-text);">💾 My Library</h4>
        <div style="display: flex; gap: 10px;">
          <button onclick="this.showFavorites()" style="
            padding: 6px 12px;
            border: 1px solid var(--hermes-border);
            border-radius: 4px;
            background: var(--hermes-button-bg);
            color: var(--hermes-text);
            cursor: pointer;
            font-size: 0.9em;
          ">⭐ Favorites (${this.favorites.length})</button>
          <button onclick="this.clearLibrary()" style="
            padding: 6px 12px;
            border: 1px solid var(--hermes-border);
            border-radius: 4px;
            background: var(--hermes-error-text);
            color: white;
            cursor: pointer;
            font-size: 0.9em;
          ">🗑️ Clear</button>
        </div>
      </div>
      
      <div id="my-library" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
        min-height: 150px;
      ">
        ${this.mediaLibrary.length === 0 ? `
          <div style="
            grid-column: 1 / -1;
            text-align: center;
            color: var(--hermes-disabled-text);
            font-style: italic;
            padding: 40px 20px;
          ">
            <div style="font-size: 3em; margin-bottom: 15px;">📚</div>
            <div>Your media library is empty</div>
            <div style="font-size: 0.9em; margin-top: 5px;">Search and save media to build your collection</div>
          </div>
        ` : this.generateLibraryItems()}
      </div>
    `;

    panel.appendChild(librarySection);

    // Bind search events
    this.bindSearchEvents();
  },

  generateLibraryItems() {
    return this.mediaLibrary.map(item => `
      <div style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        padding: 8px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
      " onclick="this.useMediaItem('${item.id}')" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
        <div style="
          width: 100%;
          height: 80px;
          background-image: url('${item.thumbnail}');
          background-size: cover;
          background-position: center;
          border-radius: 4px;
          margin-bottom: 8px;
        "></div>
        <div style="font-size: 0.8em; color: var(--hermes-text); font-weight: bold; margin-bottom: 4px;">
          ${item.title.substring(0, 20)}${item.title.length > 20 ? '...' : ''}
        </div>
        <div style="font-size: 0.7em; color: var(--hermes-disabled-text);">
          ${item.type} • ${item.license}
        </div>
        <div style="display: flex; justify-content: center; gap: 4px; margin-top: 6px;">
          <button onclick="event.stopPropagation(); this.toggleFavorite('${item.id}')" style="
            padding: 2px 6px;
            border: none;
            border-radius: 3px;
            background: ${this.favorites.includes(item.id) ? '#ff6b6b' : 'var(--hermes-border)'};
            color: white;
            cursor: pointer;
            font-size: 0.7em;
          ">⭐</button>
          <button onclick="event.stopPropagation(); this.removeFromLibrary('${item.id}')" style="
            padding: 2px 6px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-error-text);
            color: white;
            cursor: pointer;
            font-size: 0.7em;
          ">🗑️</button>
        </div>
      </div>
    `).join('');
  },

  bindSearchEvents() {
    // Search tabs
    document.querySelectorAll('.search-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.search-tab').forEach(t => {
          t.style.background = 'transparent';
          t.style.color = 'var(--hermes-text)';
          t.style.borderBottomColor = 'transparent';
        });
        
        e.target.style.background = 'var(--hermes-highlight-bg)';
        e.target.style.color = 'var(--hermes-highlight-text)';
        e.target.style.borderBottomColor = 'var(--hermes-highlight-bg)';
        
        this.currentSource = e.target.dataset.source;
      });
    });

    // Search input
    const searchInput = document.getElementById('media-search-input');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchMedia();
        }
      });
    }

    this.currentSource = 'giphy';
  },

  searchMedia() {
    const searchInput = document.getElementById('media-search-input');
    const query = searchInput?.value.trim();
    
    if (!query) {
      alert('Please enter a search term');
      return;
    }

    this.currentSearch = query;
    this.addToSearchHistory(query);
    
    // Show loading state
    const resultsDiv = document.getElementById('media-results');
    const resultsInfo = document.getElementById('results-info');
    
    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <div style="
          grid-column: 1 / -1;
          text-align: center;
          color: var(--hermes-text);
          padding: 60px 20px;
        ">
          <div style="font-size: 4em; margin-bottom: 20px; animation: spin 2s linear infinite;">🔍</div>
          <div style="font-size: 1.2em; margin-bottom: 10px;">Searching ${this.currentSource}...</div>
          <div style="color: var(--hermes-disabled-text);">Finding the best ${this.currentSource === 'giphy' ? 'GIFs' : 'images'} for "${query}"</div>
        </div>
      `;
    }

    if (resultsInfo) {
      resultsInfo.textContent = 'Searching...';
    }

    // Simulate API call (in real implementation, this would call actual APIs)
    setTimeout(() => {
      this.displayMockResults(query);
    }, 1500);
  },

  displayMockResults(query) {
    // Mock results for demonstration
    const mockResults = this.generateMockResults(query);
    this.currentResults = mockResults;
    
    const resultsDiv = document.getElementById('media-results');
    const resultsInfo = document.getElementById('results-info');
    
    if (resultsInfo) {
      resultsInfo.textContent = `Found ${mockResults.length} results for "${query}"`;
    }
    
    if (resultsDiv) {
      resultsDiv.innerHTML = mockResults.map(result => `
        <div style="
          background: var(--hermes-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        " onmouseenter="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseleave="this.style.transform='scale(1)'; this.style.boxShadow='none'">
          <div style="
            width: 100%;
            height: 120px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
            border-radius: 6px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2em;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          ">${result.emoji}</div>
          
          <div style="font-size: 0.9em; color: var(--hermes-text); font-weight: bold; margin-bottom: 6px;">
            ${result.title}
          </div>
          
          <div style="font-size: 0.7em; color: var(--hermes-disabled-text); margin-bottom: 8px;">
            ${result.dimensions} • ${result.license}
          </div>
          
          <div style="display: flex; gap: 4px; justify-content: center;">
            <button onclick="this.addToLibrary('${result.id}')" style="
              padding: 4px 8px;
              border: none;
              border-radius: 4px;
              background: var(--hermes-success-text);
              color: white;
              cursor: pointer;
              font-size: 0.8em;
              font-weight: bold;
            ">💾 Save</button>
            <button onclick="this.useMediaDirect('${result.id}')" style="
              padding: 4px 8px;
              border: none;
              border-radius: 4px;
              background: var(--hermes-info-text);
              color: white;
              cursor: pointer;
              font-size: 0.8em;
              font-weight: bold;
            ">🎨 Use</button>
          </div>
          
          <!-- License badge -->
          <div style="
            position: absolute;
            top: 8px;
            right: 8px;
            background: ${result.license === 'CC0' ? '#4ecdc4' : '#ff9ff3'};
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 0.7em;
            font-weight: bold;
          ">${result.license}</div>
        </div>
      `).join('');
    }
  },

  generateMockResults(query) {
    const emojis = ['🎨', '🖼️', '🌟', '✨', '🎭', '🎪', '🎨', '🌈', '🎯', '🎲', '🎸', '🎵'];
    const licenses = ['CC0', 'CC BY', 'CC BY-SA'];
    const dimensions = ['640x480', '800x600', '1024x768', '1280x720', '1920x1080'];
    
    return Array.from({ length: 12 }, (_, i) => ({
      id: `mock-${Date.now()}-${i}`,
      title: `${query} ${i + 1}`,
      emoji: emojis[i % emojis.length],
      license: licenses[i % licenses.length],
      dimensions: dimensions[i % dimensions.length],
      source: this.currentSource,
      url: `https://example.com/media/${i + 1}`,
      thumbnail: `https://example.com/thumb/${i + 1}`
    }));
  },

  quickSearch(term) {
    const searchInput = document.getElementById('media-search-input');
    if (searchInput) {
      searchInput.value = term;
      this.searchMedia();
    }
  },

  addToSearchHistory(term) {
    if (!this.searchHistory.includes(term)) {
      this.searchHistory.unshift(term);
      this.searchHistory = this.searchHistory.slice(0, 10); // Keep only last 10
      this.saveSearchHistory();
    }
  },

  addToLibrary(resultId) {
    const result = this.currentResults.find(r => r.id === resultId);
    if (result && !this.mediaLibrary.find(item => item.id === resultId)) {
      this.mediaLibrary.push({
        ...result,
        addedAt: new Date().toISOString()
      });
      this.saveMediaLibrary();
      this.refreshLibraryDisplay();
      alert('Media added to your library!');
    }
  },

  useMediaDirect(resultId) {
    const result = this.currentResults.find(r => r.id === resultId);
    if (result) {
      // This would integrate with the Visual Card Studio to add the media to the current card
      console.log('Using media directly:', result);
      alert(`Using "${result.title}" in your card!`);
    }
  },

  useMediaItem(itemId) {
    const item = this.mediaLibrary.find(i => i.id === itemId);
    if (item) {
      console.log('Using library item:', item);
      alert(`Using "${item.title}" from your library!`);
    }
  },

  toggleFavorite(itemId) {
    const index = this.favorites.indexOf(itemId);
    if (index === -1) {
      this.favorites.push(itemId);
    } else {
      this.favorites.splice(index, 1);
    }
    this.saveFavorites();
    this.refreshLibraryDisplay();
  },

  removeFromLibrary(itemId) {
    if (confirm('Remove this item from your library?')) {
      this.mediaLibrary = this.mediaLibrary.filter(item => item.id !== itemId);
      this.favorites = this.favorites.filter(id => id !== itemId);
      this.saveMediaLibrary();
      this.saveFavorites();
      this.refreshLibraryDisplay();
    }
  },

  showFavorites() {
    const favoriteItems = this.mediaLibrary.filter(item => this.favorites.includes(item.id));
    const libraryDiv = document.getElementById('my-library');
    
    if (libraryDiv) {
      if (favoriteItems.length === 0) {
        libraryDiv.innerHTML = `
          <div style="
            grid-column: 1 / -1;
            text-align: center;
            color: var(--hermes-disabled-text);
            font-style: italic;
            padding: 40px 20px;
          ">
            <div style="font-size: 3em; margin-bottom: 15px;">⭐</div>
            <div>No favorites yet</div>
            <div style="font-size: 0.9em; margin-top: 5px;">Star items to add them to favorites</div>
          </div>
        `;
      } else {
        libraryDiv.innerHTML = favoriteItems.map(item => this.generateLibraryItem(item)).join('');
      }
    }
  },

  clearLibrary() {
    if (confirm('Are you sure you want to clear your entire media library?')) {
      this.mediaLibrary = [];
      this.favorites = [];
      this.saveMediaLibrary();
      this.saveFavorites();
      this.refreshLibraryDisplay();
    }
  },

  uploadMedia(app) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,audio/*,video/*';
    input.multiple = true;
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const mediaItem = {
            id: crypto.randomUUID(),
            title: file.name,
            type: file.type.split('/')[0],
            license: 'Personal',
            url: e.target.result,
            thumbnail: e.target.result,
            dimensions: 'Unknown',
            source: 'upload',
            addedAt: new Date().toISOString()
          };
          
          this.mediaLibrary.push(mediaItem);
          this.saveMediaLibrary();
          this.refreshLibraryDisplay();
        };
        reader.readAsDataURL(file);
      });
      
      app.showToast(`${files.length} file(s) uploaded to your library!`, 'success');
    };
    
    input.click();
  },

  refreshLibraryDisplay() {
    const libraryDiv = document.getElementById('my-library');
    if (libraryDiv) {
      libraryDiv.innerHTML = this.mediaLibrary.length === 0 ? `
        <div style="
          grid-column: 1 / -1;
          text-align: center;
          color: var(--hermes-disabled-text);
          font-style: italic;
          padding: 40px 20px;
        ">
          <div style="font-size: 3em; margin-bottom: 15px;">📚</div>
          <div>Your media library is empty</div>
          <div style="font-size: 0.9em; margin-top: 5px;">Search and save media to build your collection</div>
        </div>
      ` : this.generateLibraryItems();
    }
  },

  saveMediaLibrary() {
    localStorage.setItem('nextnote_media_library', JSON.stringify(this.mediaLibrary));
  },

  saveFavorites() {
    localStorage.setItem('nextnote_media_favorites', JSON.stringify(this.favorites));
  },

  saveSearchHistory() {
    localStorage.setItem('nextnote_search_history', JSON.stringify(this.searchHistory));
  },

  initializeMediaComponents(app) {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  },

  bindMediaEvents(app) {
    // Listen for media events
    app.on('mediaUpdated', () => {
      this.saveMediaLibrary();
    });
  }
});
