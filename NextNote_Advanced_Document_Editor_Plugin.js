/**
 * NextNote Advanced Document Editor Plugin
 * Microsoft Word-like document editing with advanced formatting and font decorations
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Advanced Document Editor',
  version: '1.0.0',
  description: 'Microsoft Word-like document editing with advanced formatting and font decorations',
  
  onLoad(app) {
    this.documents = JSON.parse(localStorage.getItem('nextnote_documents') || '[]');
    this.currentDocument = null;
    this.documentSettings = JSON.parse(localStorage.getItem('nextnote_document_settings') || this.getDefaultSettings());
    this.undoStack = [];
    this.redoStack = [];
    this.isEditing = false;
    this.setupAdvancedDocumentEditorUI(app);
    this.initializeDocumentComponents(app);
    this.bindDocumentEvents(app);
  },

  getDefaultSettings() {
    return {
      pageSize: 'A4',
      margins: { top: 25, right: 25, bottom: 25, left: 25 },
      defaultFont: 'Times New Roman',
      defaultFontSize: 12,
      lineSpacing: 1.15,
      showRuler: true,
      showPageBreaks: true,
      autoSave: true,
      spellCheck: true,
      grammarCheck: true
    };
  },

  setupAdvancedDocumentEditorUI(app) {
    const panel = app.createPanel('advanced-document-editor', 'Document Editor');
    
    // Header with document theme
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #2c3e50, #3498db, #9b59b6, #e74c3c);
      border-radius: 12px;
      color: white;
      position: relative;
      overflow: hidden;
    `;

    // Floating document icons
    const docIcons = ['📄', '📝', '📋', '📊', '📑', '🗒️'];
    docIcons.forEach((icon, index) => {
      const floatingIcon = document.createElement('div');
      floatingIcon.style.cssText = `
        position: absolute;
        font-size: 1.3em;
        opacity: 0.2;
        animation: floatDoc ${4 + index}s ease-in-out infinite;
        animation-delay: ${index * 0.4}s;
        pointer-events: none;
      `;
      floatingIcon.style.left = `${8 + index * 14}%`;
      floatingIcon.style.top = `${15 + (index % 2) * 50}%`;
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
      font-family: 'Times New Roman', serif;
    `;
    title.innerHTML = '📄 Document Editor';

    const docActions = document.createElement('div');
    docActions.style.cssText = `
      display: flex;
      gap: 10px;
      z-index: 1;
      position: relative;
    `;

    const newDocBtn = document.createElement('button');
    newDocBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    newDocBtn.textContent = '📄 New Doc';
    newDocBtn.addEventListener('click', () => this.createNewDocument(app));

    const saveBtn = document.createElement('button');
    saveBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    saveBtn.textContent = '💾 Save';
    saveBtn.addEventListener('click', () => this.saveCurrentDocument(app));

    docActions.appendChild(newDocBtn);
    docActions.appendChild(saveBtn);

    header.appendChild(title);
    header.appendChild(docActions);
    panel.appendChild(header);

    // Formatting Toolbar (MS Word style)
    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    `;

    toolbar.innerHTML = `
      <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center;">
        <!-- Font Controls -->
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid var(--hermes-border); border-radius: 6px;">
          <select id="doc-font-family" style="
            padding: 4px;
            border: none;
            background: transparent;
            color: var(--hermes-text);
            min-width: 120px;
          ">
            <option value="Times New Roman">Times New Roman</option>
            <option value="Arial">Arial</option>
            <option value="Calibri">Calibri</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
          </select>
          <select id="doc-font-size" style="
            padding: 4px;
            border: none;
            background: transparent;
            color: var(--hermes-text);
            width: 60px;
          ">
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12" selected>12</option>
            <option value="14">14</option>
            <option value="16">16</option>
            <option value="18">18</option>
            <option value="20">20</option>
            <option value="24">24</option>
            <option value="28">28</option>
            <option value="36">36</option>
            <option value="48">48</option>
            <option value="72">72</option>
          </select>
        </div>

        <!-- Basic Formatting -->
        <div style="display: flex; gap: 2px; padding: 4px; border: 1px solid var(--hermes-border); border-radius: 6px;">
          <button class="format-btn" data-format="bold" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
            font-weight: bold;
          ">B</button>
          <button class="format-btn" data-format="italic" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
            font-style: italic;
          ">I</button>
          <button class="format-btn" data-format="underline" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
            text-decoration: underline;
          ">U</button>
          <button class="format-btn" data-format="strikethrough" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
            text-decoration: line-through;
          ">S</button>
        </div>

        <!-- Font Decorations -->
        <div style="display: flex; gap: 2px; padding: 4px; border: 1px solid var(--hermes-border); border-radius: 6px;">
          <button class="format-btn" data-format="subscript" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
            font-size: 0.8em;
          ">X₂</button>
          <button class="format-btn" data-format="superscript" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
            font-size: 0.8em;
          ">X²</button>
          <button class="format-btn" data-format="small-caps" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
            font-variant: small-caps;
          ">Aa</button>
        </div>

        <!-- Text Color & Highlight -->
        <div style="display: flex; gap: 4px; padding: 4px; border: 1px solid var(--hermes-border); border-radius: 6px;">
          <div style="display: flex; flex-direction: column; align-items: center;">
            <button onclick="this.showColorPicker('text')" style="
              padding: 4px 8px;
              border: none;
              border-radius: 3px;
              background: transparent;
              color: var(--hermes-text);
              cursor: pointer;
              font-size: 0.9em;
            ">A</button>
            <div style="height: 3px; width: 20px; background: #000000; border-radius: 1px;"></div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center;">
            <button onclick="this.showColorPicker('highlight')" style="
              padding: 4px 8px;
              border: none;
              border-radius: 3px;
              background: transparent;
              color: var(--hermes-text);
              cursor: pointer;
              font-size: 0.9em;
            ">🖍️</button>
            <div style="height: 3px; width: 20px; background: #ffff00; border-radius: 1px;"></div>
          </div>
        </div>

        <!-- Alignment -->
        <div style="display: flex; gap: 2px; padding: 4px; border: 1px solid var(--hermes-border); border-radius: 6px;">
          <button class="align-btn active" data-align="left" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-highlight-bg);
            color: var(--hermes-highlight-text);
            cursor: pointer;
          ">⬅️</button>
          <button class="align-btn" data-align="center" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
          ">⬆️</button>
          <button class="align-btn" data-align="right" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
          ">➡️</button>
          <button class="align-btn" data-align="justify" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
          ">⬌</button>
        </div>

        <!-- Lists -->
        <div style="display: flex; gap: 2px; padding: 4px; border: 1px solid var(--hermes-border); border-radius: 6px;">
          <button class="format-btn" data-format="bullet-list" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
          ">• List</button>
          <button class="format-btn" data-format="number-list" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
          ">1. List</button>
        </div>

        <!-- Advanced Features -->
        <div style="display: flex; gap: 2px; padding: 4px; border: 1px solid var(--hermes-border); border-radius: 6px;">
          <button onclick="this.insertTable()" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
            font-size: 0.9em;
          ">📊 Table</button>
          <button onclick="this.insertImage()" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
            font-size: 0.9em;
          ">🖼️ Image</button>
          <button onclick="this.insertLink()" style="
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            background: transparent;
            color: var(--hermes-text);
            cursor: pointer;
            font-size: 0.9em;
          ">🔗 Link</button>
        </div>
      </div>
    `;

    panel.appendChild(toolbar);

    // Document Editor Area
    const editorSection = document.createElement('div');
    editorSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    `;

    editorSection.innerHTML = `
      <div style="display: flex; gap: 20px;">
        <!-- Document Canvas -->
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="margin: 0; color: var(--hermes-text);">📝 Document</h4>
            <div style="display: flex; gap: 10px; align-items: center;">
              <span style="color: var(--hermes-disabled-text); font-size: 0.9em;">Zoom:</span>
              <select id="zoom-level" style="
                padding: 4px;
                border: 1px solid var(--hermes-border);
                border-radius: 4px;
                background: var(--hermes-input-bg);
                color: var(--hermes-text);
              ">
                <option value="50">50%</option>
                <option value="75">75%</option>
                <option value="100" selected>100%</option>
                <option value="125">125%</option>
                <option value="150">150%</option>
                <option value="200">200%</option>
              </select>
            </div>
          </div>
          
          <!-- Ruler -->
          <div id="ruler" style="
            height: 25px;
            background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid var(--hermes-border);
            border-bottom: none;
            border-radius: 4px 4px 0 0;
            position: relative;
            display: ${this.documentSettings.showRuler ? 'block' : 'none'};
          ">
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: repeating-linear-gradient(
                90deg,
                transparent,
                transparent 9px,
                var(--hermes-border) 9px,
                var(--hermes-border) 10px
              );
            "></div>
          </div>
          
          <!-- Document Page -->
          <div id="document-page" style="
            min-height: 600px;
            background: white;
            border: 1px solid var(--hermes-border);
            border-radius: ${this.documentSettings.showRuler ? '0 0 4px 4px' : '4px'};
            padding: ${this.documentSettings.margins.top}mm ${this.documentSettings.margins.right}mm ${this.documentSettings.margins.bottom}mm ${this.documentSettings.margins.left}mm;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            position: relative;
          ">
            <div id="document-content" contenteditable="true" style="
              min-height: 500px;
              outline: none;
              font-family: '${this.documentSettings.defaultFont}', serif;
              font-size: ${this.documentSettings.defaultFontSize}pt;
              line-height: ${this.documentSettings.lineSpacing};
              color: #000000;
            " placeholder="Start typing your document...">
              <p>Welcome to the Advanced Document Editor! This is a professional document editing environment with Microsoft Word-like features.</p>
              <p>You can format text with <strong>bold</strong>, <em>italic</em>, <u>underline</u>, and <s>strikethrough</s> formatting.</p>
              <p>Advanced features include:</p>
              <ul>
                <li>Font decorations (subscript, superscript, small caps)</li>
                <li>Text highlighting and colors</li>
                <li>Professional paragraph formatting</li>
                <li>Tables and advanced layouts</li>
                <li>Headers, footers, and page numbering</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Document Properties Panel -->
        <div style="width: 250px;">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">📋 Properties</h4>
          
          <!-- Document Info -->
          <div style="
            background: var(--hermes-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 15px;
          ">
            <h5 style="margin: 0 0 10px 0; color: var(--hermes-text);">Document Info</h5>
            <div style="font-size: 0.9em; color: var(--hermes-disabled-text); line-height: 1.4;">
              <div>Words: <span id="word-count">0</span></div>
              <div>Characters: <span id="char-count">0</span></div>
              <div>Paragraphs: <span id="para-count">0</span></div>
              <div>Pages: <span id="page-count">1</span></div>
            </div>
          </div>

          <!-- Page Setup -->
          <div style="
            background: var(--hermes-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 15px;
          ">
            <h5 style="margin: 0 0 10px 0; color: var(--hermes-text);">Page Setup</h5>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 4px; color: var(--hermes-text); font-size: 0.9em;">Page Size</label>
              <select id="page-size" style="
                width: 100%;
                padding: 4px;
                border: 1px solid var(--hermes-border);
                border-radius: 3px;
                background: var(--hermes-input-bg);
                color: var(--hermes-text);
                font-size: 0.9em;
              ">
                <option value="A4" selected>A4 (210 × 297 mm)</option>
                <option value="Letter">Letter (8.5 × 11 in)</option>
                <option value="Legal">Legal (8.5 × 14 in)</option>
                <option value="A3">A3 (297 × 420 mm)</option>
                <option value="A5">A5 (148 × 210 mm)</option>
              </select>
            </div>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 4px; color: var(--hermes-text); font-size: 0.9em;">Orientation</label>
              <div style="display: flex; gap: 4px;">
                <button class="orientation-btn active" data-orientation="portrait" style="
                  flex: 1;
                  padding: 6px;
                  border: 1px solid var(--hermes-border);
                  border-radius: 3px;
                  background: var(--hermes-highlight-bg);
                  color: var(--hermes-highlight-text);
                  cursor: pointer;
                  font-size: 0.8em;
                ">📄 Portrait</button>
                <button class="orientation-btn" data-orientation="landscape" style="
                  flex: 1;
                  padding: 6px;
                  border: 1px solid var(--hermes-border);
                  border-radius: 3px;
                  background: var(--hermes-button-bg);
                  color: var(--hermes-text);
                  cursor: pointer;
                  font-size: 0.8em;
                ">📄 Landscape</button>
              </div>
            </div>
          </div>

          <!-- Paragraph Formatting -->
          <div style="
            background: var(--hermes-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 6px;
            padding: 12px;
          ">
            <h5 style="margin: 0 0 10px 0; color: var(--hermes-text);">Paragraph</h5>
            
            <div style="margin-bottom: 8px;">
              <label style="display: block; margin-bottom: 4px; color: var(--hermes-text); font-size: 0.9em;">
                Line Spacing: <span id="line-spacing-display">${this.documentSettings.lineSpacing}</span>
              </label>
              <input type="range" id="line-spacing" min="1" max="3" value="${this.documentSettings.lineSpacing}" step="0.1" style="
                width: 100%;
                height: 4px;
                border-radius: 2px;
                background: var(--hermes-border);
                outline: none;
                -webkit-appearance: none;
              ">
            </div>
            
            <div style="margin-bottom: 8px;">
              <label style="display: block; margin-bottom: 4px; color: var(--hermes-text); font-size: 0.9em;">
                Indent: <span id="indent-display">0</span>pt
              </label>
              <input type="range" id="paragraph-indent" min="0" max="72" value="0" style="
                width: 100%;
                height: 4px;
                border-radius: 2px;
                background: var(--hermes-border);
                outline: none;
                -webkit-appearance: none;
              ">
            </div>
          </div>
        </div>
      </div>
    `;

    panel.appendChild(editorSection);

    // Document List
    const documentsSection = document.createElement('div');
    documentsSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
    `;

    documentsSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: var(--hermes-text);">📚 My Documents</h4>
        <div style="display: flex; gap: 8px;">
          <button onclick="this.importDocument()" style="
            padding: 6px 12px;
            border: 1px solid var(--hermes-border);
            border-radius: 4px;
            background: var(--hermes-button-bg);
            color: var(--hermes-text);
            cursor: pointer;
            font-size: 0.9em;
          ">📥 Import</button>
          <button onclick="this.exportDocument()" style="
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            background: var(--hermes-info-text);
            color: white;
            cursor: pointer;
            font-size: 0.9em;
          ">📤 Export</button>
        </div>
      </div>
      
      <div id="documents-list" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      ">
        ${this.documents.length === 0 ? `
          <div style="
            grid-column: 1 / -1;
            text-align: center;
            color: var(--hermes-disabled-text);
            font-style: italic;
            padding: 40px;
          ">
            <div style="font-size: 3em; margin-bottom: 15px;">📄</div>
            <div>No documents yet</div>
            <div style="font-size: 0.9em; margin-top: 5px;">Create your first professional document</div>
          </div>
        ` : this.generateDocumentsList()}
      </div>
    `;

    panel.appendChild(documentsSection);

    // Bind all events
    this.bindFormattingEvents();
    this.bindDocumentEditorEvents();
  },

  generateDocumentsList() {
    return this.documents.map(doc => `
      <div style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.2s;
      " onclick="this.openDocument('${doc.id}')" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="font-size: 1.5em;">📄</div>
          <div style="flex: 1;">
            <div style="font-weight: bold; color: var(--hermes-text); font-size: 0.9em; margin-bottom: 2px;">
              ${doc.title}
            </div>
            <div style="font-size: 0.7em; color: var(--hermes-disabled-text);">
              ${new Date(doc.modified).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div style="font-size: 0.8em; color: var(--hermes-disabled-text); margin-bottom: 8px;">
          ${doc.wordCount || 0} words • ${doc.pageCount || 1} pages
        </div>
        <div style="display: flex; gap: 4px;">
          <button onclick="event.stopPropagation(); this.duplicateDocument('${doc.id}')" style="
            flex: 1;
            padding: 4px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-info-text);
            color: white;
            cursor: pointer;
            font-size: 0.7em;
          ">Copy</button>
          <button onclick="event.stopPropagation(); this.deleteDocument('${doc.id}')" style="
            flex: 1;
            padding: 4px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-error-text);
            color: white;
            cursor: pointer;
            font-size: 0.7em;
          ">Delete</button>
        </div>
      </div>
    `).join('');
  },

  bindFormattingEvents() {
    // Format buttons
    document.querySelectorAll('.format-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const format = btn.dataset.format;
        this.applyFormatting(format);
        this.toggleButtonState(btn);
      });
    });

    // Alignment buttons
    document.querySelectorAll('.align-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const align = btn.dataset.align;
        this.setTextAlignment(align);
        this.updateAlignmentButtons(align);
      });
    });

    // Font controls
    const fontFamily = document.getElementById('doc-font-family');
    const fontSize = document.getElementById('doc-font-size');
    
    if (fontFamily) {
      fontFamily.addEventListener('change', () => {
        this.applyFontFamily(fontFamily.value);
      });
    }
    
    if (fontSize) {
      fontSize.addEventListener('change', () => {
        this.applyFontSize(fontSize.value);
      });
    }
  },

  bindDocumentEditorEvents() {
    const content = document.getElementById('document-content');
    const lineSpacing = document.getElementById('line-spacing');
    const paragraphIndent = document.getElementById('paragraph-indent');
    
    if (content) {
      content.addEventListener('input', () => {
        this.updateDocumentStats();
        this.saveCurrentDocument();
      });
      
      content.addEventListener('keydown', (e) => {
        this.handleKeyboardShortcuts(e);
      });
    }
    
    if (lineSpacing) {
      lineSpacing.addEventListener('input', (e) => {
        const value = e.target.value;
        document.getElementById('line-spacing-display').textContent = value;
        if (content) content.style.lineHeight = value;
      });
    }
    
    if (paragraphIndent) {
      paragraphIndent.addEventListener('input', (e) => {
        const value = e.target.value + 'pt';
        document.getElementById('indent-display').textContent = e.target.value;
        if (content) content.style.textIndent = value;
      });
    }
  },

  applyFormatting(format) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    switch (format) {
      case 'bold':
        document.execCommand('bold');
        break;
      case 'italic':
        document.execCommand('italic');
        break;
      case 'underline':
        document.execCommand('underline');
        break;
      case 'strikethrough':
        document.execCommand('strikeThrough');
        break;
      case 'subscript':
        document.execCommand('subscript');
        break;
      case 'superscript':
        document.execCommand('superscript');
        break;
      case 'small-caps':
        this.applyStyleToSelection('font-variant', 'small-caps');
        break;
      case 'bullet-list':
        document.execCommand('insertUnorderedList');
        break;
      case 'number-list':
        document.execCommand('insertOrderedList');
        break;
    }
  },

  applyStyleToSelection(property, value) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style[property] = value;
    
    try {
      range.surroundContents(span);
    } catch (e) {
      // If can't surround, insert at cursor
      range.insertNode(span);
    }
  },

  setTextAlignment(align) {
    const alignments = {
      'left': 'justifyLeft',
      'center': 'justifyCenter',
      'right': 'justifyRight',
      'justify': 'justifyFull'
    };
    
    if (alignments[align]) {
      document.execCommand(alignments[align]);
    }
  },

  updateAlignmentButtons(activeAlign) {
    document.querySelectorAll('.align-btn').forEach(btn => {
      btn.style.background = 'transparent';
      btn.style.color = 'var(--hermes-text)';
    });
    
    const activeBtn = document.querySelector(`[data-align="${activeAlign}"]`);
    if (activeBtn) {
      activeBtn.style.background = 'var(--hermes-highlight-bg)';
      activeBtn.style.color = 'var(--hermes-highlight-text)';
    }
  },

  applyFontFamily(fontFamily) {
    document.execCommand('fontName', false, fontFamily);
  },

  applyFontSize(fontSize) {
    // Convert pt to px for web display
    const pxSize = Math.round(parseInt(fontSize) * 1.33);
    document.execCommand('fontSize', false, '7'); // Use size 7 as base
    
    // Then apply actual size via CSS
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = fontSize + 'pt';
      
      try {
        range.surroundContents(span);
      } catch (e) {
        range.insertNode(span);
      }
    }
  },

  handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          this.applyFormatting('bold');
          break;
        case 'i':
          e.preventDefault();
          this.applyFormatting('italic');
          break;
        case 'u':
          e.preventDefault();
          this.applyFormatting('underline');
          break;
        case 's':
          e.preventDefault();
          this.saveCurrentDocument();
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            this.redo();
          } else {
            this.undo();
          }
          break;
      }
    }
  },

  updateDocumentStats() {
    const content = document.getElementById('document-content');
    if (!content) return;

    const text = content.textContent || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const paragraphs = content.querySelectorAll('p, div').length || 1;
    
    document.getElementById('word-count').textContent = words;
    document.getElementById('char-count').textContent = chars;
    document.getElementById('para-count').textContent = paragraphs;
  },

  createNewDocument(app) {
    const title = prompt('Enter document title:') || 'Untitled Document';
    
    const doc = {
      id: crypto.randomUUID(),
      title: title,
      content: '<p>Start typing your document...</p>',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      wordCount: 0,
      pageCount: 1,
      settings: { ...this.documentSettings }
    };

    this.documents.push(doc);
    this.currentDocument = doc;
    this.saveDocuments();
    this.openDocument(doc.id);
    
    if (app) app.showToast(`Document "${title}" created!`, 'success');
  },

  openDocument(docId) {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) return;

    this.currentDocument = doc;
    const content = document.getElementById('document-content');
    if (content) {
      content.innerHTML = doc.content;
      this.updateDocumentStats();
    }
  },

  saveCurrentDocument(app) {
    if (!this.currentDocument) return;

    const content = document.getElementById('document-content');
    if (content) {
      this.currentDocument.content = content.innerHTML;
      this.currentDocument.modified = new Date().toISOString();
      this.currentDocument.wordCount = parseInt(document.getElementById('word-count').textContent) || 0;
      this.saveDocuments();
      
      if (app) app.showToast('Document saved!', 'success');
    }
  },

  insertTable() {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    
    if (rows && cols) {
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
      
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">Cell</td>';
        }
        tableHTML += '</tr>';
      }
      
      tableHTML += '</table>';
      document.execCommand('insertHTML', false, tableHTML);
    }
  },

  insertImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = `<img src="${e.target.result}" style="max-width: 100%; height: auto; margin: 10px 0;" alt="Inserted image">`;
          document.execCommand('insertHTML', false, img);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  },

  insertLink() {
    const url = prompt('Enter URL:');
    const text = prompt('Enter link text:') || url;
    
    if (url) {
      const link = `<a href="${url}" target="_blank">${text}</a>`;
      document.execCommand('insertHTML', false, link);
    }
  },

  saveDocuments() {
    localStorage.setItem('nextnote_documents', JSON.stringify(this.documents));
  },

  saveSettings() {
    localStorage.setItem('nextnote_document_settings', JSON.stringify(this.documentSettings));
  },

  initializeDocumentComponents(app) {
    // Add CSS for document editor
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatDoc {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-6px) rotate(1deg); }
      }
      
      #document-content:focus {
        outline: none;
      }
      
      #document-content p {
        margin: 0 0 12px 0;
      }
      
      #document-content table {
        border-collapse: collapse;
        width: 100%;
        margin: 10px 0;
      }
      
      #document-content td, #document-content th {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
      }
      
      .format-btn:hover, .align-btn:hover {
        background: var(--hermes-highlight-bg) !important;
        color: var(--hermes-highlight-text) !important;
      }
    `;
    document.head.appendChild(style);

    // Initialize document stats
    setTimeout(() => {
      this.updateDocumentStats();
    }, 100);
  },

  bindDocumentEvents(app) {
    // Listen for document events
    app.on('documentUpdated', () => {
      this.saveDocuments();
    });
  }
});
