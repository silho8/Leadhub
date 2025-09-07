// This file will contain all the Firebase Authentication logic.
console.log("[DEBUG] auth.js: Module loaded.");
import { auth } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- AUTH FUNCTIONS ---

// Function to handle user sign-up
export function signUpUser(email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up
            const user = userCredential.user;
            console.log('User signed up:', user);
            // The onAuthStateChanged observer will handle the redirect.
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Sign up error:', errorCode, errorMessage);
            alert(`Sign-up failed: ${errorMessage}`);
        });
}

// Function to handle user sign-in
export function signInUser(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log('User signed in:', user);
            // The onAuthStateChanged observer will handle the redirect.
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Sign in error:', errorCode, errorMessage);
            alert(`Sign-in failed: ${errorMessage}`);
        });
}

// Function to handle user sign-out
export function logoutUser() {
    signOut(auth).then(() => {
        console.log('User signed out');
        // The onAuthStateChanged observer will handle the redirect.
    }).catch((error) => {
        console.error('Sign out error:', error);
        alert(`Sign-out failed: ${error.message}`);
    });
}

// --- AUTH STATE OBSERVER ---

// Listener for authentication state changes
// This will handle redirects and manage the user session.
export function initAuthStateObserver(navigateCallback, headerUpdateCallback) {
    try {
        onAuthStateChanged(auth, (user) => {
            // Update the header display based on the user object (or null)
            headerUpdateCallback(user);

            if (user) {
                // User is signed in.
                if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                    navigateCallback('/dashboard');
                }
            } else {
                // User is signed out.
                navigateCallback('/');
            }
        });
    } catch (error) {
        console.error("[FATAL DEBUG] auth.js: Error in initAuthStateObserver.", error);
    }
}
