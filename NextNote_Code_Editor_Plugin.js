/**
 * NextNote Code Editor Plugin
 * Advanced code editor with syntax highlighting, multiple languages, and developer tools
 * Open-source alternative to VS Code integration
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Code Editor',
  version: '1.0.0',
  description: 'Advanced code editor with syntax highlighting and developer tools',
  
  onLoad(app) {
    this.codeFiles = JSON.parse(localStorage.getItem('nextnote_code_files') || '[]');
    this.currentFile = null;
    this.currentLanguage = 'javascript';
    this.setupCodeEditorUI(app);
    this.initializeCodeEditorComponents(app);
    this.bindCodeEditorEvents(app);
  },

  setupCodeEditorUI(app) {
    const panel = app.createPanel('code-editor', 'Code Editor');
    
    // Code Editor header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #2d3748, #4a5568);
      border-radius: 12px;
      color: white;
    `;

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0; color: white; display: flex; align-items: center; gap: 10px;';
    title.innerHTML = '💻 Code Editor';

    const newFileBtn = document.createElement('button');
    newFileBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
    `;
    newFileBtn.textContent = '+ New File';
    newFileBtn.addEventListener('click', () => this.showNewFileDialog(app));

    header.appendChild(title);
    header.appendChild(newFileBtn);
    panel.appendChild(header);

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      padding: 10px;
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      flex-wrap: wrap;
      align-items: center;
    `;

    // File selector
    const fileSelector = document.createElement('select');
    fileSelector.id = 'code-file-selector';
    fileSelector.style.cssText = `
      padding: 6px 10px;
      border: 1px solid var(--hermes-border);
      border-radius: 4px;
      background: var(--hermes-input-bg);
      color: var(--hermes-text);
      min-width: 200px;
    `;
    fileSelector.innerHTML = '<option value="">Select a file...</option>';

    // Language selector
    const languageSelector = document.createElement('select');
    languageSelector.id = 'code-language-selector';
    languageSelector.style.cssText = `
      padding: 6px 10px;
      border: 1px solid var(--hermes-border);
      border-radius: 4px;
      background: var(--hermes-input-bg);
      color: var(--hermes-text);
    `;

    const languages = [
      'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c',
      'html', 'css', 'scss', 'json', 'xml', 'yaml', 'markdown',
      'sql', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'
    ];

    languages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang;
      option.textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
      if (lang === this.currentLanguage) option.selected = true;
      languageSelector.appendChild(option);
    });

    // Action buttons
    const saveBtn = document.createElement('button');
    saveBtn.style.cssText = `
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      background: var(--hermes-success-text);
      color: white;
      cursor: pointer;
      font-size: 0.9em;
    `;
    saveBtn.textContent = '💾 Save';
    saveBtn.addEventListener('click', () => this.saveCurrentFile(app));

    const runBtn = document.createElement('button');
    runBtn.style.cssText = `
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      background: var(--hermes-info-text);
      color: white;
      cursor: pointer;
      font-size: 0.9em;
    `;
    runBtn.textContent = '▶️ Run';
    runBtn.addEventListener('click', () => this.runCode(app));

    const formatBtn = document.createElement('button');
    formatBtn.style.cssText = `
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      background: var(--hermes-warning-text);
      color: white;
      cursor: pointer;
      font-size: 0.9em;
    `;
    formatBtn.textContent = '🎨 Format';
    formatBtn.addEventListener('click', () => this.formatCode(app));

    toolbar.appendChild(fileSelector);
    toolbar.appendChild(languageSelector);
    toolbar.appendChild(saveBtn);
    toolbar.appendChild(runBtn);
    toolbar.appendChild(formatBtn);
    panel.appendChild(toolbar);

    // Editor container
    const editorContainer = document.createElement('div');
    editorContainer.style.cssText = `
      display: flex;
      gap: 10px;
      height: 500px;
    `;

    // Code editor
    const editorWrapper = document.createElement('div');
    editorWrapper.style.cssText = `
      flex: 1;
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      overflow: hidden;
      background: #1e1e1e;
    `;

    const editor = document.createElement('textarea');
    editor.id = 'code-editor';
    editor.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      padding: 15px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
      background: #1e1e1e;
      color: #d4d4d4;
      resize: none;
      tab-size: 2;
    `;
    editor.placeholder = 'Start coding...';

    editorWrapper.appendChild(editor);
    editorContainer.appendChild(editorWrapper);

    // Output panel
    const outputPanel = document.createElement('div');
    outputPanel.style.cssText = `
      width: 300px;
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      background: var(--hermes-panel-bg);
      display: flex;
      flex-direction: column;
    `;

    const outputHeader = document.createElement('div');
    outputHeader.style.cssText = `
      padding: 10px 15px;
      border-bottom: 1px solid var(--hermes-border);
      background: var(--hermes-bg);
      font-weight: bold;
      color: var(--hermes-text);
    `;
    outputHeader.textContent = '📤 Output';

    const outputContent = document.createElement('div');
    outputContent.id = 'code-output';
    outputContent.style.cssText = `
      flex: 1;
      padding: 15px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      color: var(--hermes-text);
      overflow-y: auto;
      white-space: pre-wrap;
    `;
    outputContent.textContent = 'Output will appear here...';

    outputPanel.appendChild(outputHeader);
    outputPanel.appendChild(outputContent);
    editorContainer.appendChild(outputPanel);

    panel.appendChild(editorContainer);

    // File explorer
    const explorerSection = document.createElement('div');
    explorerSection.style.cssText = 'margin-top: 20px;';
    explorerSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">📁 File Explorer</h4>
      <div id="file-explorer" style="
        min-height: 150px;
        padding: 15px;
        background: var(--hermes-panel-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 8px;
      "></div>
    `;
    panel.appendChild(explorerSection);

    // Bind events
    languageSelector.addEventListener('change', (e) => {
      this.currentLanguage = e.target.value;
      this.applySyntaxHighlighting();
    });

    fileSelector.addEventListener('change', (e) => {
      if (e.target.value) {
        this.loadFile(e.target.value);
      }
    });

    // Add tab support to editor
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 2;
      }
    });

    this.updateFileSelector();
    this.updateFileExplorer();
  },

  showNewFileDialog(app) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 12px;
      padding: 30px;
      width: 400px;
      max-width: 90vw;
    `;

    dialog.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: var(--hermes-text);">Create New File</h3>
      <form id="new-file-form">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">File Name</label>
          <input type="text" id="file-name" required placeholder="example.js" style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Template</label>
          <select id="file-template" style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
            <option value="blank">Blank File</option>
            <option value="html">HTML Template</option>
            <option value="css">CSS Template</option>
            <option value="javascript">JavaScript Template</option>
            <option value="python">Python Template</option>
            <option value="markdown">Markdown Template</option>
          </select>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" id="cancel-file" style="padding: 10px 20px; border: 1px solid var(--hermes-border); border-radius: 6px; background: var(--hermes-button-bg); color: var(--hermes-text); cursor: pointer;">Cancel</button>
          <button type="submit" style="padding: 10px 20px; border: none; border-radius: 6px; background: var(--hermes-highlight-bg); color: var(--hermes-highlight-text); cursor: pointer;">Create File</button>
        </div>
      </form>
    `;

    dialog.querySelector('#cancel-file').addEventListener('click', () => overlay.remove());
    dialog.querySelector('#new-file-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.createNewFile({
        name: dialog.querySelector('#file-name').value,
        template: dialog.querySelector('#file-template').value
      }, app);
      overlay.remove();
    });

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  },

  createNewFile(fileData, app) {
    const file = {
      id: crypto.randomUUID(),
      name: fileData.name,
      language: this.detectLanguageFromFilename(fileData.name),
      content: this.getTemplateContent(fileData.template),
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    this.codeFiles.push(file);
    this.saveCodeFiles();
    this.updateFileSelector();
    this.updateFileExplorer();
    this.loadFile(file.id);
    app.showToast(`File "${file.name}" created successfully!`, 'success');
  },

  detectLanguageFromFilename(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      'cs': 'csharp',
      'cpp': 'cpp',
      'c': 'c',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'xml': 'xml',
      'yml': 'yaml',
      'yaml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin'
    };
    return langMap[ext] || 'text';
  },

  getTemplateContent(template) {
    const templates = {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>`,
      css: `/* CSS Styles */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}`,
      javascript: `// JavaScript Code
console.log('Hello, World!');

function greet(name) {
    return \`Hello, \${name}!\`;
}

// Example usage
const message = greet('NextNote');
console.log(message);`,
      python: `# Python Code
print("Hello, World!")

def greet(name):
    return f"Hello, {name}!"

# Example usage
message = greet("NextNote")
print(message)`,
      markdown: `# Document Title

## Introduction

This is a sample markdown document.

## Features

- **Bold text**
- *Italic text*
- \`Code snippets\`
- [Links](https://example.com)

## Code Example

\`\`\`javascript
console.log('Hello from markdown!');
\`\`\`

## Conclusion

Happy coding with NextNote!`
    };

    return templates[template] || '';
  },

  loadFile(fileId) {
    const file = this.codeFiles.find(f => f.id === fileId);
    if (!file) return;

    this.currentFile = file;
    const editor = document.getElementById('code-editor');
    const languageSelector = document.getElementById('code-language-selector');
    const fileSelector = document.getElementById('code-file-selector');

    if (editor) editor.value = file.content;
    if (languageSelector) languageSelector.value = file.language;
    if (fileSelector) fileSelector.value = fileId;

    this.currentLanguage = file.language;
    this.applySyntaxHighlighting();
  },

  saveCurrentFile(app) {
    if (!this.currentFile) {
      app.showToast('No file selected to save', 'warning');
      return;
    }

    const editor = document.getElementById('code-editor');
    if (editor) {
      this.currentFile.content = editor.value;
      this.currentFile.modified = new Date().toISOString();
      this.saveCodeFiles();
      app.showToast(`File "${this.currentFile.name}" saved successfully!`, 'success');
    }
  },

  runCode(app) {
    if (!this.currentFile) {
      app.showToast('No file selected to run', 'warning');
      return;
    }

    const editor = document.getElementById('code-editor');
    const output = document.getElementById('code-output');
    
    if (!editor || !output) return;

    const code = editor.value;
    
    try {
      if (this.currentLanguage === 'javascript') {
        // Capture console output
        const originalLog = console.log;
        const logs = [];
        console.log = (...args) => {
          logs.push(args.join(' '));
          originalLog(...args);
        };

        // Execute code
        eval(code);
        
        // Restore console.log
        console.log = originalLog;
        
        output.textContent = logs.length > 0 ? logs.join('\n') : 'Code executed successfully (no output)';
        output.style.color = 'var(--hermes-success-text)';
      } else {
        output.textContent = `Code execution for ${this.currentLanguage} is not supported in browser environment.`;
        output.style.color = 'var(--hermes-warning-text)';
      }
    } catch (error) {
      output.textContent = `Error: ${error.message}`;
      output.style.color = 'var(--hermes-error-text)';
    }
  },

  formatCode(app) {
    if (!this.currentFile) {
      app.showToast('No file selected to format', 'warning');
      return;
    }

    const editor = document.getElementById('code-editor');
    if (!editor) return;

    // Simple formatting for JavaScript/JSON
    if (this.currentLanguage === 'javascript' || this.currentLanguage === 'json') {
      try {
        if (this.currentLanguage === 'json') {
          const parsed = JSON.parse(editor.value);
          editor.value = JSON.stringify(parsed, null, 2);
        } else {
          // Basic JavaScript formatting
          editor.value = this.formatJavaScript(editor.value);
        }
        app.showToast('Code formatted successfully!', 'success');
      } catch (error) {
        app.showToast('Failed to format code: ' + error.message, 'error');
      }
    } else {
      app.showToast(`Formatting for ${this.currentLanguage} is not yet supported`, 'info');
    }
  },

  formatJavaScript(code) {
    // Basic JavaScript formatting
    return code
      .replace(/;/g, ';\n')
      .replace(/\{/g, ' {\n')
      .replace(/\}/g, '\n}\n')
      .replace(/,/g, ',\n')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  },

  applySyntaxHighlighting() {
    // Basic syntax highlighting would be implemented here
    // In a full implementation, you'd use a library like Prism.js or CodeMirror
    const editor = document.getElementById('code-editor');
    if (editor) {
      // Apply language-specific styling
      editor.style.background = this.getLanguageTheme(this.currentLanguage);
    }
  },

  getLanguageTheme(language) {
    const themes = {
      javascript: '#1e1e1e',
      python: '#2d3748',
      html: '#2a2d3a',
      css: '#1a202c',
      json: '#2d3748'
    };
    return themes[language] || '#1e1e1e';
  },

  updateFileSelector() {
    const selector = document.getElementById('code-file-selector');
    if (!selector) return;

    selector.innerHTML = '<option value="">Select a file...</option>';
    this.codeFiles.forEach(file => {
      const option = document.createElement('option');
      option.value = file.id;
      option.textContent = file.name;
      selector.appendChild(option);
    });
  },

  updateFileExplorer() {
    const explorer = document.getElementById('file-explorer');
    if (!explorer) return;

    if (this.codeFiles.length === 0) {
      explorer.innerHTML = `
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic;">
          No files yet. Create your first file to get started!
        </div>
      `;
      return;
    }

    explorer.innerHTML = this.codeFiles.map(file => `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        margin-bottom: 5px;
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 4px;
        cursor: pointer;
      " onclick="this.loadFile('${file.id}')">
        <div>
          <div style="font-weight: bold; color: var(--hermes-text);">${this.getFileIcon(file.language)} ${file.name}</div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">
            ${file.language} • Modified: ${new Date(file.modified).toLocaleDateString()}
          </div>
        </div>
        <button onclick="event.stopPropagation(); this.deleteFile('${file.id}')" style="
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

  getFileIcon(language) {
    const icons = {
      javascript: '📜',
      typescript: '📘',
      python: '🐍',
      html: '🌐',
      css: '🎨',
      json: '📋',
      markdown: '📝',
      java: '☕',
      cpp: '⚙️',
      sql: '🗃️'
    };
    return icons[language] || '📄';
  },

  deleteFile(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
      this.codeFiles = this.codeFiles.filter(f => f.id !== fileId);
      this.saveCodeFiles();
      this.updateFileSelector();
      this.updateFileExplorer();
      
      if (this.currentFile && this.currentFile.id === fileId) {
        this.currentFile = null;
        const editor = document.getElementById('code-editor');
        if (editor) editor.value = '';
      }
    }
  },

  saveCodeFiles() {
    localStorage.setItem('nextnote_code_files', JSON.stringify(this.codeFiles));
  },

  initializeCodeEditorComponents(app) {
    // Initialize code editor components
  },

  bindCodeEditorEvents(app) {
    // Listen for code editor events
    app.on('codeFileUpdated', (data) => {
      this.saveCodeFiles();
    });
  }
});
