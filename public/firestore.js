// This file will contain all Cloud Firestore logic for the application.
import { db, auth } from './firebase-config.js';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    doc,
    deleteDoc,
    updateDoc,
    getDoc,
    setDoc,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- USER PROFILE FUNCTIONS ---

export async function getUserProfile(userId) {
    const userDocRef = doc(db, "users", userId);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("No such user profile!");
            return null;
        }
    } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
    }
}

export async function updateUserProfile(userId, dataToUpdate) {
    const userDocRef = doc(db, "users", userId);
    try {
        // Use setDoc with merge: true to create or update the document.
        await setDoc(userDocRef, dataToUpdate, { merge: true });
        console.log("User profile updated successfully");
    } catch (error) {
        console.error("Error updating user profile:", error);
    }
}


// --- COMMUNITY/POSTS FUNCTIONS ---

export async function createPost(title, content) {
    const user = auth.currentUser;
    if (!user) return console.error("No user logged in to create a post.");
    try {
        await addDoc(collection(db, "posts"), {
            title: title,
            content: content,
            authorId: user.uid,
            authorName: user.displayName,
            createdAt: new Date()
        });
        console.log("Post created successfully.");
    } catch (e) {
        console.error("Error creating post: ", e);
    }
}

export function getPosts(callback) {
    const postsCollection = collection(db, "posts");
    // Order by creation date, newest first
    const q = query(postsCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        callback(posts);
    });
    return unsubscribe;
}


// --- CGPA FUNCTIONS ---

export function getCourses(callback) {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) return console.error("No user logged in to get courses.");

    const coursesCollection = collection(db, "users", userId, "courses");
    const q = query(coursesCollection);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const courses = [];
        querySnapshot.forEach((doc) => {
            courses.push({ id: doc.id, ...doc.data() });
        });
        callback(courses);
    });
    return unsubscribe;
}

export async function saveCourses(courses) {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) return console.error("No user logged in to save courses.");

    // This is a simple approach: delete all old courses and save the new ones.
    // A more advanced implementation would use a batch write to update only changed courses.
    const oldCoursesCollection = collection(db, "users", userId, "courses");
    const oldCoursesSnap = await getDocs(oldCoursesCollection);
    for (const courseDoc of oldCoursesSnap.docs) {
        await deleteDoc(doc(db, "users", userId, "courses", courseDoc.id));
    }

    for (const course of courses) {
        await addDoc(collection(db, "users", userId, "courses"), course);
    }
    console.log("Courses saved successfully.");
}


// --- NOTES CRUD FUNCTIONS ---

export async function addNote(title, content) {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) return console.error("No user logged in to add a note.");
    try {
        await addDoc(collection(db, "notes", userId, "userNotes"), {
            title: title,
            content: content,
            createdAt: new Date()
        });
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Error adding note. Please try again.");
    }
}

export function getNotes(callback) {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) return console.error("No user logged in to get notes.");

    const notesCollection = collection(db, "notes", userId, "userNotes");
    const q = query(notesCollection);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notes = [];
        querySnapshot.forEach((doc) => {
            notes.push({ id: doc.id, ...doc.data() });
        });
        callback(notes);
    }, (error) => {
        console.error("Error getting notes: ", error);
        alert("Could not fetch notes.");
    });

    return unsubscribe;
}

export async function updateNote(noteId, updatedData) {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) return console.error("No user logged in to update a note.");
    const noteDocRef = doc(db, "notes", userId, "userNotes", noteId);
    try {
        await updateDoc(noteDocRef, updatedData);
    } catch (e) {
        console.error("Error updating note: ", e);
        alert("Error updating note.");
    }
}

export async function deleteNote(noteId) {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) return console.error("No user logged in to delete a note.");
    const noteDocRef = doc(db, "notes", userId, "userNotes", noteId);
    try {
        await deleteDoc(noteDocRef);
    } catch (e) {
        console.error("Error deleting note: ", e);
        alert("Error deleting note.");
    }
}
