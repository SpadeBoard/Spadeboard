
const { version } = require('./package.json');
const { resolve, relative } = require('path');
const { writeFileSync, existsSync, mkdirSync } = require('fs-extra');

const VERSION = {
    "branch": process.env.GIT_BRANCH || '?',
    "hash": process.env.GIT_HASH || '?',
    "version": version,
};

if (!existsSync(__dirname + '/src/environments')) {
    mkdirSync(__dirname + '/src/environments');
}

const development= resolve(__dirname, 'src', 'environments', 'version.ts');
const production = resolve(__dirname, 'src', 'environments', 'version.production.ts');

const content = `// IMPORTANT: THIS FILE IS AUTO GENERATED! DO NOT MANUALLY EDIT OR CHECKIN!
/* tslint:disable */
/* eslint-disable */
export const VERSION = ${JSON.stringify(VERSION, null, 4)};
/* tslint:enable */
`;

writeFileSync(development,
    content, { encoding: 'utf-8' });

writeFileSync(production,
    content, { encoding: 'utf-8' });

console.log(`Wrote version info ${JSON.stringify(VERSION, null, 4)} to ${relative(resolve(__dirname, '..'), development)}`);
console.log(`Wrote version info ${JSON.stringify(VERSION, null, 4)} to ${relative(resolve(__dirname, '..'), production)}`);
