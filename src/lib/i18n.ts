import i18n from 'i18n';
import path from 'node:path';

i18n.configure({
  locales: ['en', 'es', 'no'],
  directory: path.join(__dirname, '../locales'),
  defaultLocale: 'en',
  objectNotation: true,
  api: {
    __: 't',
    __n: 'tn',
  },
});

const t = i18n.__;

export { t };
