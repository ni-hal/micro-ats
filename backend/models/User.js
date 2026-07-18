const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User
 * Deliberately minimal — this is "simple authentication" for an internal
 * recruiting tool, not a multi-tenant identity system. One flat collection
 * of recruiter/coordinator accounts, password hashed with bcrypt.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10);
};

module.exports = mongoose.model("User", userSchema);
