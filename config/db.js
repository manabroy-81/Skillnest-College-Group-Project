const mongoose = require("mongoose");

const LOCAL_MONGO_URL = "mongodb://127.0.0.1:27017/skillnest";
let connectionPromise;

const getMongoUrl = () => {
  if (process.env.MONGO_URL) return process.env.MONGO_URL;

  // A Vercel Function cannot reach a local MongoDB process. Failing with this
  // message is much clearer than buffering database operations until timeout.
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    throw new Error(
      "MONGO_URL is not configured. Add your MongoDB Atlas connection string to Vercel's Environment Variables.",
    );
  }

  return LOCAL_MONGO_URL;
};

const connectDB = () => {
  if (mongoose.connection.readyState === 1)
    return Promise.resolve(mongoose.connection);

  if (connectionPromise) return connectionPromise;

  try {
    connectionPromise = mongoose
      .connect(getMongoUrl(), { serverSelectionTimeoutMS: 10000 })
      .then(() => {
        console.log("MongoDB connected successfully");
        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error("MongoDB connection error:", error.message);
        throw error;
      });
  } catch (error) {
    return Promise.reject(error);
  }

  return connectionPromise;
};

module.exports = connectDB;
module.exports.getMongoUrl = getMongoUrl;
