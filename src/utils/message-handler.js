import { createTextProcessor } from "./text-processor.js";
import { filterMessageByKeywords } from "./filter-messages.js";
import fs from "fs/promises";
import path from "path";

export const createMessageHandler = (logger, config) => {
  // Store message content instead of just IDs
  const processedMessages = new Map(); // Map of message content to timestamp
  const processedMessagesFile = path.join(
    process.cwd(),
    "data",
    "processed-messages.json"
  );

  // Load previously processed messages on startup
  const loadProcessedMessages = async () => {
    try {
      await fs.mkdir(path.dirname(processedMessagesFile), { recursive: true });
      const data = await fs.readFile(processedMessagesFile, "utf-8");
      const messages = JSON.parse(data);
      messages.forEach(({ content, timestamp }) => {
        processedMessages.set(content, timestamp);
      });
      logger.info(`Loaded ${messages.length} previously processed messages`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        logger.error("Error loading processed messages:", error);
      }
    }
  };

  // Save processed messages periodically
  const saveProcessedMessages = async () => {
    try {
      const messages = Array.from(processedMessages.entries()).map(
        ([content, timestamp]) => ({
          content,
          timestamp,
        })
      );
      await fs.writeFile(
        processedMessagesFile,
        JSON.stringify(messages, null, 2)
      );
      logger.debug(`Saved ${messages.length} processed messages to disk`);
    } catch (error) {
      logger.error("Error saving processed messages:", error);
    }
  };

  // Initialize by loading previous messages
  loadProcessedMessages();

  // Save messages every 5 minutes
  setInterval(saveProcessedMessages, 5 * 60 * 1000);

  const getChannelInfo = (channelUsername) => {
    return config.targetChannels[channelUsername] || null;
  };

  // Function to normalize message content for comparison
  const normalizeMessage = (message) => {
    return message.trim().toLowerCase().replace(/\s+/g, " "); // Normalize whitespace
  };

  return async (message, channelUsername, client) => {
    // First check for duplicate message before any processing
    const normalizedContent = normalizeMessage(message.message);
    const currentTime = Date.now();

    // Check if we've seen this exact message content before
    if (processedMessages.has(normalizedContent)) {
      const previousTime = processedMessages.get(normalizedContent);
      const timeDiff = currentTime - previousTime;

      // If the message is older than our cache timeout, we can process it again
      if (timeDiff > config.messageCacheTimeout) {
        processedMessages.delete(normalizedContent);
      } else {
        logger.debug("Skipping duplicate message content", {
          content: normalizedContent,
          timeSinceLastSeen: `${Math.round(timeDiff / 1000)}s`,
        });
        return;
      }
    }

    // Store the message content with current timestamp
    processedMessages.set(normalizedContent, currentTime);

    // Set up cleanup for this message
    setTimeout(() => {
      processedMessages.delete(normalizedContent);
      // Save after removing from cache
      saveProcessedMessages();
    }, config.messageCacheTimeout);

    // Now check for keywords after we know it's not a duplicate
    const foundKeywords = filterMessageByKeywords(message, config, logger);
    if (!foundKeywords) {
      return;
    }

    try {
      const processedText = await createTextProcessor(message.message);
      const messageLink = `https://t.me/${channelUsername}/${message.id}`;
      const processedTextReversed = processedText.split("").reverse().join("");

      // Determine which output channel to use
      const channelInfo = getChannelInfo(channelUsername);
      if (!channelInfo) {
        logger.warn(`Unknown channel type for ${channelUsername}`);
        return;
      }

      const outputChannelId = config.outputChannels[channelInfo.region];
      if (!outputChannelId) {
        logger.warn(`No output channel configured for ${channelInfo.region}`);
        return;
      }

      // Format the keyword matches for display
      const keywordMatches = foundKeywords
        .map(({ arabic, hebrew }) => `${arabic} ❯ ${hebrew}`)
        .join("\n");

      // Create a formatted message with all the required information
      const formattedMessage = `${processedText}\n\n<b>📢 ערוץ:</b> <code>@${channelUsername}</code>\n<b>📍 אזור:</b> <code>${channelInfo.area}</code>\n<b>📝 מילות מפתח:</b>\n${keywordMatches}\n\n<b>🔗 הודעה מקורית:</b> <a href="${messageLink}">${messageLink}</a>`;

      //Send processed message to the appropriate channel
      await client.sendMessage(outputChannelId, {
        message: formattedMessage,
        parseMode: "html",
      });

      // Log the combined message with region and keywords
      logger.info(
        `Message from ${channelInfo.region.toUpperCase()} region. Found keyword matches: ${keywordMatches}`
      );
      logger.verbose(
        `Message from ${channelInfo.region.toUpperCase()} region:\n${processedTextReversed}`
      );
      logger.info("Message processed successfully", {
        messageId: message.id,
        channelUsername,
        channelType: channelInfo.region.toUpperCase(),
        processedText,
      });
    } catch (error) {
      logger.error("Error processing message", {
        error,
        messageId: message.id,
        channelUsername,
        channelType:
          getChannelInfo(channelUsername)?.region.toUpperCase() || "UNKNOWN",
      });
    }
  };
};
