const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Usuario, Rol } = require("../models");
const {
  generarSecretoTOTP,
  generarQR,
  verificarTOTP,
  generarCodigoEmail,
  enviarCodigoEmail,
} = require("../utils/mfa.utils");

function validarPassword(pwd) {
  const regex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return regex.test(pwd);
}

// POST /auth/register
async function register(req, res) {
  try {
    const { email, password, nombre_completo, tienda_id } = req.body;
    if (!email || !password || !nombre_completo) {
      return res
        .status(400)
        .json({ error: "Campos requeridos: email, password, nombre_completo" });
    }
    if (!validarPassword(password)) {
      return res.status(400).json({
        error:
          "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial",
      });
    }
    const existe = await Usuario.findOne({ where: { email } });
    if (existe)
      return res.status(409).json({ error: "El email ya está registrado" });

    const hash = await bcrypt.hash(password, 12);
    const { secret, otpauth } = generarSecretoTOTP(email);
    const qr = await generarQR(otpauth);

    const usuario = await Usuario.create({
      email,
      password: hash,
      nombre_completo,
      tienda_id: tienda_id || null,
      mfa_habilitado: true,
      mfa_secret: secret,
    });

    return res.status(201).json({
      mensaje: "Usuario registrado. Escanea el QR con Google Authenticator.",
      usuario_id: usuario.id,
      qr_base64: qr,
      secret_manual: secret,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario)
      return res.status(401).json({ error: "Credenciales inválidas" });

    // Verificar bloqueo
    if (
      usuario.bloqueado_hasta &&
      new Date() < new Date(usuario.bloqueado_hasta)
    ) {
      const segs = Math.ceil(
        (new Date(usuario.bloqueado_hasta) - new Date()) / 1000,
      );
      const msg =
        segs < 60 ? `${segs} segundos` : `${Math.ceil(segs / 60)} minutos`;
      return res
        .status(429)
        .json({ error: `Cuenta bloqueada. Intenta en ${msg}.` });
    }

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      const intentos = usuario.intentos_fallidos + 1;
      const update = { intentos_fallidos: intentos };
      if (intentos >= 5) {
        update.bloqueado_hasta = new Date(Date.now() + 1 * 60 * 1000);
      }
      await usuario.update(update);
      return res.status(401).json({
        error: "Credenciales inválidas",
        intentos_restantes: Math.max(0, 5 - intentos),
      });
    }

    // Resetear intentos
    await usuario.update({ intentos_fallidos: 0, bloqueado_hasta: null });

    // Generar código email y guardarlo en BD
    const codigo = generarCodigoEmail();
    const expira = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
    await usuario.update({
      mfa_codigo_temp: codigo,
      mfa_codigo_expira: expira,
    });

    // Enviar al correo del usuario
    try {
      const emailDestino = process.env.EMAIL_USER;
      await enviarCodigoEmail(emailDestino, codigo);
      console.log(`📧 Código MFA enviado a ${emailDestino}`);
    } catch (emailErr) {
      console.error("⚠️ Error al enviar email MFA:", emailErr.message);
      // No bloqueamos el login si el email falla — TOTP sigue funcionando
    }

    const tokenParcial = jwt.sign(
      { id: usuario.id, email: usuario.email, mfa_verificado: false },
      process.env.JWT_SECRET,
      { expiresIn: "5m" },
    );

    return res.json({
      mensaje:
        "Credenciales correctas. Ingresa el código de Google Authenticator o revisa tu correo.",
      token_parcial: tokenParcial,
      mfa_requerido: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /auth/mfa/verify
async function verificarMFA(req, res) {
  try {
    const { token_parcial, codigo_mfa } = req.body;
    let payload;
    try {
      payload = jwt.verify(token_parcial, process.env.JWT_SECRET);
    } catch {
      return res
        .status(401)
        .json({ error: "Token parcial inválido o expirado" });
    }
    if (payload.mfa_verificado) {
      return res.status(400).json({ error: "Este token ya fue verificado" });
    }

    const usuario = await Usuario.findByPk(payload.id, {
      include: [{ model: Rol, through: { attributes: [] } }],
    });
    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    let verificado = false;
    let metodo = "";

    // ── Método 1: Google Authenticator (TOTP) ──
    if (verificarTOTP(codigo_mfa, usuario.mfa_secret)) {
      verificado = true;
      metodo = "TOTP";
    }

    // ── Método 2: Código por Email ──
    if (!verificado && usuario.mfa_codigo_temp === codigo_mfa) {
      const ahora = new Date();
      const expira = new Date(usuario.mfa_codigo_expira);
      if (ahora <= expira) {
        verificado = true;
        metodo = "EMAIL";
        await usuario.update({
          mfa_codigo_temp: null,
          mfa_codigo_expira: null,
        });
      } else {
        return res
          .status(401)
          .json({
            error: "El código por email expiró. Inicia sesión de nuevo.",
          });
      }
    }

    if (!verificado) {
      const intentosMFA = (usuario.intentos_mfa || 0) + 1;
      if (intentosMFA >= 3) {
        await usuario.update({
          intentos_mfa: 0,
          bloqueado_hasta: new Date(Date.now() + 1 * 60 * 1000),
        });
        return res
          .status(429)
          .json({
            error: "Demasiados intentos MFA. Cuenta bloqueada 1 minuto.",
          });
      }
      await usuario.update({ intentos_mfa: intentosMFA });
      return res.status(401).json({
        error:
          "Código MFA incorrecto. Usa Google Authenticator o el código enviado a tu correo.",
        intentos_restantes: 3 - intentosMFA,
      });
    }

    await usuario.update({ intentos_mfa: 0 });
    console.log(`✅ MFA verificado via ${metodo} para ${usuario.email}`);

    const roles = usuario.Rols ? usuario.Rols.map((r) => r.nombre) : [];
    const tokenCompleto = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tienda_id: usuario.tienda_id,
        roles,
        mfa_verificado: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
    );

    return res.json({
      mensaje: `Acceso concedido ✅ (verificado via ${metodo === "TOTP" ? "Google Authenticator" : "Email"})`,
      token: tokenCompleto,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre_completo,
        roles,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /auth/me
async function me(req, res) {
  const { id, email, nombre_completo, tienda_id } = req.usuario;
  res.json({ id, email, nombre_completo, tienda_id, roles: req.roles });
}

module.exports = { register, login, verificarMFA, me };
