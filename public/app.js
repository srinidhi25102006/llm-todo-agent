const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const messages = document.getElementById("messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

async function loadTasks() {
  const res = await fetch("/api/tasks");
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  taskList.innerHTML = "";

  const done = tasks.filter((t) => t.completed).length;
  taskCount.textContent = `${tasks.length - done} open · ${done} done`;

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No tasks yet. Ask the assistant to add one.";
    taskList.appendChild(empty);
    return;
  }

  for (const task of tasks) {
    taskList.appendChild(createTaskItem(task));
  }
}

function createTaskItem(task) {
  const li = document.createElement("li");
  li.className = task.completed ? "task done" : "task";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.disabled = task.completed;
  checkbox.addEventListener("change", () => markComplete(task.id));

  const info = document.createElement("div");
  info.className = "task-info";

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;
  info.appendChild(title);

  if (task.dueDate) {
    const due = document.createElement("span");
    due.className = "task-due";
    due.textContent = "Due " + task.dueDate;
    info.appendChild(due);
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "✕";
  deleteBtn.setAttribute("aria-label", "Delete task");
  deleteBtn.addEventListener("click", () => removeTask(task.id));

  li.append(checkbox, info, deleteBtn);
  return li;
}

async function markComplete(id) {
  await fetch(`/api/tasks/${id}/complete`, { method: "PATCH" });
  loadTasks();
}

async function removeTask(id) {
  await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  loadTasks();
}

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function setBusy(isBusy) {
  chatInput.disabled = isBusy;
  sendBtn.disabled = isBusy;
  if (!isBusy) chatInput.focus();
}

async function sendMessage(event) {
  event.preventDefault();

  const text = chatInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  chatInput.value = "";
  setBusy(true);
  const bubble = addMessage("assistant thinking", "Thinking...");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();

    if (res.ok) {
      bubble.className = "message assistant";
      bubble.textContent = data.reply;
    } else {
      bubble.className = "message error";
      bubble.textContent = data.error || "Something went wrong.";
    }
  } catch (err) {
    bubble.className = "message error";
    bubble.textContent = "Could not reach the server. Is it running?";
  }

  setBusy(false);
  loadTasks();
}

chatForm.addEventListener("submit", sendMessage);

addMessage("assistant", "Hi! Tell me what to add, complete, or delete. Try: \"Remind me to work on OOPS tomorrow\".");
loadTasks();