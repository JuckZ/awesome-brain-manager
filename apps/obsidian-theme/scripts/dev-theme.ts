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
            // 保留重要注释
            charset: true,
        });

        // 处理编译后的CSS
        let cssContent = result.css;

        // 处理编译后的CSS，保留@settings注释块
        const settingsRegex = /\/\*\s*@settings[\s\S]*?\*\//g;
        const settingsBlocks: string[] = [];
        let match: RegExpExecArray | null;

        // 遍历所有SCSS文件查找@settings块
        const scssFiles = getAllScssFiles('./src/styles');
        for (const file of scssFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const regex = new RegExp(settingsRegex); // 创建新的正则表达式实例
            while ((match = regex.exec(content)) !== null) {
                settingsBlocks.push(match[0]);
            }
        }

        // 将所有@settings块添加到编译后的CSS开头
        if (settingsBlocks.length > 0) {
            cssContent = settingsBlocks.join('\n\n') + '\n\n' + cssContent;
        }

        // 添加sourcemap注释
        cssContent += '\n\n/* sourceMappingURL=theme.css.map */';

        // 写入处理后的CSS
        fs.writeFileSync(outputFile, cssContent);

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

// 递归获取所有SCSS文件
function getAllScssFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // 递归遍历子目录
            results = results.concat(getAllScssFiles(filePath));
        } else if (path.extname(file) === '.scss') {
            // 添加SCSS文件
            results.push(filePath);
        }
    }

    return results;
}
