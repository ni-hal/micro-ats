const mongoose = require("mongoose");

let connectionPromise;

function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/micro_ats";
  connectionPromise = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 10_000 })
    .then((connection) => {
      console.log("[db] connected");
      return connection;
    })
    .catch((err) => {
      connectionPromise = undefined;
      throw err;
    });

  return connectionPromise;
}

module.exports = connectDB;
