import consola from 'consola';
import { config } from 'dotenv';
import { join } from 'path';
import { logError } from './utils/functions';
import type { SlashCommand } from './types';
import { Client, Collection, Partials, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'node:fs';
import { startIncomeCron } from './service/income.service';

const {
  Guilds,
  GuildMembers,
  GuildMessages,
  GuildMessageReactions,
  MessageContent,
} = GatewayIntentBits;
config();

const client: Client = new Client({
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: true,
  },

  presence: { activities: [{ name: 'a fun game!' }], status: 'online' },
  partials: [Partials.Message, Partials.Reaction],
  intents: [
    Guilds,
    GuildMembers,
    GuildMessages,
    GuildMessageReactions,
    MessageContent,
  ],
  closeTimeout: 60000,
});

client.slashCommands = new Collection<string, SlashCommand>();

const handlersDir = join(__dirname, './handlers');
readdirSync(handlersDir).forEach((handler) => {
  if (!handler.endsWith('.ts') && !handler.endsWith('.js')) return;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require(handlersDir + '/' + handler)(client);
});

client
  .login(process.env.BOT_TOKEN)
  .then(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    process.on('unhandledRejection', (error: Error, _: Promise<unknown>) =>
      logError(error, client),
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    process.on('uncaughtException', (error: Error, _: string) =>
      logError(error, client),
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    process.on('warning', (error: Error, _: string) => logError(error, client));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    process.on('message', (error: Error, _: string) => logError(error, client));

    client.on('error', (error) => logError(error, client));

    startIncomeCron();
  })
  .catch((err) => consola.log(err));
