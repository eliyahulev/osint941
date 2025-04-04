import { createTextProcessor } from './text-processor.js';
import { filterMessageByKeywords } from './filter-messages.js';

export const createMessageHandler = (logger, config) => {
  const processedMessages = new Set();

  const createMessageId = (message, channelUsername) =>
    `${channelUsername}_${message.id}_${message.date}`;

  const getChannelInfo = (channelUsername) => {
    return config.targetChannels[channelUsername] || null;
  };

  return async (message, channelUsername, client) => {
    // Filter messages by keywords and exclude keywords
    const foundKeywords = filterMessageByKeywords(message, config, logger);
    if (!foundKeywords) {
      return;
    }

    const messageId = createMessageId(message, channelUsername);
    logger.debug(`Generated message ID: ${messageId}`);
    // Prevent duplicate processing
    if (processedMessages.has(messageId)) {
      logger.debug('Skipping duplicate message');
      return;
    }

    // Cache message processing
    processedMessages.add(messageId);
    setTimeout(
      () => processedMessages.delete(messageId),
      config.messageCacheTimeout
    );

    try {
      const processedText = await createTextProcessor(message.message);
      const messageLink = `https://t.me/${channelUsername}/${message.id}`;
      const processedTextReversed = processedText.split('').reverse().join('');

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
        .map(({ arabic, hebrew }) => `<b>${arabic}</b> ❯ <b>${hebrew}</b>`)
        .join('\n');

      // Create a formatted message with all the required information
      const formattedMessage = `<b>📝 מילות מפתח:</b>\n${keywordMatches}\n\n<b>📢 ערוץ מקור:</b> <code>@${channelUsername}</code>\n<b>📍 אזור:</b> <code>${channelInfo.area}</code>\n\n<b>💬 הודעה מעובדת:</b>\n${processedText}\n\n<b>🔗 הודעה מקורית:</b> <a href="${messageLink}">${messageLink}</a>`;

      //Send processed message to the appropriate channel
      await client.sendMessage(outputChannelId, {
        message: formattedMessage,
        parseMode: 'html',
      });

      // Log the combined message with region and keywords
      logger.info(
        `Message from ${channelInfo.region.toUpperCase()} region. Found keyword matches: ${keywordMatches}`
      );
      logger.verbose(
        `Message from ${channelInfo.region.toUpperCase()} region:\n${processedTextReversed}`
      );
      logger.info('Message processed successfully', {
        messageId: message.id,
        channelUsername,
        channelType: channelInfo.region.toUpperCase(),
        processedText,
      });
    } catch (error) {
      logger.error('Error processing message', {
        error,
        messageId: message.id,
        channelUsername,
        channelType:
          getChannelInfo(channelUsername)?.region.toUpperCase() || 'UNKNOWN',
      });
    }
  };
};
