<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container">
      <!-- Brand with icon -->
      <router-link class="navbar-brand fw-semibold text-primary" to="/">
        <i class="bi bi-clock-history me-2"></i>
        OJT Tracker
      </router-link>

      <!-- Toggler for mobile -->
      <button 
        class="navbar-toggler border-0" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#studentNavbar" 
        aria-controls="studentNavbar" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Collapsible content -->
      <div class="collapse navbar-collapse" id="studentNavbar">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/student-dashboard">
              <i class="bi bi-speedometer2 me-1"></i> Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/student/dtr">
              <i class="bi bi-calendar-check me-1"></i> DTR
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/student/avatar">
              <i class="bi bi-person-circle me-1"></i> Profile
            </router-link>
          </li>
          <!-- User Dropdown -->
          <li class="nav-item dropdown">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              id="studentDropdown" 
              role="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <i class="bi bi-person-badge me-1"></i>
              {{ authStore.profile?.full_name || authStore.user?.email }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0" aria-labelledby="studentDropdown">
              <li>
                <button class="dropdown-item text-danger" @click="logout">
                  <i class="bi bi-box-arrow-right me-2"></i> Logout
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Minimalist styling */
.navbar {
  padding: 0.75rem 1rem;
}
.navbar-brand {
  font-size: 1.25rem;
}
.nav-link {
  color: #4a5568;
  font-weight: 500;
  transition: color 0.2s ease;
}
.nav-link:hover,
.nav-link.active {
  color: #0d6efd;
}
.dropdown-item {
  cursor: pointer;
}
.dropdown-item:hover {
  background-color: #f8f9fa;
}
.dropdown-item.text-danger:hover {
  background-color: #fee;
}
/* Active link highlight (optional if router-link-active class is used) */
.router-link-active {
  color: #0d6efd !important;
}
@media (max-width: 991.98px) {
  .navbar-nav {
    margin-top: 0.5rem;
  }
  .nav-item {
    padding: 0.25rem 0;
  }
  .dropdown-menu {
    background-color: white;
    border: none;
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  }
}
</style>