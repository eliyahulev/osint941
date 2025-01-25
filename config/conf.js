import dotenv from 'dotenv';
dotenv.config();

import { channels } from '../src/services/channels.js';
import { keywords } from '../src/services/keywords.js';

export const config = {
    targetChannels: channels['harhevron'],
    keywords: keywords,
    outputChannelId: process.env.OUTPUT_CHANNEL_ID,
    maxMessageLength: 500,
    messageCacheTimeout: 10 * 60 * 1000, // 10 minutes,
    apiKey: process.env.OPENAI_API_KEY
};