const jwt = require("jsonwebtoken");
const User = require("../models/User");

function authResponse(user) {
  const token = jwt.sign(
    { sub: user._id.toString(), username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
  return { token, user: { id: user._id, name: user.name, username: user.username } };
}

// POST /api/auth/login  { username, password }
async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required." });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    // Same generic error whether the user is missing or the password is
    // wrong, so login doesn't leak which usernames exist.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    return res.json(authResponse(user));
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

// GET /api/auth/me — lets the frontend verify a stored token is still valid on load
async function me(req, res) {
  return res.json({ user: req.user });
}

async function register(req, res) {
  try {
    const name = req.body.name?.trim();
    const username = req.body.username?.toLowerCase().trim();
    const { password } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ error: "name, username, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    if (await User.exists({ username })) {
      return res.status(409).json({ error: "That username is already in use." });
    }
    const user = await User.create({
      name,
      username,
      passwordHash: await User.hashPassword(password),
    });
    return res.status(201).json(authResponse(user));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "That username is already in use." });
    console.error("[POST /api/auth/register]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = { login, register, me };
