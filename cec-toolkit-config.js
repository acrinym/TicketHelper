/**
 * CEC Toolkit Configuration
 * Contains all regex patterns, constants, and configuration settings
 * Centralized configuration for easier maintenance and testing
 */

'use strict';

window.CECToolkitConfig = {
  // Application Constants
  APP_NAME: 'CEC Toolkit',
  VERSION: '2.0.0',
  
  // User Interface Messages
  MESSAGES: {
    USER_NOT_PROVIDED: 'User did not provide',
    PROCESSING: 'Processing...',
    SUCCESS: 'Operation completed successfully',
    ERROR_GENERIC: 'An error occurred while processing your request',
    ERROR_INVALID_INPUT: 'Please provide valid input data',
    ERROR_EXTRACTION_FAILED: 'Failed to extract information from the provided text',
    COPIED_TO_CLIPBOARD: 'Results copied to clipboard',
    FIELDS_CLEARED: 'All fields have been cleared'
  },
  
  // Timeout Settings (in milliseconds)
  TIMEOUTS: {
    PROCESSING_DELAY: 100,
    SUCCESS_MESSAGE: 3000,
    ERROR_MESSAGE: 5000
  },
  
  // Phone Issues Extraction Patterns
  PHONE_PATTERNS: {
    // Basic field extraction patterns
    NAME: /^\s*Name:\s*(.+)$/m,
    PHONE_MULTIPLE: /^\s*Phone:\s*([\d\s\-]+)/gm,
    PHONE_SINGLE: /^\s*Phone:\s*([\d\s\-]+)/m,
    ADDRESS: /^\s*Address:\s*(.+)$/m,
    EMAIL: /^\s*Email:\s*([\w.\-]+@[\w.\-]+)/m,
    
    // Agency patterns with fallbacks
    ACCOUNT_AGENCY: /^\s*Account Agency:\s*(.+)$/m,
    AGENCY: /^\s*Agency:\s*(.+)/m,
    
    // Issue description patterns
    ISSUE_DESCRIPTION: /^\s*Detailed description of the issue.*?:\s*(.+)$/im,
    TROUBLESHOOTING_STEPS: /^\s*Describe any troubleshooting steps.*?:\s*(.+)$/im,
    USERS_AFFECTED: /^\s*Number of users affected:\s*(\d+)/im,
    
    // Contact information
    TROUBLESHOOT_PHONE: /Provide the best phone number to reach you:\s*([\d\s\-]+)/i
  },
  
  // Escalation Extraction Patterns
  ESCALATION_PATTERNS: {
    // Name extraction patterns
    NAME_COMMA_FORMAT: /^Name:\s*([^,]+),\s*([^P]+?)(?:Preferred Name:|Corporate ID:|$)/im,
    NAME_NO_COMMA: /^Name:\s*(.+?)(?:Preferred Name:|Corporate ID:|$)/im,
    ACCOUNT_NAME: /Account Name:\s*USDA\\([\w\s.]+)/i,
    
    // Contact information
    PHONE_PEOPLE_RECORD: /^Phone:\s*([\d\s\-()]+)/im,
    PHONE_NOTES: /Provide the best phone number to reach you:\s*([\d\s\-()]+)/i,
    EMAIL_PEOPLE_RECORD: /^Email:\s*([\w\-.]+@[\w\-.]+)/im,
    
    // Agency and location
    ACCOUNT_AGENCY: /Account Agency:\s*(.+)/i,
    AGENCY: /Agency:\s*(.+)/i,
    SITE: /^Site:\s*(\w+)/im,
    
    // Work information
    WORK_HOURS: /Provide your duty days and hours.*?:\s*((?:.|\n)*?)(?=\s*\d+\.\s*|\s*Please Note:|---------------------------------------------------------------)/i,
    
    // Location patterns
    WORKING_FROM_HOME: /Are you working from home.*?:\s*(.+)$/im,
    ADDRESS_NOTES: /^\s*Address:\s*(.+)$/im,
    ADDRESS_PEOPLE_RECORD: /^\s*Address:\s*(.+)$/im,
    ROOM_CUBE: /Room\/cube:\s*(.+)/i,
    
    // Technical information
    COMPUTER_NAME: /Computer Name:\s*(.+)/i,
    IP_ADDRESS: /IP Address:\s*(.+)/i,
    
    // Issue details
    CRITICAL_DEADLINE: /Is this issue impacting your ability to meet a critical deadline for your Agency\?[\s\r\n]*(.+?)(?=\s*\d+\.\s*Preferred contact method|\s*\d+\.\s*Provide the best phone number|\s*Please Note:|---------------------------------------------------------------)/i,
    PROBLEM_DETAILS: /Detailed description of the issue\s*\/ error, and any relevant screenshot\(s\) as attachments.*?:\s*((?:.|\n)*?)(?=\s*\d+\.\s*Describe any troubleshooting steps|\s*Please Note:|---------------------------------------------------------------)/i,
    TROUBLESHOOTING_STEPS: /Describe any troubleshooting steps.*?:\s*((?:.|\n)*?)(?=\s*\d+\.\s*|\s*Please Note:|---------------------------------------------------------------)/i,
    ESCALATION_REASON: /Reason for escalating to tier 2.0:\s*(.+)$/im
  },
  
  // Validation Patterns
  VALIDATION: {
    IP_ADDRESS: /^\d{1,3}(?:\.\d{1,3}){3}$/,
    PHONE_NUMBER: /^[\d\s\-()]+$/,
    EMAIL: /^[\w.\-]+@[\w.\-]+\.[a-zA-Z]{2,}$/,
    SITE_CODE: /^[A-Z0-9]+$/
  },
  
  // Escalation Reason Keywords and Patterns
  ESCALATION_KEYWORDS: {
    ADMIN_PRIVILEGES: ['admin privileges', 'software install', 'install software'],
    NO_TROUBLESHOOTING: ['no troubleshooting steps were performed', 'informed my supervisor and he recommended i submit a cec help ticket'],
    SPAM_CALLS: ['spam calls'],
    APPLICATION_ISSUES: ['does not disconnect', 'will hang', 'end the process', 'crashes', 'not responding', 'freezes']
  },
  
  // Escalation Reason Templates
  ESCALATION_REASONS: {
    ADMIN_PRIVILEGES: 'User requires administrative privileges or software installation.',
    NO_TROUBLESHOOTING: 'User informed supervisor and was advised to submit a ticket; implies issue beyond user\'s troubleshooting capability.',
    SPAM_CALLS: 'Recurring spam call issue requires higher-level investigation or network/phone system intervention.',
    APPLICATION_ISSUES: 'Application instability (e.g., hanging, crashing) requires Tier 2.0 investigation.',
    FALLBACK_PREFIX: 'Escalated due to: ',
    NO_REASON: 'Not explicitly stated or inferred. Requires manual review.'
  },
  
  // Output Field Templates
  OUTPUT_TEMPLATES: {
    PHONE_FIELDS: [
      'Phone display name (affected phone)',
      'Phone number (affected phone)',
      'Location (Building, floor, room, cube)',
      'Phone number to reach user for troubleshooting',
      'Email address',
      'Agency',
      'Detailed description of issue',
      'Detailed troubleshooting steps',
      'Number of users affected'
    ],
    
    ESCALATION_FIELDS: [
      'Name',
      'Phone',
      'Email',
      'Agency',
      'Work Hours (HH:MM EST/HH:MM EST D-D)',
      'Building',
      'Room/cube',
      'Computer Name',
      'IP Address',
      'Is this issue impacting critical deadline?',
      'Exact Problem Details (Error Message)',
      'Troubleshooting steps',
      'Reason for escalating to tier 2.0'
    ]
  },
  
  // Security Settings
  SECURITY: {
    MAX_INPUT_LENGTH: 50000, // Maximum characters allowed in input fields
    ALLOWED_HTML_TAGS: [], // No HTML tags allowed in input
    SANITIZATION_ENABLED: true
  },
  
  // Performance Settings
  PERFORMANCE: {
    DEBOUNCE_DELAY: 300, // Milliseconds to wait before processing input
    MAX_PROCESSING_TIME: 10000 // Maximum time allowed for processing (10 seconds)
  },
  
  // Accessibility Settings
  ACCESSIBILITY: {
    ANNOUNCE_RESULTS: true, // Whether to announce results to screen readers
    HIGH_CONTRAST_MODE: false, // Can be toggled by user
    KEYBOARD_SHORTCUTS_ENABLED: true
  },
  
  // Development and Debug Settings
  DEBUG: {
    ENABLED: false, // Set to true for development
    LOG_EXTRACTIONS: false, // Log extraction results to console
    LOG_PERFORMANCE: false // Log performance metrics
  }
};

// Freeze the configuration object to prevent accidental modifications
Object.freeze(window.CECToolkitConfig);

// Export for testing environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.CECToolkitConfig;
}
