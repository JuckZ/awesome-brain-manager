import { _electron as electron } from 'playwright';

(async () => {
    // Launch Electron app.
    const electronApp = await electron.launch({
        // executablePath: 'C:/Users/ajuck/scoop/apps/obsidian/current/Obsidian.exe',
        // C:/Users/ajuck/Projects/awesome-brain-manager/test-vault
        // executablePath: 'nvm.exe',
        cwd: './',
        executablePath: 'C:/Users/ajuck/AppData/Local/Programs/Microsoft VS Code/Code.exe',
        // C:\Users\ajuck\Projects\awesome-brain-manager\test-vault\Hello.md
        args: ['test-vault/Hello.md'],
        // args: ['vaultOpen', 'C:/Users/ajuck/Projects/awesome-brain-manager/test-vault'],
    });

    // Evaluation expression in the Electron context.
    const appPath = await electronApp.evaluate(async ({ app }) => {
        app.emit('console.log(123)');
        // This runs in the main Electron process, parameter here is always
        // the result of the require('electron') in the main app script.
        return app.getAppPath();
    });
    console.log(appPath);
    // Get the first window that the app opens, wait if necessary.
    const window = await electronApp.firstWindow();
    // Print the title.
    console.log(await window.title());
    // Capture a screenshot.
    await window.screenshot({ path: 'intro.png' });
    // Direct Electron console to Node terminal.
    window.on('console', console.log);
    // input something
    window.keyboard.type('123');
    // Click button.
    await window.click('text=File');
    // Exit app.
    // await electronApp.close();
})();
