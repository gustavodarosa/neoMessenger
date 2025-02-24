const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  console.log("Token being tested:", token); // Log do token que está sendo testado

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res.sendStatus(403);
    }
    req.user = user;
    console.log("Authenticated user:", user); // Adiciona um console.log para verificar o usuário autenticado
    console.log("Request headers:", req.headers); // Log dos cabeçalhos da requisição
    console.log("Request method:", req.method); // Log do método da requisição
    console.log("Request URL:", req.url); // Log da URL da requisição
    next();
  });
}

module.exports = authenticateToken;
