import dotenv from 'dotenv';
import process from 'process';
import { targetChannels } from './channels.js';
import { keywords, excludeKeywords } from './keywords.js';

dotenv.config();

export const config = {
    keywords,
    excludeKeywords,
    targetChannels: targetChannels['harhevron'],
    outputChannelId: process.env.OUTPUT_CHANNEL_ID,
    maxMessageLength: 500,
    messageCacheTimeout: 10 * 60 * 1000, // 10 minutes,
    apiKey: process.env.OPENAI_API_KEY
};