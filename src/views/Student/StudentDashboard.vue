<template>
  <div class="dashboard-container">
    <div class="container mt-4">
      <!-- Header with avatar icon -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 class="dashboard-title">
            <i class="bi bi-speedometer2 me-2 text-primary"></i>
            Student Dashboard
          </h1>
          <p class="text-muted mb-0">
            <i class="bi bi-person-circle me-1"></i>
            Welcome, {{ authStore.profile?.full_name || authStore.user?.email }}!
          </p>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm rounded-3 summary-card">
            <div class="card-body d-flex align-items-center">
              <div class="flex-shrink-0 me-3">
                <i class="bi bi-clock-history fs-1 text-primary"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-1 text-muted">Total Required</h6>
                <h3 class="card-text mb-0 fw-bold">{{ formatHours(totalRequiredHours) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm rounded-3 summary-card">
            <div class="card-body d-flex align-items-center">
              <div class="flex-shrink-0 me-3">
                <i class="bi bi-check-circle-fill fs-1 text-success"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-1 text-muted">Total Worked</h6>
                <h3 class="card-text mb-0 fw-bold">{{ formatHours(totalWorkedHours) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm rounded-3 summary-card">
            <div class="card-body d-flex align-items-center">
              <div class="flex-shrink-0 me-3">
                <i class="bi bi-hourglass-split fs-1 text-warning"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-1 text-muted">Remaining</h6>
                <h3 class="card-text mb-0 fw-bold">{{ formatHours(remainingHours) }}</h3>
                <small class="text-muted">Base: 8 hrs/day</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bar Chart Card -->
      <div class="card border-0 shadow-sm rounded-3 mb-4">
        <div class="card-header bg-white border-0 pt-4 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 class="mb-0 fw-semibold">
            <i class="bi bi-bar-chart-steps me-2 text-primary"></i>
            OJT Hours Completed
          </h5>
          <div class="btn-group btn-group-sm" role="group">
            <button 
              type="button" 
              class="btn" 
              :class="groupBy === 'day' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="groupBy = 'day'"
            >
              Day
            </button>
            <button 
              type="button" 
              class="btn" 
              :class="groupBy === 'week' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="groupBy = 'week'"
            >
              Week
            </button>
            <button 
              type="button" 
              class="btn" 
              :class="groupBy === 'month' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="groupBy = 'month'"
            >
              Month
            </button>
          </div>
        </div>
        <div class="card-body p-4">
          <div v-if="loadingChart" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="aggregatedData.length === 0" class="text-center text-muted py-4">
            <i class="bi bi-inbox fs-1"></i>
            <p class="mt-2">No OJT hours recorded yet.</p>
          </div>
          <div v-else>
            <div class="bar-chart-wrapper" :class="{ 'scrollable': groupBy === 'day' || groupBy === 'week' }">
              <Bar :data="chartData" :options="chartOptions" :key="chartKey" />
            </div>
            <div class="mt-3 text-end">
              <strong>Total: {{ formatHours(totalHours) }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Pie Chart Card -->
      <div class="card border-0 shadow-sm rounded-3" v-if="hasPieData">
        <div class="card-header bg-white border-0 pt-4 px-4">
          <h5 class="mb-0 fw-semibold">
            <i class="bi bi-pie-chart me-2 text-primary"></i>
            Monthly Distribution
          </h5>
        </div>
        <div class="card-body p-4">
          <div class="pie-chart-wrapper">
            <Pie :data="pieChartData" :options="pieChartOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../store/auth'
import { ojtModel } from '../../models/ojt'
import { Bar, Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PieController } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PieController)

const authStore = useAuthStore()
const loadingChart = ref(true)
const loadingSettings = ref(true)
const rawEntries = ref([])
const groupBy = ref('month')
const chartKey = ref(0)

// Settings
const totalRequiredHours = ref(0)

// Month definitions
const monthsList = [
  { name: 'Jan', monthNumber: 1, color: '#3b82f6' },
  { name: 'Feb', monthNumber: 2, color: '#10b981' },
  { name: 'Mar', monthNumber: 3, color: '#ef4444' },
  { name: 'Apr', monthNumber: 4, color: '#f59e0b' },
  { name: 'May', monthNumber: 5, color: '#f97316' }
]

// Helper: format decimal hours to "X hr Y min"
const formatHours = (decimalHours) => {
  const totalMinutes = Math.round(decimalHours * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0 && minutes === 0) return '0 hr'
  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} hr`
  return `${hours} hr ${minutes} min`
}

// Helper: compute hours from time strings
const computeHours = (am_in, am_out, pm_in, pm_out) => {
  const getMinutes = (time) => {
    if (!time) return 0
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }
  const amStart = getMinutes(am_in)
  const amEnd = getMinutes(am_out)
  const pmStart = getMinutes(pm_in)
  const pmEnd = getMinutes(pm_out)
  let total = 0
  if (amStart && amEnd && amEnd > amStart) total += (amEnd - amStart) / 60
  if (pmStart && pmEnd && pmEnd > pmStart) total += (pmEnd - pmStart) / 60
  return total
}

// Total worked hours across all entries
const totalWorkedHours = computed(() => {
  let total = 0
  for (const entry of rawEntries.value) {
    total += computeHours(entry.am_in, entry.am_out, entry.pm_in, entry.pm_out)
  }
  return total
})

const remainingHours = computed(() => Math.max(0, totalRequiredHours.value - totalWorkedHours.value))

// Week number for 2026
const getWeekNumber = (month, day) => {
  const date = new Date(2026, month - 1, day)
  const startOfYear = new Date(2026, 0, 1)
  const dayOfYear = Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24))
  return Math.floor(dayOfYear / 7) + 1
}

// Aggregated data for bar chart
const aggregatedData = computed(() => {
  if (!rawEntries.value.length) return []

  if (groupBy.value === 'day') {
    const dayMap = new Map()
    for (const entry of rawEntries.value) {
      const { month, day } = entry
      const hours = computeHours(entry.am_in, entry.am_out, entry.pm_in, entry.pm_out)
      if (hours === 0) continue
      const date = new Date(2026, month - 1, day)
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const key = `${month}-${day}`
      dayMap.set(key, { label, hours: (dayMap.get(key)?.hours || 0) + hours })
    }
    const daysArray = Array.from(dayMap.values())
    daysArray.sort((a, b) => {
      const aDate = new Date(2026, a.label.split(' ')[0], parseInt(a.label.split(' ')[1]))
      const bDate = new Date(2026, b.label.split(' ')[0], parseInt(b.label.split(' ')[1]))
      return aDate - bDate
    })
    return daysArray
  } 
  else if (groupBy.value === 'week') {
    const weekTotals = {}
    for (let i = 1; i <= 22; i++) weekTotals[i] = 0
    for (const entry of rawEntries.value) {
      const week = getWeekNumber(entry.month, entry.day)
      const hours = computeHours(entry.am_in, entry.am_out, entry.pm_in, entry.pm_out)
      if (hours > 0) weekTotals[week] += hours
    }
    const weeksWithData = []
    for (let i = 1; i <= 22; i++) {
      if (weekTotals[i] > 0) weeksWithData.push({ label: `Week ${i}`, hours: weekTotals[i] })
    }
    return weeksWithData
  } 
  else { // month
    const monthTotals = {}
    monthsList.forEach(m => { monthTotals[m.monthNumber] = 0 })
    for (const entry of rawEntries.value) {
      const month = entry.month
      const hours = computeHours(entry.am_in, entry.am_out, entry.pm_in, entry.pm_out)
      if (hours > 0) monthTotals[month] += hours
    }
    return monthsList.map(month => ({
      label: month.name,
      hours: monthTotals[month.monthNumber]
    }))
  }
})

const totalHours = computed(() => aggregatedData.value.reduce((sum, item) => sum + item.hours, 0))

// Monthly totals for pie chart
const monthlyTotalsForPie = computed(() => {
  if (!rawEntries.value.length) return []
  const totals = {}
  monthsList.forEach(m => { totals[m.name] = 0 })
  for (const entry of rawEntries.value) {
    const monthNum = entry.month
    const monthObj = monthsList.find(m => m.monthNumber === monthNum)
    if (monthObj) {
      const hours = computeHours(entry.am_in, entry.am_out, entry.pm_in, entry.pm_out)
      totals[monthObj.name] += hours
    }
  }
  return monthsList.map(m => ({ label: m.name, hours: totals[m.name], color: m.color }))
})

const hasPieData = computed(() => monthlyTotalsForPie.value.some(m => m.hours > 0))

const pieChartData = computed(() => ({
  labels: monthlyTotalsForPie.value.map(item => item.label),
  datasets: [{
    data: monthlyTotalsForPie.value.map(item => item.hours),
    backgroundColor: monthlyTotalsForPie.value.map(item => item.color),
    borderWidth: 0
  }]
}))

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || ''
          const value = context.raw
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
          return `${label}: ${formatHours(value)} (${percentage}%)`
        }
      }
    },
    legend: { position: 'top' }
  }
}

const chartData = computed(() => {
  let backgroundColor
  if (groupBy.value === 'month') {
    backgroundColor = monthsList.map(m => m.color)
  } else {
    backgroundColor = '#4c9aff'
  }
  return {
    labels: aggregatedData.value.map(item => item.label),
    datasets: [{
      label: 'Hours',
      data: aggregatedData.value.map(item => item.hours),
      backgroundColor,
      borderRadius: 6,
      barPercentage: 0.7,
      categoryPercentage: 0.8,
    }]
  }
})

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
      title: { display: true, text: groupBy.value === 'month' ? 'Month' : (groupBy.value === 'week' ? 'Week' : 'Day') },
      ticks: {
        autoSkip: true,
        maxRotation: 45,
        minRotation: 0,
      }
    }
  }
}

// Fetch entries
const fetchEntries = async () => {
  if (!authStore.user) return
  loadingChart.value = true
  try {
    const entries = await ojtModel.getEntries(authStore.user.id, 2026)
    rawEntries.value = entries
  } catch (err) {
    console.error('Failed to load OJT entries:', err)
  } finally {
    loadingChart.value = false
  }
}

// Fetch settings
const fetchSettings = async () => {
  if (!authStore.user) return
  loadingSettings.value = true
  try {
    const settings = await ojtModel.getSettings(authStore.user.id)
    totalRequiredHours.value = settings.total_ojt_hours
  } catch (err) {
    console.error('Failed to load settings:', err)
  } finally {
    loadingSettings.value = false
  }
}

watch(groupBy, () => { chartKey.value++ })

onMounted(() => {
  fetchEntries()
  fetchSettings()
})
</script>

<style scoped>
.dashboard-container {
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
.bar-chart-wrapper.scrollable canvas {
  min-width: 800px;
}
.pie-chart-wrapper {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}
@media (max-width: 576px) {
  .dashboard-title {
    font-size: 1.5rem;
  }
  .summary-card h3 {
    font-size: 1.25rem;
  }
  .summary-card .fs-1 {
    font-size: 2rem !important;
  }
}
</style>