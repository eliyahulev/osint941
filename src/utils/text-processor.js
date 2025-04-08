import { OpenAI } from "openai";
import { logger } from "./logger.js";
import { config } from "../../config/conf.js";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: config.apiKey,
});

export const createTextProcessor = async (text, maxMessageLength = 200) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a skilled translator and summarizer. Your task is to:
              1. Translate Arabic text into clear, journalistic Hebrew.
              2. Condense the translation to no more than ${maxMessageLength} characters.
              3. Preserve essential information such as locations, numbers, events, and times.
              4. Maintain factual accuracy without adding opinions or interpretations.
              5. Keep all proper names and place names unchanged.
              6. Use standard Hebrew date and number formats.
              Make sure the translation is concise, accurate, and easy to understand.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: maxMessageLength,
    });

    return response.choices[0].message.content;
  } catch (error) {
    logger.error("Error in text processing:", error);
    throw error;
  }
};
