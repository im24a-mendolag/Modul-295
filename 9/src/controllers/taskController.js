const Task = require("../models/taskModel");

function getAll(req, res) {
  return res.status(200).json(Task.getAll());
}

function getOne(req, res) {
  const task = Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  return res.status(200).json(task);
}

function create(req, res) {
  const { title, description, dueDate } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "title is required and cannot be empty" });
  }
  return res.status(201).json(Task.create({ title, description, dueDate }));
}

function replace(req, res) {
  const { title, description, dueDate } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "title is required and cannot be empty" });
  }
  const task = Task.replace(req.params.id, { title, description, dueDate });
  if (!task) return res.status(404).json({ error: "Task not found" });
  return res.status(200).json(task);
}

function markDone(req, res) {
  const task = Task.markDone(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  return res.status(200).json(task);
}

function remove(req, res) {
  if (!Task.remove(req.params.id)) {
    return res.status(404).json({ error: "Task not found" });
  }
  return res.status(200).json({ message: "Task deleted" });
}

module.exports = { getAll, getOne, create, replace, markDone, remove };
