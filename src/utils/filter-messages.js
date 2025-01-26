

const containsKeywords = (text, keywords) =>
    keywords.some(keyword =>
        text.toLowerCase().includes(keyword.toLowerCase())
    );

export const filterMessageByKeywords = (message, config, logger) => {
    // Skip messages without keywords
    if (!containsKeywords(message.message, config.keywords)) {
        logger.silly(`Message does not contain keywords`);
        return false;
    }
    // Skip messages with excluded keywords
    if (config.excludeKeywords && containsKeywords(message.message, config.excludeKeywords)) {
        logger.silly(`Message contains excluded keywords`);
        return false;
    }
    return true;
}