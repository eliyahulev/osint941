const containsKeywords = (text, keywords) => {
  const foundKeywords = [];
  for (const [arabic, hebrew] of Object.entries(keywords)) {
    if (text.toLowerCase().includes(arabic.toLowerCase())) {
      foundKeywords.push({ arabic, hebrew });
    }
  }
  return foundKeywords;
};

export const filterMessageByKeywords = (message, config, logger) => {
  // Skip messages without keywords
  const foundKeywords = containsKeywords(message.message, config.keywords);
  if (foundKeywords.length === 0) {
    logger.silly(`Message does not contain keywords`);
    return false;
  }

  // Skip messages with excluded keywords
  if (
    config.excludeKeywords &&
    config.excludeKeywords.some((keyword) =>
      message.message.toLowerCase().includes(keyword.toLowerCase())
    )
  ) {
    logger.silly(`Message contains excluded keywords`);
    return false;
  }

  return foundKeywords;
};
