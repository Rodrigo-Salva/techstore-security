import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const tokenParcial = ref(null)
  const usuario = ref(JSON.parse(localStorage.getItem('usuario') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const roles = computed(() => usuario.value?.roles || [])
  const isAdmin = computed(() => roles.value.includes('Admin'))
  const isAuditor = computed(() => roles.value.includes('Auditor') || roles.value.includes('Admin'))

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    tokenParcial.value = data.token_parcial
    return data
  }

  async function verificarMFA(codigo_mfa) {
    const { data } = await api.post('/auth/mfa/verify', {
      token_parcial: tokenParcial.value,
      codigo_mfa,
    })
    token.value = data.token
    usuario.value = data.usuario
    tokenParcial.value = null
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    return data
  }

  async function fetchMe() {
    const { data } = await api.get('/auth/me')
    usuario.value = data
    localStorage.setItem('usuario', JSON.stringify(data))
  }

  function logout() {
    token.value = null
    tokenParcial.value = null
    usuario.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  function hasRole(...roleNames) {
    return roleNames.some((r) => roles.value.includes(r))
  }

  return {
    token,
    tokenParcial,
    usuario,
    isAuthenticated,
    roles,
    isAdmin,
    isAuditor,
    login,
    verificarMFA,
    fetchMe,
    logout,
    hasRole,
  }
})
