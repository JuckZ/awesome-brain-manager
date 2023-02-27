import {
    // Bloop bloop bloop, you're under the se
    bubbleCursor,
    // An oldie, a little ugly, but true history
    clockCursor,
    // A nice modern dusting of emoji based particles
    emojiCursor,
    // An old classic, sprinkling stardust onto the page
    fairyDustCursor,
    // A dot that follows your mouse with a little lag, a modern look
    followingDotCursor,
    // A trailing of ghost cursors, as classic as they come
    ghostCursor,
    // A little color never hurt anyone
    rainbowCursor,
    // Winter is here, and it's brought snow with it
    snowflakeCursor,
    // Guaranteed to provide fun for hours
    springyEmojiCursor,
    // A waving banner of text
    textFlag,
    // An elasticish trail of cursors that will nip to wherever your mouse is
    trailingCursor,
} from 'cursor-effects';
import type { SettingModel } from 'model/settings';
import { randomColor } from '../utils/common';

const cursorEffects: any[] = [];

function enableCursorEffect(effectName) {
    let emo;
    switch (effectName) {
        case 'bubbleCursor':
            emo = new bubbleCursor();
            break;
        case 'clockCursor':
            emo = new clockCursor();
            break;
        case 'emojiCursor':
            emo = new emojiCursor({ emoji: ['🔥', '🐬', '🦆'] });
            break;
        case 'fairyDustCursor':
            emo = new fairyDustCursor();
            break;
        case 'followingDotCursor':
            emo = new followingDotCursor();
            break;
        case 'ghostCursor':
            emo = new ghostCursor();
            break;
        case 'rainbowCursor':
            emo = new rainbowCursor();
            break;
        case 'snowflakeCursor':
            emo = new snowflakeCursor();
            break;
        case 'springyEmojiCursor':
            emo = new springyEmojiCursor();
            break;
        case 'textFlag':
            emo = new textFlag();
            break;
        case 'trailingCursor':
            emo = new trailingCursor();
            break;
        default:
            break;
    }
    cursorEffects.push(emo);
}

export function toggleCursorEffects(target: string) {
    if (target != 'none') {
        disableCursorEffect();
        enableCursorEffect(target);
    } else {
        disableCursorEffect();
    }
}

function disableCursorEffect() {
    cursorEffects.forEach(emo => emo.destroy());
}

let text_idx = 0;

export function toggleMouseClickEffects(e: MouseEvent, text: SettingModel<string, string>) {
    if (!text) {
        return;
    }
    const textList = text.value.split(',');
        var ele = document.createElement('b');
        document.body.appendChild(ele).innerHTML = textList[text_idx];
        text_idx = (text_idx + 1) % textList.length;

        let f = 16, // 字体大小
            x = e.clientX - f / 2, // 横坐标
            y = e.clientY - f, // 纵坐标
            color = randomColor(), // 随机颜色
            a = 1, // 透明度
            s = 1.2; // 放大缩小
        let timer = setInterval(function () {
            //添加定时器
            if (a <= 0) {
                document.body.removeChild(ele);
                clearInterval(timer);
            } else {
                ele.style.cssText = `pointer-events: none;font-size:${f}px;position: fixed;color:${color};left:${x}px;top:${y}px;opacity:${a};transform:scale(${s});`;
                y--;
                a -= 0.016;
                s += 0.002;
            }
        }, 15);
}
