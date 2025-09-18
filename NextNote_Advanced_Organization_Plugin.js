/**
 * NextNote Advanced Organization Plugin
 * Smart folders, auto-categorization, and intelligent content organization
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Advanced Organization',
  version: '1.0.0',
  description: 'Smart folders, auto-categorization, and intelligent content organization',
  
  onLoad(app) {
    this.smartFolders = JSON.parse(localStorage.getItem('nextnote_smart_folders') || '[]');
    this.organizationRules = JSON.parse(localStorage.getItem('nextnote_organization_rules') || '[]');
    this.tags = JSON.parse(localStorage.getItem('nextnote_tags') || '[]');
    this.setupOrganizationUI(app);
    this.initializeOrganizationComponents(app);
    this.bindOrganizationEvents(app);
  },

  setupOrganizationUI(app) {
    const panel = app.createPanel('advanced-organization', 'Organization');
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 12px;
      color: white;
    `;

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0; color: white; display: flex; align-items: center; gap: 10px;';
    title.innerHTML = '🗂️ Advanced Organization';

    const statsDiv = document.createElement('div');
    statsDiv.style.cssText = 'font-size: 0.9em; text-align: right;';
    statsDiv.innerHTML = `
      <div style="font-weight: bold;">${this.smartFolders.length} Smart Folders</div>
      <div style="opacity: 0.8;">${this.tags.length} Tags</div>
    `;

    header.appendChild(title);
    header.appendChild(statsDiv);
    panel.appendChild(header);

    // Organization tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = `
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--hermes-border);
    `;

    const tabs = [
      { id: 'smart-folders', label: '📁 Smart Folders', icon: '📁' },
      { id: 'auto-tagging', label: '🏷️ Auto-Tagging', icon: '🏷️' },
      { id: 'organization-rules', label: '⚙️ Rules', icon: '⚙️' },
      { id: 'content-analysis', label: '📊 Analysis', icon: '📊' }
    ];

    tabs.forEach((tab, index) => {
      const tabButton = document.createElement('button');
      tabButton.className = `organization-tab ${index === 0 ? 'active' : ''}`;
      tabButton.style.cssText = `
        padding: 12px 20px;
        border: none;
        background: ${index === 0 ? 'var(--hermes-highlight-bg)' : 'transparent'};
        color: ${index === 0 ? 'var(--hermes-highlight-text)' : 'var(--hermes-text)'};
        cursor: pointer;
        border-bottom: 2px solid ${index === 0 ? 'var(--hermes-highlight-bg)' : 'transparent'};
        transition: all 0.2s;
        font-weight: bold;
      `;
      tabButton.textContent = tab.label;
      tabButton.addEventListener('click', () => this.switchOrganizationTab(tab.id));
      tabsContainer.appendChild(tabButton);
    });

    panel.appendChild(tabsContainer);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.id = 'organization-content-area';
    contentArea.style.cssText = 'min-height: 500px;';
    panel.appendChild(contentArea);

    // Initialize with smart folders
    this.switchOrganizationTab('smart-folders');
  },

  switchOrganizationTab(tabId) {
    // Update tab styles
    document.querySelectorAll('.organization-tab').forEach(tab => {
      tab.style.background = 'transparent';
      tab.style.color = 'var(--hermes-text)';
      tab.style.borderBottomColor = 'transparent';
    });

    const activeTab = document.querySelector(`.organization-tab:nth-child(${['smart-folders', 'auto-tagging', 'organization-rules', 'content-analysis'].indexOf(tabId) + 1})`);
    if (activeTab) {
      activeTab.style.background = 'var(--hermes-highlight-bg)';
      activeTab.style.color = 'var(--hermes-highlight-text)';
      activeTab.style.borderBottomColor = 'var(--hermes-highlight-bg)';
    }

    // Update content
    const contentArea = document.getElementById('organization-content-area');
    if (!contentArea) return;

    switch (tabId) {
      case 'smart-folders':
        contentArea.innerHTML = this.generateSmartFoldersView();
        this.bindSmartFoldersEvents();
        break;
      case 'auto-tagging':
        contentArea.innerHTML = this.generateAutoTaggingView();
        this.bindAutoTaggingEvents();
        break;
      case 'organization-rules':
        contentArea.innerHTML = this.generateOrganizationRulesView();
        this.bindOrganizationRulesEvents();
        break;
      case 'content-analysis':
        contentArea.innerHTML = this.generateContentAnalysisView();
        this.bindContentAnalysisEvents();
        break;
    }
  },

  generateSmartFoldersView() {
    return `
      <div class="smart-folders-view">
        <!-- Create Smart Folder -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">➕ Create Smart Folder</h4>
          
          <form id="smart-folder-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Folder Name</label>
                <input type="text" id="folder-name" placeholder="e.g., Recent Projects" required style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid var(--hermes-border);
                  border-radius: 4px;
                  background: var(--hermes-input-bg);
                  color: var(--hermes-text);
                ">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Icon</label>
                <select id="folder-icon" style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid var(--hermes-border);
                  border-radius: 4px;
                  background: var(--hermes-input-bg);
                  color: var(--hermes-text);
                ">
                  <option value="📁">📁 Default Folder</option>
                  <option value="📊">📊 Projects</option>
                  <option value="📝">📝 Notes</option>
                  <option value="💼">💼 Work</option>
                  <option value="🎯">🎯 Goals</option>
                  <option value="📚">📚 Research</option>
                  <option value="💡">💡 Ideas</option>
                  <option value="🔥">🔥 Priority</option>
                </select>
              </div>
            </div>

            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Smart Criteria</label>
              <select id="folder-criteria" style="
                width: 100%;
                padding: 10px;
                border: 1px solid var(--hermes-border);
                border-radius: 4px;
                background: var(--hermes-input-bg);
                color: var(--hermes-text);
              ">
                <option value="recent">Recently Modified (Last 7 days)</option>
                <option value="today">Created Today</option>
                <option value="this-week">Created This Week</option>
                <option value="contains-keyword">Contains Keyword</option>
                <option value="has-tag">Has Specific Tag</option>
                <option value="content-type">Specific Content Type</option>
                <option value="large-files">Large Files (>1MB)</option>
                <option value="no-tags">Untagged Content</option>
              </select>
            </div>

            <div id="criteria-options" style="margin-bottom: 15px;">
              <!-- Dynamic options based on criteria selection -->
            </div>

            <button type="submit" style="
              width: 100%;
              padding: 12px;
              border: none;
              border-radius: 6px;
              background: var(--hermes-success-text);
              color: white;
              cursor: pointer;
              font-weight: bold;
            ">Create Smart Folder</button>
          </form>
        </div>

        <!-- Existing Smart Folders -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">📂 Your Smart Folders</h4>
          <div id="smart-folders-list">
            ${this.smartFolders.length === 0 ? `
              <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic; padding: 40px;">
                No smart folders yet. Create your first smart folder to automatically organize your content!
              </div>
            ` : this.smartFolders.map(folder => `
              <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                margin-bottom: 10px;
                background: var(--hermes-bg);
                border: 1px solid var(--hermes-border);
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
              " onmouseenter="this.style.borderColor='var(--hermes-highlight-bg)'" onmouseleave="this.style.borderColor='var(--hermes-border)'" onclick="this.openSmartFolder('${folder.id}')">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="font-size: 1.5em;">${folder.icon}</div>
                  <div>
                    <div style="font-weight: bold; color: var(--hermes-text);">${folder.name}</div>
                    <div style="font-size: 0.9em; color: var(--hermes-disabled-text);">
                      ${folder.description} • ${this.getSmartFolderCount(folder)} items
                    </div>
                  </div>
                </div>
                <div style="display: flex; gap: 5px;">
                  <button onclick="event.stopPropagation(); this.editSmartFolder('${folder.id}')" style="
                    padding: 6px 10px;
                    border: none;
                    border-radius: 4px;
                    background: var(--hermes-info-text);
                    color: white;
                    cursor: pointer;
                    font-size: 0.8em;
                  ">✏️ Edit</button>
                  <button onclick="event.stopPropagation(); this.deleteSmartFolder('${folder.id}')" style="
                    padding: 6px 10px;
                    border: none;
                    border-radius: 4px;
                    background: var(--hermes-error-text);
                    color: white;
                    cursor: pointer;
                    font-size: 0.8em;
                  ">🗑️ Delete</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  generateAutoTaggingView() {
    return `
      <div class="auto-tagging-view">
        <!-- Auto-Tagging Settings -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🤖 Auto-Tagging Settings</h4>
          
          <div style="margin-bottom: 20px;">
            <label style="display: flex; align-items: center; gap: 8px; color: var(--hermes-text); margin-bottom: 10px;">
              <input type="checkbox" id="enable-auto-tagging" checked>
              <strong>Enable automatic tagging for new content</strong>
            </label>
            <p style="color: var(--hermes-disabled-text); margin: 0; font-size: 0.9em;">
              Automatically suggest and apply tags based on content analysis
            </p>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: flex; align-items: center; gap: 8px; color: var(--hermes-text); margin-bottom: 10px;">
              <input type="checkbox" id="suggest-tags">
              <strong>Suggest tags instead of auto-applying</strong>
            </label>
            <p style="color: var(--hermes-disabled-text); margin: 0; font-size: 0.9em;">
              Show tag suggestions that you can approve before applying
            </p>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Minimum Confidence Level</label>
            <input type="range" id="confidence-level" min="0" max="100" value="70" style="width: 100%; margin-bottom: 5px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8em; color: var(--hermes-disabled-text);">
              <span>Low (0%)</span>
              <span id="confidence-value">70%</span>
              <span>High (100%)</span>
            </div>
          </div>

          <button onclick="this.runAutoTagging()" style="
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 6px;
            background: var(--hermes-info-text);
            color: white;
            cursor: pointer;
            font-weight: bold;
          ">🚀 Run Auto-Tagging on Existing Content</button>
        </div>

        <!-- Tag Management -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🏷️ Tag Management</h4>
          
          <div style="margin-bottom: 15px;">
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
              <input type="text" id="new-tag-input" placeholder="Add new tag..." style="
                flex: 1;
                padding: 10px;
                border: 1px solid var(--hermes-border);
                border-radius: 4px;
                background: var(--hermes-input-bg);
                color: var(--hermes-text);
              ">
              <button onclick="this.addNewTag()" style="
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                background: var(--hermes-success-text);
                color: white;
                cursor: pointer;
                font-weight: bold;
              ">Add Tag</button>
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <strong style="color: var(--hermes-text);">Existing Tags:</strong>
            <div style="
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 10px;
              min-height: 40px;
              padding: 10px;
              background: var(--hermes-bg);
              border: 1px solid var(--hermes-border);
              border-radius: 4px;
            ">
              ${this.tags.length === 0 ? `
                <span style="color: var(--hermes-disabled-text); font-style: italic;">No tags yet</span>
              ` : this.tags.map(tag => `
                <span style="
                  display: inline-flex;
                  align-items: center;
                  gap: 5px;
                  padding: 4px 8px;
                  background: var(--hermes-highlight-bg);
                  color: var(--hermes-highlight-text);
                  border-radius: 12px;
                  font-size: 0.8em;
                ">
                  ${tag.name}
                  <button onclick="this.removeTag('${tag.id}')" style="
                    border: none;
                    background: none;
                    color: inherit;
                    cursor: pointer;
                    padding: 0;
                    font-size: 1em;
                  ">×</button>
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Tag Suggestions -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">💡 Suggested Tags</h4>
          <div id="tag-suggestions">
            <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic; padding: 20px;">
              Run content analysis to see tag suggestions
            </div>
          </div>
        </div>
      </div>
    `;
  },

  generateOrganizationRulesView() {
    return `
      <div class="organization-rules-view">
        <div style="text-align: center; padding: 60px 20px; color: var(--hermes-disabled-text);">
          <div style="font-size: 4em; margin-bottom: 20px;">⚙️</div>
          <h3 style="color: var(--hermes-text); margin-bottom: 10px;">Organization Rules Coming Soon</h3>
          <p style="margin-bottom: 20px;">Create custom rules for automatic content organization.</p>
          <div style="
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 8px;
            padding: 20px;
            max-width: 400px;
            margin: 0 auto;
          ">
            <h4 style="color: var(--hermes-text); margin-bottom: 15px;">Planned Rule Types</h4>
            <div style="text-align: left; color: var(--hermes-text);">
              • If content contains X, move to folder Y<br>
              • Auto-archive old content<br>
              • Duplicate detection and merging<br>
              • Content type-based organization<br>
              • Priority-based sorting
            </div>
          </div>
        </div>
      </div>
    `;
  },

  generateContentAnalysisView() {
    const pages = JSON.parse(localStorage.getItem('nextnote_pages') || '[]');
    const projects = JSON.parse(localStorage.getItem('nextnote_projects') || '[]');
    const codeFiles = JSON.parse(localStorage.getItem('nextnote_code_files') || '[]');
    
    const totalContent = pages.length + projects.length + codeFiles.length;
    const untaggedContent = pages.filter(p => !p.tags || p.tags.length === 0).length;
    const recentContent = pages.filter(p => {
      const created = new Date(p.created);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length;

    return `
      <div class="content-analysis-view">
        <!-- Content Statistics -->
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        ">
          <div style="
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          ">
            <div style="font-size: 2em; color: var(--hermes-info-text);">📊</div>
            <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-text); margin: 10px 0;">
              ${totalContent}
            </div>
            <div style="color: var(--hermes-disabled-text);">Total Items</div>
          </div>
          
          <div style="
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          ">
            <div style="font-size: 2em; color: var(--hermes-warning-text);">🏷️</div>
            <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-text); margin: 10px 0;">
              ${untaggedContent}
            </div>
            <div style="color: var(--hermes-disabled-text);">Untagged</div>
          </div>
          
          <div style="
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          ">
            <div style="font-size: 2em; color: var(--hermes-success-text);">📅</div>
            <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-text); margin: 10px 0;">
              ${recentContent}
            </div>
            <div style="color: var(--hermes-disabled-text);">This Week</div>
          </div>
          
          <div style="
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          ">
            <div style="font-size: 2em; color: var(--hermes-highlight-bg);">📁</div>
            <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-text); margin: 10px 0;">
              ${this.smartFolders.length}
            </div>
            <div style="color: var(--hermes-disabled-text);">Smart Folders</div>
          </div>
        </div>

        <!-- Content Health -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">📈 Content Health Score</h4>
          
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: var(--hermes-text);">Organization Score</span>
              <span style="color: var(--hermes-text); font-weight: bold;">${this.calculateOrganizationScore()}%</span>
            </div>
            <div style="
              width: 100%;
              height: 8px;
              background: var(--hermes-border);
              border-radius: 4px;
              overflow: hidden;
            ">
              <div style="
                width: ${this.calculateOrganizationScore()}%;
                height: 100%;
                background: linear-gradient(90deg, var(--hermes-error-text), var(--hermes-warning-text), var(--hermes-success-text));
                transition: width 0.3s;
              "></div>
            </div>
          </div>

          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 20px;
          ">
            <div style="text-align: center;">
              <div style="font-size: 1.2em; font-weight: bold; color: var(--hermes-text);">
                ${Math.round((totalContent - untaggedContent) / totalContent * 100) || 0}%
              </div>
              <div style="font-size: 0.9em; color: var(--hermes-disabled-text);">Tagged Content</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 1.2em; font-weight: bold; color: var(--hermes-text);">
                ${this.smartFolders.length}
              </div>
              <div style="font-size: 0.9em; color: var(--hermes-disabled-text);">Smart Folders</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 1.2em; font-weight: bold; color: var(--hermes-text);">
                ${this.organizationRules.length}
              </div>
              <div style="font-size: 0.9em; color: var(--hermes-disabled-text);">Active Rules</div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">💡 Organization Recommendations</h4>
          <div id="organization-recommendations">
            ${this.generateRecommendations()}
          </div>
        </div>
      </div>
    `;
  },

  calculateOrganizationScore() {
    const pages = JSON.parse(localStorage.getItem('nextnote_pages') || '[]');
    const totalContent = pages.length;
    
    if (totalContent === 0) return 100;
    
    const taggedContent = pages.filter(p => p.tags && p.tags.length > 0).length;
    const tagScore = (taggedContent / totalContent) * 40;
    
    const folderScore = Math.min(this.smartFolders.length * 10, 30);
    const ruleScore = Math.min(this.organizationRules.length * 15, 30);
    
    return Math.round(tagScore + folderScore + ruleScore);
  },

  generateRecommendations() {
    const pages = JSON.parse(localStorage.getItem('nextnote_pages') || '[]');
    const untaggedCount = pages.filter(p => !p.tags || p.tags.length === 0).length;
    const recommendations = [];

    if (untaggedCount > 0) {
      recommendations.push(`
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--hermes-warning-text);
          color: white;
          border-radius: 6px;
          margin-bottom: 10px;
        ">
          <div style="font-size: 1.5em;">🏷️</div>
          <div>
            <div style="font-weight: bold;">Tag ${untaggedCount} untagged items</div>
            <div style="opacity: 0.9; font-size: 0.9em;">Use auto-tagging to quickly organize your content</div>
          </div>
          <button onclick="this.runAutoTagging()" style="
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            background: rgba(255,255,255,0.2);
            color: white;
            cursor: pointer;
            font-size: 0.9em;
          ">Auto-Tag</button>
        </div>
      `);
    }

    if (this.smartFolders.length === 0) {
      recommendations.push(`
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--hermes-info-text);
          color: white;
          border-radius: 6px;
          margin-bottom: 10px;
        ">
          <div style="font-size: 1.5em;">📁</div>
          <div>
            <div style="font-weight: bold;">Create your first smart folder</div>
            <div style="opacity: 0.9; font-size: 0.9em;">Automatically organize content by date, type, or keywords</div>
          </div>
          <button onclick="this.switchOrganizationTab('smart-folders')" style="
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            background: rgba(255,255,255,0.2);
            color: white;
            cursor: pointer;
            font-size: 0.9em;
          ">Create</button>
        </div>
      `);
    }

    if (pages.length > 10 && this.tags.length < 5) {
      recommendations.push(`
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--hermes-success-text);
          color: white;
          border-radius: 6px;
          margin-bottom: 10px;
        ">
          <div style="font-size: 1.5em;">🎯</div>
          <div>
            <div style="font-weight: bold;">Add more tags for better organization</div>
            <div style="opacity: 0.9; font-size: 0.9em;">Create tags for your main topics and projects</div>
          </div>
          <button onclick="this.switchOrganizationTab('auto-tagging')" style="
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            background: rgba(255,255,255,0.2);
            color: white;
            cursor: pointer;
            font-size: 0.9em;
          ">Manage Tags</button>
        </div>
      `);
    }

    if (recommendations.length === 0) {
      return `
        <div style="text-align: center; color: var(--hermes-success-text); padding: 20px;">
          <div style="font-size: 3em; margin-bottom: 10px;">🎉</div>
          <div style="font-weight: bold; margin-bottom: 5px;">Great job!</div>
          <div style="color: var(--hermes-disabled-text);">Your content is well organized.</div>
        </div>
      `;
    }

    return recommendations.join('');
  },

  getSmartFolderCount(folder) {
    // This would calculate the actual count based on the folder's criteria
    return Math.floor(Math.random() * 20) + 1; // Placeholder
  },

  createSmartFolder(folderData) {
    const folder = {
      id: crypto.randomUUID(),
      name: folderData.name,
      icon: folderData.icon,
      criteria: folderData.criteria,
      options: folderData.options || {},
      created: new Date().toISOString(),
      description: this.getCriteriaDescription(folderData.criteria, folderData.options)
    };

    this.smartFolders.push(folder);
    this.saveSmartFolders();
    return folder;
  },

  getCriteriaDescription(criteria, options) {
    const descriptions = {
      'recent': 'Recently modified content',
      'today': 'Content created today',
      'this-week': 'Content created this week',
      'contains-keyword': `Contains "${options.keyword || 'keyword'}"`,
      'has-tag': `Tagged with "${options.tag || 'tag'}"`,
      'content-type': `${options.type || 'Type'} content`,
      'large-files': 'Large files (>1MB)',
      'no-tags': 'Untagged content'
    };
    return descriptions[criteria] || 'Custom criteria';
  },

  runAutoTagging() {
    // This would implement the actual auto-tagging logic
    alert('Auto-tagging functionality coming soon! This will analyze your content and suggest relevant tags.');
  },

  addNewTag() {
    const input = document.getElementById('new-tag-input');
    if (!input || !input.value.trim()) return;

    const tag = {
      id: crypto.randomUUID(),
      name: input.value.trim(),
      created: new Date().toISOString(),
      count: 0
    };

    this.tags.push(tag);
    this.saveTags();
    input.value = '';
    this.switchOrganizationTab('auto-tagging'); // Refresh view
  },

  removeTag(tagId) {
    if (confirm('Are you sure you want to remove this tag?')) {
      this.tags = this.tags.filter(t => t.id !== tagId);
      this.saveTags();
      this.switchOrganizationTab('auto-tagging'); // Refresh view
    }
  },

  saveSmartFolders() {
    localStorage.setItem('nextnote_smart_folders', JSON.stringify(this.smartFolders));
  },

  saveTags() {
    localStorage.setItem('nextnote_tags', JSON.stringify(this.tags));
  },

  saveOrganizationRules() {
    localStorage.setItem('nextnote_organization_rules', JSON.stringify(this.organizationRules));
  },

  bindSmartFoldersEvents() {
    const form = document.getElementById('smart-folder-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const folderData = {
          name: formData.get('folder-name') || document.getElementById('folder-name').value,
          icon: document.getElementById('folder-icon').value,
          criteria: document.getElementById('folder-criteria').value
        };
        
        this.createSmartFolder(folderData);
        this.switchOrganizationTab('smart-folders'); // Refresh view
      });
    }
  },

  bindAutoTaggingEvents() {
    const confidenceSlider = document.getElementById('confidence-level');
    const confidenceValue = document.getElementById('confidence-value');
    
    if (confidenceSlider && confidenceValue) {
      confidenceSlider.addEventListener('input', (e) => {
        confidenceValue.textContent = e.target.value + '%';
      });
    }
  },

  bindOrganizationRulesEvents() {
    // Organization rules events would be bound here
  },

  bindContentAnalysisEvents() {
    // Content analysis events would be bound here
  },

  initializeOrganizationComponents(app) {
    // Initialize organization components
  },

  bindOrganizationEvents(app) {
    // Listen for organization events
    app.on('contentUpdated', () => {
      // Update organization analysis
    });
  }
});
