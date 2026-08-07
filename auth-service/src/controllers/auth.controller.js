const authService = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        error: {
          code: "VALIDATION ERROR",
          message: "Name, email, password are necessary!",
        },
      });
    }

    const result = await authService.register({ name, email, password });
    //result = {user: {}, token: token}
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: "VALIDATION ERROR",
          message: "Email and password are necessary!",
        },
      });
    }

    const profile = await authService.login({ email, password });
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
