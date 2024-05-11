import { type Stats } from '@prisma/client';
import prisma from '../data-source';

/**
 * Create a syndicate
 * @param userId
 * @param username
 * @returns
 */
export const createSyndicate = async (userId: number, username: string) => {
  if (
    await prisma.syndicate.findFirst({
      where: { members: { some: { userId } } },
    })
  )
    throw new Error('User already has a syndicate');

  const syndicate = await prisma.syndicate.create({
    data: {
      description: 'A syndicate',
      name: `${username}'s Syndicate`,
      history: {
        create: {
          type: 'OTHER',
          description: 'Syndicate created',
          userId,
        },
      },
      members: {
        create: {
          userId,
          role: 'OWNER',
        },
      },
      stats: {
        create: {
          balance: 1000,
          experience: 0,
          level: 1,
          incomeHourly: 1000,
          reputation: 0,
          skillPoints: 0,
        },
      },
      skills: {
        create: {
          skill: {},
        },
      },
      tag: 'SYN',
    },
  });

  return syndicate;
};

/**
 * Get a syndicate
 * @param userId
 * @returns
 */
export const getSyndicate = async (userId: number) => {
  const syndicate = await prisma.syndicate.findFirst({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      stats: true,
    },
  });

  return syndicate;
};

/**
 * Join a syndicate
 * @param userId
 * @param syndicateId
 * @returns
 */
export const joinSyndicate = async (userId: number, syndicateId: number) => {
  const syndicate = await prisma.syndicate.findFirst({
    where: {
      id: syndicateId,
    },
  });

  if (!syndicate) throw new Error('Syndicate does not exist');

  if (
    await prisma.syndicate.findFirst({
      where: { members: { some: { userId } } },
    })
  )
    throw new Error('User already has a syndicate');

  const syndicateInvite = await prisma.invite.findFirst({
    where: {
      userId,
      syndicateId,
    },
  });

  if (!syndicateInvite)
    throw new Error('You do not have an invite to this syndicate');

  if (syndicateInvite.expiresAt < new Date(Date.now())) {
    await prisma.invite.delete({
      where: {
        id: syndicateInvite.id,
      },
    });

    throw new Error('Invite has expired');
  }

  await prisma.syndicate.update({
    where: {
      id: syndicateId,
    },
    data: {
      members: {
        create: {
          userId,
        },
      },
    },
  });

  await prisma.invite.delete({
    where: {
      id: syndicateInvite.id,
    },
  });

  await prisma.history.create({
    data: {
      description: 'User joined syndicate',
      type: 'OTHER',
      userId,
      syndicateId,
    },
  });

  return syndicate;
};

/**
 * Leave a syndicate
 * @param userId
 * @param syndicateId
 * @returns
 */
export const leaveSyndicate = async (userId: number, syndicateId: number) => {
  const syndicate = await prisma.syndicate.findFirst({
    where: {
      id: syndicateId,
    },
    include: {
      members: true,
    },
  });

  if (!syndicate) throw new Error('Syndicate does not exist');

  if (
    !(await prisma.syndicate.findFirst({
      where: { members: { some: { userId } } },
    }))
  )
    throw new Error('User does not have a syndicate');

  // check if they are the owner, then give it to the next person in line in terms of permissions. If he is alone in it then just delete the syndicate. If he is not the owner, then just remove him from the syndicate.
  if (syndicate.members.length === 1) {
    await prisma.history.create({
      data: {
        description: 'User left syndicate',
        type: 'OTHER',
        userId,
        syndicateId,
      },
    });

    await prisma.syndicate.delete({
      where: {
        id: syndicateId,
      },
    });

    return syndicate;
  }

  await prisma.syndicate.update({
    where: {
      id: syndicateId,
    },
    data: {
      members: {
        delete: {
          userId,
        },
      },
    },
  });

  // choose the correct person to get the owner role.
  const owner = syndicate.members.find((member) => member.userId !== userId);

  await prisma.history.create({
    data: {
      description: 'User left syndicate',
      type: 'OTHER',
      userId,
      syndicateId,
    },
  });

  await prisma.history.create({
    data: {
      description: 'User became owner of syndicate',
      type: 'OTHER',
      userId: owner.userId,
      syndicateId,
    },
  });

  await prisma.syndicate.update({
    where: {
      id: syndicateId,
    },
    data: {
      members: {
        update: {
          where: {
            userId: owner.userId,
          },
          data: {
            role: 'OWNER',
          },
        },
      },
    },
  });

  return syndicate;
};

/**
 * Invite a user to a syndicate
 * @param userId
 * @param syndicateId
 * @param invitedUserId
 * @returns
 */
export const inviteUser = async (
  userId: number,
  syndicateId: number,
  invitedUserId: number,
) => {
  const syndicate = await prisma.syndicate.findFirst({
    where: {
      id: syndicateId,
    },
    include: {
      members: true,
      invites: true,
    },
  });

  if (!syndicate) throw new Error('Syndicate does not exist');

  if (!syndicate.members.some((member) => member.userId === userId))
    throw new Error('User is not in syndicate');

  if (syndicate.members.some((member) => member.userId === invitedUserId))
    throw new Error('User is already in syndicate');

  // check if they have a role to it or if they have a pending invite
  if (syndicate.invites.some((invite) => invite.userId === invitedUserId))
    throw new Error('User already has a pending invite to this syndicate');

  // check if they ahve a role to it such as they have to have Owner, or Admin, or Moderator, etc.
  const userInvitee = syndicate.members.find(
    (member) => member.userId === userId,
  );
  if (userInvitee.role !== 'OWNER' && userInvitee.role !== 'ADMIN')
    throw new Error('User does not have permission to invite');

  await prisma.invite.create({
    data: {
      userId: invitedUserId,
      syndicateId,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });

  return syndicate;
};

/**
 * Get all syndicates
 * @returns
 */
export const getSyndicates = async () => {
  const syndicates = await prisma.syndicate.findMany({
    include: {
      stats: true,
    },
  });

  return syndicates;
};

export const changeSyndicateStats = async (
  syndicateId: number,
  stats: Stats,
) => {
  await prisma.syndicate.update({
    where: {
      id: syndicateId,
    },
    data: {
      stats: {
        update: stats,
      },
    },
  });
};

export const findSyndicateSkills = async (syndicateId: number) => {
  const skills = await prisma.ownedSkill.findMany({
    where: {
      syndicateId,
    },
    include: {
      skill: true,
    },
  });

  return skills;
};

export const getSyndicateMembers = async (syndicateId: number) => {
  const members = await prisma.syndicate.findFirst({
    where: {
      id: syndicateId,
    },
    include: {
      members: true,
    },
  });

  return members;
};

export const getSyndicateMember = async (userId: number) => {
  const role = await prisma.member.findFirst({
    where: {
      userId,
    },
  });

  return role;
};

export const getSyndicateById = async (syndicateId: number) => {
  const syndicate = await prisma.syndicate.findFirst({
    where: {
      id: syndicateId,
    },
  });

  return syndicate;
};
