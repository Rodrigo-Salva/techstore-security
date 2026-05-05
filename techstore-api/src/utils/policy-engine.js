/**
 * Motor de políticas ABAC para TechStore
 * Evalúa si un usuario puede ejecutar una acción sobre un recurso
 * basándose en atributos: rol, tienda_id, es_premium, etc.
 */

const politicasProducto = {
  SELECT: {
    Admin:    () => true,
    Gerente:  (usuario, producto) => usuario.tienda_id === producto.tienda_id,
    Empleado: (usuario, producto) => usuario.tienda_id === producto.tienda_id,
    Auditor:  () => true,
  },
  INSERT: {
    Admin:    () => true,
    Gerente:  (usuario, producto) => usuario.tienda_id === producto.tienda_id,
    Empleado: (usuario, producto) => usuario.tienda_id === producto.tienda_id && !producto.es_premium,
    Auditor:  () => false,
  },
  UPDATE: {
    Admin:    () => true,
    Gerente:  (usuario, producto, campos) => {
      if (usuario.tienda_id !== producto.tienda_id) return false;
      if (campos && campos.includes('categoria')) return false;
      return true;
    },
    Empleado: (usuario, producto, campos) => {
      if (usuario.tienda_id !== producto.tienda_id) return false;
      if (campos && campos.some(c => c !== 'stock')) return false;
      return true;
    },
    Auditor:  () => false,
  },
  DELETE: {
    Admin:    () => true,
    Gerente:  (usuario, producto) => usuario.tienda_id === producto.tienda_id && !producto.es_premium,
    Empleado: () => false,
    Auditor:  () => false,
  },
};

/**
 * Evalúa la política ABAC
 * @param {string} rolNombre - Nombre del rol del usuario
 * @param {string} accion - SELECT | INSERT | UPDATE | DELETE
 * @param {object} usuario - Datos del usuario (tienda_id)
 * @param {object} producto - Datos del producto (tienda_id, es_premium)
 * @param {array}  campos - Campos que se quieren modificar (para UPDATE)
 */
function evaluarPolitica(rolNombre, accion, usuario, producto = {}, campos = []) {
  const politica = politicasProducto[accion];
  if (!politica) return false;
  const regla = politica[rolNombre];
  if (!regla) return false;

  // Normalizar tienda_id a número para evitar fallos de comparación estricta
  const u = { ...usuario.dataValues || usuario, tienda_id: parseInt(usuario.tienda_id) }
  const p = { ...producto.dataValues || producto, tienda_id: parseInt(producto.tienda_id) }

  return regla(u, p, campos);
}

module.exports = { evaluarPolitica };
