const authService = require("../services/auth.service");

register = async (req, res, next) => {
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

    const user = await authService.register({ name, email, password });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

login = async (req, res, next) => {
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
