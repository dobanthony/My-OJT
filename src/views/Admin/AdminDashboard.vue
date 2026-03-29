<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h1>Admin Dashboard</h1>
      <button @click="logout" class="btn btn-danger">Logout</button>
    </div>
    <p>Welcome, {{ authStore.user?.email }}! You have admin privileges.</p>
    <div class="mt-4">
      <router-link to="/admin/create" class="btn btn-primary me-2">Create New Item</router-link>
      <router-link to="/admin/edit" class="btn btn-secondary">Edit Items</router-link>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>