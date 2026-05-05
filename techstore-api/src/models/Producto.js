const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  categoria: { type: DataTypes.STRING },
  tienda_id: { type: DataTypes.INTEGER, allowNull: false },
  es_premium: { type: DataTypes.BOOLEAN, defaultValue: false },
  creado_por: { type: DataTypes.INTEGER, allowNull: true },
  fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  fecha_actualizacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'productos', timestamps: false });

module.exports = Producto;
