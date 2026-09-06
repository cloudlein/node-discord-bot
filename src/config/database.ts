import { createClient } from '@supabase/supabase-js'
import Config from './index.js'

export const supabaseClient = createClient(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY)

export const supabaseAdmin = createClient(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)


