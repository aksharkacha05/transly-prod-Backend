const { errorResponse } = require('../helpers/response.helper');

module.exports = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 'File too large. Maximum size is 10MB.', 400);
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return errorResponse(res, 'Unexpected field in file upload.', 400);
  }

  // PDF parsing errors
  if (err.message.includes('PDF') || err.message.includes('pdf')) {
    return errorResponse(res, 'Invalid PDF file', 400);
  }

  // Translation API errors
  if (err.message.includes('Translation') || err.message.includes('translation')) {
    return errorResponse(res, 'Translation service temporarily unavailable', 503);
  }

  // Default error
  errorResponse(res, err.message, 500, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};