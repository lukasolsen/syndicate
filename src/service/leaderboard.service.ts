import prisma from '../data-source';

export const calculateSyndicateValue = async (syndicateId: number) => {
  // Get the syndicate values then caluclate the main value which is the sum of all the values
  const syndicate = await prisma.syndicate.findFirst({
    where: {
      id: syndicateId,
    },
    include: {
      stats: true,
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });

  if (!syndicate) throw new Error('Syndicate does not exist');

  const skillValues = syndicate.skills.reduce((acc, skill) => {
    return acc + skill.level * skill.skill.cost;
  }, 0);

  const mainValue = syndicate.stats.balance
    .plus(syndicate.stats.reputation * 10)
    .plus(skillValues);

  return mainValue;
};

export const getLeaderboard = async (limit: number) => {
  const syndicates = await prisma.syndicate.findMany({
    include: {
      stats: true,
      skills: {
        include: {
          skill: true,
        },
      },
    },
    take: limit || 10,
  });

  const leaderboard = await Promise.all(
    syndicates.map(async (syndicate) => ({
      name: syndicate.name,
      value: await calculateSyndicateValue(syndicate.id),
    })),
  );

  leaderboard.sort((a, b) => Number(b.value) - Number(a.value));

  return leaderboard;
};
