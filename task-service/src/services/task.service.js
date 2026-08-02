const tasksStore = require("../store/tasks.store");

function getTasksList(userId) {
  return tasksStore.findAllByUser(userId); // or empty list
}

function getTask(id, userId) {
  const task = tasksStore.findById(id);
  if (!task || task.userId !== userId) {
    const err = new Error("Task was not found!");
    err.status = 404;
    err.code = "NOT_FOUND";
    throw err;
  }
  return task;
}

function createTask(userId, { title }) {
  if (!title || !title.trim()) {
    const err = new Error("Task title is necessary!");
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  return tasksStore.create({ userId, title });
}

function updateTask(id, userId, patch) {
  const task = getTask(id, userId);
  return tasksStore.update(task.id, patch);
}

function deleteTask(id, userId) {
  const task = getTask(id, userId);
  return tasksStore.remove(task.id);
}

module.exports = { getTasksList, getTask, createTask, updateTask, deleteTask };
