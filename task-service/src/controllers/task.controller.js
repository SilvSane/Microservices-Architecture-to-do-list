const tasksService = require("../services/task.service");

function getUserId(req) {
  //const userId = req.user.id; // JWT middleware
  const userId = req.header("x-user-id") || 1; //test
  return Number(userId);
}

function getOne(req, res, next) {
  try {
    const userId = getUserId(req);
    const taskId = Number(req.params.id);
    const task = tasksService.getTask(taskId, userId);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

function getList(req, res, next) {
  try {
    const userId = getUserId(req);
    res.json(tasksService.getTasksList(userId));
  } catch (err) {
    next(err);
  }
}

function create(req, res, next) {
  try {
    const userId = getUserId(req);
    const task = tasksService.createTask(userId, req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

function update(req, res, next) {
  try {
    const userId = getUserId(req);
    const taskId = Number(req.params.id);
    res.json(tasksService.updateTask(taskId, userId, req.body));
  } catch (err) {
    next(err);
  }
}

function remove(req, res, next) {
  try {
    const userId = getUserId(req);
    const taskId = Number(req.params.id);
    tasksService.deleteTask(taskId, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getList, getOne, create, update, remove };
