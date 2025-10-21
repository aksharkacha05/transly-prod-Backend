require('dotenv').config();
const { createServer } = require('./app');

const PORT = process.env.PORT || 3000;
const app = createServer();

app.listen(PORT, () => {
  console.log(`✅ Translation API Server running on port ${PORT}`);
});