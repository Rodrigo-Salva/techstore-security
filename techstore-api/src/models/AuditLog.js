const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER },
  email: { type: DataTypes.STRING },
  accion: { type: DataTypes.STRING },
  recurso: { type: DataTypes.STRING },
  resultado: { type: DataTypes.ENUM('permitido', 'denegado') },
  detalle: { type: DataTypes.TEXT },
  ip: { type: DataTypes.STRING },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'audit_logs', timestamps: false });

module.exports = AuditLog;
