import dotenv from 'dotenv';
import chalk from 'chalk';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import input from 'input';
import { OpenAI } from 'openai';
import winston from 'winston';
import { keywords } from './keywords.js';
import { channels } from './channels.js';


dotenv.config();

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Configuration
const config = {
    targetChannels: channels['harhevron'],
    keywords: keywords,
    outputChannelId: process.env.OUTPUT_CHANNEL_ID,
    maxMessageLength: 500,

};

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// Telegram client configuration
const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || '');

// Message deduplication cache
const processedMessages = new Set();
const MESSAGE_CACHE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

async function translateAndShortenMessage(text) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{
                role: "system",
                content: `Translate the following text to Hebrew and shorten it to a maximum of ${config.maxMessageLength} characters while preserving the key information.`
            }, {
                role: "user",
                content: text
            }],
            max_tokens: 150
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.log(chalk.red('Error in translation:', error));
        logger.error('Error in translation:', error);
        throw error;
    }
}

const containsKeywords = (text) => {
    return config.keywords.some(keyword =>
        text.toLowerCase().includes(keyword.toLowerCase())
    );
}

const createMessageId = (message, channelUsername) => {
    return `${channelUsername}_${message.id}_${message.date}`;
}

async function processMessage(message, channelUsername, client) {
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
        }, MESSAGE_CACHE_TIMEOUT);



        const processedText = await translateAndShortenMessage(message.message);
        const messageLink = `https://t.me/${channelUsername}/${message.id}`;
        const processedTextReversed = processedText.split('').reverse().join('');

        // Send translated message
        await client.sendMessage(config.outputChannelId, {
            message: `${processedText}\n\n🔗 Original: ${messageLink}`
        });
        // show the current time
        const date = new Date().toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' });
        const time = new Date().toLocaleTimeString('he-IL', { timeZone: 'Asia/Jerusalem' });
        console.log(chalk.bgCyan(`${date} --- ${time}`));
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

async function monitorChannels(client) {
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

async function main() {
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