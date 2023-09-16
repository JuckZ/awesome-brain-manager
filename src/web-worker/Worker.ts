import { MessageManager } from '@/web-worker/MessageManager';

let messageManager: MessageManager | null = null;

function executeFunction<T extends MessageManager>(target: T, func: keyof T, args): void {
    // eslint-disable-next-line @typescript-eslint/ban-types
    (target[func] as unknown as Function)(args);
}

self.addEventListener('message', e => {
    const message = e.data || e;

    switch (message.type) {
        case 'init':
            messageManager = new MessageManager(message.args);
            break;

        case 'exec':
            if (messageManager) {
                executeFunction(messageManager, message.func, message.args);
            }
            break;

        default:
            break;
    }
});
