<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import ModalConfirm from '../components/ModalConfirm.vue'

const usuarios = ref([])
const roles = ref([])
const error = ref('')
const editando = ref(null)
const formEdit = ref({})
const modalDelete = ref(null)
const asignando = ref({ uid: null, rol_id: '' })

async function cargar() {
  const [u, r] = await Promise.all([api.get('/usuarios'), api.get('/roles')])
  usuarios.value = u.data
  roles.value = r.data
}

function iniciarEdicion(u) {
  editando.value = u.id
  formEdit.value = { nombre_completo: u.nombre_completo, tienda_id: u.tienda_id, activo: u.activo }
}

async function guardar() {
  error.value = ''
  try {
    await api.put(`/usuarios/${editando.value}`, formEdit.value)
    editando.value = null
    await cargar()
  } catch (e) { error.value = e.response?.data?.error || 'Error' }
}

async function eliminar() {
  await api.delete(`/usuarios/${modalDelete.value}`)
  modalDelete.value = null
  await cargar()
}

async function asignarRol(uid) {
  if (!asignando.value.rol_id) return
  try {
    await api.post(`/usuarios/${uid}/roles`, { rol_id: parseInt(asignando.value.rol_id) })
    asignando.value = { uid: null, rol_id: '' }
    await cargar()
  } catch (e) { error.value = e.response?.data?.error || 'Error' }
}

async function revocar(uid, rid) {
  await api.delete(`/usuarios/${uid}/roles/${rid}`)
  await cargar()
}

onMounted(cargar)
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Usuarios</h1>
        <p class="page-sub">Gestión de cuentas y roles</p>
      </div>
    </div>

    <div v-if="error" class="alert alert-error" style="margin-bottom:1rem">{{ error }}</div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Email</th><th>Tienda</th><th>Estado</th><th>Roles</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuarios" :key="u.id">
            <td class="td-muted">{{ u.id }}</td>
            <td>
              <input v-if="editando === u.id" v-model="formEdit.nombre_completo" class="inline-input" />
              <span v-else class="fw">{{ u.nombre_completo }}</span>
            </td>
            <td class="td-muted">{{ u.email }}</td>
            <td>
              <input v-if="editando === u.id" v-model.number="formEdit.tienda_id" type="number" class="inline-input sm" />
              <span v-else class="td-muted">{{ u.tienda_id ?? '—' }}</span>
            </td>
            <td>
              <template v-if="editando === u.id">
                <select v-model="formEdit.activo" class="inline-input sm">
                  <option :value="true">Activo</option>
                  <option :value="false">Inactivo</option>
                </select>
              </template>
              <span v-else :class="['status', u.activo ? 'ok' : 'off']">
                {{ u.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <div class="roles-cell">
                <span class="role-chip" v-for="r in u.Rols" :key="r.id">
                  {{ r.nombre }}
                  <button class="chip-x" @click="revocar(u.id, r.id)" title="Revocar">×</button>
                </span>
                <template v-if="asignando.uid === u.id">
                  <select v-model="asignando.rol_id" class="inline-input sm">
                    <option value="">Rol...</option>
                    <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nombre }}</option>
                  </select>
                  <button class="btn btn-sm btn-primary" @click="asignarRol(u.id)">+</button>
                  <button class="btn btn-sm btn-ghost" @click="asignando = { uid: null, rol_id: '' }">✕</button>
                </template>
                <button v-else class="btn-add-role" @click="asignando = { uid: u.id, rol_id: '' }">+ Rol</button>
              </div>
            </td>
            <td>
              <div class="row-actions" v-if="editando === u.id">
                <button class="btn btn-sm btn-primary" @click="guardar">Guardar</button>
                <button class="btn btn-sm btn-ghost" @click="editando = null">Cancelar</button>
              </div>
              <div class="row-actions" v-else>
                <button class="btn btn-sm btn-ghost" @click="iniciarEdicion(u)">Editar</button>
                <button class="btn btn-sm btn-danger" @click="modalDelete = u.id">Eliminar</button>
              </div>
            </td>
          </tr>
          <tr v-if="usuarios.length === 0">
            <td colspan="7" class="empty">Sin usuarios</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalConfirm
      v-if="modalDelete"
      message="¿Desactivar este usuario?"
      @confirm="eliminar"
      @cancel="modalDelete = null"
    />
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 1.5rem; }
h1 { font-size: 1.5rem; font-weight: 700; }
.page-sub { color: var(--text2); font-size: 0.875rem; margin-top: 0.2rem; }
.alert { padding: 0.55rem 0.85rem; border-radius: var(--radius); font-size: 0.82rem; }
.alert-error { background: rgba(233,69,96,0.08); border: 1px solid rgba(233,69,96,0.2); color: #ff6b6b; }
.table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { padding: 0.75rem 1rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; background: var(--bg); border-bottom: 1px solid var(--border); }
td { padding: 0.7rem 1rem; font-size: 0.875rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
tr:last-child td { border-bottom: none; }
.td-muted { color: var(--text2); }
.fw { font-weight: 500; }
.inline-input { padding: 0.3rem 0.55rem; background: var(--bg); border: 1px solid var(--border2); border-radius: 6px; color: var(--text); font-size: 0.82rem; }
.inline-input.sm { width: 80px; }
.status { font-size: 0.75rem; font-weight: 600; padding: 0.15rem 0.55rem; border-radius: 999px; }
.status.ok { background: rgba(34,197,94,0.1); color: var(--success); }
.status.off { background: rgba(90,90,112,0.15); color: var(--text3); }
.roles-cell { display: flex; flex-wrap: wrap; align-items: center; gap: 0.35rem; }
.role-chip { display: inline-flex; align-items: center; gap: 0.2rem; font-size: 0.72rem; font-weight: 600; background: rgba(108,99,255,0.1); color: var(--accent); border: 1px solid rgba(108,99,255,0.2); padding: 0.12rem 0.45rem; border-radius: 999px; }
.chip-x { background: none; border: none; color: var(--accent); cursor: pointer; font-size: 0.85rem; line-height: 1; opacity: 0.7; padding: 0; }
.chip-x:hover { opacity: 1; }
.btn-add-role { background: transparent; border: 1px dashed var(--border2); color: var(--text3); padding: 0.12rem 0.5rem; border-radius: 999px; font-size: 0.72rem; cursor: pointer; transition: all 0.15s; }
.btn-add-role:hover { border-color: var(--accent); color: var(--accent); }
.row-actions { display: flex; gap: 0.35rem; }
.empty { text-align: center; color: var(--text3); padding: 2rem; }
.btn { padding: 0.4rem 0.9rem; border-radius: var(--radius); font-size: 0.82rem; font-weight: 500; border: none; transition: all 0.15s; }
.btn-sm { padding: 0.28rem 0.65rem; font-size: 0.76rem; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent2); }
.btn-ghost { background: transparent; border: 1px solid var(--border2); color: var(--text2); }
.btn-ghost:hover { border-color: var(--text2); color: var(--text); }
.btn-danger { background: transparent; border: 1px solid transparent; color: var(--danger); }
.btn-danger:hover { background: rgba(233,69,96,0.08); border-color: rgba(233,69,96,0.2); }
</style>
