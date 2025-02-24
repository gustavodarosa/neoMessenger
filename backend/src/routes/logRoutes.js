const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  const logFilePath = path.join(__dirname, '../../logs/server.log');
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ler o arquivo de log.' });
    }
    res.status(200).json({ logs: data });
  });
});

module.exports = router;
