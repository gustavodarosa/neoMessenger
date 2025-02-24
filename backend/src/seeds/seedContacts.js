const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Contact = require('../models/Contact'); // Importe o modelo de contato

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Conectado ao MongoDB');
  seedContacts();
}).catch(err => {
  console.error('❌ Erro ao conectar ao MongoDB:', err);
});

async function seedContacts() {
  try {
    const contacts = [
      {
        _id: mongoose.Types.ObjectId('67b402eae4845e4a65a2dfe8'),
        user: mongoose.Types.ObjectId('67b522f5228d45528c53dfea'),
        name: 'Contato 1',
        email: 'contato1@example.com',
        status: 'online'
      },
      {
        _id: mongoose.Types.ObjectId('67b522f5228d45528c53dfea'),
        user: mongoose.Types.ObjectId('67b402eae4845e4a65a2dfe8'),
        name: 'Contato 2',
        email: 'contato2@example.com',
        status: 'online'
      }
    ];

    await Contact.insertMany(contacts);
    console.log('✅ Contatos inseridos com sucesso');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erro ao inserir contatos:', error);
    mongoose.connection.close();
  }
}
