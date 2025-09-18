/**
 * NextNote Office Suite Plugin
 * Open-source alternative to Microsoft Office products integrated into NextNote
 * Provides word processing, spreadsheet, and presentation capabilities
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Office Suite',
  version: '1.0.0',
  description: 'Complete office suite with word processing, spreadsheets, and presentations',
  
  onLoad(app) {
    this.setupOfficeUI(app);
    this.initializeOfficeComponents(app);
    this.bindOfficeEvents(app);
  },

  setupOfficeUI(app) {
    // Create Office Suite panel
    const panel = app.createPanel('office-suite', 'Office Suite');
    
    // Office Suite toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'office-toolbar';
    toolbar.style.cssText = `
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      padding: 10px;
      background: var(--hermes-panel-bg);
      border-radius: 8px;
      border: 1px solid var(--hermes-border);
    `;

    // Document type buttons
    const documentTypes = [
      { type: 'document', icon: '📄', label: 'Document', description: 'Rich text document' },
      { type: 'spreadsheet', icon: '📊', label: 'Spreadsheet', description: 'Data analysis and calculations' },
      { type: 'presentation', icon: '📽️', label: 'Presentation', description: 'Slide presentations' },
      { type: 'form', icon: '📋', label: 'Form', description: 'Interactive forms' }
    ];

    documentTypes.forEach(docType => {
      const button = document.createElement('button');
      button.className = 'office-type-button';
      button.style.cssText = `
        flex: 1;
        padding: 12px;
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        background: var(--hermes-button-bg);
        color: var(--hermes-text);
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
        font-size: 0.9em;
      `;

      button.innerHTML = `
        <div style="font-size: 1.5em; margin-bottom: 5px;">${docType.icon}</div>
        <div style="font-weight: bold;">${docType.label}</div>
        <div style="font-size: 0.8em; opacity: 0.7;">${docType.description}</div>
      `;

      button.addEventListener('click', () => {
        this.createOfficeDocument(docType.type, app);
      });

      button.addEventListener('mouseenter', () => {
        button.style.borderColor = 'var(--hermes-highlight-bg)';
        button.style.transform = 'translateY(-2px)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.borderColor = 'var(--hermes-border)';
        button.style.transform = 'translateY(0)';
      });

      toolbar.appendChild(button);
    });

    panel.appendChild(toolbar);

    // Recent documents section
    const recentSection = document.createElement('div');
    recentSection.innerHTML = `
      <h4 style="margin: 20px 0 10px 0; color: var(--hermes-text);">📁 Recent Documents</h4>
      <div id="recent-office-docs" style="max-height: 200px; overflow-y: auto;"></div>
    `;
    panel.appendChild(recentSection);

    this.updateRecentDocuments();
  },

  initializeOfficeComponents(app) {
    // Initialize document templates
    this.documentTemplates = {
      document: {
        'blank': { name: 'Blank Document', content: '' },
        'letter': { 
          name: 'Business Letter', 
          content: `[Your Name]
[Your Address]
[City, State ZIP Code]
[Email Address]
[Phone Number]

[Date]

[Recipient Name]
[Title]
[Company]
[Address]
[City, State ZIP Code]

Dear [Recipient Name],

[Letter content goes here...]

Sincerely,

[Your Name]` 
        },
        'resume': { 
          name: 'Resume Template', 
          content: `# [Your Name]
**[Your Title/Position]**

📧 [email@example.com] | 📱 [phone] | 🌐 [website] | 📍 [location]

## Professional Summary
[Brief summary of your experience and skills]

## Experience
### [Job Title] - [Company Name]
*[Start Date] - [End Date]*
- [Achievement or responsibility]
- [Achievement or responsibility]

## Education
### [Degree] - [Institution]
*[Graduation Year]*

## Skills
- [Skill 1]
- [Skill 2]
- [Skill 3]` 
        },
        'report': { 
          name: 'Report Template', 
          content: `# [Report Title]

**Prepared by:** [Your Name]  
**Date:** ${new Date().toLocaleDateString()}  
**Department:** [Department]

## Executive Summary
[Brief overview of the report]

## Introduction
[Background and purpose]

## Methodology
[How the analysis was conducted]

## Findings
[Key findings and results]

## Recommendations
[Actionable recommendations]

## Conclusion
[Summary and next steps]

## Appendices
[Supporting documents and data]` 
        }
      },

      spreadsheet: {
        'blank': { name: 'Blank Spreadsheet', data: this.createBlankSpreadsheet() },
        'budget': { name: 'Budget Tracker', data: this.createBudgetTemplate() },
        'inventory': { name: 'Inventory Management', data: this.createInventoryTemplate() },
        'timesheet': { name: 'Timesheet', data: this.createTimesheetTemplate() }
      },

      presentation: {
        'blank': { name: 'Blank Presentation', slides: [{ title: 'Title Slide', content: 'Click to edit' }] },
        'business': { name: 'Business Presentation', slides: this.createBusinessPresentationTemplate() },
        'project': { name: 'Project Update', slides: this.createProjectPresentationTemplate() }
      },

      form: {
        'blank': { name: 'Blank Form', fields: [] },
        'contact': { name: 'Contact Form', fields: this.createContactFormTemplate() },
        'survey': { name: 'Survey Form', fields: this.createSurveyFormTemplate() },
        'feedback': { name: 'Feedback Form', fields: this.createFeedbackFormTemplate() }
      }
    };
  },

  createOfficeDocument(type, app) {
    // Show template selection dialog
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
      width: 600px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
    `;

    const title = document.createElement('h2');
    title.style.cssText = 'margin: 0 0 20px 0; color: var(--hermes-text);';
    title.textContent = `Choose ${type.charAt(0).toUpperCase() + type.slice(1)} Template`;

    const templateGrid = document.createElement('div');
    templateGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    `;

    // Add templates for the selected type
    Object.entries(this.documentTemplates[type]).forEach(([templateId, template]) => {
      const templateCard = document.createElement('div');
      templateCard.style.cssText = `
        border: 2px solid var(--hermes-border);
        border-radius: 8px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
      `;

      templateCard.innerHTML = `
        <div style="font-size: 2em; margin-bottom: 10px;">${this.getTypeIcon(type)}</div>
        <div style="font-weight: bold; margin-bottom: 5px;">${template.name}</div>
      `;

      templateCard.addEventListener('click', () => {
        this.createDocumentFromTemplate(type, templateId, template, app);
        overlay.remove();
      });

      templateCard.addEventListener('mouseenter', () => {
        templateCard.style.borderColor = 'var(--hermes-highlight-bg)';
        templateCard.style.transform = 'translateY(-2px)';
      });

      templateCard.addEventListener('mouseleave', () => {
        templateCard.style.borderColor = 'var(--hermes-border)';
        templateCard.style.transform = 'translateY(0)';
      });

      templateGrid.appendChild(templateCard);
    });

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cancel';
    closeButton.style.cssText = `
      padding: 10px 20px;
      border: 1px solid var(--hermes-border);
      border-radius: 6px;
      background: var(--hermes-button-bg);
      color: var(--hermes-text);
      cursor: pointer;
    `;
    closeButton.addEventListener('click', () => overlay.remove());

    dialog.appendChild(title);
    dialog.appendChild(templateGrid);
    dialog.appendChild(closeButton);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  },

  createDocumentFromTemplate(type, templateId, template, app) {
    const documentId = crypto.randomUUID();
    const documentTitle = `${template.name} - ${new Date().toLocaleDateString()}`;

    // Create new page with office document
    const page = {
      id: documentId,
      title: documentTitle,
      content: this.generateDocumentContent(type, template),
      metadata: {
        type: 'office-document',
        officeType: type,
        templateId: templateId,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      tags: [`office:${type}`, `template:${templateId}`]
    };

    // Add to current section (this would integrate with NextNote's page system)
    app.emit('pageCreated', page);

    // Save to recent documents
    this.saveToRecentDocuments({
      id: documentId,
      title: documentTitle,
      type: type,
      templateId: templateId,
      lastModified: new Date().toISOString()
    });

    this.updateRecentDocuments();
    app.showToast(`${template.name} created successfully!`, 'success');
  },

  generateDocumentContent(type, template) {
    switch (type) {
      case 'document':
        return template.content;
      case 'spreadsheet':
        return this.generateSpreadsheetHTML(template.data);
      case 'presentation':
        return this.generatePresentationHTML(template.slides);
      case 'form':
        return this.generateFormHTML(template.fields);
      default:
        return '';
    }
  },

  generateSpreadsheetHTML(data) {
    let html = '<div class="office-spreadsheet">\n';
    html += '<table style="border-collapse: collapse; width: 100%;">\n';
    
    data.forEach((row, rowIndex) => {
      html += '<tr>\n';
      row.forEach((cell, colIndex) => {
        const cellType = rowIndex === 0 ? 'th' : 'td';
        html += `<${cellType} style="border: 1px solid var(--hermes-border); padding: 8px; text-align: left;">${cell}</${cellType}>\n`;
      });
      html += '</tr>\n';
    });
    
    html += '</table>\n</div>';
    return html;
  },

  generatePresentationHTML(slides) {
    let html = '<div class="office-presentation">\n';
    
    slides.forEach((slide, index) => {
      html += `<div class="slide" style="border: 2px solid var(--hermes-border); margin: 20px 0; padding: 30px; border-radius: 8px; background: var(--hermes-bg);">\n`;
      html += `<h2 style="color: var(--hermes-text); margin-bottom: 20px;">Slide ${index + 1}: ${slide.title}</h2>\n`;
      html += `<div style="color: var(--hermes-text);">${slide.content}</div>\n`;
      html += '</div>\n';
    });
    
    html += '</div>';
    return html;
  },

  generateFormHTML(fields) {
    let html = '<div class="office-form">\n';
    html += '<form style="max-width: 600px;">\n';
    
    fields.forEach(field => {
      html += `<div style="margin-bottom: 20px;">\n`;
      html += `<label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">${field.label}</label>\n`;
      
      switch (field.type) {
        case 'text':
        case 'email':
        case 'tel':
          html += `<input type="${field.type}" placeholder="${field.placeholder || ''}" style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">\n`;
          break;
        case 'textarea':
          html += `<textarea rows="4" placeholder="${field.placeholder || ''}" style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text); resize: vertical;"></textarea>\n`;
          break;
        case 'select':
          html += `<select style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">\n`;
          field.options.forEach(option => {
            html += `<option value="${option}">${option}</option>\n`;
          });
          html += '</select>\n';
          break;
        case 'radio':
          field.options.forEach(option => {
            html += `<label style="display: block; margin: 5px 0;"><input type="radio" name="${field.name}" value="${option}" style="margin-right: 8px;"> ${option}</label>\n`;
          });
          break;
        case 'checkbox':
          field.options.forEach(option => {
            html += `<label style="display: block; margin: 5px 0;"><input type="checkbox" name="${field.name}" value="${option}" style="margin-right: 8px;"> ${option}</label>\n`;
          });
          break;
      }
      
      html += '</div>\n';
    });
    
    html += '<button type="submit" style="padding: 12px 24px; background: var(--hermes-highlight-bg); color: var(--hermes-highlight-text); border: none; border-radius: 6px; cursor: pointer;">Submit</button>\n';
    html += '</form>\n</div>';
    return html;
  },

  // Template creation methods
  createBlankSpreadsheet() {
    return [
      ['A', 'B', 'C', 'D', 'E'],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', '']
    ];
  },

  createBudgetTemplate() {
    return [
      ['Category', 'Budgeted', 'Actual', 'Difference', 'Notes'],
      ['Income', '$0.00', '$0.00', '$0.00', ''],
      ['Housing', '$0.00', '$0.00', '$0.00', ''],
      ['Transportation', '$0.00', '$0.00', '$0.00', ''],
      ['Food', '$0.00', '$0.00', '$0.00', ''],
      ['Utilities', '$0.00', '$0.00', '$0.00', ''],
      ['Entertainment', '$0.00', '$0.00', '$0.00', ''],
      ['Savings', '$0.00', '$0.00', '$0.00', ''],
      ['Total', '=SUM(B2:B8)', '=SUM(C2:C8)', '=SUM(D2:D8)', '']
    ];
  },

  createInventoryTemplate() {
    return [
      ['Item ID', 'Item Name', 'Category', 'Quantity', 'Unit Price', 'Total Value', 'Reorder Level'],
      ['001', 'Sample Item', 'Category A', '10', '$5.00', '=$D2*$E2', '5'],
      ['002', '', '', '', '', '', ''],
      ['003', '', '', '', '', '', '']
    ];
  },

  createTimesheetTemplate() {
    return [
      ['Date', 'Start Time', 'End Time', 'Break (hrs)', 'Total Hours', 'Project', 'Notes'],
      [new Date().toLocaleDateString(), '9:00 AM', '5:00 PM', '1', '7', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '']
    ];
  },

  createBusinessPresentationTemplate() {
    return [
      { title: 'Company Overview', content: 'Brief introduction to our company and mission' },
      { title: 'Market Analysis', content: 'Current market trends and opportunities' },
      { title: 'Our Solution', content: 'How we address market needs' },
      { title: 'Financial Projections', content: 'Revenue and growth forecasts' },
      { title: 'Next Steps', content: 'Action items and timeline' }
    ];
  },

  createProjectPresentationTemplate() {
    return [
      { title: 'Project Overview', content: 'Project goals and objectives' },
      { title: 'Current Status', content: 'Progress update and milestones achieved' },
      { title: 'Challenges', content: 'Issues encountered and solutions' },
      { title: 'Timeline', content: 'Upcoming milestones and deadlines' },
      { title: 'Resource Needs', content: 'Required resources and support' }
    ];
  },

  createContactFormTemplate() {
    return [
      { type: 'text', name: 'name', label: 'Full Name', placeholder: 'Enter your full name' },
      { type: 'email', name: 'email', label: 'Email Address', placeholder: 'Enter your email' },
      { type: 'tel', name: 'phone', label: 'Phone Number', placeholder: 'Enter your phone number' },
      { type: 'select', name: 'subject', label: 'Subject', options: ['General Inquiry', 'Support', 'Sales', 'Feedback'] },
      { type: 'textarea', name: 'message', label: 'Message', placeholder: 'Enter your message' }
    ];
  },

  createSurveyFormTemplate() {
    return [
      { type: 'text', name: 'name', label: 'Name (Optional)', placeholder: 'Your name' },
      { type: 'radio', name: 'satisfaction', label: 'How satisfied are you with our service?', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
      { type: 'checkbox', name: 'features', label: 'Which features do you use most?', options: ['Feature A', 'Feature B', 'Feature C', 'Feature D'] },
      { type: 'select', name: 'frequency', label: 'How often do you use our service?', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'] },
      { type: 'textarea', name: 'suggestions', label: 'Suggestions for improvement', placeholder: 'Your suggestions...' }
    ];
  },

  createFeedbackFormTemplate() {
    return [
      { type: 'text', name: 'name', label: 'Name', placeholder: 'Your name' },
      { type: 'email', name: 'email', label: 'Email', placeholder: 'Your email' },
      { type: 'select', name: 'rating', label: 'Overall Rating', options: ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Very Poor'] },
      { type: 'textarea', name: 'feedback', label: 'Your Feedback', placeholder: 'Please share your feedback...' },
      { type: 'checkbox', name: 'followup', label: 'Contact Options', options: ['Follow up via email', 'Include in testimonials'] }
    ];
  },

  getTypeIcon(type) {
    const icons = {
      document: '📄',
      spreadsheet: '📊',
      presentation: '📽️',
      form: '📋'
    };
    return icons[type] || '📄';
  },

  saveToRecentDocuments(doc) {
    let recent = JSON.parse(localStorage.getItem('nextnote_recent_office_docs') || '[]');
    recent = recent.filter(item => item.id !== doc.id); // Remove if exists
    recent.unshift(doc); // Add to beginning
    recent = recent.slice(0, 10); // Keep only 10 most recent
    localStorage.setItem('nextnote_recent_office_docs', JSON.stringify(recent));
  },

  updateRecentDocuments() {
    const container = document.getElementById('recent-office-docs');
    if (!container) return;

    const recent = JSON.parse(localStorage.getItem('nextnote_recent_office_docs') || '[]');
    
    if (recent.length === 0) {
      container.innerHTML = '<p style="color: var(--hermes-disabled-text); font-style: italic;">No recent documents</p>';
      return;
    }

    container.innerHTML = recent.map(doc => `
      <div class="recent-doc-item" style="
        display: flex;
        align-items: center;
        padding: 8px;
        margin: 5px 0;
        border: 1px solid var(--hermes-border);
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
      " onmouseenter="this.style.backgroundColor='var(--hermes-button-hover)'" onmouseleave="this.style.backgroundColor='transparent'">
        <span style="margin-right: 10px; font-size: 1.2em;">${this.getTypeIcon(doc.type)}</span>
        <div style="flex: 1;">
          <div style="font-weight: bold; color: var(--hermes-text);">${doc.title}</div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">
            ${doc.type} • ${new Date(doc.lastModified).toLocaleDateString()}
          </div>
        </div>
      </div>
    `).join('');
  },

  bindOfficeEvents(app) {
    // Listen for document save events
    app.on('documentSaved', (data) => {
      if (data.metadata && data.metadata.type === 'office-document') {
        this.saveToRecentDocuments({
          id: data.id,
          title: data.title,
          type: data.metadata.officeType,
          templateId: data.metadata.templateId,
          lastModified: new Date().toISOString()
        });
        this.updateRecentDocuments();
      }
    });
  }
});
