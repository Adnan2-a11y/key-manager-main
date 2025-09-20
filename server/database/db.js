const mongoose = require("mongoose");
// const MSGTrack = require("./messageTrackerDB");

const dbURI = process.env.MONGO_URI;

async function connectDB() {
  try {
    await mongoose.connect(dbURI);
    // await MSGTrack.syncIndexes();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = connectDB;
