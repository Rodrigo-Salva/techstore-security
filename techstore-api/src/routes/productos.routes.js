const express = require("express");
const router = express.Router();

const { verificarToken } = require("../middlewares/auth.middleware");
const { requerirRol } = require("../middlewares/rbac.middleware");
const { verificarPoliticaProducto } = require("../middlewares/abac.middleware");

const productosController = require("../controllers/productos.controller");

// =============================
// AUDITORÍA (solo Admin y Auditor)
// GET /productos/audit-logs
// =============================
router.get(
  "/audit-logs",
  verificarToken,
  requerirRol("Admin", "Auditor"),
  productosController.auditLogs,
);

// =============================
// CRUD PRODUCTOS (con ABAC)
// =============================

// GET /productos
router.get("/", verificarToken, productosController.listar);

// GET /productos/:id
router.get(
  "/:id",
  verificarToken,
  verificarPoliticaProducto("SELECT"),
  productosController.obtener,
);

// POST /productos
router.post(
  "/",
  verificarToken,
  verificarPoliticaProducto("INSERT"),
  productosController.crear,
);

// PUT /productos/:id
router.put(
  "/:id",
  verificarToken,
  verificarPoliticaProducto("UPDATE"),
  productosController.actualizar,
);

// DELETE /productos/:id
router.delete(
  "/:id",
  verificarToken,
  verificarPoliticaProducto("DELETE"),
  productosController.eliminar,
);

module.exports = router;
