import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();

const OPENAI_API_KEY = process.env.TELEGRAM_API_ID;
const TELEGRAM_API_HASH = process.env.TELEGRAM_API_HASH;
const TELEGRAM_SESSION = process.env.TELEGRAM_SESSION;

if (!OPENAI_API_KEY || !TELEGRAM_API_HASH || !TELEGRAM_SESSION) {
  console.error(
    "Please set TELEGRAM_API_ID, TELEGRAM_API_HASH, and TELEGRAM_SESSION_STRING in your .env file"
  );
  process.exit(1);
}

async function getChannels() {
  const client = new TelegramClient(
    new StringSession(TELEGRAM_SESSION),
    parseInt(OPENAI_API_KEY),
    TELEGRAM_API_HASH,
    { connectionRetries: 5 }
  );

  try {
    await client.connect();
    console.log("Connected to Telegram");

    // Get all dialogs (chats, channels, groups)
    const dialogs = await client.getDialogs();

    // Debug: Log the first dialog to see its structure
    if (dialogs.length > 0) {
      const safeDialog = {
        id: dialogs[0].id,
        title: dialogs[0].title,
        username: dialogs[0].username,
        folder: dialogs[0].folder,
        category: dialogs[0].category,
        folderId: dialogs[0].folderId,
        isChannel: dialogs[0].isChannel,
        participantsCount: dialogs[0].participantsCount,
        entity: dialogs[0].entity
          ? {
              id: dialogs[0].entity.id,
              username: dialogs[0].entity.username,
              title: dialogs[0].entity.title,
            }
          : null,
      };
      console.log(
        "Sample dialog structure:",
        JSON.stringify(safeDialog, null, 2)
      );
    }

    // Filter only channels and organize by folder
    const channelsByFolder = {};

    for (const dialog of dialogs) {
      if (dialog.isChannel) {
        // Try different ways to get folder information
        const folder =
          dialog.folder?.title ||
          dialog.category?.title ||
          dialog.folderId?.toString() ||
          "No Folder";

        if (!channelsByFolder[folder]) {
          channelsByFolder[folder] = [];
        }

        // Debug logging
        console.log("Channel details:", {
          title: dialog.title,
          username: dialog.username,
          entity: dialog.entity?.username,
          folder: folder,
          rawFolder: dialog.folder
            ? {
                id: dialog.folder.id,
                title: dialog.folder.title,
              }
            : null,
          category: dialog.category
            ? {
                id: dialog.category.id,
                title: dialog.category.title,
              }
            : null,
          folderId: dialog.folderId,
        });

        channelsByFolder[folder].push({
          id: dialog.id,
          title: dialog.title,
          username: dialog.entity?.username || dialog.username || "No username",
          participantsCount: dialog.participantsCount || "Unknown",
          url:
            dialog.entity?.username || dialog.username
              ? `https://t.me/${dialog.entity?.username || dialog.username}`
              : null,
        });
      }
    }

    // Sort folders alphabetically
    const sortedChannelsByFolder = Object.fromEntries(
      Object.entries(channelsByFolder).sort(([a], [b]) => a.localeCompare(b))
    );

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), "output");
    await fs.mkdir(outputDir, { recursive: true });

    // Save to JSON file
    const outputPath = path.join(outputDir, "channels.json");
    await fs.writeFile(
      outputPath,
      JSON.stringify(sortedChannelsByFolder, null, 2),
      "utf-8"
    );

    console.log(`Channels saved to ${outputPath}`);

    // Print summary
    console.log("\nChannels by folder:");
    let totalChannels = 0;
    for (const [folder, channels] of Object.entries(sortedChannelsByFolder)) {
      totalChannels += channels.length;
      console.log(`\n${folder} (${channels.length} channels):`);
      channels.forEach((channel) => {
        console.log(`- ${channel.title} (@${channel.username})`);
      });
    }
    console.log(`\nTotal channels: ${totalChannels}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.disconnect();
  }
}

getChannels().catch(console.error);
