import type { User } from '@prisma/client';
import prisma from '../data-source';

/**
 * Get a user by their ID
 * @param id
 * @returns
 */
export const getUserById = async (id: number) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
    },
  });

  return user;
};

/**
 * Get a user by their Discord ID
 * @param discordId
 * @returns
 */
export const getUserByDiscordId = async (discordId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      discordId,
    },
    include: {
      permissions: true,
    }
  });

  return user;
};

/**
 * Create a new user
 * @param name
 * @param discordId
 * @returns
 */
export const createUser = async (
  discordId: string
): Promise<number> => {
  // make both the users and the inventor and levels
  const user = await prisma.user.create({
    data: {
      discordId,
    },
  });

  return user.id;
};

/**
 * Get all users
 * @returns
 */
export const getUsers = async () => {
  const user = await prisma.user.findMany();

  return user;
};

/**
 * Change a user
 * @param userId
 * @param user
 */
export const changeUser = async (userId: number, user: User) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: user,
  });
}
