const express = require('express');
require('dotenv').config();
const shopbackRoutes = require('./routes/shopback');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/shopback', shopbackRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ShopBack Node API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});