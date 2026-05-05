import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/register', component: () => import('../views/RegisterView.vue'), meta: { public: true } },
  { path: '/mfa', component: () => import('../views/MFAView.vue'), meta: { public: true } },
  { path: '/dashboard', component: () => import('../views/DashboardView.vue'), meta: { auth: true } },
  { path: '/productos', component: () => import('../views/ProductosView.vue'), meta: { auth: true } },
  {
    path: '/roles',
    component: () => import('../views/RolesView.vue'),
    meta: { auth: true },
  },
  {
    path: '/usuarios',
    component: () => import('../views/UsuariosView.vue'),
    meta: { auth: true, roles: ['Admin'], rolesLabel: 'Administrador' },
  },
  {
    path: '/audit-logs',
    component: () => import('../views/AuditLogView.vue'),
    meta: { auth: true, roles: ['Admin', 'Auditor'], rolesLabel: 'Admin o Auditor' },
  },
  {
    path: '/forbidden',
    component: () => import('../views/ForbiddenView.vue'),
    meta: { auth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) return true

  if (to.meta.auth && !auth.isAuthenticated) return '/login'

  if (to.meta.roles && !auth.hasRole(...to.meta.roles)) {
    return { path: '/forbidden', query: { recurso: to.path, requiere: to.meta.rolesLabel || to.meta.roles.join(', ') } }
  }

  return true
})

export default router
