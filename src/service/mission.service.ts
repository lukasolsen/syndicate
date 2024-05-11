import consola from 'consola';
import prisma from '../data-source';

/**
 * Get all missions
 * @returns
 */
export const getMissions = async () => {
  const missions = await prisma.mission.findMany();

  return missions;
};

/**
 * Get a mission by id
 * @param id
 * @returns
 */
export const getMissionById = async (id: number) => {
  const mission = await prisma.mission.findFirst({
    where: {
      id,
    },
  });

  return mission;
};

/**
 * Get a mission by name
 * @param name
 * @returns
 */
export const getMissionByName = async (name: string) => {
  const mission = await prisma.mission.findFirst({
    where: {
      name,
    },
  });

  return mission;
};

/**
 * Get all missions by syndicate
 * @param syndicateId
 * @returns
 */
export const getMissionsBySyndicate = async (syndicateId: number) => {
  const missions = await prisma.mission.findMany({
    where: {
      syndicateId,
    },
  });

  return missions;
};

export const getAvailableMissions = async (syndicateId: number) => {
  const hasMission = await prisma.mission.findFirst({
    where: {
      syndicateId,
    },
  });

  consola.info(hasMission);

  if (hasMission) return [];

  const missions = await prisma.mission.findMany({
    where: {
      AND: [
        {
          syndicateId: null,
        },
        {
          active: true,
        },
      ],
    },
  });

  consola.info(missions);

  return missions || [];
};

export const joinMission = async (syndicateId: number, missionId: number) => {
  await prisma.mission.update({
    where: {
      id: missionId,
    },
    data: {
      syndicateId,
    },
  });
};

export const getCurrentMission = async (syndicateId: number) => {
  const mission = await prisma.mission.findFirst({
    where: {
      syndicateId,
    },
  });

  return mission;
};
