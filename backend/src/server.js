const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes'); // Importe as rotas
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler'); // Importe o middleware de tratamento de erros
const contactRoutes = require('./routes/contactRoutes'); // Caminho correto para seu arquivo de rotas

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(cors()); // Adicione o middleware CORS se necessário

// Rotas
app.use('/api/users', userRoutes); // Prefixo para todas as rotas de usuário

// Middleware de Tratamento de Erros
app.use(errorHandler); // Adicione o middleware de tratamento de erros

app.use('/api/contacts', contactRoutes);

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});