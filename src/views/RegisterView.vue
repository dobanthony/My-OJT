<template>
  <div class="register-wrapper">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-11 col-sm-8 col-md-6 col-lg-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-lg-5">
              <div class="text-center mb-4">
                <i class="bi bi-clock-history text-primary fs-1"></i>
                <h3 class="text-primary mt-2">OJT Tracking</h3>
                <p class="text-muted small">Create your account</p>
              </div>
              <form @submit.prevent="handleRegister">
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
                  <input 
                    type="password" 
                    class="form-control" 
                    v-model="password" 
                    placeholder="••••••••"
                    required 
                  />
                  <div class="form-text small">At least 6 characters</div>
                </div>
                <button 
                  type="submit" 
                  class="btn btn-primary w-100" 
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? 'Registering...' : 'Register' }}
                </button>
                <p class="mt-3 text-center small">
                  Already have an account? 
                  <router-link to="/login" class="text-decoration-none">Login</router-link>
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
import { supabase } from '../lib/supabase'

const authStore = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

const toast = ref({ show: false, type: 'success', message: '' })

const showToast = (type, message) => {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const closeToast = () => { toast.value.show = false }

const handleRegister = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (error) throw error

    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session) {
      await authStore.init()
      showToast('success', 'Registration successful! Redirecting...')
      setTimeout(() => {
        if (authStore.role === 'admin') router.push('/admin-dashboard')
        else router.push('/student-dashboard')
      }, 1000)
    } else {
      showToast('success', 'Registration successful! Please check your email to confirm.')
    }
  } catch (error) {
    showToast('error', `Registration failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-wrapper {
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
</style>