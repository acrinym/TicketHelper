/**
 * NextNote Business Tools Plugin
 * Professional business tools including invoice generator, time tracking, and CRM
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Business Tools',
  version: '1.0.0',
  description: 'Professional business tools for invoicing, time tracking, and customer management',
  
  onLoad(app) {
    this.invoices = JSON.parse(localStorage.getItem('nextnote_invoices') || '[]');
    this.timeEntries = JSON.parse(localStorage.getItem('nextnote_time_entries') || '[]');
    this.clients = JSON.parse(localStorage.getItem('nextnote_clients') || '[]');
    this.currentTimer = null;
    this.setupBusinessToolsUI(app);
    this.initializeBusinessComponents(app);
    this.bindBusinessEvents(app);
  },

  setupBusinessToolsUI(app) {
    const panel = app.createPanel('business-tools', 'Business Tools');
    
    // Business Tools header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      border-radius: 12px;
      color: white;
    `;

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0; color: white; display: flex; align-items: center; gap: 10px;';
    title.innerHTML = '💼 Business Tools';

    const statsDiv = document.createElement('div');
    statsDiv.style.cssText = `
      display: flex;
      gap: 15px;
      font-size: 0.9em;
    `;
    statsDiv.innerHTML = `
      <div style="text-align: center;">
        <div style="font-weight: bold;">${this.invoices.length}</div>
        <div style="opacity: 0.8;">Invoices</div>
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">${this.clients.length}</div>
        <div style="opacity: 0.8;">Clients</div>
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">${this.timeEntries.length}</div>
        <div style="opacity: 0.8;">Time Entries</div>
      </div>
    `;

    header.appendChild(title);
    header.appendChild(statsDiv);
    panel.appendChild(header);

    // Tool tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = `
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--hermes-border);
    `;

    const tabs = [
      { id: 'time-tracker', label: '⏱️ Time Tracker', icon: '⏱️' },
      { id: 'invoice-generator', label: '📄 Invoice Generator', icon: '📄' },
      { id: 'client-manager', label: '👥 Client Manager', icon: '👥' },
      { id: 'expense-tracker', label: '💰 Expense Tracker', icon: '💰' }
    ];

    tabs.forEach((tab, index) => {
      const tabButton = document.createElement('button');
      tabButton.className = `business-tab ${index === 0 ? 'active' : ''}`;
      tabButton.style.cssText = `
        padding: 12px 20px;
        border: none;
        background: ${index === 0 ? 'var(--hermes-highlight-bg)' : 'transparent'};
        color: ${index === 0 ? 'var(--hermes-highlight-text)' : 'var(--hermes-text)'};
        cursor: pointer;
        border-bottom: 2px solid ${index === 0 ? 'var(--hermes-highlight-bg)' : 'transparent'};
        transition: all 0.2s;
        font-weight: bold;
      `;
      tabButton.textContent = tab.label;
      tabButton.addEventListener('click', () => this.switchBusinessTab(tab.id));
      tabsContainer.appendChild(tabButton);
    });

    panel.appendChild(tabsContainer);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.id = 'business-content-area';
    contentArea.style.cssText = 'min-height: 500px;';
    panel.appendChild(contentArea);

    // Initialize with time tracker
    this.switchBusinessTab('time-tracker');
  },

  switchBusinessTab(tabId) {
    // Update tab styles
    document.querySelectorAll('.business-tab').forEach(tab => {
      tab.style.background = 'transparent';
      tab.style.color = 'var(--hermes-text)';
      tab.style.borderBottomColor = 'transparent';
    });

    const activeTab = document.querySelector(`.business-tab:nth-child(${['time-tracker', 'invoice-generator', 'client-manager', 'expense-tracker'].indexOf(tabId) + 1})`);
    if (activeTab) {
      activeTab.style.background = 'var(--hermes-highlight-bg)';
      activeTab.style.color = 'var(--hermes-highlight-text)';
      activeTab.style.borderBottomColor = 'var(--hermes-highlight-bg)';
    }

    // Update content
    const contentArea = document.getElementById('business-content-area');
    if (!contentArea) return;

    switch (tabId) {
      case 'time-tracker':
        contentArea.innerHTML = this.generateTimeTrackerView();
        this.bindTimeTrackerEvents();
        break;
      case 'invoice-generator':
        contentArea.innerHTML = this.generateInvoiceGeneratorView();
        this.bindInvoiceEvents();
        break;
      case 'client-manager':
        contentArea.innerHTML = this.generateClientManagerView();
        this.bindClientEvents();
        break;
      case 'expense-tracker':
        contentArea.innerHTML = this.generateExpenseTrackerView();
        this.bindExpenseEvents();
        break;
    }
  },

  generateTimeTrackerView() {
    const totalHours = this.timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const todayEntries = this.timeEntries.filter(entry => 
      new Date(entry.date).toDateString() === new Date().toDateString()
    );
    const todayHours = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

    return `
      <div class="time-tracker-view">
        <!-- Timer Section -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 25px;
          text-align: center;
        ">
          <h3 style="margin: 0 0 20px 0; color: var(--hermes-text);">⏱️ Active Timer</h3>
          <div id="timer-display" style="
            font-size: 3em;
            font-weight: bold;
            color: var(--hermes-highlight-bg);
            margin-bottom: 20px;
            font-family: 'Courier New', monospace;
          ">00:00:00</div>
          
          <div style="margin-bottom: 20px;">
            <input type="text" id="timer-task" placeholder="What are you working on?" style="
              width: 300px;
              max-width: 100%;
              padding: 12px;
              border: 1px solid var(--hermes-border);
              border-radius: 6px;
              background: var(--hermes-input-bg);
              color: var(--hermes-text);
              text-align: center;
              font-size: 16px;
            ">
          </div>
          
          <div style="display: flex; gap: 15px; justify-content: center;">
            <button id="start-timer" style="
              padding: 12px 24px;
              border: none;
              border-radius: 6px;
              background: var(--hermes-success-text);
              color: white;
              cursor: pointer;
              font-size: 16px;
              font-weight: bold;
            ">▶️ Start</button>
            <button id="pause-timer" style="
              padding: 12px 24px;
              border: none;
              border-radius: 6px;
              background: var(--hermes-warning-text);
              color: white;
              cursor: pointer;
              font-size: 16px;
              font-weight: bold;
            " disabled>⏸️ Pause</button>
            <button id="stop-timer" style="
              padding: 12px 24px;
              border: none;
              border-radius: 6px;
              background: var(--hermes-error-text);
              color: white;
              cursor: pointer;
              font-size: 16px;
              font-weight: bold;
            " disabled>⏹️ Stop</button>
          </div>
        </div>

        <!-- Statistics -->
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        ">
          <div style="
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          ">
            <div style="font-size: 2em; color: var(--hermes-info-text);">📊</div>
            <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-text); margin: 10px 0;">
              ${(totalHours / 60).toFixed(1)}h
            </div>
            <div style="color: var(--hermes-disabled-text);">Total Hours</div>
          </div>
          
          <div style="
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          ">
            <div style="font-size: 2em; color: var(--hermes-success-text);">📅</div>
            <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-text); margin: 10px 0;">
              ${(todayHours / 60).toFixed(1)}h
            </div>
            <div style="color: var(--hermes-disabled-text);">Today</div>
          </div>
          
          <div style="
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          ">
            <div style="font-size: 2em; color: var(--hermes-warning-text);">📈</div>
            <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-text); margin: 10px 0;">
              ${this.timeEntries.length}
            </div>
            <div style="color: var(--hermes-disabled-text);">Entries</div>
          </div>
        </div>

        <!-- Recent Time Entries -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">📋 Recent Time Entries</h4>
          <div id="time-entries-list">
            ${this.timeEntries.slice(-10).reverse().map(entry => `
              <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                margin-bottom: 8px;
                background: var(--hermes-bg);
                border: 1px solid var(--hermes-border);
                border-radius: 6px;
              ">
                <div>
                  <div style="font-weight: bold; color: var(--hermes-text);">${entry.task}</div>
                  <div style="font-size: 0.9em; color: var(--hermes-disabled-text);">
                    ${new Date(entry.date).toLocaleDateString()} • ${entry.client || 'No client'}
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: bold; color: var(--hermes-highlight-bg);">
                    ${Math.floor(entry.duration / 60)}h ${entry.duration % 60}m
                  </div>
                  <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">
                    ${entry.startTime} - ${entry.endTime}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  generateInvoiceGeneratorView() {
    return `
      <div class="invoice-generator-view">
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; color: var(--hermes-text);">📄 Invoice Generator</h3>
          <button onclick="this.createNewInvoice()" style="
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            background: var(--hermes-success-text);
            color: white;
            cursor: pointer;
            font-weight: bold;
          ">+ New Invoice</button>
        </div>

        <!-- Invoice Form -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 25px;
        ">
          <form id="invoice-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Invoice Number</label>
                <input type="text" id="invoice-number" value="INV-${Date.now()}" style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid var(--hermes-border);
                  border-radius: 4px;
                  background: var(--hermes-input-bg);
                  color: var(--hermes-text);
                ">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Date</label>
                <input type="date" id="invoice-date" value="${new Date().toISOString().split('T')[0]}" style="
                  width: 100%;
                  padding: 10px;
                  border: 1px solid var(--hermes-border);
                  border-radius: 4px;
                  background: var(--hermes-input-bg);
                  color: var(--hermes-text);
                ">
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Client</label>
              <select id="invoice-client" style="
                width: 100%;
                padding: 10px;
                border: 1px solid var(--hermes-border);
                border-radius: 4px;
                background: var(--hermes-input-bg);
                color: var(--hermes-text);
              ">
                <option value="">Select a client...</option>
                ${this.clients.map(client => `<option value="${client.id}">${client.name}</option>`).join('')}
              </select>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 10px; font-weight: bold; color: var(--hermes-text);">Invoice Items</label>
              <div id="invoice-items">
                <div class="invoice-item" style="
                  display: grid;
                  grid-template-columns: 2fr 1fr 1fr 1fr auto;
                  gap: 10px;
                  margin-bottom: 10px;
                  align-items: center;
                ">
                  <input type="text" placeholder="Description" style="
                    padding: 8px;
                    border: 1px solid var(--hermes-border);
                    border-radius: 4px;
                    background: var(--hermes-input-bg);
                    color: var(--hermes-text);
                  ">
                  <input type="number" placeholder="Qty" min="1" value="1" style="
                    padding: 8px;
                    border: 1px solid var(--hermes-border);
                    border-radius: 4px;
                    background: var(--hermes-input-bg);
                    color: var(--hermes-text);
                  ">
                  <input type="number" placeholder="Rate" step="0.01" style="
                    padding: 8px;
                    border: 1px solid var(--hermes-border);
                    border-radius: 4px;
                    background: var(--hermes-input-bg);
                    color: var(--hermes-text);
                  ">
                  <div style="
                    padding: 8px;
                    background: var(--hermes-bg);
                    border: 1px solid var(--hermes-border);
                    border-radius: 4px;
                    text-align: center;
                    color: var(--hermes-text);
                  ">$0.00</div>
                  <button type="button" onclick="this.removeInvoiceItem(this)" style="
                    padding: 8px;
                    border: none;
                    border-radius: 4px;
                    background: var(--hermes-error-text);
                    color: white;
                    cursor: pointer;
                  ">🗑️</button>
                </div>
              </div>
              <button type="button" onclick="this.addInvoiceItem()" style="
                padding: 8px 16px;
                border: 1px solid var(--hermes-border);
                border-radius: 4px;
                background: var(--hermes-button-bg);
                color: var(--hermes-text);
                cursor: pointer;
              ">+ Add Item</button>
            </div>

            <div style="display: flex; gap: 15px; justify-content: flex-end;">
              <button type="button" onclick="this.previewInvoice()" style="
                padding: 10px 20px;
                border: 1px solid var(--hermes-border);
                border-radius: 6px;
                background: var(--hermes-button-bg);
                color: var(--hermes-text);
                cursor: pointer;
              ">👁️ Preview</button>
              <button type="submit" style="
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                background: var(--hermes-success-text);
                color: white;
                cursor: pointer;
                font-weight: bold;
              ">💾 Save Invoice</button>
            </div>
          </form>
        </div>

        <!-- Recent Invoices -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">📋 Recent Invoices</h4>
          <div id="invoices-list">
            ${this.invoices.slice(-5).reverse().map(invoice => `
              <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                margin-bottom: 10px;
                background: var(--hermes-bg);
                border: 1px solid var(--hermes-border);
                border-radius: 6px;
              ">
                <div>
                  <div style="font-weight: bold; color: var(--hermes-text);">${invoice.number}</div>
                  <div style="font-size: 0.9em; color: var(--hermes-disabled-text);">
                    ${invoice.clientName} • ${new Date(invoice.date).toLocaleDateString()}
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: bold; color: var(--hermes-success-text); font-size: 1.1em;">
                    $${invoice.total.toFixed(2)}
                  </div>
                  <div style="
                    padding: 2px 8px;
                    background: ${invoice.status === 'paid' ? 'var(--hermes-success-text)' : 'var(--hermes-warning-text)'};
                    color: white;
                    border-radius: 12px;
                    font-size: 0.8em;
                    text-transform: uppercase;
                  ">${invoice.status}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  generateClientManagerView() {
    return `
      <div class="client-manager-view">
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; color: var(--hermes-text);">👥 Client Manager</h3>
          <button onclick="this.addNewClient()" style="
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            background: var(--hermes-success-text);
            color: white;
            cursor: pointer;
            font-weight: bold;
          ">+ Add Client</button>
        </div>

        <!-- Client Grid -->
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        ">
          ${this.clients.map(client => `
            <div style="
              background: var(--hermes-panel-bg);
              border: 1px solid var(--hermes-border);
              border-radius: 8px;
              padding: 20px;
              transition: all 0.2s;
            " onmouseenter="this.style.borderColor='var(--hermes-highlight-bg)'" onmouseleave="this.style.borderColor='var(--hermes-border)'">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <h4 style="margin: 0; color: var(--hermes-text);">${client.name}</h4>
                <div style="display: flex; gap: 5px;">
                  <button onclick="this.editClient('${client.id}')" style="
                    padding: 4px 8px;
                    border: none;
                    border-radius: 3px;
                    background: var(--hermes-info-text);
                    color: white;
                    cursor: pointer;
                    font-size: 0.8em;
                  ">✏️</button>
                  <button onclick="this.deleteClient('${client.id}')" style="
                    padding: 4px 8px;
                    border: none;
                    border-radius: 3px;
                    background: var(--hermes-error-text);
                    color: white;
                    cursor: pointer;
                    font-size: 0.8em;
                  ">🗑️</button>
                </div>
              </div>
              
              <div style="margin-bottom: 10px;">
                <div style="font-size: 0.9em; color: var(--hermes-disabled-text); margin-bottom: 5px;">📧 Email</div>
                <div style="color: var(--hermes-text);">${client.email || 'Not provided'}</div>
              </div>
              
              <div style="margin-bottom: 10px;">
                <div style="font-size: 0.9em; color: var(--hermes-disabled-text); margin-bottom: 5px;">📞 Phone</div>
                <div style="color: var(--hermes-text);">${client.phone || 'Not provided'}</div>
              </div>
              
              <div style="margin-bottom: 15px;">
                <div style="font-size: 0.9em; color: var(--hermes-disabled-text); margin-bottom: 5px;">🏢 Company</div>
                <div style="color: var(--hermes-text);">${client.company || 'Not provided'}</div>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid var(--hermes-border);">
                <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">
                  Added: ${new Date(client.created).toLocaleDateString()}
                </div>
                <div style="
                  padding: 2px 8px;
                  background: var(--hermes-success-text);
                  color: white;
                  border-radius: 12px;
                  font-size: 0.7em;
                  text-transform: uppercase;
                ">Active</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  generateExpenseTrackerView() {
    const totalExpenses = this.timeEntries.reduce((sum, entry) => sum + (entry.expense || 0), 0);
    const thisMonthExpenses = this.timeEntries
      .filter(entry => new Date(entry.date).getMonth() === new Date().getMonth())
      .reduce((sum, entry) => sum + (entry.expense || 0), 0);

    return `
      <div class="expense-tracker-view">
        <h3 style="margin: 0 0 20px 0; color: var(--hermes-text);">💰 Expense Tracker</h3>
        
        <!-- Quick Stats -->
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        ">
          <div style="
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          ">
            <div style="font-size: 2em; color: var(--hermes-error-text);">💸</div>
            <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-text); margin: 10px 0;">
              $${totalExpenses.toFixed(2)}
            </div>
            <div style="color: var(--hermes-disabled-text);">Total Expenses</div>
          </div>
          
          <div style="
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          ">
            <div style="font-size: 2em; color: var(--hermes-warning-text);">📅</div>
            <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-text); margin: 10px 0;">
              $${thisMonthExpenses.toFixed(2)}
            </div>
            <div style="color: var(--hermes-disabled-text);">This Month</div>
          </div>
        </div>

        <div style="text-align: center; padding: 60px 20px; color: var(--hermes-disabled-text);">
          <div style="font-size: 4em; margin-bottom: 20px;">🚧</div>
          <h3 style="color: var(--hermes-text); margin-bottom: 10px;">Expense Tracker Coming Soon</h3>
          <p style="margin-bottom: 20px;">Full expense tracking with receipts, categories, and reporting.</p>
        </div>
      </div>
    `;
  },

  bindTimeTrackerEvents() {
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    const stopBtn = document.getElementById('stop-timer');
    const taskInput = document.getElementById('timer-task');

    if (startBtn) {
      startBtn.addEventListener('click', () => this.startTimer());
    }
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pauseTimer());
    }
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stopTimer());
    }
  },

  bindInvoiceEvents() {
    const form = document.getElementById('invoice-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveInvoice();
      });
    }
  },

  bindClientEvents() {
    // Client events are bound inline in the HTML
  },

  bindExpenseEvents() {
    // Expense events will be implemented when the feature is complete
  },

  startTimer() {
    const taskInput = document.getElementById('timer-task');
    if (!taskInput.value.trim()) {
      alert('Please enter a task description');
      return;
    }

    this.currentTimer = {
      task: taskInput.value.trim(),
      startTime: new Date(),
      elapsed: 0
    };

    this.timerInterval = setInterval(() => {
      this.updateTimerDisplay();
    }, 1000);

    // Update button states
    document.getElementById('start-timer').disabled = true;
    document.getElementById('pause-timer').disabled = false;
    document.getElementById('stop-timer').disabled = false;
  },

  pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Update button states
    document.getElementById('start-timer').disabled = false;
    document.getElementById('pause-timer').disabled = true;
  },

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (this.currentTimer) {
      const duration = Math.floor((new Date() - this.currentTimer.startTime) / 1000 / 60); // minutes
      
      const timeEntry = {
        id: crypto.randomUUID(),
        task: this.currentTimer.task,
        date: new Date().toISOString(),
        startTime: this.currentTimer.startTime.toLocaleTimeString(),
        endTime: new Date().toLocaleTimeString(),
        duration: duration,
        client: null
      };

      this.timeEntries.push(timeEntry);
      this.saveTimeEntries();
      
      // Reset timer
      this.currentTimer = null;
      document.getElementById('timer-display').textContent = '00:00:00';
      document.getElementById('timer-task').value = '';
    }

    // Update button states
    document.getElementById('start-timer').disabled = false;
    document.getElementById('pause-timer').disabled = true;
    document.getElementById('stop-timer').disabled = true;

    // Refresh the view to show new entry
    this.switchBusinessTab('time-tracker');
  },

  updateTimerDisplay() {
    if (!this.currentTimer) return;

    const elapsed = Math.floor((new Date() - this.currentTimer.startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer-display').textContent = display;
  },

  addNewClient() {
    const name = prompt('Client name:');
    if (!name) return;

    const email = prompt('Email (optional):') || '';
    const phone = prompt('Phone (optional):') || '';
    const company = prompt('Company (optional):') || '';

    const client = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim(),
      created: new Date().toISOString()
    };

    this.clients.push(client);
    this.saveClients();
    this.switchBusinessTab('client-manager');
  },

  deleteClient(clientId) {
    if (confirm('Are you sure you want to delete this client?')) {
      this.clients = this.clients.filter(c => c.id !== clientId);
      this.saveClients();
      this.switchBusinessTab('client-manager');
    }
  },

  saveTimeEntries() {
    localStorage.setItem('nextnote_time_entries', JSON.stringify(this.timeEntries));
  },

  saveClients() {
    localStorage.setItem('nextnote_clients', JSON.stringify(this.clients));
  },

  saveInvoices() {
    localStorage.setItem('nextnote_invoices', JSON.stringify(this.invoices));
  },

  initializeBusinessComponents(app) {
    // Initialize business components
  },

  bindBusinessEvents(app) {
    // Listen for business events
    app.on('clientUpdated', () => {
      this.saveClients();
    });
  }
});
