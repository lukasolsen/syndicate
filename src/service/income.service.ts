import cron from 'node-cron';
import { changeSyndicateStats, getSyndicates } from './syndicate.service';
import consola from 'consola';

export const startIncomeCron = () => {
  consola.info('Starting income cron job');
  const task = cron.schedule('*/1 * * * *', async () => {
    consola.info('Calculating income for all syndicates');
    const syndicates = await getSyndicates();

    for (const syndicate of syndicates) {
      try {
        const balance = syndicate.stats.balance.plus(syndicate.stats.incomeHourly.div(60))

        const newObject = {
          ...syndicate.stats,
          balance,
        }

        delete newObject.id;
        delete newObject.syndicateId;

        await changeSyndicateStats(syndicate.id, newObject);
      } catch (error) {
        consola.error(`Error updating balance for ${syndicate.name}: ${error}`);
      }
    }
  });

  task.start();
};
