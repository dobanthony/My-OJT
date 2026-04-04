<template>
  <div id="app">
    <StudentNavBar 
      v-if="authStore.isAuthenticated && authStore.role === 'student' && !isAuthPage" 
    />
    <AdminNavBar 
      v-if="authStore.isAuthenticated && authStore.role === 'admin' && !isAuthPage" 
    />
    <router-view />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './store/auth'
import StudentNavBar from './components/StudentNavBar.vue'
import AdminNavBar from './components/AdminNavBar.vue'

const authStore = useAuthStore()
const route = useRoute()

// Check if current route is login or register
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})

onMounted(() => {
  authStore.init()
})
</script>