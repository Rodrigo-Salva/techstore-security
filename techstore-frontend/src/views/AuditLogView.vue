<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'

const logs = ref([])
const error = ref('')
const filtro = ref({ accion: '', resultado: '', email: '' })

async function cargar() {
  try {
    const { data } = await api.get('/productos/audit-logs')
    logs.value = data
  } catch (e) { error.value = e.response?.data?.error || 'Error al cargar' }
}

const acciones = computed(() => [...new Set(logs.value.map(l => l.accion))])

const logsFiltrados = computed(() => logs.value.filter(l => {
  if (filtro.value.accion && l.accion !== filtro.value.accion) return false
  if (filtro.value.resultado && l.resultado !== filtro.value.resultado) return false
  if (filtro.value.email && !l.email?.includes(filtro.value.email)) return false
  return true
}))

onMounted(cargar)
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Auditoría</h1>
        <p class="page-sub">{{ logsFiltrados.length }} de {{ logs.length }} registros</p>
      </div>
      <button class="btn btn-ghost" @click="cargar">Actualizar</button>
    </div>

    <div class="filter-bar">
      <div class="field">
        <label>Acción</label>
        <select v-model="filtro.accion">
          <option value="">Todas</option>
          <option v-for="a in acciones" :key="a" :value="a">{{ a }}</option>
        </select>
      </div>
      <div class="field">
        <label>Resultado</label>
        <select v-model="filtro.resultado">
          <option value="">Todos</option>
          <option value="permitido">Permitido</option>
          <option value="denegado">Denegado</option>
        </select>
      </div>
      <div class="field grow">
        <label>Email</label>
        <input v-model="filtro.email" type="text" placeholder="Filtrar por email..." />
      </div>
    </div>

    <div v-if="error" class="alert alert-error" style="margin-bottom:1rem">{{ error }}</div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Email</th><th>Acción</th><th>Recurso</th>
            <th>Resultado</th><th>IP</th><th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in logsFiltrados" :key="l.id">
            <td class="td-muted">{{ l.id }}</td>
            <td class="td-muted">{{ l.email || '—' }}</td>
            <td><span class="action-tag">{{ l.accion }}</span></td>
            <td class="td-code">{{ l.recurso }}</td>
            <td>
              <span :class="['result-badge', l.resultado === 'permitido' ? 'ok' : 'deny']">
                {{ l.resultado }}
              </span>
            </td>
            <td class="td-muted">{{ l.ip }}</td>
            <td class="td-muted">{{ new Date(l.fecha).toLocaleString() }}</td>
          </tr>
          <tr v-if="logsFiltrados.length === 0">
            <td colspan="7" class="empty">Sin registros</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.25rem; gap: 1rem; }
h1 { font-size: 1.5rem; font-weight: 700; }
.page-sub { color: var(--text2); font-size: 0.875rem; margin-top: 0.2rem; }
.filter-bar { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-end; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.25rem; }
.field { display: flex; flex-direction: column; gap: 0.3rem; min-width: 140px; }
.field.grow { flex: 1; }
label { font-size: 0.72rem; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; }
input, select { padding: 0.5rem 0.75rem; background: var(--bg); border: 1px solid var(--border2); border-radius: var(--radius); color: var(--text); font-size: 0.875rem; }
input:focus, select:focus { outline: none; border-color: var(--accent); }
.alert { padding: 0.55rem 0.85rem; border-radius: var(--radius); font-size: 0.82rem; }
.alert-error { background: rgba(233,69,96,0.08); border: 1px solid rgba(233,69,96,0.2); color: #ff6b6b; }
.table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
th { padding: 0.7rem 1rem; text-align: left; font-size: 0.7rem; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; background: var(--bg); border-bottom: 1px solid var(--border); }
td { padding: 0.65rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
tr:last-child td { border-bottom: none; }
.td-muted { color: var(--text2); }
.td-code { font-family: monospace; font-size: 0.78rem; color: #7dd3fc; }
.action-tag { background: var(--border2); color: var(--text2); padding: 0.12rem 0.5rem; border-radius: 4px; font-family: monospace; font-size: 0.75rem; }
.result-badge { font-size: 0.72rem; font-weight: 600; padding: 0.15rem 0.55rem; border-radius: 999px; }
.result-badge.ok { background: rgba(34,197,94,0.1); color: var(--success); }
.result-badge.deny { background: rgba(233,69,96,0.1); color: var(--danger); }
.empty { text-align: center; color: var(--text3); padding: 2.5rem; }
.btn { padding: 0.4rem 0.9rem; border-radius: var(--radius); font-size: 0.82rem; font-weight: 500; border: none; transition: all 0.15s; cursor: pointer; }
.btn-ghost { background: transparent; border: 1px solid var(--border2); color: var(--text2); }
.btn-ghost:hover { border-color: var(--text2); color: var(--text); }
</style>
