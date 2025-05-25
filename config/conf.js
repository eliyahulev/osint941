import dotenv from "dotenv";
import process from "process";
import { targetChannels } from "./channels.js";
import { keywords, excludeKeywords } from "./keywords.js";

dotenv.config();

// Create a flat object of all channel usernames with their areas
const allChannels = {};
Object.entries(targetChannels).forEach(([region, group]) => {
  if (group.active) {
    group.channels.forEach((channel) => {
      allChannels[channel.name] = { region, area: channel.area };
    });
  }
});

export const config = {
  keywords,
  excludeKeywords,
  targetChannels: allChannels,
  outputChannels: {
    yehuda: process.env.YEHUDA_OUTPUT_CHANNEL_ID,
    etzion: process.env.ETZION_OUTPUT_CHANNEL_ID,
    tulkarm: process.env.TULKARM_OUTPUT_CHANNEL_ID,
  },
  maxMessageLength: 500,
  messageCacheTimeout: 10 * 60 * 1000, // 10 minutes,
  apiKey: process.env.OPENAI_API_KEY,
};
