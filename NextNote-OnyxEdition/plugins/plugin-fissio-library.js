// plugins/plugin-fissio-library.js

window.registerNextNotePlugin({
  name: "FissioLibrary",
  onLoad: function(app) {
          // Fissio Library specific styling
      const fissioStyle = document.createElement("style");
      fissioStyle.textContent = `
        .fissio-library {
          --fissio-primary: #6366f1;
          --fissio-secondary: #4f46e5;
          --fissio-accent: #ef4444;
          --fissio-success: #10b981;
          --fissio-warning: #f59e0b;
          --fissio-light: #f8fafc;
          --fissio-dark: #1e293b;
        }
        
        .fissio-library-panel {
          background: white;
          border: 2px solid var(--fissio-primary);
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .fissio-category {
          margin-bottom: 20px;
        }
        
        .fissio-category h3 {
          color: var(--fissio-primary);
          border-bottom: 1px solid var(--fissio-primary);
          padding-bottom: 5px;
          margin-bottom: 10px;
        }
        
        .fissio-template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        
        .fissio-template-item {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.2s;
          background: #f8f9fa;
        }
        
        .fissio-template-item:hover {
          border-color: var(--fissio-primary);
          background: #eef2ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .fissio-template-icon {
          font-size: 24px;
          margin-bottom: 5px;
        }
        
        .fissio-template-name {
          font-weight: 500;
          margin-bottom: 3px;
          color: var(--fissio-dark);
        }
        
        .fissio-template-desc {
          font-size: 11px;
          color: #666;
        }
        
              /* Floating button removed - functionality integrated into main toolbar */
    `;
    document.head.appendChild(fissioStyle);

// plugins/plugin-fissio-library.js

window.registerNextNotePlugin({
  name: "FissioLibrary",
  onLoad: function(app) {
      const fissioStyle = document.createElement("style");
      fissioStyle.textContent = `
        .fissio-library-panel {
          background: white;
          border: 2px solid #6366f1;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
          max-height: 400px;
          overflow-y: auto;
        }
        .fissio-category { margin-bottom: 20px; }
        .fissio-category h3 { color: #6366f1; border-bottom: 1px solid #6366f1; padding-bottom: 5px; margin-bottom: 10px; }
        .fissio-template-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
        .fissio-template-item { border: 1px solid #ddd; border-radius: 6px; padding: 10px; cursor: pointer; transition: all 0.2s; background: #f8f9fa; }
        .fissio-template-item:hover { border-color: #6366f1; background: #eef2ff; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .fissio-template-icon { font-size: 24px; margin-bottom: 5px; }
        .fissio-template-name { font-weight: 500; margin-bottom: 3px; color: #1e293b; }
        .fissio-template-desc { font-size: 11px; color: #666; }
    `;
    document.head.appendChild(fissioStyle);

    async function getFissioTemplates() {
        const templateFiles = [
            'process-flow.json',
            'org-chart.json'
        ];
        const templates = [];
        for (const file of templateFiles) {
            try {
                const response = await fetch(`NextNote-OnyxEdition/fissio-templates/${file}`);
                if (response.ok) {
                    const data = await response.json();
                    templates.push({
                        file: file,
                        name: data.name,
                        description: data.description,
                        data: data // Keep the full data for loading
                    });
                }
            } catch (e) {
                console.error(`Could not load template ${file}:`, e);
            }
        }
        return templates;
    }

    function toggleFissioLibrary() {
      const existing = document.querySelector('.fissio-library-panel');
      if (existing) {
        existing.remove();
        return;
      }
      showFissioLibrary();
    }

    async function showFissioLibrary() {
      const panel = document.createElement('div');
      panel.className = 'fissio-library-panel';
      
      let html = '<h2 style="margin-top: 0; color: var(--fissio-primary);">📐 Fissio Diagram Library</h2>';
      
      const templates = await getFissioTemplates();

      if (templates.length === 0) {
          html += '<p>No templates found.</p>';
      } else {
          html += '<div class="fissio-template-grid">';
          templates.forEach((template, index) => {
              html += `
                  <div class="fissio-template-item" data-template-index="${index}">
                      <div class="fissio-template-icon">📐</div>
                      <div class="fissio-template-name">${template.name}</div>
                      <div class="fissio-template-desc">${template.description}</div>
                  </div>
              `;
          });
          html += '</div>';
      }
      
      panel.innerHTML = html;
      
      panel.querySelectorAll('.fissio-template-item').forEach(item => {
          item.onclick = () => {
              const index = parseInt(item.dataset.templateIndex, 10);
              const templateData = templates[index];
              if (templateData && window.loadDiagramFromData) {
                  // Use the new function from the diagram builder plugin
                  window.loadDiagramFromData(templateData.data.data); // Pass the inner 'data' object

                  // Close the library panel
                  const libraryPanel = document.querySelector('.fissio-library-panel');
                  if (libraryPanel) {
                      libraryPanel.remove();
                  }
              } else if (!window.loadDiagramFromData) {
                  app.showToast("Error: Diagram Builder plugin not available.", { type: 'error' });
              }
          };
      });

      const toolbar = document.getElementById('toolbar');
      toolbar.parentNode.insertBefore(panel, toolbar.nextSibling);
    }

    // Make functions globally available
    window.toggleFissioLibrary = toggleFissioLibrary;
    window.showFissioLibrary = showFissioLibrary;
  }
}); 