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
import { debounce } from 'lodash-es';
import { randomColor } from '@/utils/common';
import { EditorUtils } from '@/utils/editor';
import type { SettingModel } from 'model/settings';

const cursorEffects: object[] = [];
let oldCursorEffects: object[] = [];
let newCanvas: HTMLCanvasElement;
function enableCursorEffect(effectName) {
    const canvasesBefore = Array.from(document.querySelectorAll('canvas'));
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
    const canvasesAfter = Array.from(document.querySelectorAll('canvas'));
    newCanvas = canvasesAfter.find(canvas => !canvasesBefore.includes(canvas)) as unknown as HTMLCanvasElement;
    // 调整特效层级，解决在侧边栏和设置弹窗时不可见的问题
    newCanvas.style.zIndex = '9999';
}

export function toggleCursorEffects(target: string) {
    const appendHandle = debounce(() => {
        if (!document.body.contains(newCanvas)) {
            document.body.appendChild(newCanvas);
        }
    }, 500);

    const appendCanvas = (event: Event) => {
        appendHandle();
    };
    const removeCanvas = (event: Event) => {
        if (document.body.contains(newCanvas)) {
            document.body.removeChild(newCanvas);
        }
    };
    oldCursorEffects = [...cursorEffects];
    const titlebarEleList = document.querySelectorAll('.titlebar, .workspace-tab-header-container');
    if (target != 'none') {
        disableCursorEffect();
        // mouseenter无法完成该效果
        titlebarEleList.forEach(ele => {
            ele.addEventListener('mouseenter', removeCanvas);
            ele.addEventListener('mouseleave', appendCanvas);
        });
        enableCursorEffect(target);
    } else {
        titlebarEleList.forEach(ele => {
            ele.removeEventListener('mouseenter', removeCanvas);
            ele.removeEventListener('mouseleave', appendCanvas);
        });
        disableCursorEffect();
    }
}

function disableCursorEffect() {
    cursorEffects.forEach(emo => emo.destroy());
}

let text_idx = 0;

function outOfAera(e: MouseEvent) {
    return !activeDocument.querySelector('.cm-focused .cm-content')?.contains(e.targetNode);
}

export function toggleMouseClickEffects(e: MouseEvent, text: SettingModel<string, string>) {
    if (!text || outOfAera(e)) {
        return;
    }
    const textList = text.value.split(',');
    const ele = document.createElement('b');
    document.body.appendChild(ele).innerHTML = textList[text_idx];
    text_idx = (text_idx + 1) % textList.length;

    const f = 16, // 字体大小
        x = e.clientX - f / 2, // 横坐标
        color = randomColor(); // 随机颜色
    let y = e.clientY - f, // 纵坐标
        a = 1, // 透明度
        s = 1.2; // 放大缩小
    const timer = setInterval(function () {
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
