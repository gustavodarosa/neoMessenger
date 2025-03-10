const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const auth = require('../middlewares/auth');

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

/**
 * Add this route to your user routes to fetch avatars by user ID
 */
// Get user avatar by userId
router.get('/avatar/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Fetch the user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has an avatar
    if (user.avatar) {
      // Return the avatar path
      return res.status(200).json({ avatarUrl: user.avatar });
    } else {
      // Return default avatar path
      return res.status(200).json({ avatarUrl: '/assets/default-avatar.png' });
    }
  } catch (error) {
    console.error('Error fetching user avatar:', error);
    return res.status(500).json({ error: 'Failed to fetch avatar' });
  }
});

/**
 * Add this route to get a user by ID
 */
// Get user info by ID (for contact details)
router.get('/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find user by ID but exclude the password field
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return the user info (without password)
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;