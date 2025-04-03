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
                1. Translate the Arabic text to Hebrew
                2. Condense the translation to ${maxMessageLength} characters or less
                3. Preserve critical details about locations, numbers, events and timing
                4. Use clear, journalistic Hebrew writing style
                5. Maintain factual accuracy without editorializing
                6. Keep proper names and place names unchanged
                7. Use Hebrew date formats and numbers`,
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
