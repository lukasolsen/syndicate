import type { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import type { BotEvent } from '../types';
import { EventType } from '../types';
import consola from 'consola';

module.exports = (client: Client) => {
  const eventsDir = join(__dirname, '../events');

  readdirSync(eventsDir).forEach((file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.js')) return;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const event: BotEvent = require(`${eventsDir}/${file}`).default;
    if (event.type === EventType.ONCE)
      client.once(event.name, (...args) => event.execute(...args));
    else if (event.type === EventType.ON)
      client.on(event.name, (...args) => event.execute(...args));
    else if (event.type === EventType.REST_ON)
      //TODO: Make this work with rate limit
      // eslint-disable-next-line
      // @ts-ignore
      client.rest.on(event.name, consola.log);
    else {
      consola.error(
        `${event.name} doesn't have a correct type from the enum 'EventType, but has ${event.type}`
      ); 
    }
    consola.success(`Successfully registered event: ${event.name}`);
  });
};
