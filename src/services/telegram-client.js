import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";

export const createTelegramClient = async (logger) => {
  const client = new TelegramClient(
    new StringSession(process.env.TELEGRAM_SESSION || ""),
    parseInt(process.env.TELEGRAM_API_ID),
    process.env.TELEGRAM_API_HASH,
    { connectionRetries: 5 }
  );

  // Client start method
  await client.start({
    phoneNumber: async () => await input.text("Enter phone number: "),
    password: async () => await input.text("Enter password: "),
    phoneCode: async () => await input.text("Enter verification code: "),
    onError: (err) => logger.error("Connection error", err),
  });

  logger.info("Session established", {
    sessionId: client.session.save(),
  });

  return client;
};
