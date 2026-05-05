<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const recurso  = route.query.recurso  || 'este recurso'
const requiere = route.query.requiere || 'permisos especiales'
const rolActual = auth.usuario?.roles?.[0] || 'tu rol'
</script>

<template>
  <div class="forbidden-wrap">
    <div class="forbidden-card">
      <div class="icon">⛔</div>
      <h1>Acceso denegado</h1>
      <p class="sub">No tienes permisos de <strong>{{ requiere }}</strong></p>

      <div class="detail-box">
        <div class="detail-row">
          <span class="label">Recurso solicitado</span>
          <code>{{ recurso }}</code>
        </div>
        <div class="detail-row">
          <span class="label">Tu rol actual</span>
          <span class="role-chip">{{ rolActual }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Rol requerido</span>
          <span class="role-req">{{ requiere }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Código HTTP</span>
          <code class="http-code">403 Forbidden</code>
        </div>
      </div>

      <p class="hint">Esta acción fue registrada en el log de auditoría.</p>

      <button class="btn btn-primary" @click="router.push('/dashboard')">Volver al Dashboard</button>
    </div>
  </div>
</template>

<style scoped>
.forbidden-wrap {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.forbidden-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2.5rem 2rem;
  max-width: 480px;
  width: 100%;
  text-align: center;
}
.icon { font-size: 3rem; margin-bottom: 1rem; }
h1 { font-size: 1.5rem; font-weight: 700; color: var(--danger); margin-bottom: 0.4rem; }
.sub { color: var(--text2); font-size: 0.95rem; margin-bottom: 1.5rem; }
.sub strong { color: var(--text); }
.detail-box {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.detail-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.label { font-size: 0.75rem; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.04em; }
code { font-family: monospace; font-size: 0.82rem; color: var(--text2); background: rgba(255,255,255,0.04); padding: 0.1rem 0.4rem; border-radius: 4px; }
.http-code { color: var(--danger); }
.role-chip { font-size: 0.78rem; font-weight: 600; background: rgba(108,99,255,0.1); color: var(--accent); border: 1px solid rgba(108,99,255,0.2); padding: 0.1rem 0.5rem; border-radius: 999px; }
.role-req { font-size: 0.78rem; font-weight: 600; background: rgba(233,69,96,0.1); color: var(--danger); border: 1px solid rgba(233,69,96,0.2); padding: 0.1rem 0.5rem; border-radius: 999px; }
.hint { font-size: 0.8rem; color: var(--text3); margin-bottom: 1.5rem; }
.btn { padding: 0.5rem 1.25rem; border-radius: var(--radius); font-size: 0.875rem; font-weight: 500; border: none; cursor: pointer; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent2); }
</style>
