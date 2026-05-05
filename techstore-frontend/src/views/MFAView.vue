<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = useRouter()
const auth = useAuthStore()
const codigo = ref('')
const error = ref('')
const loading = ref(false)

if (!auth.tokenParcial) router.replace('/login')

async function handleMFA() {
  error.value = ''
  loading.value = true
  try {
    await auth.verificarMFA(codigo.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.error || 'Código inválido'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-box">
      <div class="auth-logo">🔐</div>
      <h1>Verificación MFA</h1>
      <p class="auth-sub">Ingresa el código de tu app autenticadora</p>

      <form @submit.prevent="handleMFA">
        <div class="field">
          <label>Código de 6 dígitos</label>
          <input
            v-model="codigo"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            required
            autofocus
            class="code-input"
          />
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Verificando...' : 'Verificar' }}
        </button>
      </form>

      <p class="auth-footer">
        <RouterLink to="/login">← Volver al login</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg); padding: 1rem;
}
.auth-box {
  width: 100%; max-width: 360px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2.5rem 2rem;
  display: flex; flex-direction: column; align-items: center;
}
.auth-logo { font-size: 2rem; margin-bottom: 1rem; }
h1 { font-size: 1.3rem; font-weight: 700; }
.auth-sub { font-size: 0.8rem; color: var(--text3); margin-top: 0.2rem; margin-bottom: 1.75rem; text-align: center; }
form { width: 100%; display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
label { font-size: 0.78rem; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.05em; }
.code-input {
  padding: 0.75rem;
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.6rem;
  text-align: center;
  width: 100%;
  transition: border-color 0.15s;
}
.code-input:focus { outline: none; border-color: var(--accent); }
.alert { padding: 0.6rem 0.85rem; border-radius: var(--radius); font-size: 0.82rem; }
.alert-error { background: rgba(233,69,96,0.08); border: 1px solid rgba(233,69,96,0.25); color: #ff6b6b; }
.btn-submit {
  width: 100%; padding: 0.7rem;
  background: var(--accent); color: #fff; border: none;
  border-radius: var(--radius); font-size: 0.9rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  transition: background 0.15s, transform 0.1s;
}
.btn-submit:hover:not(:disabled) { background: var(--accent2); transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.auth-footer { font-size: 0.82rem; color: var(--text3); margin-top: 1.5rem; }
.auth-footer a { color: var(--accent); }
</style>
