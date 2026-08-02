const tasks = [];
let ID = 1;

function findAllByUser(userId) {
  return tasks.filter((t) => {
    return t.userId === userId;
  });
}

function findById(taskId) {
  return tasks.find((t) => {
    return t.id === taskId;
  });
}

function create({ userId, title }) {
  const task = {
    id: ID++,
    title,
    userId,
    done: false,
    createdAt: new Date().toISOString,
  };
  tasks.push(task);
  return task;
}

function update(taskID, patch) {
  const task = findById(taskID);
  if (!task) return null;
  Object.assign(task, patch);
  return task;
}

function remove(taskID) {
  const index = tasks.findIndex((t) => {
    return t.id === taskID;
  });
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

module.exports = { findAllByUser, findById, create, update, remove };
