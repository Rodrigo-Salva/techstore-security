const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  nombre_completo: { type: DataTypes.STRING, allowNull: false },
  tienda_id: { type: DataTypes.INTEGER, allowNull: true },
  mfa_habilitado: { type: DataTypes.BOOLEAN, defaultValue: false },
  mfa_secret: { type: DataTypes.STRING, allowNull: true },
  mfa_codigo_temp: { type: DataTypes.STRING, allowNull: true },
  mfa_codigo_expira: { type: DataTypes.DATE, allowNull: true },
  intentos_fallidos: { type: DataTypes.INTEGER, defaultValue: 0 },
  intentos_mfa: { type: DataTypes.INTEGER, defaultValue: 0 },
  bloqueado_hasta: { type: DataTypes.DATE, allowNull: true },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'usuarios', timestamps: false });

module.exports = Usuario;
