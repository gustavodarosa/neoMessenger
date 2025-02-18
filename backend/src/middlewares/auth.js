const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    // Retorna erro caso o cabeçalho não seja enviado
    return res.status(401).json({ error: 'Acesso negado! Cabeçalho de autorização ausente.' });
  }

  // Remove a parte "Bearer " apenas se o header existir
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado! Token ausente.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Token inválido!' });
  }
};

module.exports = auth;