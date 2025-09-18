/**
 * CEC Toolkit Main Application
 * Handles UI interactions, form submissions, and coordinates all components
 */

'use strict';

(function() {
  const config = window.CECToolkitConfig;
  const utils = window.CECToolkitUtils;
  const processors = window.CECToolkitProcessors;
  
  // Application state
  let phoneProcessor = null;
  let escalationProcessor = null;
  
  /**
   * Initialize the application
   */
  function initializeApp() {
    try {
      utils.debugLog('Initializing CEC Toolkit application');
      
      // Initialize processors
      phoneProcessor = new processors.PhoneIssuesProcessor();
      escalationProcessor = new processors.EscalationProcessor();
      
      // Initialize Materialize components
      initializeMaterializeComponents();
      
      // Set up event listeners
      setupEventListeners();
      
      // Set up keyboard shortcuts
      setupKeyboardShortcuts();
      
      utils.debugLog('Application initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize application:', error);
      utils.showError('Failed to initialize application. Please refresh the page.');
    }
  }
  
  /**
   * Initialize Materialize CSS components
   */
  function initializeMaterializeComponents() {
    // Initialize tabs
    const tabs = document.querySelectorAll('.tabs');
    M.Tabs.init(tabs);
    
    // Initialize collapsibles
    const collapsibles = document.querySelectorAll('.collapsible');
    M.Collapsible.init(collapsibles);
    
    // Auto-resize textareas
    M.textareaAutoResize(document.querySelectorAll('textarea'));
  }
  
  /**
   * Set up event listeners for forms and buttons
   */
  function setupEventListeners() {
    // Phone issues form
    const phoneForm = document.getElementById('phoneIssuesForm');
    if (phoneForm) {
      phoneForm.addEventListener('submit', handlePhoneIssuesSubmit);
    }
    
    // Escalation form
    const escalationForm = document.getElementById('escalationForm');
    if (escalationForm) {
      escalationForm.addEventListener('submit', handleEscalationSubmit);
    }
    
    // Auto-resize textareas on input
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      textarea.addEventListener('input', () => {
        M.textareaAutoResize(textarea);
      });
    });
  }
  
  /**
   * Set up keyboard shortcuts
   */
  function setupKeyboardShortcuts() {
    if (!config.ACCESSIBILITY.KEYBOARD_SHORTCUTS_ENABLED) {
      return;
    }
    
    document.addEventListener('keydown', (event) => {
      // Ctrl+Enter to submit active form
      if (event.ctrlKey && event.key === 'Enter') {
        const activeElement = document.activeElement;
        const form = activeElement.closest('form');
        if (form) {
          event.preventDefault();
          form.dispatchEvent(new Event('submit'));
        }
      }
      
      // Escape to clear current form
      if (event.key === 'Escape') {
        const activeElement = document.activeElement;
        const form = activeElement.closest('form');
        if (form) {
          event.preventDefault();
          clearForm(form);
        }
      }
    });
  }
  
  /**
   * Handle phone issues form submission
   * @param {Event} event - Form submit event
   */
  async function handlePhoneIssuesSubmit(event) {
    event.preventDefault();
    
    try {
      utils.showLoading(true);
      
      const inputArea = document.getElementById('inputArea');
      const outputArea = document.getElementById('outputArea');
      
      if (!inputArea || !outputArea) {
        throw new Error('Required form elements not found');
      }
      
      const inputText = inputArea.value.trim();
      
      if (!inputText) {
        utils.showError('Please enter ticket information to process.');
        return;
      }
      
      // Process with debouncing to prevent rapid submissions
      const result = await utils.measurePerformance('Phone Issues Processing', () => {
        return phoneProcessor.process(inputText);
      });
      
      if (result.success) {
        outputArea.value = result.data.formatted;
        M.textareaAutoResize(outputArea);
        
        if (config.ACCESSIBILITY.ANNOUNCE_RESULTS) {
          announceToScreenReader('Phone issues processing completed successfully');
        }
        
        utils.showSuccess('Phone issues information extracted successfully!');
      } else {
        utils.showError(result.error);
        outputArea.value = '';
      }
      
    } catch (error) {
      console.error('Error processing phone issues:', error);
      utils.showError('An unexpected error occurred while processing the phone issues.');
    } finally {
      utils.showLoading(false);
    }
  }
  
  /**
   * Handle escalation form submission
   * @param {Event} event - Form submit event
   */
  async function handleEscalationSubmit(event) {
    event.preventDefault();
    
    try {
      utils.showLoading(true);
      
      const peopleRecordInput = document.getElementById('peopleRecordInput');
      const notesInput = document.getElementById('notesInput');
      const outputArea = document.getElementById('cecEscalationOutput');
      
      if (!peopleRecordInput || !notesInput || !outputArea) {
        throw new Error('Required form elements not found');
      }
      
      const peopleRecordText = peopleRecordInput.value.trim();
      const notesText = notesInput.value.trim();
      
      if (!peopleRecordText || !notesText) {
        utils.showError('Please enter both People Record and Notes information.');
        return;
      }
      
      // Process with performance measurement
      const result = await utils.measurePerformance('Escalation Processing', () => {
        return escalationProcessor.process(peopleRecordText, notesText);
      });
      
      if (result.success) {
        outputArea.value = result.data.formatted;
        M.textareaAutoResize(outputArea);
        
        if (config.ACCESSIBILITY.ANNOUNCE_RESULTS) {
          announceToScreenReader('Escalation template generated successfully');
        }
        
        utils.showSuccess('Escalation template generated successfully!');
      } else {
        utils.showError(result.error);
        outputArea.value = '';
      }
      
    } catch (error) {
      console.error('Error processing escalation:', error);
      utils.showError('An unexpected error occurred while processing the escalation.');
    } finally {
      utils.showLoading(false);
    }
  }
  
  /**
   * Clear phone issues form fields
   */
  function clearPhoneFields() {
    const inputArea = document.getElementById('inputArea');
    const outputArea = document.getElementById('outputArea');
    
    if (inputArea) inputArea.value = '';
    if (outputArea) outputArea.value = '';
    
    // Auto-resize textareas
    [inputArea, outputArea].forEach(element => {
      if (element) M.textareaAutoResize(element);
    });
    
    utils.showSuccess(config.MESSAGES.FIELDS_CLEARED);
  }
  
  /**
   * Clear escalation form fields
   */
  function clearEscalationFields() {
    const peopleRecordInput = document.getElementById('peopleRecordInput');
    const notesInput = document.getElementById('notesInput');
    const outputArea = document.getElementById('cecEscalationOutput');
    
    if (peopleRecordInput) peopleRecordInput.value = '';
    if (notesInput) notesInput.value = '';
    if (outputArea) outputArea.value = '';
    
    // Auto-resize textareas
    [peopleRecordInput, notesInput, outputArea].forEach(element => {
      if (element) M.textareaAutoResize(element);
    });
    
    utils.showSuccess(config.MESSAGES.FIELDS_CLEARED);
  }
  
  /**
   * Clear a specific form
   * @param {HTMLFormElement} form - The form to clear
   */
  function clearForm(form) {
    const textareas = form.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      textarea.value = '';
      M.textareaAutoResize(textarea);
    });
    
    utils.showSuccess(config.MESSAGES.FIELDS_CLEARED);
  }
  
  /**
   * Copy content to clipboard from a textarea
   * @param {string} elementId - ID of the textarea element
   */
  async function copyToClipboard(elementId) {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        utils.showError('Element not found for copying.');
        return;
      }
      
      const text = element.value.trim();
      if (!text) {
        utils.showError('No content to copy.');
        return;
      }
      
      const success = await utils.copyToClipboard(text);
      if (success) {
        utils.showSuccess(config.MESSAGES.COPIED_TO_CLIPBOARD);
        
        if (config.ACCESSIBILITY.ANNOUNCE_RESULTS) {
          announceToScreenReader('Content copied to clipboard');
        }
      } else {
        utils.showError('Failed to copy to clipboard. Please try selecting and copying manually.');
      }
      
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      utils.showError('Failed to copy to clipboard.');
    }
  }
  
  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   */
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  // Make functions available globally for onclick handlers
  window.clearPhoneFields = clearPhoneFields;
  window.clearEscalationFields = clearEscalationFields;
  window.copyToClipboard = copyToClipboard;
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
  
})();
