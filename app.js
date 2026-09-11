'use strict';

const DATA_KEY = 'edutrack-teza-frontend-data-v1';
const SESSION_KEY = 'edutrack-teza-frontend-session-v1';
const DATA_VERSION = 2;
const MIN_GRADE = 1;
const MAX_GRADE = 10;

const DEMO_USERS = [
    {
        id: 'teacher-1',
        role: 'teacher',
        firstName: 'Ana',
        lastName: 'Popescu',
        idnp: '1000000000001',
    },
    {
        id: 'student-1',
        role: 'student',
        firstName: 'Ion',
        lastName: 'Rusu',
        idnp: '1000000000002',
    },
    {
        id: 'student-2',
        role: 'student',
        firstName: 'Alex',
        lastName: 'Popa',
        idnp: '1000000000003',
    },
    {
        id: 'student-3',
        role: 'student',
        firstName: 'Maria',
        lastName: 'Ceban',
        idnp: '1000000000004',
    },
];

const INITIAL_DATA = {
    version: DATA_VERSION,
    courses: [
        {
            id: 'course-php',
            code: 'EDU 01',
            title: 'Programarea server-side cu PHP',
            description: 'Principii de bază pentru aplicații web dinamice, formulare și sesiuni.',
            teacherId: 'teacher-1',
            accent: 'blue',
            tasks: [
                {
                    id: 'task-php-form',
                    title: 'Formular de contact în PHP',
                    description: 'Creează un formular care validează numele, e-mailul și mesajul utilizatorului.',
                    dueDate: '2026-09-18',
                    maxPoints: MAX_GRADE,
                },
                {
                    id: 'task-php-auth',
                    title: 'Sesiune de autentificare',
                    description: 'Implementează autentificarea cu sesiune și redirecționare după rol.',
                    dueDate: '2026-09-25',
                    maxPoints: MAX_GRADE,
                },
            ],
        },
        {
            id: 'course-mysql',
            code: 'EDU 02',
            title: 'Baze de date MySQL',
            description: 'Modelarea datelor, relații între tabele și interogări SQL pentru aplicații web.',
            teacherId: 'teacher-1',
            accent: 'purple',
            tasks: [
                {
                    id: 'task-mysql-schema',
                    title: 'Schema unei platforme educaționale',
                    description: 'Proiectează tabelele principale pentru utilizatori, cursuri, sarcini și răspunsuri.',
                    dueDate: '2026-09-21',
                    maxPoints: MAX_GRADE,
                },
                {
                    id: 'task-mysql-queries',
                    title: 'Interogări SQL pentru progres',
                    description: 'Scrie interogări care afișează sarcinile trimise și media notelor fiecărui student.',
                    dueDate: '2026-09-28',
                    maxPoints: MAX_GRADE,
                },
            ],
        },
    ],
    submissions: [
        {
            id: 'submission-1',
            taskId: 'task-php-form',
            studentId: 'student-1',
            answer: 'Am realizat formularul cu validare pentru câmpurile obligatorii și verificarea formatului e-mailului.',
            status: 'reviewed',
            grade: 9,
            feedback: 'Structura este corectă. Adaugă și un mesaj vizibil după trimiterea cu succes.',
            submittedAt: '2026-09-07T10:30:00',
        },
        {
            id: 'submission-2',
            taskId: 'task-php-auth',
            studentId: 'student-1',
            answer: 'Am creat formularul de autentificare și verific rolul utilizatorului înainte de redirecționare.',
            status: 'submitted',
            grade: null,
            feedback: '',
            submittedAt: '2026-09-11T09:15:00',
        },
        {
            id: 'submission-3',
            taskId: 'task-php-form',
            studentId: 'student-2',
            answer: 'Formularul verifică numele, adresa de e-mail și lungimea mesajului înainte de salvare.',
            status: 'reviewed',
            grade: 9,
            feedback: 'Validarea este funcțională. Poți îmbunătăți mesajele afișate utilizatorului.',
            submittedAt: '2026-09-08T14:20:00',
        },
        {
            id: 'submission-4',
            taskId: 'task-mysql-schema',
            studentId: 'student-2',
            answer: 'Am definit tabelele pentru users, courses, tasks și submissions cu chei primare și relații externe.',
            status: 'reviewed',
            grade: 9,
            feedback: 'Modelul de date este bine structurat și permite urmărirea răspunsurilor.',
            submittedAt: '2026-09-10T11:10:00',
        },
        {
            id: 'submission-5',
            taskId: 'task-php-form',
            studentId: 'student-3',
            answer: 'Am pregătit formularul și am adăugat verificarea câmpurilor obligatorii.',
            status: 'submitted',
            grade: null,
            feedback: '',
            submittedAt: '2026-09-11T12:05:00',
        },
    ],
};

const state = {
    userId: localStorage.getItem(SESSION_KEY),
    view: 'dashboard',
    courseId: null,
    toastTimer: null,
};

let appData = loadData();

const elements = {
    loginScreen: document.getElementById('loginScreen'),
    appScreen: document.getElementById('appScreen'),
    loginForm: document.getElementById('loginForm'),
    loginError: document.getElementById('loginError'),
    firstName: document.getElementById('loginFirstName'),
    lastName: document.getElementById('loginLastName'),
    idnp: document.getElementById('loginIdnp'),
    mainNav: document.getElementById('mainNav'),
    sidebar: document.getElementById('sidebar'),
    mobileMenuButton: document.getElementById('mobileMenuButton'),
    appContent: document.getElementById('appContent'),
    topbarPageName: document.getElementById('topbarPageName'),
    userAvatar: document.getElementById('userAvatar'),
    topbarUserName: document.getElementById('topbarUserName'),
    topbarUserRole: document.getElementById('topbarUserRole'),
    toast: document.getElementById('toast'),
};

document.addEventListener('DOMContentLoaded', init);

function init() {
    bindEvents();

    if (getCurrentUser()) {
        showApp();
    } else {
        showLogin();
    }
}

function bindEvents() {
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.mainNav.addEventListener('click', handleNavigationClick);
    elements.appContent.addEventListener('click', handleContentClick);
    elements.appContent.addEventListener('submit', handleContentSubmit);
    elements.mobileMenuButton.addEventListener('click', toggleSidebar);

    document.getElementById('topbarLogout').addEventListener('click', logout);
    document.getElementById('sidebarLogout').addEventListener('click', logout);

    document.querySelector('[data-toggle-password]').addEventListener('click', (event) => {
        const button = event.currentTarget;
        const isPassword = elements.idnp.type === 'password';
        elements.idnp.type = isPassword ? 'text' : 'password';
        button.textContent = isPassword ? 'Ascunde' : 'Arată';
        button.setAttribute('aria-label', isPassword ? 'Ascunde IDNP-ul' : 'Afișează IDNP-ul');
    });

    elements.loginForm.addEventListener('input', () => {
        elements.loginError.hidden = true;
    });
}

function loadData() {
    try {
        const stored = localStorage.getItem(DATA_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed.courses) && Array.isArray(parsed.submissions)) {
                if (!parsed.version || parsed.version < DATA_VERSION) {
                    migrateGrades(parsed);
                    try {
                        localStorage.setItem(DATA_KEY, JSON.stringify(parsed));
                    } catch (error) {
                        // Keep the original record if browser storage is full.
                    }
                }
                return parsed;
            }
        }
    } catch (error) {
        localStorage.removeItem(DATA_KEY);
    }

    return clone(INITIAL_DATA);
}

function migrateGrades(data) {
    // Previous releases stored points out of 100. Convert once, retaining answers and feedback.
    const previousLimits = new Map();
    data.courses.forEach((course) => course.tasks.forEach((task) => {
        previousLimits.set(task.id, task.maxPoints || 100);
        task.maxPoints = MAX_GRADE;
    }));
    data.submissions.forEach((submission) => {
        if (typeof submission.grade === 'number') {
            const previousMax = previousLimits.get(submission.taskId) || 100;
            submission.grade = Math.max(MIN_GRADE, Math.min(MAX_GRADE,
                Math.round(submission.grade / previousMax * MAX_GRADE)));
        }
    });
    data.version = DATA_VERSION;
}

function saveData() {
    localStorage.setItem(DATA_KEY, JSON.stringify(appData));
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function getCurrentUser() {
    return DEMO_USERS.find((user) => user.id === state.userId) || null;
}

function findUser(userId) {
    return DEMO_USERS.find((user) => user.id === userId) || null;
}

function findCourse(courseId) {
    return appData.courses.find((course) => course.id === courseId) || null;
}

function findTask(taskId) {
    for (const course of appData.courses) {
        const task = course.tasks.find((item) => item.id === taskId);
        if (task) {
            return { task, course };
        }
    }

    return null;
}

function findSubmission(taskId, studentId) {
    return appData.submissions.find((submission) => submission.taskId === taskId && submission.studentId === studentId) || null;
}

function getCourseSubmissions(courseId) {
    const course = findCourse(courseId);
    if (!course) {
        return [];
    }

    const taskIds = new Set(course.tasks.map((task) => task.id));
    return appData.submissions.filter((submission) => taskIds.has(submission.taskId));
}

function getStudentSubmissions(studentId) {
    return appData.submissions
        .filter((submission) => submission.studentId === studentId)
        .sort((first, second) => new Date(second.submittedAt) - new Date(first.submittedAt));
}

function getCourseProgress(course, studentId) {
    const completed = course.tasks.filter((task) => findSubmission(task.id, studentId)).length;
    return {
        completed,
        total: course.tasks.length,
        percentage: percentage(completed, course.tasks.length),
    };
}

function getOverallProgress(studentId) {
    const total = appData.courses.reduce((sum, course) => sum + course.tasks.length, 0);
    const completed = appData.courses.reduce((sum, course) => sum + getCourseProgress(course, studentId).completed, 0);
    return { completed, total, percentage: percentage(completed, total) };
}

function percentage(value, total) {
    if (!total) {
        return 0;
    }

    return Math.round((value / total) * 100);
}

function averageGrade(submissions) {
    const graded = submissions.filter((submission) => typeof submission.grade === 'number');
    if (!graded.length) {
        return null;
    }

    return Math.round((graded.reduce((sum, submission) => sum + submission.grade, 0) / graded.length) * 10) / 10;
}

function normalize(value) {
    return String(value || '').trim().toLocaleLowerCase('ro-RO');
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formatMultiline(value) {
    return escapeHtml(value).replaceAll('\n', '<br>');
}

function formatDate(value) {
    if (!value) {
        return 'Fără termen';
    }

    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('ro-RO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Nespecificat';
    }

    return new Intl.DateTimeFormat('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function initials(user) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

function fullName(user) {
    return `${user.firstName} ${user.lastName}`;
}

function roleLabel(role) {
    return role === 'teacher' ? 'Teacher' : 'Student';
}

function statusBadge(status) {
    const reviewed = status === 'reviewed';
    return `<span class="status-badge ${reviewed ? 'status-green' : 'status-amber'}">${reviewed ? 'Verificat' : 'În așteptare'}</span>`;
}

function courseAccent(course) {
    return course.accent === 'purple' ? 'purple' : 'blue';
}

function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(elements.loginForm);
    const role = String(formData.get('role') || '');
    const firstName = normalize(formData.get('first_name'));
    const lastName = normalize(formData.get('last_name'));
    const idnp = String(formData.get('idnp') || '').trim();

    if (!role) {
        showLoginError('Selectează tipul contului.');
        elements.loginForm.querySelector('input[name="role"]').focus();
        return;
    }

    if (!firstName || !lastName || !idnp) {
        showLoginError('Completează prenumele, numele și IDNP-ul.');
        return;
    }

    const user = DEMO_USERS.find((candidate) => (
        candidate.role === role
        && normalize(candidate.firstName) === firstName
        && normalize(candidate.lastName) === lastName
        && candidate.idnp === idnp
    ));

    if (!user) {
        showLoginError('Rolul sau datele de acces sunt incorecte.');
        return;
    }

    state.userId = user.id;
    state.view = 'dashboard';
    state.courseId = null;
    localStorage.setItem(SESSION_KEY, user.id);
    showApp();
    showToast(`Bine ai venit, ${user.firstName}!`);
}

function showLoginError(message) {
    elements.loginError.textContent = message;
    elements.loginError.hidden = false;
}

function showLogin() {
    elements.loginScreen.hidden = false;
    elements.appScreen.hidden = true;
    closeSidebar();
}

function showApp() {
    const user = getCurrentUser();
    if (!user) {
        showLogin();
        return;
    }

    elements.loginScreen.hidden = true;
    elements.appScreen.hidden = false;
    elements.userAvatar.textContent = initials(user);
    elements.topbarUserName.textContent = fullName(user);
    elements.topbarUserRole.textContent = roleLabel(user.role);
    renderSidebar(user);
    renderView();
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    state.userId = null;
    state.view = 'dashboard';
    state.courseId = null;
    elements.loginForm.reset();
    elements.idnp.type = 'password';
    document.querySelector('[data-toggle-password]').textContent = 'Arată';
    document.querySelector('[data-toggle-password]').setAttribute('aria-label', 'Afișează IDNP-ul');
    elements.loginError.hidden = true;
    showLogin();
}

function renderSidebar(user) {
    const items = user.role === 'teacher'
        ? [
            { view: 'dashboard', icon: '⌂', label: 'Panou' },
            { view: 'courses', icon: '▤', label: 'Cursurile mele' },
            { view: 'submissions', icon: '✓', label: 'Evaluare' },
        ]
        : [
            { view: 'dashboard', icon: '⌂', label: 'Panou' },
            { view: 'courses', icon: '▤', label: 'Cursuri disponibile' },
            { view: 'submissions', icon: '◷', label: 'Răspunsurile mele' },
        ];

    elements.mainNav.innerHTML = items.map((item) => `
        <button class="main-nav-button ${state.view === item.view ? 'is-active' : ''}" type="button" data-view="${item.view}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
        </button>
    `).join('');
}

function handleNavigationClick(event) {
    const button = event.target.closest('[data-view]');
    if (!button) {
        return;
    }

    state.view = button.dataset.view;
    state.courseId = null;
    closeSidebar();
    renderView();
}

function handleContentClick(event) {
    const courseButton = event.target.closest('[data-open-course]');
    if (courseButton) {
        state.view = 'course';
        state.courseId = courseButton.dataset.openCourse;
        renderView();
        return;
    }

    const viewButton = event.target.closest('[data-view]');
    if (viewButton) {
        state.view = viewButton.dataset.view;
        state.courseId = null;
        renderView();
    }
}

function handleContentSubmit(event) {
    const form = event.target.closest('form[data-action]');
    if (!form) {
        return;
    }

    event.preventDefault();
    if (form.dataset.action === 'submit-task') {
        handleTaskSubmission(form);
    }

    if (form.dataset.action === 'grade-submission') {
        handleGradeSubmission(form);
    }
}

function handleTaskSubmission(form) {
    const user = getCurrentUser();
    const taskData = findTask(form.dataset.taskId);
    const answer = String(new FormData(form).get('answer') || '').trim();

    if (!user || user.role !== 'student' || !taskData) {
        return;
    }

    if (!answer) {
        showToast('Scrie un răspuns înainte de trimitere.', true);
        return;
    }

    let submission = findSubmission(taskData.task.id, user.id);
    if (!submission) {
        submission = {
            id: `submission-${Date.now()}`,
            taskId: taskData.task.id,
            studentId: user.id,
            answer,
            status: 'submitted',
            grade: null,
            feedback: '',
            submittedAt: new Date().toISOString(),
        };
        appData.submissions.push(submission);
    } else {
        submission.answer = answer;
        submission.status = 'submitted';
        submission.grade = null;
        submission.feedback = '';
        submission.submittedAt = new Date().toISOString();
    }

    saveData();
    renderView();
    showToast('Răspunsul a fost salvat. Acum poate fi verificat de profesor.');
}

function handleGradeSubmission(form) {
    const user = getCurrentUser();
    const submission = appData.submissions.find((item) => item.id === form.dataset.submissionId);
    const taskData = submission ? findTask(submission.taskId) : null;
    const formData = new FormData(form);
    const grade = Number(formData.get('grade'));
    const feedback = String(formData.get('feedback') || '').trim();

    if (!user || user.role !== 'teacher' || !submission || !taskData) {
        return;
    }

    if (!Number.isInteger(grade) || grade < MIN_GRADE || grade > MAX_GRADE) {
        showToast('Alege o notă între 1 și 10.', true);
        return;
    }

    submission.status = 'reviewed';
    submission.grade = grade;
    submission.feedback = feedback;
    saveData();
    renderView();
    showToast('Evaluarea a fost salvată.');
}

function renderView() {
    const user = getCurrentUser();
    if (!user) {
        showLogin();
        return;
    }

    const pageNames = {
        dashboard: 'Panou',
        courses: user.role === 'teacher' ? 'Cursurile mele' : 'Cursuri disponibile',
        submissions: user.role === 'teacher' ? 'Evaluare' : 'Răspunsurile mele',
        course: 'Detalii curs',
    };

    elements.topbarPageName.textContent = pageNames[state.view] || 'Panou';
    renderSidebar(user);

    if (state.view === 'course' && state.courseId) {
        elements.appContent.innerHTML = renderCoursePage(user, state.courseId);
        return;
    }

    if (user.role === 'teacher') {
        if (state.view === 'courses') {
            elements.appContent.innerHTML = renderTeacherCourses();
        } else if (state.view === 'submissions') {
            elements.appContent.innerHTML = renderTeacherSubmissions();
        } else {
            elements.appContent.innerHTML = renderTeacherDashboard();
        }
        return;
    }

    if (state.view === 'courses') {
        elements.appContent.innerHTML = renderStudentCourses(user);
    } else if (state.view === 'submissions') {
        elements.appContent.innerHTML = renderStudentSubmissions(user);
    } else {
        elements.appContent.innerHTML = renderStudentDashboard(user);
    }
}

function renderStudentDashboard(user) {
    const overall = getOverallProgress(user.id);
    const submissions = getStudentSubmissions(user.id);
    const pendingCount = submissions.filter((submission) => submission.status !== 'reviewed').length;
    const nextTask = appData.courses
        .flatMap((course) => course.tasks.map((task) => ({ task, course })))
        .filter(({ task }) => !findSubmission(task.id, user.id))
        .sort((first, second) => first.task.dueDate.localeCompare(second.task.dueDate))[0];

    return `
        <section class="page-heading">
            <div>
                <p class="eyebrow">STUDENT DASHBOARD</p>
                <h1>Bun venit, ${escapeHtml(user.firstName)}.</h1>
                <p class="page-lead">Aici găsești cursurile și următorul pas pentru parcursul tău de învățare.</p>
            </div>
        </section>

        <section class="dashboard-hero">
            <div class="dashboard-hero-content">
                <span class="stat-label">Progres general</span>
                <h2>${overall.percentage}%</h2>
                <p>${overall.completed} din ${overall.total} sarcini trimise</p>
                <div class="large-progress" aria-label="Progres general ${overall.percentage}%"><span style="width: ${overall.percentage}%"></span></div>
            </div>
            <div class="dashboard-hero-side">
                <div class="hero-side-card"><span>RĂSPUNSURI ÎN AȘTEPTARE</span><strong>${pendingCount}</strong></div>
            </div>
        </section>

        <section class="stats-grid">
            ${statCard('Cursuri disponibile', appData.courses.length, 'poți începe oricând')}
            ${statCard('Sarcini finalizate', overall.completed, `din ${overall.total} în total`)}
            ${statCard('Răspunsuri trimise', submissions.length, 'activități salvate')}
            ${statCard('Media notelor', averageGrade(submissions) ?? 'Nesetat', 'din 10')}
        </section>

        <section class="content-section">
            <div class="section-heading"><div><p class="eyebrow">ÎNVĂȚAREA MEA</p><h2>Cursuri disponibile</h2></div><span class="section-count">${appData.courses.length} total</span></div>
            <div class="course-grid">${appData.courses.map((course) => renderStudentCourseCard(course, user.id)).join('')}</div>
        </section>

        <section class="content-section split-section">
            <div class="next-deadline-card">
                <div class="section-heading"><div><p class="eyebrow">URMĂTORUL PAS</p><h2>Următoarea scadență</h2></div></div>
                ${nextTask ? `<div class="deadline-content"><span class="deadline-mark">!</span><div><strong>${escapeHtml(nextTask.task.title)}</strong><span>${escapeHtml(nextTask.course.title)}</span><small>Termen: ${formatDate(nextTask.task.dueDate)}</small></div></div><button class="ghost-button" type="button" data-open-course="${escapeHtml(nextTask.course.id)}">Deschide cursul <span aria-hidden="true">-&gt;</span></button>` : '<div class="empty-inline">Ai trimis toate sarcinile disponibile.</div>'}
            </div>
            <div>
                <div class="section-heading"><div><p class="eyebrow">ACTIVITATEA MEA</p><h2>Ultimele răspunsuri</h2></div><button class="text-button" type="button" data-view="submissions">Vezi toate</button></div>
                ${renderStudentRecentTable(submissions.slice(0, 3))}
            </div>
        </section>
    `;
}

function renderStudentCourses(user) {
    return `
        <section class="page-heading">
            <div><p class="eyebrow">ÎNVĂȚAREA MEA</p><h1>Cursuri disponibile</h1><p class="page-lead">Alege un curs pentru a vedea sarcinile și a trimite răspunsurile.</p></div>
        </section>
        <div class="course-grid">${appData.courses.map((course) => renderStudentCourseCard(course, user.id)).join('')}</div>
    `;
}

function renderStudentCourseCard(course, studentId) {
    const progress = getCourseProgress(course, studentId);
    const accent = courseAccent(course);
    return `
        <article class="course-card accent-${accent}">
            <div class="card-topline"><span class="course-code">${escapeHtml(course.code)}</span>${progress.percentage === 100 ? '<span class="status-badge status-green">Finalizat</span>' : '<span class="status-badge status-blue">În lucru</span>'}</div>
            <h3>${escapeHtml(course.title)}</h3>
            <p>${escapeHtml(course.description)}</p>
            <div class="teacher-line">Profesor: Ana Popescu</div>
            <div class="card-progress"><div class="progress-label"><span>Progres</span><strong>${progress.percentage}%</strong></div><div class="small-progress"><span style="width: ${progress.percentage}%"></span></div></div>
            <div class="card-bottomline"><span>${progress.completed}/${progress.total} sarcini</span><button class="text-button" type="button" data-open-course="${escapeHtml(course.id)}">Deschide <span aria-hidden="true">-&gt;</span></button></div>
        </article>
    `;
}

function renderStudentSubmissions(user) {
    const submissions = getStudentSubmissions(user.id);
    return `
        <section class="page-heading"><div><p class="eyebrow">ACTIVITATEA MEA</p><h1>Răspunsurile mele</h1><p class="page-lead">Aici poți urmări răspunsurile trimise și feedbackul primit.</p></div></section>
        <section class="content-section first-section">${submissions.length ? renderStudentSubmissionsTable(submissions) : '<div class="empty-state"><h3>Nu există răspunsuri</h3><p>Deschide un curs și trimite primul răspuns.</p></div>'}</section>
    `;
}

function renderStudentRecentTable(submissions) {
    if (!submissions.length) {
        return '<div class="empty-state compact"><p>Trimite primul răspuns pentru a vedea activitatea aici.</p></div>';
    }

    return `<div class="table-wrap"><table class="data-table compact-table"><thead><tr><th>Sarcină</th><th>Stare</th><th>Nota</th></tr></thead><tbody>${submissions.map((submission) => {
        const taskData = findTask(submission.taskId);
        return `<tr><td><strong>${escapeHtml(taskData?.task.title || 'Sarcină')}</strong><small class="table-secondary">${escapeHtml(taskData?.course.title || '')}</small></td><td>${statusBadge(submission.status)}</td><td>${submission.grade === null ? 'Nesetat' : `${escapeHtml(submission.grade)}/${MAX_GRADE}`}</td></tr>`;
    }).join('')}</tbody></table></div>`;
}

function renderStudentSubmissionsTable(submissions) {
    return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Curs</th><th>Sarcină</th><th>Trimis la</th><th>Stare</th><th>Nota</th><th></th></tr></thead><tbody>${submissions.map((submission) => {
        const taskData = findTask(submission.taskId);
        if (!taskData) return '';
        return `<tr><td>${escapeHtml(taskData.course.title)}</td><td><strong>${escapeHtml(taskData.task.title)}</strong></td><td>${formatDateTime(submission.submittedAt)}</td><td>${statusBadge(submission.status)}</td><td>${submission.grade === null ? 'Nesetat' : `${escapeHtml(submission.grade)}/${taskData.task.maxPoints}`}</td><td><button class="text-button" type="button" data-open-course="${escapeHtml(taskData.course.id)}">Deschide</button></td></tr>`;
    }).join('')}</tbody></table></div>`;
}

function renderTeacherDashboard() {
    const teacher = getCurrentUser();
    const students = DEMO_USERS.filter((user) => user.role === 'student');
    const submissions = getAllTeacherSubmissions(teacher.id);
    const reviewedCount = submissions.filter((submission) => submission.status === 'reviewed').length;
    const taskCount = appData.courses.reduce((sum, course) => sum + course.tasks.length, 0);

    return `
        <section class="page-heading">
            <div><p class="eyebrow">TEACHER DASHBOARD</p><h1>Panoul profesorului</h1><p class="page-lead">Gestionează cursurile și urmărește răspunsurile studenților.</p></div>
            <button class="primary-button page-heading-action" type="button" data-demo-action="new-course">+ Curs nou</button>
        </section>

        <section class="stats-grid">
            ${statCard('Cursuri create', appData.courses.length, 'spații active')}
            ${statCard('Sarcini publicate', taskCount, 'cerințe pentru studenți')}
            ${statCard('Răspunsuri primite', submissions.length, `${reviewedCount} verificate`)}
            ${statCard('Studenți în sistem', students.length, 'conturi demonstrative')}
        </section>

        <section class="content-section">
            <div class="section-heading"><div><p class="eyebrow">MONITORIZARE</p><h2>Progresul studenților</h2></div><button class="text-button" type="button" data-demo-action="export">Exportă raport</button></div>
            ${renderTeacherProgressTable(students)}
        </section>

        <section class="content-section">
            <div class="section-heading"><div><p class="eyebrow">SPAȚIILE TALE</p><h2>Cursuri</h2></div><span class="section-count">${appData.courses.length} total</span></div>
            <div class="teacher-course-grid">${appData.courses.map((course) => renderTeacherCourseCard(course)).join('')}</div>
        </section>

        <section class="content-section">
            <div class="section-heading"><div><p class="eyebrow">ACTIVITATE RECENTĂ</p><h2>Ultimele răspunsuri</h2></div><button class="text-button" type="button" data-view="submissions">Vezi toate</button></div>
            ${renderTeacherRecentTable(submissions.slice(0, 6))}
        </section>
    `;
}

function statCard(label, value, note) {
    return `<article class="stat-card"><span class="stat-label">${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></article>`;
}

function getAllTeacherSubmissions() {
    return appData.submissions
        .filter((submission) => Boolean(findTask(submission.taskId)))
        .sort((first, second) => new Date(second.submittedAt) - new Date(first.submittedAt));
}

function renderTeacherProgressTable(students) {
    return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Student</th><th>Cursuri</th><th>Sarcini</th><th>Progres</th><th>Media notelor</th></tr></thead><tbody>${students.map((student) => {
        const allTasks = appData.courses.reduce((sum, course) => sum + course.tasks.length, 0);
        const studentSubmissions = getStudentSubmissions(student.id);
        const submitted = studentSubmissions.length;
        const grade = averageGrade(studentSubmissions);
        const progress = percentage(submitted, allTasks);
        return `<tr><td><strong>${escapeHtml(fullName(student))}</strong><small class="table-secondary">${escapeHtml(roleLabel(student.role))} demonstrativ</small></td><td>${appData.courses.length}</td><td>${submitted}/${allTasks}</td><td><div class="progress-cell"><div class="table-progress"><span style="width: ${progress}%"></span></div><strong>${progress}%</strong></div></td><td>${grade === null ? 'Nesetat' : `${escapeHtml(grade)}/${MAX_GRADE}`}</td></tr>`;
    }).join('')}</tbody></table></div>`;
}

function renderTeacherCourseCard(course) {
    const submissions = getCourseSubmissions(course.id);
    const reviewed = submissions.filter((submission) => submission.status === 'reviewed').length;
    const accent = courseAccent(course);
    return `<article class="course-card teacher-course-card accent-${accent}"><div class="card-topline"><span class="course-code">${escapeHtml(course.code)}</span><span class="status-badge status-blue">Activ</span></div><h3>${escapeHtml(course.title)}</h3><p>${escapeHtml(course.description)}</p><div class="course-card-meta"><span><strong>${course.tasks.length}</strong> sarcini</span><span><strong>${submissions.length}</strong> răspunsuri</span><span><strong>${reviewed}</strong> verificate</span></div><div class="card-bottomline"><span>Profesor: Ana Popescu</span><button class="text-button" type="button" data-open-course="${escapeHtml(course.id)}">Gestionează <span aria-hidden="true">-&gt;</span></button></div></article>`;
}

function renderTeacherRecentTable(submissions) {
    if (!submissions.length) {
        return '<div class="empty-state compact"><p>Nu au fost trimise răspunsuri.</p></div>';
    }

    return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Student</th><th>Curs</th><th>Sarcină</th><th>Stare</th><th>Nota</th></tr></thead><tbody>${submissions.map((submission) => {
        const taskData = findTask(submission.taskId);
        const student = findUser(submission.studentId);
        if (!taskData || !student) return '';
        return `<tr><td><strong>${escapeHtml(fullName(student))}</strong></td><td>${escapeHtml(taskData.course.title)}</td><td>${escapeHtml(taskData.task.title)}</td><td>${statusBadge(submission.status)}</td><td>${submission.grade === null ? 'Nesetat' : `${escapeHtml(submission.grade)}/${taskData.task.maxPoints}`}</td></tr>`;
    }).join('')}</tbody></table></div>`;
}

function renderTeacherCourses() {
    return `<section class="page-heading"><div><p class="eyebrow">SPAȚIILE TALE</p><h1>Cursurile mele</h1><p class="page-lead">Deschide un curs pentru a vedea sarcinile și a evalua răspunsurile studenților.</p></div><button class="primary-button page-heading-action" type="button" data-demo-action="new-course">+ Curs nou</button></section><div class="teacher-course-grid">${appData.courses.map((course) => renderTeacherCourseCard(course)).join('')}</div>`;
}

function renderTeacherSubmissions() {
    const submissions = getAllTeacherSubmissions();
    return `<section class="page-heading"><div><p class="eyebrow">EVALUARE</p><h1>Răspunsuri primite</h1><p class="page-lead">Selectează un curs pentru a citi răspunsurile și a salva nota.</p></div></section><section class="content-section first-section">${submissions.length ? renderTeacherRecentTable(submissions) : '<div class="empty-state"><h3>Nu există răspunsuri</h3><p>Răspunsurile studenților vor apărea aici.</p></div>'}</section>`;
}

function renderCoursePage(user, courseId) {
    const course = findCourse(courseId);
    if (!course) {
        return `<div class="empty-state"><h3>Cursul nu a fost găsit</h3><button class="ghost-button" type="button" data-view="dashboard">Înapoi la panou</button></div>`;
    }

    return user.role === 'teacher' ? renderTeacherCoursePage(course) : renderStudentCoursePage(course, user);
}

function renderStudentCoursePage(course, user) {
    const progress = getCourseProgress(course, user.id);
    return `
        <section class="course-page-heading">
            <button class="back-link" type="button" data-view="courses"><span aria-hidden="true">&lt;-</span> Înapoi la cursuri</button>
            <div class="course-page-heading-main"><div><p class="eyebrow">CURS ${escapeHtml(course.code)}</p><h1>${escapeHtml(course.title)}</h1><p>${escapeHtml(course.description)}</p><div class="teacher-line">Profesor: Ana Popescu</div></div><div class="course-progress-card"><span>Progres</span><strong>${progress.percentage}%</strong><div class="small-progress"><span style="width: ${progress.percentage}%"></span></div><small>${progress.completed} din ${progress.total} sarcini trimise</small></div></div>
        </section>
        <section class="content-section first-section"><div class="section-heading"><div><p class="eyebrow">PLAN DE LUCRU</p><h2>Sarcini</h2></div><span class="section-count">${course.tasks.length} total</span></div><div class="task-list">${course.tasks.map((task, index) => renderStudentTask(task, course, user, index)).join('')}</div></section>
    `;
}

function renderStudentTask(task, course, user, index) {
    const submission = findSubmission(task.id, user.id);
    const isReviewed = submission?.status === 'reviewed';
    return `<article class="task-card ${submission ? 'task-complete' : ''}"><div class="task-number">${String(index + 1).padStart(2, '0')}</div><div><div class="task-meta">${submission ? statusBadge(submission.status) : '<span class="status-badge status-amber">De făcut</span>'}<span>Termen: ${formatDate(task.dueDate)}</span><span>Nota maximă: ${MAX_GRADE}</span></div><h3>${escapeHtml(task.title)}</h3><p class="task-description">${escapeHtml(task.description)}</p>${submission ? `<div class="submission-summary"><strong>Răspunsul tău</strong><p>${formatMultiline(submission.answer)}</p><div class="submission-result"><span>${isReviewed ? 'Verificat de profesor' : 'Trimis, în așteptarea verificării'}</span><strong>${submission.grade === null ? 'Nota nu este setată' : `${escapeHtml(submission.grade)}/${task.maxPoints}`}</strong></div>${submission.feedback ? `<div class="feedback-box"><strong>Feedback</strong>${formatMultiline(submission.feedback)}</div>` : ''}</div>` : ''}<form class="task-form" data-action="submit-task" data-task-id="${escapeHtml(task.id)}"><label for="answer-${escapeHtml(task.id)}">${submission ? 'Actualizează răspunsul' : 'Răspunsul tău'}</label><textarea id="answer-${escapeHtml(task.id)}" name="answer" rows="4" placeholder="Scrie aici răspunsul tău..." required>${submission ? escapeHtml(submission.answer) : ''}</textarea><div class="input-row"><span class="input-hint">Salvarea răspunsului este simulată în browser.</span><button class="primary-button" type="submit">${submission ? 'Salvează modificările' : 'Trimite răspunsul'} <span aria-hidden="true">-&gt;</span></button></div></form></div></article>`;
}

function renderTeacherCoursePage(course) {
    const submissions = getCourseSubmissions(course.id);
    return `
        <section class="course-page-heading"><button class="back-link" type="button" data-view="courses"><span aria-hidden="true">&lt;-</span> Înapoi la cursuri</button><div class="course-page-heading-main"><div><p class="eyebrow">ADMINISTRARE ${escapeHtml(course.code)}</p><h1>${escapeHtml(course.title)}</h1><p>${escapeHtml(course.description)}</p></div><button class="primary-button" type="button" data-demo-action="new-task">+ Adaugă sarcină</button></div></section>
        <section class="content-section first-section"><div class="section-heading"><div><p class="eyebrow">CONȚINUT</p><h2>Sarcini publicate</h2></div><span class="section-count">${course.tasks.length} total</span></div><div class="task-overview-grid">${course.tasks.map((task, index) => renderTeacherTaskCard(task, course, index)).join('')}</div></section>
        <section class="content-section"><div class="section-heading"><div><p class="eyebrow">EVALUARE</p><h2>Răspunsuri primite</h2></div><span class="section-count">${submissions.length} total</span></div>${submissions.length ? `<div class="review-list">${submissions.map((submission) => renderReviewCard(submission)).join('')}</div>` : '<div class="empty-state"><h3>Nu există răspunsuri</h3><p>Studenții nu au trimis încă răspunsuri la acest curs.</p></div>'}</section>
    `;
}

function renderTeacherTaskCard(task, course, index) {
    const submissions = appData.submissions.filter((submission) => submission.taskId === task.id);
    const grade = averageGrade(submissions);
    return `<article class="task-overview-card"><div class="task-number">${String(index + 1).padStart(2, '0')}</div><div><h3>${escapeHtml(task.title)}</h3><p>${escapeHtml(task.description)}</p><div class="task-meta"><span>Termen: ${formatDate(task.dueDate)}</span><span>${submissions.length} răspunsuri</span><span>Medie: ${grade === null ? 'Nesetat' : `${escapeHtml(grade)}/${MAX_GRADE}`}</span></div></div></article>`;
}

function renderReviewCard(submission) {
    const taskData = findTask(submission.taskId);
    const student = findUser(submission.studentId);
    if (!taskData || !student) {
        return '';
    }

    const gradeOptions = Array.from({ length: MAX_GRADE }, (_, index) => {
        const value = index + MIN_GRADE;
        return `<option value="${value}"${submission.grade === value ? ' selected' : ''}>${value}</option>`;
    }).join('');

    return `
        <article class="review-card">
            <div class="review-header">
                <div class="review-student"><strong>${escapeHtml(fullName(student))}</strong><span>${escapeHtml(roleLabel(student.role))}</span></div>
                ${statusBadge(submission.status)}
            </div>
            <div class="review-meta"><span>Sarcină: ${escapeHtml(taskData.task.title)}</span><span>Trimis: ${formatDateTime(submission.submittedAt)}</span></div>
            <div class="answer-box"><span>Răspunsul studentului</span><p>${formatMultiline(submission.answer)}</p></div>
            <form class="review-form" data-action="grade-submission" data-submission-id="${escapeHtml(submission.id)}">
                <div>
                    <label for="grade-${escapeHtml(submission.id)}">Nota (1-10)</label>
                    <select id="grade-${escapeHtml(submission.id)}" name="grade" required>
                        <option value="" disabled${submission.grade === null ? ' selected' : ''}>Alege nota</option>
                        ${gradeOptions}
                    </select>
                </div>
                <div>
                    <label for="feedback-${escapeHtml(submission.id)}">Feedback</label>
                    <textarea id="feedback-${escapeHtml(submission.id)}" name="feedback" rows="3" placeholder="Scrie un comentariu pentru student...">${submission.feedback ? escapeHtml(submission.feedback) : ''}</textarea>
                </div>
                <button class="primary-button" type="submit">Salvează evaluarea</button>
            </form>
        </article>
    `;
}

function toggleSidebar() {
    const isOpen = elements.sidebar.classList.toggle('is-open');
    elements.mobileMenuButton.setAttribute('aria-expanded', String(isOpen));
}

function closeSidebar() {
    elements.sidebar.classList.remove('is-open');
    elements.mobileMenuButton.setAttribute('aria-expanded', 'false');
}

function showToast(message, isError = false) {
    clearTimeout(state.toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.toggle('is-error', isError);
    elements.toast.classList.add('is-visible');
    state.toastTimer = setTimeout(() => {
        elements.toast.classList.remove('is-visible');
    }, 3200);
}

document.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-demo-action]');
    if (!actionButton) {
        return;
    }

    const messages = {
        'new-course': 'În versiunea următoare vom adăuga crearea reală a cursurilor.',
        'new-task': 'În versiunea următoare vom adăuga publicarea reală a sarcinilor.',
        export: 'Raportul va putea fi exportat în versiunea cu date persistente.',
    };
    showToast(messages[actionButton.dataset.demoAction] || 'Funcție demonstrativă.');
});
