const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const errorHandler = require('./middlewares/errorHandler');
const { setupStatusHandlers } = require('./socket/statusHandler');

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

// Routes
const contactRoutes = require('./routes/contactRoutes');
const messageRoutes = require('./routes/messageRoutes');
app.use('/contacts', contactRoutes);
app.use('/messages', messageRoutes);

// Socket logic
io.on('connection', (socket) => {
  setupStatusHandlers(io, socket);
  // ...existing socket event handlers...
});

// ...existing code...