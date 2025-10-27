const pdfService = require('../services/pdf.service');
const translateService = require('../services/translate.service');
const { successResponse, errorResponse } = require('../helpers/response.helper');

exports.translateTextToPDF = async (req, res, next) => {
  try {
    const { text, sourceLang = 'auto', targetLang = 'en', filename = 'translated-document' } = req.body;
    
    if (!text || text.trim().length === 0) {
      return errorResponse(res, 'Text is required for translation', 400);
    }

    console.log(`Text-to-PDF Translation: "${text.substring(0, 50)}..." from ${sourceLang} to ${targetLang}`);

    let translatedText;
    let detectedLanguage = sourceLang;
    
    try {
      // If auto-detection is requested, detect the language first
      if (sourceLang === 'auto') {
        detectedLanguage = await translateService.detectLanguage(text);
        console.log(`Auto-detected source language: ${detectedLanguage}`);
      }
      
      // Try main translation service
      translatedText = await translateService.translate(text, detectedLanguage, targetLang);
    } catch (error) {
      console.log('Main translation failed, trying fallback:', error.message);
      
      // Try fallback translation
      try {
        translatedText = await translateService.googleTranslateFallback(text, detectedLanguage, targetLang);
      } catch (fallbackError) {
        console.log('Fallback translation failed, using mock:', fallbackError.message);
        
        // Use mock translation as last resort
        translatedText = await translateService.mockTranslate(text, detectedLanguage, targetLang);
      }
    }

    // Create PDF from translated text
    const pdfBuffer = await pdfService.createTextPDF(translatedText, filename);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF buffer
    res.send(pdfBuffer);

  } catch (err) {
    console.error('Text-to-PDF translation error:', err);
    errorResponse(res, err.message, 500);
  }
};

exports.createTextPDF = async (req, res, next) => {
  try {
    const { text, filename = 'document' } = req.body;
    
    if (!text || text.trim().length === 0) {
      return errorResponse(res, 'Text is required for PDF creation', 400);
    }

    console.log(`Creating PDF from text: "${text.substring(0, 50)}..."`);

    // Create PDF from text
    const pdfBuffer = await pdfService.createTextPDF(text, filename);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF buffer
    res.send(pdfBuffer);

  } catch (err) {
    console.error('Text-to-PDF creation error:', err);
    errorResponse(res, err.message, 500);
  }
};

exports.translateTextAndPreview = async (req, res, next) => {
  try {
    const { text, sourceLang = 'auto', targetLang = 'en' } = req.body;
    
    if (!text || text.trim().length === 0) {
      return errorResponse(res, 'Text is required for translation', 400);
    }

    console.log(`Translate Text Preview: "${text.substring(0, 50)}..." from ${sourceLang} to ${targetLang}`);

    let translatedText;
    let detectedLanguage = sourceLang;
    
    try {
      if (sourceLang === 'auto') {
        detectedLanguage = await translateService.detectLanguage(text);
      }
      
      translatedText = await translateService.translate(text, detectedLanguage, targetLang);
    } catch (error) {
      console.log('Translation failed, using fallback:', error.message);
      translatedText = await translateService.mockTranslate(text, detectedLanguage, targetLang);
    }

    successResponse(res, {
      originalText: text,
      translatedText: translatedText,
      sourceLanguage: sourceLang,
      detectedLanguage: sourceLang === 'auto' ? detectedLanguage : undefined,
      targetLanguage: targetLang,
      textLength: text.length,
      translatedLength: translatedText.length,
      timestamp: new Date().toISOString(),
      pdfDownloadUrl: `/api/text-pdf/translate-download`
    });
  } catch (err) {
    console.error('Text translation preview error:', err);
    errorResponse(res, err.message, 500);
  }
};