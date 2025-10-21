const express = require('express');
const { upload } = require('../config/multer.config');
const { 
  extractText, 
  translatePDF, 
  translateAndDownloadPDF 
} = require('../controllers/pdf.controller');

const router = express.Router();

router.post('/extract', upload.single('pdf'), extractText);
router.post('/translate', upload.single('pdf'), translatePDF);
router.post('/translate-download', upload.single('pdf'), translateAndDownloadPDF);

module.exports = router;