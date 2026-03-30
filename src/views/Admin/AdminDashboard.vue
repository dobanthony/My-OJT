<template>
  <div class="admin-dashboard-container">
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 class="dashboard-title">
            <i class="bi bi-speedometer2 me-2 text-primary"></i>
            Admin Dashboard
          </h1>
          <p class="text-muted mb-0">
            <i class="bi bi-person-badge me-1"></i>
            Welcome, {{ authStore.profile?.full_name || authStore.user?.email }}!
          </p>
        </div>
        <!-- Logout button removed -->
      </div>

      <!-- Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm rounded-3 summary-card">
            <div class="card-body d-flex align-items-center">
              <div class="flex-shrink-0 me-3">
                <i class="bi bi-people-fill fs-1 text-primary"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-1 text-muted">Total Users</h6>
                <h3 class="card-text mb-0 fw-bold">{{ totalUsers }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm rounded-3 summary-card">
            <div class="card-body d-flex align-items-center">
              <div class="flex-shrink-0 me-3">
                <i class="bi bi-clock-history fs-1 text-success"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-1 text-muted">Total OJT Hours (All)</h6>
                <h3 class="card-text mb-0 fw-bold">{{ formatHours(totalHoursAll) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm rounded-3 summary-card">
            <div class="card-body d-flex align-items-center">
              <div class="flex-shrink-0 me-3">
                <i class="bi bi-trophy fs-1 text-warning"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-1 text-muted">Top Performer</h6>
                <h3 class="card-text mb-0 fw-bold" style="font-size: 1.1rem;">{{ topPerformer?.full_name || '—' }}</h3>
                <small class="text-muted">{{ topPerformer ? formatHours(topPerformer.total_worked) : '' }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bar Chart Card -->
      <div class="card border-0 shadow-sm rounded-3 mb-4">
        <div class="card-header bg-white border-0 pt-4 px-4">
          <h5 class="mb-0 fw-semibold">
            <i class="bi bi-bar-chart-steps me-2 text-primary"></i>
            Total OJT Hours per User
          </h5>
        </div>
        <div class="card-body p-4">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="usersData.length === 0" class="text-center text-muted py-4">
            <i class="bi bi-inbox fs-1"></i>
            <p class="mt-2">No data available.</p>
          </div>
          <div v-else>
            <div class="bar-chart-wrapper">
              <Bar :data="chartData" :options="chartOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card border-0 shadow-sm rounded-3">
        <div class="card-header bg-white border-0 pt-4 px-4">
          <h5 class="mb-0 fw-semibold">
            <i class="bi bi-table me-2 text-primary"></i>
            All Users – OJT Hours
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Total Worked Hours</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in usersData" :key="user.id">
                  <td>{{ user.full_name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="user.role === 'admin' ? 'badge bg-danger' : 'badge bg-info'">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>{{ formatHours(user.total_worked) }}</td>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { adminModel } from '../../models/admin'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(true)
const usersData = ref([])

const formatHours = (decimalHours) => {
  const totalMinutes = Math.round(decimalHours * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0 && minutes === 0) return '0 hr'
  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} hr`
  return `${hours} hr ${minutes} min`
}

const totalUsers = computed(() => usersData.value.length)
const totalHoursAll = computed(() => usersData.value.reduce((sum, u) => sum + (u.total_worked || 0), 0))
const topPerformer = computed(() => {
  if (!usersData.value.length) return null
  return [...usersData.value].sort((a, b) => (b.total_worked || 0) - (a.total_worked || 0))[0]
})

const chartData = computed(() => ({
  labels: usersData.value.map(u => u.full_name.length > 15 ? u.full_name.slice(0, 12) + '...' : u.full_name),
  datasets: [{
    label: 'Total Hours',
    data: usersData.value.map(u => u.total_worked || 0),
    backgroundColor: '#4c9aff',
    borderRadius: 6,
    barPercentage: 0.7,
    categoryPercentage: 0.8,
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          let label = context.dataset.label || ''
          if (label) label += ': '
          label += formatHours(context.raw)
          return label
        }
      }
    },
    legend: { position: 'top' },
  },
  scales: {
    y: {
      title: { display: true, text: 'Hours' },
      ticks: { callback: (value) => formatHours(value) }
    },
    x: {
      title: { display: true, text: 'Users' },
      ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 }
    }
  }
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const data = await adminModel.getAllUsers()
    usersData.value = data.map(u => ({ ...u, total_worked: u.total_worked || 0 }))
  } catch (err) {
    console.error('Failed to load users:', err)
    alert('Failed to load users data')
  } finally {
    loading.value = false
  }
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.admin-dashboard-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 2rem;
}
.dashboard-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e293b;
}
.summary-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}
.bar-chart-wrapper {
  width: 100%;
  overflow-x: auto;
}
.bar-chart-wrapper canvas {
  min-width: 100%;
  height: auto;
}
/* Responsive adjustments for cards */
@media (max-width: 576px) {
  .dashboard-title {
    font-size: 1.5rem;
  }
  .summary-card .card-body {
    flex-direction: column;
    text-align: center;
  }
  .summary-card .flex-shrink-0 {
    margin-right: 0 !important;
    margin-bottom: 0.5rem;
  }
  .summary-card h3 {
    font-size: 1.25rem;
  }
  .summary-card .fs-1 {
    font-size: 2rem !important;
  }
  .summary-card .card-subtitle {
    font-size: 0.85rem;
  }
  .summary-card .card-text {
    font-size: 1rem;
    word-break: break-word;
  }
}
@media (max-width: 768px) {
  .summary-card h3 {
    font-size: 1.25rem;
  }
}
</style>