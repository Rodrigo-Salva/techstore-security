const { evaluarPolitica } = require('../utils/policy-engine');
const { Producto, AuditLog } = require('../models');

/**
 * Middleware ABAC para productos
 * Verifica atributos antes de ejecutar la acción
 */
function verificarPoliticaProducto(accion) {
  return async (req, res, next) => {
    const usuario = req.usuario;
    const roles = req.roles || [];
    const rolNombre = roles[0];

    if (!rolNombre) {
      return res.status(403).json({ error: 'Sin rol asignado' });
    }

    // Para INSERT: evaluar con datos del body
    if (accion === 'INSERT') {
      const producto = {
        tienda_id: parseInt(req.body.tienda_id),
        es_premium: req.body.es_premium === true || req.body.es_premium === 'true',
      };
      const permitido = evaluarPolitica(rolNombre, accion, usuario, producto);
      await registrarAudit(req, accion, 'productos', permitido ? 'permitido' : 'denegado');
      if (!permitido) {
        return res.status(403).json({ error: `${rolNombre} no puede crear este tipo de producto` });
      }
      req.productoAtributos = producto;
      return next();
    }

    // Para UPDATE/DELETE/SELECT: cargar el producto existente
    const productoId = req.params.id;
    if (productoId) {
      const producto = await Producto.findByPk(productoId);
      if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

      const campos = accion === 'UPDATE' ? Object.keys(req.body) : [];
      const permitido = evaluarPolitica(rolNombre, accion, usuario, producto, campos);
      await registrarAudit(req, accion, `productos/${productoId}`, permitido ? 'permitido' : 'denegado');
      if (!permitido) {
        const mensajes = {
          DELETE: {
            Empleado: 'Empleados no pueden eliminar productos',
            Auditor:  'Auditores no pueden eliminar productos',
            Gerente:  'Gerentes no pueden eliminar productos premium',
          },
          UPDATE: {
            Auditor: 'Auditores no pueden modificar productos',
          },
        };
        const msg = mensajes[accion]?.[rolNombre]
          || `${rolNombre} no tiene permiso para ${accion} en este producto`;
        return res.status(403).json({ error: msg });
      }
      req.productoExistente = producto;
    }
    next();
  };
}

async function registrarAudit(req, accion, recurso, resultado) {
  try {
    await AuditLog.create({
      usuario_id: req.usuario?.id,
      email: req.usuario?.email,
      accion,
      recurso,
      resultado,
      detalle: JSON.stringify(req.body || {}),
      ip: req.ip,
    });
  } catch (_) {}
}

module.exports = { verificarPoliticaProducto };
