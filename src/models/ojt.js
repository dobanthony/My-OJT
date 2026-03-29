import { supabase } from '../lib/supabase'

export const ojtModel = {
  async getEntries(userId, year = 2026) {
    const { data, error } = await supabase
      .from('ojt_time')
      .select('*')
      .eq('user_id', userId)
      .gte('month', 1)
      .lte('month', 5)
    if (error) throw error
    return data
  },

  async saveEntry(userId, month, day, fields) {
    const { am_in, am_out, pm_in, pm_out } = fields
    const { data, error } = await supabase
      .from('ojt_time')
      .upsert({
        user_id: userId,
        month,
        day,
        am_in,
        am_out,
        pm_in,
        pm_out,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id, month, day' })
    if (error) throw error
    return data
  },

  async getSettings(userId) {
    let { data, error } = await supabase
      .from('ojt_settings')
      .select('total_ojt_hours')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    if (!data) {
      // Create default settings
      const { data: newData, error: insertError } = await supabase
        .from('ojt_settings')
        .insert({ user_id: userId, total_ojt_hours: 0 })
        .select()
        .single()
      if (insertError) throw insertError
      return newData
    }
    return data
  },

  async updateSettings(userId, totalOjtHours) {
    // First try to update
    const { data, error } = await supabase
      .from('ojt_settings')
      .update({ total_ojt_hours: totalOjtHours })
      .eq('user_id', userId)
      .select()
      .single()
    if (error && error.code === 'PGRST116') { // No rows, insert
      const { data: newData, error: insertError } = await supabase
        .from('ojt_settings')
        .insert({ user_id: userId, total_ojt_hours: totalOjtHours })
        .select()
        .single()
      if (insertError) throw insertError
      return newData
    } else if (error) {
      throw error
    }
    return data
  }
}