const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes'); // Importe as rotas
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler'); // Importe o middleware de tratamento de erros
const contactRoutes = require('./routes/contactRoutes'); // Caminho correto para seu arquivo de rotas
const messageRoutes = require('./routes/messageRoutes'); // Caminho correto para seu arquivo de rotas
const logRoutes = require('./routes/logRoutes'); // Importe a rota de logs

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(cors()); // Adicione o middleware CORS se necessário

// Rotas
app.use('/api/users', userRoutes); // Prefixo para todas as rotas de usuário
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/logs', logRoutes); // Adicione a rota de logs

// Middleware de Tratamento de Erros
app.use(errorHandler); // Adicione o middleware de tratamento de erros

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