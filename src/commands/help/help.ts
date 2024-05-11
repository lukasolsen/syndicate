import { ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types';
import { generateActions, generateEmbed } from '../../lib/embed';

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Help command'),
  execute: async (interaction) => {
    try {
      let tagCount = 0;

      const embed = generateEmbed({
        title: 'Help',
        description: 'Here are the commands you can use:',
        fields: [
          {
            name: 'help',
            value: 'Displays this message',
          },
          {
            name: 'found',
            value: 'Start your taco stand!',
          },
          {
            name: 'leaderboard',
            value: 'View the top taco stands',
          },
          {
            name: 'inventory',
            value: 'View your inventory',
          },
          {
            name: 'shop',
            value: 'Buy items for your taco stand',
          }
        ],
        color: 'Blue',
      });

      const actions = generateActions([
        new ButtonBuilder()
          .setCustomId('back')
          .setLabel('<-- Back')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next -->')
          .setStyle(ButtonStyle.Primary)
      ]);

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
        components: [actions],
      })

      const filter = (i) => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector.on('collect', async (i) => {
        if (i.customId === 'back')
          tagCount -= 1;
        else
          tagCount += 1;


        if (tagCount < 0)
          tagCount = 0;


        if (tagCount > 1)
          tagCount = 1;


        if (tagCount === 0) {
          await i.update({
            embeds: [embed],
            components: [actions],
          });
        } else {
          await i.update({
            embeds: [embed],
            components: [],
          });
        }
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
