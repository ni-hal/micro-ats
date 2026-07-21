require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const app = require("../app");
const connectDB = require("../config/db");

module.exports = async (req, res) => {
  // Keep a lightweight deployment check available even if MongoDB is down.
  if (req.url === "/api/health" || req.url === "/api/health/") return app(req, res);

  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error("[db] connection failed:", err.message);
    return res.status(503).json({ error: "Database unavailable. Check MONGO_URI in Vercel." });
  }
};
