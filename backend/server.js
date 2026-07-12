require("dotenv").config();

const app = require("./app");
const { connectDB, disconnectDB } = require("./config/db");

const PORT = process.env.PORT || 8080;

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not set. Add it to your environment before starting the server.");
  process.exit(1);
}

let server;

async function start() {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`🚀 TransitOps Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

start();
