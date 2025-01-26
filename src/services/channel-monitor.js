import { createMessageHandler } from '../utils/message-handler.js';


export const monitorChannels = async (client, logger, config) => {
    try {
        // Fetch channel entities
        const channels = await Promise.all(
            config.targetChannels.map(username => client.getEntity(username))
        );

        const processMessage = createMessageHandler(logger, config);

        // Single event handler
        const eventHandler = async (event) => {
            if (event.message?.peerId) {
                const channel = channels.find(c =>
                    c.id.value === event.message.peerId.channelId.value
                );
                if (channel) {
                    await processMessage(event.message, channel.username, client);
                }
            }
        };

        // Register event handler
        client.addEventHandler(eventHandler);
        logger.info('Started monitoring channels', {
            channels: config.targetChannels
        });
    } catch (error) {
        logger.error('Channel monitoring setup failed', error);
        throw error;
    }
};
