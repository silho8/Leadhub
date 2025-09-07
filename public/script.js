document.addEventListener('DOMContentLoaded', () => {
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

    const loadPage = async (path) => {
        const route = routes[path] || routes['/404'];
        const response = await fetch(route);
        const html = await response.text();
        app.innerHTML = html;

        // Add event listeners for the newly loaded page
        if (path === '/') {
            const loginForm = document.getElementById('login-form');
            if(loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    navigate('/dashboard');
                });
            }

            const disclaimer = document.getElementById('disclaimer');
            const closeDisclaimer = document.getElementById('close-disclaimer');
            if(disclaimer && closeDisclaimer) {
                // Show disclaimer after a short delay
                setTimeout(() => {
                    disclaimer.style.display = 'flex';
                }, 500);

                closeDisclaimer.addEventListener('click', () => {
                    disclaimer.style.display = 'none';
                });
            }
        } else if (path === '/dashboard') {
            document.getElementById('notes-card').addEventListener('click', () => navigate('/notes'));
            document.getElementById('cgpa-card').addEventListener('click', () => navigate('/cgpa'));
            document.getElementById('pings-card').addEventListener('click', () => navigate('/pings'));
            document.getElementById('community-card').addEventListener('click', () => navigate('/community'));
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

    // Initial page load
    loadPage(window.location.pathname);
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
