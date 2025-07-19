// plugins/plugin-fissio-library.js

window.registerNextNotePlugin({
  name: "FissioLibrary",
  onLoad: function(app) {
          // Fissio Library specific styling
      const fissioStyle = document.createElement("style");
      fissioStyle.textContent = `
        .fissio-library {
          --fissio-primary: #6366f1;
          --fissio-secondary: #4f46e5;
          --fissio-accent: #ef4444;
          --fissio-success: #10b981;
          --fissio-warning: #f59e0b;
          --fissio-light: #f8fafc;
          --fissio-dark: #1e293b;
        }
        
        .fissio-library-panel {
          background: white;
          border: 2px solid var(--fissio-primary);
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .fissio-category {
          margin-bottom: 20px;
        }
        
        .fissio-category h3 {
          color: var(--fissio-primary);
          border-bottom: 1px solid var(--fissio-primary);
          padding-bottom: 5px;
          margin-bottom: 10px;
        }
        
        .fissio-template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        
        .fissio-template-item {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.2s;
          background: #f8f9fa;
        }
        
        .fissio-template-item:hover {
          border-color: var(--fissio-primary);
          background: #eef2ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .fissio-template-icon {
          font-size: 24px;
          margin-bottom: 5px;
        }
        
        .fissio-template-name {
          font-weight: 500;
          margin-bottom: 3px;
          color: var(--fissio-dark);
        }
        
        .fissio-template-desc {
          font-size: 11px;
          color: #666;
        }
        
        .fissio-library-toggle {
          position: fixed;
          top: 260px;
          right: 20px;
          z-index: 1000;
          background: var(--fissio-primary);
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(fissioStyle);

    // Comprehensive Fissio Template Library
    const fissioTemplates = {
      'Business': {
        'Organization Chart': {
          icon: '👥',
          description: 'Company hierarchy and reporting structure',
          template: createOrgChartTemplate()
        },
        'Process Flow': {
          icon: '🔄',
          description: 'Business process workflows',
          template: createProcessFlowTemplate()
        },
        'Swimlane Diagram': {
          icon: '🏊',
          description: 'Cross-functional process flows',
          template: createSwimlaneTemplate()
        },
        'Value Stream Map': {
          icon: '📈',
          description: 'Lean manufacturing process analysis',
          template: createValueStreamTemplate()
        },
        'Business Model Canvas': {
          icon: '💼',
          description: 'Strategic business planning',
          template: createBusinessModelTemplate()
        },
        'Gantt Chart': {
          icon: '📅',
          description: 'Project timeline and scheduling',
          template: createGanttChartTemplate()
        },
        'PERT Chart': {
          icon: '🎯',
          description: 'Project evaluation and review technique',
          template: createPertChartTemplate()
        },
        'Decision Tree': {
          icon: '🌳',
          description: 'Decision-making flowcharts',
          template: createDecisionTreeTemplate()
        }
      },
      'IT & Network': {
        'Network Diagram': {
          icon: '🌐',
          description: 'Computer network architecture',
          template: createNetworkDiagramTemplate()
        },
        'Server Rack': {
          icon: '🖥️',
          description: 'Data center equipment layout',
          template: createServerRackTemplate()
        },
        'Database Schema': {
          icon: '🗄️',
          description: 'Database structure and relationships',
          template: createDatabaseSchemaTemplate()
        },
        'UML Class Diagram': {
          icon: '🏗️',
          description: 'Object-oriented software design',
          template: createUmlClassTemplate()
        },
        'UML Sequence Diagram': {
          icon: '⏱️',
          description: 'System interaction flows',
          template: createUmlSequenceTemplate()
        },
        'UML Use Case': {
          icon: '🎭',
          description: 'System requirements and actors',
          template: createUmlUseCaseTemplate()
        },
        'Network Topology': {
          icon: '🔗',
          description: 'Network connection layout',
          template: createNetworkTopologyTemplate()
        },
        'Cloud Architecture': {
          icon: '☁️',
          description: 'Cloud infrastructure design',
          template: createCloudArchitectureTemplate()
        }
      },
      'Engineering': {
        'Electrical Circuit': {
          icon: '⚡',
          description: 'Electronic circuit diagrams',
          template: createElectricalCircuitTemplate()
        },
        'Mechanical Assembly': {
          icon: '⚙️',
          description: 'Mechanical part relationships',
          template: createMechanicalAssemblyTemplate()
        },
        'Piping & Instrumentation': {
          icon: '🔧',
          description: 'Industrial process diagrams',
          template: createPipingTemplate()
        },
        'Floor Plan': {
          icon: '🏢',
          description: 'Building layout and design',
          template: createFloorPlanTemplate()
        },
        'Site Plan': {
          icon: '🗺️',
          description: 'Property and landscape layout',
          template: createSitePlanTemplate()
        },
        'HVAC System': {
          icon: '❄️',
          description: 'Heating, ventilation, and air conditioning',
          template: createHvacTemplate()
        },
        'Plumbing Diagram': {
          icon: '🚰',
          description: 'Water and waste systems',
          template: createPlumbingTemplate()
        },
        'Electrical Plan': {
          icon: '💡',
          description: 'Building electrical systems',
          template: createElectricalPlanTemplate()
        }
      },
      'Software & Development': {
        'Software Architecture': {
          icon: '🏛️',
          description: 'System architecture design',
          template: createSoftwareArchitectureTemplate()
        },
        'API Design': {
          icon: '🔌',
          description: 'Application programming interface',
          template: createApiDesignTemplate()
        },
        'Microservices': {
          icon: '🔗',
          description: 'Distributed system architecture',
          template: createMicroservicesTemplate()
        },
        'Data Flow': {
          icon: '📊',
          description: 'Data processing workflows',
          template: createDataFlowTemplate()
        },
        'Entity Relationship': {
          icon: '📋',
          description: 'Database entity relationships',
          template: createEntityRelationshipTemplate()
        },
        'State Machine': {
          icon: '🔄',
          description: 'System state transitions',
          template: createStateMachineTemplate()
        },
        'Component Diagram': {
          icon: '🧩',
          description: 'Software component relationships',
          template: createComponentDiagramTemplate()
        },
        'Deployment Diagram': {
          icon: '🚀',
          description: 'System deployment architecture',
          template: createDeploymentDiagramTemplate()
        }
      },
      'Project Management': {
        'Project Timeline': {
          icon: '⏰',
          description: 'Project schedule visualization',
          template: createProjectTimelineTemplate()
        },
        'Resource Allocation': {
          icon: '👥',
          description: 'Team and resource planning',
          template: createResourceAllocationTemplate()
        },
        'Risk Matrix': {
          icon: '⚠️',
          description: 'Project risk assessment',
          template: createRiskMatrixTemplate()
        },
        'Stakeholder Map': {
          icon: '🎯',
          description: 'Stakeholder influence and interest',
          template: createStakeholderMapTemplate()
        },
        'Work Breakdown Structure': {
          icon: '📋',
          description: 'Project task hierarchy',
          template: createWorkBreakdownTemplate()
        },
        'Kanban Board': {
          icon: '📋',
          description: 'Agile workflow management',
          template: createKanbanBoardTemplate()
        },
        'Scrum Board': {
          icon: '🏃',
          description: 'Scrum sprint planning',
          template: createScrumBoardTemplate()
        },
        'Project Dashboard': {
          icon: '📊',
          description: 'Project metrics and KPIs',
          template: createProjectDashboardTemplate()
        }
      },
      'Marketing & Sales': {
        'Customer Journey': {
          icon: '🛤️',
          description: 'Customer experience mapping',
          template: createCustomerJourneyTemplate()
        },
        'Sales Funnel': {
          icon: '🫙',
          description: 'Lead conversion process',
          template: createSalesFunnelTemplate()
        },
        'Marketing Campaign': {
          icon: '📢',
          description: 'Marketing strategy planning',
          template: createMarketingCampaignTemplate()
        },
        'Competitive Analysis': {
          icon: '⚔️',
          description: 'Market competition mapping',
          template: createCompetitiveAnalysisTemplate()
        },
        'SWOT Analysis': {
          icon: '📊',
          description: 'Strengths, weaknesses, opportunities, threats',
          template: createSwotAnalysisTemplate()
        },
        'Brand Architecture': {
          icon: '🏛️',
          description: 'Brand hierarchy and relationships',
          template: createBrandArchitectureTemplate()
        },
        'Content Strategy': {
          icon: '📝',
          description: 'Content planning and workflow',
          template: createContentStrategyTemplate()
        },
        'Social Media Strategy': {
          icon: '📱',
          description: 'Social media planning',
          template: createSocialMediaStrategyTemplate()
        }
      }
    };

    // Create Fissio Library toggle button
    const fissioToggle = document.createElement('button');
    fissioToggle.className = 'fissio-library-toggle';
    fissioToggle.textContent = '📐 Fissio Library';
    fissioToggle.onclick = toggleFissioLibrary;
    document.body.appendChild(fissioToggle);

    function toggleFissioLibrary() {
      const existing = document.querySelector('.fissio-library-panel');
      if (existing) {
        existing.remove();
        return;
      }
      
      showFissioLibrary();
    }

    function showFissioLibrary() {
      const panel = document.createElement('div');
      panel.className = 'fissio-library-panel';
      
      let html = '<h2 style="margin-top: 0; color: var(--fissio-primary);">📐 Fissio Professional Diagram Library</h2>';
      html += '<p style="margin-bottom: 20px; color: #666;">50+ Professional diagram templates, completely free and open source!</p>';
      
      Object.keys(fissioTemplates).forEach(category => {
        html += `
          <div class="fissio-category">
            <h3>${category}</h3>
            <div class="fissio-template-grid">
        `;
        
        Object.keys(fissioTemplates[category]).forEach(templateName => {
          const template = fissioTemplates[category][templateName];
          html += `
            <div class="fissio-template-item" onclick="createFissioTemplate('${category}', '${templateName}')">
              <div class="fissio-template-icon">${template.icon}</div>
              <div class="fissio-template-name">${templateName}</div>
              <div class="fissio-template-desc">${template.description}</div>
            </div>
          `;
        });
        
        html += '</div></div>';
      });
      
      panel.innerHTML = html;
      
      // Insert after toolbar
      const toolbar = document.getElementById('toolbar');
      toolbar.parentNode.insertBefore(panel, toolbar.nextSibling);
    }

    function createFissioTemplate(category, templateName) {
      const template = fissioTemplates[category][templateName];
      if (!template || !template.template) return;
      
      if (currentSection) {
        const newPage = {
          id: crypto.randomUUID(),
          title: templateName,
          content: template.template,
          tags: ['fissio', 'diagram', category.toLowerCase(), templateName.toLowerCase()],
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        };
        
        currentSection.pages.push(newPage);
        saveData();
        renderSections();
        selectPage(currentSection.id, newPage.id);
        
        // Switch to diagram mode
        if (window.toggleDiagramMode) {
          window.toggleDiagramMode();
        }
        
        alert(`✅ ${templateName} template created! Switch to Diagram Builder mode to start creating.`);
      }
    }

    // Template creation functions
    function createOrgChartTemplate() {
      return `# 👥 Organization Chart Template

## 🏢 Company Structure
**Company**: [Company Name]
**Department**: [Department Name]
**Last Updated**: ${new Date().toLocaleDateString()}

## 📊 Organizational Hierarchy

### Level 1: Executive Leadership
- **CEO/President**: [Name]
  - **Reports to**: Board of Directors
  - **Direct Reports**: [Number]
  - **Responsibilities**: [List key responsibilities]

### Level 2: Senior Management
- **CTO**: [Name]
  - **Reports to**: CEO
  - **Direct Reports**: [List direct reports]
  - **Responsibilities**: [Technology strategy, etc.]

- **CFO**: [Name]
  - **Reports to**: CEO
  - **Direct Reports**: [List direct reports]
  - **Responsibilities**: [Financial management, etc.]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⬜ **Rectangles**: Positions/Roles
- ➡️ **Arrows**: Reporting relationships
- 📝 **Text Boxes**: Additional information

## 📋 Position Details
For each position, include:
- **Title**: [Job title]
- **Name**: [Employee name]
- **Department**: [Department name]
- **Reports to**: [Manager name]
- **Direct Reports**: [Number or list]
- **Key Responsibilities**: [List main duties]`;
    }

    function createProcessFlowTemplate() {
      return `# 🔄 Process Flow Template

## 🎯 Process Overview
**Process Name**: [Enter process name]
**Owner**: [Process owner]
**Version**: 1.0
**Last Updated**: ${new Date().toLocaleDateString()}

## 📋 Process Steps

### 1. Start Point
- **Shape**: Circle (Start/End)
- **Description**: Process begins here
- **Responsible**: [Role/Person]
- **Output**: [What is produced]

### 2. Input Validation
- **Shape**: Diamond (Decision)
- **Description**: Validate input data
- **Decision Points**:
  - ✅ Valid → Continue to next step
  - ❌ Invalid → Return to input

### 3. Data Processing
- **Shape**: Rectangle (Process)
- **Description**: Process the validated data
- **Activities**:
  - [Activity 1]
  - [Activity 2]
  - [Activity 3]

## 🔗 Process Connections
- Start → Input Validation
- Input Validation (Valid) → Data Processing
- Input Validation (Invalid) → Start
- Data Processing → Quality Check

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⭕ **Circles**: Start/End points
- 💎 **Diamonds**: Decision points
- ⬜ **Rectangles**: Process steps
- ➡️ **Arrows**: Flow direction`;
    }

    function createNetworkDiagramTemplate() {
      return `# 🌐 Network Diagram Template

## 🏗️ Network Overview
**Network Name**: [Network identifier]
**Type**: [LAN/WAN/VPN/Cloud]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🔧 Network Components

### Core Infrastructure
- **Router**: [Model/Name]
  - **IP Address**: [IP address]
  - **Location**: [Physical location]
  - **Function**: [Primary routing, etc.]

- **Switch**: [Model/Name]
  - **Ports**: [Number of ports]
  - **Location**: [Physical location]
  - **Function**: [Local switching, etc.]

### Servers
- **Web Server**: [Server name]
  - **IP**: [IP address]
  - **OS**: [Operating system]
  - **Services**: [Web hosting, etc.]

- **Database Server**: [Server name]
  - **IP**: [IP address]
  - **OS**: [Operating system]
  - **Services**: [Database hosting, etc.]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⬜ **Rectangles**: Servers and devices
- ⭕ **Circles**: Network nodes
- ⬡ **Hexagons**: Specialized equipment
- ➡️ **Arrows**: Network connections`;
    }

    function createUmlClassTemplate() {
      return `# 🏗️ UML Class Diagram Template

## 📋 System Overview
**System Name**: [System identifier]
**Version**: [Version number]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🏛️ Class Definitions

### User Class
\`\`\`
+------------------+
|      User        |
+------------------+
| - id: String     |
| - name: String   |
| - email: String  |
| - password: String|
+------------------+
| + login()        |
| + logout()       |
| + updateProfile()|
| + deleteAccount()|
+------------------+
\`\`\`

### Product Class
\`\`\`
+------------------+
|     Product      |
+------------------+
| - id: String     |
| - name: String   |
| - price: Double  |
| - category: String|
+------------------+
| + create()       |
| + update()       |
| + delete()       |
| + getPrice()     |
+------------------+
\`\`\`

## 🔗 Relationships
- **User** → **Order** (1:Many)
- **Order** → **Product** (Many:Many)
- **Product** → **Category** (Many:1)

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⬜ **Rectangles**: Classes
- ➡️ **Arrows**: Relationships
- 📝 **Text Boxes**: Methods and properties`;
    }

    // Add more template functions for other categories...
    function createSwimlaneTemplate() {
      return `# 🏊 Swimlane Diagram Template

## 🎯 Process Overview
**Process Name**: [Process Name]
**Scope**: [Process scope]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🏊‍♂️ Swimlanes

### Customer
- **Start**: Customer submits request
- **Wait**: Customer waits for response
- **Receive**: Customer receives result

### Sales Team
- **Review**: Review customer request
- **Validate**: Validate requirements
- **Quote**: Generate quote

### Development Team
- **Analyze**: Analyze requirements
- **Develop**: Develop solution
- **Test**: Test solution

### QA Team
- **Test**: Quality assurance testing
- **Validate**: Validate solution
- **Approve**: Approve for delivery

## 🔗 Process Flow
Customer → Sales Team → Development Team → QA Team → Customer

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⬜ **Rectangles**: Process steps
- 💎 **Diamonds**: Decision points
- ➡️ **Arrows**: Flow direction
- 📝 **Text Boxes**: Swimlane labels`;
    }

    // Make functions globally available
    window.toggleFissioLibrary = toggleFissioLibrary;
    window.showFissioLibrary = showFissioLibrary;
    window.createFissioTemplate = createFissioTemplate;
  }
}); 