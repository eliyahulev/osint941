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
      model: "gpt-4o",

      messages: [
        {
          role: "system",
          role: "system",
          content: `You are a professional Arabic-to-Hebrew translator and summarizer. Your role is to:
          1. Translate Arabic text—including dialect, slang, or common Arabic—into clear, concise, high-quality journalistic Hebrew.
          2. Condense the result to no more than ${maxMessageLength} characters, while keeping essential facts: names, places, numbers, dates, events, and timing.
          3. Always produce a result, even if the input is very short, vague, or unclear.
          4. Use neutral and factual tone. Never add interpretation, exaggeration, or opinions.
          5. Maintain original names and place names as-is. Use standard Hebrew formats for dates and numbers.
          6. Do NOT reply with "I need more text", "I'm sorry", "please provide full content", or any similar fallback message.
          7. If the Arabic input is partial, colloquial, or incomplete—still do your best to translate and summarize meaningfully.
          8. You are expected to handle regional dialects and informal Arabic, even if the structure is imperfect or abbreviated.
          Your output must always be a high-quality, accurate, and concise Hebrew sentence.`,
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
