<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/mfa')
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-box">
      <div class="auth-logo">TS</div>
      <h1>TechStore</h1>
      <p class="auth-sub">Sistema de Gestión de Inventario</p>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="correo@empresa.com" required autofocus />
        </div>
        <div class="field">
          <label>Contraseña</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <p class="auth-footer">
        ¿No tienes cuenta? <RouterLink to="/register">Regístrate</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 1rem;
}
.auth-box {
  width: 100%;
  max-width: 380px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.auth-logo {
  width: 44px; height: 44px;
  background: var(--accent);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 800; color: #fff;
  margin-bottom: 1rem;
}
h1 { font-size: 1.4rem; font-weight: 700; color: var(--text); }
.auth-sub { font-size: 0.8rem; color: var(--text3); margin-top: 0.2rem; margin-bottom: 1.75rem; }
form { width: 100%; display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
label { font-size: 0.78rem; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.05em; }
input {
  padding: 0.6rem 0.85rem;
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 0.9rem;
  transition: border-color 0.15s;
  width: 100%;
}
input:focus { outline: none; border-color: var(--accent); }
.alert { padding: 0.6rem 0.85rem; border-radius: var(--radius); font-size: 0.82rem; }
.alert-error { background: rgba(233,69,96,0.08); border: 1px solid rgba(233,69,96,0.25); color: #ff6b6b; }
.btn-submit {
  width: 100%;
  padding: 0.7rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  transition: background 0.15s, transform 0.1s;
  margin-top: 0.25rem;
}
.btn-submit:hover:not(:disabled) { background: var(--accent2); transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.auth-footer { font-size: 0.82rem; color: var(--text3); margin-top: 1.5rem; }
.auth-footer a { color: var(--accent); font-weight: 500; }
.auth-footer a:hover { text-decoration: underline; }
</style>
