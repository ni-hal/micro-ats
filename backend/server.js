require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`)))
    .catch((err) => {
      console.error("[server] unable to start:", err.message);
      process.exitCode = 1;
    });
}

module.exports = app;
