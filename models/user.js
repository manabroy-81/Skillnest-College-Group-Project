const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  fullName: {
    type: String,
    trim: true,
    maxlength: 80,
    default: "",
  },

  passwordHash: {
    type: String,
    required: true,
    select: false,
  },

  profileImage: {
    type: String,
    default: null,
  },

  bannerImage: {
    type: String,
    default: null,
  },

  bio: {
    type: String,
    default: "",
  },

  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  following: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

userSchema.statics.hashPassword = function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) return reject(error);
      resolve(`${salt}:${key.toString("hex")}`);
    });
  });
};

userSchema.statics.verifyPassword = function verifyPassword(password, storedHash) {
  return new Promise((resolve, reject) => {
    const [salt, key] = (storedHash || "").split(":");
    if (!salt || !key) return resolve(false);
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      const storedKey = Buffer.from(key, "hex");
      resolve(storedKey.length === derivedKey.length && crypto.timingSafeEqual(storedKey, derivedKey));
    });
  });
};

module.exports = mongoose.model("User", userSchema);
