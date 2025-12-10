const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const chatRoutes = require('./routes/chatRoutes');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

try {
  app.use('/api', chatRoutes());
} catch (error) {
  console.warn('Chat routes initialization skipped:', error.message);
  // Chat routes will fail gracefully if database is not available
}

module.exports = app;