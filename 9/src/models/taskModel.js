const { v4: uuidv4 } = require("uuid");

const tasks = [];

function getAll() {
  return tasks;
}

function findById(id) {
  return tasks.find((t) => t.id === id);
}

function create({ title, description, dueDate }) {
  const task = {
    id: uuidv4(),
    title: title.trim(),
    description: description || null,
    createdAt: new Date().toISOString(),
    dueDate: dueDate || null,
    completedAt: null,
  };
  tasks.push(task);
  return task;
}

function replace(id, { title, description, dueDate }) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], title: title.trim(), description: description || null, dueDate: dueDate || null };
  return tasks[idx];
}

function markDone(id) {
  const task = findById(id);
  if (!task) return null;
  task.completedAt = new Date().toISOString();
  return task;
}

function remove(id) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
}

module.exports = { getAll, findById, create, replace, markDone, remove };
