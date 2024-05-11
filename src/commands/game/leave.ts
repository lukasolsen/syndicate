import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types';
import { getSyndicate, leaveSyndicate } from '../../service/syndicate.service';
import consola from 'consola';

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leave the syndicate!'),
  requireUser: true,
  execute: async (interaction, user) => {
    try {
      const syndicate = await getSyndicate(user.id);

      if (!syndicate) {
        return await interaction.reply({
          content: 'You are not in a syndicate!',
          ephemeral: true,
        });
      }

      try {
        await leaveSyndicate(user.id, syndicate.id);
      } catch (error) {
        consola.error(error);
        return await interaction.reply({
          content: 'You were unable to leave the syndicate!',
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: 'You left the syndicate!',
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  },
};

export default command;
