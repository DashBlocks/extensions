/* Author: ABDev */
(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Нужно включить: Run without sandbox');
  }

  const CONFIG = {
    gravity: 1,
    jumpForce: 14,
    moveSpeed: 4,
    maxFallSpeed: 12,
    maxPushOut: 150
  };

  const spriteData = {};

  function runtime() {
    return Scratch.vm.runtime;
  }

  function renderer() {
    const r = runtime();
    return r ? r.renderer : null;
  }

  function getData(id) {
    if (!spriteData[id]) {
      spriteData[id] = {
        vx: 0,
        vy: 0,
        onGround: false
      };
    }
    return spriteData[id];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function списокСпрайтов() {
    try {
      const r = runtime();
      if (!r || !r.targets) return ['нет'];
      const list = [];
      for (const t of r.targets) {
        if (t.isStage || !t.isOriginal || !t.sprite) continue;
        list.push(t.sprite.name);
      }
      return list.length ? list : ['нет'];
    } catch (e) {
      return ['нет'];
    }
  }

  function parseTargets(input) {
    if (!input) return [];
    const str = String(input).trim();
    if (!str) return [];

    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  function касаетсяСпрайта(me, spriteName) {
    try {
      const r = runtime();
      const rend = renderer();
      if (!r || !rend || !me) return false;
      
      for (const other of r.targets) {
        if (!other.sprite || other.sprite.name !== spriteName) continue;
        if (other === me || !other.visible) continue;
        if (typeof rend.isTouchingDrawables === 'function') {
          if (rend.isTouchingDrawables(me.drawableID, [other.drawableID])) {
            return true;
          }
        }
      }
    } catch (e) {}
    return false;
  }

  function касаетсяЦвета(me, hex) {
    try {
      const rend = renderer();
      if (!rend || !me) return false;
      if (typeof rend.isTouchingColor !== 'function') return false;
      
      let c = String(hex).trim();
      if (c.startsWith('#')) c = c.slice(1);
      
      if (c.length === 3) {
        c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      }
      
      const r = parseInt(c.slice(0, 2), 16) || 0;
      const g = parseInt(c.slice(2, 4), 16) || 0;
      const b = parseInt(c.slice(4, 6), 16) || 0;
      
      return rend.isTouchingColor(me.drawableID, [r, g, b, 255]);
    } catch (e) {
      return false;
    }
  }

  function касаетсяОдной(me, target) {
    if (!me || !target) return false;
    const t = String(target).trim();
    if (t.startsWith('#')) {
      return касаетсяЦвета(me, t);
    }
    return касаетсяСпрайта(me, t);
  }

  function касается(me, targets) {
    if (!me || !targets) return false;
    
    const list = parseTargets(targets);
    if (list.length === 0) {
      
      return касаетсяОдной(me, targets);
    }
    
    for (const target of list) {
      if (касаетсяОдной(me, target)) {
        return true;
      }
    }
    return false;
  }

  function updateGroundState(t, targets) {
    if (!t) return;
    const data = getData(t.id);
    const oldY = t.y;

    t.setXY(t.x, t.y - 1);
    data.onGround = касается(t, targets);
    t.setXY(t.x, oldY);
  }

  function applyGravity(util, targets) {
    if (!util || !util.target) return;
    const t = util.target;
    const data = getData(t.id);

    data.vy -= CONFIG.gravity;
    data.vy = clamp(data.vy, -CONFIG.maxFallSpeed, 999);

    t.setXY(t.x, t.y + data.vy);

    if (касается(t, targets)) {
      if (data.vy < 0) {
        let steps = 0;
        while (касается(t, targets) && steps < CONFIG.maxPushOut) {
          t.setXY(t.x, t.y + 1);
          steps++;
        }
        data.vy = 0;
        data.onGround = true;
      } else if (data.vy > 0) {
        let steps = 0;
        while (касается(t, targets) && steps < CONFIG.maxPushOut) {
          t.setXY(t.x, t.y - 1);
          steps++;
        }
        data.vy = 0;
      }
    } else {
      updateGroundState(t, targets);
    }
  }

  function moveHorizontal(util, targets, dir) {
    if (!util || !util.target) return;
    const t = util.target;
    const data = getData(t.id);

    data.vx = CONFIG.moveSpeed * (dir > 0 ? 1 : -1);
    t.setXY(t.x + data.vx, t.y);

    if (касается(t, targets)) {
      let steps = 0;
      while (касается(t, targets) && steps < CONFIG.maxPushOut) {
        t.setXY(t.x - Math.sign(data.vx), t.y);
        steps++;
      }
      data.vx = 0;
    }
  }

  function jump(util, targets) {
    if (!util || !util.target) return;
    const t = util.target;
    const data = getData(t.id);

    if (targets) {
      updateGroundState(t, targets);
    }

    if (data.onGround) {
      data.vy = CONFIG.jumpForce;
      data.onGround = false;
    }
  }

  function getMovementDirection(kb) {
    const leftPressed = kb.getKeyIsDown('ArrowLeft') || 
                        kb.getKeyIsDown('Left') ||
                        kb.getKeyIsDown('left arrow') ||
                        kb.getKeyIsDown('a') || 
                        kb.getKeyIsDown('A') ||
                        kb.getKeyIsDown('ф') ||
                        kb.getKeyIsDown('Ф');
    
    const rightPressed = kb.getKeyIsDown('ArrowRight') || 
                         kb.getKeyIsDown('Right') ||
                         kb.getKeyIsDown('right arrow') ||
                         kb.getKeyIsDown('d') || 
                         kb.getKeyIsDown('D') ||
                         kb.getKeyIsDown('в') ||
                         kb.getKeyIsDown('В');
    
    if (leftPressed && rightPressed) return 0;
    if (leftPressed) return -1;
    if (rightPressed) return 1;
    return 0;
  }

  function isJumpPressed(kb) {
    return kb.getKeyIsDown(' ') || 
           kb.getKeyIsDown('space') ||
           kb.getKeyIsDown('ArrowUp') || 
           kb.getKeyIsDown('Up') ||
           kb.getKeyIsDown('up arrow') ||
           kb.getKeyIsDown('w') || 
           kb.getKeyIsDown('W') ||
           kb.getKeyIsDown('ц') ||
           kb.getKeyIsDown('Ц');
  }

  class SimpleCollisionJump {
    getInfo() {
      return {
        id: 'simpleCollisionJumpRu',
        name: 'Коллизия Прыжок Ходьба',
        color1: '#e67e22',
        color2: '#d35400',
        color3: '#a04000',
        blocks: [
          {
            blockType: Scratch.BlockType.LABEL,
            text: 'Настройки'
          },
          {
            opcode: 'setPhysics',
            blockType: Scratch.BlockType.COMMAND,
            text: 'гравитация [G] прыжок [J] скорость [S]',
            arguments: {
              G: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              J: { type: Scratch.ArgumentType.NUMBER, defaultValue: 14 },
              S: { type: Scratch.ArgumentType.NUMBER, defaultValue: 4 }
            }
          },
          {
            opcode: 'setMaxFall',
            blockType: Scratch.BlockType.COMMAND,
            text: 'макс падение [M]',
            arguments: {
              M: { type: Scratch.ArgumentType.NUMBER, defaultValue: 12 }
            }
          },
          {
            opcode: 'setMaxPushOut',
            blockType: Scratch.BlockType.COMMAND,
            text: 'макс выталкивание [P] пикселей',
            arguments: {
              P: { type: Scratch.ArgumentType.NUMBER, defaultValue: 150 }
            }
          },

          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: 'Целая физика'
          },
          {
            opcode: 'platformerSprite',
            blockType: Scratch.BlockType.COMMAND,
            text: 'физика на спрайт [P]',
            arguments: {
              P: { type: Scratch.ArgumentType.STRING, menu: 'sprites' }
            }
          },
          {
            opcode: 'platformerMulti',
            blockType: Scratch.BlockType.COMMAND,
            text: 'физика на [T]',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: 'Земля, Платформа' }
            }
          },
          {
            opcode: 'platformerColor',
            blockType: Scratch.BlockType.COMMAND,
            text: 'физика на цвет [C]',
            arguments: {
              C: { type: Scratch.ArgumentType.COLOR, defaultValue: '#00ff00' }
            }
          },

          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: 'Отдельно'
          },
          {
            opcode: 'fallSprite',
            blockType: Scratch.BlockType.COMMAND,
            text: 'гравитация на [P]',
            arguments: {
              P: { type: Scratch.ArgumentType.STRING, menu: 'sprites' }
            }
          },
          {
            opcode: 'fallMulti',
            blockType: Scratch.BlockType.COMMAND,
            text: 'гравитация на [T]',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: 'Земля, Платформа' }
            }
          },
          {
            opcode: 'fallColor',
            blockType: Scratch.BlockType.COMMAND,
            text: 'гравитация на цвет [C]',
            arguments: {
              C: { type: Scratch.ArgumentType.COLOR, defaultValue: '#00ff00' }
            }
          },
          {
            opcode: 'leftSprite',
            blockType: Scratch.BlockType.COMMAND,
            text: 'идти влево через [P] нельзя',
            arguments: {
              P: { type: Scratch.ArgumentType.STRING, menu: 'sprites' }
            }
          },
          {
            opcode: 'rightSprite',
            blockType: Scratch.BlockType.COMMAND,
            text: 'идти вправо через [P] нельзя',
            arguments: {
              P: { type: Scratch.ArgumentType.STRING, menu: 'sprites' }
            }
          },
          {
            opcode: 'leftMulti',
            blockType: Scratch.BlockType.COMMAND,
            text: 'идти влево через [T] нельзя',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: 'Земля, Стена' }
            }
          },
          {
            opcode: 'rightMulti',
            blockType: Scratch.BlockType.COMMAND,
            text: 'идти вправо через [T] нельзя',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: 'Земля, Стена' }
            }
          },
          {
            opcode: 'leftColor',
            blockType: Scratch.BlockType.COMMAND,
            text: 'идти влево через цвет [C] нельзя',
            arguments: {
              C: { type: Scratch.ArgumentType.COLOR, defaultValue: '#00ff00' }
            }
          },
          {
            opcode: 'rightColor',
            blockType: Scratch.BlockType.COMMAND,
            text: 'идти вправо через цвет [C] нельзя',
            arguments: {
              C: { type: Scratch.ArgumentType.COLOR, defaultValue: '#00ff00' }
            }
          },
          {
            opcode: 'doJump',
            blockType: Scratch.BlockType.COMMAND,
            text: 'прыгнуть'
          },
          {
            opcode: 'doJumpSprite',
            blockType: Scratch.BlockType.COMMAND,
            text: 'прыгнуть (земля = спрайт [P])',
            arguments: {
              P: { type: Scratch.ArgumentType.STRING, menu: 'sprites' }
            }
          },
          {
            opcode: 'doJumpMulti',
            blockType: Scratch.BlockType.COMMAND,
            text: 'прыгнуть (земля = [T])',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: 'Земля, Платформа' }
            }
          },
          {
            opcode: 'doJumpColor',
            blockType: Scratch.BlockType.COMMAND,
            text: 'прыгнуть (земля = цвет [C])',
            arguments: {
              C: { type: Scratch.ArgumentType.COLOR, defaultValue: '#00ff00' }
            }
          },

          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: 'Проверки'
          },
          {
            opcode: 'isOnGround',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'на земле?'
          },
          {
            opcode: 'isOnGroundSprite',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'на земле (спрайт [P])?',
            arguments: {
              P: { type: Scratch.ArgumentType.STRING, menu: 'sprites' }
            }
          },
          {
            opcode: 'isOnGroundMulti',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'на земле ([T])?',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: 'Земля, Платформа' }
            }
          },
          {
            opcode: 'isOnGroundColor',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'на земле (цвет [C])?',
            arguments: {
              C: { type: Scratch.ArgumentType.COLOR, defaultValue: '#00ff00' }
            }
          },
          {
            opcode: 'isTouchingMulti',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'касается [T]?',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: 'Земля, Платформа' }
            }
          },
          {
            opcode: 'getVX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'скорость X'
          },
          {
            opcode: 'getVY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'скорость Y'
          },

          '---',
          {
            opcode: 'setVX',
            blockType: Scratch.BlockType.COMMAND,
            text: 'установить скорость X [V]',
            arguments: {
              V: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'setVY',
            blockType: Scratch.BlockType.COMMAND,
            text: 'установить скорость Y [V]',
            arguments: {
              V: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'resetPhysics',
            blockType: Scratch.BlockType.COMMAND,
            text: 'сбросить физику'
          }
        ],
        menus: {
          sprites: {
            acceptReporters: true,
            items: 'getSprites'
          }
        }
      };
    }

    getSprites() {
      return списокСпрайтов();
    }

    setPhysics(args) {
      CONFIG.gravity = Number(args.G) || 1;
      CONFIG.jumpForce = Number(args.J) || 14;
      CONFIG.moveSpeed = Number(args.S) || 4;
    }

    setMaxFall(args) {
      CONFIG.maxFallSpeed = Number(args.M) || 12;
    }

    setMaxPushOut(args) {
      CONFIG.maxPushOut = Math.max(1, Number(args.P) || 150);
    }

    platformerSprite(args, util) {
      this._platformer(util, args.P);
    }

    platformerMulti(args, util) {
      this._platformer(util, args.T);
    }

    platformerColor(args, util) {
      this._platformer(util, args.C);
    }

    _platformer(util, targets) {
      if (!util || !util.target) return;
      
      const r = runtime();
      if (!r || !r.ioDevices || !r.ioDevices.keyboard) return;
      
      const kb = r.ioDevices.keyboard;
      const data = getData(util.target.id);
      
      data.vx = 0;

      const dir = getMovementDirection(kb);
      if (dir !== 0) {
        moveHorizontal(util, targets, dir);
      }

      if (isJumpPressed(kb)) {
        jump(util, targets);
      }
      
      applyGravity(util, targets);
    }

    fallSprite(args, util) {
      applyGravity(util, args.P);
    }

    fallMulti(args, util) {
      applyGravity(util, args.T);
    }

    fallColor(args, util) {
      applyGravity(util, args.C);
    }

    leftSprite(args, util) {
      moveHorizontal(util, args.P, -1);
    }

    rightSprite(args, util) {
      moveHorizontal(util, args.P, 1);
    }

    leftMulti(args, util) {
      moveHorizontal(util, args.T, -1);
    }

    rightMulti(args, util) {
      moveHorizontal(util, args.T, 1);
    }

    leftColor(args, util) {
      moveHorizontal(util, args.C, -1);
    }

    rightColor(args, util) {
      moveHorizontal(util, args.C, 1);
    }

    doJump(args, util) {
      jump(util, null);
    }

    doJumpSprite(args, util) {
      jump(util, args.P);
    }

    doJumpMulti(args, util) {
      jump(util, args.T);
    }

    doJumpColor(args, util) {
      jump(util, args.C);
    }

    isOnGround(args, util) {
      if (!util || !util.target) return false;
      return getData(util.target.id).onGround;
    }

    isOnGroundSprite(args, util) {
      if (!util || !util.target) return false;
      updateGroundState(util.target, args.P);
      return getData(util.target.id).onGround;
    }

    isOnGroundMulti(args, util) {
      if (!util || !util.target) return false;
      updateGroundState(util.target, args.T);
      return getData(util.target.id).onGround;
    }

    isOnGroundColor(args, util) {
      if (!util || !util.target) return false;
      updateGroundState(util.target, args.C);
      return getData(util.target.id).onGround;
    }

    isTouchingMulti(args, util) {
      if (!util || !util.target) return false;
      return касается(util.target, args.T);
    }

    getVX(args, util) {
      if (!util || !util.target) return 0;
      return getData(util.target.id).vx;
    }

    getVY(args, util) {
      if (!util || !util.target) return 0;
      return getData(util.target.id).vy;
    }

    setVX(args, util) {
      if (!util || !util.target) return;
      getData(util.target.id).vx = Number(args.V) || 0;
    }

    setVY(args, util) {
      if (!util || !util.target) return;
      getData(util.target.id).vy = Number(args.V) || 0;
    }

    resetPhysics(args, util) {
      if (!util || !util.target) return;
      delete spriteData[util.target.id];
    }
  }

  Scratch.extensions.register(new SimpleCollisionJump());
})(Scratch);
