const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');

const authRoutes     = require('./routes/auth.routes');
const rolesRoutes    = require('./routes/roles.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const productosRoutes= require('./routes/productos.routes');

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options('*', cors());
app.use(express.json());

// ── Rutas ────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ mensaje: 'TechStore API ✅', version: '1.0.0' }));
app.use('/auth',     authRoutes);
app.use('/roles',    rolesRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/productos',productosRoutes);

// ── Manejo de errores globales ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conectado a PostgreSQL');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ Error de conexión:', err));

module.exports = app;
