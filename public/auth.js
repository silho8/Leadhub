// This file will contain all the Firebase Authentication logic.

// The global `auth` object and `authFunctions` are initialized in index.html
const auth = window.auth;
const {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} = window.authFunctions;


// --- AUTH FUNCTIONS ---

// Function to handle user sign-up
function signUpUser(email, password) {
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
function signInUser(email, password) {
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
function logoutUser() {
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
function initAuthStateObserver() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in.
            console.log('Auth state changed: User is signed in', user);
            // If user is on the login page, redirect to dashboard.
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                navigate('/dashboard');
            }
        } else {
            // User is signed out.
            console.log('Auth state changed: User is signed out');
            // Redirect to login page.
            navigate('/');
        }
    });
}
