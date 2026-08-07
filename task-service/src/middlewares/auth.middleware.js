const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer"))
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Token not found",
      },
    });

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired token",
      },
    });
  }
}

module.exports = requireAuth;
