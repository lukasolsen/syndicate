import type { User } from '@prisma/client';
import type {
  Collection,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  RESTEvents,
  Events,
  PermissionsBitField,
} from 'discord.js';

export interface SlashCommand {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  command: any;
  execute: (interaction: ChatInputCommandInteraction, user: User) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  helpText?: string | 'This command doesn\'t have a help description.';

  // Custom Properties...
  userPermissions?: PermissionsBitField[]; // If the user needs a specific permission to run the command (e.g. 'ADMINISTRATOR')
  botPermissions?: PermissionsBitField[]; // If the bot needs a specific permission to run the command (e.g. 'ADMINISTRATOR')

  userRoles?: string[]; // If the user needs a specific role to run the command
  botRoles?: string[]; // If the bot needs a specific role to run the command

  customUserPermissions?: string[]; // If the user needs a specific permission to run the command (e.g. 'ADMINISTRATOR') from db
  requireUser?: boolean; // If the command requires the user to be in the database
}
export enum EventType {
  ONCE = 'once',
  ON = 'on',
  REST_ON = 'rest_on',
}

export interface BotEvent {
  name: Events | RESTEvents | string;
  type: EventType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (...args: any) => void;
}

declare module 'discord.js' {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
  }
}
