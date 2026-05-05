const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const { requerirRol } = require('../middlewares/rbac.middleware');
const ctrl = require('../controllers/roles.controller');

router.get('/',           verificarToken, ctrl.listar);
router.post('/',          verificarToken, requerirRol('Admin'), ctrl.crear);
router.put('/:id',        verificarToken, requerirRol('Admin'), ctrl.actualizar);
router.delete('/:id',     verificarToken, requerirRol('Admin'), ctrl.eliminar);

module.exports = router;
