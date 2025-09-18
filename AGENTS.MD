# AGENTS.MD - Senior Developer Guidelines for TicketHelper Project

## Project Overview

**TicketHelper** is a multi-component application suite designed for TSDs (Technical Support Desk) on the USDA/FS/IIA/ICAM contract. The project consists of:

1. **CEC Toolkit** - HTML-based tools for processing support tickets
2. **NextNote** - Advanced note-taking application with plugin architecture
3. **Express Server** - Simple hosting solution for web components

## Architecture & Code Organization

### Current Structure
```
TicketHelper/
├── CEC_Toolkit_Working_REBUILT.html    # Standalone ticket processing tool
├── NextNote_v4_fixed.html              # Legacy NextNote version
├── NextNote-OnyxEdition/                # Current NextNote development
│   ├── NextNote.html                    # Main application
│   ├── styles.css                       # Application styles
│   └── plugins/                         # Plugin system
├── plugins/                             # Legacy plugin directory
├── lib/ & libs/                         # External libraries
├── server.js                            # Express server
└── package.json                         # Node.js dependencies
```

### Code Organization Standards

#### 1. File Structure
- **Separate concerns**: HTML, CSS, and JavaScript should be in separate files
- **Modular architecture**: Break large files into smaller, focused modules
- **Consistent naming**: Use kebab-case for files, camelCase for variables/functions
- **Clear directory structure**: Group related files logically

#### 2. JavaScript Standards
```javascript
// Use strict mode
'use strict';

// Consistent error handling
try {
    // risky operation
} catch (error) {
    console.error('Operation failed:', error);
    // Log to whatilearned.md if it's a new pattern
}

// Async/await over promises when possible
async function loadPlugin(pluginPath) {
    try {
        const response = await fetch(pluginPath);
        return await response.text();
    } catch (error) {
        console.error(`Failed to load plugin: ${pluginPath}`, error);
        throw error;
    }
}
```

#### 3. HTML Standards
- Use semantic HTML5 elements
- Include proper meta tags and accessibility attributes
- Validate markup regularly
- Keep inline styles and scripts to minimum

#### 4. CSS Standards
- Use CSS custom properties (variables) for theming
- Follow BEM methodology for class naming
- Organize styles by component
- Use responsive design principles

## Plugin Development Guidelines

### Plugin Architecture
```javascript
// Standard plugin template
window.registerNextNotePlugin({
    name: 'PluginName',
    version: '1.0.0',
    description: 'Plugin description',
    
    onLoad(app) {
        // Plugin initialization
        this.setupUI(app);
        this.bindEvents(app);
    },
    
    setupUI(app) {
        // Create plugin UI elements
    },
    
    bindEvents(app) {
        // Bind event listeners
    }
});
```

### Plugin Best Practices
1. **Error Isolation**: Wrap plugin code in try-catch blocks
2. **Resource Cleanup**: Provide cleanup methods for plugin removal
3. **Event Management**: Use the centralized event system
4. **Performance**: Lazy load heavy operations
5. **Testing**: Include unit tests for plugin functionality

## Security Best Practices

### Input Validation
```javascript
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}
```

### Data Storage
- Use IndexedDB for large data storage
- Encrypt sensitive data before storage
- Validate data integrity on load
- Implement proper backup mechanisms

### XSS Prevention
- Sanitize all user inputs
- Use Content Security Policy headers
- Validate file uploads strictly
- Escape HTML content properly

## Performance Optimization

### Loading Strategies
1. **Lazy Loading**: Load plugins and resources on demand
2. **Code Splitting**: Separate core functionality from optional features
3. **Caching**: Implement proper browser caching strategies
4. **Minification**: Minify CSS and JavaScript for production

### Memory Management
```javascript
// Proper event listener cleanup
class ComponentManager {
    constructor() {
        this.listeners = [];
    }
    
    addListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.listeners.push({ element, event, handler });
    }
    
    cleanup() {
        this.listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.listeners = [];
    }
}
```

## Testing Requirements

### Unit Testing
- Test all public functions
- Mock external dependencies
- Achieve minimum 80% code coverage
- Use descriptive test names

### Integration Testing
- Test plugin interactions
- Verify data persistence
- Test cross-browser compatibility
- Validate accessibility compliance

### Manual Testing Checklist
- [ ] All features work without JavaScript errors
- [ ] Responsive design works on mobile devices
- [ ] Keyboard navigation functions properly
- [ ] Screen readers can access content
- [ ] Performance is acceptable on slower devices

## Error Handling & Logging

### Error Logging Strategy
1. **Console Logging**: Use appropriate log levels (error, warn, info, debug)
2. **Error Tracking**: Log errors to whatilearned.md for pattern analysis
3. **User Feedback**: Provide meaningful error messages to users
4. **Recovery**: Implement graceful degradation for non-critical failures

### Error Categories
- **Critical**: Application-breaking errors
- **Warning**: Potential issues that don't break functionality
- **Info**: General operational information
- **Debug**: Detailed information for troubleshooting

## Documentation Standards

### Code Documentation
```javascript
/**
 * Loads and initializes a plugin
 * @param {string} pluginPath - Path to the plugin file
 * @param {Object} config - Plugin configuration options
 * @returns {Promise<Plugin>} Initialized plugin instance
 * @throws {Error} When plugin fails to load or initialize
 */
async function loadPlugin(pluginPath, config = {}) {
    // Implementation
}
```

### README Requirements
- Clear installation instructions
- Usage examples
- API documentation
- Contributing guidelines
- License information

## Development Workflow

### Before Starting Work
1. Check whatilearned.md for known issues
2. Review existing code patterns
3. Plan changes with minimal disruption
4. Create feature branch if using git

### During Development
1. Write tests first (TDD approach)
2. Follow established code patterns
3. Document new functionality
4. Update whatilearned.md with new insights

### Before Committing
1. Run all tests
2. Check for linting errors
3. Verify no console errors
4. Update documentation
5. Review whatilearned.md entries

## Deployment & Maintenance

### Pre-deployment Checklist
- [ ] All tests pass
- [ ] No console errors in production build
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Backup procedures verified

### Monitoring
- Track JavaScript errors in production
- Monitor performance metrics
- Review user feedback regularly
- Update dependencies regularly

## Common Patterns & Anti-patterns

### ✅ Good Patterns
- Modular, reusable components
- Consistent error handling
- Progressive enhancement
- Graceful degradation

### ❌ Anti-patterns
- Global variable pollution
- Inline event handlers
- Synchronous operations blocking UI
- Hardcoded configuration values

---

**Remember**: This document should be updated as the project evolves. Always refer to whatilearned.md for project-specific lessons and gotchas.
