const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userStore = require("../store/users.store");
const refTokenStore = require("../store/refTokens.store");

const crypto = require("crypto");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex"); //64 char hash
}

function issueTokenPair(user) {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.ACCESS_JWT_SECRET,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    { sub: user.id },
    process.env.REFRESH_JWT_SECRET,
    { expiresIn: "7d" },
  );
  const expireTimeMs = Date.now() + 7 * 24 * 60 * 60 * 1000;

  refTokenStore.add({
    tokenHash: hashToken(refreshToken),
    userId: user.id,
    expiresAt: expireTimeMs,
  });

  return { accessToken, refreshToken };
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
  const { accessToken, refreshToken } = issueTokenPair(user);
  return {
    user: { id: user.id, email: user.email, name: user.name },
    accessToken,
    refreshToken,
  }; // return to client
}

async function login({ email, password }) {
  const user = userStore.findByEmail(email);

  if (!user) {
    const err = new Error("Incorrect login or password!");
    err.status = 401;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    const err = new Error("Incorrect login or password!");
    err.status = 401;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  return issueTokenPair(user);
}

function refAccessToken(currentRefToken) {
  let payload;
  try {
    payload = jwt.verify(currentRefToken, process.env.REFRESH_JWT_SECRET);
  } catch {
    const err = new Error("Invalid refresh token!");
    err.status = 401;
    err.code = "INVALID_REFRESH_TOKEN";
    throw err;
  }

  const refTokenHash = hashToken(currentRefToken);

  const record = refTokenStore.findValid(refTokenHash);

  if (!record) {
    const err = new Error("Invalid or revoked refresh token!");
    err.status = 401;
    err.code = "REVOKED_REFRESH_TOKEN";
    throw err;
  }

  const user = userStore.findById(payload.sub);
  if (!user) {
    const err = new Error("User not found!");
    err.status = 401;
    err.code = "USER_NOT_FOUND";
    throw err;
  }
  const tokenPair = issueTokenPair(user);

  refTokenStore.revoke(refTokenHash);

  return tokenPair;
}

function logout(refToken) {
  const refTokenHash = hashToken(refToken);
  refTokenStore.revoke(refTokenHash);
}

module.exports = { register, login, refAccessToken, logout };
