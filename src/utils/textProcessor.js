
import { OpenAI } from 'openai';
import { logger } from './logger.js';
import { config } from '../../config/conf.js';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: config.apiKey
});

export const textProcessor = async (text, maxMessageLength = 150) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{
                role: "system",
                content: `Translate the following text to Hebrew and shorten it to a maximum of ${maxMessageLength} characters while preserving the key information.`
            }, {
                role: "user",
                content: text
            }],
            max_tokens: maxMessageLength
        });

        return response.choices[0].message.content;
    } catch (error) {
        logger.error('Error in text processing:', error);
        throw error;
    }
};