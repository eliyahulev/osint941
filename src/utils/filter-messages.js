import Fuse from "fuse.js";

const createFuse = (text) => {
  return new Fuse([text], {
    includeScore: true,
    threshold: 0.3, // Lower threshold means more strict matching
    location: 0,
    distance: 100,
    minMatchCharLength: 1,
  });
};

const fuzzyMatch = (text, keyword) => {
  const fuse = createFuse(text);
  const result = fuse.search(keyword);
  return result.length > 0;
};

const containsKeywords = (text, keywords) => {
  const foundKeywords = [];
  for (const [arabic, hebrew] of Object.entries(keywords)) {
    if (fuzzyMatch(text, arabic)) {
      foundKeywords.push({ arabic, hebrew });
    }
  }
  return foundKeywords;
};

export const filterMessageByKeywords = (message, config, logger) => {
  // Skip messages without keywords
  const foundKeywords = containsKeywords(message.message, config.keywords);
  if (foundKeywords.length === 0) {
    logger.silly("Message does not contain keywords");
    return false;
  }

  // Skip messages with excluded keywords
  if (
    config.excludeKeywords &&
    config.excludeKeywords.some((keyword) => {
      const containsKeyword = message.message
        .toLowerCase()
        .includes(keyword.toLowerCase());
      if (containsKeyword) {
        logger.silly(`Message contains excluded keyword: ${keyword}`);
      }
      return containsKeyword;
    })
  ) {
    return false;
  }

  return foundKeywords;
};
