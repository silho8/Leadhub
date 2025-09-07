// This file will contain all the Cloud Firestore logic for the Notes feature.

// The global `db` object and `dbFunctions` are initialized in index.html
const db = window.db;
const {
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    doc,
    deleteDoc,
    updateDoc
} = window.dbFunctions;

// The global `auth` object is also available
const auth = window.auth;


// --- NOTES CRUD FUNCTIONS ---

// Function to add a new note
async function addNote(title, content) {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
        return console.error("No user logged in to add a note.");
    }
    try {
        const docRef = await addDoc(collection(db, "notes", userId, "userNotes"), {
            title: title,
            content: content,
            createdAt: new Date()
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Error adding note. Please try again.");
    }
}

// Function to get all notes for the current user and listen for real-time updates
function getNotes(callback) {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
        return console.error("No user logged in to get notes.");
    }

    const notesCollection = collection(db, "notes", userId, "userNotes");
    const q = query(notesCollection); // Can add ordering here later, e.g., orderBy("createdAt", "desc")

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

    return unsubscribe; // Return the unsubscribe function to stop listening when needed
}

// Function to update an existing note
async function updateNote(noteId, updatedData) {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
        return console.error("No user logged in to update a note.");
    }
    const noteDocRef = doc(db, "notes", userId, "userNotes", noteId);
    try {
        await updateDoc(noteDocRef, updatedData);
        console.log("Note updated successfully");
    } catch (e) {
        console.error("Error updating note: ", e);
        alert("Error updating note.");
    }
}

// Function to delete a note
async function deleteNote(noteId) {
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
        return console.error("No user logged in to delete a note.");
    }
    const noteDocRef = doc(db, "notes", userId, "userNotes", noteId);
    try {
        await deleteDoc(noteDocRef);
        console.log("Note deleted successfully");
    } catch (e) {
        console.error("Error deleting note: ", e);
        alert("Error deleting note.");
    }
}
