import type { Mission } from '@prisma/client';

export const Missions: Mission[] = [
  {
    id: 1,
    name: 'Operation Data Harvest',
    active: true,
    cost: 100,
    description: `**Mission Brief:**
Syndicate operatives, this is a critical first mission for our newly established cyber syndicate. We've identified a small local business, "Tech Innovations Inc.," as our target. Your task is to infiltrate their database and steal their latest research and development data. This information will give us an edge in the competitive tech industry and establish our reputation as a force to be reckoned with.

**Target:** Tech Innovations Inc.

Objective: Infiltrate the company's database and steal their latest research and development data.

**Mission Details:**
Tech Innovations Inc. is a small but rapidly growing tech startup known for their cutting-edge research in artificial intelligence and machine learning.
The company's database is protected by basic security measures, but recent reports suggest they may be vulnerable to exploitation.
The data we're after includes plans for their upcoming AI-powered project, codenamed *"Project Prometheus."* This project has the potential to revolutionize the tech industry.
Be cautious, as a successful infiltration could draw the attention of more powerful adversaries in the future.

**Potential Risks:**
Tech Innovations Inc. may have hired freelance security experts to bolster their defenses.
The company's CEO, Dr. Emily Chang, is known for her tenacity and will likely pursue legal action if the breach is discovered.
A successful heist could attract the attention of rival cyber syndicates or even government agencies interested in the stolen technology.

**Additional Notes:**
Dr. Emily Chang has a personal assistant, Marcus Stone, who may have access to valuable information or serve as a potential insider contact.
Tech Innovations Inc. recently announced a partnership with a major defense contractor, suggesting their technology may have military applications.`,
    type: 'DataTheft',
    rewards: ['Experience'],
    level: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: undefined,
    syndicateId: null,
  },
];

export const getMission = (id: number) => {
  return Missions.find((mission) => mission.id === id);
};

export const calculateMissionReward = (
  mission: Mission,
  syndicateLevel: number,
) => {
  const reward = mission.rewards.reduce((acc, reward) => {
    switch (reward) {
      case 'Experience':
        return acc + (mission.level * 100) / syndicateLevel;

      case 'Money':
        return acc + (mission.level * 10) / syndicateLevel;

      case 'Reputation':
        return acc + (mission.level * 5) / syndicateLevel;

      case 'Skill':
        return acc + 1;

      default:
        return acc;
    }
  }, 0);

  return reward;
};
