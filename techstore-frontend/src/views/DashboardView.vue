<script setup>
import { useAuthStore } from '../stores/auth.store'

const auth = useAuthStore()

const cards = [
  { to: '/productos', icon: '📦', title: 'Productos', desc: 'Gestión de inventario', always: true },
  { to: '/usuarios', icon: '👤', title: 'Usuarios', desc: 'Administrar cuentas', admin: true },
  { to: '/roles', icon: '🔑', title: 'Roles', desc: 'Control de acceso', admin: true },
  { to: '/audit-logs', icon: '📋', title: 'Auditoría', desc: 'Registro de actividad', audit: true },
]

function visible(c) {
  if (c.admin) return auth.isAdmin
  if (c.audit) return auth.isAuditor
  return true
}
</script>

<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p class="page-sub">Bienvenido, <strong>{{ auth.usuario?.nombre_completo }}</strong></p>
      </div>
      <div class="role-badges">
        <span class="badge" v-for="r in auth.roles" :key="r">{{ r }}</span>
      </div>
    </div>

    <div class="cards-grid">
      <RouterLink
        v-for="c in cards.filter(visible)"
        :key="c.to"
        :to="c.to"
        class="card"
      >
        <div class="card-icon">{{ c.icon }}</div>
        <div class="card-body">
          <div class="card-title">{{ c.title }}</div>
          <div class="card-desc">{{ c.desc }}</div>
        </div>
        <span class="card-arrow">→</span>
      </RouterLink>
    </div>

    <div class="info-row">
      <div class="info-item">
        <span class="info-label">Email</span>
        <span class="info-val">{{ auth.usuario?.email }}</span>
      </div>
      <div class="info-item" v-if="auth.usuario?.tienda_id">
        <span class="info-label">Tienda asignada</span>
        <span class="info-val">#{{ auth.usuario?.tienda_id }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">MFA</span>
        <span class="info-val ok">Activo</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 1.75rem; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
h1 { font-size: 1.5rem; font-weight: 700; }
.page-sub { color: var(--text2); font-size: 0.875rem; margin-top: 0.2rem; }
.role-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.badge { font-size: 0.75rem; font-weight: 600; color: var(--accent); background: rgba(108,99,255,0.12); border: 1px solid rgba(108,99,255,0.2); padding: 0.2rem 0.65rem; border-radius: 999px; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
.card {
  display: flex; align-items: center; gap: 1rem;
  padding: 1.25rem 1.25rem;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: border-color 0.15s, transform 0.15s;
  color: var(--text);
}
.card:hover { border-color: var(--accent); transform: translateY(-2px); }
.card-icon { font-size: 1.5rem; flex-shrink: 0; }
.card-body { flex: 1; }
.card-title { font-size: 0.9rem; font-weight: 600; }
.card-desc { font-size: 0.78rem; color: var(--text2); margin-top: 0.1rem; }
.card-arrow { color: var(--text3); font-size: 1rem; transition: color 0.15s; }
.card:hover .card-arrow { color: var(--accent); }
.info-row {
  display: flex; flex-wrap: wrap; gap: 1px;
  background: var(--border);
  border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden;
}
.info-item {
  flex: 1; min-width: 160px;
  padding: 1rem 1.25rem;
  background: var(--surface);
  display: flex; flex-direction: column; gap: 0.25rem;
}
.info-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text3); font-weight: 600; }
.info-val { font-size: 0.875rem; color: var(--text); }
.info-val.ok { color: var(--success); font-weight: 600; }
</style>
