const express = require('express');
const { 
  textToText, 
  speechToTextTranslation, 
  batchTranslate,
  detectLanguage
} = require('../controllers/translate.controller');

const router = express.Router();

// Text translation
router.post('/text', textToText);

// Speech translation (frontend sends recognized text)
router.post('/speech', speechToTextTranslation);

// Batch translation
router.post('/batch', batchTranslate);

// Language detection
router.post('/detect-language', detectLanguage);

// Get supported languages
router.get('/languages', (req, res) => {
  const translateService = require('../services/translate.service');
  const languages = translateService.getSupportedLanguages();
  res.json({ 
    success: true, 
    data: languages,
    count: Object.keys(languages).length
  });
});

module.exports = router;