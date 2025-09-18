/**
 * NextNote Security Utilities
 * Provides security functions for input sanitization, XSS prevention, and safe DOM manipulation
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.NextNoteSecurity = (function() {
  
  /**
   * Configuration for security settings
   */
  const SECURITY_CONFIG = {
    MAX_INPUT_LENGTH: 100000,
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_FILE_TYPES: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'text/plain', 'text/markdown', 'application/json',
      'application/pdf', 'text/csv'
    ],
    DANGEROUS_PROTOCOLS: ['javascript:', 'data:', 'vbscript:'],
    DANGEROUS_TAGS: [
      'script', 'iframe', 'object', 'embed', 'form', 'input',
      'textarea', 'select', 'button', 'link', 'meta', 'style'
    ],
    DANGEROUS_ATTRIBUTES: [
      'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus',
      'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect',
      'onabort', 'onunload', 'onresize', 'onscroll'
    ]
  };

  /**
   * Sanitizes HTML content to prevent XSS attacks
   * @param {string} html - The HTML content to sanitize
   * @returns {string} - Sanitized HTML content
   */
  function sanitizeHTML(html) {
    if (typeof html !== 'string') {
      return '';
    }

    // Create a temporary DOM element for parsing
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Remove dangerous tags
    SECURITY_CONFIG.DANGEROUS_TAGS.forEach(tagName => {
      const elements = temp.querySelectorAll(tagName);
      elements.forEach(el => el.remove());
    });

    // Remove dangerous attributes from all elements
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(element => {
      SECURITY_CONFIG.DANGEROUS_ATTRIBUTES.forEach(attr => {
        if (element.hasAttribute(attr)) {
          element.removeAttribute(attr);
        }
      });

      // Check href and src attributes for dangerous protocols
      ['href', 'src'].forEach(attr => {
        if (element.hasAttribute(attr)) {
          const value = element.getAttribute(attr);
          if (SECURITY_CONFIG.DANGEROUS_PROTOCOLS.some(protocol => 
              value.toLowerCase().startsWith(protocol))) {
            element.removeAttribute(attr);
          }
        }
      });
    });

    return temp.innerHTML;
  }

  /**
   * Sanitizes text input to prevent injection attacks
   * @param {string} input - The text input to sanitize
   * @returns {string} - Sanitized text
   */
  function sanitizeText(input) {
    if (typeof input !== 'string') {
      return '';
    }

    // Limit input length
    if (input.length > SECURITY_CONFIG.MAX_INPUT_LENGTH) {
      input = input.substring(0, SECURITY_CONFIG.MAX_INPUT_LENGTH);
    }

    // Remove null bytes and control characters
    input = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Escape HTML entities
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Safely sets text content of an element
   * @param {HTMLElement} element - The target element
   * @param {string} text - The text content to set
   */
  function safeSetTextContent(element, text) {
    if (!element || typeof text !== 'string') {
      return;
    }
    
    element.textContent = sanitizeText(text);
  }

  /**
   * Safely sets HTML content of an element
   * @param {HTMLElement} element - The target element
   * @param {string} html - The HTML content to set
   */
  function safeSetHTML(element, html) {
    if (!element || typeof html !== 'string') {
      return;
    }
    
    element.innerHTML = sanitizeHTML(html);
  }

  /**
   * Creates a safe event handler that prevents XSS
   * @param {Function} handler - The event handler function
   * @returns {Function} - Safe event handler
   */
  function createSafeEventHandler(handler) {
    return function(event) {
      try {
        // Prevent default if the event seems suspicious
        if (event && event.target && event.target.tagName === 'SCRIPT') {
          event.preventDefault();
          return;
        }
        
        return handler.call(this, event);
      } catch (error) {
        console.error('Error in event handler:', error);
        // Don't re-throw to prevent application crashes
      }
    };
  }

  /**
   * Validates file uploads for security
   * @param {File} file - The file to validate
   * @returns {Object} - Validation result with isValid and error properties
   */
  function validateFile(file) {
    const result = {
      isValid: true,
      error: null
    };

    if (!file) {
      result.isValid = false;
      result.error = 'No file provided';
      return result;
    }

    // Check file size
    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      result.isValid = false;
      result.error = `File size exceeds maximum allowed size of ${SECURITY_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`;
      return result;
    }

    // Check file type
    if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
      result.isValid = false;
      result.error = `File type ${file.type} is not allowed`;
      return result;
    }

    // Check file name for suspicious patterns
    const suspiciousPatterns = [
      /\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i, /\.pif$/i,
      /\.com$/i, /\.jar$/i, /\.php$/i, /\.asp$/i, /\.jsp$/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      result.isValid = false;
      result.error = 'File type not allowed based on extension';
      return result;
    }

    return result;
  }

  /**
   * Validates URLs for security
   * @param {string} url - The URL to validate
   * @returns {boolean} - True if URL is safe
   */
  function isValidURL(url) {
    if (typeof url !== 'string') {
      return false;
    }

    try {
      const urlObj = new URL(url);
      
      // Check for dangerous protocols
      if (SECURITY_CONFIG.DANGEROUS_PROTOCOLS.some(protocol => 
          urlObj.protocol.toLowerCase().startsWith(protocol.replace(':', '')))) {
        return false;
      }

      // Only allow http, https, and relative URLs
      return ['http:', 'https:', ''].includes(urlObj.protocol);
    } catch (error) {
      return false;
    }
  }

  /**
   * Creates a Content Security Policy header value
   * @returns {string} - CSP header value
   */
  function generateCSP() {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.quilljs.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.quilljs.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }

  /**
   * Logs security events for monitoring
   * @param {string} event - The security event type
   * @param {Object} details - Event details
   */
  function logSecurityEvent(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event,
      details: details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.warn('[NextNote Security]', logEntry);
    
    // In production, this would send to a security monitoring service
    // For now, we'll store in sessionStorage for debugging
    try {
      const existingLogs = JSON.parse(sessionStorage.getItem('nextnote_security_logs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 100 entries
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      sessionStorage.setItem('nextnote_security_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Initializes security measures for the application
   */
  function initializeSecurity() {
    // Add CSP meta tag if not present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      cspMeta.setAttribute('content', generateCSP());
      document.head.appendChild(cspMeta);
    }

    // Monitor for suspicious activity
    document.addEventListener('error', (event) => {
      if (event.target && event.target.tagName === 'SCRIPT') {
        logSecurityEvent('script_load_error', {
          src: event.target.src,
          message: event.message
        });
      }
    }, true);

    // Monitor for inline script attempts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'SCRIPT' && !node.src) {
              logSecurityEvent('inline_script_detected', {
                content: node.textContent.substring(0, 100)
              });
              node.remove();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    logSecurityEvent('security_initialized');
  }

  // Public API
  return {
    sanitizeHTML,
    sanitizeText,
    safeSetTextContent,
    safeSetHTML,
    createSafeEventHandler,
    validateFile,
    isValidURL,
    generateCSP,
    logSecurityEvent,
    initializeSecurity,
    
    // Configuration access (read-only)
    getConfig: () => ({ ...SECURITY_CONFIG })
  };
})();

// Initialize security when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.NextNoteSecurity.initializeSecurity);
} else {
  window.NextNoteSecurity.initializeSecurity();
}
