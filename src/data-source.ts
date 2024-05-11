import { PrismaClient } from '@prisma/client';
import consola from 'consola';
import { Skills } from './constant/Skills';
import { Missions } from './constant/Missions';

const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => {
    consola.success('Prisma connected successfully');
  })
  .catch((error) => {
    consola.error('Prisma connection error:', error);
    process.exit(1);
  });

const addRequiredFields = async () => {
  const skills = await prisma.skill.findMany();

  if (skills.length === 0) {
    await prisma.skill.createMany({
      data: Skills,
    });
  }

  const missions = await prisma.mission.findMany();

  if (missions.length === 0) {
    await prisma.mission.createMany({
      data: Missions,
    });
  }
};

addRequiredFields()
  .then(() => {
    consola.success('Required fields added successfully');
  })
  .catch((error) => {
    consola.error('Error adding required fields:', error);
    process.exit(1);
  });

export default prisma;
