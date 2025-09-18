/**
 * CEC Toolkit Processors
 * Contains the main business logic for extracting and processing ticket information
 */

'use strict';

window.CECToolkitProcessors = (function() {
  const config = window.CECToolkitConfig;
  const utils = window.CECToolkitUtils;
  
  /**
   * Phone Issues Processor Class
   * Handles extraction of phone-related ticket information
   */
  class PhoneIssuesProcessor {
    constructor() {
      this.patterns = config.PHONE_PATTERNS;
      this.outputTemplate = config.OUTPUT_TEMPLATES.PHONE_FIELDS;
    }
    
    /**
     * Processes phone issues ticket text
     * @param {string} inputText - The raw ticket text
     * @returns {Object} - Processing result with success flag and data
     */
    process(inputText) {
      try {
        utils.debugLog('Processing phone issues ticket', { inputLength: inputText.length });
        
        // Validate input
        const validation = utils.validateInput(inputText);
        if (!validation.isValid) {
          return {
            success: false,
            error: validation.errors.join(', '),
            data: null
          };
        }
        
        // Sanitize input
        const sanitizedText = utils.sanitizeInput(inputText);
        
        // Extract information
        const extractedData = this.extractPhoneIssueFields(sanitizedText);
        
        // Format output
        const formattedOutput = this.formatPhoneOutput(extractedData);
        
        utils.debugLog('Phone issues processing completed', extractedData);
        
        return {
          success: true,
          error: null,
          data: {
            extracted: extractedData,
            formatted: formattedOutput
          }
        };
        
      } catch (error) {
        console.error('Error processing phone issues:', error);
        return {
          success: false,
          error: config.MESSAGES.ERROR_EXTRACTION_FAILED,
          data: null
        };
      }
    }
    
    /**
     * Extracts individual fields from phone issues ticket
     * @param {string} text - The sanitized ticket text
     * @returns {Object} - Extracted field data
     */
    extractPhoneIssueFields(text) {
      const data = {};
      
      // Extract basic information
      data.phoneDisplayName = utils.safeExtract(this.patterns.NAME, text);
      
      // Extract phone numbers (handle multiple phone entries)
      const phoneMatches = utils.safeExtractMultiple(this.patterns.PHONE_MULTIPLE, text);
      data.phoneAffected = phoneMatches.length > 0 ? phoneMatches[0] : '';
      
      // Extract other fields
      data.location = utils.safeExtract(this.patterns.ADDRESS, text);
      data.troubleshootPhone = utils.safeExtract(this.patterns.TROUBLESHOOT_PHONE, text);
      data.email = utils.safeExtract(this.patterns.EMAIL, text);
      
      // Extract agency with fallback
      data.agency = utils.safeExtract(this.patterns.ACCOUNT_AGENCY, text) || 
                   utils.safeExtract(this.patterns.AGENCY, text);
      
      data.issueDescription = utils.safeExtract(this.patterns.ISSUE_DESCRIPTION, text);
      data.troubleshootingSteps = utils.safeExtract(this.patterns.TROUBLESHOOTING_STEPS, text);
      data.usersAffected = utils.safeExtract(this.patterns.USERS_AFFECTED, text);
      
      return data;
    }
    
    /**
     * Formats extracted data into output string
     * @param {Object} data - Extracted field data
     * @returns {string} - Formatted output string
     */
    formatPhoneOutput(data) {
      const outputLines = [];
      const notProvided = config.MESSAGES.USER_NOT_PROVIDED;
      
      outputLines.push(`${this.outputTemplate[0]}: ${data.phoneDisplayName || notProvided}`);
      outputLines.push(`${this.outputTemplate[1]}: ${data.phoneAffected || notProvided}`);
      outputLines.push(`${this.outputTemplate[2]}: ${data.location || notProvided}`);
      outputLines.push(`${this.outputTemplate[3]}: ${data.troubleshootPhone || notProvided}`);
      outputLines.push(`${this.outputTemplate[4]}: ${data.email || notProvided}`);
      outputLines.push(`${this.outputTemplate[5]}: ${data.agency || notProvided}`);
      outputLines.push(`${this.outputTemplate[6]}: ${data.issueDescription || notProvided}`);
      outputLines.push(`${this.outputTemplate[7]}: ${data.troubleshootingSteps || notProvided}`);
      outputLines.push(`${this.outputTemplate[8]}: ${data.usersAffected || notProvided}`);
      
      return outputLines.join('\n');
    }
  }
  
  /**
   * Escalation Processor Class
   * Handles extraction of escalation-related information
   */
  class EscalationProcessor {
    constructor() {
      this.patterns = config.ESCALATION_PATTERNS;
      this.outputTemplate = config.OUTPUT_TEMPLATES.ESCALATION_FIELDS;
      this.keywords = config.ESCALATION_KEYWORDS;
      this.reasons = config.ESCALATION_REASONS;
    }
    
    /**
     * Processes escalation ticket information
     * @param {string} peopleRecordText - People record text
     * @param {string} notesText - Notes field text
     * @returns {Object} - Processing result with success flag and data
     */
    process(peopleRecordText, notesText) {
      try {
        utils.debugLog('Processing escalation ticket', { 
          peopleRecordLength: peopleRecordText.length,
          notesLength: notesText.length 
        });
        
        // Validate inputs
        const peopleValidation = utils.validateInput(peopleRecordText);
        const notesValidation = utils.validateInput(notesText);
        
        if (!peopleValidation.isValid || !notesValidation.isValid) {
          const errors = [...peopleValidation.errors, ...notesValidation.errors];
          return {
            success: false,
            error: errors.join(', '),
            data: null
          };
        }
        
        // Sanitize inputs
        const sanitizedPeopleRecord = utils.sanitizeInput(peopleRecordText);
        const sanitizedNotes = utils.sanitizeInput(notesText);
        
        // Extract information
        const extractedData = this.extractEscalationFields(sanitizedPeopleRecord, sanitizedNotes);
        
        // Format output
        const formattedOutput = this.formatEscalationOutput(extractedData);
        
        utils.debugLog('Escalation processing completed', extractedData);
        
        return {
          success: true,
          error: null,
          data: {
            extracted: extractedData,
            formatted: formattedOutput
          }
        };
        
      } catch (error) {
        console.error('Error processing escalation:', error);
        return {
          success: false,
          error: config.MESSAGES.ERROR_EXTRACTION_FAILED,
          data: null
        };
      }
    }
    
    /**
     * Extracts individual fields from escalation data
     * @param {string} peopleRecordText - People record text
     * @param {string} notesText - Notes field text
     * @returns {Object} - Extracted field data
     */
    extractEscalationFields(peopleRecordText, notesText) {
      const data = {};
      const notProvided = config.MESSAGES.USER_NOT_PROVIDED;
      
      // Extract name with multiple format support
      data.name = this.extractName(peopleRecordText, notesText);
      
      // Extract contact information
      data.phone = this.extractPhone(peopleRecordText, notesText);
      data.email = utils.safeExtract(this.patterns.EMAIL_PEOPLE_RECORD, peopleRecordText);
      
      // Extract agency information
      data.agency = this.extractAgency(peopleRecordText, notesText);
      
      // Extract work hours
      data.workHours = utils.safeExtract(this.patterns.WORK_HOURS, notesText);
      
      // Extract building/location information
      data.building = this.extractBuilding(peopleRecordText, notesText);
      
      // Extract room/cube
      data.roomCube = utils.safeExtract(this.patterns.ROOM_CUBE, notesText);
      
      // Extract technical information
      data.computerName = utils.safeExtract(this.patterns.COMPUTER_NAME, notesText);
      data.ipAddress = utils.safeExtract(this.patterns.IP_ADDRESS, notesText);
      
      // Extract issue information
      data.criticalDeadline = utils.safeExtract(this.patterns.CRITICAL_DEADLINE, notesText);
      data.problemDetails = utils.safeExtract(this.patterns.PROBLEM_DETAILS, notesText);
      data.troubleshootingSteps = utils.safeExtract(this.patterns.TROUBLESHOOTING_STEPS, notesText);
      
      // Extract or infer escalation reason
      data.escalationReason = this.extractEscalationReason(notesText, data);
      
      return data;
    }
    
    /**
     * Extracts name from people record with format handling
     * @param {string} peopleRecordText - People record text
     * @param {string} notesText - Notes text for fallback
     * @returns {string} - Extracted name
     */
    extractName(peopleRecordText, notesText) {
      // Try comma format first (Lastname, Firstname)
      const commaMatch = peopleRecordText.match(this.patterns.NAME_COMMA_FORMAT);
      if (commaMatch && commaMatch.length >= 3) {
        return `${commaMatch[2].trim()} ${commaMatch[1].trim()}`;
      }
      
      // Try no comma format
      const noCommaMatch = utils.safeExtract(this.patterns.NAME_NO_COMMA, peopleRecordText);
      if (noCommaMatch) {
        return noCommaMatch;
      }
      
      // Fallback to account name from notes
      return utils.safeExtract(this.patterns.ACCOUNT_NAME, notesText);
    }
    
    /**
     * Extracts phone number with priority handling
     * @param {string} peopleRecordText - People record text
     * @param {string} notesText - Notes text for fallback
     * @returns {string} - Extracted phone number
     */
    extractPhone(peopleRecordText, notesText) {
      return utils.safeExtract(this.patterns.PHONE_PEOPLE_RECORD, peopleRecordText) ||
             utils.safeExtract(this.patterns.PHONE_NOTES, notesText);
    }
    
    /**
     * Extracts agency with fallback logic
     * @param {string} peopleRecordText - People record text
     * @param {string} notesText - Notes text
     * @returns {string} - Extracted agency
     */
    extractAgency(peopleRecordText, notesText) {
      let agency = utils.safeExtract(this.patterns.ACCOUNT_AGENCY, notesText) ||
                   utils.safeExtract(this.patterns.AGENCY, notesText);
      
      if (!agency) {
        const siteMatch = peopleRecordText.match(this.patterns.SITE);
        if (siteMatch) {
          const siteValue = siteMatch[1].trim();
          if (siteValue.length <= 5 && config.VALIDATION.SITE_CODE.test(siteValue)) {
            agency = siteValue;
          }
        }
      }
      
      return agency;
    }
    
    /**
     * Extracts building information with multiple fallbacks
     * @param {string} peopleRecordText - People record text
     * @param {string} notesText - Notes text
     * @returns {string} - Extracted building information
     */
    extractBuilding(peopleRecordText, notesText) {
      // Check working from home question
      const wfhMatch = notesText.match(this.patterns.WORKING_FROM_HOME);
      if (wfhMatch) {
        const answer = wfhMatch[1].trim();
        if (/yes|working from home/i.test(answer)) {
          return 'Working from home';
        } else if (/no/i.test(answer)) {
          const afterNo = answer.replace(/no[\s,:-]*/i, '').trim();
          if (afterNo && !utils.isValidIP(afterNo)) {
            return afterNo;
          }
        }
      }
      
      // Try address from notes
      const notesAddr = utils.safeExtract(this.patterns.ADDRESS_NOTES, notesText);
      if (notesAddr && !utils.isValidIP(notesAddr)) {
        return notesAddr;
      }
      
      // Try address from people record
      const recordAddr = utils.safeExtract(this.patterns.ADDRESS_PEOPLE_RECORD, peopleRecordText);
      if (recordAddr && !utils.isValidIP(recordAddr)) {
        return recordAddr;
      }
      
      return `${config.MESSAGES.USER_NOT_PROVIDED}. Is address in people record?`;
    }
    
    /**
     * Extracts or infers escalation reason
     * @param {string} notesText - Notes text
     * @param {Object} data - Previously extracted data
     * @returns {string} - Escalation reason
     */
    extractEscalationReason(notesText, data) {
      // Try explicit escalation reason first
      let reason = utils.safeExtract(this.patterns.ESCALATION_REASON, notesText);
      
      if (!reason || reason === config.MESSAGES.USER_NOT_PROVIDED) {
        // Infer from problem details and troubleshooting steps
        const problemDetails = data.problemDetails || '';
        const troubleshootingSteps = data.troubleshootingSteps || '';
        
        // Check for specific keywords
        if (utils.containsKeywords(problemDetails, this.keywords.ADMIN_PRIVILEGES)) {
          reason = this.reasons.ADMIN_PRIVILEGES;
        } else if (utils.containsKeywords(troubleshootingSteps, this.keywords.NO_TROUBLESHOOTING)) {
          reason = this.reasons.NO_TROUBLESHOOTING;
        } else if (utils.containsKeywords(problemDetails, this.keywords.SPAM_CALLS)) {
          reason = this.reasons.SPAM_CALLS;
        } else if (utils.containsKeywords(problemDetails, this.keywords.APPLICATION_ISSUES)) {
          reason = this.reasons.APPLICATION_ISSUES;
        } else if (problemDetails && problemDetails !== config.MESSAGES.USER_NOT_PROVIDED) {
          reason = this.reasons.FALLBACK_PREFIX + problemDetails;
        } else {
          reason = this.reasons.NO_REASON;
        }
      }
      
      return reason;
    }
    
    /**
     * Formats extracted data into output string
     * @param {Object} data - Extracted field data
     * @returns {string} - Formatted output string
     */
    formatEscalationOutput(data) {
      const outputLines = [];
      const notProvided = config.MESSAGES.USER_NOT_PROVIDED;
      
      outputLines.push(`${this.outputTemplate[0]}: ${data.name || notProvided}`);
      outputLines.push(`${this.outputTemplate[1]}: ${data.phone || notProvided}`);
      outputLines.push(`${this.outputTemplate[2]}: ${data.email || notProvided}`);
      outputLines.push(`${this.outputTemplate[3]}: ${data.agency || notProvided}`);
      outputLines.push(`${this.outputTemplate[4]}: ${data.workHours || notProvided}`);
      outputLines.push(`${this.outputTemplate[5]}: ${data.building || notProvided}`);
      outputLines.push(`${this.outputTemplate[6]}: ${data.roomCube || notProvided}`);
      outputLines.push(`${this.outputTemplate[7]}: ${data.computerName || notProvided}`);
      outputLines.push(`${this.outputTemplate[8]}: ${data.ipAddress || notProvided}`);
      outputLines.push(`${this.outputTemplate[9]}: ${data.criticalDeadline || notProvided}`);
      outputLines.push(`${this.outputTemplate[10]}: ${data.problemDetails || notProvided}`);
      outputLines.push(`${this.outputTemplate[11]}: ${data.troubleshootingSteps || notProvided}`);
      outputLines.push(`${this.outputTemplate[12]}: ${data.escalationReason || notProvided}`);
      
      return outputLines.join('\n');
    }
  }
  
  // Public API
  return {
    PhoneIssuesProcessor,
    EscalationProcessor
  };
})();
