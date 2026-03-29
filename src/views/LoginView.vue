<template>
  <div class="login-wrapper">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-11 col-sm-8 col-md-6 col-lg-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-lg-5">
              <div class="text-center mb-4">
                <i class="bi bi-clock-history text-primary fs-1"></i>
                <h3 class="text-primary mt-2">OJT Tracking</h3>
                <p class="text-muted small">Login to continue</p>
              </div>
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label class="form-label small text-secondary">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    v-model="email" 
                    placeholder="student@example.com"
                    required 
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label small text-secondary">Password</label>
                  <div class="input-group">
                    <input 
                      :type="showPassword ? 'text' : 'password'" 
                      class="form-control" 
                      v-model="password" 
                      placeholder="••••••••"
                      required 
                    />
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button" 
                      @click="togglePassword"
                      style="background-color: white;"
                    >
                      <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                </div>
                <button 
                  type="submit" 
                  class="btn btn-primary w-100" 
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>
                <p class="mt-3 text-center small">
                  Don't have an account? 
                  <router-link to="/register" class="text-decoration-none">Register</router-link>
                </p>
              </form>
            </div>
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
        :class="toast.type === 'success' ? 'bg-success' : 'bg-danger'"
        style="color: white;"
      >
        <div class="toast-header" :class="toast.type === 'success' ? 'bg-success' : 'bg-danger'" style="color: white;">
          <strong class="me-auto">{{ toast.type === 'success' ? 'Success' : 'Error' }}</strong>
          <button type="button" class="btn-close btn-close-white" @click="closeToast"></button>
        </div>
        <div class="toast-body">{{ toast.message }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const authStore = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

const toast = ref({ show: false, type: 'success', message: '' })

const showToast = (type, message) => {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const closeToast = () => { toast.value.show = false }

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    showToast('success', 'Login successful! Redirecting...')
    setTimeout(() => {
      if (authStore.role === 'admin') router.push('/admin-dashboard')
      else router.push('/student-dashboard')
    }, 1000)
  } catch (error) {
    showToast('error', `Login failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  background-color: #f8f9fa;
  min-height: 100vh;
}
.card {
  border-radius: 0.75rem;
}
.btn-primary {
  background-color: #0d6efd;
  border: none;
  padding: 0.6rem;
}
.btn-primary:hover {
  background-color: #0b5ed7;
}
.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13,110,253,0.25);
}
.input-group .btn-outline-secondary {
  border-color: #ced4da;
  border-left: none;
}
.input-group .btn-outline-secondary:hover {
  background-color: #f8f9fa;
  border-color: #ced4da;
}
</style>