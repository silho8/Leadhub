// This file will contain all the Firebase Authentication logic.
import { auth } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    getIdToken
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from './firebase-config.js';
import { setSupabaseAuth } from './supabase-config.js';

// --- AUTH FUNCTIONS ---

// Function to handle user sign-up
export function signUpUser(name, email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // After creating the user, update their profile with the name
            return updateProfile(user, { displayName: name }).then(() => {
                // Now, create a document for them in the 'users' collection
                const userDocRef = doc(db, "users", user.uid);
                return setDoc(userDocRef, {
                    uid: user.uid,
                    name: name,
                    email: email,
                    createdAt: new Date()
                });
            });
        })
        .then(() => {
            console.log('User signed up and profile created.');
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
    onAuthStateChanged(auth, (user) => {
        headerUpdateCallback(user);

        if (user) {
            // User is signed in.
            // Get the Firebase JWT and set it for Supabase.
            user.getIdToken().then((token) => {
                setSupabaseAuth(token);
            });

            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                navigateCallback('/dashboard');
            }
        } else {
            // User is signed out.
            // Clear the Supabase session.
            setSupabaseAuth(null);
            navigateCallback('/');
        }
    }, (error) => {
        console.error("Error in onAuthStateChanged observer:", error);
        headerUpdateCallback(null);
        setSupabaseAuth(null); // Clear session on error too
        navigateCallback('/');
    });
}
