const express = require('express');
const productRoutes = require('./routes/products.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/products', productRoutes);

app.use(errorHandler);

module.exports = app;
