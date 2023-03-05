import type { UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
    /*
     * Resolve and load @commitlint/config-conventional from node_modules.
     * Referenced packages must be installed
     */
    extends: ['@commitlint/config-conventional'],
    /*
     * Resolve and load @commitlint/format from node_modules.
     * Referenced package must be installed
     */
    formatter: '@commitlint/format',
    /*
     * Functions that return true if commitlint should ignore the given message.
     */
    ignores: [commit => commit === ''],
    /*
     * Whether commitlint uses the default ignore rules.
     */
    defaultIgnores: true,
    /*
     * Custom URL to show upon failure
     */
    helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
    /*
     * Custom prompt configs
     */
    prompt: {
        messages: {},
        questions: {
            type: {
                description: 'please input type:',
            },
        },
    },
};

module.exports = Configuration;
