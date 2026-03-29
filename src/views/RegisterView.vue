<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">Register</div>
          <div class="card-body">
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" v-model="email" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" v-model="password" required />
              </div>
              <button type="submit" class="btn btn-success" :disabled="loading">
                {{ loading ? 'Registering...' : 'Register' }}
              </button>
              <p class="mt-3">
                Already have an account? <router-link to="/login">Login</router-link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div 
        v-if="toast.show" 
        class="toast show" 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
        :class="toast.type === 'success' ? 'bg-success' : 'bg-danger'"
        style="color: white;"
      >
        <div class="toast-header" :class="toast.type === 'success' ? 'bg-success' : 'bg-danger'" style="color: white;">
          <strong class="me-auto">{{ toast.type === 'success' ? 'Success' : 'Error' }}</strong>
          <button type="button" class="btn-close btn-close-white" @click="closeToast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { supabase } from '../lib/supabase'

const authStore = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

// Toast state
const toast = ref({
  show: false,
  type: 'success',
  message: '',
})

// Function to show toast
const showToast = (type, message) => {
  toast.value = {
    show: true,
    type,
    message,
  }
  // Auto-hide after 3 seconds
  setTimeout(() => {
    closeToast()
  }, 3000)
}

const closeToast = () => {
  toast.value.show = false
}

const handleRegister = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (error) throw error

    // Check if the user is automatically logged in
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session) {
      // User is logged in, refresh store and redirect
      await authStore.init()
      showToast('success', 'Registration successful! Redirecting...')
      // Redirect after a short delay to allow toast to be seen
      setTimeout(() => {
        if (authStore.role === 'admin') router.push('/admin-dashboard')
        else router.push('/student-dashboard')
      }, 1000)
    } else {
      // Email confirmation required
      showToast('success', 'Registration successful! Please check your email to confirm your account before logging in.')
    }
  } catch (error) {
    console.error('Registration error:', error)
    showToast('error', `Registration failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.toast-container {
  z-index: 1050;
}
</style>