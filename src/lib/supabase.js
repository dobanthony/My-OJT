import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://leypvanwfbuqoxcupfjy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxleXB2YW53ZmJ1cW94Y3VwZmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDU0NTIsImV4cCI6MjA5MDI4MTQ1Mn0.OrTVUOCvwPj7gWRNW-GLOzeSEloFyWQ-nK-4exyUDww'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)