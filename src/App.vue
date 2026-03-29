<template>
  <div id="app">
    <StudentNavBar v-if="authStore.isAuthenticated && authStore.role === 'student'" />
    <AdminNavBar v-if="authStore.isAuthenticated && authStore.role === 'admin'" />
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './store/auth'
import StudentNavBar from './components/StudentNavBar.vue'
import AdminNavBar from './components/AdminNavBar.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
})
</script>