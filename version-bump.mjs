import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pluginPackagePath = resolve('apps/obsidian-plugin/package.json');
const manifestPath = resolve('apps/obsidian-plugin/manifest.json');
const versionsPath = resolve('versions.json');

const pluginPackage = JSON.parse(readFileSync(pluginPackagePath, 'utf8'));
const targetVersion = pluginPackage.version;

if (!targetVersion) {
	throw new Error('Cannot find target version in apps/obsidian-plugin/package.json');
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t'));

const versions = JSON.parse(readFileSync(versionsPath, 'utf8'));
versions[targetVersion] = minAppVersion;
writeFileSync(versionsPath, JSON.stringify(versions, null, '\t'));
