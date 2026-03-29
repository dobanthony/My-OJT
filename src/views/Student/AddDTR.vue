<template>
  <div class="container-fluid mt-4" v-if="!loading">
    <!-- Header stats -->
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5>Total Worked Hours</h5>
            <h3>{{ formatHours(totalWorkedHours) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5>Remaining Hours</h5>
            <h3>{{ formatHours(remainingHours) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5>Total OJT Hours Required</h5>
            <input type="number" v-model.number="totalRequiredHours" class="form-control" @change="updateSettings" />
          </div>
        </div>
      </div>
    </div>

    <!-- Months -->
    <div v-for="month in months" :key="month.monthNumber" class="mb-5">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h3>{{ month.name }}</h3>
        <h5>Month Total: {{ formatHours(month.totalHours) }}</h5>
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
              <td v-for="day in week" :key="day.date" :class="{'bg-light': day.isWeekend, 'table-secondary': !day.isCurrentMonth}">
                <div v-if="day.isCurrentMonth">
                  <div class="day-number">{{ day.day }}</div>
                  <div class="time-inputs">
                    <div class="mb-1">
                      <label class="small">AM In</label>
                      <input type="time" class="form-control form-control-sm" v-model="dayEntries[day.key].am_in" @change="updateDay(day)" />
                    </div>
                    <div class="mb-1">
                      <label class="small">AM Out</label>
                      <input type="time" class="form-control form-control-sm" v-model="dayEntries[day.key].am_out" @change="updateDay(day)" />
                    </div>
                    <div class="mb-1">
                      <label class="small">PM In</label>
                      <input type="time" class="form-control form-control-sm" v-model="dayEntries[day.key].pm_in" @change="updateDay(day)" />
                    </div>
                    <div class="mb-1">
                      <label class="small">PM Out</label>
                      <input type="time" class="form-control form-control-sm" v-model="dayEntries[day.key].pm_out" @change="updateDay(day)" />
                    </div>
                    <div class="daily-total small fw-bold">Total: {{ formatHours(parseFloat(dayTotalHours[day.key] || 0)) }}</div>
                    <button class="btn btn-sm btn-danger mt-1" @click="resetDay(day)">Reset</button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-3 text-center">
      <button class="btn btn-primary" @click="saveAllEntries" :disabled="saving">Save All Changes</button>
    </div>
  </div>
  <div v-else class="text-center mt-5">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

    <div>
    <div class="mt-4"></div>
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
  let currentMonth = startDate.getMonth()
  let currentYear = startDate.getFullYear()
  let monthStart = new Date(currentYear, currentMonth, 1)
  let monthEnd = new Date(currentYear, currentMonth, 1)
  monthEnd.setMonth(monthEnd.getMonth() + 1)
  monthEnd.setDate(monthEnd.getDate() - 1)

  // We'll generate weeks for each month from Jan to May 2026
  for (let m = 0; m < 5; m++) {
    const monthNumber = m + 1
    const monthName = new Date(2026, m, 1).toLocaleString('default', { month: 'long' })
    const weeks = []
    let current = new Date(2026, m, 1)
    // adjust to previous Sunday
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
        // Initialize entry for every day (even if not in current month)
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
.calendar-wrapper {
  overflow-x: auto;
}
.calendar-table {
  min-width: 800px;
  width: 100%;
  table-layout: fixed;
}
.calendar-table td, .calendar-table th {
  vertical-align: top;
  width: 14.28%;
}
.day-number {
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.time-inputs input {
  margin-bottom: 0.25rem;
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
</style>