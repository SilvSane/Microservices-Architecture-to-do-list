const authService = require("../services/auth.service");
const cfg = require("../config/config");

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

    const { user, refreshToken, accessToken } = await authService.register({
      name,
      email,
      password,
    });

    res.cookie("refreshToken", refreshToken, cfg.refCookie);

    res.status(201).json({ user, accessToken });
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

    const { accessToken, refreshToken } = await authService.login({
      email,
      password,
    });

    res.cookie("refreshToken", refreshToken, cfg.refCookie);

    res.json({ accessToken });
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
    if (refreshToken) authService.logout(refreshToken);

    res.clearCookie("refreshToken", cfg.refCookie);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout };
