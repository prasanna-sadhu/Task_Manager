// DOM Elements
const dashboard = document.getElementById("dashboard");
const addUserBtn = document.getElementById("add-user-btn");
const userModal = document.getElementById("user-modal");
const userNameInput = document.getElementById("user-name-input");
const createUserBtn = document.getElementById("create-user-btn");
const closeUserModal = document.getElementById("close-user-modal");

// Users array
let users = JSON.parse(localStorage.getItem("users")) || [];

// Save to localStorage
function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

// Render dashboard
function renderDashboard() {
    dashboard.innerHTML = "";
    users.forEach((user, uIndex) => {
        const userCard = document.createElement("div");
        userCard.className = "user-card";

        // User header
        const header = document.createElement("div");
        header.className = "user-header";
        const name = document.createElement("h3");
        name.textContent = user.name;
        const delUserBtn = document.createElement("button");
        delUserBtn.textContent = "Delete User";
        delUserBtn.onclick = () => {
            users.splice(uIndex, 1);
            saveUsers();
            renderDashboard();
        };
        header.appendChild(name);
        header.appendChild(delUserBtn);
        userCard.appendChild(header);

        // Add Task Button
        const addTaskBtn = document.createElement("button");
        addTaskBtn.textContent = "Add Task";
        addTaskBtn.style.marginBottom = "10px";
        addTaskBtn.onclick = () => addTask(uIndex);
        userCard.appendChild(addTaskBtn);

        // Task List
        const taskList = document.createElement("div");
        taskList.className = "task-list";

        user.tasks.forEach((task, tIndex) => {
            const taskCard = document.createElement("div");
            taskCard.className = "task-card";

            // Task Header
            const taskHeader = document.createElement("div");
            taskHeader.className = "task-header";
            const taskName = document.createElement("h4");
            taskName.textContent = task.name;
            taskName.contentEditable = true;
            taskName.onblur = () => { task.name = taskName.textContent; saveUsers(); };
            const delTaskBtn = document.createElement("button");
            delTaskBtn.textContent = "Delete";
            delTaskBtn.onclick = () => {
                user.tasks.splice(tIndex, 1);
                saveUsers();
                renderDashboard();
            };
            taskHeader.appendChild(taskName);
            taskHeader.appendChild(delTaskBtn);
            taskCard.appendChild(taskHeader);

            // Progress Bar
            const progress = document.createElement("div");
            progress.className = "task-progress";
            const fill = document.createElement("div");
            fill.className = "task-progress-fill";
            fill.style.width = task.progress + "%";
            fill.contentEditable = true;
            fill.onblur = () => {
                let val = parseInt(fill.textContent) || 0;
                if (val > 100) val = 100;
                task.progress = val;
                fill.style.width = val + "%";
                saveUsers();
            };
            progress.appendChild(fill);
            taskCard.appendChild(progress);

            // Deadline
            const deadlineDiv = document.createElement("div");
            deadlineDiv.className = "task-deadline";
            taskCard.appendChild(deadlineDiv);

            function updateDeadline() {
                const now = new Date();
                const end = new Date(task.deadline);
                const diff = Math.ceil((end - now) / (1000*60*60*24));
                deadlineDiv.textContent = diff >= 0 ? `Deadline: ${task.deadline} (${diff} days left)` : `Deadline passed (${task.deadline})`;
                if(diff < 0) deadlineDiv.style.color = "red";
                else if(diff <=5) deadlineDiv.style.color = "orange";
                else deadlineDiv.style.color = "green";
            }
            updateDeadline();
            setInterval(updateDeadline, 60000);

            taskList.appendChild(taskCard);
        });

        userCard.appendChild(taskList);
        dashboard.appendChild(userCard);
    });
}

// Add Task function
function addTask(uIndex){
    const taskName = prompt("Enter task name");
    if(!taskName) return;
    const taskProgress = parseInt(prompt("Enter progress % (0-100)")) || 0;
    const taskDeadline = prompt("Enter deadline (YYYY-MM-DD)");
    if(!taskDeadline) return;
    users[uIndex].tasks.push({name: taskName, progress: taskProgress, deadline: taskDeadline});
    saveUsers();
    renderDashboard();
}

// Modal controls
addUserBtn.addEventListener("click", () => userModal.style.display="flex");
closeUserModal.addEventListener("click", () => userModal.style.display="none");
createUserBtn.addEventListener("click", () => {
    const name = userNameInput.value.trim();
    if(!name) return alert("Enter user name");
    users.push({name, tasks: []});
    saveUsers();
    userNameInput.value = "";
    userModal.style.display="none";
    renderDashboard();
});

// Initial render
renderDashboard();
