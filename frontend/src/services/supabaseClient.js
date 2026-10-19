import { createClient } from '@supabase/supabase-js';

// Supabase Cloud Configuration
// When running locally without env, defaults to offline/mock hybrid mode
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Checks connection to remote Supabase project
 */
export async function testSupabaseConnection() {
  if (!supabase) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in environment variables. Using FastAPI backend with local database.',
      url: SUPABASE_URL || 'Not Set',
    };
  }

  try {
    const { count, error } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return {
      connected: true,
      message: 'Successfully connected to remote Supabase PostgreSQL database.',
      url: SUPABASE_URL,
      recordCount: count || 0,
    };
  } catch (err) {
    return {
      connected: false,
      message: `Supabase connection failed: ${err.message}`,
      url: SUPABASE_URL,
    };
  }
}

/**
 * Helper to subscribe to realtime changes on a table
 */
export function subscribeToTable(tableName, callback) {
  if (!supabase) return null;

  const channel = supabase
    .channel(`public:${tableName}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
      console.log(`[Supabase Realtime] Change in ${tableName}:`, payload);
      callback(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
