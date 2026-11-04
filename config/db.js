const mongoose = require("mongoose");

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/skillnest";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
