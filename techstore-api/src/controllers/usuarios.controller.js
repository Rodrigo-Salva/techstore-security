const bcrypt = require('bcryptjs');
const { Usuario, Rol, UsuarioRol } = require('../models');

// GET /usuarios
async function listar(req, res) {
  const usuarios = await Usuario.findAll({
    attributes: { exclude: ['password', 'mfa_secret', 'mfa_codigo_temp'] },
    include: [{ model: Rol, through: { attributes: [] } }]
  });
  res.json(usuarios);
}

// GET /usuarios/:id
async function obtener(req, res) {
  const usuario = await Usuario.findByPk(req.params.id, {
    attributes: { exclude: ['password', 'mfa_secret'] },
    include: [{ model: Rol, through: { attributes: [] } }]
  });
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(usuario);
}

// PUT /usuarios/:id
async function actualizar(req, res) {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { password, ...resto } = req.body;
  if (password) resto.password = await bcrypt.hash(password, 12);
  await usuario.update(resto);
  res.json({ mensaje: 'Usuario actualizado', id: usuario.id });
}

// DELETE /usuarios/:id
async function eliminar(req, res) {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  await usuario.update({ activo: false });
  res.json({ mensaje: 'Usuario desactivado' });
}

// POST /usuarios/:id/roles  — asignar rol
async function asignarRol(req, res) {
  const { rol_id } = req.body;
  const usuario = await Usuario.findByPk(req.params.id);
  const rol = await Rol.findByPk(rol_id);
  if (!usuario || !rol) return res.status(404).json({ error: 'Usuario o rol no encontrado' });
  const existe = await UsuarioRol.findOne({ where: { usuario_id: usuario.id, rol_id } });
  if (existe) return res.status(409).json({ error: 'El usuario ya tiene este rol' });
  await UsuarioRol.create({ usuario_id: usuario.id, rol_id, asignado_por: req.usuario.id });
  res.status(201).json({ mensaje: `Rol '${rol.nombre}' asignado a ${usuario.email}` });
}

// DELETE /usuarios/:id/roles/:rol_id
async function revocarRol(req, res) {
  const deleted = await UsuarioRol.destroy({
    where: { usuario_id: req.params.id, rol_id: req.params.rol_id }
  });
  if (!deleted) return res.status(404).json({ error: 'Asignación no encontrada' });
  res.json({ mensaje: 'Rol revocado' });
}

module.exports = { listar, obtener, actualizar, eliminar, asignarRol, revocarRol };
