/* eslint-disable no-case-declarations */
import {
  ActionRowBuilder,
  ComponentType,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import type { SlashCommand } from '../../types';
import {
  getAvailableMissions,
  getMissionsBySyndicate,
  joinMission,
} from '../../service/mission.service';
import { generateEmbed } from '../../lib/embed';
import { getSyndicateMember } from '../../service/syndicate.service';
import { getMission } from '../../constant/Missions';

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('mission')
    .setDescription('Manage missions for your syndicate!')
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('The action to perform.')
        .setRequired(false)
        .addChoices(
          ...[
            {
              name: 'List',
              value: 'list',
            },
            {
              name: 'Join',
              value: 'join',
            },
            {
              name: 'Current',
              value: 'current',
            },
          ],
        ),
    ),
  requireUser: true,
  execute: async (interaction, user) => {
    try {
      if (!interaction.options.getString('action')) {
        await interaction.reply({
          content: 'Please provide an action!',
          ephemeral: true,
        });
        return;
      }

      const syndicate = await getSyndicateMember(user.id);

      if (!syndicate) {
        await interaction.reply({
          content: 'You are not in a syndicate!',
          ephemeral: true,
        });
        return;
      }

      const action = interaction.options.getString('action');

      const missions = await getAvailableMissions(syndicate.id);
      switch (action) {
        case 'list':
          if (!missions.length) {
            await interaction.reply('There are no missions available!');
            return;
          }

          await interaction.reply({
            embeds: [
              generateEmbed({
                color: 'Red',
                title: 'Missions Available',
                description:
                  'Here are all the missions available for you to complete!',

                fields: missions.map((mission) => ({
                  name: mission.name,
                  value: `
              ${mission.active ? 'Active' : 'Inactive'}
              ${mission.level ? `Level: ${mission.level}` : 'No Level Requirement'}
              ${mission.expiresAt ? `*Expires*: ${new Date(mission.expiresAt).toLocaleString()}` : ''}
              `,
                  inline: false,
                })),
              }),
            ],
          });
          break;

        case 'join':
          if (!missions.length) {
            await interaction.reply('There are no missions available!');
            return;
          }

          if (syndicate.role === 'MEMBER') {
            await interaction.reply({
              content: 'You do not have permission to join missions!',
              ephemeral: true,
            });
            return;
          }

          const select = new StringSelectMenuBuilder()
            .setCustomId('mission_join')
            .setPlaceholder('Select a mission to join!')
            .addOptions(
              missions.map((mission) =>
                new StringSelectMenuOptionBuilder()
                  .setLabel(mission.name)
                  .setValue(mission.id.toString())
                  .setDescription(
                    `Expires: ${new Date(mission.expiresAt).toLocaleString()}`,
                  ),
              ),
            );

          const row =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
              select,
            );

          const reply = await interaction.reply({
            embeds: [
              generateEmbed({
                title: 'Missions to Join',
                description:
                  'Here are all the missions available for you to join!',
                fields: missions.map((mission) => ({
                  name: mission.name,
                  value: `
              ${mission.active ? 'Active' : 'Inactive'}
              ${mission.level ? `Level: ${mission.level}` : 'No Level Requirement'}
              ${mission.expiresAt ? `*Expires*: ${new Date(mission.expiresAt).toLocaleString()}` : ''}
              `,
                  inline: false,
                })),
                color: 'Red',
              }),
            ],
            components: [row],
          });

          reply
            .createMessageComponentCollector({
              componentType: ComponentType.StringSelect,
              time: 3_600_000,
            })
            .on('collect', async (interaction) => {
              const missionId = parseInt(interaction.values[0]);

              const mission = await getMission(missionId);

              if (!mission) {
                await interaction.reply({
                  content: 'Invalid mission selected!',
                  ephemeral: true,
                });
                return;
              }

              try {
                await joinMission(syndicate.id, missionId);
                await interaction.reply({
                  content: `You have joined the mission **${mission.name}**!`,
                  ephemeral: true,
                  embeds: [],
                  components: [],
                });
              } catch (error) {
                await interaction.reply({
                  content: 'You have already joined a mission!',
                  ephemeral: true,
                  embeds: [],
                  components: [],
                });
                return;
              }
            });
          break;

        case 'current':
          const currentMission = await getMissionsBySyndicate(syndicate.id);

          if (!currentMission.length) {
            await interaction.reply('You are not currently on any missions!');
            return;
          }

          await interaction.reply({
            embeds: [
              generateEmbed({
                color: 'Red',
                title: 'Current Missions',
                description: 'Here are all the missions you are currently on!',
                fields: currentMission.map((mission) => ({
                  name: mission.name,
                  value: `
              ${mission.active ? 'Active' : 'Inactive'}
              ${mission.level ? `Level: ${mission.level}` : 'No Level Requirement'}
              ${mission.expiresAt ? `*Expires*: ${new Date(mission.expiresAt).toLocaleString()}` : ''}
              `,
                  inline: false,
                })),
              }),
            ],
          });
          break;

        default:
          await interaction.reply({
            content: 'Invalid action provided!',
            ephemeral: true,
          });
          break;
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
