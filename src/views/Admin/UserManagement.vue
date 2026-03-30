<template>
  <div class="user-management-container">
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="page-title">
          <i class="bi bi-people-fill me-2 text-primary"></i>
          User Management
        </h1>
      </div>

      <!-- Users Table -->
      <div class="card border-0 shadow-sm rounded-3">
        <div class="card-body p-0">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="users.length === 0" class="text-center py-5 text-muted">
            <i class="bi bi-inbox fs-1"></i>
            <p class="mt-2">No users found.</p>
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Required Hours</th>
                  <th>Worked Hours</th>
                  <th>Remaining Hours</th>
                  <th>Remaining Days</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.full_name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="user.role === 'admin' ? 'badge bg-danger' : 'badge bg-info'">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>{{ formatHours(user.total_required) }}</td>
                  <td>{{ formatHours(user.total_worked) }}</td>
                  <td>{{ formatHours(user.remaining_hours) }}</td>
                  <td>{{ user.remaining_days.toFixed(1) }} day{{ user.remaining_days !== 1 ? 's' : '' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminModel } from '../../models/admin'

const users = ref([])
const loading = ref(true)

const formatHours = (decimalHours) => {
  const totalMinutes = Math.round(decimalHours * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0 && minutes === 0) return '0 hr'
  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} hr`
  return `${hours} hr ${minutes} min`
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const data = await adminModel.getAllUsers()
    users.value = data
  } catch (err) {
    console.error('Failed to load users:', err)
    alert('Failed to load users')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 2rem;
}
.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e293b;
}
.table th, .table td {
  vertical-align: middle;
}
</style>