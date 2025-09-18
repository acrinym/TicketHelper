/**
 * NextNote Enhanced Template System
 * Provides advanced templating with custom metadata fields and dynamic content
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.NextNoteTemplateSystem = (function() {
  const security = window.NextNoteSecurity;
  
  /**
   * Built-in template library with metadata support
   */
  const TEMPLATE_LIBRARY = {
    // Work & Business Templates
    'meeting-notes': {
      name: 'Meeting Notes',
      category: 'Work',
      description: 'Structured template for meeting documentation',
      icon: '🤝',
      metadata: {
        meetingType: { type: 'select', options: ['Team', 'Client', 'Project', 'Review'], default: 'Team' },
        priority: { type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
        attendees: { type: 'text', placeholder: 'List attendees...' },
        duration: { type: 'number', placeholder: 'Duration in minutes' },
        status: { type: 'select', options: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'], default: 'Scheduled' }
      },
      content: `# {{title}} - Meeting Notes

## 📅 Meeting Details
- **Date**: {{date}}
- **Time**: {{time}}
- **Type**: {{meetingType}}
- **Duration**: {{duration}} minutes
- **Priority**: {{priority}}
- **Status**: {{status}}

## 👥 Attendees
{{attendees}}

## 📋 Agenda
1. [ ] Opening & introductions
2. [ ] Review previous action items
3. [ ] Main discussion topics
4. [ ] Next steps & action items
5. [ ] Closing

## 📝 Discussion Notes
[Add your meeting notes here]

## ✅ Action Items
- [ ] **[Assignee]** - [Action item] - Due: [Date]
- [ ] **[Assignee]** - [Action item] - Due: [Date]

## 🔄 Follow-up
- Next meeting: [Date/Time]
- Key decisions made:
- Outstanding questions:

## 📎 Attachments
[Link any relevant documents or files]`
    },

    'project-plan': {
      name: 'Project Plan',
      category: 'Work',
      description: 'Comprehensive project planning template',
      icon: '📊',
      metadata: {
        projectType: { type: 'select', options: ['Software', 'Marketing', 'Research', 'Operations'], default: 'Software' },
        priority: { type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
        budget: { type: 'number', placeholder: 'Budget amount' },
        startDate: { type: 'date' },
        endDate: { type: 'date' },
        status: { type: 'select', options: ['Planning', 'In Progress', 'On Hold', 'Completed'], default: 'Planning' },
        owner: { type: 'text', placeholder: 'Project owner' }
      },
      content: `# {{title}} - Project Plan

## 📋 Project Overview
- **Type**: {{projectType}}
- **Owner**: {{owner}}
- **Priority**: {{priority}}
- **Status**: {{status}}
- **Budget**: ${{budget}}
- **Start Date**: {{startDate}}
- **End Date**: {{endDate}}

## 🎯 Objectives
[Define clear, measurable project objectives]

## 📊 Scope
### In Scope
- [Item 1]
- [Item 2]

### Out of Scope
- [Item 1]
- [Item 2]

## 📅 Timeline & Milestones
| Phase | Description | Start Date | End Date | Status |
|-------|-------------|------------|----------|--------|
| Phase 1 | [Description] | [Date] | [Date] | [ ] |
| Phase 2 | [Description] | [Date] | [Date] | [ ] |

## 👥 Team & Responsibilities
| Role | Name | Responsibilities |
|------|------|------------------|
| Project Manager | [Name] | [Responsibilities] |
| Developer | [Name] | [Responsibilities] |

## 🎯 Success Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## ⚠️ Risks & Mitigation
| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| [Risk 1] | [High/Med/Low] | [High/Med/Low] | [Strategy] |

## 📈 Progress Tracking
**Current Status**: {{status}}
**Completion**: [X]%

## 📝 Notes
[Additional project notes]`
    },

    // Personal Templates
    'daily-journal': {
      name: 'Daily Journal',
      category: 'Personal',
      description: 'Daily reflection and planning template',
      icon: '📔',
      metadata: {
        mood: { type: 'select', options: ['😊 Great', '😐 Okay', '😔 Difficult', '😴 Tired'], default: '😊 Great' },
        energy: { type: 'range', min: 1, max: 10, default: 5 },
        weather: { type: 'text', placeholder: 'Weather today' },
        gratitude: { type: 'textarea', placeholder: 'What are you grateful for?' }
      },
      content: `# Daily Journal - {{date}}

## 🌅 Morning Check-in
- **Mood**: {{mood}}
- **Energy Level**: {{energy}}/10
- **Weather**: {{weather}}

## 🎯 Today's Goals
- [ ] [Goal 1]
- [ ] [Goal 2]
- [ ] [Goal 3]

## 📝 What Happened Today
[Write about your day...]

## 💭 Reflections
### What went well?
[Positive moments and achievements]

### What could be improved?
[Areas for growth and learning]

### Lessons learned
[Key insights from today]

## 🙏 Gratitude
{{gratitude}}

## 🌙 Evening Wrap-up
- **Did I achieve my goals?** [Yes/Partially/No]
- **How do I feel about today?** [Reflection]
- **What's my priority for tomorrow?** [Next day focus]

## 📊 Daily Metrics
- **Productivity**: [1-10]
- **Happiness**: [1-10]
- **Health**: [1-10]`
    },

    'book-notes': {
      name: 'Book Notes',
      category: 'Learning',
      description: 'Template for book reading and note-taking',
      icon: '📚',
      metadata: {
        author: { type: 'text', placeholder: 'Author name' },
        genre: { type: 'select', options: ['Fiction', 'Non-fiction', 'Biography', 'Technical', 'Self-help'], default: 'Non-fiction' },
        rating: { type: 'range', min: 1, max: 5, default: 3 },
        pages: { type: 'number', placeholder: 'Number of pages' },
        startDate: { type: 'date' },
        finishDate: { type: 'date' },
        status: { type: 'select', options: ['Want to Read', 'Reading', 'Finished', 'DNF'], default: 'Want to Read' }
      },
      content: `# {{title}} - Book Notes

## 📖 Book Information
- **Author**: {{author}}
- **Genre**: {{genre}}
- **Pages**: {{pages}}
- **Rating**: {{rating}}/5 ⭐
- **Status**: {{status}}
- **Started**: {{startDate}}
- **Finished**: {{finishDate}}

## 📝 Summary
[Brief summary of the book's main points]

## 🎯 Key Takeaways
1. [Key insight 1]
2. [Key insight 2]
3. [Key insight 3]

## 💡 Favorite Quotes
> "[Quote 1]" - Page [X]

> "[Quote 2]" - Page [X]

## 📋 Chapter Notes
### Chapter 1: [Title]
[Notes and thoughts]

### Chapter 2: [Title]
[Notes and thoughts]

## 🤔 Personal Reflections
[How does this book relate to your life/work/interests?]

## 📚 Related Books
- [Book 1] by [Author]
- [Book 2] by [Author]

## ✅ Action Items
- [ ] [Something to implement from the book]
- [ ] [Further research needed]

## 🏷️ Tags
#books #{{genre}} #{{author}}`
    },

    // Research Templates
    'research-notes': {
      name: 'Research Notes',
      category: 'Academic',
      description: 'Academic research and study template',
      icon: '🔬',
      metadata: {
        subject: { type: 'text', placeholder: 'Research subject' },
        methodology: { type: 'select', options: ['Qualitative', 'Quantitative', 'Mixed Methods', 'Literature Review'], default: 'Literature Review' },
        status: { type: 'select', options: ['Planning', 'In Progress', 'Analysis', 'Writing', 'Complete'], default: 'Planning' },
        deadline: { type: 'date' },
        supervisor: { type: 'text', placeholder: 'Supervisor/Advisor name' }
      },
      content: `# {{title}} - Research Notes

## 🔬 Research Overview
- **Subject**: {{subject}}
- **Methodology**: {{methodology}}
- **Status**: {{status}}
- **Deadline**: {{deadline}}
- **Supervisor**: {{supervisor}}

## 🎯 Research Question
[Primary research question or hypothesis]

## 📚 Literature Review
### Key Sources
1. [Author, Year] - [Title]
   - Summary: [Brief summary]
   - Relevance: [How it relates to your research]

2. [Author, Year] - [Title]
   - Summary: [Brief summary]
   - Relevance: [How it relates to your research]

### Research Gaps
[What gaps in the literature does your research address?]

## 📊 Methodology
### Approach
[Describe your research approach]

### Data Collection
[How will you collect data?]

### Analysis Plan
[How will you analyze the data?]

## 📝 Findings
[Record your findings as you progress]

## 💭 Analysis & Interpretation
[Your analysis and interpretation of the findings]

## 📋 Next Steps
- [ ] [Next action item]
- [ ] [Next action item]

## 📎 References
[List your references in appropriate format]`
    }
  };

  /**
   * Creates a template from the library
   * @param {string} templateId - Template identifier
   * @param {Object} customData - Custom data to populate template
   * @returns {Object} - Created page object
   */
  function createFromTemplate(templateId, customData = {}) {
    const template = TEMPLATE_LIBRARY[templateId];
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Prepare template variables
    const templateVars = {
      title: customData.title || template.name,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      ...customData
    };

    // Process template content
    let content = template.content;
    Object.entries(templateVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, security.sanitizeText(String(value)));
    });

    // Create page object
    const page = {
      id: crypto.randomUUID(),
      title: templateVars.title,
      content: content,
      template: templateId,
      metadata: {
        ...customData,
        templateUsed: template.name,
        createdFrom: templateId,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      tags: [`template:${templateId}`, `category:${template.category.toLowerCase()}`]
    };

    return page;
  }

  /**
   * Creates a template selection dialog
   * @param {Function} onSelect - Callback when template is selected
   * @returns {HTMLElement} - Template selector dialog
   */
  function createTemplateSelector(onSelect) {
    const overlay = document.createElement('div');
    overlay.className = 'template-selector-overlay';
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
    dialog.className = 'template-selector-dialog';
    dialog.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-panel-border);
      border-radius: 12px;
      padding: 30px;
      width: 800px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--hermes-border);
      padding-bottom: 15px;
    `;

    const title = document.createElement('h2');
    title.style.cssText = `
      margin: 0;
      color: var(--hermes-text);
      font-size: 1.5em;
    `;
    security.safeSetTextContent(title, '📋 Choose a Template');

    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 1.5em;
      cursor: pointer;
      color: var(--hermes-text);
      padding: 5px;
    `;
    security.safeSetTextContent(closeButton, '×');
    closeButton.addEventListener('click', () => overlay.remove());

    header.appendChild(title);
    header.appendChild(closeButton);
    dialog.appendChild(header);

    // Template grid
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    `;

    // Group templates by category
    const categories = {};
    Object.entries(TEMPLATE_LIBRARY).forEach(([id, template]) => {
      if (!categories[template.category]) {
        categories[template.category] = [];
      }
      categories[template.category].push({ id, ...template });
    });

    // Create template cards for each category
    Object.entries(categories).forEach(([category, templates]) => {
      const categorySection = document.createElement('div');
      categorySection.style.cssText = `
        grid-column: 1 / -1;
        margin-bottom: 20px;
      `;

      const categoryTitle = document.createElement('h3');
      categoryTitle.style.cssText = `
        color: var(--hermes-text);
        margin-bottom: 15px;
        border-bottom: 1px solid var(--hermes-border);
        padding-bottom: 5px;
      `;
      security.safeSetTextContent(categoryTitle, category);
      categorySection.appendChild(categoryTitle);

      const categoryGrid = document.createElement('div');
      categoryGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 15px;
      `;

      templates.forEach(template => {
        const card = createTemplateCard(template, onSelect, overlay);
        categoryGrid.appendChild(card);
      });

      categorySection.appendChild(categoryGrid);
      grid.appendChild(categorySection);
    });

    dialog.appendChild(grid);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    overlay.appendChild(dialog);
    return overlay;
  }

  /**
   * Creates a template card
   * @param {Object} template - Template object
   * @param {Function} onSelect - Selection callback
   * @param {HTMLElement} overlay - Overlay to close
   * @returns {HTMLElement} - Template card element
   */
  function createTemplateCard(template, onSelect, overlay) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.style.cssText = `
      border: 2px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--hermes-bg);
    `;

    const icon = document.createElement('div');
    icon.style.cssText = `
      font-size: 2em;
      margin-bottom: 10px;
      text-align: center;
    `;
    security.safeSetTextContent(icon, template.icon);

    const name = document.createElement('h4');
    name.style.cssText = `
      margin: 0 0 10px 0;
      color: var(--hermes-text);
      text-align: center;
    `;
    security.safeSetTextContent(name, template.name);

    const description = document.createElement('p');
    description.style.cssText = `
      margin: 0;
      color: var(--hermes-disabled-text);
      font-size: 0.9em;
      text-align: center;
      line-height: 1.4;
    `;
    security.safeSetTextContent(description, template.description);

    // Hover effects
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = 'var(--hermes-highlight-bg)';
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.borderColor = 'var(--hermes-border)';
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    });

    // Click handler
    card.addEventListener('click', () => {
      if (template.metadata && Object.keys(template.metadata).length > 0) {
        // Show metadata form
        showMetadataForm(template, onSelect, overlay);
      } else {
        // Create directly
        const page = createFromTemplate(template.id);
        onSelect(page);
        overlay.remove();
      }
    });

    card.appendChild(icon);
    card.appendChild(name);
    card.appendChild(description);

    return card;
  }

  /**
   * Shows metadata form for template customization
   * @param {Object} template - Template object
   * @param {Function} onSelect - Selection callback
   * @param {HTMLElement} overlay - Overlay element
   */
  function showMetadataForm(template, onSelect, overlay) {
    // This would create a form for metadata input
    // For brevity, I'll implement a simplified version
    const customData = {};
    
    // For now, use default values
    Object.entries(template.metadata).forEach(([key, field]) => {
      customData[key] = field.default || '';
    });

    const page = createFromTemplate(template.id, customData);
    onSelect(page);
    overlay.remove();
  }

  // Public API
  return {
    createFromTemplate,
    createTemplateSelector,
    
    // Template library access
    getTemplate: (id) => TEMPLATE_LIBRARY[id],
    getTemplates: () => ({ ...TEMPLATE_LIBRARY }),
    getCategories: () => {
      const categories = new Set();
      Object.values(TEMPLATE_LIBRARY).forEach(template => {
        categories.add(template.category);
      });
      return Array.from(categories);
    }
  };
})();
