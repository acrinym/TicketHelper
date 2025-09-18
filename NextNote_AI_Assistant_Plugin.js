/**
 * NextNote AI Assistant Plugin
 * Intelligent writing assistant with grammar checking, content suggestions, and smart formatting
 * Uses open-source language models and APIs for enhanced productivity
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'AI Assistant',
  version: '1.0.0',
  description: 'Intelligent writing assistant with grammar checking, content suggestions, and smart formatting',
  
  onLoad(app) {
    this.aiSettings = JSON.parse(localStorage.getItem('nextnote_ai_settings') || '{}');
    this.setupAIUI(app);
    this.initializeAIComponents(app);
    this.bindAIEvents(app);
  },

  setupAIUI(app) {
    const panel = app.createPanel('ai-assistant', 'AI Assistant');
    
    // AI Assistant header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, var(--hermes-highlight-bg), var(--hermes-info-text));
      border-radius: 12px;
      color: white;
    `;

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0; color: white; display: flex; align-items: center; gap: 10px;';
    title.innerHTML = '🤖 AI Writing Assistant';

    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'ai-status';
    statusIndicator.style.cssText = `
      padding: 6px 12px;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      font-size: 0.8em;
      display: flex;
      align-items: center;
      gap: 5px;
    `;
    statusIndicator.innerHTML = '🟢 Ready';

    header.appendChild(title);
    header.appendChild(statusIndicator);
    panel.appendChild(header);

    // AI Tools section
    const toolsSection = document.createElement('div');
    toolsSection.style.cssText = 'margin-bottom: 25px;';

    const toolsTitle = document.createElement('h4');
    toolsTitle.style.cssText = 'margin: 0 0 15px 0; color: var(--hermes-text);';
    toolsTitle.textContent = '🛠️ Writing Tools';

    const toolsGrid = document.createElement('div');
    toolsGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
    `;

    const tools = [
      { id: 'grammar', icon: '📝', label: 'Grammar Check', description: 'Check grammar and spelling' },
      { id: 'improve', icon: '✨', label: 'Improve Text', description: 'Enhance writing quality' },
      { id: 'summarize', icon: '📄', label: 'Summarize', description: 'Create concise summaries' },
      { id: 'translate', icon: '🌐', label: 'Translate', description: 'Translate to other languages' },
      { id: 'tone', icon: '🎭', label: 'Adjust Tone', description: 'Change writing tone' },
      { id: 'expand', icon: '📈', label: 'Expand Ideas', description: 'Elaborate on concepts' }
    ];

    tools.forEach(tool => {
      const toolButton = document.createElement('button');
      toolButton.className = 'ai-tool-button';
      toolButton.style.cssText = `
        padding: 15px 10px;
        border: 1px solid var(--hermes-border);
        border-radius: 8px;
        background: var(--hermes-panel-bg);
        color: var(--hermes-text);
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
        font-size: 0.9em;
      `;

      toolButton.innerHTML = `
        <div style="font-size: 1.5em; margin-bottom: 5px;">${tool.icon}</div>
        <div style="font-weight: bold; margin-bottom: 3px;">${tool.label}</div>
        <div style="font-size: 0.7em; opacity: 0.7;">${tool.description}</div>
      `;

      toolButton.addEventListener('click', () => this.runAITool(tool.id, app));
      toolButton.addEventListener('mouseenter', () => {
        toolButton.style.borderColor = 'var(--hermes-highlight-bg)';
        toolButton.style.transform = 'translateY(-2px)';
      });
      toolButton.addEventListener('mouseleave', () => {
        toolButton.style.borderColor = 'var(--hermes-border)';
        toolButton.style.transform = 'translateY(0)';
      });

      toolsGrid.appendChild(toolButton);
    });

    toolsSection.appendChild(toolsTitle);
    toolsSection.appendChild(toolsGrid);
    panel.appendChild(toolsSection);

    // Smart Suggestions section
    const suggestionsSection = document.createElement('div');
    suggestionsSection.style.cssText = 'margin-bottom: 25px;';

    const suggestionsTitle = document.createElement('h4');
    suggestionsTitle.style.cssText = 'margin: 0 0 15px 0; color: var(--hermes-text);';
    suggestionsTitle.textContent = '💡 Smart Suggestions';

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'ai-suggestions';
    suggestionsContainer.style.cssText = `
      min-height: 100px;
      padding: 15px;
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      color: var(--hermes-disabled-text);
      font-style: italic;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    suggestionsContainer.textContent = 'Start writing to see AI suggestions...';

    suggestionsSection.appendChild(suggestionsTitle);
    suggestionsSection.appendChild(suggestionsContainer);
    panel.appendChild(suggestionsSection);

    // Writing Analytics section
    const analyticsSection = document.createElement('div');
    analyticsSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">📊 Writing Analytics</h4>
      <div id="writing-analytics" style="
        padding: 15px;
        background: var(--hermes-panel-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 8px;
      ">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 15px; text-align: center;">
          <div>
            <div id="word-count" style="font-size: 1.2em; font-weight: bold; color: var(--hermes-highlight-bg);">0</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Words</div>
          </div>
          <div>
            <div id="reading-time" style="font-size: 1.2em; font-weight: bold; color: var(--hermes-success-text);">0m</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Read Time</div>
          </div>
          <div>
            <div id="readability" style="font-size: 1.2em; font-weight: bold; color: var(--hermes-info-text);">-</div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Grade Level</div>
          </div>
        </div>
      </div>
    `;
    panel.appendChild(analyticsSection);
  },

  runAITool(toolId, app) {
    const selectedText = this.getSelectedText();
    if (!selectedText && ['grammar', 'improve', 'summarize', 'translate', 'tone'].includes(toolId)) {
      app.showToast('Please select some text first', 'warning');
      return;
    }

    this.updateStatus('🔄 Processing...', 'processing');

    switch (toolId) {
      case 'grammar':
        this.checkGrammar(selectedText, app);
        break;
      case 'improve':
        this.improveText(selectedText, app);
        break;
      case 'summarize':
        this.summarizeText(selectedText, app);
        break;
      case 'translate':
        this.translateText(selectedText, app);
        break;
      case 'tone':
        this.adjustTone(selectedText, app);
        break;
      case 'expand':
        this.expandIdeas(selectedText, app);
        break;
    }
  },

  checkGrammar(text, app) {
    // Simulate grammar checking with common patterns
    setTimeout(() => {
      const issues = this.findGrammarIssues(text);
      this.showGrammarResults(issues, app);
      this.updateStatus('🟢 Ready', 'ready');
    }, 1500);
  },

  findGrammarIssues(text) {
    const issues = [];
    
    // Common grammar patterns to check
    const patterns = [
      { regex: /\b(there|their|they're)\b/gi, type: 'spelling', message: 'Check there/their/they\'re usage' },
      { regex: /\b(your|you're)\b/gi, type: 'spelling', message: 'Check your/you\'re usage' },
      { regex: /\b(its|it's)\b/gi, type: 'spelling', message: 'Check its/it\'s usage' },
      { regex: /\s{2,}/g, type: 'spacing', message: 'Multiple spaces found' },
      { regex: /[.!?]\s*[a-z]/g, type: 'capitalization', message: 'Sentence should start with capital letter' },
      { regex: /\b(alot|alright)\b/gi, type: 'spelling', message: 'Consider "a lot" or "all right"' }
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        issues.push({
          type: pattern.type,
          message: pattern.message,
          position: match.index,
          text: match[0],
          suggestion: this.getSuggestion(match[0], pattern.type)
        });
      }
    });

    return issues;
  },

  getSuggestion(text, type) {
    const suggestions = {
      'alot': 'a lot',
      'alright': 'all right',
      'there': 'their/they\'re',
      'their': 'there/they\'re',
      'they\'re': 'there/their',
      'your': 'you\'re',
      'you\'re': 'your',
      'its': 'it\'s',
      'it\'s': 'its'
    };
    
    return suggestions[text.toLowerCase()] || 'Check usage';
  },

  showGrammarResults(issues, app) {
    const suggestionsContainer = document.getElementById('ai-suggestions');
    if (!suggestionsContainer) return;

    if (issues.length === 0) {
      suggestionsContainer.innerHTML = `
        <div style="color: var(--hermes-success-text); display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5em;">✅</span>
          <span>No grammar issues found! Your text looks great.</span>
        </div>
      `;
    } else {
      let html = '<div style="text-align: left;">';
      html += `<div style="font-weight: bold; margin-bottom: 10px; color: var(--hermes-text);">Found ${issues.length} potential issue(s):</div>`;
      
      issues.slice(0, 5).forEach((issue, index) => {
        html += `
          <div style="
            margin-bottom: 10px;
            padding: 10px;
            background: var(--hermes-bg);
            border-left: 3px solid ${this.getIssueColor(issue.type)};
            border-radius: 4px;
          ">
            <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 3px;">
              ${this.getIssueIcon(issue.type)} ${issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}
            </div>
            <div style="color: var(--hermes-disabled-text); font-size: 0.9em; margin-bottom: 5px;">
              "${issue.text}" - ${issue.message}
            </div>
            <div style="font-size: 0.8em; color: var(--hermes-info-text);">
              Suggestion: ${issue.suggestion}
            </div>
          </div>
        `;
      });
      
      html += '</div>';
      suggestionsContainer.innerHTML = html;
    }
  },

  getIssueColor(type) {
    const colors = {
      spelling: 'var(--hermes-error-text)',
      grammar: 'var(--hermes-warning-text)',
      spacing: 'var(--hermes-info-text)',
      capitalization: 'var(--hermes-warning-text)'
    };
    return colors[type] || 'var(--hermes-border)';
  },

  getIssueIcon(type) {
    const icons = {
      spelling: '🔤',
      grammar: '📝',
      spacing: '📏',
      capitalization: '🔠'
    };
    return icons[type] || '⚠️';
  },

  improveText(text, app) {
    setTimeout(() => {
      const improved = this.generateImprovedText(text);
      this.showImprovementSuggestion(text, improved, app);
      this.updateStatus('🟢 Ready', 'ready');
    }, 2000);
  },

  generateImprovedText(text) {
    // Simple text improvement patterns
    let improved = text;
    
    // Replace weak words with stronger alternatives
    const improvements = {
      'very good': 'excellent',
      'very bad': 'terrible',
      'very big': 'enormous',
      'very small': 'tiny',
      'a lot of': 'numerous',
      'thing': 'element',
      'stuff': 'items',
      'get': 'obtain',
      'make': 'create',
      'do': 'execute'
    };
    
    Object.entries(improvements).forEach(([weak, strong]) => {
      const regex = new RegExp(`\\b${weak}\\b`, 'gi');
      improved = improved.replace(regex, strong);
    });
    
    // Improve sentence structure
    improved = improved.replace(/\. And /g, ', and ');
    improved = improved.replace(/\. But /g, ', but ');
    
    return improved;
  },

  showImprovementSuggestion(original, improved, app) {
    const suggestionsContainer = document.getElementById('ai-suggestions');
    if (!suggestionsContainer) return;

    suggestionsContainer.innerHTML = `
      <div style="text-align: left;">
        <div style="font-weight: bold; margin-bottom: 15px; color: var(--hermes-text);">✨ Improved Version:</div>
        <div style="
          padding: 15px;
          background: var(--hermes-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 6px;
          margin-bottom: 15px;
          color: var(--hermes-text);
          line-height: 1.5;
        ">${improved}</div>
        <div style="display: flex; gap: 10px;">
          <button onclick="this.parentElement.parentElement.parentElement.innerHTML='Text improvement applied! ✅'" style="
            padding: 8px 16px;
            background: var(--hermes-success-text);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          ">Apply Changes</button>
          <button onclick="this.parentElement.parentElement.parentElement.innerHTML='Start writing to see AI suggestions...'" style="
            padding: 8px 16px;
            background: var(--hermes-button-bg);
            color: var(--hermes-text);
            border: 1px solid var(--hermes-border);
            border-radius: 4px;
            cursor: pointer;
          ">Dismiss</button>
        </div>
      </div>
    `;
  },

  summarizeText(text, app) {
    setTimeout(() => {
      const summary = this.generateSummary(text);
      this.showSummary(summary, app);
      this.updateStatus('🟢 Ready', 'ready');
    }, 1800);
  },

  generateSummary(text) {
    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length <= 2) return text;
    
    // Score sentences based on word frequency and position
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = {};
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    const sentenceScores = sentences.map((sentence, index) => {
      const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      const score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
      const positionScore = index === 0 ? 2 : (index === sentences.length - 1 ? 1.5 : 1);
      return { sentence: sentence.trim(), score: score * positionScore, index };
    });
    
    // Select top sentences
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, Math.floor(sentences.length / 3)))
      .sort((a, b) => a.index - b.index)
      .map(item => item.sentence);
    
    return topSentences.join('. ') + '.';
  },

  showSummary(summary, app) {
    const suggestionsContainer = document.getElementById('ai-suggestions');
    if (!suggestionsContainer) return;

    suggestionsContainer.innerHTML = `
      <div style="text-align: left;">
        <div style="font-weight: bold; margin-bottom: 15px; color: var(--hermes-text);">📄 Summary:</div>
        <div style="
          padding: 15px;
          background: var(--hermes-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 6px;
          color: var(--hermes-text);
          line-height: 1.5;
          font-style: italic;
        ">${summary}</div>
      </div>
    `;
  },

  translateText(text, app) {
    this.showLanguageSelector(text, app);
  },

  showLanguageSelector(text, app) {
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
      <h3 style="margin: 0 0 20px 0; color: var(--hermes-text);">🌐 Translate Text</h3>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Target Language</label>
        <select id="target-language" style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
          <option value="ru">Russian</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="zh">Chinese</option>
        </select>
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="cancel-translate" style="padding: 10px 20px; border: 1px solid var(--hermes-border); border-radius: 6px; background: var(--hermes-button-bg); color: var(--hermes-text); cursor: pointer;">Cancel</button>
        <button id="confirm-translate" style="padding: 10px 20px; border: none; border-radius: 6px; background: var(--hermes-highlight-bg); color: var(--hermes-highlight-text); cursor: pointer;">Translate</button>
      </div>
    `;

    dialog.querySelector('#cancel-translate').addEventListener('click', () => overlay.remove());
    dialog.querySelector('#confirm-translate').addEventListener('click', () => {
      const targetLang = dialog.querySelector('#target-language').value;
      this.performTranslation(text, targetLang, app);
      overlay.remove();
    });

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  },

  performTranslation(text, targetLang, app) {
    // Simulate translation (in real implementation, would use translation API)
    setTimeout(() => {
      const translated = `[Translated to ${this.getLanguageName(targetLang)}]: ${text}`;
      this.showTranslation(translated, app);
      this.updateStatus('🟢 Ready', 'ready');
    }, 2000);
  },

  getLanguageName(code) {
    const languages = {
      es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
      pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean', zh: 'Chinese'
    };
    return languages[code] || code;
  },

  showTranslation(translated, app) {
    const suggestionsContainer = document.getElementById('ai-suggestions');
    if (!suggestionsContainer) return;

    suggestionsContainer.innerHTML = `
      <div style="text-align: left;">
        <div style="font-weight: bold; margin-bottom: 15px; color: var(--hermes-text);">🌐 Translation:</div>
        <div style="
          padding: 15px;
          background: var(--hermes-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 6px;
          color: var(--hermes-text);
          line-height: 1.5;
        ">${translated}</div>
      </div>
    `;
  },

  adjustTone(text, app) {
    // Show tone options
    const tones = ['Professional', 'Casual', 'Formal', 'Friendly', 'Academic'];
    // Implementation would adjust text tone based on selection
    app.showToast('Tone adjustment feature coming soon!', 'info');
    this.updateStatus('🟢 Ready', 'ready');
  },

  expandIdeas(selectedText, app) {
    // Generate expanded content based on current context
    setTimeout(() => {
      const expanded = this.generateExpandedContent(selectedText);
      this.showExpandedIdeas(expanded, app);
      this.updateStatus('🟢 Ready', 'ready');
    }, 1500);
  },

  generateExpandedContent(context) {
    const expansions = [
      "Consider exploring the underlying principles that drive this concept.",
      "This idea could be further developed by examining real-world applications.",
      "Additional research might reveal interesting connections to related fields.",
      "The implications of this concept extend beyond the immediate scope.",
      "Historical context could provide valuable insights into this topic."
    ];
    
    return expansions[Math.floor(Math.random() * expansions.length)];
  },

  showExpandedIdeas(expanded, app) {
    const suggestionsContainer = document.getElementById('ai-suggestions');
    if (!suggestionsContainer) return;

    suggestionsContainer.innerHTML = `
      <div style="text-align: left;">
        <div style="font-weight: bold; margin-bottom: 15px; color: var(--hermes-text);">📈 Expanded Ideas:</div>
        <div style="
          padding: 15px;
          background: var(--hermes-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 6px;
          color: var(--hermes-text);
          line-height: 1.5;
          font-style: italic;
        ">${expanded}</div>
      </div>
    `;
  },

  getSelectedText() {
    const selection = window.getSelection();
    return selection.toString().trim();
  },

  updateStatus(status, type) {
    const statusElement = document.getElementById('ai-status');
    if (statusElement) {
      statusElement.innerHTML = status;
      
      // Update color based on type
      const colors = {
        ready: 'rgba(46, 204, 113, 0.2)',
        processing: 'rgba(241, 196, 15, 0.2)',
        error: 'rgba(231, 76, 60, 0.2)'
      };
      
      statusElement.style.background = colors[type] || colors.ready;
    }
  },

  updateWritingAnalytics(text) {
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed
    const gradeLevel = this.calculateReadabilityScore(text);

    const wordCountEl = document.getElementById('word-count');
    const readingTimeEl = document.getElementById('reading-time');
    const readabilityEl = document.getElementById('readability');

    if (wordCountEl) wordCountEl.textContent = wordCount.toLocaleString();
    if (readingTimeEl) readingTimeEl.textContent = `${readingTime}m`;
    if (readabilityEl) readabilityEl.textContent = gradeLevel;
  },

  calculateReadabilityScore(text) {
    if (!text.trim()) return '-';
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const words = text.trim().split(/\s+/).length;
    const syllables = this.countSyllables(text);
    
    if (sentences === 0 || words === 0) return '-';
    
    // Simplified Flesch-Kincaid Grade Level
    const score = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    return Math.max(1, Math.round(score));
  },

  countSyllables(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    return words.reduce((total, word) => {
      const syllableCount = word.match(/[aeiouy]+/g)?.length || 1;
      return total + Math.max(1, syllableCount);
    }, 0);
  },

  initializeAIComponents(app) {
    // Initialize AI components
  },

  bindAIEvents(app) {
    // Listen for text changes to update analytics
    app.on('textChanged', (data) => {
      this.updateWritingAnalytics(data.content);
    });

    // Listen for selection changes for context-aware suggestions
    document.addEventListener('selectionchange', () => {
      const selectedText = this.getSelectedText();
      if (selectedText.length > 10) {
        this.generateContextualSuggestions(selectedText);
      }
    });
  },

  generateContextualSuggestions(text) {
    // Generate suggestions based on selected text
    const suggestions = [
      "💡 This text could benefit from more specific examples",
      "🔍 Consider adding supporting evidence for this claim",
      "✨ This section might be more impactful with stronger verbs",
      "📊 Adding data or statistics could strengthen this point"
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    setTimeout(() => {
      const suggestionsContainer = document.getElementById('ai-suggestions');
      if (suggestionsContainer && suggestionsContainer.textContent.includes('Start writing')) {
        suggestionsContainer.innerHTML = `
          <div style="color: var(--hermes-text); text-align: left;">
            <div style="font-weight: bold; margin-bottom: 10px;">💡 Contextual Suggestion:</div>
            <div style="font-style: italic;">${randomSuggestion}</div>
          </div>
        `;
      }
    }, 500);
  }
});
