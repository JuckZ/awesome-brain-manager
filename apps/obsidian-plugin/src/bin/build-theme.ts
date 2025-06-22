import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { normalizePath } from 'vite';

const outputDir = process.env.THEME_OUTPUT_DIR || './dist';
const outputFile = normalizePath(path.resolve(outputDir, './theme.css'));
const inputFile = './src/styles/theme/index.scss';
const manifestInputFile = './src/styles/theme/manifest.json';
const manifestOutputFile = normalizePath(path.resolve(outputDir, './manifest.json'));

console.log(`Building theme from ${inputFile} to ${outputFile}`);

try {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 构建主题CSS
    execSync(`sass ${inputFile} ${outputFile}`, { stdio: 'inherit' });
    console.log('Theme CSS build completed successfully!');

    // 复制manifest.json文件
    console.log(`Copying manifest from ${manifestInputFile} to ${manifestOutputFile}`);
    fs.copyFileSync(manifestInputFile, manifestOutputFile);
    console.log('Manifest file copied successfully!');

    console.log('Theme build completed successfully!');
} catch (error) {
    console.error('Theme build failed:', (error as any).message);
    process.exit(1);
}
