const { Rol, UsuarioRol } = require('../models');

// GET /roles
async function listar(req, res) {
  const roles = await Rol.findAll();
  res.json(roles);
}

// POST /roles  (solo Admin)
async function crear(req, res) {
  try {
    const { nombre, descripcion } = req.body;
    if (!['Admin', 'Gerente', 'Empleado', 'Auditor'].includes(nombre)) {
      return res.status(400).json({ error: 'Nombre inválido. Usa: Admin, Gerente, Empleado, Auditor' });
    }
    const rol = await Rol.create({ nombre, descripcion });
    res.status(201).json(rol);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// PUT /roles/:id  (solo Admin)
async function actualizar(req, res) {
  const rol = await Rol.findByPk(req.params.id);
  if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });
  await rol.update(req.body);
  res.json(rol);
}

// DELETE /roles/:id  (solo Admin - no puede eliminar si tiene usuarios)
async function eliminar(req, res) {
  const rol = await Rol.findByPk(req.params.id);
  if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });
  const enUso = await UsuarioRol.count({ where: { rol_id: rol.id } });
  if (enUso > 0) {
    return res.status(409).json({ error: 'No se puede eliminar: hay usuarios asignados a este rol' });
  }
  await rol.destroy();
  res.json({ mensaje: 'Rol eliminado' });
}

module.exports = { listar, crear, actualizar, eliminar };
