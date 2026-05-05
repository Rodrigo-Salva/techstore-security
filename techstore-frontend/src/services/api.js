import axios from 'axios'

// En producción (Docker) usa /api que nginx proxea al backend
// En desarrollo usa localhost:3000 directamente
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL,
  timeout: 10000,
})

// Adjunta el token JWT en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirige al login si el token expira o es inválido (solo en rutas protegidas)
const PUBLIC_URLS = ['/auth/login', '/auth/register', '/auth/mfa/verify']

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || ''
    const isPublic = PUBLIC_URLS.some((u) => url.includes(u))
    if (err.response?.status === 401 && !isPublic) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
