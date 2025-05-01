import { _electron as electron } from 'playwright';

(async () => {
    // Launch Electron app.
    console.log('11111');
    let electronApp;
    // JZTODO 为什么无法进入下一步
    debugger;
    try {
        debugger;
        electronApp = await electron.launch({
            // Obsidian.exe "--remote-debugging-port=9222"
            // executablePath: 'C:/Users/ajuck/AppData/Local/Programs/Microsoft VS Code/Code.exe',
            executablePath: 'C:/Users/ajuck/scoop/apps/obsidian/current/Obsidian.exe',
            // executablePath: 'code',
            // C:/Users/ajuck/Projects/awesome-brain-manager/test-vault
            cwd: './',
            env: {
                // NODE_OPTIONS: '--inspect=0',
            },
            // C:\Users\ajuck\Projects\awesome-brain-manager\test-vault\Hello.md
            // args: ['--version'],
            // args: ['test-vault'],
            timeout: 10000,
            // args: ['vaultOpen', 'C:/Users/ajuck/Projects/awesome-brain-manager/test-vault'],
        });
    } catch (error) {
        console.log('-=-=-=-');
        console.log(error);
        console.log('-=-=-=-');
    }
    debugger;
    // Get the first window that the app opens, wait if necessary.

    console.log('3333');
    console.log(electronApp);

    // electronApp.on('window', data => {
    //     console.log(data);
    // });

    const window = await electronApp.firstWindow();

    window.keyboard.type('123');
    // Evaluation expression in the Electron context.
    const appPath = await electronApp.evaluate(async ({ app }) => {
        app.emit('console.log(123)');
        // This runs in the main Electron process, parameter here is always
        // the result of the require('electron') in the main app script.
        return app.getAppPath();
    });
    console.log(appPath);
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
