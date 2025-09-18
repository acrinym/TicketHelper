/**
 * NextNote Knowledge Graph Plugin
 * Advanced knowledge management with bidirectional linking, graph visualization, and AI-powered insights
 * Open-source alternative to Obsidian, Roam Research, and Notion's connected workspace
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Knowledge Graph',
  version: '1.0.0',
  description: 'Advanced knowledge management with bidirectional linking and graph visualization',
  
  onLoad(app) {
    this.knowledgeBase = JSON.parse(localStorage.getItem('nextnote_knowledge_base') || '{}');
    this.connections = JSON.parse(localStorage.getItem('nextnote_connections') || '[]');
    this.setupKnowledgeUI(app);
    this.initializeKnowledgeComponents(app);
    this.bindKnowledgeEvents(app);
  },

  setupKnowledgeUI(app) {
    const panel = app.createPanel('knowledge-graph', 'Knowledge Graph');
    
    // Knowledge Graph header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: var(--hermes-panel-bg);
      border-radius: 8px;
      border: 1px solid var(--hermes-border);
    `;

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0; color: var(--hermes-text);';
    title.textContent = '🧠 Knowledge Graph';

    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = 'Search knowledge base...';
    searchBox.style.cssText = `
      padding: 8px 12px;
      border: 1px solid var(--hermes-border);
      border-radius: 6px;
      background: var(--hermes-input-bg);
      color: var(--hermes-text);
      width: 250px;
    `;
    searchBox.addEventListener('input', (e) => this.searchKnowledge(e.target.value));

    header.appendChild(title);
    header.appendChild(searchBox);
    panel.appendChild(header);

    // Knowledge views tabs
    const viewTabs = document.createElement('div');
    viewTabs.style.cssText = `
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--hermes-border);
    `;

    const views = [
      { id: 'graph', label: '🕸️ Graph View' },
      { id: 'connections', label: '🔗 Connections' },
      { id: 'concepts', label: '💡 Concepts' },
      { id: 'insights', label: '🔍 Insights' }
    ];

    views.forEach((view, index) => {
      const tab = document.createElement('button');
      tab.className = `knowledge-tab ${index === 0 ? 'active' : ''}`;
      tab.style.cssText = `
        padding: 10px 20px;
        border: none;
        background: ${index === 0 ? 'var(--hermes-highlight-bg)' : 'transparent'};
        color: ${index === 0 ? 'var(--hermes-highlight-text)' : 'var(--hermes-text)'};
        cursor: pointer;
        border-bottom: 2px solid ${index === 0 ? 'var(--hermes-highlight-bg)' : 'transparent'};
        transition: all 0.2s;
      `;
      tab.textContent = view.label;
      tab.addEventListener('click', () => this.switchKnowledgeView(view.id));
      viewTabs.appendChild(tab);
    });

    panel.appendChild(viewTabs);

    // Knowledge content area
    const contentArea = document.createElement('div');
    contentArea.id = 'knowledge-content-area';
    contentArea.style.cssText = 'min-height: 400px;';
    panel.appendChild(contentArea);

    // Initialize with graph view
    this.switchKnowledgeView('graph');
  },

  switchKnowledgeView(viewId) {
    // Update tab styles
    document.querySelectorAll('.knowledge-tab').forEach(tab => {
      tab.style.background = 'transparent';
      tab.style.color = 'var(--hermes-text)';
      tab.style.borderBottomColor = 'transparent';
      tab.classList.remove('active');
    });

    const activeTab = document.querySelector(`.knowledge-tab:nth-child(${['graph', 'connections', 'concepts', 'insights'].indexOf(viewId) + 1})`);
    if (activeTab) {
      activeTab.style.background = 'var(--hermes-highlight-bg)';
      activeTab.style.color = 'var(--hermes-highlight-text)';
      activeTab.style.borderBottomColor = 'var(--hermes-highlight-bg)';
      activeTab.classList.add('active');
    }

    // Update content area
    const contentArea = document.getElementById('knowledge-content-area');
    if (!contentArea) return;

    switch (viewId) {
      case 'graph':
        contentArea.innerHTML = this.generateGraphView();
        this.initializeGraphVisualization();
        break;
      case 'connections':
        contentArea.innerHTML = this.generateConnectionsView();
        break;
      case 'concepts':
        contentArea.innerHTML = this.generateConceptsView();
        break;
      case 'insights':
        contentArea.innerHTML = this.generateInsightsView();
        break;
    }
  },

  generateGraphView() {
    return `
      <div class="knowledge-graph-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h4 style="margin: 0; color: var(--hermes-text);">🕸️ Knowledge Network</h4>
          <div style="display: flex; gap: 10px;">
            <button onclick="this.parentElement.parentElement.parentElement.querySelector('#graph-canvas').style.transform='scale(0.8)'" style="padding: 5px 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-button-bg); color: var(--hermes-text); cursor: pointer;">Zoom Out</button>
            <button onclick="this.parentElement.parentElement.parentElement.querySelector('#graph-canvas').style.transform='scale(1.2)'" style="padding: 5px 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-button-bg); color: var(--hermes-text); cursor: pointer;">Zoom In</button>
            <button onclick="this.parentElement.parentElement.parentElement.querySelector('#graph-canvas').style.transform='scale(1)'" style="padding: 5px 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-button-bg); color: var(--hermes-text); cursor: pointer;">Reset</button>
          </div>
        </div>
        <div id="graph-canvas" style="
          width: 100%;
          height: 400px;
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          background: var(--hermes-bg);
          position: relative;
          overflow: hidden;
          transition: transform 0.3s;
        ">
          ${this.generateGraphNodes()}
        </div>
        <div style="margin-top: 15px; padding: 10px; background: var(--hermes-panel-bg); border-radius: 6px; font-size: 0.9em; color: var(--hermes-disabled-text);">
          <strong>Graph Statistics:</strong> 
          ${Object.keys(this.knowledgeBase).length} concepts • 
          ${this.connections.length} connections • 
          ${this.calculateGraphDensity()}% density
        </div>
      </div>
    `;
  },

  generateGraphNodes() {
    const concepts = Object.keys(this.knowledgeBase);
    if (concepts.length === 0) {
      return `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
          <div style="font-size: 3em; margin-bottom: 20px;">🧠</div>
          <h4 style="color: var(--hermes-text); margin-bottom: 10px;">No Knowledge Graph Yet</h4>
          <p style="color: var(--hermes-disabled-text); text-align: center;">Start creating notes with [[concept]] links to build your knowledge graph.</p>
        </div>
      `;
    }

    let html = '';
    const centerX = 300;
    const centerY = 200;
    const radius = 150;

    concepts.forEach((concept, index) => {
      const angle = (index / concepts.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const connectionCount = this.getConnectionCount(concept);
      const nodeSize = Math.max(20, Math.min(40, 20 + connectionCount * 3));

      html += `
        <div class="graph-node" data-concept="${concept}" style="
          position: absolute;
          left: ${x - nodeSize/2}px;
          top: ${y - nodeSize/2}px;
          width: ${nodeSize}px;
          height: ${nodeSize}px;
          background: var(--hermes-highlight-bg);
          border: 2px solid var(--hermes-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          font-size: ${Math.max(8, nodeSize/3)}px;
          color: var(--hermes-highlight-text);
          font-weight: bold;
        " title="${concept} (${connectionCount} connections)">
          ${concept.substring(0, 2).toUpperCase()}
        </div>
      `;
    });

    // Add connection lines
    this.connections.forEach(connection => {
      const fromIndex = concepts.indexOf(connection.from);
      const toIndex = concepts.indexOf(connection.to);
      if (fromIndex !== -1 && toIndex !== -1) {
        const fromAngle = (fromIndex / concepts.length) * 2 * Math.PI;
        const toAngle = (toIndex / concepts.length) * 2 * Math.PI;
        const fromX = centerX + radius * Math.cos(fromAngle);
        const fromY = centerY + radius * Math.sin(fromAngle);
        const toX = centerX + radius * Math.cos(toAngle);
        const toY = centerY + radius * Math.sin(toAngle);

        const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;

        html += `
          <div style="
            position: absolute;
            left: ${fromX}px;
            top: ${fromY}px;
            width: ${length}px;
            height: 2px;
            background: var(--hermes-border);
            transform-origin: 0 50%;
            transform: rotate(${angle}deg);
            opacity: 0.6;
            z-index: 1;
          "></div>
        `;
      }
    });

    return html;
  },

  generateConnectionsView() {
    let html = '<div class="connections-view">';
    html += '<h4 style="color: var(--hermes-text); margin-bottom: 20px;">🔗 Knowledge Connections</h4>';

    if (this.connections.length === 0) {
      html += `
        <div style="text-align: center; padding: 40px;">
          <div style="font-size: 3em; margin-bottom: 20px;">🔗</div>
          <h4 style="color: var(--hermes-text); margin-bottom: 10px;">No Connections Yet</h4>
          <p style="color: var(--hermes-disabled-text);">Create links between concepts using [[concept]] syntax in your notes.</p>
        </div>
      `;
    } else {
      html += '<div style="display: grid; gap: 15px;">';
      
      // Group connections by strength
      const connectionGroups = this.groupConnectionsByStrength();
      
      Object.entries(connectionGroups).forEach(([strength, connections]) => {
        html += `
          <div style="margin-bottom: 20px;">
            <h5 style="color: var(--hermes-text); margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
              <span style="width: 12px; height: 12px; background: ${this.getStrengthColor(strength)}; border-radius: 50%;"></span>
              ${strength.charAt(0).toUpperCase() + strength.slice(1)} Connections (${connections.length})
            </h5>
            <div style="display: grid; gap: 10px;">
              ${connections.map(conn => `
                <div style="
                  padding: 12px;
                  background: var(--hermes-panel-bg);
                  border: 1px solid var(--hermes-border);
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  gap: 15px;
                ">
                  <span style="
                    padding: 4px 8px;
                    background: var(--hermes-highlight-bg);
                    color: var(--hermes-highlight-text);
                    border-radius: 4px;
                    font-size: 0.8em;
                    font-weight: bold;
                  ">${conn.from}</span>
                  <span style="color: var(--hermes-disabled-text);">↔</span>
                  <span style="
                    padding: 4px 8px;
                    background: var(--hermes-info-text);
                    color: white;
                    border-radius: 4px;
                    font-size: 0.8em;
                    font-weight: bold;
                  ">${conn.to}</span>
                  <span style="
                    margin-left: auto;
                    color: var(--hermes-disabled-text);
                    font-size: 0.8em;
                  ">Strength: ${conn.strength}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      });
      
      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  generateConceptsView() {
    const concepts = Object.keys(this.knowledgeBase);
    let html = '<div class="concepts-view">';
    html += '<h4 style="color: var(--hermes-text); margin-bottom: 20px;">💡 Knowledge Concepts</h4>';

    if (concepts.length === 0) {
      html += `
        <div style="text-align: center; padding: 40px;">
          <div style="font-size: 3em; margin-bottom: 20px;">💡</div>
          <h4 style="color: var(--hermes-text); margin-bottom: 10px;">No Concepts Yet</h4>
          <p style="color: var(--hermes-disabled-text);">Start writing notes to automatically extract and track concepts.</p>
        </div>
      `;
    } else {
      // Sort concepts by connection count
      const sortedConcepts = concepts.sort((a, b) => 
        this.getConnectionCount(b) - this.getConnectionCount(a)
      );

      html += '<div style="display: grid; gap: 15px;">';
      sortedConcepts.forEach(concept => {
        const connectionCount = this.getConnectionCount(concept);
        const conceptData = this.knowledgeBase[concept];
        
        html += `
          <div style="
            padding: 15px;
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          " onmouseenter="this.style.borderColor='var(--hermes-highlight-bg)'" onmouseleave="this.style.borderColor='var(--hermes-border)'">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
              <h5 style="margin: 0; color: var(--hermes-text);">${concept}</h5>
              <div style="display: flex; gap: 10px; align-items: center;">
                <span style="
                  padding: 2px 8px;
                  background: var(--hermes-highlight-bg);
                  color: var(--hermes-highlight-text);
                  border-radius: 12px;
                  font-size: 0.7em;
                ">${connectionCount} connections</span>
                <span style="
                  padding: 2px 8px;
                  background: var(--hermes-info-text);
                  color: white;
                  border-radius: 12px;
                  font-size: 0.7em;
                ">${conceptData.mentions || 0} mentions</span>
              </div>
            </div>
            ${conceptData.description ? `
              <p style="margin: 0 0 10px 0; color: var(--hermes-disabled-text); font-size: 0.9em;">${conceptData.description}</p>
            ` : ''}
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">
              Last updated: ${conceptData.lastUpdated ? new Date(conceptData.lastUpdated).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  generateInsightsView() {
    const insights = this.generateKnowledgeInsights();
    
    let html = '<div class="insights-view">';
    html += '<h4 style="color: var(--hermes-text); margin-bottom: 20px;">🔍 Knowledge Insights</h4>';

    html += '<div style="display: grid; gap: 20px;">';

    // Most connected concepts
    html += `
      <div style="padding: 20px; background: var(--hermes-panel-bg); border: 1px solid var(--hermes-border); border-radius: 8px;">
        <h5 style="margin: 0 0 15px 0; color: var(--hermes-text); display: flex; align-items: center; gap: 10px;">
          <span>🌟</span> Most Connected Concepts
        </h5>
        ${insights.mostConnected.length > 0 ? `
          <div style="display: grid; gap: 8px;">
            ${insights.mostConnected.slice(0, 5).map((item, index) => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: var(--hermes-bg); border-radius: 4px;">
                <span style="color: var(--hermes-text);">${index + 1}. ${item.concept}</span>
                <span style="color: var(--hermes-highlight-bg); font-weight: bold;">${item.connections} connections</span>
              </div>
            `).join('')}
          </div>
        ` : '<p style="color: var(--hermes-disabled-text); font-style: italic;">No connections yet</p>'}
      </div>
    `;

    // Knowledge clusters
    html += `
      <div style="padding: 20px; background: var(--hermes-panel-bg); border: 1px solid var(--hermes-border); border-radius: 8px;">
        <h5 style="margin: 0 0 15px 0; color: var(--hermes-text); display: flex; align-items: center; gap: 10px;">
          <span>🎯</span> Knowledge Clusters
        </h5>
        ${insights.clusters.length > 0 ? `
          <div style="display: grid; gap: 10px;">
            ${insights.clusters.map(cluster => `
              <div style="padding: 10px; background: var(--hermes-bg); border-radius: 4px;">
                <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 5px;">Cluster: ${cluster.concepts.join(', ')}</div>
                <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Density: ${cluster.density}%</div>
              </div>
            `).join('')}
          </div>
        ` : '<p style="color: var(--hermes-disabled-text); font-style: italic;">No clusters identified yet</p>'}
      </div>
    `;

    // Growth trends
    html += `
      <div style="padding: 20px; background: var(--hermes-panel-bg); border: 1px solid var(--hermes-border); border-radius: 8px;">
        <h5 style="margin: 0 0 15px 0; color: var(--hermes-text); display: flex; align-items: center; gap: 10px;">
          <span>📈</span> Knowledge Growth
        </h5>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
          <div style="text-align: center;">
            <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-highlight-bg);">${Object.keys(this.knowledgeBase).length}</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Total Concepts</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-success-text);">${this.connections.length}</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Total Connections</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-info-text);">${this.calculateGraphDensity()}%</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Graph Density</div>
          </div>
        </div>
      </div>
    `;

    html += '</div></div>';
    return html;
  },

  searchKnowledge(query) {
    if (!query.trim()) return;
    
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    // Search concepts
    Object.keys(this.knowledgeBase).forEach(concept => {
      if (concept.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'concept',
          title: concept,
          relevance: concept.toLowerCase() === lowerQuery ? 1 : 0.8
        });
      }
    });
    
    // Search connections
    this.connections.forEach(conn => {
      if (conn.from.toLowerCase().includes(lowerQuery) || conn.to.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'connection',
          title: `${conn.from} ↔ ${conn.to}`,
          relevance: 0.6
        });
      }
    });
    
    // Sort by relevance and display results
    results.sort((a, b) => b.relevance - a.relevance);
    this.displaySearchResults(results, query);
  },

  displaySearchResults(results, query) {
    const contentArea = document.getElementById('knowledge-content-area');
    if (!contentArea) return;
    
    let html = `
      <div class="search-results">
        <h4 style="color: var(--hermes-text); margin-bottom: 20px;">🔍 Search Results for "${query}"</h4>
    `;
    
    if (results.length === 0) {
      html += '<p style="color: var(--hermes-disabled-text); font-style: italic;">No results found.</p>';
    } else {
      html += '<div style="display: grid; gap: 10px;">';
      results.forEach(result => {
        html += `
          <div style="
            padding: 12px;
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 6px;
            cursor: pointer;
          ">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="
                padding: 4px 8px;
                background: ${result.type === 'concept' ? 'var(--hermes-highlight-bg)' : 'var(--hermes-info-text)'};
                color: white;
                border-radius: 4px;
                font-size: 0.7em;
                text-transform: uppercase;
              ">${result.type}</span>
              <span style="color: var(--hermes-text); font-weight: bold;">${result.title}</span>
              <span style="
                margin-left: auto;
                color: var(--hermes-disabled-text);
                font-size: 0.8em;
              ">Relevance: ${Math.round(result.relevance * 100)}%</span>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }
    
    html += '</div>';
    contentArea.innerHTML = html;
  },

  getConnectionCount(concept) {
    return this.connections.filter(conn => 
      conn.from === concept || conn.to === concept
    ).length;
  },

  groupConnectionsByStrength() {
    const groups = { strong: [], medium: [], weak: [] };
    
    this.connections.forEach(conn => {
      if (conn.strength >= 0.8) {
        groups.strong.push(conn);
      } else if (conn.strength >= 0.5) {
        groups.medium.push(conn);
      } else {
        groups.weak.push(conn);
      }
    });
    
    return groups;
  },

  getStrengthColor(strength) {
    const colors = {
      strong: '#27ae60',
      medium: '#f39c12',
      weak: '#e74c3c'
    };
    return colors[strength] || '#95a5a6';
  },

  calculateGraphDensity() {
    const nodeCount = Object.keys(this.knowledgeBase).length;
    if (nodeCount < 2) return 0;
    
    const maxConnections = (nodeCount * (nodeCount - 1)) / 2;
    const actualConnections = this.connections.length;
    
    return Math.round((actualConnections / maxConnections) * 100);
  },

  generateKnowledgeInsights() {
    const concepts = Object.keys(this.knowledgeBase);
    
    // Most connected concepts
    const mostConnected = concepts.map(concept => ({
      concept,
      connections: this.getConnectionCount(concept)
    })).sort((a, b) => b.connections - a.connections);
    
    // Simple clustering (concepts that share many connections)
    const clusters = [];
    const processed = new Set();
    
    concepts.forEach(concept => {
      if (processed.has(concept)) return;
      
      const relatedConcepts = [concept];
      const conceptConnections = this.connections.filter(conn => 
        conn.from === concept || conn.to === concept
      );
      
      conceptConnections.forEach(conn => {
        const related = conn.from === concept ? conn.to : conn.from;
        if (!relatedConcepts.includes(related)) {
          relatedConcepts.push(related);
        }
      });
      
      if (relatedConcepts.length > 2) {
        clusters.push({
          concepts: relatedConcepts,
          density: Math.round((conceptConnections.length / relatedConcepts.length) * 100)
        });
        relatedConcepts.forEach(c => processed.add(c));
      }
    });
    
    return {
      mostConnected,
      clusters
    };
  },

  initializeGraphVisualization() {
    // Add interactive features to graph nodes
    const nodes = document.querySelectorAll('.graph-node');
    nodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        node.style.transform = 'scale(1.2)';
        node.style.zIndex = '10';
      });
      
      node.addEventListener('mouseleave', () => {
        node.style.transform = 'scale(1)';
        node.style.zIndex = '2';
      });
      
      node.addEventListener('click', () => {
        const concept = node.dataset.concept;
        this.showConceptDetails(concept);
      });
    });
  },

  showConceptDetails(concept) {
    // Show detailed information about a concept
    console.log(`Showing details for concept: ${concept}`);
    // This would open a detailed view of the concept
  },

  initializeKnowledgeComponents(app) {
    // Initialize knowledge extraction from notes
    this.extractKnowledgeFromNotes(app);
  },

  extractKnowledgeFromNotes(app) {
    // This would analyze existing notes for [[concept]] links
    // and automatically build the knowledge graph
  },

  bindKnowledgeEvents(app) {
    // Listen for note changes to update knowledge graph
    app.on('noteUpdated', (data) => {
      this.updateKnowledgeFromNote(data);
    });
  },

  updateKnowledgeFromNote(noteData) {
    // Extract [[concept]] links from note content
    const conceptRegex = /\[\[([^\]]+)\]\]/g;
    const concepts = [];
    let match;
    
    while ((match = conceptRegex.exec(noteData.content)) !== null) {
      concepts.push(match[1]);
    }
    
    // Update knowledge base
    concepts.forEach(concept => {
      if (!this.knowledgeBase[concept]) {
        this.knowledgeBase[concept] = {
          mentions: 1,
          lastUpdated: new Date().toISOString(),
          description: ''
        };
      } else {
        this.knowledgeBase[concept].mentions++;
        this.knowledgeBase[concept].lastUpdated = new Date().toISOString();
      }
    });
    
    // Create connections between concepts in the same note
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const connection = {
          from: concepts[i],
          to: concepts[j],
          strength: 0.5,
          source: noteData.id
        };
        
        // Check if connection already exists
        const existingConnection = this.connections.find(conn => 
          (conn.from === connection.from && conn.to === connection.to) ||
          (conn.from === connection.to && conn.to === connection.from)
        );
        
        if (existingConnection) {
          existingConnection.strength = Math.min(1, existingConnection.strength + 0.1);
        } else {
          this.connections.push(connection);
        }
      }
    }
    
    this.saveKnowledgeBase();
  },

  saveKnowledgeBase() {
    localStorage.setItem('nextnote_knowledge_base', JSON.stringify(this.knowledgeBase));
    localStorage.setItem('nextnote_connections', JSON.stringify(this.connections));
  }
});
