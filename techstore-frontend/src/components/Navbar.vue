<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/productos', label: 'Productos' },
  { to: '/roles',     label: 'Roles' },
  { to: '/usuarios',  label: 'Usuarios',  adminOnly: true },
  { to: '/audit-logs',label: 'Auditoría', auditOnly: true },
]

function visible(l) {
  if (l.adminOnly) return auth.isAdmin
  if (l.auditOnly) return auth.isAdmin || auth.isAuditor
  return true
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="navbar">
    <div class="navbar-inner">
      <span class="logo">TS</span>

      <nav class="nav-links">
        <RouterLink
          v-for="l in links.filter(visible)"
          :key="l.to"
          :to="l.to"
          :class="['nav-link', { active: route.path === l.to }]"
        >
          {{ l.label }}
        </RouterLink>
      </nav>

      <div class="navbar-right">
        <div class="user-pill">
          <span class="user-name">{{ auth.usuario?.nombre_completo?.split(' ')[0] }}</span>
          <span class="role-tag">{{ auth.roles[0] }}</span>
        </div>
        <button class="btn-logout" @click="logout">Salir</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}
.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 2rem;
}
.logo {
  font-size: 1rem;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: 1px;
  border: 2px solid var(--accent);
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}
.nav-links {
  display: flex;
  gap: 0.25rem;
  flex: 1;
}
.nav-link {
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  color: var(--text2);
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.15s, background 0.15s;
}
.nav-link:hover { color: var(--text); background: var(--border); }
.nav-link.active { color: var(--text); background: var(--border2); }
.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.user-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.75rem;
  background: var(--border);
  border-radius: 999px;
}
.user-name { font-size: 0.82rem; color: var(--text2); }
.role-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--accent);
  background: rgba(108,99,255,0.12);
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
}
.btn-logout {
  padding: 0.35rem 0.9rem;
  background: transparent;
  border: 1px solid var(--border2);
  color: var(--text2);
  border-radius: 6px;
  font-size: 0.82rem;
  transition: all 0.15s;
}
.btn-logout:hover { border-color: var(--danger); color: var(--danger); }
</style>
