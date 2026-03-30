import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/RegisterView.vue') },

  // Student routes
  {
    path: '/student-dashboard',
    name: 'StudentDashboard',
    component: () => import('../views/Student/StudentDashboard.vue'),
    meta: { requiresAuth: true, role: 'student' },
  },
  {
    path: '/student/dtr',
    name: 'StudentDTR',
    component: () => import('../views/Student/AddDTR.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/avatar',
    name: 'StudentAvatar',
    component: () => import('../views/Student/Avatar.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },

  // Admin routes
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/Admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
    {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/Admin/UserManagement.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth to be initialized
  if (authStore.loading) {
    await new Promise((resolve) => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.loading) {
          unwatch()
          resolve()
        }
      })
    })
  }

  // Redirect authenticated users away from login/register pages
  if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    if (authStore.role === 'admin') {
      next('/admin-dashboard')
    } else {
      next('/student-dashboard')
    }
    return
  }

  // Protected routes
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.role && authStore.role !== to.meta.role) {
    // Redirect to appropriate dashboard based on role
    if (authStore.role === 'admin') next('/admin-dashboard')
    else if (authStore.role === 'student') next('/student-dashboard')
    else next('/login')
  } else {
    next()
  }
})

export default router