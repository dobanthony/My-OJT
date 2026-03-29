<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h4>{{ profileExists ? 'Edit Profile' : 'Create Profile' }}</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveProfile">
              <div class="mb-3">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-control" v-model="form.full_name" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Age</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model="form.age" 
                  min="15" 
                  max="100" 
                  required 
                />
                <div class="form-text">Age must be between 15 and 100 years.</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Gender</label>
                <select class="form-select" v-model="form.gender" required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Address</label>
                <textarea class="form-control" v-model="form.address" rows="2" required></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Contact Number</label>
                <input 
                  type="tel" 
                  class="form-control" 
                  v-model="form.contact_number" 
                  @input="handleContactInput"
                  required 
                />
                <div class="form-text">Must start with 09 and have exactly 11 digits (numbers only).</div>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Profile' }}
              </button>
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
  
  <div>
    <div class="mt-4"></div>
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
.toast-container {
  z-index: 1050;
}
</style>