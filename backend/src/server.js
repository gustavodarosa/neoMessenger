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
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message'); // Importe o modelo de mensagem (ajuste o caminho se necessário)
const User = require('./models/userModel'); // Adjusted to match the actual filename if needed
const path = require('path'); // Add path module

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});
const port = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(cors()); // Adicione o middleware CORS se necessário

// Add static file serving for uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Configuração do WebSocket
io.on('connection', (socket) => {
  console.log('🔌 Novo cliente conectado:', socket.id);

  // Add handler for personal room joining
  socket.on('joinPersonalRoom', (userId) => {
    if (!userId) {
      console.error("Cannot join personal room: No user ID provided");
      socket.emit('error', { message: 'Missing user ID' });
      return;
    }
    
    // Create personal room ID with prefix for clarity
    const personalRoom = `user:${userId}`;
    
    // Join the room
    socket.join(personalRoom);
    console.log(`🔌 User ${userId} joined personal room ${personalRoom}`);
    
    // Notify client they've joined successfully
    socket.emit('roomJoined', {
      room: personalRoom,
      userId: userId,
      timestamp: new Date(),
      success: true
    });
  });
  
  // Add handler for room verification
  socket.on('verifyRoom', (userId) => {
    const personalRoomId = `user:${userId}`;
    const socketRooms = Array.from(socket.rooms || []);
    const isInRoom = socketRooms.includes(personalRoomId);
    
    console.log(`🔍 Room verification for user ${userId}: ${isInRoom ? 'IN' : 'NOT IN'} room ${personalRoomId}`);
    
    socket.emit('roomVerification', {
      inRoom: isInRoom,
      userId: userId,
      room: personalRoomId,
      allRooms: socketRooms
    });
  });

  // Existing joinRoom handler
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`🔌 Cliente ${socket.id} entrou na sala ${room}`);
  });

  // Modified sendMessage handler to also notify personal room if recipient isn't in the chat room
  socket.on('sendMessage', async (message) => {
    try {
      const user = await User.findById(message.sender);
      if (!user) {
        throw new Error('Sender not found');
      }
      
      const newMessage = new Message({
        sender: user._id,
        senderName: user.name || user.username || 'Unknown User',
        recipient: message.recipient,
        text: message.text,
        timestamp: new Date()
      });
      
      await newMessage.save();
      newMessage.room = message.room; // Ensure that room information is attached
      
      console.log("Broadcasting message to room:", message.room);
      io.to(message.room).emit('receiveMessage', newMessage);
      
      // Also send to recipient's personal room for notification if they're not in the chat room
      const recipientRoom = `user:${message.recipient}`;
      const recipientSockets = await io.in(message.room).fetchSockets();
      const recipientIsInRoom = recipientSockets.some(s => 
        Array.from(s.rooms).includes(recipientRoom) && Array.from(s.rooms).includes(message.room)
      );
      
      if (!recipientIsInRoom) {
        console.log(`Sending notification to personal room: ${recipientRoom}`);
        io.to(recipientRoom).emit('personalMessage', {
          ...newMessage.toObject(),
          isNotification: true
        });
      }
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      socket.emit('error', { message: 'Error saving or sending message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});