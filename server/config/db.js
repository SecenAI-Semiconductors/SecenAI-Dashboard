const dns = require("dns");
const mongoose = require("mongoose");

// Use Google DNS to resolve MongoDB SRV records
// (local router DNS fails SRV lookups in Node.js)
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `MongoDB Connected: ${conn.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB Connection Error:");
    console.error(error);

    process.exit(1);
  }
};

module.exports = connectDB;