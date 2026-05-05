const sequelize = require('../config/database');
const Rol = require('./Rol');
const Usuario = require('./Usuario');
const UsuarioRol = require('./UsuarioRol');
const Producto = require('./Producto');
const AuditLog = require('./AuditLog');

// Relaciones
Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'usuario_id', otherKey: 'rol_id' });
Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'rol_id', otherKey: 'usuario_id' });

module.exports = { sequelize, Rol, Usuario, UsuarioRol, Producto, AuditLog };
