<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth.store'
import ModalConfirm from '../components/ModalConfirm.vue'

const auth = useAuthStore()
const productos = ref([])
const error = ref('')
const editando = ref(null)
const modalDelete = ref(null)
const mostrarForm = ref(false)

const formVacio = () => ({
  nombre: '', descripcion: '', precio: '', stock: 0,
  categoria: '', tienda_id: auth.usuario?.tienda_id || '', es_premium: false,
})
const form = ref(formVacio())

const canCreate = auth.hasRole('Admin', 'Gerente', 'Empleado')
// Auditor no puede eliminar — los demás lo intentan y el backend aplica ABAC
const canDelete = !auth.hasRole('Auditor')

function campo(f) {
  if (auth.hasRole('Admin')) return true
  if (auth.hasRole('Gerente')) return f !== 'categoria'
  if (auth.hasRole('Empleado')) return f === 'stock'
  return false
}

async function cargar() {
  try {
    const { data } = await api.get('/productos')
    productos.value = data
  } catch (e) { error.value = e.response?.data?.error || 'Error al cargar' }
}

const CAMPOS_TODOS = ['nombre', 'descripcion', 'precio', 'stock', 'categoria', 'tienda_id', 'es_premium']

async function guardar() {
  error.value = ''
  try {
    const full = { ...form.value, precio: parseFloat(form.value.precio), stock: parseInt(form.value.stock), tienda_id: parseInt(form.value.tienda_id) }
    // Solo enviar los campos que el rol tiene permitido ver/editar
    const p = editando.value
      ? Object.fromEntries(CAMPOS_TODOS.filter(f => campo(f)).map(f => [f, full[f]]))
      : full
    if (editando.value) await api.put(`/productos/${editando.value}`, p)
    else await api.post('/productos', p)
    form.value = formVacio()
    editando.value = null
    mostrarForm.value = false
    await cargar()
  } catch (e) { error.value = e.response?.data?.error || 'Error al guardar' }
}

function editar(p) { editando.value = p.id; form.value = { ...p }; mostrarForm.value = true }
function cancelar() { editando.value = null; form.value = formVacio(); mostrarForm.value = false; error.value = '' }

async function eliminar() {
  try { await api.delete(`/productos/${modalDelete.value}`) }
  catch (e) { error.value = e.response?.data?.error || 'Error al eliminar' }
  modalDelete.value = null
  await cargar()
}

onMounted(cargar)
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Productos</h1>
        <p class="page-sub">{{ productos.length }} productos en inventario</p>
      </div>
      <button v-if="canCreate && !mostrarForm" class="btn btn-primary" @click="mostrarForm = true">
        + Nuevo producto
      </button>
    </div>

    <div v-if="mostrarForm" class="panel">
      <div class="panel-title">{{ editando ? 'Editar producto' : 'Nuevo producto' }}</div>
      <form @submit.prevent="guardar">
        <div class="form-grid">
          <div class="field" v-if="campo('nombre')">
            <label>Nombre</label>
            <input v-model="form.nombre" type="text" required />
          </div>
          <div class="field" v-if="campo('precio')">
            <label>Precio (S/)</label>
            <input v-model="form.precio" type="number" step="0.01" min="0" required />
          </div>
          <div class="field" v-if="campo('stock')">
            <label>Stock</label>
            <input v-model.number="form.stock" type="number" min="0" required />
          </div>
          <div class="field" v-if="campo('categoria')">
            <label>Categoría</label>
            <input v-model="form.categoria" type="text" />
          </div>
          <div class="field" v-if="campo('tienda_id')">
            <label>Tienda ID</label>
            <input v-model.number="form.tienda_id" type="number" required />
          </div>
          <div class="field check-field" v-if="campo('es_premium')">
            <label class="check-label">
              <input v-model="form.es_premium" type="checkbox" />
              <span>Producto Premium</span>
            </label>
          </div>
          <div class="field full" v-if="campo('descripcion')">
            <label>Descripción</label>
            <textarea v-model="form.descripcion" rows="2"></textarea>
          </div>
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">{{ editando ? 'Actualizar' : 'Crear' }}</button>
          <button type="button" class="btn btn-ghost" @click="cancelar">Cancelar</button>
        </div>
      </form>
    </div>

    <div v-if="error && !mostrarForm" class="alert alert-error" style="margin-bottom:1rem">{{ error }}</div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th>
            <th>Categoría</th><th>Tienda</th><th>Premium</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in productos" :key="p.id">
            <td class="td-muted">{{ p.id }}</td>
            <td class="fw">{{ p.nombre }}</td>
            <td>S/ {{ Number(p.precio).toFixed(2) }}</td>
            <td><span :class="['stock-badge', p.stock > 0 ? 'ok' : 'empty']">{{ p.stock }}</span></td>
            <td class="td-muted">{{ p.categoria || '—' }}</td>
            <td class="td-muted">{{ p.tienda_id }}</td>
            <td>
              <span v-if="p.es_premium" class="premium-badge">Premium</span>
              <span v-else class="td-muted">—</span>
            </td>
            <td>
              <div class="row-actions">
                <button class="btn btn-sm btn-ghost" @click="editar(p)">Editar</button>
                <button v-if="canDelete" class="btn btn-sm btn-danger" @click="modalDelete = p.id">Eliminar</button>
              </div>
            </td>
          </tr>
          <tr v-if="productos.length === 0">
            <td colspan="8" class="empty">Sin productos — crea el primero</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalConfirm
      v-if="modalDelete"
      message="¿Eliminar este producto? Esta acción no se puede deshacer."
      @confirm="eliminar"
      @cancel="modalDelete = null"
    />
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; }
h1 { font-size: 1.5rem; font-weight: 700; }
.page-sub { color: var(--text2); font-size: 0.875rem; margin-top: 0.2rem; }
.panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; }
.panel-title { font-size: 0.78rem; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 0.75rem; }
.field { display: flex; flex-direction: column; gap: 0.3rem; }
.field.full { grid-column: 1 / -1; }
.check-field { justify-content: flex-end; }
.check-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text2); cursor: pointer; padding-bottom: 0.1rem; }
.check-label input { width: auto; accent-color: var(--accent); }
label { font-size: 0.75rem; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.05em; }
input, textarea, select { padding: 0.55rem 0.8rem; background: var(--bg); border: 1px solid var(--border2); border-radius: var(--radius); color: var(--text); font-size: 0.875rem; }
input:focus, textarea:focus { outline: none; border-color: var(--accent); }
.form-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.alert { padding: 0.55rem 0.85rem; border-radius: var(--radius); font-size: 0.82rem; margin-top: 0.75rem; }
.alert-error { background: rgba(233,69,96,0.08); border: 1px solid rgba(233,69,96,0.2); color: #ff6b6b; }
.table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { padding: 0.75rem 1rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; background: var(--bg); border-bottom: 1px solid var(--border); }
td { padding: 0.75rem 1rem; font-size: 0.875rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
tr:last-child td { border-bottom: none; }
.td-muted { color: var(--text2); }
.fw { font-weight: 500; }
.stock-badge { font-size: 0.8rem; font-weight: 700; padding: 0.15rem 0.55rem; border-radius: 6px; }
.stock-badge.ok { background: rgba(34,197,94,0.1); color: var(--success); }
.stock-badge.empty { background: rgba(233,69,96,0.1); color: var(--danger); }
.premium-badge { font-size: 0.72rem; font-weight: 600; background: rgba(245,158,11,0.1); color: var(--warning); border: 1px solid rgba(245,158,11,0.2); padding: 0.12rem 0.5rem; border-radius: 999px; }
.row-actions { display: flex; gap: 0.35rem; }
.empty { text-align: center; color: var(--text3); padding: 2.5rem; }
.btn { padding: 0.4rem 0.9rem; border-radius: var(--radius); font-size: 0.82rem; font-weight: 500; border: none; transition: all 0.15s; cursor: pointer; }
.btn-sm { padding: 0.28rem 0.65rem; font-size: 0.76rem; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent2); }
.btn-ghost { background: transparent; border: 1px solid var(--border2); color: var(--text2); }
.btn-ghost:hover { border-color: var(--text2); color: var(--text); }
.btn-danger { background: transparent; border: 1px solid transparent; color: var(--danger); }
.btn-danger:hover { background: rgba(233,69,96,0.08); border-color: rgba(233,69,96,0.2); }
</style>
