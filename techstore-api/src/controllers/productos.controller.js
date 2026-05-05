const { Producto, AuditLog } = require('../models');
const { evaluarPolitica } = require('../utils/policy-engine');
const { Op } = require('sequelize');

// GET /productos
async function listar(req, res) {
  const usuario = req.usuario;
  const rolNombre = req.roles[0];
  let where = {};

  // Aplicar filtro ABAC para SELECT
  if (rolNombre === 'Gerente' || rolNombre === 'Empleado') {
    where.tienda_id = usuario.tienda_id;
  }
  // Admin y Auditor ven todos

  const productos = await Producto.findAll({ where });
  res.json(productos);
}

// GET /productos/:id
async function obtener(req, res) {
  const producto = req.productoExistente || await Producto.findByPk(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
}

// POST /productos
async function crear(req, res) {
  try {
    const { nombre, descripcion, precio, stock, categoria, tienda_id, es_premium } = req.body;
    const producto = await Producto.create({
      nombre, descripcion, precio, stock, categoria,
      tienda_id: parseInt(tienda_id),
      es_premium: es_premium || false,
      creado_por: req.usuario.id,
    });
    res.status(201).json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// PUT /productos/:id
async function actualizar(req, res) {
  const producto = req.productoExistente;
  await producto.update({ ...req.body, fecha_actualizacion: new Date() });
  res.json(producto);
}

// DELETE /productos/:id
async function eliminar(req, res) {
  const producto = req.productoExistente;
  await producto.destroy();
  res.json({ mensaje: 'Producto eliminado' });
}

// GET /audit-logs  (solo Admin y Auditor)
async function auditLogs(req, res) {
  const { AuditLog } = require('../models');
  const logs = await AuditLog.findAll({ order: [['fecha', 'DESC']], limit: 100 });
  res.json(logs);
}

module.exports = { listar, obtener, crear, actualizar, eliminar, auditLogs };
