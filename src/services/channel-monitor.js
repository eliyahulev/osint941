import { createMessageHandler } from "../utils/message-handler.js";
import { validateChannels } from "../utils/channel-validator.js";

export const monitorChannels = async (client, logger, config) => {
  try {
    // Validate channels and get only those that exist
    const channels = await validateChannels(client, logger, config);

    if (channels.length === 0) {
      logger.warn("No valid channels found. Monitoring will not start.");
      return;
    }

    const processMessage = createMessageHandler(logger, config);

    // Single event handler
    const eventHandler = async (event) => {
      if (event.message?.peerId) {
        const channel = channels.find(
          (c) => c.id.value === event.message.peerId.channelId.value
        );
        if (channel) {
          await processMessage(event.message, channel.username, client);
        }
      }
    };

    // Register event handler
    client.addEventHandler(eventHandler);
    logger.info("Started monitoring channels", {
      channels: channels.map((c) => c.username),
    });
  } catch (error) {
    logger.error("Channel monitoring setup failed", error);
    throw error;
  }
};
