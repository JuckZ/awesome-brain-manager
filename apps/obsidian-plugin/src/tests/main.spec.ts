import { _electron } from 'playwright';
import { expect, test } from '@playwright/test';
const electron = _electron;

test('Obsidian test', async () => {
    // C:/Users/ajuck/AppData/Local/Obsidian/
    const executablePath = 'Obsidian.exe';
    const args = [
        '--inspect=5858',
        '--remote-debugging-port=5868',
        // '--disable-gpu-sandbox', // https://github.com/microsoft/vscode-test/issues/221
        // '--disable-updates', // https://github.com/microsoft/vscode-test/issues/120
        // '--disable-workspace-trust',
        // '--extensionDevelopmentPath=' + rootPath,
        // '--new-window', // Opens a new session of VS Code instead of restoring the previous session (default).
        // '--no-sandbox', // https://github.com/microsoft/vscode/issues/84238
        // '--profile-temp', // "debug in a clean environment"
        // '--skip-release-notes',
        // '--skip-welcome',
        // 'D:\\projects\\awesome-brain-manager\\test-vault',
    ];
    const electronApp = await electron.launch({ executablePath, args });
    const isPackaged = await electronApp.evaluate(async ({ app }) => {
        // 在 Electron 的主进程运行，这里的参数总是
        // 主程序代码中 require('electron') 的返回结果。
        return app.isPackaged;
    });

    expect(isPackaged).toBe(false);

    // Wait for the first BrowserWindow to open
    // and return its Page object
    const window = await electronApp.firstWindow();
    await window.screenshot({ path: 'intro.png' });

    // close app
    await electronApp.close();
});
