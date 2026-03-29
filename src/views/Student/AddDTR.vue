<template>
  <div class="dtr-container" v-if="!loading">
    <div class="container mt-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h1 class="dtr-title">
          <i class="bi bi-calendar-check me-2 text-primary"></i>
          OJT Time Tracker
        </h1>
      </div>

      <!-- Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm rounded-3 summary-card">
            <div class="card-body d-flex align-items-center">
              <div class="flex-shrink-0 me-3">
                <i class="bi bi-stopwatch fs-1 text-primary"></i>
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
                <i class="bi bi-hourglass-top fs-1 text-warning"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-1 text-muted">Remaining</h6>
                <h3 class="card-text mb-0 fw-bold">{{ formatHours(remainingHours) }}</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm rounded-3 summary-card">
            <div class="card-body d-flex align-items-center">
              <div class="flex-shrink-0 me-3">
                <i class="bi bi-trophy fs-1 text-success"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-1 text-muted">Required Total</h6>
                <input 
                  type="number" 
                  class="form-control form-control-lg fw-bold" 
                  v-model.number="totalRequiredHours" 
                  @change="updateSettings"
                  style="font-size: 1.5rem; padding: 0.25rem 0.5rem; width: auto;"
                />
                <small class="text-muted">hours</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Months -->
      <div v-for="month in months" :key="month.monthNumber" class="mb-5">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <h3 class="month-title">
            <i class="bi bi-calendar3 me-2 text-primary"></i>
            {{ month.name }}
          </h3>
          <h5 class="month-total">
            <i class="bi bi-hourglass-split me-1 text-muted"></i>
            Total: {{ formatHours(month.totalHours) }}
          </h5>
        </div>
        <div class="calendar-wrapper">
          <table class="table table-bordered calendar-table">
            <thead>
              <tr>
                <th>Sun</th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>
                <th>Sat</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="week in month.weeks" :key="week[0].date">
                <td v-for="day in week" :key="day.date" 
                    :class="{'bg-light': day.isWeekend, 'table-secondary': !day.isCurrentMonth}">
                  <div v-if="day.isCurrentMonth" class="day-cell">
                    <div class="day-number">{{ day.day }}</div>
                    <div class="time-inputs">
                      <div class="mb-2">
                        <label class="small text-muted">
                          <i class="bi bi-sun me-1"></i>AM In
                        </label>
                        <input type="time" class="form-control form-control-sm" v-model="dayEntries[day.key].am_in" @change="updateDay(day)" />
                      </div>
                      <div class="mb-2">
                        <label class="small text-muted">
                          <i class="bi bi-sun-fill me-1"></i>AM Out
                        </label>
                        <input type="time" class="form-control form-control-sm" v-model="dayEntries[day.key].am_out" @change="updateDay(day)" />
                      </div>
                      <div class="mb-2">
                        <label class="small text-muted">
                          <i class="bi bi-moon me-1"></i>PM In
                        </label>
                        <input type="time" class="form-control form-control-sm" v-model="dayEntries[day.key].pm_in" @change="updateDay(day)" />
                      </div>
                      <div class="mb-2">
                        <label class="small text-muted">
                          <i class="bi bi-moon-fill me-1"></i>PM Out
                        </label>
                        <input type="time" class="form-control form-control-sm" v-model="dayEntries[day.key].pm_out" @change="updateDay(day)" />
                      </div>
                      <div class="daily-total small fw-bold text-primary">
                        <i class="bi bi-hourglass me-1"></i>Total: {{ formatHours(parseFloat(dayTotalHours[day.key] || 0)) }}
                      </div>
                      <button class="btn btn-sm btn-outline-danger w-100 mt-2" @click="resetDay(day)">
                        <i class="bi bi-arrow-repeat me-1"></i> Reset
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Save All Button -->
      <div class="text-center mt-4">
        <button class="btn btn-primary btn-lg px-5 rounded-pill" @click="saveAllEntries" :disabled="saving">
          <i v-if="!saving" class="bi bi-save me-2"></i>
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ saving ? 'Saving...' : 'Save All Changes' }}
        </button>
      </div>
    </div>
  </div>
  <div v-else class="d-flex justify-content-center align-items-center min-vh-100">
    <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../store/auth'
import { ojtModel } from '../../models/ojt'

const authStore = useAuthStore()
const saving = ref(false)
const loading = ref(true)

const startDate = new Date(2026, 0, 1)
const endDate = new Date(2026, 4, 31)
const months = ref([])

// Store entries by day key "month-day"
const dayEntries = ref({})
const dayTotalHours = ref({})

// Settings
const totalRequiredHours = ref(0)
const totalWorkedHours = ref(0)

const remainingHours = computed(() => Math.max(0, totalRequiredHours.value - totalWorkedHours.value))

// Convert decimal hours to "X hr Y min" format
const formatHours = (decimalHours) => {
  const totalMinutes = Math.round(decimalHours * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0 && minutes === 0) return '0 hr'
  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} hr`
  return `${hours} hr ${minutes} min`
}

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

const updateDailyTotal = (dayKey) => {
  const entry = dayEntries.value[dayKey]
  if (!entry) return
  const total = computeHours(entry.am_in, entry.am_out, entry.pm_in, entry.pm_out)
  dayTotalHours.value[dayKey] = total.toFixed(2)
  recalcTotalWorked()
  recalcMonthTotals()
}

const recalcTotalWorked = () => {
  let total = 0
  for (const key in dayTotalHours.value) {
    total += parseFloat(dayTotalHours.value[key] || 0)
  }
  totalWorkedHours.value = total
}

const recalcMonthTotals = () => {
  for (const month of months.value) {
    let total = 0
    for (const week of month.weeks) {
      for (const day of week) {
        if (day.isCurrentMonth) {
          total += parseFloat(dayTotalHours.value[day.key] || 0)
        }
      }
    }
    month.totalHours = total
  }
}

const buildCalendar = () => {
  const monthsData = []
  for (let m = 0; m < 5; m++) {
    const monthNumber = m + 1
    const monthName = new Date(2026, m, 1).toLocaleString('default', { month: 'long' })
    const weeks = []
    let current = new Date(2026, m, 1)
    current.setDate(current.getDate() - current.getDay())
    const monthEndDate = new Date(2026, m + 1, 0)
    while (current <= monthEndDate) {
      const week = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(current)
        const dayMonth = date.getMonth() + 1
        const dayNumber = date.getDate()
        const key = `${dayMonth}-${dayNumber}`
        const isCurrentMonth = date.getMonth() === m
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        week.push({
          date: date.toISOString(),
          month: dayMonth,
          day: dayNumber,
          key,
          isCurrentMonth,
          isWeekend,
        })
        if (!dayEntries.value[key]) {
          dayEntries.value[key] = { am_in: '', am_out: '', pm_in: '', pm_out: '' }
        }
        current.setDate(current.getDate() + 1)
      }
      weeks.push(week)
    }
    monthsData.push({
      name: monthName,
      monthNumber,
      weeks,
      totalHours: 0,
    })
  }
  months.value = monthsData
}

const fetchEntries = async () => {
  if (!authStore.user) return
  try {
    const entries = await ojtModel.getEntries(authStore.user.id, 2026)
    entries.forEach(entry => {
      const key = `${entry.month}-${entry.day}`
      if (dayEntries.value[key]) {
        dayEntries.value[key].am_in = entry.am_in || ''
        dayEntries.value[key].am_out = entry.am_out || ''
        dayEntries.value[key].pm_in = entry.pm_in || ''
        dayEntries.value[key].pm_out = entry.pm_out || ''
      }
      updateDailyTotal(key)
    })
  } catch (err) {
    console.error('Error fetching entries:', err)
  }
}

const updateDay = async (day) => {
  const entry = dayEntries.value[day.key]
  if (!entry) return
  updateDailyTotal(day.key)
  try {
    await ojtModel.saveEntry(authStore.user.id, day.month, day.day, entry)
  } catch (err) {
    console.error('Save failed:', err)
  }
}

const resetDay = (day) => {
  const entry = dayEntries.value[day.key]
  if (entry) {
    entry.am_in = ''
    entry.am_out = ''
    entry.pm_in = ''
    entry.pm_out = ''
    updateDailyTotal(day.key)
    updateDay(day)
  }
}

const saveAllEntries = async () => {
  saving.value = true
  try {
    const promises = []
    for (const month of months.value) {
      for (const week of month.weeks) {
        for (const day of week) {
          if (!day.isCurrentMonth) continue
          const entry = dayEntries.value[day.key]
          if (entry) {
            promises.push(ojtModel.saveEntry(authStore.user.id, day.month, day.day, entry))
          }
        }
      }
    }
    await Promise.all(promises)
    alert('All changes saved!')
  } catch (err) {
    console.error('Save all failed:', err)
    alert('Failed to save some entries')
  } finally {
    saving.value = false
  }
}

const loadSettings = async () => {
  if (!authStore.user) return
  try {
    const settings = await ojtModel.getSettings(authStore.user.id)
    totalRequiredHours.value = settings.total_ojt_hours
  } catch (err) {
    console.error('Error loading settings:', err)
  }
}

const updateSettings = async () => {
  if (!authStore.user) return
  try {
    await ojtModel.updateSettings(authStore.user.id, totalRequiredHours.value)
  } catch (err) {
    console.error('Failed to update settings:', err)
  }
}

onMounted(async () => {
  loading.value = true
  buildCalendar()
  await loadSettings()
  await fetchEntries()
  loading.value = false
})
</script>

<style scoped>
.dtr-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 3rem;
}
.dtr-title {
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
.month-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0d6efd;
}
.month-total {
  font-size: 1.2rem;
  color: #6c757d;
}
.calendar-wrapper {
  overflow-x: auto;
  border-radius: 0.5rem;
}
.calendar-table {
  min-width: 800px;
  width: 100%;
  background-color: white;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
.calendar-table td, .calendar-table th {
  vertical-align: top;
  width: 14.28%;
  padding: 0.75rem;
  border-color: #e9ecef;
}
.calendar-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}
.day-cell {
  min-height: 180px;
}
.day-number {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #0d6efd;
}
.time-inputs input {
  margin-bottom: 0.25rem;
  border-radius: 0.375rem;
}
.daily-total {
  margin-top: 0.5rem;
  font-weight: 500;
}
.bg-light {
  background-color: #f8f9fa;
}
.table-secondary {
  background-color: #e9ecef;
}
.btn-outline-danger {
  border-width: 1px;
}
.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}
@media (max-width: 576px) {
  .dtr-title {
    font-size: 1.5rem;
  }
  .month-title {
    font-size: 1.25rem;
  }
  .month-total {
    font-size: 1rem;
  }
  .summary-card h3 {
    font-size: 1.25rem;
  }
  .summary-card .fs-1 {
    font-size: 2rem !important;
  }
}
</style>