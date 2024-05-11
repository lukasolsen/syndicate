import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types';
import { getMissions } from '../../service/mission.service';
import { generateEmbed } from '../../lib/embed';
import { getSyndicateById } from '../../service/syndicate.service';

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('missions')
    .setDescription('List off all missions!'),
  execute: async (interaction) => {
    try {
      const missions = await getMissions();

      if (!missions.length) {
        await interaction.reply('There are no missions available!');
        return;
      }

      const missionsFormatted = await Promise.all(
        missions.map(async (mission) => ({
          name:
            mission.name +
            (mission.syndicateId
              ? `- (${(await getSyndicateById(mission.syndicateId)).name})`
              : ''),
          value: `
          ${mission.active ? 'Active' : 'Inactive'}
          ${mission.level ? `Level: ${mission.level}` : 'No Level Requirement'}
          ${mission.expiresAt ? `*Expires*: ${new Date(mission.expiresAt).toLocaleString()}` : ''}
          `,
          inline: false,
        })),
      );

      const embed = generateEmbed({
        color: 'Red',
        title: 'Missions',
        description: 'List of all missions!',
        fields: missionsFormatted,
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
