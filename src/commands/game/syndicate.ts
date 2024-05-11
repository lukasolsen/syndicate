import { ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types';
import {
  findSyndicateSkills,
  getSyndicate,
} from '../../service/syndicate.service';
import { generateActions, generateEmbed } from '../../lib/embed';
import type { Stats, Syndicate } from '@prisma/client';

type buildEmbedProps = {
  page: 'overview' | 'upgrade' | 'collect' | 'skills';
  syndicate: Syndicate & { stats: Stats };
};

const buildEmbed = async ({ page, syndicate }: buildEmbedProps) => {
  switch (page) {
    case 'overview':
      return generateEmbed({
        title: syndicate.name,
        description: `${syndicate.description} - ${syndicate.tag}`,
        fields: [
          {
            name: 'Balance',
            value: syndicate.stats.balance.toString(),
          },
          {
            name: 'Level',
            value: syndicate.stats.level.toString(),
          },
        ],
        color: 'Red',
      });
    case 'upgrade':
      return generateEmbed({
        title: syndicate.name + ' Upgrade',
        description: 'This is your syndicate upgrade page!',
        color: 'Red',
      });
    case 'collect':
      return generateEmbed({
        title: 'Syndicate',
        description: 'This is your syndicate collect page!',
        color: 'Red',
      });
    case 'skills':
      // eslint-disable-next-line no-case-declarations
      const skills = await findSyndicateSkills(syndicate.id);

      return generateEmbed({
        title: 'Syndicate',
        description: 'This is your syndicate skills page!',
        color: 'Red',
        fields:
          skills.length > 0
            ? skills.map((skill) => ({
              name: skill.skill.name,
              value: skill.skill.description,
            }))
            : [
              {
                name: 'No skills found',
                value: 'You have no skills!',
              },
            ],
      });
    default:
      return generateEmbed({
        title: 'Syndicate',
        description: 'This is your syndicate overview!',
        fields: [
          {
            name: 'Balance',
            value: '1000',
          },
          {
            name: 'Level',
            value: '1',
          },
        ],
        color: 'Red',
      });
  }
};

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('syndicate')
    .setDescription('View your syndicate stats!'),
  requireUser: true,
  execute: async (interaction, user) => {
    try {
      const syndicate = await getSyndicate(user.id);

      if (!syndicate) {
        return await interaction.reply({
          content: 'You do not have a syndicate!',
          ephemeral: true,
        });
      }

      let page = 'overview' as 'overview' | 'upgrade' | 'collect' | 'skills';

      const actions = generateActions([
        new ButtonBuilder()
          .setLabel('Overview')
          .setCustomId('overview')
          .setStyle(
            page === 'overview' ? ButtonStyle.Secondary : ButtonStyle.Primary,
          ),
        new ButtonBuilder()
          .setLabel('Upgrade')
          .setCustomId('upgrade')
          .setStyle(
            page === 'upgrade' ? ButtonStyle.Secondary : ButtonStyle.Primary,
          ),
        new ButtonBuilder()
          .setLabel('Collect')
          .setCustomId('collect')
          .setStyle(
            page === 'collect' ? ButtonStyle.Secondary : ButtonStyle.Primary,
          ),
        new ButtonBuilder()
          .setLabel('Skills')
          .setCustomId('skills')
          .setStyle(
            page === 'skills' ? ButtonStyle.Secondary : ButtonStyle.Primary,
          ),
      ]);

      const reply = await interaction.reply({
        embeds: [await buildEmbed({ page, syndicate })],
        ephemeral: true,
        components: [actions],
      });

      try {
        const collector = reply.createMessageComponentCollector({
          filter: (i) => i.user.id === interaction.user.id,
          time: 60000,
        });

        collector?.on('collect', async (interaction) => {
          if (interaction.customId === 'overview') page = 'overview';
          else if (interaction.customId === 'upgrade') page = 'upgrade';
          else if (interaction.customId === 'collect') page = 'collect';
          else if (interaction.customId === 'skills') page = 'skills';

          await interaction.update({
            embeds: [await buildEmbed({ page, syndicate })],
            components: [actions],
          });
        });
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
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
