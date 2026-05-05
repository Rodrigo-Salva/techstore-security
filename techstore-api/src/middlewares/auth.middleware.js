const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');

async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Verificar que el token sea "completo" (ya pasó MFA)
    if (!payload.mfa_verificado) {
      return res.status(401).json({ error: 'MFA no completado. Usa el token completo.' });
    }
    const usuario = await Usuario.findByPk(payload.id, {
      include: [{ model: Rol, through: { attributes: [] } }]
    });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Usuario inactivo o no encontrado' });
    }
    req.usuario = usuario;
    req.roles = usuario.Rols ? usuario.Rols.map(r => r.nombre) : [];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { verificarToken };
