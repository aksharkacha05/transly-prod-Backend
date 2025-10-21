const pdf = require('pdf-parse');
const PDFDocument = require('pdfkit');

exports.extractText = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return {
      text: data.text,
      numpages: data.numpages,
      info: data.info,
      metadata: data.metadata
    };
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

exports.createTranslatedPDF = async (translatedText, originalInfo = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add metadata
      if (originalInfo.Title) {
        doc.info.Title = `Translated - ${originalInfo.Title}`;
      }
      doc.info.Author = originalInfo.Author || 'Translation App';
      doc.info.CreationDate = new Date();

      // Add content
      doc.fontSize(12);
      doc.text(translatedText, {
        align: 'left',
        width: 500,
        height: 700
      });

      doc.end();
    } catch (error) {
      reject(new Error(`PDF creation failed: ${error.message}`));
    }
  });
};

exports.getPDFInfo = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return {
      pages: data.numpages,
      info: data.info,
      metadata: data.metadata,
      textLength: data.text.length
    };
  } catch (error) {
    throw new Error(`PDF info extraction failed: ${error.message}`);
  }
};