const config = {
    branches: [
        '+([0-9])?(.{+([0-9]),x}).x',
        'master',
        'next',
        'next-major',
        { name: 'beta', prerelease: true },
        { name: 'alpha', prerelease: true },
    ],
    tagFormat: '${version}',
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/npm',
        [
            '@semantic-release/exec',
            {
                publishCmd:
                    'cp manifest.json versions.json dest && cp dest awesome-brain-manager -r && zip release.zip -r awesome-brain-manager',
            },
        ],
        [
            '@semantic-release/git',
            {
                assets: ['package.json', 'CHANGELOG.md', 'License', 'manifest.json', 'versions.json', 'release.zip'],
                message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
            },
        ],
        [
            '@semantic-release/github',
            {
                assets: [
                    { path: 'package.json', label: 'package.json' },
                    { path: 'CHANGELOG.md', label: 'CHANGELOG.md' },
                    { path: 'License', label: 'License' },
                    { path: 'manifest.json', label: 'manifest.json' },
                    { path: 'versions.json', label: 'versions.json' },
                    { path: 'dest/styles.css', label: 'styles.css' },
                    { path: 'dest/main.js', label: 'main.js' },
                    { path: 'release.zip', label: 'release.zip' },
                ],
            },
        ],
    ],
};

module.exports = config;
