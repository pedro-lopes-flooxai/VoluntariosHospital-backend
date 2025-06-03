const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'voluntarios_hospital';

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token inválido' });
  }
}

function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }
  next();
}

module.exports = { verifyToken, isAdmin };
