/**
 * NextNote Enhanced Code Workspace Plugin
 * Monaco Editor integration with file management and multi-language syntax highlighting
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Enhanced Code Workspace',
  version: '1.0.0',
  description: 'Monaco Editor integration with file management and multi-language syntax highlighting',
  
  onLoad(app) {
    this.codeFiles = JSON.parse(localStorage.getItem('nextnote_code_files') || '{}');
    this.currentFileName = null;
    this.monacoEditor = null;
    this.isMonacoLoaded = false;
    this.tabInterface = null;
    this.setupEnhancedCodeWorkspaceUI(app);
    this.loadMonacoEditor();
    this.initializeCodeComponents(app);
    this.bindCodeEvents(app);
  },

  setupEnhancedCodeWorkspaceUI(app) {
    const panel = app.createPanel('enhanced-code-workspace', 'Code Workspace');
    
    // Header with code theme
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #1e1e1e, #2d2d30, #007acc, #0e639c);
      border-radius: 12px;
      color: white;
      position: relative;
      overflow: hidden;
    `;

    // Floating code icons
    const codeIcons = ['💻', '⚡', '🔧', '📁', '🎯', '⚙️'];
    codeIcons.forEach((icon, index) => {
      const floatingIcon = document.createElement('div');
      floatingIcon.style.cssText = `
        position: absolute;
        font-size: 1.3em;
        opacity: 0.2;
        animation: floatCode ${4 + index}s ease-in-out infinite;
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
      font-family: 'Consolas', 'Monaco', monospace;
    `;
    title.innerHTML = '💻 Code Workspace';

    const codeControls = document.createElement('div');
    codeControls.style.cssText = `
      display: flex;
      gap: 10px;
      z-index: 1;
      position: relative;
    `;

    const newFileBtn = document.createElement('button');
    newFileBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    newFileBtn.textContent = '📄 New File';
    newFileBtn.addEventListener('click', () => this.createNewFile());

    const runBtn = document.createElement('button');
    runBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    runBtn.textContent = '▶️ Run';
    runBtn.addEventListener('click', () => this.runCode());

    codeControls.appendChild(newFileBtn);
    codeControls.appendChild(runBtn);

    header.appendChild(title);
    header.appendChild(codeControls);
    panel.appendChild(header);

    // Tabbed Interface
    const tabInterface = document.createElement('div');
    tabInterface.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      margin-bottom: 20px;
      overflow: hidden;
    `;

    tabInterface.innerHTML = `
      <div style="display: flex; background: var(--hermes-bg);">
        <button id="notes-tab" class="workspace-tab active" data-tab="notes" style="
          flex: 1;
          padding: 12px 20px;
          border: none;
          background: var(--hermes-highlight-bg);
          color: var(--hermes-highlight-text);
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        ">📝 Notes</button>
        <button id="code-tab" class="workspace-tab" data-tab="code" style="
          flex: 1;
          padding: 12px 20px;
          border: none;
          background: transparent;
          color: var(--hermes-text);
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        ">💻 Code</button>
        <button id="tools-tab" class="workspace-tab" data-tab="tools" style="
          flex: 1;
          padding: 12px 20px;
          border: none;
          background: transparent;
          color: var(--hermes-text);
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        ">🛠️ Tools</button>
      </div>
      
      <!-- Notes Workspace -->
      <div id="notes-workspace" class="workspace-content" style="
        padding: 20px;
        min-height: 400px;
      ">
        <div style="text-align: center; color: var(--hermes-disabled-text); padding: 40px;">
          <div style="font-size: 3em; margin-bottom: 15px;">📝</div>
          <div>Notes workspace</div>
          <div style="font-size: 0.9em; margin-top: 5px;">Switch to Notes tab in main NextNote interface</div>
        </div>
      </div>
      
      <!-- Code Workspace -->
      <div id="code-workspace" class="workspace-content hidden" style="
        display: flex;
        height: 600px;
      ">
        <!-- File Sidebar -->
        <div style="
          width: 250px;
          background: var(--hermes-bg);
          border-right: 1px solid var(--hermes-border);
          padding: 15px;
          overflow-y: auto;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="margin: 0; color: var(--hermes-text);">📁 Files</h4>
            <button onclick="this.createNewFile()" style="
              padding: 4px 8px;
              border: none;
              border-radius: 3px;
              background: var(--hermes-success-text);
              color: white;
              cursor: pointer;
              font-size: 0.8em;
            ">+ New</button>
          </div>
          
          <div id="file-list" style="
            display: flex;
            flex-direction: column;
            gap: 4px;
          ">
            ${this.generateFileList()}
          </div>
        </div>
        
        <!-- Editor Area -->
        <div style="flex: 1; display: flex; flex-direction: column;">
          <!-- Editor Toolbar -->
          <div style="
            background: var(--hermes-bg);
            border-bottom: 1px solid var(--hermes-border);
            padding: 10px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span id="current-file-name" style="
                color: var(--hermes-text);
                font-family: 'Consolas', 'Monaco', monospace;
                font-weight: bold;
              ">No file selected</span>
              <select id="language-selector" style="
                padding: 4px 8px;
                border: 1px solid var(--hermes-border);
                border-radius: 3px;
                background: var(--hermes-input-bg);
                color: var(--hermes-text);
                font-size: 0.9em;
              ">
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
                <option value="sql">SQL</option>
                <option value="php">PHP</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="xml">XML</option>
              </select>
            </div>
            
            <div style="display: flex; gap: 8px;">
              <button onclick="this.saveCurrentFile()" style="
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                background: var(--hermes-success-text);
                color: white;
                cursor: pointer;
                font-size: 0.9em;
              ">💾 Save</button>
              <button onclick="this.runCode()" style="
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                background: var(--hermes-info-text);
                color: white;
                cursor: pointer;
                font-size: 0.9em;
              ">▶️ Run</button>
              <button onclick="this.formatCode()" style="
                padding: 6px 12px;
                border: 1px solid var(--hermes-border);
                border-radius: 4px;
                background: var(--hermes-button-bg);
                color: var(--hermes-text);
                cursor: pointer;
                font-size: 0.9em;
              ">🎨 Format</button>
            </div>
          </div>
          
          <!-- Monaco Editor Container -->
          <div id="monaco-editor-container" style="
            flex: 1;
            background: #1e1e1e;
            position: relative;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              text-align: center;
              color: #888;
            ">
              <div style="font-size: 2em; margin-bottom: 10px;">💻</div>
              <div>Loading Monaco Editor...</div>
            </div>
          </div>
          
          <!-- Output Panel -->
          <div id="output-panel" style="
            height: 150px;
            background: var(--hermes-bg);
            border-top: 1px solid var(--hermes-border);
            padding: 10px;
            overflow-y: auto;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.9em;
            color: var(--hermes-text);
          ">
            <div style="font-weight: bold; margin-bottom: 8px;">📤 Output:</div>
            <div id="output-content">Ready to run code...</div>
          </div>
        </div>
      </div>
      
      <!-- Tools Workspace -->
      <div id="tools-workspace" class="workspace-content hidden" style="
        padding: 20px;
        min-height: 400px;
      ">
        <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🛠️ Development Tools</h4>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
          <div style="
            background: var(--hermes-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
          " onclick="this.openColorPicker()" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
            <div style="font-size: 2em; margin-bottom: 8px;">🎨</div>
            <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 4px;">Color Picker</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Pick and convert colors</div>
          </div>
          
          <div style="
            background: var(--hermes-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
          " onclick="this.openRegexTester()" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
            <div style="font-size: 2em; margin-bottom: 8px;">🔍</div>
            <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 4px;">Regex Tester</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Test regular expressions</div>
          </div>
          
          <div style="
            background: var(--hermes-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
          " onclick="this.openJsonFormatter()" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
            <div style="font-size: 2em; margin-bottom: 8px;">📋</div>
            <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 4px;">JSON Formatter</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Format and validate JSON</div>
          </div>
          
          <div style="
            background: var(--hermes-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
          " onclick="this.openBase64Tool()" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
            <div style="font-size: 2em; margin-bottom: 8px;">🔐</div>
            <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 4px;">Base64 Tool</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Encode/decode Base64</div>
          </div>
          
          <div style="
            background: var(--hermes-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
          " onclick="this.openHashGenerator()" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
            <div style="font-size: 2em; margin-bottom: 8px;">🔑</div>
            <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 4px;">Hash Generator</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Generate MD5, SHA hashes</div>
          </div>
          
          <div style="
            background: var(--hermes-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
          " onclick="this.openUrlEncoder()" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
            <div style="font-size: 2em; margin-bottom: 8px;">🌐</div>
            <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 4px;">URL Encoder</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Encode/decode URLs</div>
          </div>
        </div>
      </div>
    `;

    panel.appendChild(tabInterface);
    this.tabInterface = tabInterface;

    // Bind tab switching events
    this.bindTabEvents();
  },

  generateFileList() {
    const files = Object.keys(this.codeFiles);
    
    if (files.length === 0) {
      return `
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic; padding: 20px;">
          <div style="font-size: 2em; margin-bottom: 10px;">📄</div>
          <div>No files yet</div>
          <div style="font-size: 0.8em; margin-top: 5px;">Create your first file</div>
        </div>
      `;
    }

    return files.map(fileName => {
      const file = this.codeFiles[fileName];
      const extension = fileName.split('.').pop() || '';
      const icon = this.getFileIcon(extension);
      
      return `
        <div class="file-item" data-filename="${fileName}" style="
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          ${this.currentFileName === fileName ? 'background: var(--hermes-highlight-bg); color: var(--hermes-highlight-text);' : ''}
        " onclick="this.openFile('${fileName}')" onmouseenter="this.style.background='var(--hermes-highlight-bg)'" onmouseleave="this.style.background='${this.currentFileName === fileName ? 'var(--hermes-highlight-bg)' : 'transparent'}'">
          <span style="font-size: 1.2em;">${icon}</span>
          <span style="flex: 1; font-size: 0.9em; font-family: 'Consolas', 'Monaco', monospace;">${fileName}</span>
          <button onclick="event.stopPropagation(); this.deleteFile('${fileName}')" style="
            padding: 2px 6px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-error-text);
            color: white;
            cursor: pointer;
            font-size: 0.7em;
            opacity: 0.7;
          ">×</button>
        </div>
      `;
    }).join('');
  },

  getFileIcon(extension) {
    const icons = {
      'js': '📜',
      'ts': '📘',
      'py': '🐍',
      'html': '🌐',
      'css': '🎨',
      'json': '📋',
      'md': '📝',
      'sql': '🗃️',
      'php': '🐘',
      'java': '☕',
      'cs': '🔷',
      'cpp': '⚙️',
      'go': '🐹',
      'rs': '🦀',
      'xml': '📄'
    };
    return icons[extension.toLowerCase()] || '📄';
  },

  bindTabEvents() {
    const tabs = this.tabInterface.querySelectorAll('.workspace-tab');
    const contents = this.tabInterface.querySelectorAll('.workspace-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update tab styles
        tabs.forEach(t => {
          t.style.background = 'transparent';
          t.style.color = 'var(--hermes-text)';
        });
        tab.style.background = 'var(--hermes-highlight-bg)';
        tab.style.color = 'var(--hermes-highlight-text)';
        
        // Update content visibility
        contents.forEach(content => {
          content.classList.add('hidden');
        });
        
        const targetContent = this.tabInterface.querySelector(`#${targetTab}-workspace`);
        if (targetContent) {
          targetContent.classList.remove('hidden');
          
          // Initialize Monaco editor when code tab is opened
          if (targetTab === 'code' && !this.monacoEditor && this.isMonacoLoaded) {
            this.initializeMonacoEditor();
          }
        }
      });
    });
  },

  loadMonacoEditor() {
    // Load Monaco Editor from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';
    script.onload = () => {
      require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' } });
      require(['vs/editor/editor.main'], () => {
        this.isMonacoLoaded = true;
        console.log('Monaco Editor loaded successfully');
      });
    };
    document.head.appendChild(script);
  },

  initializeMonacoEditor() {
    if (!this.isMonacoLoaded) return;

    const container = document.getElementById('monaco-editor-container');
    if (!container) return;

    container.innerHTML = ''; // Clear loading message

    this.monacoEditor = monaco.editor.create(container, {
      value: '// Welcome to the Enhanced Code Workspace!\n// Select a file from the sidebar or create a new one to start coding.\n\nconsole.log("Hello, NextNote!");',
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      tabSize: 2,
      insertSpaces: true
    });

    // Auto-save on content change
    this.monacoEditor.onDidChangeModelContent(() => {
      this.saveCurrentFile();
    });

    // Language selector change
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
      languageSelector.addEventListener('change', (e) => {
        const language = e.target.value;
        monaco.editor.setModelLanguage(this.monacoEditor.getModel(), language);
        
        // Update current file language if a file is open
        if (this.currentFileName) {
          this.codeFiles[this.currentFileName].language = language;
          this.saveCodeFiles();
        }
      });
    }
  },

  createNewFile() {
    const fileName = prompt('Enter file name (with extension):');
    if (!fileName || fileName.trim() === '') return;

    const cleanFileName = fileName.trim();
    
    if (this.codeFiles[cleanFileName]) {
      alert('File already exists!');
      return;
    }

    const extension = cleanFileName.split('.').pop() || 'txt';
    const language = this.getLanguageFromExtension(extension);

    this.codeFiles[cleanFileName] = {
      content: `// New ${language} file\n// Start coding here!\n\n`,
      language: language,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    this.saveCodeFiles();
    this.refreshFileList();
    this.openFile(cleanFileName);
  },

  getLanguageFromExtension(extension) {
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'sql': 'sql',
      'php': 'php',
      'java': 'java',
      'cs': 'csharp',
      'cpp': 'cpp',
      'go': 'go',
      'rs': 'rust',
      'xml': 'xml'
    };
    return languageMap[extension.toLowerCase()] || 'plaintext';
  },

  openFile(fileName) {
    if (!this.codeFiles[fileName]) return;

    this.currentFileName = fileName;
    const file = this.codeFiles[fileName];

    // Update current file name display
    const fileNameDisplay = document.getElementById('current-file-name');
    if (fileNameDisplay) {
      fileNameDisplay.textContent = fileName;
    }

    // Update language selector
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
      languageSelector.value = file.language || 'javascript';
    }

    // Update Monaco editor content and language
    if (this.monacoEditor) {
      this.monacoEditor.setValue(file.content || '');
      monaco.editor.setModelLanguage(this.monacoEditor.getModel(), file.language || 'javascript');
    }

    // Update file list highlighting
    this.refreshFileList();
  },

  saveCurrentFile() {
    if (!this.currentFileName || !this.monacoEditor) return;

    const content = this.monacoEditor.getValue();
    this.codeFiles[this.currentFileName].content = content;
    this.codeFiles[this.currentFileName].modified = new Date().toISOString();
    
    this.saveCodeFiles();
  },

  deleteFile(fileName) {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    delete this.codeFiles[fileName];
    
    if (this.currentFileName === fileName) {
      this.currentFileName = null;
      if (this.monacoEditor) {
        this.monacoEditor.setValue('// Select a file to start editing');
      }
      const fileNameDisplay = document.getElementById('current-file-name');
      if (fileNameDisplay) {
        fileNameDisplay.textContent = 'No file selected';
      }
    }

    this.saveCodeFiles();
    this.refreshFileList();
  },

  runCode() {
    if (!this.currentFileName || !this.monacoEditor) {
      this.updateOutput('No file selected to run');
      return;
    }

    const code = this.monacoEditor.getValue();
    const file = this.codeFiles[this.currentFileName];
    const language = file.language || 'javascript';

    this.updateOutput('Running code...');

    if (language === 'javascript') {
      this.runJavaScript(code);
    } else {
      this.updateOutput(`Code execution for ${language} is not yet supported in the browser.\nSupported languages: JavaScript`);
    }
  },

  runJavaScript(code) {
    try {
      // Capture console output
      const originalLog = console.log;
      const originalError = console.error;
      const output = [];

      console.log = (...args) => {
        output.push('LOG: ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
        originalLog.apply(console, args);
      };

      console.error = (...args) => {
        output.push('ERROR: ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
        originalError.apply(console, args);
      };

      // Execute the code
      const result = eval(code);
      
      if (result !== undefined) {
        output.push('RESULT: ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)));
      }

      // Restore console
      console.log = originalLog;
      console.error = originalError;

      this.updateOutput(output.length > 0 ? output.join('\n') : 'Code executed successfully (no output)');
    } catch (error) {
      this.updateOutput(`ERROR: ${error.message}\n\nStack trace:\n${error.stack}`);
    }
  },

  formatCode() {
    if (!this.monacoEditor) return;

    // Trigger Monaco's built-in formatting
    this.monacoEditor.getAction('editor.action.formatDocument').run();
  },

  updateOutput(text) {
    const outputContent = document.getElementById('output-content');
    if (outputContent) {
      outputContent.textContent = text;
      outputContent.scrollTop = outputContent.scrollHeight;
    }
  },

  refreshFileList() {
    const fileList = document.getElementById('file-list');
    if (fileList) {
      fileList.innerHTML = this.generateFileList();
    }
  },

  saveCodeFiles() {
    localStorage.setItem('nextnote_code_files', JSON.stringify(this.codeFiles));
  },

  // Development Tools
  openColorPicker() {
    alert('Color Picker tool coming soon!');
  },

  openRegexTester() {
    alert('Regex Tester tool coming soon!');
  },

  openJsonFormatter() {
    alert('JSON Formatter tool coming soon!');
  },

  openBase64Tool() {
    alert('Base64 Tool coming soon!');
  },

  openHashGenerator() {
    alert('Hash Generator tool coming soon!');
  },

  openUrlEncoder() {
    alert('URL Encoder tool coming soon!');
  },

  initializeCodeComponents(app) {
    // Add CSS for code workspace
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatCode {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-8px) rotate(2deg); }
      }
      
      .workspace-tab:hover {
        background: var(--hermes-highlight-bg) !important;
        color: var(--hermes-highlight-text) !important;
      }
      
      .file-item:hover {
        transform: scale(1.02);
      }
      
      .hidden {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  },

  bindCodeEvents(app) {
    // Listen for code events
    app.on('codeFileChanged', (fileName) => {
      if (fileName === this.currentFileName) {
        this.openFile(fileName);
      }
    });
  }
});
