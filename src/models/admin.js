import { supabase } from '../lib/supabase'

export const adminModel = {
  // Fetch all users with profiles, OJT totals, and settings
  async getAllUsers() {
    // 1. Get all profiles (id, email, role)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role')
    if (profilesError) throw profilesError

    // 2. Get user_profiles (full_name, age, gender, address, contact_number)
    const { data: userProfiles, error: upError } = await supabase
      .from('user_profiles')
      .select('*')
    if (upError) console.error('User profiles fetch error:', upError)

    // 3. Get OJT entries for all users
    const { data: ojtEntries, error: ojtError } = await supabase
      .from('ojt_time')
      .select('user_id, am_in, am_out, pm_in, pm_out')
    if (ojtError) console.error('OJT entries fetch error:', ojtError)

    // 4. Get OJT settings for all users (total required hours)
    const { data: ojtSettings, error: settingsError } = await supabase
      .from('ojt_settings')
      .select('user_id, total_ojt_hours')
    if (settingsError) console.error('OJT settings fetch error:', settingsError)

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

    // Aggregate total worked hours per user
    const workedMap = new Map()
    if (ojtEntries) {
      for (const entry of ojtEntries) {
        const hours = computeHours(entry.am_in, entry.am_out, entry.pm_in, entry.pm_out)
        const current = workedMap.get(entry.user_id) || 0
        workedMap.set(entry.user_id, current + hours)
      }
    }

    // Map total required hours per user
    const requiredMap = new Map()
    if (ojtSettings) {
      for (const setting of ojtSettings) {
        requiredMap.set(setting.user_id, setting.total_ojt_hours)
      }
    }

    // Combine all data
    const result = profiles.map(profile => {
      const userProfile = userProfiles ? userProfiles.find(up => up.id === profile.id) : null
      const totalWorked = workedMap.get(profile.id) || 0
      const totalRequired = requiredMap.get(profile.id) || 0
      const remainingHours = Math.max(0, totalRequired - totalWorked)
      const remainingDays = remainingHours / 8

      return {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        full_name: userProfile?.full_name || profile.email,
        age: userProfile?.age || null,
        gender: userProfile?.gender || null,
        address: userProfile?.address || null,
        contact_number: userProfile?.contact_number || null,
        total_worked: totalWorked,
        total_required: totalRequired,
        remaining_hours: remainingHours,
        remaining_days: remainingDays
      }
    })
    return result
  }
}