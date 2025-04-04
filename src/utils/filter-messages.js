const fuzzyMatch = (text, keyword, threshold = 0.8) => {
  // Convert to lowercase for case-insensitive matching
  text = text.toLowerCase();
  keyword = keyword.toLowerCase();

  // If exact match, return true
  if (text.includes(keyword)) {
    return true;
  }

  // Split text into words
  const words = text.split(/\s+/);

  // Check each word for fuzzy match
  for (const word of words) {
    // Calculate Levenshtein distance
    const distance = levenshteinDistance(word, keyword);
    const similarity = 1 - distance / Math.max(word.length, keyword.length);

    if (similarity >= threshold) {
      return true;
    }
  }

  return false;
};

// Levenshtein distance implementation
const levenshteinDistance = (str1, str2) => {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1)
    .fill()
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // substitution
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1 // insertion
        );
      }
    }
  }

  return dp[m][n];
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
    logger.silly('Message does not contain keywords');
    return false;
  }

  // Skip messages with excluded keywords
  if (
    config.excludeKeywords &&
    config.excludeKeywords.some((keyword) =>
      message.message.toLowerCase().includes(keyword.toLowerCase())
    )
  ) {
    logger.silly('Message contains excluded keywords');
    return false;
  }

  return foundKeywords;
};
