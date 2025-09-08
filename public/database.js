import { supabase } from './supabase-config.js';

// --- Notes Functions ---

/**

Fetches all notes for the currently logged-in user.

@returns {Promise

try { const { data, error } = await supabase .from('notes') .select('*') .eq('user_id', user.id) .order('created_at', { ascending: false });

 if (error) throw error;
 return data;
} catch (error) { console.error('Error fetching notes:', error.message); return []; } }

/**
