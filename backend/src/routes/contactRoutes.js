const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Contact = require('../models/contactModel'); // Ensure this model is defined

// GET /contacts - Return contacts for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
      const contacts = await Contact.find({ userId: req.user._id });
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter contatos', details: error.message });
    }
  });

module.exports = router;
