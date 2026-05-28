import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://xztfborohjnbgdqhyhbg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dGZib3JvaGpuYmdkcWh5aGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODQ3MDYsImV4cCI6MjA5NTU2MDcwNn0.zhIVVkIfkaM3ZUcJ-6rorj_NGEOxBKAJ-jNQfEYAA5k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})