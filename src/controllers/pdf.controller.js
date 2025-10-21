const pdfService = require('../services/pdf.service');
const translateService = require('../services/translate.service');
const { successResponse } = require('../helpers/response.helper');

exports.extractText = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('No PDF file uploaded');
    }

    const { sourceLang = 'auto', targetLang = 'en' } = req.body;
    const extractionResult = await pdfService.extractText(req.file.buffer);
    
    successResponse(res, {
      originalText: extractionResult.text,
      pages: extractionResult.numpages,
      textLength: extractionResult.text.length,
      metadata: extractionResult.info
    });
  } catch (err) {
    next(err);
  }
};

exports.translatePDF = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('No PDF file uploaded');
    }

    const { sourceLang = 'auto', targetLang = 'en' } = req.body;
    
    // Extract text from PDF
    const extractionResult = await pdfService.extractText(req.file.buffer);
    
    // Translate extracted text
    const translatedText = await translateService.translate(
      extractionResult.text,
      sourceLang,
      targetLang
    );

    successResponse(res, {
      originalPages: extractionResult.numpages,
      originalTextLength: extractionResult.text.length,
      translatedText: translatedText,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      textPreview: extractionResult.text.substring(0, 500) + '...'
    });
  } catch (err) {
    next(err);
  }
};

exports.translateAndDownloadPDF = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('No PDF file uploaded');
    }

    const { sourceLang = 'auto', targetLang = 'en' } = req.body;
    
    const extractionResult = await pdfService.extractText(req.file.buffer);
    const translatedText = await translateService.translate(
      extractionResult.text,
      sourceLang,
      targetLang
    );

    // Create translated PDF (simplified - in production, you'd use a PDF generation library)
    const translatedPDF = await pdfService.createTranslatedPDF(
      translatedText,
      extractionResult.info
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=translated-document.pdf');
    
    successResponse(res, {
      message: 'PDF translated successfully',
      downloadUrl: `/api/pdf/download/${Date.now()}`,
      filename: 'translated-document.pdf'
    });
  } catch (err) {
    next(err);
  }
};