// This file initializes the Supabase client.

const SUPABASE_URL = 'https://stnlinhnctynzmjgqgbw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0bmxpbmhuY3R5bnptamdxZ2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODM4MDAsImV4cCI6MjA3Mjg1OTgwMH0.-02gFdc3QKaCw7O4CMrJbOM3bm-PJvpT-qqx3h3cR3U';

// The global `supabase` object is available from the CDN script in index.html
// We assign it to a new constant to avoid shadowing the global variable.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to set the auth token for the Supabase client
export function setSupabaseAuth(token) {
    if (token) {
        supabaseClient.auth.setSession({ access_token: token });
        console.log("Supabase auth token set.");
    } else {
        supabaseClient.auth.signOut();
        console.log("Supabase session cleared.");
    }
}

// Export the initialized client with a clear name
export { supabaseClient };
