<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const form = ref({ email: '', password: '', nombre_completo: '', tienda_id: '' })
const error = ref('')
const loading = ref(false)
const registrado = ref(null)

const requisitos = [
  { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Una mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Un número', test: (p) => /\d/.test(p) },
  { label: 'Un carácter especial (!@#...)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
]

const pwdOk = () => requisitos.every(r => r.test(form.value.password))

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    const payload = { ...form.value }
    if (!payload.tienda_id) delete payload.tienda_id
    else payload.tienda_id = parseInt(payload.tienda_id)
    const { data } = await api.post('/auth/register', payload)
    registrado.value = { qr: data.qr_base64, secret: data.secret_manual, email: form.value.email }
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al registrar'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- QR step -->
  <div v-if="registrado" class="auth-page">
    <div class="auth-box qr-box">
      <div class="success-icon">✓</div>
      <h1>¡Cuenta creada!</h1>
      <p class="auth-sub">Configura tu autenticador para continuar</p>

      <div class="qr-img-wrap">
        <img :src="registrado.qr" alt="QR" />
      </div>

      <ol class="steps">
        <li>Descarga <strong>Google Authenticator</strong></li>
        <li>Toca <strong>"+"</strong> → <strong>"Escanear QR"</strong></li>
        <li>O ingresa la clave manual:</li>
      </ol>

      <div class="secret-chip">
        <span class="chip-label">Clave manual</span>
        <code>{{ registrado.secret }}</code>
      </div>

      <p class="warning-note">Guarda esta clave — la necesitarás siempre.</p>

      <button class="btn-submit" @click="router.push('/login')">
        Ir al Login →
      </button>
    </div>
  </div>

  <!-- Register form -->
  <div v-else class="auth-page">
    <div class="auth-box">
      <div class="auth-logo">TS</div>
      <h1>Crear cuenta</h1>
      <p class="auth-sub">Completa los datos para registrarte</p>

      <form @submit.prevent="handleRegister">
        <div class="field">
          <label>Nombre completo</label>
          <input v-model="form.nombre_completo" type="text" placeholder="Juan Pérez" required />
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="correo@empresa.com" required />
        </div>
        <div class="field">
          <label>Contraseña</label>
          <input v-model="form.password" type="password" placeholder="••••••••" required />
          <div v-if="form.password" class="pwd-checks">
            <span v-for="r in requisitos" :key="r.label" :class="['check', r.test(form.password) ? 'ok' : '']">
              {{ r.test(form.password) ? '✓' : '○' }} {{ r.label }}
            </span>
          </div>
        </div>
        <div class="field">
          <label>Tienda ID <span class="opt">(opcional)</span></label>
          <input v-model="form.tienda_id" type="number" placeholder="ej: 1" min="1" />
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <button type="submit" class="btn-submit" :disabled="loading || !pwdOk()">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Registrando...' : 'Crear cuenta' }}
        </button>
      </form>

      <p class="auth-footer">
        ¿Ya tienes cuenta? <RouterLink to="/login">Iniciar sesión</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 1.5rem 1rem; }
.auth-box {
  width: 100%; max-width: 400px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 2.5rem 2rem;
  display: flex; flex-direction: column; align-items: center;
}
.auth-logo { width: 44px; height: 44px; background: var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 800; color: #fff; margin-bottom: 1rem; }
h1 { font-size: 1.3rem; font-weight: 700; }
.auth-sub { font-size: 0.8rem; color: var(--text3); margin-top: 0.2rem; margin-bottom: 1.75rem; text-align: center; }
form { width: 100%; display: flex; flex-direction: column; gap: 0.9rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
label { font-size: 0.78rem; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.05em; }
.opt { text-transform: none; color: var(--text3); font-weight: 400; letter-spacing: 0; }
input {
  padding: 0.6rem 0.85rem; background: var(--bg);
  border: 1px solid var(--border2); border-radius: var(--radius);
  color: var(--text); font-size: 0.9rem; width: 100%;
  transition: border-color 0.15s;
}
input:focus { outline: none; border-color: var(--accent); }
.pwd-checks { display: flex; flex-direction: column; gap: 0.2rem; margin-top: 0.4rem; }
.check { font-size: 0.76rem; color: var(--text3); }
.check.ok { color: var(--success); }
.alert { padding: 0.6rem 0.85rem; border-radius: var(--radius); font-size: 0.82rem; width: 100%; }
.alert-error { background: rgba(233,69,96,0.08); border: 1px solid rgba(233,69,96,0.2); color: #ff6b6b; }
.btn-submit {
  width: 100%; padding: 0.7rem; background: var(--accent); color: #fff; border: none;
  border-radius: var(--radius); font-size: 0.9rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  transition: background 0.15s, transform 0.1s; margin-top: 0.25rem;
}
.btn-submit:hover:not(:disabled) { background: var(--accent2); transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.auth-footer { font-size: 0.82rem; color: var(--text3); margin-top: 1.5rem; }
.auth-footer a { color: var(--accent); font-weight: 500; }
/* QR */
.qr-box { max-width: 400px; }
.success-icon { width: 48px; height: 48px; background: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.4rem; margin-bottom: 1rem; }
.qr-img-wrap { background: #fff; border-radius: 10px; padding: 0.75rem; margin: 1.25rem 0; }
.qr-img-wrap img { width: 180px; height: 180px; display: block; }
.steps { text-align: left; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.85rem; color: var(--text2); margin-bottom: 1rem; width: 100%; }
.secret-chip { background: var(--bg); border: 1px solid var(--border2); border-radius: var(--radius); padding: 0.6rem 1rem; width: 100%; margin-bottom: 0.75rem; }
.chip-label { font-size: 0.72rem; color: var(--text3); display: block; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; }
.secret-chip code { font-size: 1rem; color: var(--accent); letter-spacing: 0.12rem; font-family: monospace; }
.warning-note { font-size: 0.78rem; color: var(--warning); background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: var(--radius); padding: 0.5rem 0.75rem; width: 100%; margin-bottom: 0.5rem; text-align: center; }
</style>
