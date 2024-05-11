import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types';
import { generateEmbed } from '../../lib/embed';
import { getLeaderboard } from '../../service/leaderboard.service';

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the syndicate leaderboard!'),
  requireUser: true,
  execute: async (interaction) => {
    try {
      const leaderboard = await getLeaderboard(10);

      const embed = generateEmbed({
        title: 'Syndicate Leaderboard',
        description: leaderboard
          .map(
            (entry, index) =>
              `${index + 1}. ${entry.name} - ${entry.value} points`,
          )
          .join('\n'),
        color: 'Red',
      });

      await interaction.reply({ embeds: [embed] });
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
