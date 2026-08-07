const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userStore = require("../store/users.store");

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

async function register({ email, password, name }) {
  if (userStore.findByEmail(email)) {
    const err = new Error("User with such email already exists!");
    err.status = 409; //Conflict
    err.code = "USER_EXISTS";
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = userStore.create({ email, passwordHash, name }); //add to DB (create method)
  const token = signToken(user);
  return { user: { id: user.id, email: user.email, name: user.name }, token }; // return to client
}

async function login({ email, password }) {
  const user = userStore.findByEmail(email);

  if (!user) {
    const err = new Error("Uncorrect login or password!");
    err.status = 401;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    const err = new Error("Uncorrect login or password!");
    err.status = 401;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  const token = signToken(user);
  return { token };
}

module.exports = { register, login };
