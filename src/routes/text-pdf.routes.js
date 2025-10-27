const express = require('express');
const {
  translateTextToPDF,
  createTextPDF,
  translateTextAndPreview
} = require('../controllers/text-pdf.controller');

const router = express.Router();

// Translate text and download as PDF
router.post('/translate-download', translateTextToPDF);

// Create PDF from text (no translation)
router.post('/create-pdf', createTextPDF);

// Translate text and get preview with PDF download option
router.post('/translate-preview', translateTextAndPreview);

module.exports = router;