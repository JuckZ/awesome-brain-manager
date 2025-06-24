import fs from 'fs';
import path from 'path';
import { normalizePath } from 'vite';
import * as sass from 'sass-embedded';

const outputDir = process.env.THEME_OUTPUT_DIR || './dist';
const outputFile = normalizePath(path.resolve(outputDir, './theme.css'));
const inputFile = './src/styles/theme/index.scss';
const srcDir = './src/styles';

console.log(`Watching theme from ${inputFile} to ${outputFile}`);

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 编译函数
function compile() {
    try {
        const result = sass.compile(inputFile, {
            style: 'expanded', // 开发环境使用expanded样式以便于调试
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

        console.log(`Theme compiled successfully at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        console.error('Compilation error:', (error as any).message);
    }
}

// 初始编译
compile();

// 使用fs.watch监视文件变化
fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.scss')) {
        console.log(`File ${filename} changed, recompiling...`);
        compile();
    }
});

console.log('Watching for changes... Press Ctrl+C to stop.');
