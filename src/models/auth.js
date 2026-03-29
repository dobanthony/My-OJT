import { supabase } from '../lib/supabase'

export const authModel = {
  async register(email, password) {
    // 1. Create user in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    if (authError) throw authError

    // 2. Insert into profiles table (role defaults to 'student')
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email,
          role: 'student',
        },
      ])
    if (profileError) throw profileError

    return authData.user
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data.user
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Get user role from profiles – use maybeSingle() to avoid errors when no row exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile role:', error)
      return { ...user, role: 'student' }
    }

    return { ...user, role: profile?.role || 'student' }
  },

  // Get user's avatar/profile information
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  // Create or update user profile (avatar)
  async upsertUserProfile(userId, profileData) {
    const { full_name, age, gender, address, contact_number } = profileData
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        full_name,
        age: age ? parseInt(age) : null,
        gender,
        address,
        contact_number,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw error
    return data
  },
}