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
    //result = {user: {}, accessToken, refreshToken}
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

function refresh(req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    const tokenPair = authService.refAccessToken(refreshToken);

    res.cookie("refreshToken", tokenPair.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.json({ accessToken: tokenPair.accessToken });
  } catch (err) {
    next(err);
  }
}

function logout(req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    authService.logout(refreshToken);

    res.clearCookie("refreshToken");
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout };
