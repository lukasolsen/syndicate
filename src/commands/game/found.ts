import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types';
import { createSyndicate } from '../../service/syndicate.service';
import { createUser } from '../../service/user.service';

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('found')
    .setDescription('Start your syndicate journey!'),
  execute: async (interaction, user) => {
    try {
      const userId = user?.id || (await createUser(interaction.user.id));

      let syndicate;
      try {
        syndicate = await createSyndicate(userId, interaction.user.username);
      } catch (error) {
        return await interaction.reply({
          content: 'You already have a syndicate!',
          ephemeral: true,
        });
      }

      if (!syndicate) {
        return await interaction.reply({
          content: 'There was an error while creating your syndicate!',
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: 'Your syndicate has been created!',
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
