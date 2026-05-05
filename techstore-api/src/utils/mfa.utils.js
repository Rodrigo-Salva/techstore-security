const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

function generarSecretoTOTP(email) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, 'TechStore', secret);
  return { secret, otpauth };
}

async function generarQR(otpauth) {
  return await QRCode.toDataURL(otpauth);
}

function verificarTOTP(token, secret) {
  return authenticator.verify({ token, secret });
}

function generarCodigoEmail() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function enviarCodigoEmail(destinatario, codigo) {
  const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from:    `"TechStore Seguridad" <${process.env.EMAIL_USER}>`,
    to:      destinatario,
    subject: '🔐 Tu código de verificación TechStore',
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#01696f;margin-bottom:8px">TechStore — Verificación MFA</h2>
        <p style="color:#4a5568">Recibimos una solicitud de acceso a tu cuenta. Tu código es:</p>
        <div style="font-size:40px;font-weight:800;letter-spacing:14px;color:#1a202c;margin:28px 0;text-align:center;background:#f7fafc;padding:16px;border-radius:8px">
          ${codigo}
        </div>
        <p style="color:#718096;font-size:13px">
          ⏱ Válido por <strong>5 minutos</strong>.<br/>
          Si no solicitaste este código, ignora este mensaje.
        </p>
      </div>
    `,
  });
}

module.exports = {
  generarSecretoTOTP,
  generarQR,
  verificarTOTP,
  generarCodigoEmail,
  enviarCodigoEmail,
};