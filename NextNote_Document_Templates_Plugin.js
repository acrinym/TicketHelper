/**
 * NextNote Document Templates Plugin
 * Professional document templates, styles, and formatting presets
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Document Templates',
  version: '1.0.0',
  description: 'Professional document templates, styles, and formatting presets',
  
  onLoad(app) {
    this.templates = this.getBuiltInTemplates();
    this.customTemplates = JSON.parse(localStorage.getItem('nextnote_custom_templates') || '[]');
    this.styles = this.getBuiltInStyles();
    this.customStyles = JSON.parse(localStorage.getItem('nextnote_custom_styles') || '[]');
    this.setupDocumentTemplatesUI(app);
    this.initializeTemplateComponents(app);
    this.bindTemplateEvents(app);
  },

  getBuiltInTemplates() {
    return [
      {
        id: 'business-letter',
        name: 'Business Letter',
        category: 'Business',
        description: 'Professional business correspondence',
        icon: '📄',
        content: `
          <div style="text-align: right; margin-bottom: 40px;">
            <div>[Your Name]</div>
            <div>[Your Address]</div>
            <div>[City, State ZIP]</div>
            <div>[Email Address]</div>
            <div>[Phone Number]</div>
            <div>[Date]</div>
          </div>
          
          <div style="margin-bottom: 40px;">
            <div>[Recipient Name]</div>
            <div>[Title]</div>
            <div>[Company Name]</div>
            <div>[Address]</div>
            <div>[City, State ZIP]</div>
          </div>
          
          <p>Dear [Recipient Name],</p>
          
          <p>I am writing to [purpose of letter]. [Main content paragraph explaining the situation, request, or information you want to convey.]</p>
          
          <p>[Additional supporting information or details. This paragraph should provide more context or supporting evidence for your main point.]</p>
          
          <p>[Closing paragraph with call to action or next steps. Thank the recipient for their time and consideration.]</p>
          
          <p>Sincerely,</p>
          
          <div style="margin-top: 40px;">
            <div>[Your Signature]</div>
            <div>[Your Printed Name]</div>
            <div>[Your Title]</div>
          </div>
        `
      },
      {
        id: 'resume',
        name: 'Professional Resume',
        category: 'Career',
        description: 'Modern professional resume template',
        icon: '👤',
        content: `
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28pt; color: #333;">[Your Full Name]</h1>
            <div style="margin-top: 10px; color: #666;">
              [Your Address] • [Phone] • [Email] • [LinkedIn/Website]
            </div>
          </div>
          
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Professional Summary</h2>
          <p>[2-3 sentences highlighting your key qualifications, experience, and career objectives.]</p>
          
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Experience</h2>
          
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <h3 style="margin: 0; color: #333;">[Job Title]</h3>
              <div style="color: #666;">[Start Date] - [End Date]</div>
            </div>
            <div style="font-style: italic; color: #666; margin-bottom: 8px;">[Company Name], [Location]</div>
            <ul>
              <li>[Key achievement or responsibility]</li>
              <li>[Quantified accomplishment with metrics]</li>
              <li>[Another significant contribution]</li>
            </ul>
          </div>
          
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Education</h2>
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <div>
              <strong>[Degree Type] in [Field of Study]</strong><br>
              [University Name], [Location]
            </div>
            <div style="color: #666;">[Graduation Year]</div>
          </div>
          
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Skills</h2>
          <p>[List relevant technical and soft skills, separated by commas or organized by category]</p>
        `
      },
      {
        id: 'research-paper',
        name: 'Research Paper',
        category: 'Academic',
        description: 'Academic research paper with proper formatting',
        icon: '🎓',
        content: `
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="margin: 0 0 20px 0;">[Paper Title]</h1>
            <div style="margin-bottom: 10px;">
              <strong>[Your Name]</strong><br>
              [Your Institution]<br>
              [Your Email]
            </div>
            <div style="margin-top: 20px; font-style: italic;">
              [Course Name] - [Professor Name]<br>
              [Date]
            </div>
          </div>
          
          <h2>Abstract</h2>
          <p style="font-style: italic;">[150-250 word summary of your research, methodology, findings, and conclusions.]</p>
          
          <p><strong>Keywords:</strong> [5-7 relevant keywords separated by commas]</p>
          
          <h2>1. Introduction</h2>
          <p>[Introduce your topic, provide background information, and state your thesis or research question. Explain the significance of your research.]</p>
          
          <h2>2. Literature Review</h2>
          <p>[Review existing research on your topic. Cite relevant sources and identify gaps in current knowledge that your research addresses.]</p>
          
          <h2>3. Methodology</h2>
          <p>[Describe your research methods, data collection procedures, and analytical approaches.]</p>
          
          <h2>4. Results</h2>
          <p>[Present your findings clearly and objectively. Use tables, figures, or charts as needed.]</p>
          
          <h2>5. Discussion</h2>
          <p>[Interpret your results, discuss their implications, and relate them back to your research question and existing literature.]</p>
          
          <h2>6. Conclusion</h2>
          <p>[Summarize your main findings, discuss limitations, and suggest areas for future research.]</p>
          
          <h2>References</h2>
          <p>[List all sources cited in your paper using appropriate citation style (APA, MLA, Chicago, etc.)]</p>
        `
      },
      {
        id: 'meeting-minutes',
        name: 'Meeting Minutes',
        category: 'Business',
        description: 'Professional meeting minutes template',
        icon: '📋',
        content: `
          <div style="text-align: center; margin-bottom: 30px;">
            <h1>[Meeting Title]</h1>
            <h2>Meeting Minutes</h2>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5; font-weight: bold;">Date:</td>
              <td style="border: 1px solid #ccc; padding: 8px;">[Meeting Date]</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5; font-weight: bold;">Time:</td>
              <td style="border: 1px solid #ccc; padding: 8px;">[Start Time] - [End Time]</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5; font-weight: bold;">Location:</td>
              <td style="border: 1px solid #ccc; padding: 8px;">[Meeting Location/Platform]</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5; font-weight: bold;">Chair:</td>
              <td style="border: 1px solid #ccc; padding: 8px;">[Meeting Chair]</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5; font-weight: bold;">Secretary:</td>
              <td style="border: 1px solid #ccc; padding: 8px;">[Note Taker]</td>
            </tr>
          </table>
          
          <h3>Attendees</h3>
          <ul>
            <li>[Attendee Name] - [Title/Role]</li>
            <li>[Attendee Name] - [Title/Role]</li>
            <li>[Add more as needed]</li>
          </ul>
          
          <h3>Agenda Items</h3>
          
          <h4>1. [Agenda Item Title]</h4>
          <p><strong>Discussion:</strong> [Summary of discussion points]</p>
          <p><strong>Decision:</strong> [Any decisions made]</p>
          <p><strong>Action Items:</strong></p>
          <ul>
            <li>[Action item] - Assigned to: [Name] - Due: [Date]</li>
          </ul>
          
          <h4>2. [Next Agenda Item]</h4>
          <p><strong>Discussion:</strong> [Summary of discussion]</p>
          <p><strong>Decision:</strong> [Decision made]</p>
          
          <h3>Next Meeting</h3>
          <p><strong>Date:</strong> [Next meeting date]</p>
          <p><strong>Time:</strong> [Next meeting time]</p>
          <p><strong>Location:</strong> [Next meeting location]</p>
          
          <h3>Action Items Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Action Item</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Assigned To</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Due Date</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Status</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">[Action item description]</td>
              <td style="border: 1px solid #ccc; padding: 8px;">[Person responsible]</td>
              <td style="border: 1px solid #ccc; padding: 8px;">[Due date]</td>
              <td style="border: 1px solid #ccc; padding: 8px;">Pending</td>
            </tr>
          </table>
        `
      },
      {
        id: 'project-proposal',
        name: 'Project Proposal',
        category: 'Business',
        description: 'Comprehensive project proposal template',
        icon: '📊',
        content: `
          <div style="text-align: center; margin-bottom: 40px;">
            <h1>[Project Title]</h1>
            <h2>Project Proposal</h2>
            <div style="margin-top: 20px;">
              Prepared by: [Your Name]<br>
              Date: [Date]<br>
              For: [Client/Organization Name]
            </div>
          </div>
          
          <h2>Executive Summary</h2>
          <p>[Brief overview of the project, its objectives, and expected outcomes. This should be compelling and concise.]</p>
          
          <h2>Project Background</h2>
          <p>[Explain the context and need for this project. What problem does it solve?]</p>
          
          <h2>Project Objectives</h2>
          <ul>
            <li>[Primary objective]</li>
            <li>[Secondary objective]</li>
            <li>[Additional objectives as needed]</li>
          </ul>
          
          <h2>Scope of Work</h2>
          <h3>Included in Scope:</h3>
          <ul>
            <li>[Deliverable or task]</li>
            <li>[Another deliverable]</li>
            <li>[Additional items]</li>
          </ul>
          
          <h3>Excluded from Scope:</h3>
          <ul>
            <li>[What is not included]</li>
            <li>[Other exclusions]</li>
          </ul>
          
          <h2>Methodology</h2>
          <p>[Describe your approach to completing the project. What methods, tools, or frameworks will you use?]</p>
          
          <h2>Timeline</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Phase</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Activities</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Duration</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Deliverables</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">Phase 1</td>
              <td style="border: 1px solid #ccc; padding: 8px;">[Activities description]</td>
              <td style="border: 1px solid #ccc; padding: 8px;">[Time period]</td>
              <td style="border: 1px solid #ccc; padding: 8px;">[Expected deliverables]</td>
            </tr>
          </table>
          
          <h2>Budget</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Item</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Cost</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">[Budget item]</td>
              <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">$[Amount]</td>
            </tr>
            <tr style="background: #f5f5f5; font-weight: bold;">
              <td style="border: 1px solid #ccc; padding: 8px;">Total Project Cost</td>
              <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">$[Total]</td>
            </tr>
          </table>
          
          <h2>Risk Assessment</h2>
          <p>[Identify potential risks and mitigation strategies]</p>
          
          <h2>Success Criteria</h2>
          <p>[Define how success will be measured]</p>
          
          <h2>Next Steps</h2>
          <p>[Outline the approval process and immediate next steps]</p>
        `
      }
    ];
  },

  getBuiltInStyles() {
    return [
      {
        id: 'heading-1',
        name: 'Heading 1',
        category: 'Headings',
        css: {
          'font-size': '24pt',
          'font-weight': 'bold',
          'color': '#2c3e50',
          'margin-top': '24pt',
          'margin-bottom': '12pt',
          'border-bottom': '2px solid #3498db',
          'padding-bottom': '6pt'
        }
      },
      {
        id: 'heading-2',
        name: 'Heading 2',
        category: 'Headings',
        css: {
          'font-size': '18pt',
          'font-weight': 'bold',
          'color': '#34495e',
          'margin-top': '18pt',
          'margin-bottom': '9pt'
        }
      },
      {
        id: 'heading-3',
        name: 'Heading 3',
        category: 'Headings',
        css: {
          'font-size': '14pt',
          'font-weight': 'bold',
          'color': '#34495e',
          'margin-top': '14pt',
          'margin-bottom': '7pt'
        }
      },
      {
        id: 'body-text',
        name: 'Body Text',
        category: 'Paragraphs',
        css: {
          'font-size': '12pt',
          'line-height': '1.5',
          'margin-bottom': '12pt',
          'text-align': 'justify'
        }
      },
      {
        id: 'quote',
        name: 'Quote',
        category: 'Special',
        css: {
          'font-style': 'italic',
          'margin-left': '36pt',
          'margin-right': '36pt',
          'padding': '12pt',
          'border-left': '4px solid #3498db',
          'background': '#f8f9fa',
          'color': '#555'
        }
      },
      {
        id: 'code',
        name: 'Code',
        category: 'Special',
        css: {
          'font-family': 'Consolas, Monaco, monospace',
          'background': '#f4f4f4',
          'padding': '2pt 4pt',
          'border': '1px solid #ddd',
          'border-radius': '3px',
          'font-size': '11pt'
        }
      }
    ];
  },

  setupDocumentTemplatesUI(app) {
    const panel = app.createPanel('document-templates', 'Templates & Styles');
    
    // Header with templates theme
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #8e44ad, #3498db, #e67e22, #e74c3c);
      border-radius: 12px;
      color: white;
      position: relative;
      overflow: hidden;
    `;

    // Floating template icons
    const templateIcons = ['📄', '📋', '📊', '📝', '🎓', '💼'];
    templateIcons.forEach((icon, index) => {
      const floatingIcon = document.createElement('div');
      floatingIcon.style.cssText = `
        position: absolute;
        font-size: 1.4em;
        opacity: 0.2;
        animation: floatTemplate ${4 + index}s ease-in-out infinite;
        animation-delay: ${index * 0.3}s;
        pointer-events: none;
      `;
      floatingIcon.style.left = `${5 + index * 15}%`;
      floatingIcon.style.top = `${10 + (index % 2) * 60}%`;
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
    title.innerHTML = '📄 Templates & Styles';

    const templateActions = document.createElement('div');
    templateActions.style.cssText = `
      display: flex;
      gap: 10px;
      z-index: 1;
      position: relative;
    `;

    const createBtn = document.createElement('button');
    createBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    createBtn.textContent = '➕ Create';
    createBtn.addEventListener('click', () => this.createCustomTemplate());

    const importBtn = document.createElement('button');
    importBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    importBtn.textContent = '📥 Import';
    importBtn.addEventListener('click', () => this.importTemplate());

    templateActions.appendChild(createBtn);
    templateActions.appendChild(importBtn);

    header.appendChild(title);
    header.appendChild(templateActions);
    panel.appendChild(header);

    // Template Categories
    const categoriesSection = document.createElement('div');
    categoriesSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    `;

    categoriesSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">📂 Template Categories</h4>
      
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px;">
        <button class="category-btn active" data-category="all" style="
          padding: 6px 12px;
          border: none;
          border-radius: 15px;
          background: var(--hermes-highlight-bg);
          color: var(--hermes-highlight-text);
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.2s;
        ">All</button>
        <button class="category-btn" data-category="Business" style="
          padding: 6px 12px;
          border: 1px solid var(--hermes-border);
          border-radius: 15px;
          background: transparent;
          color: var(--hermes-text);
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.2s;
        ">💼 Business</button>
        <button class="category-btn" data-category="Academic" style="
          padding: 6px 12px;
          border: 1px solid var(--hermes-border);
          border-radius: 15px;
          background: transparent;
          color: var(--hermes-text);
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.2s;
        ">🎓 Academic</button>
        <button class="category-btn" data-category="Career" style="
          padding: 6px 12px;
          border: 1px solid var(--hermes-border);
          border-radius: 15px;
          background: transparent;
          color: var(--hermes-text);
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.2s;
        ">👤 Career</button>
        <button class="category-btn" data-category="Personal" style="
          padding: 6px 12px;
          border: 1px solid var(--hermes-border);
          border-radius: 15px;
          background: transparent;
          color: var(--hermes-text);
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.2s;
        ">📝 Personal</button>
      </div>
      
      <div id="templates-grid" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
      ">
        ${this.generateTemplatesGrid()}
      </div>
    `;

    panel.appendChild(categoriesSection);

    // Styles Section
    const stylesSection = document.createElement('div');
    stylesSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    `;

    stylesSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: var(--hermes-text);">🎨 Text Styles</h4>
        <button onclick="this.createCustomStyle()" style="
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          background: var(--hermes-success-text);
          color: white;
          cursor: pointer;
          font-size: 0.9em;
        ">➕ New Style</button>
      </div>
      
      <div id="styles-list" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
      ">
        ${this.generateStylesList()}
      </div>
    `;

    panel.appendChild(stylesSection);

    // Table of Contents Generator
    const tocSection = document.createElement('div');
    tocSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
    `;

    tocSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="margin: 0; color: var(--hermes-text);">📑 Table of Contents</h4>
        <button onclick="this.generateTableOfContents()" style="
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          background: var(--hermes-info-text);
          color: white;
          cursor: pointer;
          font-size: 0.9em;
        ">🔄 Generate TOC</button>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <input type="checkbox" id="include-h1" checked>
          <span style="color: var(--hermes-text);">Include Heading 1</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <input type="checkbox" id="include-h2" checked>
          <span style="color: var(--hermes-text);">Include Heading 2</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <input type="checkbox" id="include-h3">
          <span style="color: var(--hermes-text);">Include Heading 3</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="include-page-numbers">
          <span style="color: var(--hermes-text);">Include page numbers</span>
        </label>
      </div>
      
      <div id="toc-preview" style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 4px;
        padding: 15px;
        min-height: 100px;
        font-family: 'Times New Roman', serif;
      ">
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic;">
          Generate a table of contents to see preview
        </div>
      </div>
    `;

    panel.appendChild(tocSection);

    // Bind events
    this.bindCategoryEvents();
    this.bindStyleEvents();
  },

  generateTemplatesGrid() {
    const allTemplates = [...this.templates, ...this.customTemplates];
    
    return allTemplates.map(template => `
      <div class="template-card" data-category="${template.category}" style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 8px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        overflow: hidden;
      " onclick="this.applyTemplate('${template.id}')" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
        
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <div style="font-size: 2em;">${template.icon}</div>
          <div>
            <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 2px;">
              ${template.name}
            </div>
            <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">
              ${template.category}
            </div>
          </div>
        </div>
        
        <div style="color: var(--hermes-disabled-text); font-size: 0.9em; line-height: 1.4; margin-bottom: 12px;">
          ${template.description}
        </div>
        
        <div style="display: flex; gap: 4px;">
          <button onclick="event.stopPropagation(); this.previewTemplate('${template.id}')" style="
            flex: 1;
            padding: 6px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-info-text);
            color: white;
            cursor: pointer;
            font-size: 0.8em;
          ">👁️ Preview</button>
          <button onclick="event.stopPropagation(); this.applyTemplate('${template.id}')" style="
            flex: 1;
            padding: 6px;
            border: none;
            border-radius: 3px;
            background: var(--hermes-success-text);
            color: white;
            cursor: pointer;
            font-size: 0.8em;
          ">✓ Use</button>
        </div>
      </div>
    `).join('');
  },

  generateStylesList() {
    const allStyles = [...this.styles, ...this.customStyles];
    
    return allStyles.map(style => `
      <div class="style-item" style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        padding: 10px;
        cursor: pointer;
        transition: all 0.2s;
      " onclick="this.applyStyle('${style.id}')" onmouseenter="this.style.background='var(--hermes-highlight-bg)'" onmouseleave="this.style.background='var(--hermes-bg)'">
        
        <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 4px; font-size: 0.9em;">
          ${style.name}
        </div>
        
        <div style="
          font-size: 0.8em;
          color: var(--hermes-disabled-text);
          margin-bottom: 6px;
          ${Object.entries(style.css).map(([prop, value]) => `${prop}: ${value}`).join('; ')}
        ">
          Sample text with this style applied
        </div>
        
        <div style="font-size: 0.7em; color: var(--hermes-disabled-text);">
          ${style.category}
        </div>
      </div>
    `).join('');
  },

  bindCategoryEvents() {
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        this.filterTemplatesByCategory(category);
        this.updateCategoryButtons(btn);
      });
    });
  },

  bindStyleEvents() {
    // Style events will be bound when styles are applied
  },

  filterTemplatesByCategory(category) {
    const cards = document.querySelectorAll('.template-card');
    
    cards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  },

  updateCategoryButtons(activeBtn) {
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.style.background = 'transparent';
      btn.style.color = 'var(--hermes-text)';
      btn.style.border = '1px solid var(--hermes-border)';
    });
    
    activeBtn.style.background = 'var(--hermes-highlight-bg)';
    activeBtn.style.color = 'var(--hermes-highlight-text)';
    activeBtn.style.border = 'none';
  },

  applyTemplate(templateId) {
    const template = [...this.templates, ...this.customTemplates].find(t => t.id === templateId);
    if (!template) return;
    
    const content = document.getElementById('document-content');
    if (content) {
      content.innerHTML = template.content;
      
      // Show success message
      if (window.app) {
        window.app.showToast(`Template "${template.name}" applied!`, 'success');
      }
    }
  },

  previewTemplate(templateId) {
    const template = [...this.templates, ...this.customTemplates].find(t => t.id === templateId);
    if (!template) return;
    
    // Create preview modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 8px;
        padding: 20px;
        max-width: 80%;
        max-height: 80%;
        overflow-y: auto;
        position: relative;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; color: #333;">Preview: ${template.name}</h3>
          <button onclick="this.remove()" style="
            background: none;
            border: none;
            font-size: 1.5em;
            cursor: pointer;
            color: #666;
          ">×</button>
        </div>
        
        <div style="border: 1px solid #ddd; padding: 20px; background: white; font-family: 'Times New Roman', serif;">
          ${template.content}
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <button onclick="this.parentElement.parentElement.remove(); window.templatePlugin.applyTemplate('${templateId}')" style="
            padding: 10px 20px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
          ">Use This Template</button>
          <button onclick="this.parentElement.parentElement.remove()" style="
            padding: 10px 20px;
            background: #95a5a6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          ">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    window.templatePlugin = this; // Temporary reference for modal buttons
  },

  applyStyle(styleId) {
    const style = [...this.styles, ...this.customStyles].find(s => s.id === styleId);
    if (!style) return;
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    
    // Apply CSS styles
    Object.entries(style.css).forEach(([prop, value]) => {
      span.style[prop] = value;
    });
    
    try {
      range.surroundContents(span);
    } catch (e) {
      // If can't surround, insert at cursor
      range.insertNode(span);
    }
  },

  generateTableOfContents() {
    const content = document.getElementById('document-content');
    if (!content) return;
    
    const includeH1 = document.getElementById('include-h1')?.checked;
    const includeH2 = document.getElementById('include-h2')?.checked;
    const includeH3 = document.getElementById('include-h3')?.checked;
    const includePageNumbers = document.getElementById('include-page-numbers')?.checked;
    
    const headings = [];
    const selector = [];
    
    if (includeH1) selector.push('h1');
    if (includeH2) selector.push('h2');
    if (includeH3) selector.push('h3');
    
    if (selector.length === 0) {
      document.getElementById('toc-preview').innerHTML = `
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic;">
          Please select at least one heading level
        </div>
      `;
      return;
    }
    
    content.querySelectorAll(selector.join(',')).forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent.trim();
      const id = `toc-${index}`;
      
      // Add ID to heading for linking
      heading.id = id;
      
      headings.push({
        level,
        text,
        id,
        pageNumber: includePageNumbers ? Math.floor(index / 3) + 1 : null
      });
    });
    
    const tocHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 18pt; font-weight: bold;">Table of Contents</h2>
      </div>
      
      ${headings.map(heading => `
        <div style="
          margin-left: ${(heading.level - 1) * 20}px;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        ">
          <a href="#${heading.id}" style="
            color: #2c3e50;
            text-decoration: none;
            flex: 1;
          " onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
            ${heading.text}
          </a>
          ${heading.pageNumber ? `
            <span style="
              border-bottom: 1px dotted #ccc;
              flex: 1;
              margin: 0 10px;
              height: 1px;
              align-self: end;
              margin-bottom: 4px;
            "></span>
            <span style="color: #666; font-size: 0.9em;">${heading.pageNumber}</span>
          ` : ''}
        </div>
      `).join('')}
    `;
    
    document.getElementById('toc-preview').innerHTML = tocHTML;
  },

  createCustomTemplate() {
    const name = prompt('Enter template name:');
    if (!name) return;
    
    const category = prompt('Enter category (Business, Academic, Career, Personal):') || 'Personal';
    const description = prompt('Enter description:') || 'Custom template';
    
    const content = document.getElementById('document-content');
    const templateContent = content ? content.innerHTML : '<p>Template content</p>';
    
    const template = {
      id: crypto.randomUUID(),
      name,
      category,
      description,
      icon: '📄',
      content: templateContent,
      custom: true
    };
    
    this.customTemplates.push(template);
    this.saveCustomTemplates();
    this.refreshTemplatesGrid();
  },

  importTemplate() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.html,.docx';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const template = JSON.parse(e.target.result);
            template.id = crypto.randomUUID();
            template.custom = true;
            
            this.customTemplates.push(template);
            this.saveCustomTemplates();
            this.refreshTemplatesGrid();
          } catch (error) {
            alert('Invalid template file format');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  },

  createCustomStyle() {
    const name = prompt('Enter style name:');
    if (!name) return;
    
    const category = prompt('Enter category (Headings, Paragraphs, Special):') || 'Special';
    
    // Simple style creator - in a real implementation, this would be a full style editor
    const fontSize = prompt('Font size (e.g., 12pt):') || '12pt';
    const fontWeight = prompt('Font weight (normal, bold):') || 'normal';
    const color = prompt('Text color (e.g., #333333):') || '#000000';
    
    const style = {
      id: crypto.randomUUID(),
      name,
      category,
      css: {
        'font-size': fontSize,
        'font-weight': fontWeight,
        'color': color
      },
      custom: true
    };
    
    this.customStyles.push(style);
    this.saveCustomStyles();
    this.refreshStylesList();
  },

  refreshTemplatesGrid() {
    const grid = document.getElementById('templates-grid');
    if (grid) {
      grid.innerHTML = this.generateTemplatesGrid();
    }
  },

  refreshStylesList() {
    const list = document.getElementById('styles-list');
    if (list) {
      list.innerHTML = this.generateStylesList();
    }
  },

  saveCustomTemplates() {
    localStorage.setItem('nextnote_custom_templates', JSON.stringify(this.customTemplates));
  },

  saveCustomStyles() {
    localStorage.setItem('nextnote_custom_styles', JSON.stringify(this.customStyles));
  },

  initializeTemplateComponents(app) {
    // Add CSS for templates
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatTemplate {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(2deg); }
      }
      
      .template-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-color: var(--hermes-highlight-bg);
      }
      
      .style-item:hover {
        transform: scale(1.02);
      }
    `;
    document.head.appendChild(style);
  },

  bindTemplateEvents(app) {
    // Listen for template events
    app.on('templateApplied', (templateId) => {
      console.log('Template applied:', templateId);
    });
  }
});
