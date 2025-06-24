import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { normalizePath } from 'vite';
import * as sass from 'sass-embedded';

const outputDir = process.env.THEME_OUTPUT_DIR || './dist';
const outputFile = normalizePath(path.resolve(outputDir, './theme.css'));
const inputFile = './src/styles/theme/index.scss';
const manifestInputFile = './manifest.json';
const manifestOutputFile = normalizePath(path.resolve(outputDir, './manifest.json'));

console.log(`Building theme from ${inputFile} to ${outputFile}`);

try {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 使用sass-embedded API编译SCSS
    const result = sass.compile(inputFile, {
        style: 'compressed',
        // 禁止@import和global-builtin的废弃警告
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin'],
        // 启用sourcemap
        sourceMap: true,
        sourceMapIncludeSources: true,
    });

    // 写入编译后的CSS到输出文件
    fs.writeFileSync(outputFile, result.css);

    // 如果有sourcemap，写入sourcemap文件
    if (result.sourceMap) {
        fs.writeFileSync(`${outputFile}.map`, JSON.stringify(result.sourceMap));
        console.log(`Sourcemap written to ${outputFile}.map`);
    }

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
