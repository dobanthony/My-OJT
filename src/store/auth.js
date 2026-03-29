import { defineStore } from 'pinia'
import { authModel } from '../models/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,      // user's avatar/profile data
    loading: true,
  }),
  actions: {
    async init() {
      this.loading = true
      try {
        this.user = await authModel.getCurrentUser()
        if (this.user) {
          this.profile = await authModel.getUserProfile(this.user.id)
        }
      } catch (error) {
        console.error('Init error', error)
      } finally {
        this.loading = false
      }
    },
    async register(email, password) {
      const user = await authModel.register(email, password)
      this.user = user
      this.profile = null   // no profile yet after registration
      return user
    },
    async login(email, password) {
      const user = await authModel.login(email, password)
      this.user = await authModel.getCurrentUser() // refresh with role
      // load profile after login
      if (this.user) {
        this.profile = await authModel.getUserProfile(this.user.id)
      }
      return user
    },
    async logout() {
      await authModel.logout()
      this.user = null
      this.profile = null
    },
    // Update the user's profile (avatar)
    async updateProfile(profileData) {
      if (!this.user) throw new Error('No authenticated user')
      const updated = await authModel.upsertUserProfile(this.user.id, profileData)
      this.profile = updated
      return updated
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    role: (state) => state.user?.role || null,
    // Returns full name if profile exists, otherwise email
    displayName: (state) => state.profile?.full_name || state.user?.email,
  },
})