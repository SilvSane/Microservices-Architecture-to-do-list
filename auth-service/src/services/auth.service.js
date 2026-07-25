const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userStore = require("../store/users.store");

async function register({ email, password, name }) {
  if (userStore.findByEmail(email)) {
    const err = new Error("User with such email already exists!");
    err.status = 409; //Conflict
    err.code = "USER_EXISTS";
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = userStore.create({ email, passwordHash, name }); //add to DB (create method)
  return { id: user.id, email: user.email, name: user.name }; // return to client
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

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return { token };
}

module.exports = { register, login };
