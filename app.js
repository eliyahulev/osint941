import dotenv from 'dotenv';
import { config } from './config/conf.js';
import { createTelegramClient } from './src/services/telegram-client.js';
import { logger } from './src/utils/logger.js';
import { monitorChannels } from './src/services/channel-monitor.js';

const runOsint = async () => {

    // Load environment variables
    dotenv.config();

    try {
        // Create Telegram client
        const client = await createTelegramClient(logger);

        // Start monitoring channels
        await monitorChannels(client, logger, config);
        logger.info('UserBot started successfully');

        // Keep process alive
        await new Promise(() => { });
    } catch (error) {
        logger.error('Error starting userbot:', error);
        process.exit(1);
    }
}
runOsint();