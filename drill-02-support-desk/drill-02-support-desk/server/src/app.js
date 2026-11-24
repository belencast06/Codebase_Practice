const express = require('express');
const ticketRoutes = require('./routes/tickets.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/tickets', ticketRoutes);

app.use(errorHandler);

module.exports = app;
