const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const { requerirRol } = require('../middlewares/rbac.middleware');
const ctrl = require('../controllers/usuarios.controller');

router.get('/',                        verificarToken, requerirRol('Admin'), ctrl.listar);
router.get('/:id',                     verificarToken, requerirRol('Admin'), ctrl.obtener);
router.put('/:id',                     verificarToken, requerirRol('Admin'), ctrl.actualizar);
router.delete('/:id',                  verificarToken, requerirRol('Admin'), ctrl.eliminar);
router.post('/:id/roles',              verificarToken, requerirRol('Admin'), ctrl.asignarRol);
router.delete('/:id/roles/:rol_id',    verificarToken, requerirRol('Admin'), ctrl.revocarRol);

module.exports = router;
