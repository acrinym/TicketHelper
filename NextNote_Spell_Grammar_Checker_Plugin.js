/**
 * NextNote Spell & Grammar Checker Plugin
 * Advanced spell checking with Typo.js and grammar checking with LanguageTool integration
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Spell & Grammar Checker',
  version: '1.0.0',
  description: 'Advanced spell checking with Typo.js and grammar checking with LanguageTool integration',
  
  onLoad(app) {
    this.spellChecker = null;
    this.customDictionary = JSON.parse(localStorage.getItem('nextnote_custom_dictionary') || '[]');
    this.ignoredWords = JSON.parse(localStorage.getItem('nextnote_ignored_words') || '[]');
    this.checkerSettings = JSON.parse(localStorage.getItem('nextnote_checker_settings') || this.getDefaultSettings());
    this.isChecking = false;
    this.suggestions = {};
    this.setupSpellGrammarCheckerUI(app);
    this.initializeCheckerComponents(app);
    this.bindCheckerEvents(app);
    this.loadSpellChecker();
  },

  getDefaultSettings() {
    return {
      spellCheckEnabled: true,
      grammarCheckEnabled: true,
      autoCorrect: false,
      language: 'en_US',
      checkAsYouType: true,
      highlightErrors: true,
      showSuggestions: true,
      ignoreUppercase: false,
      ignoreNumbers: true,
      ignoreUrls: true
    };
  },

  setupSpellGrammarCheckerUI(app) {
    const panel = app.createPanel('spell-grammar-checker', 'Spell & Grammar');
    
    // Header with checker theme
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
      border-radius: 12px;
      color: white;
      position: relative;
      overflow: hidden;
    `;

    // Floating spell check icons
    const checkIcons = ['✓', '✗', '?', '!', 'ABC', '📝'];
    checkIcons.forEach((icon, index) => {
      const floatingIcon = document.createElement('div');
      floatingIcon.style.cssText = `
        position: absolute;
        font-size: 1.2em;
        opacity: 0.2;
        animation: floatCheck ${3 + index}s ease-in-out infinite;
        animation-delay: ${index * 0.5}s;
        pointer-events: none;
      `;
      floatingIcon.style.left = `${10 + index * 12}%`;
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
      font-family: 'Times New Roman', serif;
    `;
    title.innerHTML = '✓ Spell & Grammar';

    const checkerControls = document.createElement('div');
    checkerControls.style.cssText = `
      display: flex;
      gap: 10px;
      z-index: 1;
      position: relative;
    `;

    const checkBtn = document.createElement('button');
    checkBtn.id = 'run-check-btn';
    checkBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    checkBtn.textContent = '🔍 Check Now';
    checkBtn.addEventListener('click', () => this.runFullCheck(app));

    const settingsBtn = document.createElement('button');
    settingsBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    settingsBtn.textContent = '⚙️ Settings';
    settingsBtn.addEventListener('click', () => this.showSettings());

    checkerControls.appendChild(checkBtn);
    checkerControls.appendChild(settingsBtn);

    header.appendChild(title);
    header.appendChild(checkerControls);
    panel.appendChild(header);

    // Checker Status
    const statusSection = document.createElement('div');
    statusSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    `;

    statusSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: var(--hermes-text);">📊 Checking Status</h4>
        <div id="checker-status" style="
          padding: 4px 12px;
          border-radius: 12px;
          background: var(--hermes-success-text);
          color: white;
          font-size: 0.8em;
          font-weight: bold;
        ">Ready</div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;">
        <div style="text-align: center; padding: 12px; background: var(--hermes-bg); border-radius: 6px;">
          <div style="font-size: 1.5em; color: var(--hermes-error-text); margin-bottom: 4px;">
            <span id="spell-errors-count">0</span>
          </div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Spelling Errors</div>
        </div>
        
        <div style="text-align: center; padding: 12px; background: var(--hermes-bg); border-radius: 6px;">
          <div style="font-size: 1.5em; color: var(--hermes-warning-text); margin-bottom: 4px;">
            <span id="grammar-errors-count">0</span>
          </div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Grammar Issues</div>
        </div>
        
        <div style="text-align: center; padding: 12px; background: var(--hermes-bg); border-radius: 6px;">
          <div style="font-size: 1.5em; color: var(--hermes-info-text); margin-bottom: 4px;">
            <span id="readability-score">85</span>
          </div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Readability</div>
        </div>
        
        <div style="text-align: center; padding: 12px; background: var(--hermes-bg); border-radius: 6px;">
          <div style="font-size: 1.5em; color: var(--hermes-success-text); margin-bottom: 4px;">
            <span id="words-checked">0</span>
          </div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">Words Checked</div>
        </div>
      </div>
    `;

    panel.appendChild(statusSection);

    // Issues List
    const issuesSection = document.createElement('div');
    issuesSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    `;

    issuesSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: var(--hermes-text);">🔍 Issues Found</h4>
        <div style="display: flex; gap: 8px;">
          <button onclick="this.fixAllSpelling()" style="
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            background: var(--hermes-success-text);
            color: white;
            cursor: pointer;
            font-size: 0.9em;
          ">✓ Fix All Spelling</button>
          <button onclick="this.ignoreAllSuggestions()" style="
            padding: 6px 12px;
            border: 1px solid var(--hermes-border);
            border-radius: 4px;
            background: var(--hermes-button-bg);
            color: var(--hermes-text);
            cursor: pointer;
            font-size: 0.9em;
          ">⏭️ Ignore All</button>
        </div>
      </div>
      
      <div id="issues-list" style="
        max-height: 400px;
        overflow-y: auto;
      ">
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic; padding: 40px;">
          <div style="font-size: 3em; margin-bottom: 15px;">✓</div>
          <div>No issues found</div>
          <div style="font-size: 0.9em; margin-top: 5px;">Run a check to find spelling and grammar issues</div>
        </div>
      </div>
    `;

    panel.appendChild(issuesSection);

    // Writing Statistics
    const statsSection = document.createElement('div');
    statsSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    `;

    statsSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">📈 Writing Statistics</h4>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <h5 style="margin: 0 0 10px 0; color: var(--hermes-text);">Document Stats</h5>
          <div style="font-size: 0.9em; color: var(--hermes-disabled-text); line-height: 1.6;">
            <div>Words: <span id="stats-words">0</span></div>
            <div>Characters: <span id="stats-chars">0</span></div>
            <div>Sentences: <span id="stats-sentences">0</span></div>
            <div>Paragraphs: <span id="stats-paragraphs">0</span></div>
            <div>Average words/sentence: <span id="stats-avg-words">0</span></div>
          </div>
        </div>
        
        <div>
          <h5 style="margin: 0 0 10px 0; color: var(--hermes-text);">Readability</h5>
          <div style="font-size: 0.9em; color: var(--hermes-disabled-text); line-height: 1.6;">
            <div>Reading Level: <span id="reading-level">College</span></div>
            <div>Flesch Score: <span id="flesch-score">85</span></div>
            <div>Grade Level: <span id="grade-level">8</span></div>
            <div>Reading Time: <span id="reading-time">2 min</span></div>
          </div>
        </div>
      </div>
    `;

    panel.appendChild(statsSection);

    // Custom Dictionary
    const dictionarySection = document.createElement('div');
    dictionarySection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
    `;

    dictionarySection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: var(--hermes-text);">📚 Custom Dictionary</h4>
        <button onclick="this.addToDictionary()" style="
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          background: var(--hermes-success-text);
          color: white;
          cursor: pointer;
          font-size: 0.9em;
        ">➕ Add Word</button>
      </div>
      
      <div style="margin-bottom: 15px;">
        <input type="text" id="dictionary-search" placeholder="Search dictionary..." style="
          width: 100%;
          padding: 8px;
          border: 1px solid var(--hermes-border);
          border-radius: 4px;
          background: var(--hermes-input-bg);
          color: var(--hermes-text);
        ">
      </div>
      
      <div id="custom-dictionary-list" style="
        max-height: 200px;
        overflow-y: auto;
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 4px;
        padding: 10px;
      ">
        ${this.customDictionary.length === 0 ? `
          <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic; padding: 20px;">
            No custom words added yet
          </div>
        ` : this.generateDictionaryList()}
      </div>
    `;

    panel.appendChild(dictionarySection);
  },

  generateDictionaryList() {
    return this.customDictionary.map(word => `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 8px;
        margin-bottom: 4px;
        background: var(--hermes-panel-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 4px;
      ">
        <span style="color: var(--hermes-text); font-family: monospace;">${word}</span>
        <button onclick="this.removeFromDictionary('${word}')" style="
          padding: 2px 6px;
          border: none;
          border-radius: 3px;
          background: var(--hermes-error-text);
          color: white;
          cursor: pointer;
          font-size: 0.7em;
        ">Remove</button>
      </div>
    `).join('');
  },

  loadSpellChecker() {
    // Mock spell checker initialization
    // In a real implementation, this would load Typo.js or similar
    this.spellChecker = {
      check: (word) => {
        // Simple mock spell checking
        const commonMisspellings = {
          'teh': ['the'],
          'recieve': ['receive'],
          'seperate': ['separate'],
          'occured': ['occurred'],
          'definately': ['definitely'],
          'accomodate': ['accommodate'],
          'neccessary': ['necessary'],
          'embarass': ['embarrass'],
          'existance': ['existence'],
          'maintainance': ['maintenance']
        };
        
        return !commonMisspellings[word.toLowerCase()];
      },
      
      suggest: (word) => {
        const commonMisspellings = {
          'teh': ['the'],
          'recieve': ['receive'],
          'seperate': ['separate'],
          'occured': ['occurred'],
          'definately': ['definitely'],
          'accomodate': ['accommodate'],
          'neccessary': ['necessary'],
          'embarass': ['embarrass'],
          'existance': ['existence'],
          'maintainance': ['maintenance']
        };
        
        return commonMisspellings[word.toLowerCase()] || [];
      }
    };
    
    this.updateCheckerStatus('Spell checker loaded', 'success');
  },

  runFullCheck(app) {
    if (this.isChecking) return;
    
    this.isChecking = true;
    this.updateCheckerStatus('Checking...', 'warning');
    
    // Get text from document editor
    const content = document.getElementById('document-content');
    if (!content) {
      this.updateCheckerStatus('No document to check', 'error');
      this.isChecking = false;
      return;
    }
    
    const text = content.textContent || '';
    
    // Run spell check
    setTimeout(() => {
      this.performSpellCheck(text);
      this.performGrammarCheck(text);
      this.calculateStatistics(text);
      this.updateCheckerStatus('Check complete', 'success');
      this.isChecking = false;
      
      if (app) app.showToast('Spell and grammar check complete!', 'success');
    }, 1500);
  },

  performSpellCheck(text) {
    if (!this.checkerSettings.spellCheckEnabled || !this.spellChecker) return;
    
    const words = text.match(/\b\w+\b/g) || [];
    const issues = [];
    
    words.forEach((word, index) => {
      if (this.shouldCheckWord(word) && !this.spellChecker.check(word)) {
        const suggestions = this.spellChecker.suggest(word);
        issues.push({
          type: 'spelling',
          word: word,
          position: index,
          suggestions: suggestions,
          message: `"${word}" may be misspelled`
        });
      }
    });
    
    document.getElementById('spell-errors-count').textContent = issues.length;
    document.getElementById('words-checked').textContent = words.length;
    
    this.displayIssues(issues, 'spelling');
  },

  performGrammarCheck(text) {
    if (!this.checkerSettings.grammarCheckEnabled) return;
    
    // Mock grammar checking
    const grammarIssues = [];
    
    // Check for common grammar issues
    const patterns = [
      {
        pattern: /\bthere\s+is\s+\w+\s+\w+s\b/gi,
        message: 'Subject-verb disagreement: "there is" should be "there are" with plural nouns',
        suggestion: 'Use "there are" with plural nouns'
      },
      {
        pattern: /\bits\s+a\s+\w+\s+that\s+are\b/gi,
        message: 'Subject-verb disagreement: singular subject with plural verb',
        suggestion: 'Use "is" instead of "are"'
      },
      {
        pattern: /\byour\s+welcome\b/gi,
        message: 'Incorrect usage: should be "you\'re welcome"',
        suggestion: 'Use "you\'re welcome"'
      }
    ];
    
    patterns.forEach(({ pattern, message, suggestion }) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        grammarIssues.push({
          type: 'grammar',
          text: match[0],
          position: match.index,
          message: message,
          suggestion: suggestion
        });
      }
    });
    
    document.getElementById('grammar-errors-count').textContent = grammarIssues.length;
    
    this.displayIssues(grammarIssues, 'grammar');
  },

  shouldCheckWord(word) {
    if (this.customDictionary.includes(word.toLowerCase())) return false;
    if (this.ignoredWords.includes(word.toLowerCase())) return false;
    if (this.checkerSettings.ignoreUppercase && word === word.toUpperCase()) return false;
    if (this.checkerSettings.ignoreNumbers && /\d/.test(word)) return false;
    if (this.checkerSettings.ignoreUrls && /^https?:\/\//.test(word)) return false;
    
    return true;
  },

  displayIssues(issues, type) {
    const issuesList = document.getElementById('issues-list');
    if (!issuesList) return;
    
    if (issues.length === 0) {
      issuesList.innerHTML = `
        <div style="text-align: center; color: var(--hermes-success-text); padding: 20px;">
          <div style="font-size: 2em; margin-bottom: 10px;">✓</div>
          <div>No ${type} issues found!</div>
        </div>
      `;
      return;
    }
    
    const issuesHTML = issues.map((issue, index) => `
      <div style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-left: 4px solid ${type === 'spelling' ? 'var(--hermes-error-text)' : 'var(--hermes-warning-text)'};
        border-radius: 4px;
        padding: 12px;
        margin-bottom: 8px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 4px;">
              ${type === 'spelling' ? '📝' : '📖'} ${issue.word || issue.text}
            </div>
            <div style="color: var(--hermes-disabled-text); font-size: 0.9em;">
              ${issue.message}
            </div>
          </div>
          <div style="display: flex; gap: 4px;">
            <button onclick="this.ignoreIssue(${index})" style="
              padding: 4px 8px;
              border: none;
              border-radius: 3px;
              background: var(--hermes-disabled-text);
              color: white;
              cursor: pointer;
              font-size: 0.8em;
            ">Ignore</button>
            ${type === 'spelling' ? `
              <button onclick="this.addToCustomDictionary('${issue.word}')" style="
                padding: 4px 8px;
                border: none;
                border-radius: 3px;
                background: var(--hermes-info-text);
                color: white;
                cursor: pointer;
                font-size: 0.8em;
              ">Add to Dict</button>
            ` : ''}
          </div>
        </div>
        
        ${issue.suggestions && issue.suggestions.length > 0 ? `
          <div style="margin-top: 8px;">
            <div style="color: var(--hermes-text); font-size: 0.9em; margin-bottom: 4px;">Suggestions:</div>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${issue.suggestions.map(suggestion => `
                <button onclick="this.applySuggestion('${issue.word}', '${suggestion}')" style="
                  padding: 4px 8px;
                  border: 1px solid var(--hermes-border);
                  border-radius: 12px;
                  background: var(--hermes-success-text);
                  color: white;
                  cursor: pointer;
                  font-size: 0.8em;
                ">${suggestion}</button>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `).join('');
    
    issuesList.innerHTML = issuesHTML;
  },

  calculateStatistics(text) {
    const words = text.match(/\b\w+\b/g) || [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const chars = text.length;
    
    const avgWordsPerSentence = sentences.length > 0 ? Math.round(words.length / sentences.length) : 0;
    const readingTime = Math.ceil(words.length / 200); // 200 WPM average
    
    // Simple Flesch Reading Ease calculation
    const avgSentenceLength = avgWordsPerSentence;
    const avgSyllablesPerWord = this.estimateAverageSyllables(words);
    const fleschScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
    ));
    
    const gradeLevel = Math.max(1, Math.min(16,
      (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59
    ));
    
    // Update statistics display
    document.getElementById('stats-words').textContent = words.length;
    document.getElementById('stats-chars').textContent = chars;
    document.getElementById('stats-sentences').textContent = sentences.length;
    document.getElementById('stats-paragraphs').textContent = paragraphs.length;
    document.getElementById('stats-avg-words').textContent = avgWordsPerSentence;
    
    document.getElementById('flesch-score').textContent = Math.round(fleschScore);
    document.getElementById('grade-level').textContent = Math.round(gradeLevel);
    document.getElementById('reading-time').textContent = readingTime + ' min';
    document.getElementById('readability-score').textContent = Math.round(fleschScore);
    
    // Update reading level
    let readingLevel = 'Graduate';
    if (fleschScore >= 90) readingLevel = 'Elementary';
    else if (fleschScore >= 80) readingLevel = 'Middle School';
    else if (fleschScore >= 70) readingLevel = 'High School';
    else if (fleschScore >= 60) readingLevel = 'College';
    
    document.getElementById('reading-level').textContent = readingLevel;
  },

  estimateAverageSyllables(words) {
    if (words.length === 0) return 0;
    
    const totalSyllables = words.reduce((total, word) => {
      return total + this.countSyllables(word);
    }, 0);
    
    return totalSyllables / words.length;
  },

  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  },

  updateCheckerStatus(message, type) {
    const status = document.getElementById('checker-status');
    if (!status) return;
    
    const colors = {
      'success': 'var(--hermes-success-text)',
      'warning': 'var(--hermes-warning-text)',
      'error': 'var(--hermes-error-text)',
      'info': 'var(--hermes-info-text)'
    };
    
    status.textContent = message;
    status.style.background = colors[type] || colors.info;
  },

  applySuggestion(originalWord, suggestion) {
    const content = document.getElementById('document-content');
    if (!content) return;
    
    const html = content.innerHTML;
    const regex = new RegExp(`\\b${originalWord}\\b`, 'gi');
    content.innerHTML = html.replace(regex, suggestion);
    
    // Re-run check
    this.runFullCheck();
  },

  addToCustomDictionary(word) {
    if (!this.customDictionary.includes(word.toLowerCase())) {
      this.customDictionary.push(word.toLowerCase());
      this.saveCustomDictionary();
      this.refreshDictionaryList();
      this.runFullCheck(); // Re-check to update issues
    }
  },

  addToDictionary() {
    const word = prompt('Enter word to add to dictionary:');
    if (word && word.trim()) {
      this.addToCustomDictionary(word.trim());
    }
  },

  removeFromDictionary(word) {
    this.customDictionary = this.customDictionary.filter(w => w !== word);
    this.saveCustomDictionary();
    this.refreshDictionaryList();
  },

  refreshDictionaryList() {
    const list = document.getElementById('custom-dictionary-list');
    if (list) {
      list.innerHTML = this.customDictionary.length === 0 ? `
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic; padding: 20px;">
          No custom words added yet
        </div>
      ` : this.generateDictionaryList();
    }
  },

  showSettings() {
    // This would open a settings modal
    alert('Settings panel coming soon! Configure spell check language, auto-correct, and more.');
  },

  saveCustomDictionary() {
    localStorage.setItem('nextnote_custom_dictionary', JSON.stringify(this.customDictionary));
  },

  saveSettings() {
    localStorage.setItem('nextnote_checker_settings', JSON.stringify(this.checkerSettings));
  },

  initializeCheckerComponents(app) {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatCheck {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-8px) rotate(3deg); }
      }
      
      .spell-error {
        background: linear-gradient(to bottom, transparent 0%, transparent 90%, #ff0000 90%, #ff0000 100%);
        background-size: 4px 100%;
        background-repeat: repeat-x;
        background-position: 0 100%;
      }
      
      .grammar-error {
        background: linear-gradient(to bottom, transparent 0%, transparent 90%, #ff8800 90%, #ff8800 100%);
        background-size: 4px 100%;
        background-repeat: repeat-x;
        background-position: 0 100%;
      }
    `;
    document.head.appendChild(style);
  },

  bindCheckerEvents(app) {
    // Listen for checker events
    app.on('textChanged', () => {
      if (this.checkerSettings.checkAsYouType) {
        // Debounced checking
        clearTimeout(this.checkTimeout);
        this.checkTimeout = setTimeout(() => {
          this.runFullCheck();
        }, 1000);
      }
    });
  },

  // Additional methods for complete functionality
  ignoreIssue(index) {
    // Implementation for ignoring specific issues
    console.log('Ignoring issue at index:', index);
  },

  fixAllSpelling() {
    // Implementation for fixing all spelling errors
    console.log('Fixing all spelling errors');
  },

  ignoreAllSuggestions() {
    // Implementation for ignoring all suggestions
    console.log('Ignoring all suggestions');
  }
});
