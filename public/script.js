console.log("[DEBUG] script.js: Module loaded.");
import { signUpUser, signInUser, logoutUser, initAuthStateObserver } from './auth.js';
import { addNote, getNotes, updateNote, deleteNote } from './notes.js';

const app = document.getElementById('app');

const routes = {
    '/': 'pages/login.html',
    '/dashboard': 'pages/dashboard.html',
    '/notes': 'pages/notes.html',
    '/cgpa': 'pages/cgpa.html',
    '/pings': 'pages/pings.html',
    '/ai': 'pages/ai.html',
    '/community': 'pages/community.html',
    '/profile': 'pages/profile.html',
    '/404': 'pages/404.html'
};

const navigate = (path) => {
    console.log(`[DEBUG] script.js: navigate() called with path: ${path}`);
    // Only push state if the path is different
    if (window.location.pathname !== path) {
        console.log("[DEBUG] script.js: Pushing new state to history.");
        window.history.pushState({}, path, window.location.origin + path);
    }
    loadPage(path);
};

const renderHeader = (user) => {
    const header = document.getElementById('main-header');
    const navLinks = document.getElementById('main-nav-links');
    if (!header || !navLinks) return;

    if (user) {
        // User is logged in, show header and links
        header.style.display = 'block';
        navLinks.style.display = 'flex'; // Or whatever its default is
    } else {
        // User is logged out, hide header
        header.style.display = 'none';
    }
};

const loadPage = async (path) => {
    const route = routes[path] || routes['/404'];
    const response = await fetch(route);
    const html = await response.text();
    app.innerHTML = html;

    // Re-trigger fade-in animation
    app.classList.remove('fade-in');
    void app.offsetWidth; // Trigger a reflow, flushing the CSS changes
    app.classList.add('fade-in');

    // Add event listeners for the newly loaded page
    if (path === '/') {
        const authForm = document.getElementById('auth-form');
        const toggleLink = document.getElementById('toggle-auth-mode');
        let isLoginMode = true;

        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            const title = document.getElementById('form-title');
            const nameInput = document.getElementById('auth-name');
            const confirmPasswordInput = document.getElementById('auth-confirm-password');
            const button = document.getElementById('auth-button');

            if (isLoginMode) {
                title.innerText = 'Login';
                nameInput.style.display = 'none';
                confirmPasswordInput.style.display = 'none';
                button.innerText = 'Login';
                toggleLink.innerText = "Don't have an account? Sign Up";
            } else {
                title.innerText = 'Sign Up';
                nameInput.style.display = 'block';
                confirmPasswordInput.style.display = 'block';
                button.innerText = 'Sign Up';
                toggleLink.innerText = 'Already have an account? Login';
            }
        });

        if(authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('auth-email').value;
                const password = document.getElementById('auth-password').value;

                    // --- CRITICAL BUG FIX: Password Validation ---
                    if (password.trim() === '') {
                        alert('Password cannot be empty.');
                        return;
                    }

                if (isLoginMode) {
                    signInUser(email, password);
                } else {
                    const confirmPassword = document.getElementById('auth-confirm-password').value;
                    if (password !== confirmPassword) {
                        alert("Passwords do not match.");
                        return;
                    }
                    signUpUser(email, password);
                }
            });
        }

        const disclaimer = document.getElementById('disclaimer');
        const closeDisclaimer = document.getElementById('close-disclaimer');
        if(disclaimer && closeDisclaimer) {
            setTimeout(() => { disclaimer.style.display = 'flex'; }, 500);
            closeDisclaimer.addEventListener('click', () => { disclaimer.style.display = 'none'; });
        }
    } else if (path === '/dashboard') {
        document.getElementById('notes-card').addEventListener('click', () => navigate('/notes'));
        document.getElementById('cgpa-card').addEventListener('click', () => navigate('/cgpa'));
        document.getElementById('pings-card').addEventListener('click', () => navigate('/pings'));
        document.getElementById('community-card').addEventListener('click', () => navigate('/community'));
        // Add logout functionality
        const logoutNavButton = document.getElementById('logout-button-nav');
        if (logoutNavButton) {
            logoutNavButton.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
        }
    } else if (path === '/profile') {
         const logoutProfileButton = document.getElementById('logout-button-profile');
         if (logoutProfileButton) {
            logoutProfileButton.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
        }
    } else if (path === '/notes') {
        const noteGrid = document.querySelector('.note-grid');
        // Note: The "Upload Note" button is now a label for a file input,
        // but we can still select it if needed, though the listener is on the input itself.

        const renderNotes = (notes) => {
            if (!noteGrid) return;
            if (notes.length === 0) {
                noteGrid.innerHTML = '<p>No notes yet. Create one!</p>';
                return;
            }
            noteGrid.innerHTML = notes.map(note => `
                <div class="ui-card note-card" data-id="${note.id}">
                    <h4>${note.title}</h4>
                    <p>${note.content}</p>
                    <p class="note-meta">Created: ${new Date(note.createdAt.seconds * 1000).toLocaleDateString()}</p>
                    <button class="share-button edit-note">Edit</button>
                    <button class="share-button delete-note" style="right: 70px;">Delete</button>
                </div>
            `).join('');

            // Add event listeners for new buttons
            document.querySelectorAll('.edit-note').forEach(button => {
                button.addEventListener('click', (e) => {
                    const noteId = e.target.closest('.note-card').dataset.id;
                    const newTitle = prompt("Enter new title:", e.target.closest('.note-card').querySelector('h4').innerText);
                    const newContent = prompt("Enter new content:", e.target.closest('.note-card').querySelector('p').innerText);
                    if (newTitle !== null && newContent !== null) {
                        updateNote(noteId, { title: newTitle, content: newContent });
                    }
                });
            });

            document.querySelectorAll('.delete-note').forEach(button => {
                button.addEventListener('click', (e) => {
                    const noteId = e.target.closest('.note-card').dataset.id;
                    if (confirm("Are you sure you want to delete this note?")) {
                        deleteNote(noteId);
                    }
                });
            });
        };

        getNotes(renderNotes);

        // This button is now a label for the file input.
        // The old prompt-based logic is replaced by the file input listener.
        const fileUploadInput = document.getElementById('note-file-upload');
        if (fileUploadInput) {
            fileUploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    console.log('File selected:', {
                        name: file.name,
                        size: file.size,
                        type: file.type
                    });
                    alert(`File "${file.name}" selected. Upload logic not yet implemented.`);
                    // Here is where we would call a function to upload the file to Firebase Storage.
                }
            });
        }

    } else if (path === '/cgpa') {
        const tableBody = document.getElementById('cgpa-table-body');
        const addCourseBtn = document.getElementById('add-course-btn');
        const calculateButton = document.getElementById('calculate-gpa');

        const createCourseRow = () => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" placeholder="e.g., CSC401" class="app-input"></td>
                <td><input type="number" min="1" max="6" value="3" class="app-input"></td>
                <td>
                    <select class="app-input">
                        <option value="5">A</option>
                        <option value="4">B</option>
                        <option value="3">C</option>
                        <option value="2">D</option>
                        <option value="1">E</option>
                        <option value="0">F</option>
                    </select>
                </td>
                <td><button class="primary-button remove-course-btn">Remove</button></td>
            `;
            tableBody.appendChild(row);
        };

        // Create default 9 rows
        for (let i = 0; i < 9; i++) {
            createCourseRow();
        }

        // Event listener for adding a new course
        addCourseBtn.addEventListener('click', createCourseRow);

        // Event listener for removing a course (using event delegation)
        tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-course-btn')) {
                e.target.closest('tr').remove();
            }
        });

        if(calculateButton) {
            calculateButton.addEventListener('click', calculateCGPA);
        }
    }
};

window.onpopstate = () => {
    loadPage(window.location.pathname);
};

// Initialize the auth state observer to trigger the initial page load
initAuthStateObserver(navigate, renderHeader);

// Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger-menu');
const header = document.getElementById('main-header');
hamburger.addEventListener('click', () => {
    header.classList.toggle('nav-open');
});

function calculateCGPA() {
    // Select all rows within the dynamic table body
    const rows = document.querySelectorAll('#cgpa-table-body tr');
    let totalGradePoints = 0;
    let totalUnits = 0;

    rows.forEach(row => {
        const unitsInput = row.querySelector('input[type="number"]');
        const gradeSelect = row.querySelector('select');

        // Ensure the elements exist before trying to get their value
        if (unitsInput && gradeSelect) {
            const units = parseFloat(unitsInput.value) || 0;
            const grade = parseFloat(gradeSelect.value) || 0;

            if (units > 0) {
                totalGradePoints += units * grade;
                totalUnits += units;
            }
        }
    });

    const semesterGPA = totalUnits > 0 ? (totalGradePoints / totalUnits).toFixed(2) : '0.00';

    const resultDiv = document.getElementById('gpa-result');
    resultDiv.innerHTML = `
        <h3>Your Results</h3>
        <div class="gauge"></div>
        <p>Semester GPA: <strong>${semesterGPA}</strong></p>
        <p>Overall CGPA: <strong>${semesterGPA}</strong> (demo)</p>
    `;
}
