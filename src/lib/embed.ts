import type {
  ButtonBuilder,
  ColorResolvable
} from 'discord.js';
import {
  ActionRowBuilder,
  EmbedBuilder,
} from 'discord.js';

interface EmbedOptions {
  title: string;
  description: string;
  color: ColorResolvable;

  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];

  footer?: {
    text: string;
    iconURL: string;
  };

  thumbnail?: string;
  image?: string;

  author?: {
    name: string;
    iconURL: string;
  };
}

/**
 * Generate an embed message
 * @param options
 * @returns
 */
export const generateEmbed = (options: EmbedOptions) => {
  const embed = new EmbedBuilder({
    title: options.title,
    description: options.description,
  }).setColor(options.color || 'Random');

  if (options.fields) {
    options.fields.forEach((field) => {
      embed.addFields({
        name: field.name,
        value: field.value,
        inline: field.inline,
      });
    });
  }

  if (options.footer) {
    embed.setFooter({
      text: options.footer.text,
      iconURL: options.footer.iconURL,
    });
  }

  if (options.thumbnail)
    embed.setThumbnail(options.thumbnail);


  return embed;
};

export const generateActions = (data: ButtonBuilder[]) => {
  const actions = new ActionRowBuilder<ButtonBuilder>();

  data.forEach((button: ButtonBuilder) => {
    actions.addComponents(button);
  });

  return actions;
};
