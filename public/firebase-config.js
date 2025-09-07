// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("[DEBUG] firebase-config.js: Module loaded.");

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAPsmxTjOmrfZP5Goxlc0Q1l1FoHl1gOCE",
    authDomain: "leadhub-7a4d2.firebaseapp.com",
    projectId: "leadhub-7a4d2",
    storageBucket: "leadhub-7a4d2.appspot.com",
    messagingSenderId: "336333029570",
    appId: "1:336333029570:web:5113ef802cd5f6f7643b5b",
    measurementId: "G-QP9979PK4T"
};

// Initialize Firebase
console.log("[DEBUG] firebase-config.js: Initializing Firebase app...");
const app = initializeApp(firebaseConfig);
console.log("[DEBUG] firebase-config.js: Firebase app initialized.", app);
const auth = getAuth(app);
console.log("[DEBUG] firebase-config.js: Firebase auth initialized.", auth);
const db = getFirestore(app);
console.log("[DEBUG] firebase-config.js: Firebase db initialized.", db);

// Export the initialized services
export { app, auth, db };
