const tokens = [];

function add({ tokenHash, userId, expiresAt }) {
  const token = { tokenHash, userId, expiresAt, revoked: false };
  tokens.push(token);
}

function findValid(tokenHash) {
  return tokens.find(
    (t) => t.tokenHash === tokenHash && !t.revoked && t.expiresAt > Date.now(),
  );
}

function revoke(tokenHash) {
  const token = tokens.find((t) => t.tokenHash === tokenHash);
  if (token) {
    token.revoked = true;
    return true;
  }
  return false;
}

module.exports = { add, findValid, revoke };
