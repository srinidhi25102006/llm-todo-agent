let tasks = [];
let nextId=1;
export function createTask(title, dueDate = null) {
  const task = { id: nextId++, title, dueDate, completed: false };
  tasks.push(task);
  return task;
}
export function listTasks() {
  return tasks;
}

export function completeTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  task.completed = true;
  return task;
}

export function deleteTask(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}