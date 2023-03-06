import type AwesomeBrainManagerPlugin from '@/main';
import { SETTINGS } from '@/settings';

export class NotifyUtils {
    plugin: AwesomeBrainManagerPlugin;
    options: any;
    audioEle: HTMLAudioElement;

    init(plugin: AwesomeBrainManagerPlugin) {
        this.plugin = plugin;
        this.options = {
            title: 'Custom Notification',
            subtitle: 'Subtitle of the Notification',
            body: 'Body of Custom Notification',
            silent: true,
            icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEV0lEQVR4nO2Yb0wbZRzHb86Y+PeF+NZME1/5whcmmvhKX6ov9sY1Jl47NRoidwyHCC0oY5O2oNlYFhtHI6PDOcs6Mw2bZjDHXenfu2tH50ix/Bm0/OldwRgEicmEn3nYbinncy2s114X902+77+f556n329KEPf0P1HPuXiFqzfRHuDFrsVFeIy4W+TwjDzS7R4zd7sTS67eMRhgZ6T5zF/BsofweEYeOOlOVHa7EwsouOy+/iSImVWYE1fCZQnR0gL3uXrHDV2nE/PZwZUAtyC4soLo/G78Vec3v83gguMAxMwqzMytCLpDOE6M7unsGc0ZHLnbPQbuHycgNbu8CSI1uxxZWIBHSx687avYG1+eiKfyBb8ZPgGu3nEI8BIM+ubhwkAKJqaWbkMkZ5aHS/olTDT7UofzWt7g8sm7ztwMn21fSIS+i0m4Gv99A2J69s9YySCMNHPm/TofdH2b2PLJq9nPSdA3kAL+SmZtcnpppOgQb1Z5nzRS7A0jzYLFJhQUPqDwhUuptVA0c7GoECTFfI7CI5uqWTjSeQ0bvgdzbbZqf1hqKEr4ysrIQyTFLsoAyMqrhMKf3ObJB5Tvg5PeLgoAWcVS2eFly1dJi/ABXoIgn3m5CPFhB0kzcRwAukqHj/+qSfgAcnR+l+bxTRT7Oi687A+bQ9qE58UbDAP3aw5gpJn+XABV5gCcOjuhBcR1zcOT+4aeNdLMei6A6qYgHPgiWjgAJzHaA1CMM1d45JpPQ2Cx8fDL0FyhV8ilaXhDbfBxkmJX8gHUtoSg0S5Ah3Ok0C9wUFMAI+2l84VHrjvEbQCYbXxBAH5OekdTALKKfWErAA2t/AYAsvvc5B0D+IT0K5oCbEBQbCwfgOVWeOSDh6/cMUAolH5KewCa2Z8r/N593tvhkdFjHvSly6cDTPSlCpJi/1YDeHf/0CYA5GNfb/8x+3lpiiiWjDR7Vg3gvY98/wFotAnl0QGy3qpmX1MDqKzHANgF8Jyf0rcDlH+ZkBSTVJsROIDPjgzr2wFKkTTbqjYjcAAWKw/eoKhfByhlrPY+TVLMGm5G4ACQHa64vh2glJFmBtVmBPYr2AV9O0ApE8WY1GYE1jYBfvhpWr8OUMpQG3yQpNg/sgHMWTMCZ+vRYX07QCmSYo+rzQiczVYehsJp/Tog18DbW7N5RqjZ2TOqXwfkGni4GYF1W0TfDlAbeNgZofKYz/cnc7wBcTdRSskDT21G4Gw/FlM7/UmPB3YSpRYaeJTKjMA/ZgF8YVwDix8QeggNPFplRqgZ/Q2p+Plc7I+lH9YFAA28mubgynYAPlE8Zj8vHiD0FN0UfL6mOdRZ1xIeM1v5f/IBoM74+fKsfPqrTGTuCaJcZPB4dja0Cy9+3Mp11B/i4xYbv46DaHdcle++gyhnWexchaUtYrC0cqfMNn5BBmiw8us+TlwLRqVniLtGADsabdHnmqx8faNduHz6++tH9Y50T0SB+hf2BErs45R7VwAAAABJRU5ErkJggg==',
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
        this.audioEle = document.body.createEl('audio', {
            attr: {
                src: SETTINGS.noticeAudio.value,
            },
        });
    }

    onload() {
        document.body.removeChild(this.audioEle)
    }

    playNoticeAudio() {
        if (this.audioEle.currentSrc !== SETTINGS.noticeAudio.value) {
            this.audioEle.src = SETTINGS.noticeAudio.value;
        }
        this.audioEle.play();
    }

    sendNotification(title: string, content: string) {
        new Notification(title, {
            body: content,
            icon: this.options.icon,
            silent: true
        });
    }
    systemNotify(title: string, content: string) {
        if (!electron) return;
        this.options.body = content;
        this.options.title = title;
        const customNotification = new electron.remote.Notification(this.options);
        customNotification.show();
    }

    nativeSystemNotify(title: string, content: string) {
        if (!window.Notification) return;
        if (window.Notification.permission == 'granted') {
            // 判断是否有权限
            this.sendNotification(title, content);
        } else if (window.Notification.permission != 'denied') {
            window.Notification.requestPermission(permission => {
                // 没有权限发起请求
                this.sendNotification(title, content);
            });
        }
    }
}

export const NotifyUtil = new NotifyUtils();
