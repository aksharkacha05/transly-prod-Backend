const express = require('express');
const cors = require('cors');
const pdfRoutes = require('./routes/pdf.routes');
const translateRoutes = require('./routes/translate.routes');
const notesRoutes = require('./routes/notes.routes');
const errorHandler = require('./middlewares/errorHandler');

function createServer() {
  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/', (req, res) => {
    res.json({
      status: 'ready',
      message: 'Welcome to Translation API - Text, Speech & PDF Translation'
    });
  });

  app.use('/api/pdf', pdfRoutes);
  app.use('/api/translate', translateRoutes);
  app.use('/api/notes', notesRoutes);
  
  app.use(errorHandler);

  return app;
}

module.exports = { createServer };