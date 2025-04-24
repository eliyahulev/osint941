import dotenv from "dotenv";
import { config } from "./config/conf.js";
import { createTelegramClient } from "./src/services/telegram-client.js";
import { logger } from "./src/utils/logger.js";
import { monitorChannels } from "./src/services/channel-monitor.js";
import {
  handleGroupCommand,
  listGroups,
} from "./src/services/channel-manager.js";

const runOsint = async () => {
  // Load environment variables
  dotenv.config();

  try {
    // Create Telegram client
    const client = await createTelegramClient(logger);

    // Register command handlers
    client.addEventHandler(async (event) => {
      if (event.message?.message?.startsWith("/group")) {
        await handleGroupCommand(client, event.message, event.message.message);
      } else if (event.message?.message === "/groups") {
        await listGroups(client, event.message);
      }
    });

    // Start monitoring channels
    await monitorChannels(client, logger, config);
    logger.info("Osint started successfully");

    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    logger.error("Error starting Osint:", error);
    process.exit(1);
  }
};

runOsint();
