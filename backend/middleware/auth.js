const jwt = require("jsonwebtoken");

/**
 * requireAuth
 * Expects `Authorization: Bearer <token>`. Verifies the JWT signed at
 * login and attaches { id, username } to req.user. No sessions, no
 * refresh tokens — deliberately simple for an internal tool.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or malformed Authorization header." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = { requireAuth };
