/**
 * NextNote PDF Exporter
 * Provides PDF export functionality using html2pdf.js library
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.NextNotePDFExporter = (function() {
  const security = window.NextNoteSecurity;
  
  /**
   * PDF export configuration
   */
  const PDF_CONFIG = {
    margin: [10, 10, 10, 10], // top, right, bottom, left in mm
    filename: 'nextnote-export.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  /**
   * Loads html2pdf library if not already loaded
   * @returns {Promise<boolean>} - True if loaded successfully
   */
  async function loadHtml2PdfLibrary() {
    if (window.html2pdf) {
      return true;
    }

    try {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.integrity = 'sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==';
      script.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load html2pdf library'));
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Error loading html2pdf library:', error);
      return false;
    }
  }

  /**
   * Exports a single page to PDF
   * @param {Object} page - Page object to export
   * @param {Object} options - Export options
   * @returns {Promise<boolean>} - Success status
   */
  async function exportPageToPDF(page, options = {}) {
    try {
      // Load library if needed
      if (!await loadHtml2PdfLibrary()) {
        throw new Error('Failed to load PDF export library');
      }

      // Prepare content
      const htmlContent = createPDFContent([page], options);
      
      // Configure PDF options
      const pdfOptions = {
        ...PDF_CONFIG,
        filename: options.filename || `${sanitizeFilename(page.title)}.pdf`,
        ...options.pdfConfig
      };

      // Generate PDF
      await html2pdf()
        .set(pdfOptions)
        .from(htmlContent)
        .save();

      security.logSecurityEvent('pdf_export_success', {
        type: 'single_page',
        pageId: page.id,
        filename: pdfOptions.filename
      });

      return true;

    } catch (error) {
      console.error('Error exporting page to PDF:', error);
      security.logSecurityEvent('pdf_export_error', {
        type: 'single_page',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Exports multiple pages to PDF
   * @param {Array<Object>} pages - Array of page objects
   * @param {Object} options - Export options
   * @returns {Promise<boolean>} - Success status
   */
  async function exportPagesToPDF(pages, options = {}) {
    try {
      // Load library if needed
      if (!await loadHtml2PdfLibrary()) {
        throw new Error('Failed to load PDF export library');
      }

      // Prepare content
      const htmlContent = createPDFContent(pages, options);
      
      // Configure PDF options
      const pdfOptions = {
        ...PDF_CONFIG,
        filename: options.filename || 'nextnote-pages.pdf',
        ...options.pdfConfig
      };

      // Generate PDF
      await html2pdf()
        .set(pdfOptions)
        .from(htmlContent)
        .save();

      security.logSecurityEvent('pdf_export_success', {
        type: 'multiple_pages',
        pageCount: pages.length,
        filename: pdfOptions.filename
      });

      return true;

    } catch (error) {
      console.error('Error exporting pages to PDF:', error);
      security.logSecurityEvent('pdf_export_error', {
        type: 'multiple_pages',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Exports entire notebook to PDF
   * @param {Array<Object>} sections - Array of section objects
   * @param {Object} options - Export options
   * @returns {Promise<boolean>} - Success status
   */
  async function exportNotebookToPDF(sections, options = {}) {
    try {
      // Load library if needed
      if (!await loadHtml2PdfLibrary()) {
        throw new Error('Failed to load PDF export library');
      }

      // Flatten all pages from all sections
      const allPages = [];
      sections.forEach(section => {
        if (section.pages && Array.isArray(section.pages)) {
          section.pages.forEach(page => {
            allPages.push({
              ...page,
              sectionTitle: section.title,
              sectionId: section.id
            });
          });
        }
      });

      // Prepare content with table of contents
      const htmlContent = createNotebookPDFContent(sections, allPages, options);
      
      // Configure PDF options
      const pdfOptions = {
        ...PDF_CONFIG,
        filename: options.filename || 'nextnote-notebook.pdf',
        ...options.pdfConfig
      };

      // Generate PDF
      await html2pdf()
        .set(pdfOptions)
        .from(htmlContent)
        .save();

      security.logSecurityEvent('pdf_export_success', {
        type: 'notebook',
        sectionCount: sections.length,
        pageCount: allPages.length,
        filename: pdfOptions.filename
      });

      return true;

    } catch (error) {
      console.error('Error exporting notebook to PDF:', error);
      security.logSecurityEvent('pdf_export_error', {
        type: 'notebook',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Creates HTML content for PDF generation
   * @param {Array<Object>} pages - Pages to include
   * @param {Object} options - Content options
   * @returns {HTMLElement} - HTML content element
   */
  function createPDFContent(pages, options = {}) {
    const container = document.createElement('div');
    container.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
      background: white;
    `;

    // Add title page if requested
    if (options.includeTitlePage) {
      const titlePage = createTitlePage(options);
      container.appendChild(titlePage);
    }

    // Add pages
    pages.forEach((page, index) => {
      const pageElement = createPageElement(page, options);
      container.appendChild(pageElement);

      // Add page break between pages (except last)
      if (index < pages.length - 1) {
        const pageBreak = document.createElement('div');
        pageBreak.style.cssText = 'page-break-after: always;';
        container.appendChild(pageBreak);
      }
    });

    return container;
  }

  /**
   * Creates HTML content for notebook PDF with table of contents
   * @param {Array<Object>} sections - Sections to include
   * @param {Array<Object>} pages - All pages
   * @param {Object} options - Content options
   * @returns {HTMLElement} - HTML content element
   */
  function createNotebookPDFContent(sections, pages, options = {}) {
    const container = document.createElement('div');
    container.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
      background: white;
    `;

    // Title page
    const titlePage = createNotebookTitlePage(sections, options);
    container.appendChild(titlePage);

    // Table of contents
    const toc = createTableOfContents(sections);
    container.appendChild(toc);

    // Content by sections
    sections.forEach((section, sectionIndex) => {
      // Section header
      const sectionHeader = document.createElement('div');
      sectionHeader.style.cssText = 'page-break-before: always; margin-bottom: 30px;';
      
      const sectionTitle = document.createElement('h1');
      sectionTitle.style.cssText = `
        color: #2c3e50;
        border-bottom: 3px solid #3498db;
        padding-bottom: 10px;
        margin-bottom: 30px;
      `;
      security.safeSetTextContent(sectionTitle, section.title || `Section ${sectionIndex + 1}`);
      sectionHeader.appendChild(sectionTitle);
      container.appendChild(sectionHeader);

      // Section pages
      if (section.pages && Array.isArray(section.pages)) {
        section.pages.forEach((page, pageIndex) => {
          const pageElement = createPageElement(page, options);
          container.appendChild(pageElement);

          // Add page break between pages (except last in section)
          if (pageIndex < section.pages.length - 1) {
            const pageBreak = document.createElement('div');
            pageBreak.style.cssText = 'page-break-after: always;';
            container.appendChild(pageBreak);
          }
        });
      }
    });

    return container;
  }

  /**
   * Creates a title page
   * @param {Object} options - Title page options
   * @returns {HTMLElement} - Title page element
   */
  function createTitlePage(options) {
    const titlePage = document.createElement('div');
    titlePage.style.cssText = `
      text-align: center;
      padding: 100px 0;
      page-break-after: always;
    `;

    const title = document.createElement('h1');
    title.style.cssText = `
      font-size: 2.5em;
      color: #2c3e50;
      margin-bottom: 30px;
    `;
    security.safeSetTextContent(title, options.title || 'NextNote Export');

    const subtitle = document.createElement('h2');
    subtitle.style.cssText = `
      font-size: 1.5em;
      color: #7f8c8d;
      margin-bottom: 50px;
    `;
    security.safeSetTextContent(subtitle, options.subtitle || 'Generated from NextNote');

    const date = document.createElement('p');
    date.style.cssText = `
      font-size: 1.2em;
      color: #95a5a6;
    `;
    security.safeSetTextContent(date, `Generated on ${new Date().toLocaleDateString()}`);

    titlePage.appendChild(title);
    titlePage.appendChild(subtitle);
    titlePage.appendChild(date);

    return titlePage;
  }

  /**
   * Creates a notebook title page
   * @param {Array<Object>} sections - Notebook sections
   * @param {Object} options - Title page options
   * @returns {HTMLElement} - Title page element
   */
  function createNotebookTitlePage(sections, options) {
    const titlePage = createTitlePage({
      title: options.title || 'NextNote Notebook',
      subtitle: `${sections.length} sections • Generated from NextNote`
    });

    return titlePage;
  }

  /**
   * Creates table of contents
   * @param {Array<Object>} sections - Sections for TOC
   * @returns {HTMLElement} - TOC element
   */
  function createTableOfContents(sections) {
    const toc = document.createElement('div');
    toc.style.cssText = 'page-break-after: always; margin-bottom: 50px;';

    const tocTitle = document.createElement('h2');
    tocTitle.style.cssText = `
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
      margin-bottom: 30px;
    `;
    security.safeSetTextContent(tocTitle, 'Table of Contents');

    const tocList = document.createElement('ul');
    tocList.style.cssText = `
      list-style: none;
      padding: 0;
      line-height: 2;
    `;

    sections.forEach((section, index) => {
      const sectionItem = document.createElement('li');
      sectionItem.style.cssText = `
        margin-bottom: 10px;
        font-weight: bold;
        color: #2c3e50;
      `;
      security.safeSetTextContent(sectionItem, `${index + 1}. ${section.title || `Section ${index + 1}`}`);

      if (section.pages && Array.isArray(section.pages)) {
        const pagesList = document.createElement('ul');
        pagesList.style.cssText = `
          list-style: none;
          padding-left: 20px;
          margin-top: 5px;
        `;

        section.pages.forEach((page, pageIndex) => {
          const pageItem = document.createElement('li');
          pageItem.style.cssText = `
            font-weight: normal;
            color: #7f8c8d;
            margin-bottom: 5px;
          `;
          security.safeSetTextContent(pageItem, `${index + 1}.${pageIndex + 1} ${page.title || `Page ${pageIndex + 1}`}`);
          pagesList.appendChild(pageItem);
        });

        sectionItem.appendChild(pagesList);
      }

      tocList.appendChild(sectionItem);
    });

    toc.appendChild(tocTitle);
    toc.appendChild(tocList);

    return toc;
  }

  /**
   * Creates a page element for PDF
   * @param {Object} page - Page object
   * @param {Object} options - Page options
   * @returns {HTMLElement} - Page element
   */
  function createPageElement(page, options = {}) {
    const pageDiv = document.createElement('div');
    pageDiv.style.cssText = 'margin-bottom: 40px;';

    // Page title
    const title = document.createElement('h2');
    title.style.cssText = `
      color: #2c3e50;
      border-bottom: 1px solid #bdc3c7;
      padding-bottom: 10px;
      margin-bottom: 20px;
    `;
    security.safeSetTextContent(title, page.title || 'Untitled Page');

    // Page metadata (if requested)
    if (options.includeMetadata && page.metadata) {
      const metadata = createMetadataElement(page.metadata);
      pageDiv.appendChild(metadata);
    }

    // Page content
    const content = document.createElement('div');
    content.style.cssText = `
      margin-bottom: 20px;
      line-height: 1.8;
    `;

    // Convert markdown to HTML if needed
    if (page.content) {
      if (window.marked) {
        content.innerHTML = security.sanitizeHTML(marked.parse(page.content));
      } else {
        // Fallback: treat as plain text with basic formatting
        const formattedContent = page.content
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>');
        content.innerHTML = security.sanitizeHTML(`<p>${formattedContent}</p>`);
      }
    }

    pageDiv.appendChild(title);
    pageDiv.appendChild(content);

    return pageDiv;
  }

  /**
   * Creates metadata element
   * @param {Object} metadata - Page metadata
   * @returns {HTMLElement} - Metadata element
   */
  function createMetadataElement(metadata) {
    const metaDiv = document.createElement('div');
    metaDiv.style.cssText = `
      background: #f8f9fa;
      border-left: 4px solid #3498db;
      padding: 15px;
      margin-bottom: 20px;
      font-size: 0.9em;
    `;

    const metaTitle = document.createElement('h4');
    metaTitle.style.cssText = 'margin: 0 0 10px 0; color: #2c3e50;';
    security.safeSetTextContent(metaTitle, 'Page Information');

    const metaList = document.createElement('ul');
    metaList.style.cssText = 'margin: 0; padding-left: 20px;';

    Object.entries(metadata).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        const listItem = document.createElement('li');
        listItem.style.cssText = 'margin-bottom: 5px;';
        
        const keySpan = document.createElement('strong');
        security.safeSetTextContent(keySpan, `${key}: `);
        
        const valueSpan = document.createElement('span');
        security.safeSetTextContent(valueSpan, value);
        
        listItem.appendChild(keySpan);
        listItem.appendChild(valueSpan);
        metaList.appendChild(listItem);
      }
    });

    metaDiv.appendChild(metaTitle);
    metaDiv.appendChild(metaList);

    return metaDiv;
  }

  /**
   * Sanitizes filename for safe file system usage
   * @param {string} filename - Original filename
   * @returns {string} - Sanitized filename
   */
  function sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') {
      return 'nextnote-export';
    }

    return filename
      .replace(/[<>:"/\\|?*]/g, '-') // Replace invalid characters
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .replace(/^-|-$/g, '') // Remove leading/trailing dashes
      .substring(0, 100) // Limit length
      || 'nextnote-export'; // Fallback if empty
  }

  /**
   * Shows PDF export options dialog
   * @param {Function} onExport - Export callback
   * @returns {HTMLElement} - Export dialog
   */
  function showExportDialog(onExport) {
    // This would create a dialog for export options
    // For brevity, implementing a simplified version
    const options = {
      includeMetadata: true,
      includeTitlePage: true,
      filename: 'nextnote-export.pdf'
    };

    onExport(options);
  }

  // Public API
  return {
    exportPageToPDF,
    exportPagesToPDF,
    exportNotebookToPDF,
    showExportDialog,
    
    // Utility functions
    sanitizeFilename,
    loadHtml2PdfLibrary,
    
    // Configuration access
    getConfig: () => ({ ...PDF_CONFIG })
  };
})();
