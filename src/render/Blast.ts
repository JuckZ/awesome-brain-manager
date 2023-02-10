import type { SettingModel } from 'model/settings';
import type { Editor } from 'obsidian';
import party from 'party-js';
import type { DynamicSourceType } from 'party-js/lib/systems/sources';

let shakeTime = 0,
    shakeTimeMax = 0,
    lastTime = 0,
    particlePointer = 0,
    effect: string,
    isActive = false,
    enableShake: SettingModel<boolean, boolean>,
    cmNode,
    titleBarHeight = 40,
    canvas,
    ctx;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (window.app.isMobile) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    titleBarHeight = document.getElementsByClassName('view-header')[5]?.innerHeight || 40;
} else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    titleBarHeight = document.getElementsByClassName('titlebar')[0]?.innerHeight || 40;
}
const shakeIntensity = 5,
    particles: any[] = [],
    MAX_PARTICLES = 500,
    PARTICLE_NUM_RANGE = { min: 5, max: 10 },
    PARTICLE_GRAVITY = 0.08,
    PARTICLE_ALPHA_FADEOUT = 0.96,
    PARTICLE_VELOCITY_RANGE = {
        x: [-1, 1],
        y: [-3.5, -1.5],
    },
    w = window.innerWidth,
    h = window.innerHeight - titleBarHeight;
const throttledShake = throttle(shake, 100);
const throttledSpawnParticles = throttle(spawnParticles, 100);
const throttledPartyMe = throttle(partyMe, 100);

function heartBeat(node) {
    const heartPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    heartPath.setAttribute(
        'd',
        'M316.722,29.761c66.852,0,121.053,54.202,121.053,121.041c0,110.478-218.893,257.212-218.893,257.212S0,266.569,0,150.801 C0,67.584,54.202,29.761,121.041,29.761c40.262,0,75.827,19.745,97.841,49.976C240.899,49.506,276.47,29.761,316.722,29.761z',
    );

    const heartShape = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as unknown as HTMLElement;
    heartShape.setAttribute('viewBox', '0 0 512 512');
    heartShape.setAttribute('height', '20');
    heartShape.setAttribute('width', '20');
    heartShape.appendChild(heartPath);

    party.scene.current.createEmitter({
        emitterOptions: {
            loops: 1,
            useGravity: false,
            modules: [
                new party.ModuleBuilder()
                    .drive('size')
                    .by(t => 0.5 + 0.3 * (Math.cos(t * 10) + 1))
                    .build(),
                new party.ModuleBuilder()
                    .drive('rotation')
                    .by(t => new party.Vector(0, 0, 100).scale(t))
                    .relative()
                    .build(),
            ],
        },
        emissionOptions: {
            rate: 0,
            bursts: [{ time: 0, count: party.variation.skew(20, 10) }],
            sourceSampler: party.sources.dynamicSource(node),
            angle: party.variation.range(0, 360),
            initialSpeed: 400,
            initialColor: party.variation.gradientSample(
                party.Gradient.simple(party.Color.fromHex('#ffa68d'), party.Color.fromHex('#fd3a84')),
            ),
        },
        rendererOptions: {
            shapeFactory: heartShape,
            applyLighting: undefined,
        },
    });
}

function partyMe(cm) {
    const cursorPos = cm.getCursor();
    const pos = cm.coordsAtPos(cursorPos);
    const node = document.elementFromPoint(pos.left, pos.top) as DynamicSourceType;
    if (effect == '3') {
        party.confetti(node, {
            count: party.variation.range(20, 40),
        });
    } else if (effect == '4') {
        heartBeat(node);
    }
}

function getRGBComponents(node) {
    const color = getComputedStyle(node).color;
    if (color) {
        try {
            return color.match(/(\d+), (\d+), (\d+)/)?.slice(1);
        } catch (e) {
            return [255, 255, 255];
        }
    } else {
        return [255, 255, 255];
    }
}

function spawnParticles(cm) {
    const cursorPos = cm.getCursor();
    const pos = cm.coordsAtPos(cursorPos);
    const node = document.elementFromPoint(pos.left, pos.top);
    const numParticles = random(PARTICLE_NUM_RANGE.min, PARTICLE_NUM_RANGE.max);
    const color = getRGBComponents(node);

    for (let i = numParticles; i--; ) {
        particles[particlePointer] = createParticle(pos.left + 10, pos.top - titleBarHeight, color);
        particlePointer = (particlePointer + 1) % MAX_PARTICLES;
    }
}

function createParticle(x, y, color) {
    const p = {
        x: x,
        y: y + 10,
        alpha: 1,
        color: color,
        size: 0,
        vx: 0,
        vy: 0,
        drag: 0,
        wander: 0,
        theta: 0,
    };
    if (effect === '1') {
        p.size = random(2, 4);
        p.vx =
            PARTICLE_VELOCITY_RANGE.x[0] +
            Math.random() * (PARTICLE_VELOCITY_RANGE.x[1] - PARTICLE_VELOCITY_RANGE.x[0]);
        p.vy =
            PARTICLE_VELOCITY_RANGE.y[0] +
            Math.random() * (PARTICLE_VELOCITY_RANGE.y[1] - PARTICLE_VELOCITY_RANGE.y[0]);
    } else if (effect === '2') {
        p.size = random(2, 8);
        p.drag = 0.92;
        p.vx = random(-3, 3);
        p.vy = random(-3, 3);
        p.wander = 0.15;
        p.theta = (random(0, 360) * Math.PI) / 180;
    }
    return p;
}

function effect1(particle) {
    particle.vy += PARTICLE_GRAVITY;
    particle.x += particle.vx;
    particle.y += particle.vy;

    particle.alpha *= PARTICLE_ALPHA_FADEOUT;

    ctx.fillStyle =
        'rgba(' + particle.color[0] + ',' + particle.color[1] + ',' + particle.color[2] + ',' + particle.alpha + ')';
    ctx.fillRect(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, particle.size);
}

// Effect based on Soulwire's demo: http://codepen.io/soulwire/pen/foktm
function effect2(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= particle.drag;
    particle.vy *= particle.drag;
    particle.theta += random(-0.5, 0.5);
    particle.vx += Math.sin(particle.theta) * 0.1;
    particle.vy += Math.cos(particle.theta) * 0.1;
    particle.size *= 0.96;

    ctx.fillStyle =
        'rgba(' + particle.color[0] + ',' + particle.color[1] + ',' + particle.color[2] + ',' + particle.alpha + ')';
    ctx.beginPath();
    ctx.arc(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, 0, 2 * Math.PI);
    ctx.fill();
}

function drawParticles() {
    let particle;
    for (let i = particles.length; i--; ) {
        particle = particles[i];
        if (!particle || particle.alpha < 0.01 || particle.size <= 0.5) {
            continue;
        }

        if (effect === '1') {
            effect1(particle);
        } else if (effect === '2') {
            effect2(particle);
        }
    }
}

function shake(editor: Editor, time) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cmNode = editor.containerEl;
    shakeTime = shakeTimeMax = time;
}

function random(min, max) {
    if (!max) {
        max = min;
        min = 0;
    }
    return min + ~~(Math.random() * (max - min + 1));
}

function throttle(callback, limit) {
    let wait = false;
    return function () {
        if (!wait) {
            // eslint-disable-next-line prefer-rest-params
            callback.apply(this, arguments);
            wait = true;
            setTimeout(function () {
                wait = false;
            }, limit);
        }
    };
}

function loop() {
    if (!isActive) {
        return;
    }

    ctx.clearRect(0, 0, w, h);

    // get the time past the previous frame
    const current_time = new Date().getTime();
    if (!lastTime) lastTime = current_time;
    const dt = (current_time - lastTime) / 1000;
    lastTime = current_time;
    if (enableShake && enableShake.value && shakeTime > 0) {
        shakeTime -= dt;
        const magnitude = (shakeTime / shakeTimeMax) * shakeIntensity;
        const shakeX = random(-magnitude, magnitude);
        const shakeY = random(-magnitude, magnitude);
        cmNode.style.transform = 'translate(' + shakeX + 'px,' + shakeY + 'px)';
    }
    drawParticles();
    requestAnimationFrame(loop);
}

export function onCodeMirrorChange(editor) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    throttledShake(editor, 0.3);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    throttledSpawnParticles(editor);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    throttledPartyMe(editor);
}

export function toggleShake(targetVal: SettingModel<boolean, boolean>) {
    enableShake = targetVal;
}

export function toggleBlast(targetEffect: string) {
    if (Object.keys(powerMode).contains(targetEffect)) {
        effect = targetEffect;
        isActive = true;
        if (!canvas) {
            canvas = document.createElement('canvas');
            (ctx = canvas.getContext('2d')), (canvas.id = 'code-blast-canvas');
            canvas.style.position = 'absolute';
            canvas.style.top = `${titleBarHeight}px`;
            canvas.style.left = 0;
            canvas.style.zIndex = 1;
            canvas.style.pointerEvents = 'none';
            canvas.width = w;
            canvas.height = h;

            document.body.appendChild(canvas);
            loop();
        }
    } else {
        isActive = false;
        if (canvas) {
            canvas.remove();
            canvas = null;
        }
        return;
    }
}

export const powerMode = {
    '0': 'No Effect',
    '1': 'Effect 1',
    '2': 'Effect 2',
    '3': 'Effect 3',
    '4': 'Effect 4',
};
