<template>
  <div class="profile-container">
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <!-- Profile Card -->
          <div class="card border-0 shadow-sm rounded-4">
            <div class="card-header bg-white border-0 pt-4 pb-0 text-center">
              <div class="avatar-icon mb-3">
                <i class="bi bi-person-circle text-primary" style="font-size: 4rem;"></i>
              </div>
              <h4 class="text-primary mb-1">
                {{ profileExists ? 'Edit Profile' : 'Create Profile' }}
              </h4>
              <p class="text-muted small">Fill in your personal details</p>
            </div>
            <div class="card-body p-4 p-lg-5">
              <form @submit.prevent="saveProfile">
                <!-- Full Name -->
                <div class="mb-4">
                  <label class="form-label fw-semibold text-secondary">
                    <i class="bi bi-person me-1"></i> Full Name
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-person-fill text-primary"></i>
                    </span>
                    <input 
                      type="text" 
                      class="form-control border-start-0" 
                      v-model="form.full_name" 
                      placeholder="Juan Dela Cruz"
                      required 
                    />
                  </div>
                </div>

                <!-- Age -->
                <div class="mb-4">
                  <label class="form-label fw-semibold text-secondary">
                    <i class="bi bi-cake2 me-1"></i> Age
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-calendar-heart text-primary"></i>
                    </span>
                    <input 
                      type="number" 
                      class="form-control border-start-0" 
                      v-model="form.age" 
                      min="15" 
                      max="100" 
                      required 
                    />
                  </div>
                  <div class="form-text">Age must be between 15 and 100 years.</div>
                </div>

                <!-- Gender -->
                <div class="mb-4">
                  <label class="form-label fw-semibold text-secondary">
                    <i class="bi bi-gender-ambiguous me-1"></i> Gender
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-gender-male text-primary"></i>
                    </span>
                    <select class="form-select border-start-0" v-model="form.gender" required>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <!-- Address -->
                <div class="mb-4">
                  <label class="form-label fw-semibold text-secondary">
                    <i class="bi bi-house-door me-1"></i> Address
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-building text-primary"></i>
                    </span>
                    <textarea 
                      class="form-control border-start-0" 
                      v-model="form.address" 
                      rows="2" 
                      placeholder="Enter your full address"
                      required
                    ></textarea>
                  </div>
                </div>

                <!-- Contact Number -->
                <div class="mb-4">
                  <label class="form-label fw-semibold text-secondary">
                    <i class="bi bi-telephone me-1"></i> Contact Number
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-phone-fill text-primary"></i>
                    </span>
                    <input 
                      type="tel" 
                      class="form-control border-start-0" 
                      v-model="form.contact_number" 
                      @input="handleContactInput"
                      placeholder="09xxxxxxxxx"
                      required 
                    />
                  </div>
                  <div class="form-text">Must start with 09 and have exactly 11 digits (numbers only).</div>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit" 
                  class="btn btn-primary w-100 rounded-pill py-2 fw-semibold" 
                  :disabled="saving"
                >
                  <i v-if="!saving" class="bi bi-save me-2"></i>
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ saving ? 'Saving...' : 'Save Profile' }}
                </button>
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
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../store/auth'

const authStore = useAuthStore()
const saving = ref(false)

const form = ref({
  full_name: '',
  age: '',
  gender: '',
  address: '',
  contact_number: '',
})

const profileExists = computed(() => !!authStore.profile)

// Toast state
const toast = ref({
  show: false,
  type: 'success',
  message: '',
})

const showToast = (type, message) => {
  toast.value = {
    show: true,
    type,
    message,
  }
  setTimeout(() => {
    closeToast()
  }, 3000)
}

const closeToast = () => {
  toast.value.show = false
}

// Restrict contact number to digits only and enforce 09 prefix and 11 digits length
const handleContactInput = (event) => {
  let value = event.target.value
  // Remove all non-digit characters
  value = value.replace(/\D/g, '')
  // Limit to 11 digits
  if (value.length > 11) {
    value = value.slice(0, 11)
  }
  form.value.contact_number = value
}

// Validate contact number: must start with '09' and have exactly 11 digits
const validateContactNumber = (number) => {
  if (!number) return 'Contact number is required.'
  if (!/^09\d{9}$/.test(number)) {
    return 'Contact number must start with "09" and have exactly 11 digits.'
  }
  return null
}

// Validate age
const validateAge = () => {
  const age = parseInt(form.value.age)
  if (isNaN(age)) {
    return 'Age is required and must be a number.'
  }
  if (age < 15 || age > 100) {
    return 'Age must be between 15 and 100 years old.'
  }
  return null
}

onMounted(() => {
  if (authStore.profile) {
    form.value = { ...authStore.profile }
  }
})

const saveProfile = async () => {
  // Validate age
  const ageError = validateAge()
  if (ageError) {
    showToast('error', ageError)
    return
  }

  // Validate contact number
  const contactError = validateContactNumber(form.value.contact_number)
  if (contactError) {
    showToast('error', contactError)
    return
  }

  saving.value = true
  try {
    await authStore.updateProfile(form.value)
    showToast('success', 'Profile saved successfully!')
  } catch (err) {
    console.error(err)
    showToast('error', err.message || 'Failed to save profile')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 2rem;
}
.card {
  overflow: hidden;
}
.card-header {
  background: white;
}
.avatar-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e3f2fd;
  border-radius: 50%;
}
.input-group-text {
  border-right: none;
  background-color: #f8f9fa;
}
.form-control, .form-select {
  border-left: none;
}
.form-control:focus, .form-select:focus, .input-group-text:focus-within {
  border-color: #0d6efd;
  box-shadow: none;
}
.form-control:focus, .form-select:focus {
  border-left: none;
}
.btn-primary {
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13,110,253,0.3);
}
.btn-primary:active {
  transform: translateY(0);
}
@media (max-width: 576px) {
  .card-body {
    padding: 1.5rem !important;
  }
  .avatar-icon i {
    font-size: 3rem !important;
  }
  .avatar-icon {
    width: 60px;
    height: 60px;
  }
}
</style>