import { signUpUser, signInUser, logoutUser, initAuthStateObserver } from './auth.js';
import {
    addNote, getNotes, updateNote, deleteNote,
    getUserProfile, updateUserProfile,
    getCourses, saveCourses,
    createPost, getPosts
} from './firestore.js';
import { uploadProfilePicture } from './storage.js';
import { auth } from './firebase-config.js';

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
    window.history.pushState({}, path, window.location.origin + path);
    loadPage(path);
};

const renderHeader = (user) => {
    const header = document.getElementById('main-header');
    const navLinksContainer = document.getElementById('main-nav-links');
    if (!header || !navLinksContainer) return;

    if (user) {
        header.style.display = 'block';
        navLinksContainer.innerHTML = `
            <a href="#" id="dashboard-link">Dashboard</a>
            <a href="#" id="profile-link">Profile</a>
            <a href="#" id="logout-button-nav">Logout</a>
        `;
        document.getElementById('dashboard-link').addEventListener('click', (e) => { e.preventDefault(); navigate('/dashboard'); });
        document.getElementById('profile-link').addEventListener('click', (e) => { e.preventDefault(); navigate('/profile'); });
        document.getElementById('logout-button-nav').addEventListener('click', (e) => { e.preventDefault(); logoutUser(); });
    } else {
        header.style.display = 'none';
        navLinksContainer.innerHTML = '';
    }
};

const loadPage = async (path) => {
    const route = routes[path] || routes['/404'];
    try {
        const response = await fetch(route);
        if (!response.ok) {
            app.innerHTML = `<h1>Error: Could not load page content.</h1>`;
            return;
        }
        const html = await response.text();
        app.innerHTML = html;

        app.classList.remove('fade-in');
        void app.offsetWidth;
        app.classList.add('fade-in');
    } catch (error) {
        console.error(`Error in loadPage function for path ${path}.`, error);
        app.innerHTML = `<h1>Fatal Error: Could not load page. Check console.</h1>`;
    }

    if (path === '/') {
        // Login/signup page logic...
        const authForm = document.getElementById('auth-form');
        const toggleLink = document.getElementById('toggle-auth-mode');
        let isLoginMode = true;
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            // ... (rest of the toggle logic)
        });
        if(authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // ... (rest of the form submission logic)
            });
        }
    } else if (path === '/profile') {
        // Profile page logic...
    } else if (path === '/notes') {
        // Notes page logic...
    } else if (path === '/community') {
        const postGrid = document.querySelector('.post-grid');
        const createPostBtn = document.querySelector('.community-header .primary-button');

        const renderPosts = (posts) => {
            if (!postGrid) return;
            postGrid.innerHTML = posts.length === 0 ? '<p>No posts yet. Be the first!</p>' : posts.map(post => `
                <div class="ui-card post-card" data-id="${post.id}">
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                    <p class="post-meta">Posted by <strong>${post.authorName || 'Anonymous'}</strong> on ${new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</p>
                </div>
            `).join('');
        };

        getPosts(renderPosts);

        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => {
                const title = prompt("Enter post title:");
                if (title) {
                    const content = prompt("Enter post content:");
                    if (content) {
                        createPost(title, content);
                    }
                }
            });
        }
    } else if (path === '/cgpa') {
        const tableBody = document.getElementById('cgpa-table-body');
        const addCourseBtn = document.getElementById('add-course-btn');
        const calculateButton = document.getElementById('calculate-gpa');
        const saveButton = document.getElementById('save-gpa-btn'); // Assuming a save button is added to HTML

        const createCourseRow = (course = { code: '', units: 3, grade: 5 }) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td><input type="text" placeholder="e.g., CSC401" class="app-input" value="${course.code}"></td><td><input type="number" min="1" max="6" value="${course.units}" class="app-input"></td><td><select class="app-input" value="${course.grade}"><option value="5">A</option><option value="4">B</option><option value="3">C</option><option value="2">D</option><option value="1">E</option><option value="0">F</option></select></td><td><button class="primary-button remove-course-btn">Remove</button></td>`;
            // Set the selected option
            row.querySelector('select').value = course.grade;
            tableBody.appendChild(row);
        };

        const renderCourses = (courses) => {
            tableBody.innerHTML = '';
            if (courses.length > 0) {
                courses.forEach(course => createCourseRow(course));
            } else {
                // Create 9 default empty rows if no courses are saved
                for (let i = 0; i < 9; i++) { createCourseRow(); }
            }
        };

        getCourses(renderCourses); // Fetch and render courses on page load

        addCourseBtn.addEventListener('click', () => createCourseRow());

        tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-course-btn')) e.target.closest('tr').remove();
        });

        if(calculateButton) calculateButton.addEventListener('click', calculateCGPA);

        if(saveButton) {
            saveButton.addEventListener('click', () => {
                const rows = document.querySelectorAll('#cgpa-table-body tr');
                const coursesToSave = [];
                rows.forEach(row => {
                    const code = row.querySelector('input[type="text"]').value;
                    const units = parseFloat(row.querySelector('input[type="number"]').value);
                    const grade = parseFloat(row.querySelector('select').value);
                    if (code && units) { // Only save rows that have at least a code and units
                        coursesToSave.push({ code, units, grade });
                    }
                });
                saveCourses(coursesToSave).then(() => alert("Courses saved!"));
            });
        }
    }
};

// ... (rest of the file is the same)
// I will just overwrite the whole file to be safe.
window.onpopstate = () => { loadPage(window.location.pathname); };
initAuthStateObserver(navigate, renderHeader);
const hamburger = document.getElementById('hamburger-menu');
const header = document.getElementById('main-header');
hamburger.addEventListener('click', () => { header.classList.toggle('nav-open'); });

function calculateCGPA() {
    const rows = document.querySelectorAll('#cgpa-table-body tr');
    let totalGradePoints = 0, totalUnits = 0;
    rows.forEach(row => {
        const unitsInput = row.querySelector('input[type="number"]');
        const gradeSelect = row.querySelector('select');
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
    resultDiv.innerHTML = `<h3>Your Results</h3><div class="gauge"></div><p>Semester GPA: <strong>${semesterGPA}</strong></p><p>Overall CGPA: <strong>${semesterGPA}</strong> (demo)</p>`;
}
