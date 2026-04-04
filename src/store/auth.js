import { defineStore } from 'pinia'
import { authModel } from '../models/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: true,
  }),
  actions: {
    async init() {
      this.loading = true
      try {
        this.user = await authModel.getCurrentUser()
      } catch (error) {
        console.error('Init error', error)
      } finally {
        this.loading = false
      }
    },
    async register(email, password) {
      const user = await authModel.register(email, password)
      this.user = user
      return user
    },
    async login(email, password) {
      const user = await authModel.login(email, password)
      this.user = await authModel.getCurrentUser() // refresh with role
      return user
    },
    async logout() {
      await authModel.logout()
      this.user = null
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    role: (state) => state.user?.role || null,
    displayName: (state) => state.user?.email,
  },
})