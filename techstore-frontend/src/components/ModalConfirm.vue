<script setup>
defineProps({
  title: { type: String, default: 'Confirmar acción' },
  message: { type: String, required: true },
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="overlay" @click.self="emit('cancel')">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-icon">⚠</span>
        <h3>{{ title }}</h3>
      </div>
      <p>{{ message }}</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" @click="emit('cancel')">Cancelar</button>
        <button class="btn btn-danger" @click="emit('confirm')">Confirmar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  min-width: 320px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.modal-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.modal-icon { font-size: 1.2rem; }
h3 { font-size: 1rem; font-weight: 600; color: var(--text); }
p { color: var(--text2); font-size: 0.875rem; margin-bottom: 1.5rem; line-height: 1.5; }
.modal-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
.btn { padding: 0.45rem 1rem; border-radius: var(--radius); font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; }
.btn-ghost { background: transparent; border: 1px solid var(--border2); color: var(--text2); }
.btn-ghost:hover { border-color: var(--text2); color: var(--text); }
.btn-danger { background: var(--danger); color: #fff; }
.btn-danger:hover { background: #c73652; }
</style>
