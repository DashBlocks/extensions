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
    maxPushOut: 150,
    
    doubleJumpForce: 12,
    maxJumps: 2,
    dashSpeed: 20,
    dashDuration: 6,
    dashCooldown: 30,
    wallJumpForceX: 8,
    wallJumpForceY: 12,
    wallSlideSpeed: 2,
    climbSpeed: 3,
    iceAcceleration: 0.3,
    iceFriction: 0.02,
    bounceForce: 16,
    stompForce: 18,
    coyoteFrames: 6,
    jumpBufferFrames: 6,
    waterGravity: 0.3,
    waterMoveSpeed: 2,
    waterMaxFall: 3,
    windForceX: 0,
    windForceY: 0,
    gravityDirection: 1 
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
        onGround: false,
        
        jumpCount: 0,
        isDashing: false,
        dashTimer: 0,
        dashCooldownTimer: 0,
        dashDirX: 1,
        dashDirY: 0,
        onWallLeft: false,
        onWallRight: false,
        isWallSliding: false,
        isClimbing: false,
        isOnIce: false,
        iceVx: 0,
        inWater: false,
        inWind: false,
        coyoteTimer: 0,
        jumpBufferTimer: 0,
        wasOnGround: false,
        facingDir: 1,
        state: 'idle',
        prevState: 'idle',
        stateTimer: 0,
        canDash: true,
        hasBounced: false,
        gravityScale: 1,
        friction: 1,
        knockbackVx: 0,
        knockbackVy: 0,
        knockbackTimer: 0,
        savedX: 0,
        savedY: 0,
        checkpointX: 0,
        checkpointY: 0,
        totalAirTime: 0,
        maxHeight: -Infinity,
        distanceTraveled: 0,
        lastX: null,
        lastY: null
      };
    }
    return spriteData[id];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
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

    t.setXY(t.x, t.y - 1 * CONFIG.gravityDirection);
    data.onGround = касается(t, targets);
    t.setXY(t.x, oldY);
  }

  function checkWallLeft(t, targets) {
    if (!t) return false;
    const oldX = t.x;
    t.setXY(t.x - 2, t.y);
    const touching = касается(t, targets);
    t.setXY(oldX, t.y);
    return touching;
  }

  function checkWallRight(t, targets) {
    if (!t) return false;
    const oldX = t.x;
    t.setXY(t.x + 2, t.y);
    const touching = касается(t, targets);
    t.setXY(oldX, t.y);
    return touching;
  }

  function updateWallState(t, targets) {
    if (!t) return;
    const data = getData(t.id);
    data.onWallLeft = checkWallLeft(t, targets);
    data.onWallRight = checkWallRight(t, targets);
    data.isWallSliding = !data.onGround && (data.onWallLeft || data.onWallRight) && data.vy < 0;
  }

  function updateStats(t) {
    const data = getData(t.id);
    if (data.lastX !== null && data.lastY !== null) {
      const dx = t.x - data.lastX;
      const dy = t.y - data.lastY;
      data.distanceTraveled += Math.sqrt(dx * dx + dy * dy);
    }
    data.lastX = t.x;
    data.lastY = t.y;
    if (t.y > data.maxHeight) data.maxHeight = t.y;
    if (!data.onGround) data.totalAirTime++;
  }

  function updateAnimState(t) {
    const data = getData(t.id);
    data.prevState = data.state;

    if (data.knockbackTimer > 0) {
      data.state = 'hurt';
    } else if (data.isDashing) {
      data.state = 'dash';
    } else if (data.isClimbing) {
      data.state = 'climb';
    } else if (data.isWallSliding) {
      data.state = 'wallslide';
    } else if (data.inWater) {
      if (Math.abs(data.vx) > 0.5 || Math.abs(data.vy) > 0.5) {
        data.state = 'swim';
      } else {
        data.state = 'float';
      }
    } else if (!data.onGround) {
      if (data.vy > 0) {
        data.state = 'jump';
      } else {
        data.state = 'fall';
      }
    } else if (Math.abs(data.vx) > 0.5 || Math.abs(data.iceVx) > 0.5) {
      if (data.isOnIce) {
        data.state = 'slide';
      } else {
        data.state = 'run';
      }
    } else {
      data.state = 'idle';
    }

    if (data.state !== data.prevState) {
      data.stateTimer = 0;
    } else {
      data.stateTimer++;
    }
  }

  function applyGravity(util, targets) {
    if (!util || !util.target) return;
    const t = util.target;
    const data = getData(t.id);

    if (data.knockbackTimer > 0) {
      data.knockbackTimer--;
      t.setXY(t.x + data.knockbackVx, t.y + data.knockbackVy);
      data.knockbackVx *= 0.85;
      data.knockbackVy *= 0.85;
      return;
    }

    if (data.isDashing) {
      data.dashTimer--;
      t.setXY(
        t.x + data.dashDirX * CONFIG.dashSpeed,
        t.y + data.dashDirY * CONFIG.dashSpeed
      );
      if (data.dashTimer <= 0) {
        data.isDashing = false;
        data.vy = 0;
      }
      return;
    }

    if (data.dashCooldownTimer > 0) {
      data.dashCooldownTimer--;
      if (data.dashCooldownTimer <= 0) {
        data.canDash = true;
      }
    }

    if (data.wasOnGround && !data.onGround) {
      data.coyoteTimer = CONFIG.coyoteFrames;
    }
    if (data.coyoteTimer > 0) data.coyoteTimer--;
    data.wasOnGround = data.onGround;

    if (data.jumpBufferTimer > 0) data.jumpBufferTimer--;

    let grav = CONFIG.gravity * data.gravityScale * CONFIG.gravityDirection;
    let maxFall = CONFIG.maxFallSpeed;

    if (data.inWater) {
      grav = CONFIG.waterGravity * data.gravityScale * CONFIG.gravityDirection;
      maxFall = CONFIG.waterMaxFall;
    }

    if (data.isWallSliding) {
      maxFall = CONFIG.wallSlideSpeed;
    }

    data.vy -= grav;
    data.vy = clamp(data.vy, -maxFall, 999);

    if (data.inWind) {
      data.vx += CONFIG.windForceX;
      data.vy += CONFIG.windForceY;
    }

    if (data.isOnIce && data.onGround) {
      data.iceVx *= (1 - CONFIG.iceFriction);
      t.setXY(t.x + data.iceVx, t.y);
      if (касается(t, targets)) {
        let steps = 0;
        while (касается(t, targets) && steps < CONFIG.maxPushOut) {
          t.setXY(t.x - Math.sign(data.iceVx), t.y);
          steps++;
        }
        data.iceVx = 0;
      }
    }

    t.setXY(t.x, t.y + data.vy);

    if (касается(t, targets)) {
      if (data.vy * CONFIG.gravityDirection < 0) {
        let steps = 0;
        while (касается(t, targets) && steps < CONFIG.maxPushOut) {
          t.setXY(t.x, t.y + 1 * CONFIG.gravityDirection);
          steps++;
        }
        data.vy = 0;
        data.onGround = true;
        data.jumpCount = 0;
        data.hasBounced = false;
        if (data.onGround) data.canDash = true;

        if (data.jumpBufferTimer > 0) {
          data.jumpBufferTimer = 0;
          data.vy = CONFIG.jumpForce * CONFIG.gravityDirection;
          data.onGround = false;
          data.jumpCount = 1;
        }
      } else if (data.vy * CONFIG.gravityDirection > 0) {
        let steps = 0;
        while (касается(t, targets) && steps < CONFIG.maxPushOut) {
          t.setXY(t.x, t.y - 1 * CONFIG.gravityDirection);
          steps++;
        }
        data.vy = 0;
      }
    } else {
      updateGroundState(t, targets);
    }

    updateWallState(t, targets);
    updateStats(t);
    updateAnimState(t);
  }

  function moveHorizontal(util, targets, dir) {
    if (!util || !util.target) return;
    const t = util.target;
    const data = getData(t.id);

    if (data.isDashing || data.knockbackTimer > 0) return;

    let speed = CONFIG.moveSpeed;
    if (data.inWater) speed = CONFIG.waterMoveSpeed;

    data.facingDir = dir > 0 ? 1 : -1;

    if (data.isOnIce && data.onGround) {
      data.iceVx += CONFIG.iceAcceleration * (dir > 0 ? 1 : -1);
      data.iceVx = clamp(data.iceVx, -speed * 1.5, speed * 1.5);
      data.vx = data.iceVx;
    } else {
      data.vx = speed * (dir > 0 ? 1 : -1);
      t.setXY(t.x + data.vx, t.y);

      if (касается(t, targets)) {
        
        let climbed = false;
        for (let slopeStep = 1; slopeStep <= 6; slopeStep++) {
          t.setXY(t.x, t.y + slopeStep);
          if (!касается(t, targets)) {
            climbed = true;
            break;
          }
        }
        if (!climbed) {
          
          let steps = 0;
          
          t.setXY(t.x, t.y);
          while (касается(t, targets) && steps < CONFIG.maxPushOut) {
            t.setXY(t.x - Math.sign(data.vx), t.y);
            steps++;
          }
          data.vx = 0;
        }
      }
    }
  }

  function jump(util, targets) {
    if (!util || !util.target) return;
    const t = util.target;
    const data = getData(t.id);

    if (targets) {
      updateGroundState(t, targets);
      updateWallState(t, targets);
    }

    const canCoyote = data.coyoteTimer > 0 && data.jumpCount === 0;
    const canNormalJump = data.onGround || canCoyote;
    const canDoubleJump = !canNormalJump && data.jumpCount < CONFIG.maxJumps;
    const canWallJump = !data.onGround && (data.onWallLeft || data.onWallRight);

    if (canWallJump) {
      
      const wallDir = data.onWallLeft ? 1 : -1;
      data.vx = CONFIG.wallJumpForceX * wallDir;
      data.vy = CONFIG.wallJumpForceY * CONFIG.gravityDirection;
      data.onGround = false;
      data.isWallSliding = false;
      data.jumpCount = 1;
      data.coyoteTimer = 0;
      t.setXY(t.x + data.vx, t.y);
    } else if (canNormalJump) {
      data.vy = CONFIG.jumpForce * CONFIG.gravityDirection;
      data.onGround = false;
      data.jumpCount = 1;
      data.coyoteTimer = 0;
    } else if (canDoubleJump) {
      const force = CONFIG.doubleJumpForce || CONFIG.jumpForce;
      data.vy = force * CONFIG.gravityDirection;
      data.jumpCount++;
    } else {
      
      data.jumpBufferTimer = CONFIG.jumpBufferFrames;
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

  function isDashPressed(kb) {
    return kb.getKeyIsDown('Shift') ||
           kb.getKeyIsDown('shift') ||
           kb.getKeyIsDown('e') ||
           kb.getKeyIsDown('E') ||
           kb.getKeyIsDown('у') ||
           kb.getKeyIsDown('У');
  }

  function isClimbPressed(kb) {
    return kb.getKeyIsDown('ArrowUp') || 
           kb.getKeyIsDown('Up') ||
           kb.getKeyIsDown('up arrow') ||
           kb.getKeyIsDown('w') || 
           kb.getKeyIsDown('W') ||
           kb.getKeyIsDown('ц') ||
           kb.getKeyIsDown('Ц');
  }

  function isClimbDownPressed(kb) {
    return kb.getKeyIsDown('ArrowDown') || 
           kb.getKeyIsDown('Down') ||
           kb.getKeyIsDown('down arrow') ||
           kb.getKeyIsDown('s') || 
           kb.getKeyIsDown('S') ||
           kb.getKeyIsDown('ы') ||
           kb.getKeyIsDown('Ы');
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
            text: '⚙️ Настройки'
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
          {
            opcode: 'setDoubleJump',
            blockType: Scratch.BlockType.COMMAND,
            text: 'макс прыжков [N] сила двойного [F]',
            arguments: {
              N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 },
              F: { type: Scratch.ArgumentType.NUMBER, defaultValue: 12 }
            }
          },
          {
            opcode: 'setDash',
            blockType: Scratch.BlockType.COMMAND,
            text: 'дэш: скорость [S] длительность [D] откат [C]',
            arguments: {
              S: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 },
              D: { type: Scratch.ArgumentType.NUMBER, defaultValue: 6 },
              C: { type: Scratch.ArgumentType.NUMBER, defaultValue: 30 }
            }
          },
          {
            opcode: 'setWallJump',
            blockType: Scratch.BlockType.COMMAND,
            text: 'стена-прыжок: сила X [X] сила Y [Y] скольжение [S]',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 8 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 12 },
              S: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 }
            }
          },
          {
            opcode: 'setClimb',
            blockType: Scratch.BlockType.COMMAND,
            text: 'скорость лазания [S]',
            arguments: {
              S: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 }
            }
          },
          {
            opcode: 'setIce',
            blockType: Scratch.BlockType.COMMAND,
            text: 'лёд: ускорение [A] трение [F]',
            arguments: {
              A: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.3 },
              F: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.02 }
            }
          },
          {
            opcode: 'setBounce',
            blockType: Scratch.BlockType.COMMAND,
            text: 'отскок сила [F] топтание [S]',
            arguments: {
              F: { type: Scratch.ArgumentType.NUMBER, defaultValue: 16 },
              S: { type: Scratch.ArgumentType.NUMBER, defaultValue: 18 }
            }
          },
          {
            opcode: 'setCoyote',
            blockType: Scratch.BlockType.COMMAND,
            text: 'coyote time [C] кадров jump buffer [B] кадров',
            arguments: {
              C: { type: Scratch.ArgumentType.NUMBER, defaultValue: 6 },
              B: { type: Scratch.ArgumentType.NUMBER, defaultValue: 6 }
            }
          },
          {
            opcode: 'setWater',
            blockType: Scratch.BlockType.COMMAND,
            text: 'вода: гравитация [G] скорость [S] макс падение [F]',
            arguments: {
              G: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.3 },
              S: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 },
              F: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 }
            }
          },
          {
            opcode: 'setWind',
            blockType: Scratch.BlockType.COMMAND,
            text: 'ветер: сила X [X] сила Y [Y]',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.5 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'setGravityDir',
            blockType: Scratch.BlockType.COMMAND,
            text: 'направление гравитации [D]',
            arguments: {
              D: { type: Scratch.ArgumentType.STRING, menu: 'gravityDirs', defaultValue: 'вниз' }
            }
          },
          {
            opcode: 'setGravityScale',
            blockType: Scratch.BlockType.COMMAND,
            text: 'множитель гравитации [S]',
            arguments: {
              S: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'setFriction',
            blockType: Scratch.BlockType.COMMAND,
            text: 'трение [F]',
            arguments: {
              F: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },

          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🎮 Целая физика'
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
          {
            opcode: 'platformerAdvanced',
            blockType: Scratch.BlockType.COMMAND,
            text: 'физика+ на [T] лёд [ICE] лестница [LADDER]',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: 'Земля, Платформа' },
              ICE: { type: Scratch.ArgumentType.STRING, defaultValue: '#00ffff' },
              LADDER: { type: Scratch.ArgumentType.STRING, defaultValue: '#ffff00' }
            }
          },

          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🔧 Отдельно'
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
            text: '💨 Дэш / Рывок'
          },
          {
            opcode: 'doDash',
            blockType: Scratch.BlockType.COMMAND,
            text: 'дэш в направлении [D]',
            arguments: {
              D: { type: Scratch.ArgumentType.STRING, menu: 'dashDirs', defaultValue: 'вперёд' }
            }
          },
          {
            opcode: 'doDashAngle',
            blockType: Scratch.BlockType.COMMAND,
            text: 'дэш под углом [A]°',
            arguments: {
              A: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },

          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🧱 Стены и лестницы'
          },
          {
            opcode: 'wallJump',
            blockType: Scratch.BlockType.COMMAND,
            text: 'стена-прыжок (стены = [T])',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: 'Стена' }
            }
          },
          {
            opcode: 'climbLadder',
            blockType: Scratch.BlockType.COMMAND,
            text: 'лазать по [T]',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: '#ffff00' }
            }
          },

          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🌊 Зоны'
          },
          {
            opcode: 'setInWater',
            blockType: Scratch.BlockType.COMMAND,
            text: 'в воде [W]',
            arguments: {
              W: { type: Scratch.ArgumentType.STRING, menu: 'onoff', defaultValue: 'вкл' }
            }
          },
          {
            opcode: 'checkWaterZone',
            blockType: Scratch.BlockType.COMMAND,
            text: 'проверить зону воды [T]',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: '#0000ff' }
            }
          },
          {
            opcode: 'setInWind',
            blockType: Scratch.BlockType.COMMAND,
            text: 'в ветре [W]',
            arguments: {
              W: { type: Scratch.ArgumentType.STRING, menu: 'onoff', defaultValue: 'вкл' }
            }
          },
          {
            opcode: 'setOnIce',
            blockType: Scratch.BlockType.COMMAND,
            text: 'на льду [I]',
            arguments: {
              I: { type: Scratch.ArgumentType.STRING, menu: 'onoff', defaultValue: 'вкл' }
            }
          },
          {
            opcode: 'checkIceZone',
            blockType: Scratch.BlockType.COMMAND,
            text: 'проверить лёд [T]',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: '#00ffff' }
            }
          },

          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '💥 Боевое'
          },
          {
            opcode: 'bounceOff',
            blockType: Scratch.BlockType.COMMAND,
            text: 'отскочить от [T]',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: 'Враг' }
            }
          },
          {
            opcode: 'stompOn',
            blockType: Scratch.BlockType.COMMAND,
            text: 'топнуть на [T]',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, defaultValue: 'Враг' }
            }
          },
          {
            opcode: 'knockback',
            blockType: Scratch.BlockType.COMMAND,
            text: 'откинуть: сила X [X] Y [Y] время [T]',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 8 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 6 },
              T: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
            }
          },
          {
            opcode: 'knockbackFrom',
            blockType: Scratch.BlockType.COMMAND,
            text: 'откинуть ОТ [T] сила [F] время [D]',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, menu: 'sprites' },
              F: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              D: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
            }
          },

          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '📍 Чекпоинты и телепорт'
          },
          {
            opcode: 'saveCheckpoint',
            blockType: Scratch.BlockType.COMMAND,
            text: 'сохранить чекпоинт'
          },
          {
            opcode: 'loadCheckpoint',
            blockType: Scratch.BlockType.COMMAND,
            text: 'вернуться на чекпоинт'
          },
          {
            opcode: 'savePosition',
            blockType: Scratch.BlockType.COMMAND,
            text: 'запомнить позицию'
          },
          {
            opcode: 'loadPosition',
            blockType: Scratch.BlockType.COMMAND,
            text: 'вернуться на позицию'
          },
          {
            opcode: 'teleportTo',
            blockType: Scratch.BlockType.COMMAND,
            text: 'телепорт к x:[X] y:[Y]',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'teleportToSprite',
            blockType: Scratch.BlockType.COMMAND,
            text: 'телепорт к [T]',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, menu: 'sprites' }
            }
          },

          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '❓ Проверки'
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
            opcode: 'isOnWall',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'у стены?'
          },
          {
            opcode: 'isOnWallLeft',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'стена слева?'
          },
          {
            opcode: 'isOnWallRight',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'стена справа?'
          },
          {
            opcode: 'isWallSliding',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'скользит по стене?'
          },
          {
            opcode: 'isDashing',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'в дэше?'
          },
          {
            opcode: 'canDash',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'может дэшнуть?'
          },
          {
            opcode: 'isClimbing',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'лезет?'
          },
          {
            opcode: 'isInWater',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'в воде?'
          },
          {
            opcode: 'isOnIce',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'на льду?'
          },
          {
            opcode: 'isInWind',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'в ветре?'
          },
          {
            opcode: 'isKnockedBack',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'откинут?'
          },
          {
            opcode: 'isFalling',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'падает?'
          },
          {
            opcode: 'isRising',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'поднимается?'
          },
          {
            opcode: 'isMoving',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'двигается?'
          },

          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '📊 Значения'
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
          {
            opcode: 'getSpeed',
            blockType: Scratch.BlockType.REPORTER,
            text: 'общая скорость'
          },
          {
            opcode: 'getJumpCount',
            blockType: Scratch.BlockType.REPORTER,
            text: 'номер прыжка'
          },
          {
            opcode: 'getFacingDir',
            blockType: Scratch.BlockType.REPORTER,
            text: 'направление взгляда'
          },
          {
            opcode: 'getState',
            blockType: Scratch.BlockType.REPORTER,
            text: 'состояние'
          },
          {
            opcode: 'getStateTimer',
            blockType: Scratch.BlockType.REPORTER,
            text: 'время в состоянии'
          },
          {
            opcode: 'getDashCooldown',
            blockType: Scratch.BlockType.REPORTER,
            text: 'откат дэша'
          },
          {
            opcode: 'getAirTime',
            blockType: Scratch.BlockType.REPORTER,
            text: 'время в воздухе'
          },
          {
            opcode: 'getMaxHeight',
            blockType: Scratch.BlockType.REPORTER,
            text: 'макс высота'
          },
          {
            opcode: 'getDistance',
            blockType: Scratch.BlockType.REPORTER,
            text: 'пройденное расстояние'
          },
          {
            opcode: 'getDistanceTo',
            blockType: Scratch.BlockType.REPORTER,
            text: 'расстояние до [T]',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, menu: 'sprites' }
            }
          },
          {
            opcode: 'getAngleTo',
            blockType: Scratch.BlockType.REPORTER,
            text: 'угол к [T]',
            arguments: {
              T: { type: Scratch.ArgumentType.STRING, menu: 'sprites' }
            }
          },

          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🎛️ Управление'
          },
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
            opcode: 'addVX',
            blockType: Scratch.BlockType.COMMAND,
            text: 'добавить скорость X [V]',
            arguments: {
              V: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 }
            }
          },
          {
            opcode: 'addVY',
            blockType: Scratch.BlockType.COMMAND,
            text: 'добавить скорость Y [V]',
            arguments: {
              V: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
            }
          },
          {
            opcode: 'impulse',
            blockType: Scratch.BlockType.COMMAND,
            text: 'импульс X [X] Y [Y]',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
            }
          },
          {
            opcode: 'resetPhysics',
            blockType: Scratch.BlockType.COMMAND,
            text: 'сбросить физику'
          },
          {
            opcode: 'resetStats',
            blockType: Scratch.BlockType.COMMAND,
            text: 'сбросить статистику'
          },
          {
            opcode: 'resetAll',
            blockType: Scratch.BlockType.COMMAND,
            text: 'сбросить ВСЁ (настройки по умолчанию)'
          }
        ],
        menus: {
          sprites: {
            acceptReporters: true,
            items: 'getSprites'
          },
          dashDirs: {
            acceptReporters: false,
            items: ['вперёд', 'влево', 'вправо', 'вверх', 'вниз', 'к мышке']
          },
          gravityDirs: {
            acceptReporters: false,
            items: ['вниз', 'вверх']
          },
          onoff: {
            acceptReporters: false,
            items: ['вкл', 'выкл']
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

    setDoubleJump(args) {
      CONFIG.maxJumps = Math.max(1, Number(args.N) || 2);
      CONFIG.doubleJumpForce = Number(args.F) || 12;
    }

    setDash(args) {
      CONFIG.dashSpeed = Number(args.S) || 20;
      CONFIG.dashDuration = Math.max(1, Number(args.D) || 6);
      CONFIG.dashCooldown = Math.max(0, Number(args.C) || 30);
    }

    setWallJump(args) {
      CONFIG.wallJumpForceX = Number(args.X) || 8;
      CONFIG.wallJumpForceY = Number(args.Y) || 12;
      CONFIG.wallSlideSpeed = Number(args.S) || 2;
    }

    setClimb(args) {
      CONFIG.climbSpeed = Number(args.S) || 3;
    }

    setIce(args) {
      CONFIG.iceAcceleration = Number(args.A) || 0.3;
      CONFIG.iceFriction = Number(args.F) || 0.02;
    }

    setBounce(args) {
      CONFIG.bounceForce = Number(args.F) || 16;
      CONFIG.stompForce = Number(args.S) || 18;
    }

    setCoyote(args) {
      CONFIG.coyoteFrames = Math.max(0, Number(args.C) || 6);
      CONFIG.jumpBufferFrames = Math.max(0, Number(args.B) || 6);
    }

    setWater(args) {
      CONFIG.waterGravity = Number(args.G) || 0.3;
      CONFIG.waterMoveSpeed = Number(args.S) || 2;
      CONFIG.waterMaxFall = Number(args.F) || 3;
    }

    setWind(args) {
      CONFIG.windForceX = Number(args.X) || 0;
      CONFIG.windForceY = Number(args.Y) || 0;
    }

    setGravityDir(args) {
      CONFIG.gravityDirection = args.D === 'вверх' ? -1 : 1;
    }

    setGravityScale(args) {
      if (!args || args.S === undefined) return;
      const util = arguments[1];
      if (util && util.target) {
        getData(util.target.id).gravityScale = Number(args.S) || 1;
      }
    }

    setFriction(args) {
      const util = arguments[1];
      if (util && util.target) {
        getData(util.target.id).friction = Number(args.F) || 1;
      }
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

    platformerAdvanced(args, util) {
      if (!util || !util.target) return;
      const t = util.target;
      const data = getData(t.id);
      const r = runtime();
      if (!r || !r.ioDevices || !r.ioDevices.keyboard) return;
      const kb = r.ioDevices.keyboard;

      if (args.ICE) {
        data.isOnIce = касается(t, args.ICE);
      }
      if (args.LADDER) {
        const onLadder = касается(t, args.LADDER);
        if (onLadder) {
          data.isClimbing = true;
          data.vy = 0;
          if (isClimbPressed(kb)) {
            t.setXY(t.x, t.y + CONFIG.climbSpeed);
          }
          if (isClimbDownPressed(kb)) {
            t.setXY(t.x, t.y - CONFIG.climbSpeed);
          }
        } else {
          data.isClimbing = false;
        }
      }

      if (isDashPressed(kb) && data.canDash && !data.isDashing) {
        data.isDashing = true;
        data.dashTimer = CONFIG.dashDuration;
        data.dashCooldownTimer = CONFIG.dashCooldown;
        data.canDash = false;
        data.dashDirX = data.facingDir;
        data.dashDirY = 0;
      }

      this._platformer(util, args.T);
    }

    _platformer(util, targets) {
      if (!util || !util.target) return;
      
      const r = runtime();
      if (!r || !r.ioDevices || !r.ioDevices.keyboard) return;
      
      const kb = r.ioDevices.keyboard;
      const data = getData(util.target.id);
      
      if (!data.isDashing && data.knockbackTimer <= 0) {
        data.vx = 0;

        const dir = getMovementDirection(kb);
        if (dir !== 0) {
          moveHorizontal(util, targets, dir);
        }

        if (isJumpPressed(kb)) {
          jump(util, targets);
        }
      }
      
      applyGravity(util, targets);
    }

    fallSprite(args, util) { applyGravity(util, args.P); }
    fallMulti(args, util) { applyGravity(util, args.T); }
    fallColor(args, util) { applyGravity(util, args.C); }

    leftSprite(args, util) { moveHorizontal(util, args.P, -1); }
    rightSprite(args, util) { moveHorizontal(util, args.P, 1); }
    leftMulti(args, util) { moveHorizontal(util, args.T, -1); }
    rightMulti(args, util) { moveHorizontal(util, args.T, 1); }
    leftColor(args, util) { moveHorizontal(util, args.C, -1); }
    rightColor(args, util) { moveHorizontal(util, args.C, 1); }

    doJump(args, util) { jump(util, null); }
    doJumpSprite(args, util) { jump(util, args.P); }
    doJumpMulti(args, util) { jump(util, args.T); }
    doJumpColor(args, util) { jump(util, args.C); }

    doDash(args, util) {
      if (!util || !util.target) return;
      const data = getData(util.target.id);
      if (!data.canDash || data.isDashing) return;

      data.isDashing = true;
      data.dashTimer = CONFIG.dashDuration;
      data.dashCooldownTimer = CONFIG.dashCooldown;
      data.canDash = false;

      switch (args.D) {
        case 'вперёд':
          data.dashDirX = data.facingDir;
          data.dashDirY = 0;
          break;
        case 'влево':
          data.dashDirX = -1;
          data.dashDirY = 0;
          break;
        case 'вправо':
          data.dashDirX = 1;
          data.dashDirY = 0;
          break;
        case 'вверх':
          data.dashDirX = 0;
          data.dashDirY = 1;
          break;
        case 'вниз':
          data.dashDirX = 0;
          data.dashDirY = -1;
          break;
        case 'к мышке': {
          const r = runtime();
          if (r && r.ioDevices && r.ioDevices.mouse) {
            const mx = r.ioDevices.mouse.getScratchX();
            const my = r.ioDevices.mouse.getScratchY();
            const dx = mx - util.target.x;
            const dy = my - util.target.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            data.dashDirX = dx / dist;
            data.dashDirY = dy / dist;
          }
          break;
        }
      }
      data.vy = 0;
    }

    doDashAngle(args, util) {
      if (!util || !util.target) return;
      const data = getData(util.target.id);
      if (!data.canDash || data.isDashing) return;

      const angle = (Number(args.A) || 0) * Math.PI / 180;
      data.isDashing = true;
      data.dashTimer = CONFIG.dashDuration;
      data.dashCooldownTimer = CONFIG.dashCooldown;
      data.canDash = false;
      data.dashDirX = Math.cos(angle);
      data.dashDirY = Math.sin(angle);
      data.vy = 0;
    }

    wallJump(args, util) {
      if (!util || !util.target) return;
      const t = util.target;
      const data = getData(t.id);
      updateWallState(t, args.T);
      
      if (data.onWallLeft || data.onWallRight) {
        const wallDir = data.onWallLeft ? 1 : -1;
        data.vx = CONFIG.wallJumpForceX * wallDir;
        data.vy = CONFIG.wallJumpForceY * CONFIG.gravityDirection;
        data.onGround = false;
        data.isWallSliding = false;
        data.jumpCount = 1;
        t.setXY(t.x + data.vx, t.y);
      }
    }

    climbLadder(args, util) {
      if (!util || !util.target) return;
      const t = util.target;
      const data = getData(t.id);
      const r = runtime();
      if (!r || !r.ioDevices || !r.ioDevices.keyboard) return;
      const kb = r.ioDevices.keyboard;

      if (касается(t, args.T)) {
        data.isClimbing = true;
        data.vy = 0;
        data.jumpCount = 0;
        if (isClimbPressed(kb)) {
          t.setXY(t.x, t.y + CONFIG.climbSpeed);
        }
        if (isClimbDownPressed(kb)) {
          t.setXY(t.x, t.y - CONFIG.climbSpeed);
        }
      } else {
        data.isClimbing = false;
      }
    }

    setInWater(args, util) {
      if (!util || !util.target) return;
      getData(util.target.id).inWater = args.W === 'вкл';
    }

    checkWaterZone(args, util) {
      if (!util || !util.target) return;
      getData(util.target.id).inWater = касается(util.target, args.T);
    }

    setInWind(args, util) {
      if (!util || !util.target) return;
      getData(util.target.id).inWind = args.W === 'вкл';
    }

    setOnIce(args, util) {
      if (!util || !util.target) return;
      getData(util.target.id).isOnIce = args.I === 'вкл';
    }

    checkIceZone(args, util) {
      if (!util || !util.target) return;
      const t = util.target;
      const data = getData(t.id);
      const oldY = t.y;
      t.setXY(t.x, t.y - 2);
      data.isOnIce = касается(t, args.T);
      t.setXY(t.x, oldY);
    }

    bounceOff(args, util) {
      if (!util || !util.target) return;
      const t = util.target;
      const data = getData(t.id);
      if (касается(t, args.T) && !data.hasBounced) {
        data.vy = CONFIG.bounceForce * CONFIG.gravityDirection;
        data.onGround = false;
        data.hasBounced = true;
        data.jumpCount = 0;
      }
    }

    stompOn(args, util) {
      if (!util || !util.target) return;
      const t = util.target;
      const data = getData(t.id);
      if (касается(t, args.T) && data.vy * CONFIG.gravityDirection < 0) {
        data.vy = CONFIG.stompForce * CONFIG.gravityDirection;
        data.onGround = false;
        data.jumpCount = 0;
      }
    }

    knockback(args, util) {
      if (!util || !util.target) return;
      const data = getData(util.target.id);
      data.knockbackVx = Number(args.X) || 0;
      data.knockbackVy = Number(args.Y) || 0;
      data.knockbackTimer = Math.max(1, Number(args.T) || 10);
    }

    knockbackFrom(args, util) {
      if (!util || !util.target) return;
      const t = util.target;
      const data = getData(t.id);
      const r = runtime();
      if (!r) return;

      for (const other of r.targets) {
        if (!other.sprite || other.sprite.name !== args.T) continue;
        const dx = t.x - other.x;
        const dy = t.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = Number(args.F) || 10;
        data.knockbackVx = (dx / dist) * force;
        data.knockbackVy = (dy / dist) * force;
        data.knockbackTimer = Math.max(1, Number(args.D) || 10);
        break;
      }
    }

    saveCheckpoint(args, util) {
      if (!util || !util.target) return;
      const data = getData(util.target.id);
      data.checkpointX = util.target.x;
      data.checkpointY = util.target.y;
    }

    loadCheckpoint(args, util) {
      if (!util || !util.target) return;
      const data = getData(util.target.id);
      util.target.setXY(data.checkpointX, data.checkpointY);
      data.vx = 0;
      data.vy = 0;
      data.iceVx = 0;
      data.knockbackTimer = 0;
      data.isDashing = false;
    }

    savePosition(args, util) {
      if (!util || !util.target) return;
      const data = getData(util.target.id);
      data.savedX = util.target.x;
      data.savedY = util.target.y;
    }

    loadPosition(args, util) {
      if (!util || !util.target) return;
      const data = getData(util.target.id);
      util.target.setXY(data.savedX, data.savedY);
    }

    teleportTo(args, util) {
      if (!util || !util.target) return;
      const data = getData(util.target.id);
      util.target.setXY(Number(args.X) || 0, Number(args.Y) || 0);
      data.vx = 0;
      data.vy = 0;
      data.iceVx = 0;
    }

    teleportToSprite(args, util) {
      if (!util || !util.target) return;
      const r = runtime();
      if (!r) return;
      for (const other of r.targets) {
        if (!other.sprite || other.sprite.name !== args.T) continue;
        const data = getData(util.target.id);
        util.target.setXY(other.x, other.y);
        data.vx = 0;
        data.vy = 0;
        data.iceVx = 0;
        break;
      }
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

    isOnWall(args, util) {
      if (!util || !util.target) return false;
      const data = getData(util.target.id);
      return data.onWallLeft || data.onWallRight;
    }

    isOnWallLeft(args, util) {
      if (!util || !util.target) return false;
      return getData(util.target.id).onWallLeft;
    }

    isOnWallRight(args, util) {
      if (!util || !util.target) return false;
      return getData(util.target.id).onWallRight;
    }

    isWallSliding(args, util) {
      if (!util || !util.target) return false;
      return getData(util.target.id).isWallSliding;
    }

    isDashing(args, util) {
      if (!util || !util.target) return false;
      return getData(util.target.id).isDashing;
    }

    canDash(args, util) {
      if (!util || !util.target) return false;
      return getData(util.target.id).canDash;
    }

    isClimbing(args, util) {
      if (!util || !util.target) return false;
      return getData(util.target.id).isClimbing;
    }

    isInWater(args, util) {
      if (!util || !util.target) return false;
      return getData(util.target.id).inWater;
    }

    isOnIce(args, util) {
      if (!util || !util.target) return false;
      return getData(util.target.id).isOnIce;
    }

    isInWind(args, util) {
      if (!util || !util.target) return false;
      return getData(util.target.id).inWind;
    }

    isKnockedBack(args, util) {
      if (!util || !util.target) return false;
      return getData(util.target.id).knockbackTimer > 0;
    }

    isFalling(args, util) {
      if (!util || !util.target) return false;
      const data = getData(util.target.id);
      return !data.onGround && data.vy * CONFIG.gravityDirection < 0;
    }

    isRising(args, util) {
      if (!util || !util.target) return false;
      const data = getData(util.target.id);
      return data.vy * CONFIG.gravityDirection > 0;
    }

    isMoving(args, util) {
      if (!util || !util.target) return false;
      const data = getData(util.target.id);
      return Math.abs(data.vx) > 0.1 || Math.abs(data.vy) > 0.1 || Math.abs(data.iceVx) > 0.1;
    }

    getVX(args, util) {
      if (!util || !util.target) return 0;
      return getData(util.target.id).vx;
    }

    getVY(args, util) {
      if (!util || !util.target) return 0;
      return getData(util.target.id).vy;
    }

    getSpeed(args, util) {
      if (!util || !util.target) return 0;
      const data = getData(util.target.id);
      return Math.round(Math.sqrt(data.vx * data.vx + data.vy * data.vy) * 100) / 100;
    }

    getJumpCount(args, util) {
      if (!util || !util.target) return 0;
      return getData(util.target.id).jumpCount;
    }

    getFacingDir(args, util) {
      if (!util || !util.target) return 1;
      return getData(util.target.id).facingDir;
    }

    getState(args, util) {
      if (!util || !util.target) return 'idle';
      return getData(util.target.id).state;
    }

    getStateTimer(args, util) {
      if (!util || !util.target) return 0;
      return getData(util.target.id).stateTimer;
    }

    getDashCooldown(args, util) {
      if (!util || !util.target) return 0;
      return getData(util.target.id).dashCooldownTimer;
    }

    getAirTime(args, util) {
      if (!util || !util.target) return 0;
      return getData(util.target.id).totalAirTime;
    }

    getMaxHeight(args, util) {
      if (!util || !util.target) return 0;
      return Math.round(getData(util.target.id).maxHeight);
    }

    getDistance(args, util) {
      if (!util || !util.target) return 0;
      return Math.round(getData(util.target.id).distanceTraveled);
    }

    getDistanceTo(args, util) {
      if (!util || !util.target) return 0;
      const r = runtime();
      if (!r) return 0;
      for (const other of r.targets) {
        if (!other.sprite || other.sprite.name !== args.T) continue;
        const dx = util.target.x - other.x;
        const dy = util.target.y - other.y;
        return Math.round(Math.sqrt(dx * dx + dy * dy) * 100) / 100;
      }
      return 0;
    }

    getAngleTo(args, util) {
      if (!util || !util.target) return 0;
      const r = runtime();
      if (!r) return 0;
      for (const other of r.targets) {
        if (!other.sprite || other.sprite.name !== args.T) continue;
        const dx = other.x - util.target.x;
        const dy = other.y - util.target.y;
        return Math.round(Math.atan2(dy, dx) * 180 / Math.PI * 100) / 100;
      }
      return 0;
    }

    setVX(args, util) {
      if (!util || !util.target) return;
      getData(util.target.id).vx = Number(args.V) || 0;
    }

    setVY(args, util) {
      if (!util || !util.target) return;
      getData(util.target.id).vy = Number(args.V) || 0;
    }

    addVX(args, util) {
      if (!util || !util.target) return;
      getData(util.target.id).vx += Number(args.V) || 0;
    }

    addVY(args, util) {
      if (!util || !util.target) return;
      getData(util.target.id).vy += Number(args.V) || 0;
    }

    impulse(args, util) {
      if (!util || !util.target) return;
      const data = getData(util.target.id);
      data.vx += Number(args.X) || 0;
      data.vy += Number(args.Y) || 0;
    }

    resetPhysics(args, util) {
      if (!util || !util.target) return;
      delete spriteData[util.target.id];
    }

    resetStats(args, util) {
      if (!util || !util.target) return;
      const data = getData(util.target.id);
      data.totalAirTime = 0;
      data.maxHeight = -Infinity;
      data.distanceTraveled = 0;
      data.lastX = null;
      data.lastY = null;
    }

    resetAll(args, util) {
      if (util && util.target) {
        delete spriteData[util.target.id];
      }
      CONFIG.gravity = 1;
      CONFIG.jumpForce = 14;
      CONFIG.moveSpeed = 4;
      CONFIG.maxFallSpeed = 12;
      CONFIG.maxPushOut = 150;
      CONFIG.doubleJumpForce = 12;
      CONFIG.maxJumps = 2;
      CONFIG.dashSpeed = 20;
      CONFIG.dashDuration = 6;
      CONFIG.dashCooldown = 30;
      CONFIG.wallJumpForceX = 8;
      CONFIG.wallJumpForceY = 12;
      CONFIG.wallSlideSpeed = 2;
      CONFIG.climbSpeed = 3;
      CONFIG.iceAcceleration = 0.3;
      CONFIG.iceFriction = 0.02;
      CONFIG.bounceForce = 16;
      CONFIG.stompForce = 18;
      CONFIG.coyoteFrames = 6;
      CONFIG.jumpBufferFrames = 6;
      CONFIG.waterGravity = 0.3;
      CONFIG.waterMoveSpeed = 2;
      CONFIG.waterMaxFall = 3;
      CONFIG.windForceX = 0;
      CONFIG.windForceY = 0;
      CONFIG.gravityDirection = 1;
    }
  }

  Scratch.extensions.register(new SimpleCollisionJump());
})(Scratch);
