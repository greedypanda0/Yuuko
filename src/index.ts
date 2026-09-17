import { configDotenv } from "dotenv";
import { BotClient } from "./client/client.js";

configDotenv();
const client = new BotClient();

client.run();

// Error Handling
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
