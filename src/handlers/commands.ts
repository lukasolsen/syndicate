import type { Client, SlashCommandBuilder } from 'discord.js';
import { REST, Routes } from 'discord.js';
import { readdirSync, promises } from 'fs';
import { join } from 'path';
import type { SlashCommand } from '../types';
import consola from 'consola';

const checkCorrectFile = (file: string): boolean => {
  if (!file.endsWith('.ts') && !file.endsWith('.js')) return false;
  return true;
};

module.exports = async (client: Client) => {
  const slashCommands: SlashCommandBuilder[] = [];
  const slashCommandsDir = join(__dirname, '../commands');

  const files = readdirSync(slashCommandsDir);

  for (const file of files) {
    const filePath = `${slashCommandsDir}/${file}`;
    const fileStat = await promises.stat(filePath);
    if (fileStat.isDirectory()) {
      const subFiles = readdirSync(filePath);
      for (const subFile of subFiles) {
        if (!checkCorrectFile(subFile)) return;

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const command: SlashCommand = require(
          slashCommandsDir + '/' + file + '/' + subFile,
        ).default;
        slashCommands.push(command.command);
        client.slashCommands.set(command.command.name, command);
        consola.success(
          `Successfully registered command: ${command.command.name}`,
        );
      }
    } else {
      if (!checkCorrectFile(file)) return;

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const command: SlashCommand = require(
        slashCommandsDir + '/' + file,
      ).default;
      slashCommands.push(command.command);
      client.slashCommands.set(command.command.name, command);
      consola.success(
        `Successfully registered command: ${command.command.name}`,
      );
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
  if (process.env.NODE_ENV !== 'production') {
    rest
      .put(
        Routes.applicationGuildCommands(
          process.env.APPLICATION_ID,
          process.env.DEV_GUILD_ID,
        ),
        {
          body: slashCommands.map((command) => command.toJSON()),
        },
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data: any) => {
        consola.success(`Successfully loaded ${data.length} slash command(s)`);
      })
      .catch((e) => {
        consola.error(e);
      });
    return;
  }
  rest
    .put(Routes.applicationCommands(process.env.APPLICATION_ID), {
      body: slashCommands.map((command) => command.toJSON()),
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((data: any) => {
      consola.success(`Successfully loaded ${data.length} slash command(s)`);
    })
    .catch((e) => {
      consola.error(e);
    });
};
