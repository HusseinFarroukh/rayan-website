import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kssnedhqsfudxtstevmx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzc25lZGhxc2Z1ZHh0c3Rldm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NjE3NTUsImV4cCI6MjA3NjQzNzc1NX0.ur5cJGCHEiCd6xsElVcdwbFGOv8VulERISNTSC7FkS0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)