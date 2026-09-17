const authService = require('../services/auth.service');

async function login(req, res) {
  const result = await authService.login(req.body);
  res.json(result);
}

async function profile(req, res) {
  // req.user do middleware auth gắn vào
  const user = await authService.getProfile(req.user.user_id);
  res.json(user);
}

module.exports = { login, profile };
