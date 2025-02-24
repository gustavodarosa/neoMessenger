const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const Message = require('../models/Message');

// POST /messages: Enviar mensagem
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    const message = new Message({
      sender: req.user._id,
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
    }).sort('timestamp').populate('sender', 'name');
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar mensagens.' });
  }
});

module.exports = router;
