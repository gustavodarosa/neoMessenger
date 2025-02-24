const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const Message = require('../models/Message');
const User = require('../models/userModel'); // Adjusted the filename to match your file

// POST /messages: Enviar mensagem com username baseado no token
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    // Retrieve user info from the database using the token-derived ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'Remetente não encontrado.' });
    }
    const message = new Message({
      sender: req.user._id,
      senderName: user.name, // Using the username from the database
      recipient: recipientId,
      text
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});

// GET /messages/:contactId: Receber mensagens
router.get('/:contactId', authenticateToken, async (req, res) => {
  try {
    const contactId = req.params.contactId;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: contactId },
        { sender: contactId, recipient: req.user._id }
      ]
    }).sort('timestamp')
      .populate('sender', 'name'); // Populate sender name
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar mensagens.' });
  }
});

module.exports = router;
