import { signUpUser, signInUser, logoutUser, initAuthStateObserver } from './auth.js'; import { supabase } from './supabase-config.js'; import { getNotes, addNote, deleteNote } from './database.js'; import { uploadProfilePicture } from './storage.js';

const app = document.getElementById('app');

const routes = { '/': 'pages/login.html', '/dashboard': 'pages/dashboard.html', '/notes': 'pages/notes.html', '/cgpa': 'pages/cgpa.html', '/pings': 'pages/pings.html', '/ai': 'pages/ai.html', '/community': 'pages/community.html', '/profile': 'pages/profile.html', '/share': 'pages/share.html', '/404': 'pages/404.html' };

const navigate = (path) => { if (window.location.pathname !== path) { window.history.pushState({}, path, window.location.origin + path); } loadPage(path); };

const renderHeader = (user) => { const header = document.getElementById('main-header'); if (!header) return;

const userName = user?.user_metadata?.full_name;

if (user) {
    header.innerHTML = `
        <div class="logo">
            <a href="#" data-path="/dashboard">LeadHub</a>
        </div>
        <nav>
            <a href="#" data-path="/dashboard">Dashboard</a>
            <a href="#" data-path="/notes">Notes</a>
            <a href="#" data-path="/cgpa">CGPA</a>
            <a href="#" data-path="/community">Community</a>
            <a href="#" data-path="/pings">Pings</a>
            <a href="#" data-path="/ai">AI Assistant</a>
            <a href="#" data-path="/profile">Profile</a>
            <a href="#" id="logout-btn">Logout</a>
        </nav>
        <div id="hamburger-menu">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
    });
    document.getElementById('hamburger-menu').addEventListener('click', () => {
        header.classList.toggle('nav-open');
    });
} else {
    header.innerHTML = `
        <div class="logo">
            <a href="#">LeadHub</a>
        </div>
        <nav></nav>
    `;
}

header.querySelectorAll('a[data-path]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = link.getAttribute('data-path');
        navigate(path);
        if (header.classList.contains('nav-open')) {
            header.classList.remove('nav-open');
        }
    });
});
};

const attachAuthEventListeners = () => { const loginForm = document.getElementById('login-form'); if (loginForm) { loginForm.addEventListener('submit', (e) => { e.preventDefault(); const email = e.target.email.value; const password = e.target.password.value; signInUser(email, password); }); }

const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        signUpUser(name, email, password);
    });
}

const toggleToSignup = document.getElementById('toggle-to-signup');
const toggleToLogin = document.getElementById('toggle-to-login');
const loginContainer = document.querySelector('.login-container');
const signupContainer = document.querySelector('.signup-container');

if (toggleToSignup && toggleToLogin && loginContainer && signupContainer) {
    toggleToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'flex';
    });
    toggleToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'flex';
    });
}
};

const loadPage = async (path) => { const { data: { user: currentUser } } = await supabase.auth.getUser(); let route, params;

if (path.startsWith('/share/')) {
    params = path.split('/')[2];
    route = routes['/share'];
} else if (path.startsWith('/profile/')) {
    params = path.split('/')[2];
    route = routes['/profile'];
} else {
    route = routes[path] || routes['/404'];
}

try {
    const response = await fetch(route);
    if (!response.ok) {
        app.innerHTML = `<h1>404 Not Found</h1><p>Could not load page content.</p>`;
        return;
    }
    const html = await response.text();
    app.innerHTML = html;
} catch (error) {
    console.error(`Error loading page ${path}:`, error);
    app.innerHTML = `<h1>Fatal Error</h1><p>Could not load page. Check console.</p>`;
    return;
}

if (path === '/') {
    attachAuthEventListeners();
} else if (path === '/notes') {
    const notesGrid = document.querySelector('.note-grid');
    const addNoteForm = document.getElementById('add-note-form');

    const renderNotes = async () => {
        if (!notesGrid) return;
        const notes = await getNotes();
        notesGrid.innerHTML = notes.length === 0 ? '<p>You have no notes yet. Create one!</p>' : notes.map(note => `
            <div class="note-card" data-id="${note.id}">
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <div class="note-actions">
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        `).join('');

        notesGrid.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const noteCard = e.target.closest('.note-card');
                const noteId = noteCard.dataset.id;
                if (confirm('Are you sure you want to delete this note?')) {
                    if (await deleteNote(noteId)) {
                        noteCard.remove();
                    } else {
                        alert('Failed to delete note.');
                    }
                }
            });
        });
    };

    if (addNoteForm) {
        addNoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = e.target.title.value;
            const content = e.target.content.value;
            if (await addNote(title, content)) {
                e.target.reset();
                await renderNotes();
            } else {
                alert('Failed to add note.');
            }
        });
    }

    await renderNotes();
} else if (path.startsWith('/profile')) {
    console.log("Profile page loaded. DB features are disabled during migration.");
} else if (path === '/community') {
    console.log("Community page loaded. DB features are disabled during migration.");
} else if (path === '/pings') {
    console.log("Pings page loaded. DB features are disabled during migration.");
}
};

document.addEventListener('DOMContentLoaded', () => { initAuthStateObserver(navigate, renderHeader); window.onpopstate = () => { loadPage(window.location.pathname); }; });
