import type { Skill } from '@prisma/client';

export const Skills: Skill[] = [
  {
    name: 'Phishing Proficiency',
    description: 'Increase your income by 10%',
    cost: 1,
    id: 1,
    stats: '+5% success rate per level',
    type: 'HackingTechniques',
  },
  {
    name: 'Trojan Expertise',
    description: 'Enhances the effectiveness of trojan attacks.',
    id: 2,
    cost: 1,
    stats: '+10% damage per level',
    type: 'MalwareDevelopment',
  },
  {
    name: 'Firewall Fortification',
    description: 'Boosts the syndicate\'s firewall strength.',
    id: 3,
    cost: 1,
    stats: '-5% chance of being hacked per level',
    type: 'SecurityExpertise'
  },
];
