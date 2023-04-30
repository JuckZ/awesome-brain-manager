import { MessageManager } from './MessageManager';

const worker = new Worker(new URL('./Worker.ts', import.meta.url), {
    // TODO type: 'module',
    type: 'classic',
});
const messageManager = new MessageManager('This instance was created on the main thread');

export function initWorker(): void {
    worker.postMessage({ type: 'init', args: 'This instance was created in a worker' });

    messageManager.sayHello('main thread');
    worker.postMessage({ type: 'exec', func: 'sayHello', args: 'web worker' });

    messageManager.printMessage();
    worker.postMessage({ type: 'exec', func: 'printMessage', args: null });
}

export function initDB(): void {
    worker.postMessage({ type: 'exec', func: 'initDB', args: null });
}
