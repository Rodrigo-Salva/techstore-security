const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('Rol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.ENUM('Admin', 'Gerente', 'Empleado', 'Auditor'), allowNull: false },
  descripcion: { type: DataTypes.STRING },
  fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'roles',
  timestamps: false,
  indexes: [{ unique: true, fields: ['nombre'] }],
});

module.exports = Rol;
