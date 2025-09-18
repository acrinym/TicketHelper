/**
 * NextNote Project Manager Plugin
 * Comprehensive project management system with Kanban boards, Gantt charts, and team collaboration
 * Open-source alternative to Microsoft Project, Asana, and Trello
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Project Manager',
  version: '1.0.0',
  description: 'Complete project management with Kanban boards, Gantt charts, and team collaboration',
  
  onLoad(app) {
    this.projects = JSON.parse(localStorage.getItem('nextnote_projects') || '[]');
    this.setupProjectUI(app);
    this.initializeProjectComponents(app);
    this.bindProjectEvents(app);
  },

  setupProjectUI(app) {
    const panel = app.createPanel('project-manager', 'Project Manager');
    
    // Project Manager header
    const header = document.createElement('div');
    header.className = 'project-header';
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: var(--hermes-panel-bg);
      border-radius: 8px;
      border: 1px solid var(--hermes-border);
    `;

    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0; color: var(--hermes-text);';
    title.textContent = '📊 Project Dashboard';

    const newProjectBtn = document.createElement('button');
    newProjectBtn.className = 'new-project-btn';
    newProjectBtn.style.cssText = `
      padding: 8px 16px;
      background: var(--hermes-highlight-bg);
      color: var(--hermes-highlight-text);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
    `;
    newProjectBtn.textContent = '+ New Project';
    newProjectBtn.addEventListener('click', () => this.showNewProjectDialog(app));

    header.appendChild(title);
    header.appendChild(newProjectBtn);
    panel.appendChild(header);

    // Project views tabs
    const viewTabs = document.createElement('div');
    viewTabs.className = 'project-view-tabs';
    viewTabs.style.cssText = `
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--hermes-border);
    `;

    const views = [
      { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
      { id: 'kanban', label: '📋 Kanban', icon: '📋' },
      { id: 'gantt', label: '📅 Timeline', icon: '📅' },
      { id: 'calendar', label: '🗓️ Calendar', icon: '🗓️' },
      { id: 'reports', label: '📈 Reports', icon: '📈' }
    ];

    views.forEach((view, index) => {
      const tab = document.createElement('button');
      tab.className = `project-tab ${index === 0 ? 'active' : ''}`;
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
      tab.addEventListener('click', () => this.switchProjectView(view.id, app));
      viewTabs.appendChild(tab);
    });

    panel.appendChild(viewTabs);

    // Project content area
    const contentArea = document.createElement('div');
    contentArea.id = 'project-content-area';
    contentArea.style.cssText = 'min-height: 400px;';
    panel.appendChild(contentArea);

    // Initialize with dashboard view
    this.switchProjectView('dashboard', app);
  },

  showNewProjectDialog(app) {
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
      <h2 style="margin: 0 0 20px 0; color: var(--hermes-text);">Create New Project</h2>
      <form id="new-project-form">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Project Name</label>
          <input type="text" id="project-name" required style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Description</label>
          <textarea id="project-description" rows="3" style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text); resize: vertical;"></textarea>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Project Type</label>
          <select id="project-type" style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
            <option value="software">Software Development</option>
            <option value="marketing">Marketing Campaign</option>
            <option value="research">Research Project</option>
            <option value="event">Event Planning</option>
            <option value="general">General Project</option>
          </select>
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--hermes-text);">Due Date</label>
          <input type="date" id="project-due-date" style="width: 100%; padding: 10px; border: 1px solid var(--hermes-border); border-radius: 4px; background: var(--hermes-input-bg); color: var(--hermes-text);">
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" id="cancel-project" style="padding: 10px 20px; border: 1px solid var(--hermes-border); border-radius: 6px; background: var(--hermes-button-bg); color: var(--hermes-text); cursor: pointer;">Cancel</button>
          <button type="submit" style="padding: 10px 20px; border: none; border-radius: 6px; background: var(--hermes-highlight-bg); color: var(--hermes-highlight-text); cursor: pointer;">Create Project</button>
        </div>
      </form>
    `;

    dialog.querySelector('#cancel-project').addEventListener('click', () => overlay.remove());
    dialog.querySelector('#new-project-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.createProject({
        name: dialog.querySelector('#project-name').value,
        description: dialog.querySelector('#project-description').value,
        type: dialog.querySelector('#project-type').value,
        dueDate: dialog.querySelector('#project-due-date').value
      }, app);
      overlay.remove();
    });

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  },

  createProject(projectData, app) {
    const project = {
      id: crypto.randomUUID(),
      name: projectData.name,
      description: projectData.description,
      type: projectData.type,
      dueDate: projectData.dueDate,
      status: 'active',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      tasks: this.getDefaultTasks(projectData.type),
      team: [],
      progress: 0
    };

    this.projects.push(project);
    this.saveProjects();
    this.switchProjectView('dashboard', app);
    app.showToast(`Project "${project.name}" created successfully!`, 'success');
  },

  getDefaultTasks(projectType) {
    const taskTemplates = {
      software: [
        { name: 'Requirements Analysis', status: 'todo', priority: 'high' },
        { name: 'System Design', status: 'todo', priority: 'high' },
        { name: 'Development Setup', status: 'todo', priority: 'medium' },
        { name: 'Core Development', status: 'todo', priority: 'high' },
        { name: 'Testing', status: 'todo', priority: 'high' },
        { name: 'Documentation', status: 'todo', priority: 'medium' },
        { name: 'Deployment', status: 'todo', priority: 'high' }
      ],
      marketing: [
        { name: 'Market Research', status: 'todo', priority: 'high' },
        { name: 'Target Audience Analysis', status: 'todo', priority: 'high' },
        { name: 'Campaign Strategy', status: 'todo', priority: 'high' },
        { name: 'Content Creation', status: 'todo', priority: 'medium' },
        { name: 'Channel Setup', status: 'todo', priority: 'medium' },
        { name: 'Campaign Launch', status: 'todo', priority: 'high' },
        { name: 'Performance Analysis', status: 'todo', priority: 'medium' }
      ],
      research: [
        { name: 'Literature Review', status: 'todo', priority: 'high' },
        { name: 'Methodology Design', status: 'todo', priority: 'high' },
        { name: 'Data Collection', status: 'todo', priority: 'high' },
        { name: 'Data Analysis', status: 'todo', priority: 'high' },
        { name: 'Results Interpretation', status: 'todo', priority: 'medium' },
        { name: 'Report Writing', status: 'todo', priority: 'high' },
        { name: 'Peer Review', status: 'todo', priority: 'medium' }
      ],
      event: [
        { name: 'Event Planning', status: 'todo', priority: 'high' },
        { name: 'Venue Booking', status: 'todo', priority: 'high' },
        { name: 'Vendor Coordination', status: 'todo', priority: 'medium' },
        { name: 'Marketing & Promotion', status: 'todo', priority: 'medium' },
        { name: 'Registration Setup', status: 'todo', priority: 'medium' },
        { name: 'Event Execution', status: 'todo', priority: 'high' },
        { name: 'Post-Event Follow-up', status: 'todo', priority: 'low' }
      ],
      general: [
        { name: 'Project Initiation', status: 'todo', priority: 'high' },
        { name: 'Planning Phase', status: 'todo', priority: 'high' },
        { name: 'Execution Phase', status: 'todo', priority: 'high' },
        { name: 'Monitoring & Control', status: 'todo', priority: 'medium' },
        { name: 'Project Closure', status: 'todo', priority: 'medium' }
      ]
    };

    return (taskTemplates[projectType] || taskTemplates.general).map(task => ({
      id: crypto.randomUUID(),
      ...task,
      created: new Date().toISOString(),
      assignee: null,
      dueDate: null,
      description: '',
      comments: []
    }));
  },

  switchProjectView(viewId, app) {
    // Update tab styles
    document.querySelectorAll('.project-tab').forEach(tab => {
      tab.style.background = 'transparent';
      tab.style.color = 'var(--hermes-text)';
      tab.style.borderBottomColor = 'transparent';
      tab.classList.remove('active');
    });

    const activeTab = document.querySelector(`.project-tab:nth-child(${['dashboard', 'kanban', 'gantt', 'calendar', 'reports'].indexOf(viewId) + 1})`);
    if (activeTab) {
      activeTab.style.background = 'var(--hermes-highlight-bg)';
      activeTab.style.color = 'var(--hermes-highlight-text)';
      activeTab.style.borderBottomColor = 'var(--hermes-highlight-bg)';
      activeTab.classList.add('active');
    }

    // Update content area
    const contentArea = document.getElementById('project-content-area');
    if (!contentArea) return;

    switch (viewId) {
      case 'dashboard':
        contentArea.innerHTML = this.generateDashboardView();
        break;
      case 'kanban':
        contentArea.innerHTML = this.generateKanbanView();
        this.initializeKanbanDragDrop();
        break;
      case 'gantt':
        contentArea.innerHTML = this.generateGanttView();
        break;
      case 'calendar':
        contentArea.innerHTML = this.generateCalendarView();
        break;
      case 'reports':
        contentArea.innerHTML = this.generateReportsView();
        break;
    }
  },

  generateDashboardView() {
    const activeProjects = this.projects.filter(p => p.status === 'active');
    const completedProjects = this.projects.filter(p => p.status === 'completed');
    
    let html = '<div class="project-dashboard">';
    
    // Statistics cards
    html += `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div style="padding: 20px; background: var(--hermes-panel-bg); border: 1px solid var(--hermes-border); border-radius: 8px; text-align: center;">
          <div style="font-size: 2em; color: var(--hermes-highlight-bg); margin-bottom: 10px;">📊</div>
          <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-text);">${this.projects.length}</div>
          <div style="color: var(--hermes-disabled-text);">Total Projects</div>
        </div>
        <div style="padding: 20px; background: var(--hermes-panel-bg); border: 1px solid var(--hermes-border); border-radius: 8px; text-align: center;">
          <div style="font-size: 2em; color: var(--hermes-success-text); margin-bottom: 10px;">🚀</div>
          <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-text);">${activeProjects.length}</div>
          <div style="color: var(--hermes-disabled-text);">Active Projects</div>
        </div>
        <div style="padding: 20px; background: var(--hermes-panel-bg); border: 1px solid var(--hermes-border); border-radius: 8px; text-align: center;">
          <div style="font-size: 2em; color: var(--hermes-info-text); margin-bottom: 10px;">✅</div>
          <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-text);">${completedProjects.length}</div>
          <div style="color: var(--hermes-disabled-text);">Completed</div>
        </div>
        <div style="padding: 20px; background: var(--hermes-panel-bg); border: 1px solid var(--hermes-border); border-radius: 8px; text-align: center;">
          <div style="font-size: 2em; color: var(--hermes-warning-text); margin-bottom: 10px;">⏰</div>
          <div style="font-size: 1.5em; font-weight: bold; color: var(--hermes-text);">${this.getOverdueTasks()}</div>
          <div style="color: var(--hermes-disabled-text);">Overdue Tasks</div>
        </div>
      </div>
    `;

    // Recent projects
    html += '<h3 style="color: var(--hermes-text); margin-bottom: 15px;">📋 Recent Projects</h3>';
    
    if (this.projects.length === 0) {
      html += '<p style="color: var(--hermes-disabled-text); font-style: italic; text-align: center; padding: 40px;">No projects yet. Create your first project to get started!</p>';
    } else {
      html += '<div style="display: grid; gap: 15px;">';
      this.projects.slice(0, 5).forEach(project => {
        const progress = this.calculateProjectProgress(project);
        html += `
          <div style="padding: 20px; background: var(--hermes-panel-bg); border: 1px solid var(--hermes-border); border-radius: 8px; cursor: pointer;" onclick="this.style.background='var(--hermes-button-hover)'">
            <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 10px;">
              <div style="flex: 1;">
                <h4 style="margin: 0 0 5px 0; color: var(--hermes-text);">${project.name}</h4>
                <p style="margin: 0; color: var(--hermes-disabled-text); font-size: 0.9em;">${project.description || 'No description'}</p>
              </div>
              <span style="padding: 4px 8px; background: var(--hermes-highlight-bg); color: var(--hermes-highlight-text); border-radius: 12px; font-size: 0.8em; margin-left: 10px;">${project.type}</span>
            </div>
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: var(--hermes-text); font-size: 0.9em;">Progress</span>
                <span style="color: var(--hermes-text); font-size: 0.9em;">${progress}%</span>
              </div>
              <div style="width: 100%; height: 8px; background: var(--hermes-border); border-radius: 4px; overflow: hidden;">
                <div style="width: ${progress}%; height: 100%; background: var(--hermes-success-text); transition: width 0.3s;"></div>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8em; color: var(--hermes-disabled-text);">
              <span>Created: ${new Date(project.created).toLocaleDateString()}</span>
              ${project.dueDate ? `<span>Due: ${new Date(project.dueDate).toLocaleDateString()}</span>` : ''}
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  generateKanbanView() {
    let html = '<div class="kanban-board" style="display: flex; gap: 20px; overflow-x: auto; padding: 10px;">';
    
    const columns = [
      { id: 'todo', title: 'To Do', color: '#e74c3c' },
      { id: 'in-progress', title: 'In Progress', color: '#f39c12' },
      { id: 'review', title: 'Review', color: '#3498db' },
      { id: 'done', title: 'Done', color: '#27ae60' }
    ];

    columns.forEach(column => {
      html += `
        <div class="kanban-column" style="
          min-width: 300px;
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 15px;
        ">
          <h4 style="
            margin: 0 0 15px 0;
            color: var(--hermes-text);
            display: flex;
            align-items: center;
            gap: 10px;
          ">
            <div style="width: 12px; height: 12px; background: ${column.color}; border-radius: 50%;"></div>
            ${column.title}
            <span style="
              background: var(--hermes-border);
              color: var(--hermes-text);
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 0.8em;
              margin-left: auto;
            ">${this.getTasksByStatus(column.id).length}</span>
          </h4>
          <div class="kanban-tasks" data-status="${column.id}" style="min-height: 200px;">
            ${this.getTasksByStatus(column.id).map(task => this.generateTaskCard(task)).join('')}
          </div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  },

  generateTaskCard(task) {
    const priorityColors = {
      high: '#e74c3c',
      medium: '#f39c12',
      low: '#27ae60'
    };

    return `
      <div class="task-card" draggable="true" data-task-id="${task.id}" style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 10px;
        cursor: move;
        transition: all 0.2s;
      ">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <h5 style="margin: 0; color: var(--hermes-text); font-size: 0.9em;">${task.name}</h5>
          <span style="
            width: 8px;
            height: 8px;
            background: ${priorityColors[task.priority]};
            border-radius: 50%;
            margin-left: 8px;
            flex-shrink: 0;
          "></span>
        </div>
        ${task.description ? `<p style="margin: 0 0 8px 0; color: var(--hermes-disabled-text); font-size: 0.8em;">${task.description}</p>` : ''}
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.7em; color: var(--hermes-disabled-text);">
          <span>${task.priority} priority</span>
          ${task.dueDate ? `<span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
        </div>
      </div>
    `;
  },

  generateGanttView() {
    return `
      <div class="gantt-chart">
        <h3 style="color: var(--hermes-text); margin-bottom: 20px;">📅 Project Timeline</h3>
        <div style="background: var(--hermes-panel-bg); border: 1px solid var(--hermes-border); border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 3em; margin-bottom: 20px;">🚧</div>
          <h4 style="color: var(--hermes-text); margin-bottom: 10px;">Gantt Chart Coming Soon</h4>
          <p style="color: var(--hermes-disabled-text);">Interactive timeline view with task dependencies and resource allocation.</p>
        </div>
      </div>
    `;
  },

  generateCalendarView() {
    return `
      <div class="project-calendar">
        <h3 style="color: var(--hermes-text); margin-bottom: 20px;">🗓️ Project Calendar</h3>
        <div style="background: var(--hermes-panel-bg); border: 1px solid var(--hermes-border); border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 3em; margin-bottom: 20px;">📅</div>
          <h4 style="color: var(--hermes-text); margin-bottom: 10px;">Calendar View Coming Soon</h4>
          <p style="color: var(--hermes-disabled-text);">Calendar integration with task deadlines and milestone tracking.</p>
        </div>
      </div>
    `;
  },

  generateReportsView() {
    return `
      <div class="project-reports">
        <h3 style="color: var(--hermes-text); margin-bottom: 20px;">📈 Project Reports</h3>
        <div style="background: var(--hermes-panel-bg); border: 1px solid var(--hermes-border); border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 3em; margin-bottom: 20px;">📊</div>
          <h4 style="color: var(--hermes-text); margin-bottom: 10px;">Advanced Reports Coming Soon</h4>
          <p style="color: var(--hermes-disabled-text);">Detailed analytics, progress reports, and team performance metrics.</p>
        </div>
      </div>
    `;
  },

  getTasksByStatus(status) {
    const allTasks = [];
    this.projects.forEach(project => {
      project.tasks.forEach(task => {
        if (task.status === status || (status === 'todo' && task.status === 'todo')) {
          allTasks.push({ ...task, projectName: project.name });
        }
      });
    });
    return allTasks;
  },

  calculateProjectProgress(project) {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  },

  getOverdueTasks() {
    let overdueCount = 0;
    const today = new Date();
    this.projects.forEach(project => {
      project.tasks.forEach(task => {
        if (task.dueDate && new Date(task.dueDate) < today && task.status !== 'done') {
          overdueCount++;
        }
      });
    });
    return overdueCount;
  },

  initializeKanbanDragDrop() {
    // Add drag and drop functionality for Kanban board
    const taskCards = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.kanban-tasks');

    taskCards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.dataset.taskId);
        card.style.opacity = '0.5';
      });

      card.addEventListener('dragend', () => {
        card.style.opacity = '1';
      });
    });

    columns.forEach(column => {
      column.addEventListener('dragover', (e) => {
        e.preventDefault();
        column.style.background = 'var(--hermes-button-hover)';
      });

      column.addEventListener('dragleave', () => {
        column.style.background = 'transparent';
      });

      column.addEventListener('drop', (e) => {
        e.preventDefault();
        column.style.background = 'transparent';
        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = column.dataset.status;
        this.updateTaskStatus(taskId, newStatus);
      });
    });
  },

  updateTaskStatus(taskId, newStatus) {
    this.projects.forEach(project => {
      project.tasks.forEach(task => {
        if (task.id === taskId) {
          task.status = newStatus;
          task.modified = new Date().toISOString();
        }
      });
    });
    this.saveProjects();
    this.switchProjectView('kanban', { showToast: () => {} }); // Refresh view
  },

  saveProjects() {
    localStorage.setItem('nextnote_projects', JSON.stringify(this.projects));
  },

  initializeProjectComponents(app) {
    // Initialize any additional components
  },

  bindProjectEvents(app) {
    // Listen for project-related events
    app.on('projectUpdated', (data) => {
      this.saveProjects();
    });
  }
});
