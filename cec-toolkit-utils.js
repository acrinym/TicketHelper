/**
 * CEC Toolkit Utility Functions
 * Reusable utility functions for validation, sanitization, and common operations
 */

'use strict';

window.CECToolkitUtils = (function() {
  const config = window.CECToolkitConfig;
  
  /**
   * Sanitizes input text to prevent XSS attacks
   * @param {string} input - The input text to sanitize
   * @returns {string} - Sanitized text
   */
  function sanitizeInput(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Remove script tags and other potentially dangerous HTML
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    // Limit length to prevent DoS attacks
    if (sanitized.length > config.SECURITY.MAX_INPUT_LENGTH) {
      sanitized = sanitized.substring(0, config.SECURITY.MAX_INPUT_LENGTH);
    }
    
    return sanitized;
  }
  
  /**
   * Validates input text
   * @param {string} input - The input text to validate
   * @returns {Object} - Validation result with isValid and errors properties
   */
  function validateInput(input) {
    const result = {
      isValid: true,
      errors: []
    };
    
    if (!input || typeof input !== 'string') {
      result.isValid = false;
      result.errors.push('Input is required and must be text');
      return result;
    }
    
    if (input.trim().length === 0) {
      result.isValid = false;
      result.errors.push('Input cannot be empty');
      return result;
    }
    
    if (input.length > config.SECURITY.MAX_INPUT_LENGTH) {
      result.isValid = false;
      result.errors.push(`Input is too long (maximum ${config.SECURITY.MAX_INPUT_LENGTH} characters)`);
      return result;
    }
    
    return result;
  }
  
  /**
   * Safely extracts text using a regex pattern
   * @param {RegExp} pattern - The regex pattern to use
   * @param {string} text - The text to search in
   * @param {number} groupIndex - The capture group index (default: 1)
   * @returns {string} - Extracted text or empty string
   */
  function safeExtract(pattern, text, groupIndex = 1) {
    try {
      if (!pattern || !text) {
        return '';
      }
      
      const match = text.match(pattern);
      if (match && match[groupIndex]) {
        return match[groupIndex].trim();
      }
      
      return '';
    } catch (error) {
      console.error('Error in safeExtract:', error);
      return '';
    }
  }
  
  /**
   * Extracts multiple matches using a regex pattern
   * @param {RegExp} pattern - The regex pattern to use (must have global flag)
   * @param {string} text - The text to search in
   * @param {number} groupIndex - The capture group index (default: 1)
   * @returns {Array<string>} - Array of extracted matches
   */
  function safeExtractMultiple(pattern, text, groupIndex = 1) {
    try {
      if (!pattern || !text) {
        return [];
      }
      
      const matches = [];
      let match;
      
      // Reset regex lastIndex to ensure consistent behavior
      pattern.lastIndex = 0;
      
      while ((match = pattern.exec(text)) !== null) {
        if (match[groupIndex]) {
          matches.push(match[groupIndex].trim());
        }
        
        // Prevent infinite loop for non-global regex
        if (!pattern.global) {
          break;
        }
      }
      
      return matches;
    } catch (error) {
      console.error('Error in safeExtractMultiple:', error);
      return [];
    }
  }
  
  /**
   * Checks if a string matches any of the provided keywords
   * @param {string} text - The text to check
   * @param {Array<string>} keywords - Array of keywords to match
   * @returns {boolean} - True if any keyword is found
   */
  function containsKeywords(text, keywords) {
    if (!text || !Array.isArray(keywords)) {
      return false;
    }
    
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }
  
  /**
   * Formats a phone number for display
   * @param {string} phone - The phone number to format
   * @returns {string} - Formatted phone number
   */
  function formatPhoneNumber(phone) {
    if (!phone) {
      return '';
    }
    
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    
    // Return original if can't format
    return phone;
  }
  
  /**
   * Validates an email address
   * @param {string} email - The email to validate
   * @returns {boolean} - True if email is valid
   */
  function isValidEmail(email) {
    if (!email) {
      return false;
    }
    
    return config.VALIDATION.EMAIL.test(email);
  }
  
  /**
   * Validates an IP address
   * @param {string} ip - The IP address to validate
   * @returns {boolean} - True if IP is valid
   */
  function isValidIP(ip) {
    if (!ip) {
      return false;
    }
    
    return config.VALIDATION.IP_ADDRESS.test(ip);
  }
  
  /**
   * Debounces a function call
   * @param {Function} func - The function to debounce
   * @param {number} delay - The delay in milliseconds
   * @returns {Function} - Debounced function
   */
  function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
  
  /**
   * Shows a loading state
   * @param {boolean} show - Whether to show or hide loading
   */
  function showLoading(show = true) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
      overlay.setAttribute('aria-hidden', show ? 'false' : 'true');
    }
  }
  
  /**
   * Shows an error message to the user
   * @param {string} message - The error message to display
   */
  function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorAlert && errorMessage) {
      errorMessage.textContent = message || config.MESSAGES.ERROR_GENERIC;
      errorAlert.style.display = 'block';
      
      // Auto-hide after timeout
      setTimeout(() => {
        hideError();
      }, config.TIMEOUTS.ERROR_MESSAGE);
    }
  }
  
  /**
   * Hides the error message
   */
  function hideError() {
    const errorAlert = document.getElementById('errorAlert');
    if (errorAlert) {
      errorAlert.style.display = 'none';
    }
  }
  
  /**
   * Shows a success message to the user
   * @param {string} message - The success message to display
   */
  function showSuccess(message) {
    const successAlert = document.getElementById('successAlert');
    const successMessage = document.getElementById('successMessage');
    
    if (successAlert && successMessage) {
      successMessage.textContent = message || config.MESSAGES.SUCCESS;
      successAlert.style.display = 'block';
      
      // Auto-hide after timeout
      setTimeout(() => {
        hideSuccess();
      }, config.TIMEOUTS.SUCCESS_MESSAGE);
    }
  }
  
  /**
   * Hides the success message
   */
  function hideSuccess() {
    const successAlert = document.getElementById('successAlert');
    if (successAlert) {
      successAlert.style.display = 'none';
    }
  }
  
  /**
   * Copies text to clipboard
   * @param {string} text - The text to copy
   * @returns {Promise<boolean>} - True if successful
   */
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        return result;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
  
  /**
   * Logs debug information if debug mode is enabled
   * @param {string} message - The debug message
   * @param {*} data - Additional data to log
   */
  function debugLog(message, data = null) {
    if (config.DEBUG.ENABLED) {
      console.log(`[CEC Toolkit Debug] ${message}`, data);
    }
  }
  
  /**
   * Measures and logs performance if performance logging is enabled
   * @param {string} operation - The operation name
   * @param {Function} func - The function to measure
   * @returns {*} - The result of the function
   */
  function measurePerformance(operation, func) {
    if (!config.DEBUG.LOG_PERFORMANCE) {
      return func();
    }
    
    const startTime = performance.now();
    const result = func();
    const endTime = performance.now();
    
    console.log(`[CEC Toolkit Performance] ${operation}: ${(endTime - startTime).toFixed(2)}ms`);
    
    return result;
  }
  
  // Public API
  return {
    sanitizeInput,
    validateInput,
    safeExtract,
    safeExtractMultiple,
    containsKeywords,
    formatPhoneNumber,
    isValidEmail,
    isValidIP,
    debounce,
    showLoading,
    showError,
    hideError,
    showSuccess,
    hideSuccess,
    copyToClipboard,
    debugLog,
    measurePerformance
  };
})();

// Make functions available globally for backward compatibility
window.showError = window.CECToolkitUtils.showError;
window.hideError = window.CECToolkitUtils.hideError;
window.showSuccess = window.CECToolkitUtils.showSuccess;
window.hideSuccess = window.CECToolkitUtils.hideSuccess;
