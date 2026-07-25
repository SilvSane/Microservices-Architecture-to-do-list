const users = [];
let ID = 1;

function create({ id, email, passwordHash, name }) {
  const user = {
    id: ID++,
    email,
    passwordHash,
    name,
  };
  users.push(user);
  return user;
}

function findById(id) {
  return users.find((u) => id === u.id);
}

function findByEmail(mail) {
  return users.find((u) => mail === u.email);
}

module.exports = { create, findById, findByEmail };
