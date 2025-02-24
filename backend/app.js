const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const contactRoutes = require('./src/routes/contactRoutes');
const messageRoutes = require('./src/routes/messageRoutes');

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/neomessenger', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.use(bodyParser.json());

// Rotas
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
