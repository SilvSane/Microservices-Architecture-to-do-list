require("dotenv").config();

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === "production";

//like zod, envalid:
function required(varName) {
  const value = process.env[varName];
  if (!value) {
    if (isProd) {
      throw new Error("Missing required environment variable!");
    }
    console.warn(`${varName} not specified, using dev falback!`);
  }
  return value;
}

const refreshExpires = { ms: 7 * 24 * 60 * 60 * 1000, str: "7d" };

module.exports = {
  jwt: {
    accessSecret: required("ACCESS_JWT_SECRET") || "access-jwt-secret-fb",
    refreshSecret: required("REFRESH_JWT_SECRET") || "refresh-jwt-secret-fb",
    accessExpiresIn: "15m",
    refreshExpiresIn: refreshExpires.str,
    refreshExpiresInMs: refreshExpires.ms,
  },

  refCookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: refreshExpires.ms,
  },
};
