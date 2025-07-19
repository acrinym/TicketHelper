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
        
              /* Floating button removed - functionality integrated into main toolbar */
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
          template: createValueStreamMapTemplate()
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

    // Fissio Library functionality is now integrated into the main toolbar
    // No floating button needed

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

    function createValueStreamMapTemplate() {
      return `# 📈 Value Stream Map Template

## 🎯 Process Overview
**Process Name**: [Process Name]
**Scope**: [Process scope]
**Last Updated**: ${new Date().toLocaleDateString()}

## 📊 Value Stream Components

### Customer Demand
- **Takt Time**: [Customer demand rate]
- **Volume**: [Daily/weekly volume]
- **Variety**: [Product/service variety]

### Process Steps
1. **Step 1**: [Process name]
   - **Cycle Time**: [Time per unit]
   - **Lead Time**: [Total time]
   - **Value Added**: [Yes/No]

2. **Step 2**: [Process name]
   - **Cycle Time**: [Time per unit]
   - **Lead Time**: [Total time]
   - **Value Added**: [Yes/No]

3. **Step 3**: [Process name]
   - **Cycle Time**: [Time per unit]
   - **Lead Time**: [Total time]
   - **Value Added**: [Yes/No]

## 📈 Metrics
- **Total Lead Time**: [Sum of all lead times]
- **Total Cycle Time**: [Sum of cycle times]
- **Value Added Time**: [Sum of value-added time]
- **Efficiency**: [Value added / Total time]

## 🎯 Improvement Opportunities
- **Waste Identification**: [List wastes found]
- **Bottlenecks**: [Identify bottlenecks]
- **Improvement Actions**: [List actions]`;
    }

    function createBusinessModelTemplate() {
      return `# 💼 Business Model Canvas Template

## 🎯 Business Model Overview
**Company**: [Company Name]
**Date**: ${new Date().toLocaleDateString()}

## 🏗️ Business Model Canvas

### Key Partners
- [Partner 1]: [Role and value]
- [Partner 2]: [Role and value]
- [Partner 3]: [Role and value]

### Key Activities
- [Activity 1]: [Description]
- [Activity 2]: [Description]
- [Activity 3]: [Description]

### Key Resources
- **Human**: [Key people/skills]
- **Physical**: [Facilities, equipment]
- **Intellectual**: [IP, patents, data]
- **Financial**: [Funding sources]

### Value Propositions
- [Value 1]: [Customer benefit]
- [Value 2]: [Customer benefit]
- [Value 3]: [Customer benefit]

### Customer Relationships
- **Type**: [Personal, automated, etc.]
- **Channels**: [How you reach customers]
- **Retention**: [How you keep customers]

### Channels
- **Direct**: [Direct sales channels]
- **Indirect**: [Partner channels]
- **Online**: [Digital channels]

### Customer Segments
- **Primary**: [Main customer group]
- **Secondary**: [Secondary customer group]
- **Niche**: [Specialized segments]

### Cost Structure
- **Fixed Costs**: [List fixed costs]
- **Variable Costs**: [List variable costs]
- **Economies of Scale**: [Cost advantages]

### Revenue Streams
- **Stream 1**: [Revenue source]
- **Stream 2**: [Revenue source]
- **Stream 3**: [Revenue source]`;
    }

    function createGanttChartTemplate() {
      return `# 📅 Gantt Chart Template

## 🎯 Project Overview
**Project Name**: [Project Name]
**Start Date**: [Start Date]
**End Date**: [End Date]
**Last Updated**: ${new Date().toLocaleDateString()}

## 📊 Project Timeline

### Phase 1: Planning (Week 1-2)
- **Task 1.1**: [Task description]
  - **Start**: [Date]
  - **End**: [Date]
  - **Duration**: [Days]
  - **Dependencies**: [Prerequisites]

- **Task 1.2**: [Task description]
  - **Start**: [Date]
  - **End**: [Date]
  - **Duration**: [Days]
  - **Dependencies**: [Prerequisites]

### Phase 2: Development (Week 3-6)
- **Task 2.1**: [Task description]
  - **Start**: [Date]
  - **End**: [Date]
  - **Duration**: [Days]
  - **Dependencies**: [Prerequisites]

- **Task 2.2**: [Task description]
  - **Start**: [Date]
  - **End**: [Date]
  - **Duration**: [Days]
  - **Dependencies**: [Prerequisites]

### Phase 3: Testing (Week 7-8)
- **Task 3.1**: [Task description]
  - **Start**: [Date]
  - **End**: [Date]
  - **Duration**: [Days]
  - **Dependencies**: [Prerequisites]

## 👥 Resource Allocation
- **Team Member 1**: [Assigned tasks]
- **Team Member 2**: [Assigned tasks]
- **Team Member 3**: [Assigned tasks]

## 📈 Progress Tracking
- **Completed**: [Number of completed tasks]
- **In Progress**: [Number of active tasks]
- **Pending**: [Number of pending tasks]
- **Delayed**: [Number of delayed tasks]`;
    }

    function createPertChartTemplate() {
      return `# 🎯 PERT Chart Template

## 🎯 Project Overview
**Project Name**: [Project Name]
**Start Date**: [Start Date]
**End Date**: [End Date]
**Last Updated**: ${new Date().toLocaleDateString()}

## 📊 PERT Analysis

### Critical Path Activities
1. **Activity A**: [Description]
   - **Optimistic Time**: [Best case]
   - **Most Likely Time**: [Expected case]
   - **Pessimistic Time**: [Worst case]
   - **Expected Time**: [Calculated]
   - **Variance**: [Calculated]

2. **Activity B**: [Description]
   - **Optimistic Time**: [Best case]
   - **Most Likely Time**: [Expected case]
   - **Pessimistic Time**: [Worst case]
   - **Expected Time**: [Calculated]
   - **Variance**: [Calculated]

3. **Activity C**: [Description]
   - **Optimistic Time**: [Best case]
   - **Most Likely Time**: [Expected case]
   - **Pessimistic Time**: [Worst case]
   - **Expected Time**: [Calculated]
   - **Variance**: [Calculated]

## 📈 Project Metrics
- **Critical Path Duration**: [Total expected time]
- **Project Variance**: [Total variance]
- **Standard Deviation**: [Calculated]
- **Probability of Completion**: [On time probability]

## 🎯 Risk Analysis
- **High Risk Activities**: [List risky activities]
- **Mitigation Strategies**: [Risk reduction plans]
- **Contingency Plans**: [Backup plans]`;
    }

    function createDecisionTreeTemplate() {
      return `# 🌳 Decision Tree Template

## 🎯 Decision Overview
**Decision**: [What decision needs to be made]
**Date**: ${new Date().toLocaleDateString()}

## 🌳 Decision Tree Structure

### Root Decision
**Question**: [Main decision question]
**Options**: [Available choices]

### Branch 1: [Option 1]
- **Probability**: [Chance of this outcome]
- **Outcome 1.1**: [Possible result]
  - **Value**: [Monetary or utility value]
  - **Probability**: [Chance of this outcome]

- **Outcome 1.2**: [Possible result]
  - **Value**: [Monetary or utility value]
  - **Probability**: [Chance of this outcome]

### Branch 2: [Option 2]
- **Probability**: [Chance of this outcome]
- **Outcome 2.1**: [Possible result]
  - **Value**: [Monetary or utility value]
  - **Probability**: [Chance of this outcome]

- **Outcome 2.2**: [Possible result]
  - **Value**: [Monetary or utility value]
  - **Probability**: [Chance of this outcome]

## 📊 Expected Value Analysis
- **Option 1 Expected Value**: [Calculated value]
- **Option 2 Expected Value**: [Calculated value]
- **Recommended Choice**: [Best option]

## 🎯 Sensitivity Analysis
- **Key Variables**: [What affects the decision]
- **Break-even Points**: [When options are equal]
- **Risk Factors**: [What could go wrong]`;
    }

    // Add more template functions for other categories...
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

    function createServerRackTemplate() {
      return `# 🖥️ Server Rack Template

## 🏗️ Rack Overview
**Rack Name**: [Rack identifier]
**Location**: [Data center location]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🖥️ Equipment Layout

### Rack Units (1U = 1.75 inches)
- **1U**: [Equipment name]
  - **Type**: [Server/Switch/UPS/etc.]
  - **Model**: [Equipment model]
  - **IP Address**: [IP if applicable]

- **2U**: [Equipment name]
  - **Type**: [Server/Switch/UPS/etc.]
  - **Model**: [Equipment model]
  - **IP Address**: [IP if applicable]

- **3U**: [Equipment name]
  - **Type**: [Server/Switch/UPS/etc.]
  - **Model**: [Equipment model]
  - **IP Address**: [IP if applicable]

## 🔌 Power Requirements
- **Total Power**: [Total watts needed]
- **UPS Capacity**: [UPS rating]
- **Redundancy**: [N+1, 2N, etc.]

## 🌡️ Environmental
- **Cooling**: [HVAC requirements]
- **Temperature**: [Optimal range]
- **Humidity**: [Optimal range]`;
    }

    function createDatabaseSchemaTemplate() {
      return `# 🗄️ Database Schema Template

## 📋 Database Overview
**Database Name**: [Database identifier]
**Type**: [SQL/NoSQL/Graph]
**Last Updated**: ${new Date().toLocaleDateString()}

## 📊 Tables/Collections

### Users Table
- **id**: [Primary key]
- **username**: [String]
- **email**: [String]
- **created_at**: [Timestamp]
- **updated_at**: [Timestamp]

### Products Table
- **id**: [Primary key]
- **name**: [String]
- **price**: [Decimal]
- **category_id**: [Foreign key]
- **created_at**: [Timestamp]

### Orders Table
- **id**: [Primary key]
- **user_id**: [Foreign key]
- **total**: [Decimal]
- **status**: [String]
- **created_at**: [Timestamp]

## 🔗 Relationships
- **Users** → **Orders** (1:Many)
- **Products** → **Categories** (Many:1)
- **Orders** → **OrderItems** (1:Many)`;
    }

    function createUmlSequenceTemplate() {
      return `# ⏱️ UML Sequence Diagram Template

## 🎯 System Interaction
**Use Case**: [Interaction description]
**Actors**: [System actors]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🔄 Sequence Flow

### Actor → System
1. **Login Request**
   - Actor sends credentials
   - System validates credentials
   - System returns authentication token

2. **Data Request**
   - Actor requests data
   - System queries database
   - System returns data to actor

3. **Data Update**
   - Actor sends update data
   - System validates data
   - System updates database
   - System confirms update

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 👤 **Stick Figures**: Actors
- ⬜ **Rectangles**: System components
- ➡️ **Arrows**: Messages/interactions
- 📊 **Lifelines**: Object timelines`;
    }

    function createUmlUseCaseTemplate() {
      return `# 🎭 UML Use Case Template

## 🎯 System Overview
**System Name**: [System identifier]
**Scope**: [System boundaries]
**Last Updated**: ${new Date().toLocaleDateString()}

## 👥 Actors
- **Primary Actor**: [Main user type]
- **Secondary Actor**: [Supporting user type]
- **System Actor**: [External system]

## 🎭 Use Cases

### Authentication
- **Actor**: User
- **Goal**: Access system securely
- **Preconditions**: User has valid account
- **Postconditions**: User is authenticated
- **Main Flow**: Login process
- **Alternative Flows**: Password reset, account lockout

### Data Management
- **Actor**: User
- **Goal**: Manage system data
- **Preconditions**: User is authenticated
- **Postconditions**: Data is updated
- **Main Flow**: CRUD operations
- **Alternative Flows**: Validation errors, access denied

## 🔗 Relationships
- **Include**: [Dependency relationships]
- **Extend**: [Optional relationships]
- **Generalization**: [Inheritance relationships]`;
    }

    function createNetworkTopologyTemplate() {
      return `# 🔗 Network Topology Template

## 🌐 Network Overview
**Network Name**: [Network identifier]
**Type**: [Star/Ring/Mesh/Bus/Tree]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🔧 Topology Components

### Central Hub
- **Router**: [Central routing device]
- **Switch**: [Core switching device]
- **Firewall**: [Security device]

### Network Segments
- **LAN Segment 1**: [Local area network]
  - **Devices**: [Connected devices]
  - **IP Range**: [Network range]

- **LAN Segment 2**: [Local area network]
  - **Devices**: [Connected devices]
  - **IP Range**: [Network range]

### WAN Connections
- **Internet**: [External connection]
- **VPN**: [Virtual private network]
- **Leased Line**: [Dedicated connection]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⬜ **Rectangles**: Network devices
- ⭕ **Circles**: Network nodes
- ➡️ **Arrows**: Network connections
- 🌐 **Clouds**: External networks`;
    }

    function createCloudArchitectureTemplate() {
      return `# ☁️ Cloud Architecture Template

## ☁️ Cloud Overview
**Platform**: [AWS/Azure/GCP/etc.]
**Architecture**: [Microservices/Monolithic/Serverless]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🏗️ Cloud Components

### Compute Layer
- **EC2 Instances**: [Virtual servers]
- **Lambda Functions**: [Serverless functions]
- **Container Services**: [Docker/Kubernetes]

### Storage Layer
- **S3 Buckets**: [Object storage]
- **RDS**: [Relational databases]
- **DynamoDB**: [NoSQL databases]

### Network Layer
- **VPC**: [Virtual private cloud]
- **Load Balancers**: [Traffic distribution]
- **CDN**: [Content delivery network]

### Security Layer
- **IAM**: [Identity and access management]
- **Security Groups**: [Firewall rules]
- **WAF**: [Web application firewall]

## 🔄 Data Flow
- **User Request** → **Load Balancer** → **Application Server** → **Database**
- **Static Content** → **CDN** → **User**

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ☁️ **Clouds**: Cloud services
- ⬜ **Rectangles**: Application components
- ➡️ **Arrows**: Data flow
- 🔒 **Shields**: Security components`;
    }

    function createElectricalCircuitTemplate() {
      return `# ⚡ Electrical Circuit Template

## ⚡ Circuit Overview
**Circuit Name**: [Circuit identifier]
**Type**: [AC/DC/Logic/Analog]
**Voltage**: [Operating voltage]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🔌 Circuit Components

### Power Supply
- **Voltage Source**: [Battery/AC adapter]
- **Voltage**: [Voltage rating]
- **Current**: [Current rating]

### Active Components
- **Transistors**: [Type and model]
- **ICs**: [Integrated circuits]
- **Op-Amps**: [Operational amplifiers]

### Passive Components
- **Resistors**: [Values and power ratings]
- **Capacitors**: [Values and voltage ratings]
- **Inductors**: [Values and current ratings]

### Load Components
- **LEDs**: [Light emitting diodes]
- **Motors**: [Electric motors]
- **Sensors**: [Input devices]

## 🔗 Connections
- **Series Connections**: [Components in series]
- **Parallel Connections**: [Components in parallel]
- **Ground Connections**: [Common ground points]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⚡ **Batteries**: Power sources
- 🔌 **Resistors**: Resistance components
- 🔋 **Capacitors**: Capacitive components
- ➡️ **Wires**: Electrical connections`;
    }

    function createMechanicalAssemblyTemplate() {
      return `# ⚙️ Mechanical Assembly Template

## ⚙️ Assembly Overview
**Assembly Name**: [Assembly identifier]
**Type**: [Machine/Structure/Mechanism]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🔧 Assembly Components

### Main Frame
- **Base Plate**: [Foundation component]
- **Support Beams**: [Structural elements]
- **Mounting Brackets**: [Attachment points]

### Moving Parts
- **Shafts**: [Rotating elements]
- **Bearings**: [Support and rotation]
- **Gears**: [Power transmission]
- **Pulleys**: [Belt drives]

### Fasteners
- **Bolts**: [Threaded fasteners]
- **Nuts**: [Threaded nuts]
- **Washers**: [Load distribution]
- **Pins**: [Shear connections]

### Actuators
- **Motors**: [Electric actuators]
- **Cylinders**: [Pneumatic/hydraulic]
- **Solenoids**: [Electromagnetic]

## 🔗 Assembly Sequence
1. **Base Assembly**: [Foundation steps]
2. **Component Mounting**: [Part installation]
3. **Alignment**: [Precision positioning]
4. **Testing**: [Function verification]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⬜ **Rectangles**: Structural components
- ⭕ **Circles**: Shafts and bearings
- ⬡ **Hexagons**: Fasteners
- ➡️ **Arrows**: Assembly sequence`;
    }

    function createPipingTemplate() {
      return `# 🔧 Piping & Instrumentation Template

## 🔧 P&ID Overview
**System Name**: [Process system]
**Type**: [Chemical/Water/Oil/Gas]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🔌 Piping Components

### Main Piping
- **Pipe Size**: [Diameter and schedule]
- **Material**: [Steel/Plastic/Copper]
- **Pressure Rating**: [Maximum pressure]

### Valves
- **Gate Valves**: [On/off control]
- **Ball Valves**: [Quarter-turn control]
- **Check Valves**: [One-way flow]
- **Control Valves**: [Flow regulation]

### Fittings
- **Elbows**: [Direction changes]
- **Tees**: [Branch connections]
- **Reducers**: [Size transitions]
- **Flanges**: [Connection points]

### Instruments
- **Pressure Gauges**: [Pressure measurement]
- **Flow Meters**: [Flow rate measurement]
- **Temperature Sensors**: [Temperature measurement]
- **Level Indicators**: [Level measurement]

## 🔄 Process Flow
- **Inlet** → **Pump** → **Heat Exchanger** → **Reactor** → **Separator** → **Outlet**

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ➡️ **Lines**: Piping connections
- 🔘 **Circles**: Instruments
- ⬜ **Rectangles**: Equipment
- 🔧 **Valves**: Flow control`;
    }

    function createFloorPlanTemplate() {
      return `# 🏢 Floor Plan Template

## 🏢 Building Overview
**Building Name**: [Building identifier]
**Floor**: [Floor number/level]
**Scale**: [Drawing scale]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🏗️ Space Layout

### Rooms and Areas
- **Office Space**: [Work areas]
  - **Dimensions**: [Length x Width]
  - **Area**: [Square footage]
  - **Capacity**: [Number of people]

- **Meeting Rooms**: [Conference areas]
  - **Dimensions**: [Length x Width]
  - **Area**: [Square footage]
  - **Capacity**: [Number of people]

- **Common Areas**: [Shared spaces]
  - **Dimensions**: [Length x Width]
  - **Area**: [Square footage]
  - **Function**: [Purpose]

### Circulation
- **Corridors**: [Passageways]
- **Stairwells**: [Vertical circulation]
- **Elevators**: [Vertical transport]
- **Entrances**: [Access points]

### Services
- **Electrical**: [Power distribution]
- **HVAC**: [Heating and cooling]
- **Plumbing**: [Water and waste]
- **IT Infrastructure**: [Network and data]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⬜ **Rectangles**: Rooms and spaces
- ➡️ **Lines**: Walls and partitions
- 🚪 **Symbols**: Doors and windows
- 🔌 **Symbols**: Electrical outlets`;
    }

    function createSitePlanTemplate() {
      return `# 🗺️ Site Plan Template

## 🗺️ Site Overview
**Site Name**: [Site identifier]
**Location**: [Geographic location]
**Area**: [Total site area]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🏗️ Site Elements

### Buildings
- **Main Building**: [Primary structure]
  - **Footprint**: [Building dimensions]
  - **Height**: [Number of stories]
  - **Function**: [Building purpose]

- **Ancillary Buildings**: [Support structures]
  - **Footprint**: [Building dimensions]
  - **Height**: [Number of stories]
  - **Function**: [Building purpose]

### Infrastructure
- **Roads**: [Vehicle access]
- **Parking**: [Vehicle storage]
- **Walkways**: [Pedestrian access]
- **Landscaping**: [Green spaces]

### Utilities
- **Electrical**: [Power distribution]
- **Water**: [Water supply]
- **Sewer**: [Waste disposal]
- **Storm Drainage**: [Rainwater management]

### Environmental
- **Trees**: [Existing vegetation]
- **Water Features**: [Ponds/streams]
- **Slopes**: [Topographic features]
- **Setbacks**: [Regulatory requirements]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⬜ **Rectangles**: Buildings
- ➡️ **Lines**: Roads and paths
- 🌳 **Symbols**: Trees and landscaping
- 🔌 **Symbols**: Utility connections`;
    }

    function createHvacTemplate() {
      return `# ❄️ HVAC System Template

## ❄️ HVAC Overview
**System Name**: [HVAC system identifier]
**Type**: [Central/Split/Package]
**Capacity**: [Cooling/heating capacity]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🔧 System Components

### Air Handling Units
- **AHU-1**: [Air handling unit]
  - **Capacity**: [Air flow rate]
  - **Filters**: [Filter type and efficiency]
  - **Coils**: [Heating/cooling coils]

- **AHU-2**: [Air handling unit]
  - **Capacity**: [Air flow rate]
  - **Filters**: [Filter type and efficiency]
  - **Coils**: [Heating/cooling coils]

### Ductwork
- **Supply Ducts**: [Air distribution]
  - **Size**: [Duct dimensions]
  - **Material**: [Duct material]
  - **Insulation**: [Thermal insulation]

- **Return Ducts**: [Air return]
  - **Size**: [Duct dimensions]
  - **Material**: [Duct material]
  - **Insulation**: [Thermal insulation]

### Terminal Units
- **VAV Boxes**: [Variable air volume]
- **Diffusers**: [Air outlets]
- **Grilles**: [Air inlets]

### Controls
- **Thermostats**: [Temperature control]
- **Sensors**: [Environmental monitoring]
- **Dampers**: [Air flow control]

## 🌡️ Operating Parameters
- **Supply Air Temperature**: [Temperature range]
- **Return Air Temperature**: [Temperature range]
- **Relative Humidity**: [Humidity range]
- **Air Changes**: [Ventilation rate]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⬜ **Rectangles**: Equipment
- ➡️ **Lines**: Ductwork
- 🌡️ **Symbols**: Sensors and controls
- 🔧 **Symbols**: Valves and dampers`;
    }

    function createPlumbingTemplate() {
      return `# 🚰 Plumbing Diagram Template

## 🚰 Plumbing Overview
**System Name**: [Plumbing system identifier]
**Type**: [Water supply/Drainage/Gas]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🔌 System Components

### Water Supply
- **Main Water Line**: [Primary supply]
  - **Size**: [Pipe diameter]
  - **Material**: [Pipe material]
  - **Pressure**: [Operating pressure]

- **Water Heaters**: [Hot water supply]
  - **Type**: [Tank/Tankless]
  - **Capacity**: [Storage capacity]
  - **Fuel**: [Energy source]

### Fixtures
- **Sinks**: [Wash basins]
- **Toilets**: [Sanitary fixtures]
- **Showers**: [Bathing fixtures]
- **Dishwashers**: [Appliance connections]

### Drainage
- **Drain Lines**: [Waste removal]
  - **Size**: [Pipe diameter]
  - **Material**: [Pipe material]
  - **Slope**: [Drainage slope]

- **Vent Lines**: [Air circulation]
  - **Size**: [Pipe diameter]
  - **Material**: [Pipe material]
  - **Location**: [Vent termination]

### Valves
- **Shut-off Valves**: [Flow control]
- **Pressure Reducing Valves**: [Pressure control]
- **Backflow Preventers**: [Contamination prevention]

## 🔄 Flow Paths
- **Supply**: [Water supply path]
- **Drainage**: [Waste removal path]
- **Venting**: [Air circulation path]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ➡️ **Lines**: Piping connections
- 🔘 **Circles**: Fixtures and valves
- ⬜ **Rectangles**: Equipment
- 🚰 **Symbols**: Plumbing fixtures`;
    }

    function createElectricalPlanTemplate() {
      return `# 💡 Electrical Plan Template

## 💡 Electrical Overview
**System Name**: [Electrical system identifier]
**Voltage**: [System voltage]
**Service Size**: [Main service capacity]
**Last Updated**: ${new Date().toLocaleDateString()}

## ⚡ System Components

### Power Distribution
- **Main Panel**: [Electrical service panel]
  - **Capacity**: [Service amperage]
  - **Voltage**: [System voltage]
  - **Phases**: [Single/Three phase]

- **Sub-panels**: [Distribution panels]
  - **Capacity**: [Panel amperage]
  - **Location**: [Panel location]
  - **Circuits**: [Number of circuits]

### Circuits
- **Lighting Circuits**: [Lighting loads]
  - **Wire Size**: [Conductor size]
  - **Breaker Size**: [Circuit protection]
  - **Load**: [Connected equipment]

- **Receptacle Circuits**: [Power outlets]
  - **Wire Size**: [Conductor size]
  - **Breaker Size**: [Circuit protection]
  - **Load**: [Connected equipment]

- **Dedicated Circuits**: [Special equipment]
  - **Wire Size**: [Conductor size]
  - **Breaker Size**: [Circuit protection]
  - **Load**: [Connected equipment]

### Fixtures and Outlets
- **Lighting Fixtures**: [Ceiling/wall lights]
- **Receptacles**: [Power outlets]
- **Switches**: [Lighting controls]
- **Emergency Equipment**: [Safety systems]

## 🔌 Load Calculations
- **Lighting Load**: [Total lighting watts]
- **Receptacle Load**: [Total receptacle watts]
- **Motor Load**: [Total motor watts]
- **Total Load**: [Combined load]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⚡ **Symbols**: Electrical components
- ➡️ **Lines**: Electrical connections
- 🔌 **Symbols**: Outlets and switches
- 💡 **Symbols**: Lighting fixtures`;
    }

    function createSoftwareArchitectureTemplate() {
      return `# 🏛️ Software Architecture Template

## 🏛️ Architecture Overview
**System Name**: [Software system identifier]
**Architecture Pattern**: [Monolithic/Microservices/Layered/etc.]
**Technology Stack**: [Programming languages and frameworks]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🏗️ Architecture Layers

### Presentation Layer
- **Web Interface**: [Frontend applications]
  - **Framework**: [React/Vue/Angular]
  - **UI Components**: [Reusable components]
  - **State Management**: [Redux/Vuex/etc.]

- **Mobile Interface**: [Mobile applications]
  - **Platform**: [iOS/Android/Cross-platform]
  - **Framework**: [React Native/Flutter/etc.]

### Business Logic Layer
- **Services**: [Business logic components]
  - **Authentication Service**: [User management]
  - **Data Processing Service**: [Business rules]
  - **Integration Service**: [External systems]

- **Controllers**: [Request handling]
  - **API Controllers**: [REST endpoints]
  - **Web Controllers**: [Web page handling]

### Data Access Layer
- **Repositories**: [Data access patterns]
  - **User Repository**: [User data access]
  - **Product Repository**: [Product data access]
  - **Order Repository**: [Order data access]

- **Data Sources**: [Storage systems]
  - **Primary Database**: [Main data store]
  - **Cache**: [Performance optimization]
  - **File Storage**: [Document storage]

## 🔗 System Integration
- **API Gateway**: [Request routing]
- **Message Queue**: [Asynchronous communication]
- **Load Balancer**: [Traffic distribution]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⬜ **Rectangles**: System components
- ➡️ **Arrows**: Data flow and dependencies
- 🔗 **Lines**: Integration points
- 🏛️ **Symbols**: Architecture patterns`;
    }

    function createApiDesignTemplate() {
      return `# 🔌 API Design Template

## 🔌 API Overview
**API Name**: [API identifier]
**Version**: [API version]
**Base URL**: [API endpoint]
**Last Updated**: ${new Date().toLocaleDateString()}

## 📋 API Endpoints

### Authentication
- **POST /auth/login**
  - **Description**: [User authentication]
  - **Request Body**: [Credentials format]
  - **Response**: [Authentication token]
  - **Status Codes**: [200, 401, 500]

- **POST /auth/logout**
  - **Description**: [User logout]
  - **Request Body**: [Token]
  - **Response**: [Success message]
  - **Status Codes**: [200, 401]

### User Management
- **GET /users**
  - **Description**: [Get all users]
  - **Query Parameters**: [Pagination, filters]
  - **Response**: [User list]
  - **Status Codes**: [200, 401, 403]

- **POST /users**
  - **Description**: [Create new user]
  - **Request Body**: [User data]
  - **Response**: [Created user]
  - **Status Codes**: [201, 400, 409]

- **PUT /users/{id}**
  - **Description**: [Update user]
  - **Request Body**: [Updated user data]
  - **Response**: [Updated user]
  - **Status Codes**: [200, 400, 404]

## 🔒 Security
- **Authentication**: [JWT/OAuth/API Keys]
- **Authorization**: [Role-based access]
- **Rate Limiting**: [Request throttling]
- **CORS**: [Cross-origin policies]

## 📊 Data Models
- **User Model**: [User data structure]
- **Product Model**: [Product data structure]
- **Order Model**: [Order data structure]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 🔌 **Symbols**: API endpoints
- ➡️ **Arrows**: Request/response flow
- 📊 **Boxes**: Data models
- 🔒 **Shields**: Security components`;
    }

    function createMicroservicesTemplate() {
      return `# 🔗 Microservices Template

## 🔗 Microservices Overview
**System Name**: [Microservices system]
**Number of Services**: [Total service count]
**Communication**: [HTTP/gRPC/Message Queue]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🏗️ Service Architecture

### Core Services
- **User Service**
  - **Function**: [User management]
  - **Database**: [User data store]
  - **API**: [User endpoints]
  - **Dependencies**: [Other services]

- **Product Service**
  - **Function**: [Product catalog]
  - **Database**: [Product data store]
  - **API**: [Product endpoints]
  - **Dependencies**: [Other services]

- **Order Service**
  - **Function**: [Order processing]
  - **Database**: [Order data store]
  - **API**: [Order endpoints]
  - **Dependencies**: [User, Product services]

### Supporting Services
- **Authentication Service**
  - **Function**: [Identity management]
  - **Database**: [Auth data store]
  - **API**: [Auth endpoints]

- **Notification Service**
  - **Function**: [Message delivery]
  - **Database**: [Notification data]
  - **API**: [Notification endpoints]

- **Payment Service**
  - **Function**: [Payment processing]
  - **Database**: [Payment data]
  - **API**: [Payment endpoints]

## 🔄 Service Communication
- **Synchronous**: [HTTP/REST calls]
- **Asynchronous**: [Message queues]
- **Event-Driven**: [Event streaming]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 🔗 **Symbols**: Microservices
- ➡️ **Arrows**: Service communication
- 🔄 **Lines**: Data flow
- 🏗️ **Boxes**: Service boundaries`;
    }

    function createDataFlowTemplate() {
      return `# 📊 Data Flow Template

## 📊 Data Flow Overview
**System Name**: [Data processing system]
**Data Sources**: [Input data origins]
**Data Destinations**: [Output data targets]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🔄 Data Processing Pipeline

### Data Ingestion
- **Source Systems**: [Data sources]
  - **Database**: [Operational databases]
  - **Files**: [CSV, JSON, XML files]
  - **APIs**: [External data sources]
  - **Streams**: [Real-time data]

### Data Processing
- **ETL Processes**: [Extract, Transform, Load]
  - **Data Extraction**: [Data retrieval]
  - **Data Transformation**: [Data cleaning and formatting]
  - **Data Loading**: [Data storage]

- **Data Validation**: [Quality checks]
  - **Schema Validation**: [Data structure]
  - **Business Rules**: [Domain validation]
  - **Data Quality**: [Completeness, accuracy]

### Data Storage
- **Data Warehouse**: [Analytical data]
- **Data Lake**: [Raw data storage]
- **Operational Data Store**: [Real-time data]

### Data Consumption
- **Reporting**: [Business intelligence]
- **Analytics**: [Data analysis]
- **Machine Learning**: [Predictive models]

## 🔗 Data Dependencies
- **Upstream**: [Data sources]
- **Downstream**: [Data consumers]
- **Dependencies**: [Processing order]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 📊 **Symbols**: Data sources and destinations
- ➡️ **Arrows**: Data flow direction
- 🔄 **Circles**: Processing steps
- 📋 **Boxes**: Data stores`;
    }

    function createEntityRelationshipTemplate() {
      return `# 📋 Entity Relationship Template

## 📋 ERD Overview
**Database Name**: [Database identifier]
**Scope**: [System boundaries]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🏗️ Entity Definitions

### User Entity
- **Primary Key**: [User ID]
- **Attributes**:
  - **username**: [String, unique]
  - **email**: [String, unique]
  - **password_hash**: [String, encrypted]
  - **created_at**: [Timestamp]
  - **updated_at**: [Timestamp]

### Product Entity
- **Primary Key**: [Product ID]
- **Attributes**:
  - **name**: [String]
  - **description**: [Text]
  - **price**: [Decimal]
  - **category_id**: [Foreign key]
  - **created_at**: [Timestamp]

### Order Entity
- **Primary Key**: [Order ID]
- **Attributes**:
  - **user_id**: [Foreign key]
  - **total_amount**: [Decimal]
  - **status**: [String]
  - **created_at**: [Timestamp]

### OrderItem Entity
- **Primary Key**: [OrderItem ID]
- **Attributes**:
  - **order_id**: [Foreign key]
  - **product_id**: [Foreign key]
  - **quantity**: [Integer]
  - **unit_price**: [Decimal]

## 🔗 Relationships
- **User** → **Order** (1:Many)
- **Order** → **OrderItem** (1:Many)
- **Product** → **OrderItem** (1:Many)
- **Category** → **Product** (1:Many)

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⬜ **Rectangles**: Entities
- 🔗 **Lines**: Relationships
- 🔑 **Symbols**: Primary/Foreign keys
- 📊 **Diamonds**: Relationship types`;
    }

    function createStateMachineTemplate() {
      return `# 🔄 State Machine Template

## 🔄 State Machine Overview
**System Name**: [State machine identifier]
**Purpose**: [System behavior modeling]
**States**: [Number of states]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🎯 State Definitions

### Initial State
- **State Name**: [Starting state]
- **Description**: [State purpose]
- **Actions**: [Available actions]
- **Transitions**: [Possible state changes]

### Processing State
- **State Name**: [Active processing]
- **Description**: [State purpose]
- **Actions**: [Available actions]
- **Transitions**: [Possible state changes]

### Success State
- **State Name**: [Successful completion]
- **Description**: [State purpose]
- **Actions**: [Available actions]
- **Transitions**: [Possible state changes]

### Error State
- **State Name**: [Error condition]
- **Description**: [State purpose]
- **Actions**: [Available actions]
- **Transitions**: [Possible state changes]

## 🔄 State Transitions
- **Event**: [Trigger condition]
- **Condition**: [Transition criteria]
- **Action**: [State change action]
- **Guard**: [Transition validation]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 🔄 **Circles**: States
- ➡️ **Arrows**: Transitions
- 🎯 **Symbols**: Events
- 📋 **Boxes**: Actions`;
    }

    function createComponentDiagramTemplate() {
      return `# 🧩 Component Diagram Template

## 🧩 Component Overview
**System Name**: [Component system]
**Architecture**: [Component-based architecture]
**Components**: [Number of components]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🏗️ Component Definitions

### User Interface Component
- **Purpose**: [User interaction]
- **Interfaces**: [Provided interfaces]
- **Dependencies**: [Required interfaces]
- **Implementation**: [Component technology]

### Business Logic Component
- **Purpose**: [Business rules]
- **Interfaces**: [Provided interfaces]
- **Dependencies**: [Required interfaces]
- **Implementation**: [Component technology]

### Data Access Component
- **Purpose**: [Data persistence]
- **Interfaces**: [Provided interfaces]
- **Dependencies**: [Required interfaces]
- **Implementation**: [Component technology]

### External Service Component
- **Purpose**: [External integration]
- **Interfaces**: [Provided interfaces]
- **Dependencies**: [Required interfaces]
- **Implementation**: [Component technology]

## 🔗 Component Relationships
- **Dependencies**: [Component dependencies]
- **Interfaces**: [Interface contracts]
- **Communication**: [Component communication]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 🧩 **Boxes**: Components
- 🔗 **Lines**: Dependencies
- 🔌 **Symbols**: Interfaces
- ➡️ **Arrows**: Communication flow`;
    }

    function createDeploymentDiagramTemplate() {
      return `# 🚀 Deployment Diagram Template

## 🚀 Deployment Overview
**System Name**: [Deployment system]
**Environment**: [Production/Staging/Development]
**Infrastructure**: [Cloud/On-premises/Hybrid]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🏗️ Deployment Architecture

### Load Balancer Tier
- **Load Balancer**: [Traffic distribution]
  - **Type**: [Application/Network]
  - **Algorithm**: [Round-robin/Least connections]
  - **Health Checks**: [Service monitoring]

### Application Tier
- **Web Servers**: [Application hosting]
  - **Instances**: [Number of instances]
  - **Specifications**: [CPU, Memory, Storage]
  - **Scaling**: [Auto-scaling configuration]

- **Application Servers**: [Business logic]
  - **Instances**: [Number of instances]
  - **Specifications**: [CPU, Memory, Storage]
  - **Scaling**: [Auto-scaling configuration]

### Database Tier
- **Primary Database**: [Main data store]
  - **Type**: [Relational/NoSQL]
  - **Specifications**: [CPU, Memory, Storage]
  - **Backup**: [Backup strategy]

- **Read Replicas**: [Read scaling]
  - **Number**: [Number of replicas]
  - **Specifications**: [CPU, Memory, Storage]
  - **Sync**: [Replication lag]

### Storage Tier
- **Object Storage**: [File storage]
- **Block Storage**: [Database storage]
- **CDN**: [Content delivery]

## 🔗 Network Configuration
- **VPC**: [Virtual private cloud]
- **Subnets**: [Network segmentation]
- **Security Groups**: [Firewall rules]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 🚀 **Symbols**: Deployment nodes
- 🔗 **Lines**: Network connections
- ⬜ **Boxes**: Application components
- 💾 **Symbols**: Storage systems`;
    }

    function createProjectTimelineTemplate() {
      return `# ⏰ Project Timeline Template

## ⏰ Timeline Overview
**Project Name**: [Project identifier]
**Start Date**: [Project start]
**End Date**: [Project end]
**Duration**: [Total duration]
**Last Updated**: ${new Date().toLocaleDateString()}

## 📅 Project Phases

### Phase 1: Planning (Week 1-2)
- **Start Date**: [Phase start]
- **End Date**: [Phase end]
- **Duration**: [Phase duration]
- **Deliverables**: [Phase outputs]
- **Dependencies**: [Prerequisites]

### Phase 2: Design (Week 3-4)
- **Start Date**: [Phase start]
- **End Date**: [Phase end]
- **Duration**: [Phase duration]
- **Deliverables**: [Phase outputs]
- **Dependencies**: [Prerequisites]

### Phase 3: Development (Week 5-10)
- **Start Date**: [Phase start]
- **End Date**: [Phase end]
- **Duration**: [Phase duration]
- **Deliverables**: [Phase outputs]
- **Dependencies**: [Prerequisites]

### Phase 4: Testing (Week 11-12)
- **Start Date**: [Phase start]
- **End Date**: [Phase end]
- **Duration**: [Phase duration]
- **Deliverables**: [Phase outputs]
- **Dependencies**: [Prerequisites]

### Phase 5: Deployment (Week 13)
- **Start Date**: [Phase start]
- **End Date**: [Phase end]
- **Duration**: [Phase duration]
- **Deliverables**: [Phase outputs]
- **Dependencies**: [Prerequisites]

## 🎯 Key Milestones
- **Milestone 1**: [Description and date]
- **Milestone 2**: [Description and date]
- **Milestone 3**: [Description and date]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⏰ **Timeline**: Project schedule
- 📅 **Bars**: Task durations
- 🎯 **Markers**: Milestones
- ➡️ **Arrows**: Dependencies`;
    }

    function createResourceAllocationTemplate() {
      return `# 👥 Resource Allocation Template

## 👥 Resource Overview
**Project Name**: [Project identifier]
**Total Budget**: [Project budget]
**Team Size**: [Number of team members]
**Last Updated**: ${new Date().toLocaleDateString()}

## 👨‍💼 Human Resources

### Development Team
- **Project Manager**: [Name and role]
  - **Allocation**: [Percentage of time]
  - **Skills**: [Key competencies]
  - **Availability**: [Start/end dates]

- **Senior Developer**: [Name and role]
  - **Allocation**: [Percentage of time]
  - **Skills**: [Key competencies]
  - **Availability**: [Start/end dates]

- **Junior Developer**: [Name and role]
  - **Allocation**: [Percentage of time]
  - **Skills**: [Key competencies]
  - **Availability**: [Start/end dates]

### Support Team
- **QA Engineer**: [Name and role]
  - **Allocation**: [Percentage of time]
  - **Skills**: [Key competencies]
  - **Availability**: [Start/end dates]

- **DevOps Engineer**: [Name and role]
  - **Allocation**: [Percentage of time]
  - **Skills**: [Key competencies]
  - **Availability**: [Start/end dates]

## 💰 Financial Resources
- **Development Costs**: [Budget allocation]
- **Infrastructure Costs**: [Budget allocation]
- **Contingency**: [Budget allocation]

## 🖥️ Technical Resources
- **Development Environment**: [Tools and platforms]
- **Testing Environment**: [QA infrastructure]
- **Production Environment**: [Deployment infrastructure]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 👥 **Symbols**: Team members
- 💰 **Symbols**: Budget allocation
- 🖥️ **Symbols**: Technical resources
- 📊 **Charts**: Resource utilization`;
    }

    function createRiskMatrixTemplate() {
      return `# ⚠️ Risk Matrix Template

## ⚠️ Risk Overview
**Project Name**: [Project identifier]
**Risk Assessment Date**: [Assessment date]
**Risk Owner**: [Person responsible]
**Last Updated**: ${new Date().toLocaleDateString()}

## 📊 Risk Categories

### High Impact, High Probability
- **Risk 1**: [Risk description]
  - **Impact**: [Severity level]
  - **Probability**: [Likelihood]
  - **Mitigation**: [Risk reduction strategy]
  - **Contingency**: [Backup plan]

- **Risk 2**: [Risk description]
  - **Impact**: [Severity level]
  - **Probability**: [Likelihood]
  - **Mitigation**: [Risk reduction strategy]
  - **Contingency**: [Backup plan]

### High Impact, Low Probability
- **Risk 3**: [Risk description]
  - **Impact**: [Severity level]
  - **Probability**: [Likelihood]
  - **Mitigation**: [Risk reduction strategy]
  - **Contingency**: [Backup plan]

### Low Impact, High Probability
- **Risk 4**: [Risk description]
  - **Impact**: [Severity level]
  - **Probability**: [Likelihood]
  - **Mitigation**: [Risk reduction strategy]
  - **Contingency**: [Backup plan]

### Low Impact, Low Probability
- **Risk 5**: [Risk description]
  - **Impact**: [Severity level]
  - **Probability**: [Likelihood]
  - **Mitigation**: [Risk reduction strategy]
  - **Contingency**: [Backup plan]

## 🎯 Risk Response Strategies
- **Avoid**: [Eliminate risk]
- **Transfer**: [Share risk]
- **Mitigate**: [Reduce risk]
- **Accept**: [Live with risk]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- ⚠️ **Symbols**: Risk indicators
- 📊 **Matrix**: Impact vs Probability
- 🎯 **Zones**: Risk categories
- ➡️ **Arrows**: Risk relationships`;
    }

    function createStakeholderMapTemplate() {
      return `# 🎯 Stakeholder Map Template

## 🎯 Stakeholder Overview
**Project Name**: [Project identifier]
**Stakeholder Analysis Date**: [Analysis date]
**Total Stakeholders**: [Number of stakeholders]
**Last Updated**: ${new Date().toLocaleDateString()}

## 👥 Stakeholder Categories

### High Influence, High Interest
- **Stakeholder 1**: [Name and role]
  - **Influence**: [Power level]
  - **Interest**: [Engagement level]
  - **Communication**: [Preferred method]
  - **Engagement Strategy**: [How to involve]

- **Stakeholder 2**: [Name and role]
  - **Influence**: [Power level]
  - **Interest**: [Engagement level]
  - **Communication**: [Preferred method]
  - **Engagement Strategy**: [How to involve]

### High Influence, Low Interest
- **Stakeholder 3**: [Name and role]
  - **Influence**: [Power level]
  - **Interest**: [Engagement level]
  - **Communication**: [Preferred method]
  - **Engagement Strategy**: [How to involve]

### Low Influence, High Interest
- **Stakeholder 4**: [Name and role]
  - **Influence**: [Power level]
  - **Interest**: [Engagement level]
  - **Communication**: [Preferred method]
  - **Engagement Strategy**: [How to involve]

### Low Influence, Low Interest
- **Stakeholder 5**: [Name and role]
  - **Influence**: [Power level]
  - **Interest**: [Engagement level]
  - **Communication**: [Preferred method]
  - **Engagement Strategy**: [How to involve]

## 📋 Communication Plan
- **High Priority**: [Frequent updates]
- **Medium Priority**: [Regular updates]
- **Low Priority**: [Occasional updates]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 👥 **Symbols**: Stakeholders
- 📊 **Quadrants**: Influence vs Interest
- 🎯 **Zones**: Engagement levels
- ➡️ **Arrows**: Relationships`;
    }

    function createWorkBreakdownTemplate() {
      return `# 📋 Work Breakdown Structure Template

## 📋 WBS Overview
**Project Name**: [Project identifier]
**WBS Level**: [Number of levels]
**Total Tasks**: [Number of tasks]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🏗️ Project Structure

### Level 1: Project
- **1.0 Project Management**
  - **1.1 Project Planning**: [Task description]
  - **1.2 Project Monitoring**: [Task description]
  - **1.3 Project Closure**: [Task description]

### Level 2: Major Deliverables
- **2.0 Requirements Analysis**
  - **2.1 Stakeholder Interviews**: [Task description]
  - **2.2 Requirements Documentation**: [Task description]
  - **2.3 Requirements Validation**: [Task description]

- **3.0 System Design**
  - **3.1 Architecture Design**: [Task description]
  - **3.2 Database Design**: [Task description]
  - **3.3 Interface Design**: [Task description]

- **4.0 System Development**
  - **4.1 Backend Development**: [Task description]
  - **4.2 Frontend Development**: [Task description]
  - **4.3 Integration**: [Task description]

- **5.0 Testing**
  - **5.1 Unit Testing**: [Task description]
  - **5.2 Integration Testing**: [Task description]
  - **5.3 User Acceptance Testing**: [Task description]

- **6.0 Deployment**
  - **6.1 Environment Setup**: [Task description]
  - **6.2 System Deployment**: [Task description]
  - **6.3 User Training**: [Task description]

## 📊 Task Details
- **Task ID**: [Unique identifier]
- **Task Name**: [Task description]
- **Duration**: [Estimated time]
- **Dependencies**: [Prerequisites]
- **Resources**: [Assigned team members]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 📋 **Boxes**: Work packages
- ➡️ **Arrows**: Dependencies
- 📊 **Hierarchy**: Task levels
- 🎯 **Symbols**: Milestones`;
    }

    function createKanbanBoardTemplate() {
      return `# 📋 Kanban Board Template

## 📋 Kanban Overview
**Project Name**: [Project identifier]
**Board Type**: [Development/Support/Marketing]
**Sprint Duration**: [Sprint length]
**Last Updated**: ${new Date().toLocaleDateString()}

## 📊 Board Columns

### Backlog
- **Task 1**: [Task description]
  - **Priority**: [High/Medium/Low]
  - **Story Points**: [Effort estimation]
  - **Assignee**: [Team member]

- **Task 2**: [Task description]
  - **Priority**: [High/Medium/Low]
  - **Story Points**: [Effort estimation]
  - **Assignee**: [Team member]

### To Do
- **Task 3**: [Task description]
  - **Priority**: [High/Medium/Low]
  - **Story Points**: [Effort estimation]
  - **Assignee**: [Team member]

- **Task 4**: [Task description]
  - **Priority**: [High/Medium/Low]
  - **Story Points**: [Effort estimation]
  - **Assignee**: [Team member]

### In Progress
- **Task 5**: [Task description]
  - **Priority**: [High/Medium/Low]
  - **Story Points**: [Effort estimation]
  - **Assignee**: [Team member]
  - **Start Date**: [When work began]

### Review
- **Task 6**: [Task description]
  - **Priority**: [High/Medium/Low]
  - **Story Points**: [Effort estimation]
  - **Assignee**: [Team member]
  - **Reviewer**: [Review team member]

### Done
- **Task 7**: [Task description]
  - **Priority**: [High/Medium/Low]
  - **Story Points**: [Effort estimation]
  - **Assignee**: [Team member]
  - **Completion Date**: [When completed]

## 📈 Metrics
- **Cycle Time**: [Average time in progress]
- **Lead Time**: [Total time from creation to completion]
- **Throughput**: [Tasks completed per sprint]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 📋 **Cards**: Task items
- 📊 **Columns**: Work stages
- 🏷️ **Labels**: Task categories
- 📈 **Charts**: Performance metrics`;
    }

    function createScrumBoardTemplate() {
      return `# 🏃 Scrum Board Template

## 🏃 Scrum Overview
**Project Name**: [Project identifier]
**Sprint Number**: [Current sprint]
**Sprint Duration**: [Sprint length]
**Team Velocity**: [Story points per sprint]
**Last Updated**: ${new Date().toLocaleDateString()}

## 📊 Sprint Backlog

### User Stories
- **Story 1**: [User story description]
  - **Story Points**: [Effort estimation]
  - **Acceptance Criteria**: [Definition of done]
  - **Assignee**: [Team member]
  - **Status**: [To Do/In Progress/Done]

- **Story 2**: [User story description]
  - **Story Points**: [Effort estimation]
  - **Acceptance Criteria**: [Definition of done]
  - **Assignee**: [Team member]
  - **Status**: [To Do/In Progress/Done]

### Tasks
- **Task 1**: [Task description]
  - **Story**: [Related user story]
  - **Effort**: [Hours estimation]
  - **Assignee**: [Team member]
  - **Status**: [To Do/In Progress/Done]

- **Task 2**: [Task description]
  - **Story**: [Related user story]
  - **Effort**: [Hours estimation]
  - **Assignee**: [Team member]
  - **Status**: [To Do/In Progress/Done]

## 🎯 Sprint Goals
- **Goal 1**: [Sprint objective]
- **Goal 2**: [Sprint objective]
- **Goal 3**: [Sprint objective]

## 📈 Sprint Metrics
- **Sprint Velocity**: [Story points completed]
- **Burndown Chart**: [Progress tracking]
- **Impediments**: [Blockers and issues]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 📋 **Cards**: User stories and tasks
- 📊 **Columns**: Sprint stages
- 🏷️ **Labels**: Story types
- 📈 **Charts**: Sprint metrics`;
    }

    function createProjectDashboardTemplate() {
      return `# 📊 Project Dashboard Template

## 📊 Dashboard Overview
**Project Name**: [Project identifier]
**Dashboard Date**: [Current date]
**Project Status**: [On Track/At Risk/Delayed]
**Last Updated**: ${new Date().toLocaleDateString()}

## 📈 Key Performance Indicators

### Schedule Performance
- **Planned Progress**: [Expected completion percentage]
- **Actual Progress**: [Current completion percentage]
- **Schedule Variance**: [Difference from plan]
- **Critical Path**: [Longest task sequence]

### Cost Performance
- **Planned Budget**: [Original budget]
- **Actual Cost**: [Current spending]
- **Cost Variance**: [Difference from budget]
- **Earned Value**: [Value of completed work]

### Quality Metrics
- **Defect Rate**: [Issues per deliverable]
- **Test Coverage**: [Percentage of code tested]
- **Customer Satisfaction**: [Feedback scores]
- **Performance Metrics**: [System performance]

### Resource Utilization
- **Team Capacity**: [Available hours]
- **Utilization Rate**: [Percentage of time used]
- **Skill Gaps**: [Missing competencies]
- **Resource Conflicts**: [Scheduling issues]

## 🎯 Project Health
- **Green**: [On track items]
- **Yellow**: [At risk items]
- **Red**: [Critical issues]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 📊 **Charts**: Performance metrics
- 🎯 **Indicators**: Status indicators
- 📈 **Graphs**: Trend analysis
- 📋 **Tables**: Detailed data`;
    }

    function createCustomerJourneyTemplate() {
      return `# 🛤️ Customer Journey Template

## 🛤️ Journey Overview
**Customer Type**: [Target customer segment]
**Journey Duration**: [Total journey time]
**Touchpoints**: [Number of interactions]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🎯 Journey Stages

### Awareness Stage
- **Touchpoint**: [First contact]
  - **Channel**: [Marketing channel]
  - **Message**: [Key messaging]
  - **Customer Action**: [What customer does]
  - **Emotion**: [Customer feeling]

- **Touchpoint**: [Discovery]
  - **Channel**: [Marketing channel]
  - **Message**: [Key messaging]
  - **Customer Action**: [What customer does]
  - **Emotion**: [Customer feeling]

### Consideration Stage
- **Touchpoint**: [Research]
  - **Channel**: [Research channel]
  - **Message**: [Key messaging]
  - **Customer Action**: [What customer does]
  - **Emotion**: [Customer feeling]

- **Touchpoint**: [Comparison]
  - **Channel**: [Comparison channel]
  - **Message**: [Key messaging]
  - **Customer Action**: [What customer does]
  - **Emotion**: [Customer feeling]

### Decision Stage
- **Touchpoint**: [Purchase]
  - **Channel**: [Purchase channel]
  - **Message**: [Key messaging]
  - **Customer Action**: [What customer does]
  - **Emotion**: [Customer feeling]

### Retention Stage
- **Touchpoint**: [Onboarding]
  - **Channel**: [Onboarding channel]
  - **Message**: [Key messaging]
  - **Customer Action**: [What customer does]
  - **Emotion**: [Customer feeling]

- **Touchpoint**: [Support]
  - **Channel**: [Support channel]
  - **Message**: [Key messaging]
  - **Customer Action**: [What customer does]
  - **Emotion**: [Customer feeling]

## 📊 Journey Metrics
- **Conversion Rate**: [Stage-to-stage conversion]
- **Time to Decision**: [Average decision time]
- **Customer Satisfaction**: [Satisfaction scores]
- **Net Promoter Score**: [NPS ratings]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 🛤️ **Path**: Customer journey flow
- 🎯 **Stages**: Journey phases
- 📊 **Metrics**: Performance indicators
- 😊 **Emotions**: Customer feelings`;
    }

    function createSalesFunnelTemplate() {
      return `# 🫙 Sales Funnel Template

## 🫙 Funnel Overview
**Funnel Name**: [Sales funnel identifier]
**Target Audience**: [Customer segment]
**Conversion Goal**: [Desired outcome]
**Last Updated**: ${new Date().toLocaleDateString()}

## 📊 Funnel Stages

### Top of Funnel (TOFU)
- **Stage**: [Awareness]
  - **Volume**: [Number of prospects]
  - **Conversion Rate**: [Percentage moving to next stage]
  - **Content**: [Marketing materials]
  - **Channels**: [Marketing channels]

### Middle of Funnel (MOFU)
- **Stage**: [Consideration]
  - **Volume**: [Number of prospects]
  - **Conversion Rate**: [Percentage moving to next stage]
  - **Content**: [Marketing materials]
  - **Channels**: [Marketing channels]

- **Stage**: [Evaluation]
  - **Volume**: [Number of prospects]
  - **Conversion Rate**: [Percentage moving to next stage]
  - **Content**: [Marketing materials]
  - **Channels**: [Marketing channels]

### Bottom of Funnel (BOFU)
- **Stage**: [Decision]
  - **Volume**: [Number of prospects]
  - **Conversion Rate**: [Percentage moving to next stage]
  - **Content**: [Marketing materials]
  - **Channels**: [Marketing channels]

- **Stage**: [Purchase]
  - **Volume**: [Number of prospects]
  - **Conversion Rate**: [Percentage moving to next stage]
  - **Content**: [Marketing materials]
  - **Channels**: [Marketing channels]

## 📈 Funnel Metrics
- **Overall Conversion Rate**: [End-to-end conversion]
- **Stage Conversion Rates**: [Per-stage conversions]
- **Average Deal Size**: [Revenue per sale]
- **Sales Cycle Length**: [Time to close]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 🫙 **Funnel**: Sales funnel shape
- 📊 **Stages**: Funnel phases
- 📈 **Metrics**: Conversion data
- ➡️ **Flow**: Prospect movement`;
    }

    function createMarketingCampaignTemplate() {
      return `# 📢 Marketing Campaign Template

## 📢 Campaign Overview
**Campaign Name**: [Campaign identifier]
**Campaign Type**: [Digital/Print/Event/etc.]
**Target Audience**: [Customer segment]
**Campaign Duration**: [Start to end date]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🎯 Campaign Strategy

### Campaign Goals
- **Primary Goal**: [Main objective]
  - **Metric**: [Success measurement]
  - **Target**: [Goal value]
  - **Timeline**: [Achievement date]

- **Secondary Goals**: [Additional objectives]
  - **Metric**: [Success measurement]
  - **Target**: [Goal value]
  - **Timeline**: [Achievement date]

### Target Audience
- **Demographics**: [Age, gender, location]
- **Psychographics**: [Interests, values, lifestyle]
- **Behavior**: [Online behavior, purchase patterns]
- **Pain Points**: [Customer problems]

### Key Messages
- **Primary Message**: [Main campaign message]
- **Supporting Messages**: [Additional messaging]
- **Value Proposition**: [Customer benefits]
- **Call to Action**: [Desired customer action]

## 📊 Campaign Channels

### Digital Channels
- **Social Media**: [Platforms and strategy]
- **Email Marketing**: [Email strategy]
- **Content Marketing**: [Content strategy]
- **Paid Advertising**: [Ad strategy]

### Traditional Channels
- **Print Media**: [Print strategy]
- **Events**: [Event strategy]
- **Direct Mail**: [Mail strategy]
- **Public Relations**: [PR strategy]

## 📈 Campaign Metrics
- **Reach**: [Number of people exposed]
- **Engagement**: [Interaction rates]
- **Conversion**: [Action completion rates]
- **ROI**: [Return on investment]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 📢 **Symbols**: Campaign elements
- 📊 **Channels**: Marketing channels
- 📈 **Metrics**: Performance data
- 🎯 **Targets**: Campaign goals`;
    }

    function createCompetitiveAnalysisTemplate() {
      return `# 🏆 Competitive Analysis Template

## 🏆 Analysis Overview
**Market**: [Market segment]
**Analysis Date**: [Analysis date]
**Competitors**: [Number of competitors]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🥇 Competitor Profiles

### Competitor 1: [Company Name]
- **Market Position**: [Market share and ranking]
- **Strengths**: [Competitive advantages]
- **Weaknesses**: [Competitive disadvantages]
- **Opportunities**: [Market opportunities]
- **Threats**: [Market threats]

### Competitor 2: [Company Name]
- **Market Position**: [Market share and ranking]
- **Strengths**: [Competitive advantages]
- **Weaknesses**: [Competitive disadvantages]
- **Opportunities**: [Market opportunities]
- **Threats**: [Market threats]

### Competitor 3: [Company Name]
- **Market Position**: [Market share and ranking]
- **Strengths**: [Competitive advantages]
- **Weaknesses**: [Competitive disadvantages]
- **Opportunities**: [Market opportunities]
- **Threats**: [Market threats]

## 📊 Competitive Matrix

### Product Comparison
- **Feature 1**: [Competitor ratings]
- **Feature 2**: [Competitor ratings]
- **Feature 3**: [Competitor ratings]
- **Feature 4**: [Competitor ratings]

### Pricing Comparison
- **Pricing Model**: [Competitor pricing]
- **Price Range**: [Price comparison]
- **Value Proposition**: [Value comparison]

### Marketing Comparison
- **Brand Awareness**: [Brand strength]
- **Marketing Channels**: [Channel usage]
- **Messaging**: [Message comparison]

## 🎯 Competitive Strategy
- **Differentiation**: [Unique value proposition]
- **Positioning**: [Market positioning]
- **Advantages**: [Competitive advantages]
- **Gaps**: [Market opportunities]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 🏆 **Symbols**: Competitor positions
- 📊 **Matrix**: Comparison grid
- 🎯 **Zones**: Market segments
- ➡️ **Arrows**: Competitive relationships`;
    }

    function createSwotAnalysisTemplate() {
      return `# 📊 SWOT Analysis Template

## 📊 SWOT Overview
**Organization**: [Company/Product/Service]
**Analysis Date**: [Analysis date]
**Scope**: [Analysis scope]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🎯 SWOT Matrix

### Strengths (Internal Positive)
- **Strength 1**: [Internal advantage]
  - **Description**: [Detailed explanation]
  - **Impact**: [Business impact]
  - **Sustainability**: [Long-term viability]

- **Strength 2**: [Internal advantage]
  - **Description**: [Detailed explanation]
  - **Impact**: [Business impact]
  - **Sustainability**: [Long-term viability]

- **Strength 3**: [Internal advantage]
  - **Description**: [Detailed explanation]
  - **Impact**: [Business impact]
  - **Sustainability**: [Long-term viability]

### Weaknesses (Internal Negative)
- **Weakness 1**: [Internal disadvantage]
  - **Description**: [Detailed explanation]
  - **Impact**: [Business impact]
  - **Improvement**: [Potential solutions]

- **Weakness 2**: [Internal disadvantage]
  - **Description**: [Detailed explanation]
  - **Impact**: [Business impact]
  - **Improvement**: [Potential solutions]

- **Weakness 3**: [Internal disadvantage]
  - **Description**: [Detailed explanation]
  - **Impact**: [Business impact]
  - **Improvement**: [Potential solutions]

### Opportunities (External Positive)
- **Opportunity 1**: [External opportunity]
  - **Description**: [Detailed explanation]
  - **Potential**: [Business potential]
  - **Timeline**: [Time sensitivity]

- **Opportunity 2**: [External opportunity]
  - **Description**: [Detailed explanation]
  - **Potential**: [Business potential]
  - **Timeline**: [Time sensitivity]

- **Opportunity 3**: [External opportunity]
  - **Description**: [Detailed explanation]
  - **Potential**: [Business potential]
  - **Timeline**: [Time sensitivity]

### Threats (External Negative)
- **Threat 1**: [External threat]
  - **Description**: [Detailed explanation]
  - **Impact**: [Business impact]
  - **Mitigation**: [Risk reduction]

- **Threat 2**: [External threat]
  - **Description**: [Detailed explanation]
  - **Impact**: [Business impact]
  - **Mitigation**: [Risk reduction]

- **Threat 3**: [External threat]
  - **Description**: [Detailed explanation]
  - **Impact**: [Business impact]
  - **Mitigation**: [Risk reduction]

## 🎯 Strategic Implications
- **SO Strategies**: [Strengths + Opportunities]
- **ST Strategies**: [Strengths + Threats]
- **WO Strategies**: [Weaknesses + Opportunities]
- **WT Strategies**: [Weaknesses + Threats]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 📊 **Quadrants**: SWOT matrix
- 🎯 **Zones**: Analysis areas
- ➡️ **Arrows**: Strategic relationships
- 📋 **Lists**: Analysis items`;
    }

    function createBrandArchitectureTemplate() {
      return `# 🏛️ Brand Architecture Template

## 🏛️ Brand Overview
**Brand Name**: [Brand identifier]
**Brand Type**: [Corporate/Product/Service]
**Brand Portfolio**: [Number of brands]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🏗️ Brand Structure

### Master Brand
- **Brand Name**: [Primary brand]
  - **Positioning**: [Brand positioning]
  - **Values**: [Core brand values]
  - **Personality**: [Brand personality]
  - **Voice**: [Brand voice and tone]

### Sub-Brands
- **Sub-Brand 1**: [Secondary brand]
  - **Relationship**: [Relationship to master brand]
  - **Positioning**: [Brand positioning]
  - **Target Audience**: [Target customers]
  - **Value Proposition**: [Customer benefits]

- **Sub-Brand 2**: [Secondary brand]
  - **Relationship**: [Relationship to master brand]
  - **Positioning**: [Brand positioning]
  - **Target Audience**: [Target customers]
  - **Value Proposition**: [Customer benefits]

### Product Brands
- **Product Brand 1**: [Product-specific brand]
  - **Category**: [Product category]
  - **Positioning**: [Brand positioning]
  - **Target Audience**: [Target customers]
  - **Value Proposition**: [Customer benefits]

- **Product Brand 2**: [Product-specific brand]
  - **Category**: [Product category]
  - **Positioning**: [Brand positioning]
  - **Target Audience**: [Target customers]
  - **Value Proposition**: [Customer benefits]

## 🎨 Visual Identity
- **Logo System**: [Logo variations]
- **Color Palette**: [Brand colors]
- **Typography**: [Brand fonts]
- **Imagery**: [Brand photography]

## 🔗 Brand Relationships
- **Brand Hierarchy**: [Brand structure]
- **Brand Extensions**: [Brand expansion]
- **Co-Branding**: [Partnership brands]
- **Brand Licensing**: [Licensed brands]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 🏛️ **Symbols**: Brand elements
- 🔗 **Relationships**: Brand connections
- 🎯 **Hierarchy**: Brand structure
- 📊 **Portfolio**: Brand overview`;
    }

    function createContentStrategyTemplate() {
      return `# 📝 Content Strategy Template

## 📝 Strategy Overview
**Organization**: [Company/Product/Service]
**Content Goal**: [Primary objective]
**Target Audience**: [Content consumers]
**Content Types**: [Types of content]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🎯 Content Strategy Framework

### Content Goals
- **Primary Goal**: [Main objective]
  - **Metric**: [Success measurement]
  - **Target**: [Goal value]
  - **Timeline**: [Achievement date]

- **Secondary Goals**: [Additional objectives]
  - **Metric**: [Success measurement]
  - **Target**: [Goal value]
  - **Timeline**: [Achievement date]

### Content Pillars
- **Pillar 1**: [Content theme]
  - **Topics**: [Related topics]
  - **Audience**: [Target audience]
  - **Channels**: [Distribution channels]
  - **Frequency**: [Publishing schedule]

- **Pillar 2**: [Content theme]
  - **Topics**: [Related topics]
  - **Audience**: [Target audience]
  - **Channels**: [Distribution channels]
  - **Frequency**: [Publishing schedule]

- **Pillar 3**: [Content theme]
  - **Topics**: [Related topics]
  - **Audience**: [Target audience]
  - **Channels**: [Distribution channels]
  - **Frequency**: [Publishing schedule]

## 📊 Content Types

### Educational Content
- **Blog Posts**: [Educational articles]
- **Whitepapers**: [In-depth reports]
- **Webinars**: [Online presentations]
- **Tutorials**: [How-to content]

### Entertaining Content
- **Videos**: [Video content]
- **Infographics**: [Visual content]
- **Podcasts**: [Audio content]
- **Social Media**: [Social content]

### Conversion Content
- **Case Studies**: [Success stories]
- **Product Demos**: [Product showcases]
- **Testimonials**: [Customer reviews]
- **Landing Pages**: [Conversion pages]

## 📈 Content Metrics
- **Engagement**: [Content interaction]
- **Reach**: [Content visibility]
- **Conversion**: [Action completion]
- **SEO Performance**: [Search rankings]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 📝 **Symbols**: Content elements
- 📊 **Pillars**: Content themes
- 📈 **Flow**: Content journey
- 🎯 **Goals**: Content objectives`;
    }

    function createSocialMediaStrategyTemplate() {
      return `# 📱 Social Media Strategy Template

## 📱 Strategy Overview
**Organization**: [Company/Product/Service]
**Platforms**: [Social media platforms]
**Target Audience**: [Social media users]
**Content Focus**: [Content themes]
**Last Updated**: ${new Date().toLocaleDateString()}

## 🎯 Platform Strategy

### Facebook
- **Audience**: [Target audience]
- **Content Types**: [Content formats]
- **Posting Frequency**: [Publishing schedule]
- **Engagement Strategy**: [Interaction approach]

### Instagram
- **Audience**: [Target audience]
- **Content Types**: [Content formats]
- **Posting Frequency**: [Publishing schedule]
- **Engagement Strategy**: [Interaction approach]

### LinkedIn
- **Audience**: [Target audience]
- **Content Types**: [Content formats]
- **Posting Frequency**: [Publishing schedule]
- **Engagement Strategy**: [Interaction approach]

### Twitter
- **Audience**: [Target audience]
- **Content Types**: [Content formats]
- **Posting Frequency**: [Publishing schedule]
- **Engagement Strategy**: [Interaction approach]

## 📊 Content Calendar

### Weekly Themes
- **Monday**: [Content theme]
- **Tuesday**: [Content theme]
- **Wednesday**: [Content theme]
- **Thursday**: [Content theme]
- **Friday**: [Content theme]
- **Weekend**: [Content theme]

### Content Mix
- **Educational**: [Percentage of content]
- **Entertaining**: [Percentage of content]
- **Promotional**: [Percentage of content]
- **User-Generated**: [Percentage of content]

## 📈 Performance Metrics
- **Reach**: [Content visibility]
- **Engagement**: [User interaction]
- **Follower Growth**: [Audience growth]
- **Conversion**: [Action completion]

## 🎨 Diagram Elements
Use these shapes in Diagram Builder mode:
- 📱 **Symbols**: Social platforms
- 📊 **Charts**: Performance data
- 📈 **Metrics**: Engagement rates
- 🎯 **Goals**: Strategy objectives`;
    }

    // Make functions globally available
    window.toggleFissioLibrary = toggleFissioLibrary;
    window.showFissioLibrary = showFissioLibrary;
    window.createFissioTemplate = createFissioTemplate;
  }
}); 