<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container">
      <router-link class="navbar-brand fw-semibold text-primary" to="/">
        <i class="bi bi-clock-history me-2"></i>
        OJT Tracker (Admin)
      </router-link>

      <button 
        class="navbar-toggler border-0" 
        type="button" 
        @click="toggleNavbar"
        :aria-expanded="navbarOpen"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" :class="{ show: navbarOpen }">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/admin-dashboard" @click="closeNavbar">
              <i class="bi bi-speedometer2 me-1"></i> Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/admin/users" @click="closeNavbar">
              <i class="bi bi-people-fill me-1"></i> User Management
            </router-link>
          </li>
          <!-- User Dropdown (Vue-managed) -->
          <li class="nav-item dropdown" :class="{ show: dropdownOpen }">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              role="button"
              @click.prevent="toggleDropdown"
            >
              <i class="bi bi-person-badge me-1"></i>
              {{ authStore.profile?.full_name || authStore.user?.email }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0" :class="{ show: dropdownOpen }">
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const authStore = useAuthStore()
const router = useRouter()
const dropdownOpen = ref(false)
const navbarOpen = ref(false)

const toggleNavbar = () => {
  navbarOpen.value = !navbarOpen.value
}

const closeNavbar = () => {
  navbarOpen.value = false
}

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const handleClickOutside = (event) => {
  const dropdownElement = event.target.closest('.dropdown')
  if (!dropdownElement && dropdownOpen.value) {
    dropdownOpen.value = false
  }
  const navbarElement = event.target.closest('.navbar-collapse')
  if (!navbarElement && navbarOpen.value && !event.target.closest('.navbar-toggler')) {
    navbarOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
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
.router-link-active {
  color: #0d6efd !important;
}
.dropdown-menu {
  z-index: 1050;
}
.navbar-collapse {
  transition: all 0.3s ease;
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