import type {
  CacheType,
  ChatInputCommandInteraction,
  CommandInteraction,
  Interaction,
} from 'discord.js';
import {
  Events
} from 'discord.js';
import type { BotEvent } from '../types';
import { EventType } from '../types';
import { getUserByDiscordId } from '../service/user.service';

const event: BotEvent = {
  name: Events.InteractionCreate,
  type: EventType.ON,
  execute: async (interaction: Interaction) => {
    // Triggers on baseInteraction
    if (interaction.isCommand())
      await executeCommand(interaction); // Perform commands

  },
};

export default event;

async function executeCommand(interaction: CommandInteraction) {
  const command = interaction.client.slashCommands.get(interaction.commandName);
  if (command) {
    try {
      const discordUser = await interaction.guild.members.fetch(interaction.user.id);
      const user = await getUserByDiscordId(discordUser.id);
      // Make a middleware here for checking if the user wants them to have a correct permission in the DB, or if they even exist in our db in the first place.
      if (command.botPermissions) {
        for (const permission of command.botPermissions) {
          if (!interaction.appPermissions.has(permission)) {
            await interaction.reply({
              content: `I need the permission \`${permission}\` to run this command.`,
              ephemeral: true,
            });
            return;
          }
        }
      }

      if (command.userPermissions) {
        for (const permission of command.userPermissions) {
          if (!interaction.member.permissions.toString().includes(permission as unknown as string)) {
            await interaction.reply({
              content: `You need the permission \`${permission}\` to run this command.`,
              ephemeral: true,
            });
            return;
          }
        }
      }

      if (command.customUserPermissions) {
        // get the user.
        if (!user) {
          await interaction.reply({
            content: 'You need to register an account to use this command.',
            ephemeral: true,
          });
          return;
        }

        for (const permission of command.customUserPermissions) {
          if (!user.permissions.some((p) => p.name === permission)) {
            await interaction.reply({
              content: `You need the permission \`${permission}\` to run this command.`,
              ephemeral: true,
            });
            return;
          }
        }
      }

      if (command.requireUser && !user) {
        await interaction.reply({
          content: 'You need to register an account to use this command.',
          ephemeral: true,
        });
        return;
      }

      await command.execute(
        interaction as ChatInputCommandInteraction<CacheType>,
        user,
      );
    } catch (error) {
      console.error(error);
      await interaction
        .reply({ content: `${error}`, ephemeral: true })
        .catch((err) => {
          interaction.followUp({ content: `${err}`, ephemeral: true });
        }); // If fails just sends it right on back
    }
  }
}
