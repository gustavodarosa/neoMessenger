const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const auth = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Use user ID and timestamp to make filename unique
    const userId = req.user._id;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${userId}-${timestamp}${ext}`);
  }
});

// Configure file filter to accept only jpeg and png
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG files are allowed'), false);
  }
};

const upload = multer({ 
  storage: avatarStorage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 2 // Limit file size to 2MB
  }
});

// Rota POST para registro
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos!' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Use "username" field as defined in the user schema
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: '✅ Usuário registrado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar o usuário', details: err.message });
  }
});

// Rota POST para login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos!' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Usuário ou senha incorretos!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Usuário ou senha incorretos!' });
    }

    // Gerar um token JWT
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: '✅ Login realizado com sucesso!', token });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login', details: err.message });
  }
});

// Rota GET protegida para testar o middleware de autenticação
router.get('/protected', auth, (req, res) => {
  res.status(200).json({ message: 'Você acessou uma rota protegida!', user: req.user });
});

// Add GET /me route to return the user from the database matching the token
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    console.log("User from DB:", user);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao recuperar o usuário.' });
  }
});

// Add this new route to get all users
router.get('/all', auth, async (req, res) => {
  try {
    // Get all users from the database, excluding password fields
    const users = await User.find({}, { password: 0 });
    
    // Return the users as JSON
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Exemplo de rota para obter contatos
router.get('api/contacts', auth, async (req, res) => {
  const contacts = await Contact.find({ userId: req.user.id });
  res.json(contacts);
});

// Exemplo de rota para obter mensagens
router.get('/messages/:contactId', auth, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { senderId: req.user.id, recipientId: req.params.contactId },
      { senderId: req.params.contactId, recipientId: req.user.id }
    ]
  });
  res.json(messages);
});

// Exemplo de rota para enviar mensagem
router.post('/messages', auth, async (req, res) => {
  const message = new Message({
    senderId: req.user.id,
    recipientId: req.body.recipientId,
    text: req.body.text
  });
  await message.save();
  res.status(201).json(message);
});

// Route to upload avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get the user from database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the relative path to the file
    const relativePath = path.relative(
      path.join(__dirname, '../../'), 
      req.file.path
    ).replace(/\\/g, '/');
    
    // Create a URL that can be accessed from frontend
    const avatarUrl = `/uploads/avatars/${path.basename(req.file.path)}`;

    // Update user's avatar field in database
    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({ 
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarUrl 
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Error uploading avatar' });
  }
});

module.exports = router;