document.addEventListener('DOMContentLoaded', () => {
    // Initialize the auth state observer immediately
    initAuthStateObserver();

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
        // Only push state if the path is different
        if (window.location.pathname !== path) {
            window.history.pushState({}, path, window.location.origin + path);
        }
        loadPage(path);
    };
    // Make navigate global so the auth observer can use it
    window.navigate = navigate;

    const loadPage = async (path) => {
        const route = routes[path] || routes['/404'];
        const response = await fetch(route);
        const html = await response.text();
        app.innerHTML = html;

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
            const uploadButton = document.querySelector('.notes-header .glowing-button');

            const renderNotes = (notes) => {
                if (!noteGrid) return;
                if (notes.length === 0) {
                    noteGrid.innerHTML = '<p>No notes yet. Create one!</p>';
                    return;
                }
                noteGrid.innerHTML = notes.map(note => `
                    <div class="glowing-card note-card" data-id="${note.id}">
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

            uploadButton.addEventListener('click', () => {
                const title = prompt("Enter note title:");
                if (title) {
                    const content = prompt("Enter note content:");
                    if (content) {
                        addNote(title, content);
                    }
                }
            });

        } else if (path === '/cgpa') {
            const calculateButton = document.getElementById('calculate-gpa');
            if(calculateButton) {
                calculateButton.addEventListener('click', calculateCGPA);
            }
        }
    };

    window.onpopstate = () => {
        loadPage(window.location.pathname);
    };

    // Initial page load is handled by the auth state observer
    // loadPage(window.location.pathname);
});

function calculateCGPA() {
    const rows = document.querySelectorAll('.input-table tbody tr');
    let totalGradePoints = 0;
    let totalUnits = 0;

    rows.forEach(row => {
        const unitsInput = row.querySelector('input[type="number"]');
        const gradeSelect = row.querySelector('select');

        const units = parseFloat(unitsInput.value) || 0;
        const grade = parseFloat(gradeSelect.value) || 0;

        if (units > 0) {
            totalGradePoints += units * grade;
            totalUnits += units;
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
