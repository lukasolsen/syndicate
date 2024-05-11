import {
  DiscordAPIError,
} from 'discord.js';
import type { Client, TextChannel } from 'discord.js';
import consola from 'consola';
import { generateEmbed } from '../lib/embed';

export const logError = async (error: Error, client: Client) => {
  if (error instanceof DiscordAPIError && error.message === 'Unknown Channel') {
    consola.error('Unknown channel, skipping error log');
    return;
  }
  if (
    error.message ===
    'Collector received no interactions before ending with reason: channelDelete'
  )
    return;

  const log_channel = client.channels.cache.get(process.env.LOG_CHANNEL_ID) as TextChannel;
  if (!log_channel) {
    consola.error('Could not find the guild or log channel');
    return;
  }

  const embed = generateEmbed({
    title: 'Error',
    color: 'Red',
    description: error.message,
    fields: [
      {
        name: 'Stack',
        value: error.stack,
      },
    ],
  });

  await log_channel.send({ embeds: [embed] });
};
