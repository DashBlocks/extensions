/* Author: ABDev */
(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('DashFX Ultra должен запускаться в unsandboxed-режиме!');
    }

    const MORE_EASINGS = {
        easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
        easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
        easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
        easeInExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
        easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
        easeInOutExpo: (t) => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
        easeInCirc: (t) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
        easeOutCirc: (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
        easeInOutCirc: (t) => (t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2),
        easeInElastic: (t) => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
        },
        easeInOutElastic: (t) => {
            const c5 = (2 * Math.PI) / 4.5;
            return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
                ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
                : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
        }
    };

    const EASINGS = {
        ...MORE_EASINGS,
        linear: (t) => t,
        easeInQuad: (t) => t * t,
        easeOutQuad: (t) => t * (2 - t),
        easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
        easeInCubic: (t) => t * t * t,
        easeOutCubic: (t) => --t * t * t + 1,
        easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
        easeOutBack: (t) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        },
        easeInBack: (t) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return c3 * t * t * t - c1 * t * t;
        },
        easeOutElastic: (t) => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },
        easeOutBounce: (t) => {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) return n1 * t * t;
            if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
            if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    };

    class OverlayManager {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.texts = [];
            this.shakeTime = 0;
            this.shakeIntensity = 0;
            this.flashAlpha = 0;
            this.flashColor = '#ffffff';
            this.running = false;
            this.lastTime = performance.now();
        }

        _findStageContainer() {
            const canvases = document.querySelectorAll('canvas');
            for (const c of canvases) {
                if (c.width >= 300 && c.height >= 200 && c.id !== 'dashfx-overlay-canvas') {
                    return c.parentElement;
                }
            }
            return document.body;
        }

        ensureCanvas() {
            if (this.canvas && document.body.contains(this.canvas)) return true;
            const container = this._findStageContainer();
            if (!container) return false;

            const canvas = document.createElement('canvas');
            canvas.id = 'dashfx-overlay-canvas';
            Object.assign(canvas.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: '50'
            });
            canvas.width = 480;
            canvas.height = 360;

            if (getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
            }
            container.appendChild(canvas);

            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            if (!this.running) {
                this.running = true;
                this.lastTime = performance.now();
                requestAnimationFrame((t) => this._loop(t));
            }
            return true;
        }

        toCanvasX(scratchX) {
            return 240 + Number(scratchX);
        }

        toCanvasY(scratchY) {
            return 180 - Number(scratchY);
        }

        spawnParticles(type, x, y, count, color) {
            this.ensureCanvas();
            const cx = this.toCanvasX(x);
            const cy = this.toCanvasY(y);
            const n = Math.min(200, Math.max(1, Math.floor(count)));

            for (let i = 0; i < n; i++) {
                const angle = Math.random() * Math.PI * 2;
                let speed = 1 + Math.random() * 4;
                let vx = Math.cos(angle) * speed;
                let vy = Math.sin(angle) * speed;
                let life = 0.6 + Math.random() * 0.8;
                let size = 2 + Math.random() * 4;
                let gravity = 0.08;
                let pColor = color || '#00cec9';

                if (type === 'снег') {
                    vx = (Math.random() - 0.5) * 1.2;
                    vy = 0.8 + Math.random() * 1.5;
                    gravity = 0;
                    life = 2.0 + Math.random() * 1.5;
                    pColor = '#ffffff';
                } else if (type === 'дождь') {
                    vx = -0.5;
                    vy = 5 + Math.random() * 4;
                    gravity = 0.1;
                    life = 1.0 + Math.random() * 0.5;
                    pColor = '#74b9ff';
                } else if (type === 'конфетти') {
                    const palette = ['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#a29bfe', '#fd79a8'];
                    pColor = palette[Math.floor(Math.random() * palette.length)];
                    speed = 2 + Math.random() * 5;
                    vx = Math.cos(angle) * speed;
                    vy = Math.sin(angle) * speed - 2;
                    size = 4 + Math.random() * 4;
                } else if (type === 'огонь') {
                    const fire = ['#ff7675', '#fdcb6e', '#e17055', '#d63031'];
                    pColor = fire[Math.floor(Math.random() * fire.length)];
                    vx = (Math.random() - 0.5) * 1.5;
                    vy = -(1.5 + Math.random() * 3);
                    gravity = -0.04;
                    life = 0.5 + Math.random() * 0.5;
                } else if (type === 'дым') {
                    pColor = '#b2bec3';
                    vx = (Math.random() - 0.5) * 1.2;
                    vy = -(0.5 + Math.random() * 1.5);
                    gravity = -0.02;
                    size = 6 + Math.random() * 6;
                } else if (type === 'пузыри') {
                    pColor = '#74b9ff';
                    vx = (Math.random() - 0.5) * 1.5;
                    vy = -(1 + Math.random() * 2);
                    gravity = -0.03;
                } else if (type === 'сердечки') {
                    pColor = '#ff7675';
                    vy = -(1 + Math.random() * 2);
                    gravity = 0.02;
                } else if (type === 'листья') {
                    const lc = ['#e17055', '#fdcb6e', '#00b894', '#d63031'];
                    pColor = lc[Math.floor(Math.random() * lc.length)];
                    vx = (Math.random() - 0.5) * 2;
                    vy = 0.8 + Math.random() * 1.5;
                    gravity = 0.01;
                } else if (type === 'салют') {
                    const fc = ['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#a29bfe'];
                    pColor = fc[Math.floor(Math.random() * fc.length)];
                    speed = 3 + Math.random() * 6;
                    vx = Math.cos(angle) * speed;
                    vy = Math.sin(angle) * speed;
                    gravity = 0.12;
                } else if (type === 'магия') {
                    const mc = ['#a29bfe', '#00cec9', '#fd79a8'];
                    pColor = mc[Math.floor(Math.random() * mc.length)];
                    gravity = 0;
                } else if (type === 'золото') {
                    pColor = '#ffeaa7';
                    gravity = 0.1;
                } else if (type === 'пиксели') {
                    size = 4 + Math.random() * 4;
                    gravity = 0.05;
                } else if (type === 'звёзды') {
                    pColor = '#ffeaa7';
                    gravity = 0;
                    size = 3 + Math.random() * 4;
                }

                this.particles.push({
                    type,
                    x: cx,
                    y: cy,
                    vx,
                    vy,
                    life,
                    maxLife: life,
                    size,
                    gravity,
                    color: pColor,
                    rot: Math.random() * Math.PI * 2,
                    vRot: (Math.random() - 0.5) * 0.25,
                    sway: Math.random() * 10
                });
            }
        }

        addAnimatedText(id, text, x, y, style, color, size, duration) {
            this.ensureCanvas();
            this.texts = this.texts.filter((t) => t.id !== id);
            this.texts.push({
                id: String(id),
                text: String(text),
                x: this.toCanvasX(x),
                y: this.toCanvasY(y),
                style: style || 'обычный',
                color: color || '#ffffff',
                size: Math.max(8, Math.min(120, Number(size) || 20)),
                duration: Math.max(0.1, Number(duration) || 3),
                elapsed: 0
            });
        }

        removeText(id) {
            this.texts = this.texts.filter((t) => t.id !== String(id));
        }

        triggerShake(intensity, duration) {
            this.ensureCanvas();
            this.shakeIntensity = Math.max(0, Number(intensity) || 8);
            this.shakeTime = Math.max(0, Number(duration) || 0.4);
        }

        triggerFlash(color, alpha) {
            this.ensureCanvas();
            this.flashColor = color || '#ffffff';
            this.flashAlpha = Math.max(0, Math.min(1, Number(alpha) || 0.8));
        }

        clearAll() {
            this.particles = [];
            this.texts = [];
            this.shakeTime = 0;
            this.flashAlpha = 0;
            if (this.ctx && this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        _loop(now) {
            if (!this.running) return;
            const dt = Math.min(0.05, (now - this.lastTime) / 1000);
            this.lastTime = now;

            if (this.ctx && this.canvas) {
                const ctx = this.ctx;
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                if (this.shakeTime > 0) {
                    this.shakeTime -= dt;
                    const dx = (Math.random() - 0.5) * 2 * this.shakeIntensity;
                    const dy = (Math.random() - 0.5) * 2 * this.shakeIntensity;
                    if (this.canvas.parentElement) {
                        this.canvas.parentElement.style.transform = `translate(${dx}px, ${dy}px)`;
                    }
                } else if (this.canvas.parentElement && this.canvas.parentElement.style.transform) {
                    this.canvas.parentElement.style.transform = '';
                }

                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];
                    p.x += p.vx + (p.type === 'снег' ? Math.sin(now / 300 + p.sway) * 0.4 : 0);
                    p.y += p.vy;
                    p.vy += p.gravity;
                    p.vx *= 0.99;
                    p.rot += p.vRot;
                    p.life -= dt;
                    if (p.life <= 0) {
                        this.particles.splice(i, 1);
                        continue;
                    }
                    const alpha = Math.max(0, p.life / p.maxLife);
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.fillStyle = p.color;
                    ctx.strokeStyle = p.color;

                    if (p.type === 'конфетти') {
                        ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
                    } else if (p.type === 'дождь') {
                        ctx.lineWidth = 1.8;
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(p.vx * 2, p.vy * 2);
                        ctx.stroke();
                    } else if (p.type === 'звёзды') {
                        ctx.shadowColor = p.color;
                        ctx.shadowBlur = 8;
                        ctx.beginPath();
                        for (let s = 0; s < 5; s++) {
                            const a = (s * 4 * Math.PI) / 5 - Math.PI / 2;
                            ctx.lineTo(Math.cos(a) * p.size * 1.4, Math.sin(a) * p.size * 1.4);
                        }
                        ctx.closePath();
                        ctx.fill();
                    } else {
                        if (p.type === 'огонь' || p.type === 'искры') {
                            ctx.shadowColor = p.color;
                            ctx.shadowBlur = 10;
                        }
                        ctx.beginPath();
                        ctx.arc(0, 0, Math.max(0.5, p.size * alpha), 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();
                }

                for (let i = this.texts.length - 1; i >= 0; i--) {
                    const t = this.texts[i];
                    t.elapsed += dt;
                    if (t.elapsed >= t.duration) {
                        this.texts.splice(i, 1);
                        continue;
                    }
                    const progress = t.elapsed / t.duration;
                    ctx.save();
                    ctx.font = `bold ${t.size}px ${t.font || 'Arial'}, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    let drawText = t.text;
                    let drawY = t.y;
                    let alpha = 1;

                    let drawX = t.x;
                    let scale = 1;
                    let angle = 0;
                    if (t.style === 'печатная машинка' || t.style === 'печатание+неон') {
                        const chars = Math.floor(t.text.length * Math.min(1, progress * 1.5));
                        drawText = t.text.slice(0, chars);
                        if (t.style === 'печатание+неон') {
                            ctx.shadowColor = t.color;
                            ctx.shadowBlur = 14;
                        }
                    } else if (t.style === 'всплытие') {
                        drawY -= progress * 35;
                        alpha = 1 - progress;
                    } else if (t.style === 'неон') {
                        ctx.shadowColor = t.color;
                        ctx.shadowBlur = 12 + Math.sin(now / 150) * 6;
                    } else if (t.style === 'радуга') {
                        ctx.fillStyle = `hsl(${(now / 5) % 360}, 90%, 65%)`;
                    } else if (t.style === 'волна') {
                        drawY += Math.sin(now / 180) * 8;
                    } else if (t.style === 'глитч') {
                        if (Math.random() < 0.25) {
                            drawX += (Math.random() - 0.5) * 10;
                            drawY += (Math.random() - 0.5) * 6;
                        }
                        ctx.shadowColor = '#ff0055';
                        ctx.shadowBlur = 6;
                    } else if (t.style === 'дрожание') {
                        drawX += (Math.random() - 0.5) * 4;
                        drawY += (Math.random() - 0.5) * 4;
                    } else if (t.style === 'пульсация') {
                        scale = 1 + Math.sin(now / 150) * 0.15;
                    } else if (t.style === 'прыжок') {
                        drawY -= Math.abs(Math.sin(now / 200)) * 18;
                    } else if (t.style === 'матрица') {
                        ctx.fillStyle = '#00ff66';
                        ctx.shadowColor = '#00ff66';
                        ctx.shadowBlur = 8;
                    } else if (t.style === 'выцветание') {
                        alpha = 1 - progress;
                    } else if (t.style === 'появление') {
                        alpha = Math.min(1, progress * 3);
                    } else if (t.style === 'тень') {
                        ctx.shadowColor = 'rgba(0,0,0,0.85)';
                        ctx.shadowOffsetX = 3;
                        ctx.shadowOffsetY = 3;
                        ctx.shadowBlur = 4;
                    } else if (t.style === 'огонь') {
                        ctx.fillStyle = '#ff7675';
                        ctx.shadowColor = '#fdcb6e';
                        ctx.shadowBlur = 14 + Math.random() * 6;
                    } else if (t.style === 'лёд') {
                        ctx.fillStyle = '#74b9ff';
                        ctx.shadowColor = '#00cec9';
                        ctx.shadowBlur = 12;
                    } else if (t.style === 'киберпанк') {
                        ctx.fillStyle = '#00cec9';
                        ctx.shadowColor = '#ff007f';
                        ctx.shadowBlur = 14;
                    } else if (t.style === 'золото') {
                        ctx.fillStyle = '#ffeaa7';
                        ctx.shadowColor = '#fdcb6e';
                        ctx.shadowBlur = 10;
                    } else if (t.style === 'вращение') {
                        angle = Math.sin(now / 300) * 0.2;
                    } else if (t.style === 'мигание') {
                        alpha = Math.sin(now / 120) > 0 ? 1 : 0.2;
                    }

                    ctx.globalAlpha = Math.max(0, alpha);
                    ctx.translate(drawX, drawY);
                    if (angle !== 0) ctx.rotate(angle);
                    if (scale !== 1) ctx.scale(scale, scale);

                    if (!['радуга', 'матрица', 'огонь', 'лёд', 'киберпанк', 'золото'].includes(t.style)) {
                        ctx.fillStyle = t.color;
                    }
                    if (t.style === 'обводка') {
                        ctx.strokeStyle = '#000000';
                        ctx.lineWidth = 4;
                        ctx.strokeText(drawText, 0, 0);
                    }
                    ctx.fillText(drawText, 0, 0);
                    ctx.restore();
                }

                if (this.flashAlpha > 0) {
                    ctx.save();
                    ctx.globalAlpha = this.flashAlpha;
                    ctx.fillStyle = this.flashColor;
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    ctx.restore();
                    this.flashAlpha = Math.max(0, this.flashAlpha - dt * 2.5);
                }
            }

            requestAnimationFrame((t) => this._loop(t));
        }
    }

    class DashFXUltra {
        constructor() {
            this.overlay = new OverlayManager();
            this.activeTweens = new Map();
        }

        getInfo() {
            return {
                id: 'dashFXUltra',
                name: 'DashFX Ultra',
                color1: '#E84393',
                color2: '#D63031',
                color3: '#B33771',
                menus: {
                    easings: {
                        acceptReporters: true,
                        items: Object.keys(EASINGS)
                    },
                    particleTypes: {
                        acceptReporters: true,
                        items: ['искры', 'конфетти', 'снег', 'дождь', 'огонь', 'звёзды', 'дым', 'пузыри', 'сердечки', 'листья', 'салют', 'магия', 'лазер', 'молнии', 'пыль', 'золото', 'кристаллы', 'пух', 'неон', 'пиксели', 'угольки']
                    },
                    textProps: { acceptReporters: true, items: ['текст', 'x', 'y', 'цвет', 'размер', 'стиль', 'шрифт'] },
                    fonts: { acceptReporters: true, items: ["Arial","Verdana","Georgia","Times New Roman","Courier New","Trebuchet MS","Impact","Comic Sans MS","Tahoma","Lucida Console","Palatino","Garamond","Bookman","Segoe UI","Roboto","Open Sans","Montserrat","Lato","Poppins","Oswald","Raleway","Nunito","Ubuntu","Merriweather","Playfair Display","Fira Code","JetBrains Mono","Consolas","Monaco","system-ui","monospace","cursive","fantasy", "PT Sans", "PT Serif", "PT Mono", "Rubik", "Comfortaa", "Inter", "Manrope", "Nunito Sans", "Exo 2", "Jura", "Russo One", "Press Start 2P", "Lobster", "Pacifico", "Caveat", "Bad Script", "Marck Script", "Cormorant Garamond", "Yanone Kaffeesatz", "Fira Sans", "IBM Plex Sans", "Source Sans 3", "Noto Sans", "Noto Serif"] },
                    textStyles: {
                        acceptReporters: true,
                        items: ['обычный', 'печатная машинка', 'всплытие', 'неон', 'радуга', 'волна', 'глитч', 'дрожание', 'пульсация', 'прыжок', 'матрица', 'выцветание', 'появление', 'тень', 'обводка', 'печатание+неон', 'огонь', 'лёд', 'киберпанк', 'золото', 'вращение', 'мигание']
                    }
                },
                blocks: [
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Плавные анимации спрайта (Tween)'
                    },
                    {
                        opcode: 'tweenXY',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'плавно в x:[X] y:[Y] за [SEC] сек стиль [EASE]',
                        arguments: {
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                            SEC: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.8 },
                            EASE: { type: Scratch.ArgumentType.STRING, menu: 'easings', defaultValue: 'easeOutBack' }
                        }
                    },
                    {
                        opcode: 'tweenSize',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'плавно размер до [SIZE]% за [SEC] сек стиль [EASE]',
                        arguments: {
                            SIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 120 },
                            SEC: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.5 },
                            EASE: { type: Scratch.ArgumentType.STRING, menu: 'easings', defaultValue: 'easeOutElastic' }
                        }
                    },
                    {
                        opcode: 'tweenAngle',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'плавно повернуть к [DIR]° за [SEC] сек стиль [EASE]',
                        arguments: {
                            DIR: { type: Scratch.ArgumentType.NUMBER, defaultValue: 90 },
                            SEC: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.6 },
                            EASE: { type: Scratch.ArgumentType.STRING, menu: 'easings', defaultValue: 'easeInOutCubic' }
                        }
                    },
                    {
                        opcode: 'tweenGhost',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'плавно прозрачность до [GHOST] за [SEC] сек',
                        arguments: {
                            GHOST: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                            SEC: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.5 }
                        }
                    },
                    {
                        opcode: 'pulseSprite',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'пульсация спрайта [SCALE]% за [SEC] сек',
                        arguments: {
                            SCALE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 115 },
                            SEC: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.3 }
                        }
                    },

                    '---',
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Анимированный текст поверх сцены'
                    },
                    {
                        opcode: 'showText',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'текст id:[ID] "[TEXT]" x:[X] y:[Y] стиль:[STYLE] цвет:[COLOR] размер:[SIZE] на [SEC] сек',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'title' },
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Привет, DashBlocks!' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                            STYLE: { type: Scratch.ArgumentType.STRING, menu: 'textStyles', defaultValue: 'неон' },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#00cec9' },
                            SIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 24 },
                            SEC: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 }
                        }
                    },
                    {
                        opcode: 'editText',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'изменить текст id:[ID] [PROP] на [VAL]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'title' },
                            PROP: { type: Scratch.ArgumentType.STRING, menu: 'textProps', defaultValue: 'текст' },
                            VAL: { type: Scratch.ArgumentType.STRING, defaultValue: 'Новый текст!' }
                        }
                    },
                    {
                        opcode: 'setTextFont',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'шрифт текста id:[ID] [FONT]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'title' },
                            FONT: { type: Scratch.ArgumentType.STRING, menu: 'fonts', defaultValue: 'Arial' }
                        }
                    },
                    {
                        opcode: 'hideText',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'удалить текст id:[ID]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'title' }
                        }
                    },

                    '---',
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Частицы и эффекты экрана'
                    },
                    {
                        opcode: 'spawnParticles',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'частицы [TYPE] в x:[X] y:[Y] кол-во:[COUNT] цвет:[COLOR]',
                        arguments: {
                            TYPE: { type: Scratch.ArgumentType.STRING, menu: 'particleTypes', defaultValue: 'конфетти' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                            COUNT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 40 },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#00cec9' }
                        }
                    },
                    {
                        opcode: 'screenShake',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'тряска экрана сила:[POWER] на [SEC] сек',
                        arguments: {
                            POWER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
                            SEC: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.4 }
                        }
                    },
                    {
                        opcode: 'screenFlash',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'вспышка экрана цвет:[COLOR] яркость:[ALPHA]',
                        arguments: {
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#ffffff' },
                            ALPHA: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.8 }
                        }
                    },
                    {
                        opcode: 'clearAllFX',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'очистить все эффекты и тексты'
                    }
                ]
            };
        }

        _runTween(durationSec, easeName, onUpdate) {
            const dur = Math.max(0.01, Number(durationSec) || 0.5) * 1000;
            const easeFn = EASINGS[easeName] || EASINGS.linear;
            const start = performance.now();

            return new Promise((resolve) => {
                const step = (now) => {
                    const t = Math.min(1, (now - start) / dur);
                    onUpdate(easeFn(t));
                    if (t < 1) {
                        requestAnimationFrame(step);
                    } else {
                        resolve();
                    }
                };
                requestAnimationFrame(step);
            });
        }

        tweenXY(args, util) {
            const target = util.target;
            const startX = target.x;
            const startY = target.y;
            const endX = Number(args.X) || 0;
            const endY = Number(args.Y) || 0;
            return this._runTween(args.SEC, args.EASE, (p) => {
                target.setXY(startX + (endX - startX) * p, startY + (endY - startY) * p);
            });
        }

        tweenSize(args, util) {
            const target = util.target;
            const startS = target.size;
            const endS = Number(args.SIZE) || 100;
            return this._runTween(args.SEC, args.EASE, (p) => {
                target.setSize(startS + (endS - startS) * p);
            });
        }

        tweenAngle(args, util) {
            const target = util.target;
            const startD = target.direction;
            const endD = Number(args.DIR) || 90;
            return this._runTween(args.SEC, args.EASE, (p) => {
                target.setDirection(startD + (endD - startD) * p);
            });
        }

        tweenGhost(args, util) {
            const target = util.target;
            const startG = target.effects.ghost || 0;
            const endG = Math.max(0, Math.min(100, Number(args.GHOST) || 0));
            return this._runTween(args.SEC, 'easeInOutQuad', (p) => {
                target.setEffect('ghost', startG + (endG - startG) * p);
            });
        }

        async pulseSprite(args, util) {
            const target = util.target;
            const orig = target.size;
            const peak = Number(args.SCALE) || 115;
            const half = (Number(args.SEC) || 0.3) / 2;
            await this._runTween(half, 'easeOutQuad', (p) => target.setSize(orig + (peak - orig) * p));
            await this._runTween(half, 'easeInQuad', (p) => target.setSize(peak + (orig - peak) * p));
        }

        showText(args) {
            this.overlay.addAnimatedText(
                args.ID,
                args.TEXT,
                args.X,
                args.Y,
                args.STYLE,
                args.COLOR,
                args.SIZE,
                args.SEC
            );
        }

        editText(args) {
            const t = this.overlay.texts.find((item) => item.id === String(args.ID));
            if (!t) return;
            const prop = String(args.PROP);
            if (prop === 'текст') t.text = String(args.VAL);
            else if (prop === 'x') t.x = this.overlay.toCanvasX(args.VAL);
            else if (prop === 'y') t.y = this.overlay.toCanvasY(args.VAL);
            else if (prop === 'цвет') t.color = String(args.VAL);
            else if (prop === 'размер') t.size = Math.max(8, Math.min(120, Number(args.VAL) || 20));
            else if (prop === 'стиль') t.style = String(args.VAL);
            else if (prop === 'шрифт') t.font = String(args.VAL);
        }

        setTextFont(args) {
            const t = this.overlay.texts.find((item) => item.id === String(args.ID));
            if (t) t.font = String(args.FONT || 'Arial');
        }

        hideText(args) {
            this.overlay.removeText(args.ID);
        }

        spawnParticles(args) {
            this.overlay.spawnParticles(args.TYPE, args.X, args.Y, args.COUNT, args.COLOR);
        }

        screenShake(args) {
            this.overlay.triggerShake(args.POWER, args.SEC);
        }

        screenFlash(args) {
            this.overlay.triggerFlash(args.COLOR, args.ALPHA);
        }

        async jumpSprite(args, util) {
            const target = util.target;
            const startY = target.y;
            const h = Number(args.HEIGHT) || 40;
            const half = (Number(args.SEC) || 0.4) / 2;
            await this._runTween(half, 'easeOutQuad', (p) => target.setXY(target.x, startY + h * p));
            await this._runTween(half, 'easeInQuad', (p) => target.setXY(target.x, startY + h * (1 - p)));
        }

        async wobbleSprite(args, util) {
            const target = util.target;
            const orig = target.direction;
            const ang = Number(args.ANGLE) || 15;
            const dur = (Number(args.SEC) || 0.4) / 4;
            await this._runTween(dur, 'easeOutSine', (p) => target.setDirection(orig + ang * p));
            await this._runTween(dur * 2, 'easeInOutSine', (p) => target.setDirection(orig + ang - ang * 2 * p));
            await this._runTween(dur, 'easeInSine', (p) => target.setDirection(orig - ang + ang * p));
        }

        tweenColor(args, util) {
            const target = util.target;
            const startC = target.effects.color || 0;
            const endC = Number(args.COLOR) || 0;
            return this._runTween(args.SEC, 'linear', (p) => {
                target.setEffect('color', startC + (endC - startC) * p);
            });
        }

        tweenBrightness(args, util) {
            const target = util.target;
            const startB = target.effects.brightness || 0;
            const endB = Number(args.VAL) || 0;
            return this._runTween(args.SEC, 'easeInOutQuad', (p) => {
                target.setEffect('brightness', startB + (endB - startB) * p);
            });
        }

        clearAllFX() {
            this.overlay.clearAll();
        }
    }

    Scratch.extensions.register(new DashFXUltra());
})(Scratch);
