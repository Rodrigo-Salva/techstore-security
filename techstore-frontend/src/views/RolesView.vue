<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth.store'
import ModalConfirm from '../components/ModalConfirm.vue'

const auth = useAuthStore()
const isAdmin = auth.isAdmin

const roles = ref([])
const error = ref('')
const denied = ref('')
const form = ref({ nombre: '', descripcion: '' })
const editando = ref(null)
const modalDelete = ref(null)
const NOMBRES = ['Admin', 'Gerente', 'Empleado', 'Auditor']

async function cargar() {
  try {
    const { data } = await api.get('/roles')
    roles.value = data
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al cargar'
  }
}

async function guardar() {
  denied.value = ''
  error.value = ''
  if (!isAdmin) {
    denied.value = 'No tienes permisos de Administrador para crear o modificar roles.'
    return
  }
  try {
    if (editando.value) await api.put(`/roles/${editando.value}`, form.value)
    else await api.post('/roles', form.value)
    form.value = { nombre: '', descripcion: '' }
    editando.value = null
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al guardar'
  }
}

function editar(r) {
  editando.value = r.id
  form.value = { nombre: r.nombre, descripcion: r.descripcion }
  denied.value = ''
}

function cancelar() {
  editando.value = null
  form.value = { nombre: '', descripcion: '' }
  error.value = ''
  denied.value = ''
}

async function eliminar() {
  try {
    await api.delete(`/roles/${modalDelete.value}`)
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al eliminar'
  }
  modalDelete.value = null
  await cargar()
}

onMounted(cargar)
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Roles</h1>
        <p class="page-sub">Roles del sistema — solo lectura para tu rol</p>
      </div>
    </div>

    <!-- Formulario solo visible para Admin; no-Admin lo ve deshabilitado para demostrar el intento -->
    <div class="panel">
      <div class="panel-title">{{ editando ? 'Editar rol' : 'Nuevo rol' }}</div>

      <div v-if="!isAdmin" class="rbac-notice">
        <span class="rbac-icon">🔒</span>
        <span>Solo los <strong>Administradores</strong> pueden crear o modificar roles.</span>
      </div>

      <form class="form-row" @submit.prevent="guardar">
        <div class="field">
          <label>Nombre</label>
          <select v-model="form.nombre" :disabled="!!editando || !isAdmin">
            <option value="">Seleccionar...</option>
            <option v-for="n in NOMBRES" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        <div class="field grow">
          <label>Descripción</label>
          <input v-model="form.descripcion" type="text" placeholder="Descripción del rol" :disabled="!isAdmin" />
        </div>
        <div class="form-btns">
          <button type="submit" class="btn" :class="isAdmin ? 'btn-primary' : 'btn-blocked'">
            {{ editando ? 'Actualizar' : 'Crear rol' }}
          </button>
          <button v-if="editando" type="button" class="btn btn-ghost" @click="cancelar">Cancelar</button>
        </div>
      </form>

      <div v-if="denied" class="alert alert-denied">
        <strong>Acceso denegado (403)</strong> — {{ denied }}
      </div>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Descripción</th><th>Creado</th>
            <th v-if="isAdmin">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in roles" :key="r.id">
            <td class="td-muted">{{ r.id }}</td>
            <td><span class="role-chip">{{ r.nombre }}</span></td>
            <td>{{ r.descripcion || '—' }}</td>
            <td class="td-muted">{{ new Date(r.fecha_creacion).toLocaleDateString() }}</td>
            <td v-if="isAdmin">
              <div class="row-actions">
                <button class="btn btn-sm btn-ghost" @click="editar(r)">Editar</button>
                <button class="btn btn-sm btn-danger" @click="modalDelete = r.id">Eliminar</button>
              </div>
            </td>
          </tr>
          <tr v-if="roles.length === 0">
            <td :colspan="isAdmin ? 5 : 4" class="empty">Sin roles</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalConfirm
      v-if="modalDelete"
      message="¿Eliminar este rol? No se puede si tiene usuarios asignados."
      @confirm="eliminar"
      @cancel="modalDelete = null"
    />
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 1.5rem; }
h1 { font-size: 1.5rem; font-weight: 700; }
.page-sub { color: var(--text2); font-size: 0.875rem; margin-top: 0.2rem; }
.panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; }
.panel-title { font-size: 0.78rem; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
.form-row { display: flex; gap: 0.75rem; align-items: flex-end; flex-wrap: wrap; }
.field { display: flex; flex-direction: column; gap: 0.3rem; min-width: 160px; }
.field.grow { flex: 1; }
label { font-size: 0.75rem; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.05em; }
input, select { padding: 0.55rem 0.8rem; background: var(--bg); border: 1px solid var(--border2); border-radius: var(--radius); color: var(--text); font-size: 0.875rem; }
input:focus, select:focus { outline: none; border-color: var(--accent); }
.form-btns { display: flex; gap: 0.5rem; align-items: flex-end; padding-bottom: 0; }
.alert { margin-top: 0.75rem; padding: 0.55rem 0.85rem; border-radius: var(--radius); font-size: 0.82rem; }
.alert-error { background: rgba(233,69,96,0.08); border: 1px solid rgba(233,69,96,0.2); color: #ff6b6b; }
.alert-denied { background: rgba(233,69,96,0.08); border: 1px solid rgba(233,69,96,0.3); color: #ff6b6b; font-size: 0.85rem; }
.rbac-notice { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--text2); background: rgba(108,99,255,0.06); border: 1px solid rgba(108,99,255,0.15); border-radius: var(--radius); padding: 0.5rem 0.85rem; margin-bottom: 0.85rem; }
.rbac-icon { font-size: 1rem; }
.btn-blocked { background: rgba(233,69,96,0.12); border: 1px solid rgba(233,69,96,0.25); color: var(--danger); cursor: pointer; }
.table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { padding: 0.75rem 1rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; background: var(--bg); border-bottom: 1px solid var(--border); }
td { padding: 0.75rem 1rem; font-size: 0.875rem; border-bottom: 1px solid var(--border); }
tr:last-child td { border-bottom: none; }
.td-muted { color: var(--text2); }
.role-chip { font-size: 0.78rem; font-weight: 600; background: rgba(108,99,255,0.1); color: var(--accent); border: 1px solid rgba(108,99,255,0.2); padding: 0.15rem 0.6rem; border-radius: 999px; }
.row-actions { display: flex; gap: 0.4rem; }
.empty { text-align: center; color: var(--text3); padding: 2rem; }
.btn { padding: 0.4rem 0.9rem; border-radius: var(--radius); font-size: 0.82rem; font-weight: 500; border: none; transition: all 0.15s; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent2); }
.btn-ghost { background: transparent; border: 1px solid var(--border2); color: var(--text2); }
.btn-ghost:hover { border-color: var(--text2); color: var(--text); }
.btn-danger { background: transparent; border: 1px solid transparent; color: var(--danger); }
.btn-danger:hover { background: rgba(233,69,96,0.08); border-color: rgba(233,69,96,0.2); }
.btn-sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; }
</style>
