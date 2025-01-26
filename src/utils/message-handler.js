import { createTextProcessor } from './text-processor.js';
import { filterMessageByKeywords } from './filter-messages.js';


export const createMessageHandler = (logger, config) => {
    const processedMessages = new Set();

    const createMessageId = (message, channelUsername) =>
        `${channelUsername}_${message.id}_${message.date}`;

    return async (message, channelUsername, client) => {

        // Filter messages by keywords and exclude keywords
        if (!filterMessageByKeywords(message, config, logger)) {
            return
        }

        const messageId = createMessageId(message, channelUsername);
        // Prevent duplicate processing
        if (processedMessages.has(messageId)) {
            logger.debug('Skipping duplicate message');
            return;
        }

        // Cache message processing
        processedMessages.add(messageId);
        setTimeout(() => processedMessages.delete(messageId), config.messageCacheTimeout);

        try {
            const processedText = await createTextProcessor(message.message);

            const messageLink = `https://t.me/${channelUsername}/${message.id}`;
            const processedTextReversed = processedText.split('').reverse().join('');

            //Send processed message
            await client.sendMessage(config.outputChannelId, {
                message: `${processedText}\n\n🔗 Original: ${messageLink}`
            });

            logger.verbose(`Message:\n${processedTextReversed}\n\n🔗 Original: \n${messageLink}`);
            logger.info('Message processed successfully', {
                messageId: message.id,
                channelUsername,
                processedText
            });
        } catch (error) {
            logger.error('Error processing message', {
                error,
                messageId: message.id,
                channelUsername
            });
        }
    };
};