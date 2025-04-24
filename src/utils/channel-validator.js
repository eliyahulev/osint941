/**
 * Validates channels and returns only those that exist
 * @param {Object} client - Telegram client instance
 * @param {Object} logger - Logger instance
 * @param {Object} config - Application configuration
 * @returns {Promise<Array>} - Array of valid channel entities
 */
export const validateChannels = async (client, logger, config) => {
  const channelUsernames = Object.keys(config.targetChannels);
  const validChannels = [];
  const invalidChannels = [];

  logger.info(`Validating ${channelUsernames.length} channels...`);

  for (const username of channelUsernames) {
    try {
      const channel = await client.getEntity(username);
      validChannels.push(channel);
      logger.debug(
        `Channel @${username} (${config.targetChannels[
          username
        ].region.toLocaleUpperCase()}) is valid`
      );
    } catch (error) {
      invalidChannels.push(username);
      logger.warn(
        `Channel @${username} (${config.targetChannels[username].area} - ${config.targetChannels[username].region}) does not exist or is not accessible: ${error.message}`
      );
    }
  }

  if (invalidChannels.length > 0) {
    logger.warn(
      `Ignoring ${invalidChannels.length} invalid channels: ${invalidChannels
        .map(
          (username) =>
            `@${username} (${config.targetChannels[username].area} - ${config.targetChannels[username].region})`
        )
        .join(", ")}`
    );
  }

  logger.info(
    `Found ${validChannels.length} valid channels out of ${channelUsernames.length}`
  );
  return validChannels;
};
