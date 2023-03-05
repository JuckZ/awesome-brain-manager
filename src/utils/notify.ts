import type AwesomeBrainManagerPlugin from '@/main';

export class NotifyUtils {
    plugin: AwesomeBrainManagerPlugin;
    options: any;

    init(plugin: AwesomeBrainManagerPlugin) {
        this.plugin = plugin;
        this.options = {
            title: 'Custom Notification',
            subtitle: 'Subtitle of the Notification',
            body: 'Body of Custom Notification',
            silent: false,
            icon: 'https://pic1.zhuanstatic.com/zhuanzh/50b6ffe4-c7e3-4317-bc59-b2ec4931f325.png',
            hasReply: true,
            timeoutType: 'never',
            replyPlaceholder: 'Reply Here',
            // sound: '',
            urgency: 'critical',
            closeButtonText: 'Close Button',
            actions: [
                {
                    type: 'button',
                    text: 'Show Button',
                },
            ],
        };
    }

    sendNotification() {
        new Notification('通知标题：', {
            body: '通知内容',
            icon: 'https://pic1.zhuanstatic.com/zhuanzh/50b6ffe4-c7e3-4317-bc59-b2ec4931f325.png',
        });
    }
    systemNotify(content: string) {
        if (!electron) return;
        this.options.body = content;
        const customNotification = new electron.remote.Notification(this.options);
        customNotification.show();
    }

    nativeSystemNotify(content: string) {
        if (!window.Notification) return;
        if (window.Notification.permission == 'granted') {
            // 判断是否有权限
            this.sendNotification();
        } else if (window.Notification.permission != 'denied') {
            window.Notification.requestPermission(function (permission) {
                // 没有权限发起请求
                this.sendNotification();
            });
        }
    }
}

export const NotifyUtil = new NotifyUtils();
