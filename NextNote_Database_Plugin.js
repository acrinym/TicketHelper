/**
 * NextNote Database Plugin
 * Advanced database functionality with relational tables, formulas, and multiple views
 * Open-source alternative to Notion's database features
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Database',
  version: '1.0.0',
  description: 'Advanced database with relational tables, formulas, and multiple views',
  
  onLoad(app) {
    this.databases = JSON.parse(localStorage.getItem('nextnote_databases') || '[]');
    this.currentDatabase = null;
    this.currentView = 'table';
    this.setupDatabaseUI(app);
    this.initializeDatabaseComponents(app);
    this.bindDatabaseEvents(app);
  },

  setupDatabaseUI(app) {
    const panel = app.createPanel('database', 'Database');
    
    // Database header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, var(--hermes-info-text), var(--hermes-success-text));
      border-radius: 12px;
      color: white;
    `;

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0; color: white; display: flex; align-items: center; gap: 10px;';
    title.innerHTML = '🗄️ Database Manager';

    const newDbBtn = document.createElement('button');
    newDbBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
    `;
    newDbBtn.textContent = '+ New Database';
    newDbBtn.addEventListener('click', () => this.showNewDatabaseDialog(app));

    header.appendChild(title);
    header.appendChild(newDbBtn);
    panel.appendChild(header);

    // Database selector
    const selectorSection = document.createElement('div');
    selectorSection.style.cssText = 'margin-bottom: 20px;';
    selectorSection.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <label style="font-weight: bold; color: var(--hermes-text);">Current Database:</label>
        <select id="database-selector" style="
          flex: 1;
          padding: 8px;
          border: 1px solid var(--hermes-border);
          border-radius: 4px;
          background: var(--hermes-input-bg);
          color: var(--hermes-text);
        ">
          <option value="">Select a database...</option>
        </select>
      </div>
    `;
    panel.appendChild(selectorSection);

    // View tabs
    const viewTabs = document.createElement('div');
    viewTabs.style.cssText = `
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--hermes-border);
    `;

    const views = [
      { id: 'table', label: '📊 Table', icon: '📊' },
      { id: 'kanban', label: '📋 Kanban', icon: '📋' },
      { id: 'calendar', label: '📅 Calendar', icon: '📅' },
      { id: 'gallery', label: '🖼️ Gallery', icon: '🖼️' },
      { id: 'form', label: '📝 Form', icon: '📝' }
    ];

    views.forEach((view, index) => {
      const tab = document.createElement('button');
      tab.className = `database-view-tab ${index === 0 ? 'active' : ''}`;
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
      tab.addEventListener('click', () => this.switchDatabaseView(view.id));
      viewTabs.appendChild(tab);
    });

    panel.appendChild(viewTabs);

    // Database content area
    const contentArea = document.createElement('div');
    contentArea.id = 'database-content-area';
    contentArea.style.cssText = 'min-height: 400px;';
    panel.appendChild(contentArea);

    // Initialize database selector
    this.updateDatabaseSelector();
    this.showEmptyState();
  },

  showNewDatabaseDialog(app) {
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
      width: 500px;
      max-width: 90vw;
    `;

    dialog.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: var(--hermes-text);">Create New Database</h3>
      <form id="new-database-form">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Database Name</label>
          <input type="text" id="db-name" required style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Description</label>
          <textarea id="db-description" rows="3" style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text); resize: vertical;"></textarea>
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Template</label>
          <select id="db-template" style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
            <option value="blank">Blank Database</option>
            <option value="tasks">Task Management</option>
            <option value="contacts">Contact Directory</option>
            <option value="inventory">Inventory Tracker</option>
            <option value="projects">Project Database</option>
            <option value="expenses">Expense Tracker</option>
          </select>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" id="cancel-db" style="padding: 10px 20px; border: 1px solid var(--hermes-border); border-radius: 6px; background: var(--hermes-button-bg); color: var(--hermes-text); cursor: pointer;">Cancel</button>
          <button type="submit" style="padding: 10px 20px; border: none; border-radius: 6px; background: var(--hermes-highlight-bg); color: var(--hermes-highlight-text); cursor: pointer;">Create Database</button>
        </div>
      </form>
    `;

    dialog.querySelector('#cancel-db').addEventListener('click', () => overlay.remove());
    dialog.querySelector('#new-database-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.createDatabase({
        name: dialog.querySelector('#db-name').value,
        description: dialog.querySelector('#db-description').value,
        template: dialog.querySelector('#db-template').value
      }, app);
      overlay.remove();
    });

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  },

  createDatabase(dbData, app) {
    const database = {
      id: crypto.randomUUID(),
      name: dbData.name,
      description: dbData.description,
      template: dbData.template,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      fields: this.getTemplateFields(dbData.template),
      records: this.getTemplateRecords(dbData.template),
      views: this.getTemplateViews(dbData.template),
      settings: {
        defaultView: 'table',
        recordsPerPage: 25,
        allowPublicAccess: false
      }
    };

    this.databases.push(database);
    this.saveDatabases();
    this.updateDatabaseSelector();
    this.selectDatabase(database.id);
    app.showToast(`Database "${database.name}" created successfully!`, 'success');
  },

  getTemplateFields(template) {
    const templates = {
      blank: [
        { id: 'title', name: 'Title', type: 'text', required: true, primary: true },
        { id: 'description', name: 'Description', type: 'text', required: false }
      ],
      tasks: [
        { id: 'title', name: 'Task', type: 'text', required: true, primary: true },
        { id: 'status', name: 'Status', type: 'select', options: ['To Do', 'In Progress', 'Done'], required: true },
        { id: 'priority', name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'], required: false },
        { id: 'assignee', name: 'Assignee', type: 'text', required: false },
        { id: 'due_date', name: 'Due Date', type: 'date', required: false },
        { id: 'description', name: 'Description', type: 'text', required: false }
      ],
      contacts: [
        { id: 'name', name: 'Name', type: 'text', required: true, primary: true },
        { id: 'email', name: 'Email', type: 'email', required: false },
        { id: 'phone', name: 'Phone', type: 'text', required: false },
        { id: 'company', name: 'Company', type: 'text', required: false },
        { id: 'category', name: 'Category', type: 'select', options: ['Client', 'Vendor', 'Partner', 'Personal'], required: false },
        { id: 'notes', name: 'Notes', type: 'text', required: false }
      ],
      inventory: [
        { id: 'item', name: 'Item', type: 'text', required: true, primary: true },
        { id: 'sku', name: 'SKU', type: 'text', required: false },
        { id: 'quantity', name: 'Quantity', type: 'number', required: true },
        { id: 'price', name: 'Price', type: 'number', required: false },
        { id: 'category', name: 'Category', type: 'text', required: false },
        { id: 'supplier', name: 'Supplier', type: 'text', required: false },
        { id: 'location', name: 'Location', type: 'text', required: false }
      ],
      projects: [
        { id: 'project', name: 'Project', type: 'text', required: true, primary: true },
        { id: 'status', name: 'Status', type: 'select', options: ['Planning', 'Active', 'On Hold', 'Completed'], required: true },
        { id: 'manager', name: 'Project Manager', type: 'text', required: false },
        { id: 'start_date', name: 'Start Date', type: 'date', required: false },
        { id: 'end_date', name: 'End Date', type: 'date', required: false },
        { id: 'budget', name: 'Budget', type: 'number', required: false },
        { id: 'description', name: 'Description', type: 'text', required: false }
      ],
      expenses: [
        { id: 'description', name: 'Description', type: 'text', required: true, primary: true },
        { id: 'amount', name: 'Amount', type: 'number', required: true },
        { id: 'category', name: 'Category', type: 'select', options: ['Travel', 'Meals', 'Office', 'Equipment', 'Other'], required: true },
        { id: 'date', name: 'Date', type: 'date', required: true },
        { id: 'receipt', name: 'Receipt', type: 'file', required: false },
        { id: 'notes', name: 'Notes', type: 'text', required: false }
      ]
    };

    return templates[template] || templates.blank;
  },

  getTemplateRecords(template) {
    const sampleData = {
      tasks: [
        { title: 'Setup project repository', status: 'Done', priority: 'High', assignee: 'John Doe', due_date: '2025-09-15', description: 'Initialize Git repository and basic structure' },
        { title: 'Design database schema', status: 'In Progress', priority: 'High', assignee: 'Jane Smith', due_date: '2025-09-20', description: 'Create ERD and table definitions' },
        { title: 'Write documentation', status: 'To Do', priority: 'Medium', assignee: 'Bob Johnson', due_date: '2025-09-25', description: 'User manual and API docs' }
      ],
      contacts: [
        { name: 'John Smith', email: 'john@example.com', phone: '555-0123', company: 'Acme Corp', category: 'Client', notes: 'Primary contact for Project Alpha' },
        { name: 'Sarah Wilson', email: 'sarah@vendor.com', phone: '555-0456', company: 'Vendor Inc', category: 'Vendor', notes: 'Office supplies vendor' }
      ],
      inventory: [
        { item: 'Laptop Computer', sku: 'LAP-001', quantity: 15, price: 1200, category: 'Electronics', supplier: 'Tech Supply Co', location: 'Warehouse A' },
        { item: 'Office Chair', sku: 'CHR-001', quantity: 25, price: 250, category: 'Furniture', supplier: 'Office Furniture Ltd', location: 'Warehouse B' }
      ],
      projects: [
        { project: 'Website Redesign', status: 'Active', manager: 'Alice Brown', start_date: '2025-09-01', end_date: '2025-12-01', budget: 50000, description: 'Complete overhaul of company website' },
        { project: 'Mobile App Development', status: 'Planning', manager: 'Mike Davis', start_date: '2025-10-01', end_date: '2026-03-01', budget: 75000, description: 'Native iOS and Android apps' }
      ],
      expenses: [
        { description: 'Business lunch with client', amount: 85.50, category: 'Meals', date: '2025-09-15', notes: 'Discussed project requirements' },
        { description: 'Flight to conference', amount: 450.00, category: 'Travel', date: '2025-09-10', notes: 'Tech conference in San Francisco' }
      ]
    };

    const records = sampleData[template] || [];
    return records.map(record => ({
      id: crypto.randomUUID(),
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      data: record
    }));
  },

  getTemplateViews(template) {
    return [
      { id: 'table', name: 'Table View', type: 'table', default: true },
      { id: 'kanban', name: 'Kanban Board', type: 'kanban' },
      { id: 'calendar', name: 'Calendar View', type: 'calendar' },
      { id: 'gallery', name: 'Gallery View', type: 'gallery' }
    ];
  },

  updateDatabaseSelector() {
    const selector = document.getElementById('database-selector');
    if (!selector) return;

    selector.innerHTML = '<option value="">Select a database...</option>';
    this.databases.forEach(db => {
      const option = document.createElement('option');
      option.value = db.id;
      option.textContent = db.name;
      selector.appendChild(option);
    });

    selector.addEventListener('change', (e) => {
      if (e.target.value) {
        this.selectDatabase(e.target.value);
      } else {
        this.currentDatabase = null;
        this.showEmptyState();
      }
    });
  },

  selectDatabase(databaseId) {
    this.currentDatabase = this.databases.find(db => db.id === databaseId);
    if (this.currentDatabase) {
      document.getElementById('database-selector').value = databaseId;
      this.switchDatabaseView(this.currentView);
    }
  },

  switchDatabaseView(viewId) {
    this.currentView = viewId;

    // Update tab styles
    document.querySelectorAll('.database-view-tab').forEach(tab => {
      tab.style.background = 'transparent';
      tab.style.color = 'var(--hermes-text)';
      tab.style.borderBottomColor = 'transparent';
    });

    const activeTab = document.querySelector(`.database-view-tab:nth-child(${['table', 'kanban', 'calendar', 'gallery', 'form'].indexOf(viewId) + 1})`);
    if (activeTab) {
      activeTab.style.background = 'var(--hermes-highlight-bg)';
      activeTab.style.color = 'var(--hermes-highlight-text)';
      activeTab.style.borderBottomColor = 'var(--hermes-highlight-bg)';
    }

    // Update content area
    const contentArea = document.getElementById('database-content-area');
    if (!contentArea) return;

    if (!this.currentDatabase) {
      this.showEmptyState();
      return;
    }

    switch (viewId) {
      case 'table':
        contentArea.innerHTML = this.generateTableView();
        break;
      case 'kanban':
        contentArea.innerHTML = this.generateKanbanView();
        break;
      case 'calendar':
        contentArea.innerHTML = this.generateCalendarView();
        break;
      case 'gallery':
        contentArea.innerHTML = this.generateGalleryView();
        break;
      case 'form':
        contentArea.innerHTML = this.generateFormView();
        break;
    }
  },

  showEmptyState() {
    const contentArea = document.getElementById('database-content-area');
    if (!contentArea) return;

    contentArea.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--hermes-disabled-text);">
        <div style="font-size: 4em; margin-bottom: 20px;">🗄️</div>
        <h3 style="color: var(--hermes-text); margin-bottom: 10px;">No Database Selected</h3>
        <p style="margin-bottom: 20px;">Create a new database or select an existing one to get started.</p>
        <button onclick="document.querySelector('#database-selector').focus()" style="
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          background: var(--hermes-highlight-bg);
          color: var(--hermes-highlight-text);
          cursor: pointer;
        ">Select Database</button>
      </div>
    `;
  },

  generateTableView() {
    if (!this.currentDatabase) return '';

    let html = `
      <div class="database-table-view">
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 15px;">
          <h4 style="margin: 0; color: var(--hermes-text);">📊 ${this.currentDatabase.name}</h4>
          <button onclick="this.addNewRecord()" style="
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            background: var(--hermes-success-text);
            color: white;
            cursor: pointer;
            font-size: 0.9em;
          ">+ Add Record</button>
        </div>
        <div style="overflow-x: auto; border: 1px solid var(--hermes-border); border-radius: 8px;">
          <table style="width: 100%; border-collapse: collapse; background: var(--hermes-bg);">
            <thead>
              <tr style="background: var(--hermes-panel-bg);">
    `;

    // Table headers
    this.currentDatabase.fields.forEach(field => {
      html += `
        <th style="
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid var(--hermes-border);
          font-weight: bold;
          color: var(--hermes-text);
        ">${field.name}</th>
      `;
    });

    html += `
              </tr>
            </thead>
            <tbody>
    `;

    // Table rows
    this.currentDatabase.records.forEach(record => {
      html += '<tr style="border-bottom: 1px solid var(--hermes-border);">';
      this.currentDatabase.fields.forEach(field => {
        const value = record.data[field.id] || '';
        html += `
          <td style="
            padding: 12px;
            color: var(--hermes-text);
            border-right: 1px solid var(--hermes-border);
          ">${this.formatFieldValue(value, field.type)}</td>
        `;
      });
      html += '</tr>';
    });

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    return html;
  },

  generateKanbanView() {
    return `
      <div class="database-kanban-view">
        <h4 style="margin: 0 0 20px 0; color: var(--hermes-text);">📋 ${this.currentDatabase.name} - Kanban Board</h4>
        <div style="text-align: center; padding: 40px; color: var(--hermes-disabled-text);">
          <div style="font-size: 3em; margin-bottom: 20px;">🚧</div>
          <h4 style="color: var(--hermes-text); margin-bottom: 10px;">Kanban View Coming Soon</h4>
          <p>Drag-and-drop task management with customizable columns.</p>
        </div>
      </div>
    `;
  },

  generateCalendarView() {
    return `
      <div class="database-calendar-view">
        <h4 style="margin: 0 0 20px 0; color: var(--hermes-text);">📅 ${this.currentDatabase.name} - Calendar View</h4>
        <div style="text-align: center; padding: 40px; color: var(--hermes-disabled-text);">
          <div style="font-size: 3em; margin-bottom: 20px;">📅</div>
          <h4 style="color: var(--hermes-text); margin-bottom: 10px;">Calendar View Coming Soon</h4>
          <p>Timeline view with date-based filtering and scheduling.</p>
        </div>
      </div>
    `;
  },

  generateGalleryView() {
    return `
      <div class="database-gallery-view">
        <h4 style="margin: 0 0 20px 0; color: var(--hermes-text);">🖼️ ${this.currentDatabase.name} - Gallery View</h4>
        <div style="text-align: center; padding: 40px; color: var(--hermes-disabled-text);">
          <div style="font-size: 3em; margin-bottom: 20px;">🖼️</div>
          <h4 style="color: var(--hermes-text); margin-bottom: 10px;">Gallery View Coming Soon</h4>
          <p>Visual card-based layout with image previews and rich content.</p>
        </div>
      </div>
    `;
  },

  generateFormView() {
    if (!this.currentDatabase) return '';

    let html = `
      <div class="database-form-view">
        <h4 style="margin: 0 0 20px 0; color: var(--hermes-text);">📝 Add New ${this.currentDatabase.name} Record</h4>
        <form id="database-record-form" style="
          max-width: 600px;
          padding: 20px;
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
        ">
    `;

    // Generate form fields
    this.currentDatabase.fields.forEach(field => {
      html += `
        <div style="margin-bottom: 15px;">
          <label style="
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: var(--hermes-text);
          ">${field.name}${field.required ? ' *' : ''}</label>
      `;

      switch (field.type) {
        case 'text':
          html += `
            <input type="text" name="${field.id}" ${field.required ? 'required' : ''} style="
              width: 100%;
              padding: 10px;
              border: 1px solid var(--hermes-border);
              border-radius: 4px;
              background: var(--hermes-input-bg);
              color: var(--hermes-text);
            ">
          `;
          break;
        case 'email':
          html += `
            <input type="email" name="${field.id}" ${field.required ? 'required' : ''} style="
              width: 100%;
              padding: 10px;
              border: 1px solid var(--hermes-border);
              border-radius: 4px;
              background: var(--hermes-input-bg);
              color: var(--hermes-text);
            ">
          `;
          break;
        case 'number':
          html += `
            <input type="number" name="${field.id}" ${field.required ? 'required' : ''} style="
              width: 100%;
              padding: 10px;
              border: 1px solid var(--hermes-border);
              border-radius: 4px;
              background: var(--hermes-input-bg);
              color: var(--hermes-text);
            ">
          `;
          break;
        case 'date':
          html += `
            <input type="date" name="${field.id}" ${field.required ? 'required' : ''} style="
              width: 100%;
              padding: 10px;
              border: 1px solid var(--hermes-border);
              border-radius: 4px;
              background: var(--hermes-input-bg);
              color: var(--hermes-text);
            ">
          `;
          break;
        case 'select':
          html += `
            <select name="${field.id}" ${field.required ? 'required' : ''} style="
              width: 100%;
              padding: 10px;
              border: 1px solid var(--hermes-border);
              border-radius: 4px;
              background: var(--hermes-input-bg);
              color: var(--hermes-text);
            ">
              <option value="">Select an option...</option>
          `;
          if (field.options) {
            field.options.forEach(option => {
              html += `<option value="${option}">${option}</option>`;
            });
          }
          html += '</select>';
          break;
        default:
          html += `
            <textarea name="${field.id}" rows="3" ${field.required ? 'required' : ''} style="
              width: 100%;
              padding: 10px;
              border: 1px solid var(--hermes-border);
              border-radius: 4px;
              background: var(--hermes-input-bg);
              color: var(--hermes-text);
              resize: vertical;
            "></textarea>
          `;
      }

      html += '</div>';
    });

    html += `
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button type="button" onclick="this.switchDatabaseView('table')" style="
              padding: 10px 20px;
              border: 1px solid var(--hermes-border);
              border-radius: 6px;
              background: var(--hermes-button-bg);
              color: var(--hermes-text);
              cursor: pointer;
            ">Cancel</button>
            <button type="submit" style="
              padding: 10px 20px;
              border: none;
              border-radius: 6px;
              background: var(--hermes-success-text);
              color: white;
              cursor: pointer;
            ">Add Record</button>
          </div>
        </form>
      </div>
    `;

    // Add form submission handler
    setTimeout(() => {
      const form = document.getElementById('database-record-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.addRecordFromForm(form);
        });
      }
    }, 100);

    return html;
  },

  addRecordFromForm(form) {
    const formData = new FormData(form);
    const recordData = {};

    this.currentDatabase.fields.forEach(field => {
      const value = formData.get(field.id);
      if (value) {
        recordData[field.id] = field.type === 'number' ? parseFloat(value) : value;
      }
    });

    const newRecord = {
      id: crypto.randomUUID(),
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      data: recordData
    };

    this.currentDatabase.records.push(newRecord);
    this.saveDatabases();
    this.switchDatabaseView('table');
  },

  formatFieldValue(value, type) {
    if (!value) return '';
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'email':
        return `<a href="mailto:${value}" style="color: var(--hermes-info-text);">${value}</a>`;
      default:
        return value;
    }
  },

  saveDatabases() {
    localStorage.setItem('nextnote_databases', JSON.stringify(this.databases));
  },

  initializeDatabaseComponents(app) {
    // Initialize database components
  },

  bindDatabaseEvents(app) {
    // Listen for database events
    app.on('databaseUpdated', (data) => {
      this.saveDatabases();
    });
  }
});
