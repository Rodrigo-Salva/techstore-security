const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { register, login, verificarMFA, me } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Demasiados intentos. Espera 15 minutos.' }
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/mfa/verify', loginLimiter, verificarMFA);
router.get('/me', verificarToken, me);

module.exports = router;
