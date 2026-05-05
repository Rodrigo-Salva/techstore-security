/**
 * Middleware RBAC — verifica que el usuario tenga al menos uno de los roles requeridos
 * Uso: router.post('/roles', verificarToken, requerirRol('Admin'), controller)
 */
function requerirRol(...rolesPermitidos) {
  return (req, res, next) => {
    const rolesUsuario = req.roles || [];
    const tieneAcceso = rolesPermitidos.some(r => rolesUsuario.includes(r));
    if (!tieneAcceso) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere uno de estos roles: ${rolesPermitidos.join(', ')}`,
        tu_rol: rolesUsuario,
      });
    }
    next();
  };
}

module.exports = { requerirRol };
