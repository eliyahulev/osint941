import { toggleGroup, isGroupActive } from "../../config/channels.js";
import { logger } from "../utils/logger.js";

export const handleGroupCommand = async (client, message, command) => {
  const [_, groupName, action] = command.split(" ");

  if (!groupName || !action) {
    await client.sendMessage(message.chat.id, {
      message:
        "Invalid command format. Use: /group <group_name> <activate/deactivate>",
    });
    return;
  }

  const isActivate = action.toLowerCase() === "activate";
  const success = toggleGroup(groupName, isActivate);

  if (success) {
    const status = isActivate ? "activated" : "deactivated";
    await client.sendMessage(message.chat.id, {
      message: `Group "${groupName}" has been ${status}.`,
    });
    logger.info(`Group "${groupName}" has been ${status}`);
  } else {
    await client.sendMessage(message.chat.id, {
      message: `Group "${groupName}" not found.`,
    });
    logger.warn(`Attempted to ${action} non-existent group "${groupName}"`);
  }
};

export const listGroups = async (client, message) => {
  const groups = Object.entries(targetChannels)
    .map(([name, group]) => {
      const status = group.active ? "🟢 Active" : "🔴 Inactive";
      const channelCount = group.channels.length;
      return `${name}: ${status} (${channelCount} channels)`;
    })
    .join("\n");

  await client.sendMessage(message.chat.id, {
    message: `Channel Groups Status:\n\n${groups}`,
  });
};
