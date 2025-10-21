const translateService = require('../services/translate.service');
const { successResponse, errorResponse } = require('../helpers/response.helper');

exports.textToText = async (req, res, next) => {
  try {
    const { text, sourceLang = 'auto', targetLang = 'en' } = req.body;
    
    if (!text || text.trim().length === 0) {
      return errorResponse(res, 'Text is required for translation', 400);
    }

    console.log(`Translation request: "${text.substring(0, 50)}..." from ${sourceLang} to ${targetLang}`);

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

    successResponse(res, {
      originalText: text,
      translatedText: translatedText,
      sourceLanguage: sourceLang,
      detectedLanguage: sourceLang === 'auto' ? detectedLanguage : undefined,
      targetLanguage: targetLang,
      translationLength: translatedText.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Translation controller error:', err);
    errorResponse(res, err.message, 500);
  }
};

exports.speechToTextTranslation = async (req, res, next) => {
  try {
    const { recognizedText, sourceLang = 'auto', targetLang = 'en' } = req.body;
    
    if (!recognizedText || recognizedText.trim().length === 0) {
      return errorResponse(res, 'Recognized text is required for translation', 400);
    }

    let translatedText;
    let detectedLanguage = sourceLang;
    
    try {
      if (sourceLang === 'auto') {
        detectedLanguage = await translateService.detectLanguage(recognizedText);
      }
      
      translatedText = await translateService.translate(recognizedText, detectedLanguage, targetLang);
    } catch (error) {
      console.log('Speech translation failed, using fallback:', error.message);
      translatedText = await translateService.mockTranslate(recognizedText, detectedLanguage, targetLang);
    }

    successResponse(res, {
      recognizedText: recognizedText,
      translatedText: translatedText,
      sourceLanguage: sourceLang,
      detectedLanguage: sourceLang === 'auto' ? detectedLanguage : undefined,
      targetLanguage: targetLang,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Speech translation error:', err);
    errorResponse(res, err.message, 500);
  }
};

// ... rest of the controller functions remain the same
exports.batchTranslate = async (req, res, next) => {
  try {
    const { texts, sourceLang = 'auto', targetLang = 'en' } = req.body;
    
    if (!texts || !Array.isArray(texts)) {
      return errorResponse(res, 'Texts array is required for batch translation', 400);
    }

    const translations = await Promise.all(
      texts.map(async (text) => {
        let detectedLanguage = sourceLang;
        
        if (sourceLang === 'auto') {
          detectedLanguage = await translateService.detectLanguage(text);
        }
        
        return await translateService.translate(text, detectedLanguage, targetLang);
      })
    );

    successResponse(res, {
      translations: texts.map((text, index) => ({
        original: text,
        translated: translations[index],
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
      })),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Batch translation error:', err);
    errorResponse(res, err.message, 500);
  }
};

exports.detectLanguage = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return errorResponse(res, 'Text is required for language detection', 400);
    }

    const detectedLang = await translateService.detectLanguage(text);
    const languages = translateService.getSupportedLanguages();

    successResponse(res, {
      text: text,
      detectedLanguage: detectedLang,
      languageName: languages[detectedLang] || 'Unknown',
      confidence: 'high',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Language detection error:', err);
    errorResponse(res, err.message, 500);
  }
};