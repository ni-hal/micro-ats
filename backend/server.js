require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { requireAuth } = require("./middleware/auth");

const authRoutes = require("./routes/auth");
const scheduleRoutes = require("./routes/schedule");
const candidateRoutes = require("./routes/candidates");
const interviewerRoutes = require("./routes/interviewers");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true, service: "micro-ats-backend" }));

app.use("/api/auth", authRoutes);

// Everything below requires a valid Bearer token.
app.use("/api/schedule", requireAuth, scheduleRoutes);
app.use("/api/candidates", requireAuth, candidateRoutes);
app.use("/api/interviewers", requireAuth, interviewerRoutes);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: "Route not found." }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
});

module.exports = app;
