import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Auth UI will not work until you configure them.')
}

export const supabase = createClient(
  SUPABASE_URL || 'https://<project>.supabase.co',
  SUPABASE_ANON_KEY || '<sb_publishable_or_anon_key>'
)


