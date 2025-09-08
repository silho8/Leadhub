import { supabase } from './supabase-config.js';

// --- AUTH FUNCTIONS ---

/**

Signs up a new user and creates a corresponding profile.

Note: Supabase sends a confirmation email. The user must click the link in the email

to be fully registered.

@param {string} name - The user's full name.

@param {string} email - The user's email address.

@param {string} password - The user's chosen password. */ export async function signUpUser(name, email, password) { try { const { data, error } = await supabase.auth.signUp({ email: email, password: password, options: { data: { full_name: name } } });

 if (error) throw error;

 alert('Sign-up successful! Please check your email to confirm your account.');
 return data.user;
} catch (error) { console.error('Sign up error:', error.message); alert(Sign-up failed: ${error.message}); } }

/**

Signs in an existing user.

@param {string} email - The user's email address.

@param {string} password - The user's password. */ export async function signInUser(email, password) { try { const { data, error } = await supabase.auth.signInWithPassword({ email: email, password: password, });

 if (error) throw error;
 console.log('User signed in successfully.');
 return data.user;
} catch (error) { console.error('Sign in error:', error.message); alert(Sign-in failed: ${error.message}); } }

/**

Signs out the current user. */ export async function logoutUser() { try { const { error } = await supabase.auth.signOut(); if (error) throw error; console.log('User signed out successfully.'); } catch (error) { console.error('Sign out error:', error.message); alert(Sign-out failed: ${error.message}); } }
/**

Initializes a listener for authentication state changes (sign-in, sign-out).

@param {function} navigateCallback - The function to call for routing/navigation.

@param {function} headerUpdateCallback - The function to call to update the UI header. */ export function initAuthStateObserver(navigateCallback, headerUpdateCallback) { supabase.auth.onAuthStateChange((event, session) => { const user = session?.user || null; headerUpdateCallback(user);

 if (user) {
     if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
          navigateCallback('/dashboard');
     } else {
          navigateCallback(window.location.pathname);
     }
 } else {
     navigateCallback('/');
 }
}); }
