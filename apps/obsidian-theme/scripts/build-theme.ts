import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { normalizePath } from 'vite';
import * as sass from 'sass-embedded';
import { watch } from 'fs/promises';

const outputDir = process.env.THEME_OUTPUT_DIR || './dist';
const outputFile = normalizePath(path.resolve(outputDir, './theme.css'));
const inputFile = './src/styles/theme/index.scss';
const manifestInputFile = './manifest.json';
const manifestOutputFile = normalizePath(path.resolve(outputDir, './manifest.json'));

// 检查是否为开发模式
const isDev = process.argv.includes('--dev');

// 日志函数
const log = {
    info: (message: string) => console.log(message),
    error: (message: string, error?: any) => console.error(message, error?.message || '')
};

// 文件操作函数
const fileOps = {
    ensureDir: (dir: string) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    },
    writeFile: (filePath: string, content: string) => {
        fs.writeFileSync(filePath, content);
        log.info(`File written to ${filePath}`);
    },
    copyFile: (src: string, dest: string) => {
        fs.copyFileSync(src, dest);
        log.info(`File copied from ${src} to ${dest}`);
    }
};

// 构建主题函数
async function buildTheme() {
    log.info(`Building theme from ${inputFile} to ${outputFile}`);

    try {
        // 确保输出目录存在
        fileOps.ensureDir(outputDir);

        // 使用sass-embedded API编译SCSS
        const result = sass.compile(inputFile, {
            style: isDev ? 'expanded' : 'compressed',
            // 禁止@import和global-builtin的废弃警告
            quietDeps: true,
            silenceDeprecations: ['import', 'global-builtin'],
            // 启用sourcemap
            sourceMap: true,
            sourceMapIncludeSources: true,
            // 保留重要注释（/*!开头的注释）
            charset: true,
        });

        // 处理编译后的CSS，保留@settings注释块
        // 首先从原始文件中提取@settings块
        const settingsBlocks = extractSettingsBlocks('./src/styles');

        // 将所有@settings块添加到编译后的CSS开头
        let cssContent = result.css;
        if (settingsBlocks.length > 0) {
            cssContent = settingsBlocks.join('\n\n') + '\n\n' + cssContent;
        }

        // 添加sourcemap注释
        cssContent += '\n\n/* sourceMappingURL=theme.css.map */';

        // 写入处理后的CSS
        fileOps.writeFile(outputFile, cssContent);

        // 如果有sourcemap，写入sourcemap文件
        if (result.sourceMap) {
            fileOps.writeFile(`${outputFile}.map`, JSON.stringify(result.sourceMap));
        }

        log.info('Theme CSS build completed successfully!');

        // 复制manifest.json文件
        fileOps.copyFile(manifestInputFile, manifestOutputFile);

        log.info('Theme build completed successfully!');
    } catch (error) {
        log.error('Theme build failed:', error);
        if (!isDev) {
            process.exit(1);
        }
    }
}

// 提取@settings块
function extractSettingsBlocks(dir: string): string[] {
    const settingsBlocks: string[] = [];
    const scssFiles = getAllScssFiles(dir);

    for (const file of scssFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const settingsRegex = /\/\*\s*@settings[\s\S]*?\*\//g;
        let match: RegExpExecArray | null;
        while ((match = settingsRegex.exec(content)) !== null) {
            settingsBlocks.push(match[0]);
        }
    }

    return settingsBlocks;
}

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

// 监视文件变化
async function watchFiles() {
    log.info('Starting watch mode...');

    // 先执行一次构建
    await buildTheme();

    const watchConfigs = [
        { path: manifestInputFile, filter: () => true, action: () => fileOps.copyFile(manifestInputFile, manifestOutputFile) },
        { path: './src/styles', recursive: true, filter: (filename: string) => filename.endsWith('.scss'), action: buildTheme }
    ];

    try {
        // 设置所有监视器
        for (const config of watchConfigs) {
            const watcher = watch(config.path, { recursive: config.recursive });
            log.info(`Watching ${config.path} for changes...`);

            (async () => {
                for await (const event of watcher) {
                    if (event.filename && config.filter(event.filename)) {
                        log.info(`File changed: ${event.filename}`);
                        await config.action();
                    }
                }
            })();
        }

        log.info('Watching for file changes. Press Ctrl+C to stop.');
    } catch (error) {
        log.error('Watch error:', error);
        process.exit(1);
    }
}

// 主函数
async function main() {
    if (isDev) {
        await watchFiles();
    } else {
        await buildTheme();
    }
}

main().catch(error => {
    log.error('Error:', error);
    process.exit(1);
});
