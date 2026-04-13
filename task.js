// ===== Theme Toggle =====
const themeToggle = document.getElementById("theme-toggle");
const htmlEl = document.documentElement;

function applyTheme(theme) {
    htmlEl.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    const icon = themeToggle.querySelector("i");
    if (theme === "dark") {
        icon.className = "fas fa-sun";
        themeToggle.innerHTML = "";
        themeToggle.appendChild(icon);
        themeToggle.append(" Light Mode");
    } else {
        icon.className = "fas fa-moon";
        themeToggle.innerHTML = "";
        themeToggle.appendChild(icon);
        themeToggle.append(" Dark Mode");
    }
}

// Apply saved theme on load
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
    const current = htmlEl.getAttribute("data-theme") || "light";
    applyTheme(current === "dark" ? "light" : "dark");
});

// DOM Elements
const dashboard = document.getElementById("dashboard");
const addUserBtn = document.getElementById("add-user-btn");
const userModal = document.getElementById("user-modal");
const userNameInput = document.getElementById("user-name-input");
const createUserBtn = document.getElementById("create-user-btn");
const closeUserModal = document.getElementById("close-user-modal");

const taskModal = document.getElementById("task-modal");
const closeTaskModal = document.getElementById("close-task-modal");
const taskNameInput = document.getElementById("task-name-input");
const taskPriorityInput = document.getElementById("task-priority-input");
const taskCategoryInput = document.getElementById("task-category-input");
const taskDeadlineInput = document.getElementById("task-deadline-input");
const taskProgressInput = document.getElementById("task-progress-input");
const createTaskBtn = document.getElementById("create-task-btn");

const editTaskModal = document.getElementById("edit-task-modal");
const closeEditTaskModal = document.getElementById("close-edit-task-modal");
const editTaskNameInput = document.getElementById("edit-task-name-input");
const editTaskPriorityInput = document.getElementById("edit-task-priority-input");
const editTaskCategoryInput = document.getElementById("edit-task-category-input");
const editTaskDeadlineInput = document.getElementById("edit-task-deadline-input");
const editTaskProgressInput = document.getElementById("edit-task-progress-input");
const saveTaskBtn = document.getElementById("save-task-btn");

const searchInput = document.getElementById("search-input");
const priorityFilter = document.getElementById("priority-filter");
const statusFilter = document.getElementById("status-filter");

const totalUsersEl = document.getElementById("total-users");
const totalTasksEl = document.getElementById("total-tasks");
const completedTasksEl = document.getElementById("completed-tasks");

// Users array
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUserIndex = null;
let currentTaskIndex = null;
let expandedUsers = new Set();

// Save to localStorage
function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
    updateStats();
}

// Update statistics
function updateStats() {
    let totalTasks = 0;
    let completedTasks = 0;

    users.forEach(user => {
        totalTasks += user.tasks.length;
        user.tasks.forEach(task => {
            if (Number(task.progress) === 100) {
                completedTasks++;
            }
        });
    });

    totalUsersEl.textContent = users.length;
    totalTasksEl.textContent = totalTasks;
    completedTasksEl.textContent = completedTasks;
}

// Filter and search tasks
function filterTasks(userIndex, task) {
    const searchTerm = searchInput.value.toLowerCase();
    const priorityValue = priorityFilter.value;
    const statusValue = statusFilter.value;

    // Search filter
    if (searchTerm) {
        const userName = users[userIndex].name.toLowerCase();
        const taskName = task.name.toLowerCase();
        if (!userName.includes(searchTerm) && !taskName.includes(searchTerm)) {
            return false;
        }
    }

    // Priority filter
    if (priorityValue !== "all" && task.priority !== priorityValue) {
        return false;
    }

    // Status filter
    if (statusValue !== "all") {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);
        const progressNum = Number(task.progress);
        const isOverdue = deadline < now && progressNum < 100;

        if (statusValue === "completed" && progressNum !== 100) {
            return false;
        }
        if (statusValue === "in-progress" && (progressNum === 100 || isOverdue)) {
            return false;
        }
        if (statusValue === "overdue" && !isOverdue) {
            return false;
        }
    }

    return true;
}

// Render dashboard
function renderDashboard() {
    dashboard.innerHTML = "";

    if (users.length === 0) {
        dashboard.innerHTML = `
            <div style="width:100%; text-align:center; padding:50px; color:#fff;">
                <i class="fas fa-inbox" style="font-size:64px; margin-bottom:20px; opacity:0.5;"></i>
                <h2>No users yet</h2>
                <p style="opacity:0.7;">Click "Add User" to get started!</p>
            </div>
        `;
        updateStats();
        return;
    }

    users.forEach((user, uIndex) => {
        const userCard = document.createElement("div");
        userCard.className = "user-card";

        // User header
        const header = document.createElement("div");
        header.className = "user-header";
        const name = document.createElement("h3");
        name.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
        const delUserBtn = document.createElement("button");
        delUserBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        delUserBtn.onclick = () => {
            if (confirm(`Are you sure you want to delete ${user.name} and all their tasks?`)) {
                users.splice(uIndex, 1);
                expandedUsers.clear();
                saveUsers();
                renderDashboard();
            }
        };
        header.appendChild(name);
        header.appendChild(delUserBtn);
        userCard.appendChild(header);

        // Add Task Button
        const addTaskBtn = document.createElement("button");
        addTaskBtn.className = "add-task-btn";
        addTaskBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Task';
        addTaskBtn.onclick = () => openTaskModal(uIndex);
        userCard.appendChild(addTaskBtn);

        // Task List
        const taskList = document.createElement("div");
        taskList.className = "task-list";

        const filteredTasks = [];
        user.tasks.forEach((task, tIndex) => {
            if (filterTasks(uIndex, task)) {
                filteredTasks.push({ task, tIndex });
            }
        });

        const hasVisibleTasks = filteredTasks.length > 0;
        const isExpanded = expandedUsers.has(uIndex);

        let displayTasks = filteredTasks;
        if (filteredTasks.length > 1 && !isExpanded) {
            displayTasks = filteredTasks.slice(0, 1);
        }

        displayTasks.forEach(({ task, tIndex }) => {

            const priorityVal = task.priority ? task.priority.toLowerCase().trim() : "medium";

            const taskCard = document.createElement("div");
            taskCard.className = `task-card priority-${priorityVal}`;

            // Task Header
            const taskHeader = document.createElement("div");
            taskHeader.className = "task-header";
            const taskName = document.createElement("h4");
            taskName.textContent = task.name;

            const taskActions = document.createElement("div");
            taskActions.className = "task-actions";

            const editBtn = document.createElement("button");
            editBtn.className = "edit-btn";
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.onclick = () => openEditTaskModal(uIndex, tIndex);

            const delTaskBtn = document.createElement("button");
            delTaskBtn.className = "del-task-btn";
            delTaskBtn.innerHTML = '<i class="fas fa-trash"></i>';
            delTaskBtn.onclick = () => {
                if (confirm("Are you sure you want to delete this task?")) {
                    user.tasks.splice(tIndex, 1);
                    saveUsers();
                    renderDashboard();
                }
            };

            taskActions.appendChild(editBtn);
            taskActions.appendChild(delTaskBtn);
            taskHeader.appendChild(taskName);
            taskHeader.appendChild(taskActions);
            taskCard.appendChild(taskHeader);

            // Task Meta (Priority & Category badges)
            const taskMeta = document.createElement("div");
            taskMeta.className = "task-meta";

            const priorityBadge = document.createElement("span");
            priorityBadge.className = `task-badge badge-priority-${priorityVal}`;
            priorityBadge.textContent = priorityVal;

            const categoryBadge = document.createElement("span");
            categoryBadge.className = "task-badge badge-category";
            categoryBadge.textContent = task.category || "general";

            taskMeta.appendChild(priorityBadge);
            taskMeta.appendChild(categoryBadge);
            taskCard.appendChild(taskMeta);

            // Progress Bar
            const progress = document.createElement("div");
            progress.className = "task-progress";
            const fill = document.createElement("div");
            const progressVal = Number(task.progress) || 0;
            fill.className = `task-progress-fill ${progressVal === 100 ? 'complete' : ''}`;
            fill.style.width = progressVal + "%";
            fill.textContent = progressVal + "%";
            fill.style.cssText += "text-align:center; color:#fff; font-size:10px; line-height:12px; font-weight:bold;";
            progress.appendChild(fill);
            taskCard.appendChild(progress);

            // Deadline
            const deadlineDiv = document.createElement("div");
            deadlineDiv.className = "task-deadline";
            updateDeadline(deadlineDiv, task.deadline);
            taskCard.appendChild(deadlineDiv);

            taskList.appendChild(taskCard);
        });

        if (filteredTasks.length > 1) {
            const toggleBtn = document.createElement("button");
            toggleBtn.className = "view-all-btn";
            toggleBtn.innerHTML = isExpanded ? '<i class="fas fa-chevron-up"></i> Show Less' : `<i class="fas fa-chevron-down"></i> View Tasks (${filteredTasks.length - 1} more)`;
            toggleBtn.onclick = () => {
                if (isExpanded) expandedUsers.delete(uIndex);
                else expandedUsers.add(uIndex);
                renderDashboard();
            };
            taskList.appendChild(toggleBtn);
        }

        const isFiltering = searchInput.value.trim() !== "" || priorityFilter.value !== "all" || statusFilter.value !== "all";
        if (hasVisibleTasks || !isFiltering) {
            userCard.appendChild(taskList);
            dashboard.appendChild(userCard);
        }
    });

    updateStats();
}

function updateDeadline(deadlineDiv, deadline) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(deadline);
    end.setHours(0, 0, 0, 0);
    const diff = Math.round((end - now) / (1000 * 60 * 60 * 24));

    let icon = "fas fa-calendar-alt";
    if (diff < 0) {
        deadlineDiv.innerHTML = `<i class="${icon}" style="color:var(--danger);"></i> <span style="color:var(--danger);">Overdue (${Math.abs(diff)} days)</span>`;
    } else if (diff === 0) {
        deadlineDiv.innerHTML = `<i class="${icon}" style="color:var(--priority-medium);"></i> <span style="color:var(--priority-medium);">Due today!</span>`;
    } else if (diff <= 5) {
        deadlineDiv.innerHTML = `<i class="${icon}" style="color:var(--priority-medium);"></i> <span style="color:var(--priority-medium);">${diff} days left</span>`;
    } else {
        deadlineDiv.innerHTML = `<i class="${icon}" style="color:var(--priority-low);"></i> <span style="color:var(--priority-low);">${diff} days left</span>`;
    }
}

// Open Task Modal
function openTaskModal(uIndex) {
    currentUserIndex = uIndex;
    taskNameInput.value = "";
    taskPriorityInput.value = "medium";
    taskCategoryInput.value = "general";
    taskDeadlineInput.value = "";
    taskProgressInput.value = 0;
    taskModal.style.display = "flex";
}

// Open Edit Task Modal
function openEditTaskModal(uIndex, tIndex) {
    currentUserIndex = uIndex;
    currentTaskIndex = tIndex;
    const task = users[uIndex].tasks[tIndex];

    editTaskNameInput.value = task.name;
    editTaskPriorityInput.value = task.priority || "medium";
    editTaskCategoryInput.value = task.category || "general";
    editTaskDeadlineInput.value = task.deadline;
    editTaskProgressInput.value = task.progress;

    editTaskModal.style.display = "flex";
}

// Create Task
createTaskBtn.addEventListener("click", () => {
    const taskName = taskNameInput.value.trim();
    if (!taskName) return alert("Please enter a task name");

    const taskDeadline = taskDeadlineInput.value;
    if (!taskDeadline) return alert("Please select a deadline");

    const taskProgress = parseInt(taskProgressInput.value) || 0;

    users[currentUserIndex].tasks.push({
        name: taskName,
        priority: taskPriorityInput.value,
        category: taskCategoryInput.value,
        deadline: taskDeadline,
        progress: Math.min(100, Math.max(0, taskProgress))
    });

    saveUsers();
    taskModal.style.display = "none";
    renderDashboard();
});

// Save Edited Task
saveTaskBtn.addEventListener("click", () => {
    const taskName = editTaskNameInput.value.trim();
    if (!taskName) return alert("Please enter a task name");

    const taskDeadline = editTaskDeadlineInput.value;
    if (!taskDeadline) return alert("Please select a deadline");

    const taskProgress = parseInt(editTaskProgressInput.value) || 0;

    const task = users[currentUserIndex].tasks[currentTaskIndex];
    task.name = taskName;
    task.priority = editTaskPriorityInput.value;
    task.category = editTaskCategoryInput.value;
    task.deadline = taskDeadline;
    task.progress = Math.min(100, Math.max(0, taskProgress));

    saveUsers();
    editTaskModal.style.display = "none";
    renderDashboard();
});

// Modal controls
addUserBtn.addEventListener("click", () => {
    userNameInput.value = "";
    userModal.style.display = "flex";
});

closeUserModal.addEventListener("click", () => userModal.style.display = "none");
closeTaskModal.addEventListener("click", () => taskModal.style.display = "none");
closeEditTaskModal.addEventListener("click", () => editTaskModal.style.display = "none");

// Close modals on outside click
window.addEventListener("click", (e) => {
    if (e.target === userModal) userModal.style.display = "none";
    if (e.target === taskModal) taskModal.style.display = "none";
    if (e.target === editTaskModal) editTaskModal.style.display = "none";
});

createUserBtn.addEventListener("click", () => {
    const name = userNameInput.value.trim();
    if (!name) return alert("Please enter a user name");

    users.push({ name, tasks: [] });
    saveUsers();
    userNameInput.value = "";
    userModal.style.display = "none";
    renderDashboard();
});

// Search and filter event listeners
searchInput.addEventListener("input", renderDashboard);
priorityFilter.addEventListener("change", renderDashboard);
statusFilter.addEventListener("change", renderDashboard);

// Enter key support for inputs
userNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") createUserBtn.click();
});

taskNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") createTaskBtn.click();
});

editTaskNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") saveTaskBtn.click();
});

// Initial render
renderDashboard();

// Update deadlines every minute
setInterval(() => {
    renderDashboard();
}, 60000);
