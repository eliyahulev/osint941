import dotenv from 'dotenv';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import input from 'input';
import { config } from './config/conf.js';
import { logger } from './src/utils/logger.js';
import { textProcessor } from './src/utils/textProcessor.js';

dotenv.config();





// Telegram client configuration
const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || '');

// Message deduplication cache
const processedMessages = new Set();

const containsKeywords = (text) => {
    return config.keywords.some(keyword =>
        text.toLowerCase().includes(keyword.toLowerCase())
    );
}

const createMessageId = (message, channelUsername) => {
    return `${channelUsername}_${message.id}_${message.date}`;
}

const processMessage = async (message, channelUsername, client) => {
    console.log(message.message);
    // Check if message contains keywords
    if (!containsKeywords(message.message)) {
        console.log(`${message.message} does not contain keywords`);
        return;
    }
    try {
        const messageId = createMessageId(message, channelUsername);

        // Check if message was already processed
        if (processedMessages.has(messageId)) {
            console.log('Skipping duplicate message:', messageId);
            return;
        }

        // Add message to processed set with timeout for cleanup
        processedMessages.add(messageId);
        setTimeout(() => {
            processedMessages.delete(messageId);
        }, config.messageCacheTimeout);



        const processedText = await textProcessor(message.message);
        const messageLink = `https://t.me/${channelUsername}/${message.id}`;
        const processedTextReversed = processedText.split('').reverse().join('');

        // Send translated message
        await client.sendMessage(config.outputChannelId, {
            message: `${processedText}\n\n🔗 Original: ${messageLink}`
        });
        // show the current time
        const date = new Date().toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' });
        const time = new Date().toLocaleTimeString('he-IL', { timeZone: 'Asia/Jerusalem' });
        console.log(`${date} --- ${time}`);
        console.log(`Message:\n${processedTextReversed}\n\n🔗 Original: \n${messageLink}`);

        logger.info('Message processed successfully', {
            messageId: message.id,
            channelUsername
        });
    } catch (error) {
        console.log('Error processing message:', error);
        logger.error('Error processing message:', {
            error,
            messageId: message.id,
            channelUsername
        });
    }
}

const monitorChannels = async (client) => {
    try {

        // Get channel entities
        const channels = await Promise.all(
            config.targetChannels.map(username =>
                client.getEntity(username)
            )
        );

        // Single event handler registration
        const eventHandler = async (event) => {
            if (event.message && event.message.peerId) {
                const channel = channels.find(c =>
                    c.id.value === event.message.peerId.channelId.value
                );
                if (channel) {
                    await processMessage(event.message, channel.username, client);
                }
            }
        };

        // Register event handler only once
        client.addEventHandler(eventHandler);

        logger.info('Started monitoring channels:', config.targetChannels);
    } catch (error) {
        logger.error('Error setting up channel monitoring:', error);
        throw error;
    }
}

const main = async () => {
    try {
        // Initialize client
        const client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
        });


        // Start client
        await client.start({
            phoneNumber: async () => await input.text('Please enter your phone number: '),
            password: async () => await input.text('Please enter your password: '),
            phoneCode: async () => await input.text('Please enter the code you received: '),
            onError: (err) => logger.error('Connection error:', err),
        });
        //console.log('Session number:', client.session.save());

        await monitorChannels(client);
        logger.info('UserBot started successfully');

        // Keep the process running
        await new Promise((resolve) => { });
    } catch (error) {
        logger.error('Error starting userbot:', error);
        process.exit(1);
    }
}
main();