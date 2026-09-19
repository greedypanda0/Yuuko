import "dotenv/config";
import net from "node:net";
import { BotClient } from "./client/client.js";

net.setDefaultAutoSelectFamily(false);
const client = new BotClient();

client.run().catch((error: unknown) => {
  console.error("Unable to start Yuuko:", error);
  process.exitCode = 1;
});

// Error Handling
process.on("unhandledRejection", (reason: unknown) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error: unknown) => {
  console.error("Uncaught exception:", error);
  process.exitCode = 1;
});
