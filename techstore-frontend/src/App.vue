<script setup>
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'

const route = useRoute()
</script>

<template>
  <Navbar v-if="!route.meta.public" />
  <main :class="{ 'page-content': !route.meta.public }">
    <RouterView />
  </main>
</template>

<style scoped>
.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
}
</style>
