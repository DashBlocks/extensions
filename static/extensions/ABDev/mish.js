/* Author: ABDev */
(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must run unsandboxed');
  }

  class MegaUltraProMouse {
    constructor(runtime) {
      this.runtime = runtime;
      this.canvas = null;

      this.mouseX = 0;                    
      this.mouseY = 0;                    
      this.mouseScreenX = 0;              
      this.mouseScreenY = 0;              
      this.mouseCanvasX = 0;              
      this.mouseCanvasY = 0;              
      this.mouseRawX = 0;                 
      this.mouseRawY = 0;                 
      this.prevMouseX = 0;                
      this.prevMouseY = 0;                
      this.mouseDeltaX = 0;              
      this.mouseDeltaY = 0;              
      this.mouseSpeedX = 0;              
      this.mouseSpeedY = 0;              
      this.mouseSpeed = 0;               
      this.mouseAngle = 0;               
      this.mouseAcceleration = 0;        
      this.prevSpeed = 0;
      this.totalDistance = 0;             
      this.mouseTrail = [];              
      this.maxTrailLength = 500;

      this.buttonsDown = {};              
      this.buttonsJustPressed = {};       
      this.buttonsJustReleased = {};      
      this.buttonPressTime = {};          
      this.buttonReleaseTime = {};        
      this.buttonHoldTime = {};           
      this.buttonPressCount = {};         
      this.lastButtonPressed = -1;        
      this.lastButtonReleased = -1;       
      this.totalClicks = 0;              
      this.clicksPerSecond = 0;          
      this.cpsHistory = [];

      this.doubleClickTime = 300;
      this.lastClickTime = {};
      this.doubleClicked = {};
      this.tripleClicked = {};
      this.clickCount = {};              

      this.longPressThreshold = 500;
      this.longPressed = {};

      this.scrollDeltaX = 0;
      this.scrollDeltaY = 0;
      this.scrollDeltaZ = 0;
      this.totalScrollUp = 0;
      this.totalScrollDown = 0;
      this.totalScrollLeft = 0;
      this.totalScrollRight = 0;
      this.scrollSpeed = 0;
      this.lastScrollTime = 0;
      this.isScrolling = false;
      this.scrollAccumX = 0;
      this.scrollAccumY = 0;

      this.isDragging = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.dragCurrentX = 0;
      this.dragCurrentY = 0;
      this.dragDeltaX = 0;
      this.dragDeltaY = 0;
      this.dragDistance = 0;
      this.dragButton = -1;
      this.dragThreshold = 5;
      this.potentialDrag = false;

      this.currentCursor = 'default';
      this.cursorVisible = true;
      this.customCursorURL = '';
      this.cursorLocked = false;

      this.zones = {};
      this.hoveredZones = [];

      this.gesturePoints = [];
      this.isRecordingGesture = false;
      this.gestureStartTime = 0;
      this.lastGestureDirection = '';
      this.gestureDirections = [];

      this.hoveredSprite = '';
      this.clickedSprite = '';
      this.lastClickedSprite = '';
      this.spriteClickCounts = {};

      this.pointerLocked = false;
      this.pointerLockDeltaX = 0;
      this.pointerLockDeltaY = 0;

      this.recordedActions = [];
      this.isRecording = false;
      this.recordStartTime = 0;

      this.virtualMouseX = 0;
      this.virtualMouseY = 0;
      this.virtualButtons = {};

      this.heatmap = {};
      this.heatmapResolution = 10;

      this.mouseInCanvas = false;
      this.mouseInStage = false;

      this.inertiaEnabled = false;
      this.inertiaX = 0;
      this.inertiaY = 0;
      this.inertiaFriction = 0.95;

      this.smoothingEnabled = false;
      this.smoothingFactor = 0.3;
      this.smoothX = 0;
      this.smoothY = 0;

      this.snapToGrid = false;
      this.gridSize = 10;

      this.constrainEnabled = false;
      this.constrainMinX = -240;
      this.constrainMaxX = 240;
      this.constrainMinY = -180;
      this.constrainMaxY = 180;

      this.eventLog = [];
      this.maxEventLog = 300;

      this.sessionStartTime = Date.now();
      this.mouseIdleTime = 0;
      this.lastMoveTime = Date.now();
      this.idleThreshold = 3000;
      this.isIdle = false;

      this.touches = {};
      this.touchCount = 0;
      this.pinchDistance = 0;
      this.pinchScale = 1;
      this.rotationAngle = 0;

      this._onMouseMove = this._onMouseMove.bind(this);
      this._onMouseDown = this._onMouseDown.bind(this);
      this._onMouseUp = this._onMouseUp.bind(this);
      this._onWheel = this._onWheel.bind(this);
      this._onContextMenu = this._onContextMenu.bind(this);
      this._onMouseEnter = this._onMouseEnter.bind(this);
      this._onMouseLeave = this._onMouseLeave.bind(this);
      this._onPointerLockChange = this._onPointerLockChange.bind(this);
      this._onTouchStart = this._onTouchStart.bind(this);
      this._onTouchMove = this._onTouchMove.bind(this);
      this._onTouchEnd = this._onTouchEnd.bind(this);
      
      this._setupEvents();
      this._frameLoop();

      setInterval(() => {
        const now = Date.now();
        this.cpsHistory = this.cpsHistory.filter(t => now - t < 1000);
        this.clicksPerSecond = this.cpsHistory.length;
      }, 100);

      setInterval(() => {
        const now = Date.now();
        this.mouseIdleTime = now - this.lastMoveTime;
        const wasIdle = this.isIdle;
        this.isIdle = this.mouseIdleTime >= this.idleThreshold;
        if (this.isIdle && !wasIdle) {
          this.runtime.startHats('megaMouse_onIdle');
        }
      }, 200);

      setInterval(() => {
        const now = Date.now();
        for (let btn = 0; btn <= 2; btn++) {
          if (this.buttonsDown[btn] && this.buttonPressTime[btn]) {
            this.buttonHoldTime[btn] = now - this.buttonPressTime[btn];
            if (this.buttonHoldTime[btn] >= this.longPressThreshold && !this.longPressed[btn]) {
              this.longPressed[btn] = true;
              this._logEvent('longpress', btn);
              this.runtime.startHats('megaMouse_onLongPress');
            }
          }
        }
      }, 50);

      setInterval(() => {
        if (this.isScrolling && Date.now() - this.lastScrollTime > 150) {
          this.isScrolling = false;
          this.scrollDeltaX = 0;
          this.scrollDeltaY = 0;
          this.scrollSpeed = 0;
          this.runtime.startHats('megaMouse_onScrollStop');
        }
      }, 100);

      setInterval(() => {
        if (this.inertiaEnabled) {
          this.inertiaX *= this.inertiaFriction;
          this.inertiaY *= this.inertiaFriction;
          if (Math.abs(this.inertiaX) < 0.01) this.inertiaX = 0;
          if (Math.abs(this.inertiaY) < 0.01) this.inertiaY = 0;
        }
      }, 16);
    }

    _getCanvas() {
      if (!this.canvas) {
        this.canvas = document.querySelector('canvas');
      }
      return this.canvas;
    }

    _setupEvents() {
      document.addEventListener('mousemove', this._onMouseMove, true);
      document.addEventListener('mousedown', this._onMouseDown, true);
      document.addEventListener('mouseup', this._onMouseUp, true);
      document.addEventListener('wheel', this._onWheel, { passive: false, capture: true });
      document.addEventListener('contextmenu', this._onContextMenu, true);
      document.addEventListener('pointerlockchange', this._onPointerLockChange);
      document.addEventListener('touchstart', this._onTouchStart, { passive: false });
      document.addEventListener('touchmove', this._onTouchMove, { passive: false });
      document.addEventListener('touchend', this._onTouchEnd, { passive: false });
      
      const canvas = this._getCanvas();
      if (canvas) {
        canvas.addEventListener('mouseenter', this._onMouseEnter);
        canvas.addEventListener('mouseleave', this._onMouseLeave);
      }
    }

    _screenToScratch(clientX, clientY) {
      const canvas = this._getCanvas();
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = 480 / rect.width;
      const scaleY = 360 / rect.height;
      const x = (clientX - rect.left) * scaleX - 240;
      const y = 180 - (clientY - rect.top) * scaleY;
      return { x, y };
    }

    _onMouseMove(e) {
      this.prevMouseX = this.mouseX;
      this.prevMouseY = this.mouseY;
      
      this.mouseScreenX = e.screenX;
      this.mouseScreenY = e.screenY;
      this.mouseRawX = e.clientX;
      this.mouseRawY = e.clientY;
      
      const canvas = this._getCanvas();
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        this.mouseCanvasX = e.clientX - rect.left;
        this.mouseCanvasY = e.clientY - rect.top;
      }
      
      const pos = this._screenToScratch(e.clientX, e.clientY);
      this.mouseX = pos.x;
      this.mouseY = pos.y;

      if (this.pointerLocked) {
        this.pointerLockDeltaX = e.movementX || 0;
        this.pointerLockDeltaY = e.movementY || 0;
      }

      this.mouseDeltaX = this.mouseX - this.prevMouseX;
      this.mouseDeltaY = this.mouseY - this.prevMouseY;

      const dist = Math.sqrt(this.mouseDeltaX ** 2 + this.mouseDeltaY ** 2);
      this.prevSpeed = this.mouseSpeed;
      this.mouseSpeed = dist;
      this.mouseSpeedX = Math.abs(this.mouseDeltaX);
      this.mouseSpeedY = Math.abs(this.mouseDeltaY);

      this.mouseAcceleration = this.mouseSpeed - this.prevSpeed;

      if (dist > 0.1) {
        this.mouseAngle = Math.atan2(this.mouseDeltaY, this.mouseDeltaX) * 180 / Math.PI;
      }

      this.totalDistance += dist;

      if (this.inertiaEnabled) {
        this.inertiaX = this.mouseDeltaX;
        this.inertiaY = this.mouseDeltaY;
      }

      if (this.smoothingEnabled) {
        this.smoothX += (this.mouseX - this.smoothX) * this.smoothingFactor;
        this.smoothY += (this.mouseY - this.smoothY) * this.smoothingFactor;
      } else {
        this.smoothX = this.mouseX;
        this.smoothY = this.mouseY;
      }

      this.mouseTrail.push({ x: this.mouseX, y: this.mouseY, time: Date.now() });
      if (this.mouseTrail.length > this.maxTrailLength) {
        this.mouseTrail.shift();
      }

      const hx = Math.round(this.mouseX / this.heatmapResolution) * this.heatmapResolution;
      const hy = Math.round(this.mouseY / this.heatmapResolution) * this.heatmapResolution;
      const hKey = `${hx},${hy}`;
      this.heatmap[hKey] = (this.heatmap[hKey] || 0) + 1;

      this.lastMoveTime = Date.now();
      if (this.isIdle) {
        this.isIdle = false;
        this.runtime.startHats('megaMouse_onIdleEnd');
      }

      if (this.potentialDrag && !this.isDragging) {
        const dragDist = Math.sqrt(
          (this.mouseX - this.dragStartX) ** 2 + 
          (this.mouseY - this.dragStartY) ** 2
        );
        if (dragDist >= this.dragThreshold) {
          this.isDragging = true;
          this._logEvent('dragstart', this.dragButton);
          this.runtime.startHats('megaMouse_onDragStart');
        }
      }
      
      if (this.isDragging) {
        this.dragCurrentX = this.mouseX;
        this.dragCurrentY = this.mouseY;
        this.dragDeltaX = this.mouseX - this.dragStartX;
        this.dragDeltaY = this.mouseY - this.dragStartY;
        this.dragDistance = Math.sqrt(this.dragDeltaX ** 2 + this.dragDeltaY ** 2);
        this.runtime.startHats('megaMouse_onDrag');
      }

      if (this.isRecordingGesture) {
        this.gesturePoints.push({ x: this.mouseX, y: this.mouseY, time: Date.now() });
        this._updateGestureDirection();
      }

      this._checkZones();

      this._checkSpriteHover();

      if (this.isRecording) {
        this.recordedActions.push({
          type: 'move',
          x: this.mouseX,
          y: this.mouseY,
          time: Date.now() - this.recordStartTime
        });
      }

      this.mouseInStage = this.mouseX >= -240 && this.mouseX <= 240 && 
                           this.mouseY >= -180 && this.mouseY <= 180;
      
      this._logEvent('move', `${Math.round(this.mouseX)},${Math.round(this.mouseY)}`);
      this.runtime.startHats('megaMouse_onMove');
    }

    _onMouseDown(e) {
      const btn = e.button; 
      
      this.buttonsDown[btn] = true;
      this.buttonsJustPressed[btn] = true;
      this.buttonPressTime[btn] = Date.now();
      this.buttonPressCount[btn] = (this.buttonPressCount[btn] || 0) + 1;
      this.lastButtonPressed = btn;
      this.totalClicks++;
      this.cpsHistory.push(Date.now());

      const now = Date.now();
      if (!this.clickCount[btn]) this.clickCount[btn] = 0;
      if (this.lastClickTime[btn] && (now - this.lastClickTime[btn]) < this.doubleClickTime) {
        this.clickCount[btn]++;
        if (this.clickCount[btn] === 2) {
          this.doubleClicked[btn] = true;
          this._logEvent('doubleclick', btn);
          this.runtime.startHats('megaMouse_onDoubleClick');
        }
        if (this.clickCount[btn] >= 3) {
          this.tripleClicked[btn] = true;
          this._logEvent('tripleclick', btn);
          this.runtime.startHats('megaMouse_onTripleClick');
        }
      } else {
        this.clickCount[btn] = 1;
      }
      this.lastClickTime[btn] = now;

      this.potentialDrag = true;
      this.dragStartX = this.mouseX;
      this.dragStartY = this.mouseY;
      this.dragButton = btn;

      this._checkSpriteClick(e);

      if (this.isRecording) {
        this.recordedActions.push({
          type: 'down',
          button: btn,
          x: this.mouseX,
          y: this.mouseY,
          time: Date.now() - this.recordStartTime
        });
      }
      
      this._logEvent('mousedown', btn);

      this.runtime.startHats('megaMouse_onAnyButtonDown');
      if (btn === 0) this.runtime.startHats('megaMouse_onLeftDown');
      if (btn === 1) this.runtime.startHats('megaMouse_onMiddleDown');
      if (btn === 2) this.runtime.startHats('megaMouse_onRightDown');
      this.runtime.startHats('megaMouse_onButtonDown');
    }

    _onMouseUp(e) {
      const btn = e.button;
      
      if (this.buttonsDown[btn]) {
        this.buttonsDown[btn] = false;
        this.buttonsJustReleased[btn] = true;
        this.buttonReleaseTime[btn] = Date.now();
        this.lastButtonReleased = btn;
        this.longPressed[btn] = false;
        this.buttonHoldTime[btn] = 0;
      }

      if (this.isDragging && this.dragButton === btn) {
        this.isDragging = false;
        this.potentialDrag = false;
        this._logEvent('dragend', btn);
        this.runtime.startHats('megaMouse_onDragEnd');
      }
      this.potentialDrag = false;

      if (this.isRecording) {
        this.recordedActions.push({
          type: 'up',
          button: btn,
          x: this.mouseX,
          y: this.mouseY,
          time: Date.now() - this.recordStartTime
        });
      }
      
      this._logEvent('mouseup', btn);
      
      this.runtime.startHats('megaMouse_onAnyButtonUp');
      if (btn === 0) this.runtime.startHats('megaMouse_onLeftUp');
      if (btn === 1) this.runtime.startHats('megaMouse_onMiddleUp');
      if (btn === 2) this.runtime.startHats('megaMouse_onRightUp');
      this.runtime.startHats('megaMouse_onButtonUp');
    }

    _onWheel(e) {
      this.scrollDeltaX = e.deltaX;
      this.scrollDeltaY = e.deltaY;
      this.scrollDeltaZ = e.deltaZ || 0;
      this.scrollSpeed = Math.sqrt(e.deltaX ** 2 + e.deltaY ** 2);
      this.lastScrollTime = Date.now();
      this.isScrolling = true;
      
      this.scrollAccumX += e.deltaX;
      this.scrollAccumY += e.deltaY;
      
      if (e.deltaY < 0) this.totalScrollUp += Math.abs(e.deltaY);
      if (e.deltaY > 0) this.totalScrollDown += Math.abs(e.deltaY);
      if (e.deltaX < 0) this.totalScrollLeft += Math.abs(e.deltaX);
      if (e.deltaX > 0) this.totalScrollRight += Math.abs(e.deltaX);
      
      if (this.isRecording) {
        this.recordedActions.push({
          type: 'scroll',
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          time: Date.now() - this.recordStartTime
        });
      }
      
      this._logEvent('scroll', `${e.deltaX},${e.deltaY}`);
      
      this.runtime.startHats('megaMouse_onScroll');
      if (e.deltaY < 0) this.runtime.startHats('megaMouse_onScrollUp');
      if (e.deltaY > 0) this.runtime.startHats('megaMouse_onScrollDown');
      if (e.deltaX < 0) this.runtime.startHats('megaMouse_onScrollLeft');
      if (e.deltaX > 0) this.runtime.startHats('megaMouse_onScrollRight');
    }

    _onContextMenu(e) {
      
      this._logEvent('contextmenu', '');
      this.runtime.startHats('megaMouse_onContextMenu');
    }

    _onMouseEnter(e) {
      this.mouseInCanvas = true;
      this._logEvent('enter', '');
      this.runtime.startHats('megaMouse_onEnterCanvas');
    }

    _onMouseLeave(e) {
      this.mouseInCanvas = false;
      this._logEvent('leave', '');
      this.runtime.startHats('megaMouse_onLeaveCanvas');
    }

    _onPointerLockChange() {
      this.pointerLocked = !!document.pointerLockElement;
      if (this.pointerLocked) {
        this.runtime.startHats('megaMouse_onPointerLocked');
      } else {
        this.runtime.startHats('megaMouse_onPointerUnlocked');
      }
    }

    _onTouchStart(e) {
      this.touchCount = e.touches.length;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        this.touches[t.identifier] = {
          x: t.clientX,
          y: t.clientY,
          startX: t.clientX,
          startY: t.clientY
        };
      }
      if (e.touches.length >= 2) {
        this._updatePinch(e);
      }
      this.runtime.startHats('megaMouse_onTouchStart');
    }

    _onTouchMove(e) {
      this.touchCount = e.touches.length;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (this.touches[t.identifier]) {
          this.touches[t.identifier].x = t.clientX;
          this.touches[t.identifier].y = t.clientY;
        }
      }
      if (e.touches.length >= 2) {
        this._updatePinch(e);
      }
      this.runtime.startHats('megaMouse_onTouchMove');
    }

    _onTouchEnd(e) {
      this.touchCount = e.touches.length;
      for (const id in this.touches) {
        let found = false;
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier == id) { found = true; break; }
        }
        if (!found) delete this.touches[id];
      }
      this.runtime.startHats('megaMouse_onTouchEnd');
    }

    _updatePinch(e) {
      if (e.touches.length >= 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const newDist = Math.sqrt((t2.clientX - t1.clientX) ** 2 + (t2.clientY - t1.clientY) ** 2);
        if (this.pinchDistance > 0) {
          this.pinchScale = newDist / this.pinchDistance;
        }
        this.pinchDistance = newDist;
        
        const newAngle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;
        this.rotationAngle = newAngle;
      }
    }

    _checkZones() {
      this.hoveredZones = [];
      for (const name in this.zones) {
        const z = this.zones[name];
        if (this.mouseX >= z.x1 && this.mouseX <= z.x2 && 
            this.mouseY >= z.y1 && this.mouseY <= z.y2) {
          this.hoveredZones.push(name);
        }
      }
    }

    _checkSpriteHover() {
      const targets = this.runtime.targets;
      this.hoveredSprite = '';
      if (!targets) return;
      
      for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        if (target.isStage) continue;
        if (!target.visible) continue;
        
        const drawableID = target.drawableID;
        if (drawableID === undefined) continue;
        
        try {
          const renderer = this.runtime.renderer;
          if (renderer) {
            const pickResult = renderer.pick(this.mouseCanvasX, this.mouseCanvasY);
            if (pickResult >= 0) {
              for (const t of targets) {
                if (t.drawableID === pickResult && !t.isStage) {
                  this.hoveredSprite = t.sprite.name;
                  break;
                }
              }
            }
          }
        } catch(e) {}
        break;
      }
    }

    _checkSpriteClick(e) {
      try {
        const renderer = this.runtime.renderer;
        if (!renderer) return;
        const canvas = this._getCanvas();
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const pickResult = renderer.pick(cx, cy);
        if (pickResult >= 0) {
          const targets = this.runtime.targets;
          for (const t of targets) {
            if (t.drawableID === pickResult && !t.isStage) {
              this.clickedSprite = t.sprite.name;
              this.lastClickedSprite = t.sprite.name;
              this.spriteClickCounts[t.sprite.name] = (this.spriteClickCounts[t.sprite.name] || 0) + 1;
              this.runtime.startHats('megaMouse_onSpriteClicked');
              return;
            }
          }
        }
        this.clickedSprite = '';
      } catch(e) {
        this.clickedSprite = '';
      }
    }

    _updateGestureDirection() {
      if (this.gesturePoints.length < 2) return;
      const last = this.gesturePoints[this.gesturePoints.length - 1];
      const prev = this.gesturePoints[this.gesturePoints.length - 2];
      const dx = last.x - prev.x;
      const dy = last.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 3) return;
      
      let dir = '';
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      if (angle >= -45 && angle < 45) dir = 'right';
      else if (angle >= 45 && angle < 135) dir = 'up';
      else if (angle >= -135 && angle < -45) dir = 'down';
      else dir = 'left';
      
      if (dir !== this.lastGestureDirection) {
        this.lastGestureDirection = dir;
        this.gestureDirections.push(dir);
      }
    }

    _logEvent(type, data) {
      this.eventLog.push({ type, data, time: Date.now() });
      if (this.eventLog.length > this.maxEventLog) {
        this.eventLog.shift();
      }
    }

    _frameLoop() {
      requestAnimationFrame(() => {
        this._frameUpdate();
        this._frameLoop();
      });
    }

    _frameUpdate() {
      this.buttonsJustPressed = {};
      this.buttonsJustReleased = {};
      this.doubleClicked = {};
      this.tripleClicked = {};
      this.clickedSprite = '';
    }

    _buttonName(btn) {
      const names = { 0: 'левая', 1: 'средняя', 2: 'правая', 3: 'кнопка 4', 4: 'кнопка 5' };
      return names[btn] || `кнопка ${btn}`;
    }

    _getProcessedX() {
      let x = this.smoothingEnabled ? this.smoothX : this.mouseX;
      if (this.snapToGrid) x = Math.round(x / this.gridSize) * this.gridSize;
      if (this.constrainEnabled) x = Math.max(this.constrainMinX, Math.min(this.constrainMaxX, x));
      return x;
    }

    _getProcessedY() {
      let y = this.smoothingEnabled ? this.smoothY : this.mouseY;
      if (this.snapToGrid) y = Math.round(y / this.gridSize) * this.gridSize;
      if (this.constrainEnabled) y = Math.max(this.constrainMinY, Math.min(this.constrainMaxY, y));
      return y;
    }

    getInfo() {
      return {
        id: 'megaMouse',
        name: '🖱️ MEGA Mouse PRO',
        color1: '#0099FF',
        color2: '#0077CC',
        color3: '#005599',
        
        blocks: [

          {
            blockType: Scratch.BlockType.LABEL,
            text: '⚡ События кнопок мыши'
          },
          {
            opcode: 'onLeftDown',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда левая кнопка нажата',
            isEdgeActivated: false
          },
          {
            opcode: 'onLeftUp',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда левая кнопка отпущена',
            isEdgeActivated: false
          },
          {
            opcode: 'onMiddleDown',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда средняя кнопка нажата',
            isEdgeActivated: false
          },
          {
            opcode: 'onMiddleUp',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда средняя кнопка отпущена',
            isEdgeActivated: false
          },
          {
            opcode: 'onRightDown',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда правая кнопка нажата',
            isEdgeActivated: false
          },
          {
            opcode: 'onRightUp',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда правая кнопка отпущена',
            isEdgeActivated: false
          },
          {
            opcode: 'onAnyButtonDown',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда любая кнопка нажата',
            isEdgeActivated: false
          },
          {
            opcode: 'onAnyButtonUp',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда любая кнопка отпущена',
            isEdgeActivated: false
          },
          {
            opcode: 'onButtonDown',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда кнопка [BTN] нажата',
            isEdgeActivated: false,
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, menu: 'buttonMenu' }
            }
          },
          {
            opcode: 'onButtonUp',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда кнопка [BTN] отпущена',
            isEdgeActivated: false,
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, menu: 'buttonMenu' }
            }
          },
          {
            opcode: 'onDoubleClick',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда двойной клик',
            isEdgeActivated: false
          },
          {
            opcode: 'onTripleClick',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда тройной клик',
            isEdgeActivated: false
          },
          {
            opcode: 'onLongPress',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда долгое нажатие',
            isEdgeActivated: false
          },
          {
            opcode: 'onContextMenu',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда вызвано контекстное меню',
            isEdgeActivated: false
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '⚡ События движения'
          },
          {
            opcode: 'onMove',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда мышь двигается',
            isEdgeActivated: false
          },
          {
            opcode: 'onIdle',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда мышь бездействует',
            isEdgeActivated: false
          },
          {
            opcode: 'onIdleEnd',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда мышь снова активна',
            isEdgeActivated: false
          },
          {
            opcode: 'onEnterCanvas',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда мышь вошла на сцену',
            isEdgeActivated: false
          },
          {
            opcode: 'onLeaveCanvas',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда мышь покинула сцену',
            isEdgeActivated: false
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '⚡ События колеса'
          },
          {
            opcode: 'onScroll',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда колесо прокручено',
            isEdgeActivated: false
          },
          {
            opcode: 'onScrollUp',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда колесо вверх',
            isEdgeActivated: false
          },
          {
            opcode: 'onScrollDown',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда колесо вниз',
            isEdgeActivated: false
          },
          {
            opcode: 'onScrollLeft',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда колесо влево',
            isEdgeActivated: false
          },
          {
            opcode: 'onScrollRight',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда колесо вправо',
            isEdgeActivated: false
          },
          {
            opcode: 'onScrollStop',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда прокрутка остановилась',
            isEdgeActivated: false
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '⚡ События перетаскивания и спрайтов'
          },
          {
            opcode: 'onDragStart',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда начато перетаскивание',
            isEdgeActivated: false
          },
          {
            opcode: 'onDrag',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда идёт перетаскивание',
            isEdgeActivated: false
          },
          {
            opcode: 'onDragEnd',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда перетаскивание завершено',
            isEdgeActivated: false
          },
          {
            opcode: 'onSpriteClicked',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда кликнут спрайт',
            isEdgeActivated: false
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '⚡ События тачскрина'
          },
          {
            opcode: 'onTouchStart',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда касание началось',
            isEdgeActivated: false
          },
          {
            opcode: 'onTouchMove',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда касание двигается',
            isEdgeActivated: false
          },
          {
            opcode: 'onTouchEnd',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда касание закончилось',
            isEdgeActivated: false
          },
          {
            opcode: 'onPointerLocked',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда указатель заблокирован',
            isEdgeActivated: false
          },
          {
            opcode: 'onPointerUnlocked',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда указатель разблокирован',
            isEdgeActivated: false
          },
          
          '---',

          {
            blockType: Scratch.BlockType.LABEL,
            text: '🔍 Проверка кнопок'
          },
          {
            opcode: 'isLeftDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'левая кнопка нажата?'
          },
          {
            opcode: 'isMiddleDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'средняя кнопка нажата?'
          },
          {
            opcode: 'isRightDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'правая кнопка нажата?'
          },
          {
            opcode: 'isButtonDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'кнопка [BTN] нажата?',
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, menu: 'buttonMenu' }
            }
          },
          {
            opcode: 'isAnyButtonDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'любая кнопка нажата?'
          },
          {
            opcode: 'isNoButtonDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'ни одна кнопка не нажата?'
          },
          {
            opcode: 'isButtonJustPressed',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'кнопка [BTN] только что нажата?',
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, menu: 'buttonMenu' }
            }
          },
          {
            opcode: 'isButtonJustReleased',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'кнопка [BTN] только что отпущена?',
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, menu: 'buttonMenu' }
            }
          },
          {
            opcode: 'isButtonLongPressed',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'кнопка [BTN] удерживается долго?',
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, menu: 'buttonMenu' }
            }
          },
          {
            opcode: 'isDoubleClicked',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'двойной клик [BTN]?',
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, menu: 'buttonMenu' }
            }
          },
          {
            opcode: 'isTripleClicked',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'тройной клик [BTN]?',
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, menu: 'buttonMenu' }
            }
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🔍 Проверка позиции и движения'
          },
          {
            opcode: 'isMouseMoving',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'мышь двигается?'
          },
          {
            opcode: 'isMouseIdle',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'мышь бездействует?'
          },
          {
            opcode: 'isMouseInCanvas',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'мышь на сцене?'
          },
          {
            opcode: 'isMouseInStage',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'мышь в пределах сцены?'
          },
          {
            opcode: 'isMouseInRect',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'мышь в области x1:[X1] y1:[Y1] x2:[X2] y2:[Y2]?',
            arguments: {
              X1: { type: Scratch.ArgumentType.NUMBER, defaultValue: -50 },
              Y1: { type: Scratch.ArgumentType.NUMBER, defaultValue: -50 },
              X2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              Y2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
            }
          },
          {
            opcode: 'isMouseInCircle',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'мышь в круге x:[X] y:[Y] радиус:[R]?',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              R: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
            }
          },
          {
            opcode: 'isMouseInZone',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'мышь в зоне [NAME]?',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'myZone' }
            }
          },
          {
            opcode: 'isMouseNearPoint',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'мышь ближе [DIST] к точке x:[X] y:[Y]?',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              DIST: { type: Scratch.ArgumentType.NUMBER, defaultValue: 30 }
            }
          },
          {
            opcode: 'isMouseMovingDirection',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'мышь двигается [DIR]?',
            arguments: {
              DIR: { type: Scratch.ArgumentType.STRING, menu: 'directionMenu' }
            }
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🔍 Проверка перетаскивания и колеса'
          },
          {
            opcode: 'isDragging',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'идёт перетаскивание?'
          },
          {
            opcode: 'isScrolling',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'колесо прокручивается?'
          },
          {
            opcode: 'isScrollingUp',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'колесо крутится вверх?'
          },
          {
            opcode: 'isScrollingDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'колесо крутится вниз?'
          },
          {
            opcode: 'isPointerLocked',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'указатель заблокирован?'
          },
          {
            opcode: 'isCursorVisible',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'курсор видим?'
          },
          {
            opcode: 'isHoveringSprite',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'мышь над спрайтом [NAME]?',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'Спрайт1' }
            }
          },
          {
            opcode: 'isHoveringAnySprite',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'мышь над каким-либо спрайтом?'
          },
          {
            opcode: 'isVirtualButtonDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'виртуальная кнопка [BTN] нажата?',
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, defaultValue: 'virtual1' }
            }
          },
          {
            opcode: 'isRecording',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'идёт запись мыши?'
          },
          {
            opcode: 'isTouching',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'есть касание экрана?'
          },
          
          '---',

          {
            blockType: Scratch.BlockType.LABEL,
            text: '📊 Позиция мыши'
          },
          {
            opcode: 'getMouseX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'мышь X'
          },
          {
            opcode: 'getMouseY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'мышь Y'
          },
          {
            opcode: 'getProcessedX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'мышь X (обработанный)'
          },
          {
            opcode: 'getProcessedY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'мышь Y (обработанный)'
          },
          {
            opcode: 'getMouseScreenX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'мышь экран X'
          },
          {
            opcode: 'getMouseScreenY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'мышь экран Y'
          },
          {
            opcode: 'getMouseCanvasX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'мышь канвас X'
          },
          {
            opcode: 'getMouseCanvasY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'мышь канвас Y'
          },
          {
            opcode: 'getPrevMouseX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'предыдущий X'
          },
          {
            opcode: 'getPrevMouseY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'предыдущий Y'
          },
          {
            opcode: 'getSmoothX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'сглаженный X'
          },
          {
            opcode: 'getSmoothY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'сглаженный Y'
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '📊 Движение мыши'
          },
          {
            opcode: 'getDeltaX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'дельта X'
          },
          {
            opcode: 'getDeltaY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'дельта Y'
          },
          {
            opcode: 'getMouseSpeed',
            blockType: Scratch.BlockType.REPORTER,
            text: 'скорость мыши'
          },
          {
            opcode: 'getMouseSpeedX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'скорость X'
          },
          {
            opcode: 'getMouseSpeedY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'скорость Y'
          },
          {
            opcode: 'getMouseAcceleration',
            blockType: Scratch.BlockType.REPORTER,
            text: 'ускорение мыши'
          },
          {
            opcode: 'getMouseAngle',
            blockType: Scratch.BlockType.REPORTER,
            text: 'угол движения (градусы)'
          },
          {
            opcode: 'getTotalDistance',
            blockType: Scratch.BlockType.REPORTER,
            text: 'общее расстояние'
          },
          {
            opcode: 'getInertiaX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'инерция X'
          },
          {
            opcode: 'getInertiaY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'инерция Y'
          },
          {
            opcode: 'getDistanceToPoint',
            blockType: Scratch.BlockType.REPORTER,
            text: 'расстояние до x:[X] y:[Y]',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'getAngleToPoint',
            blockType: Scratch.BlockType.REPORTER,
            text: 'угол до x:[X] y:[Y]',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'getPointerLockDeltaX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'pointer lock дельта X'
          },
          {
            opcode: 'getPointerLockDeltaY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'pointer lock дельта Y'
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '📊 Кнопки мыши'
          },
          {
            opcode: 'getLastButtonPressed',
            blockType: Scratch.BlockType.REPORTER,
            text: 'последняя нажатая кнопка'
          },
          {
            opcode: 'getLastButtonReleased',
            blockType: Scratch.BlockType.REPORTER,
            text: 'последняя отпущенная кнопка'
          },
          {
            opcode: 'getButtonHoldTime',
            blockType: Scratch.BlockType.REPORTER,
            text: 'время удержания кнопки [BTN] (мс)',
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, menu: 'buttonMenu' }
            }
          },
          {
            opcode: 'getButtonPressCount',
            blockType: Scratch.BlockType.REPORTER,
            text: 'сколько раз нажата кнопка [BTN]',
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, menu: 'buttonMenu' }
            }
          },
          {
            opcode: 'getTotalClicks',
            blockType: Scratch.BlockType.REPORTER,
            text: 'всего кликов'
          },
          {
            opcode: 'getClicksPerSecond',
            blockType: Scratch.BlockType.REPORTER,
            text: 'кликов в секунду (CPS)'
          },
          {
            opcode: 'getButtonsDownList',
            blockType: Scratch.BlockType.REPORTER,
            text: 'список нажатых кнопок'
          },
          {
            opcode: 'getButtonsDownCount',
            blockType: Scratch.BlockType.REPORTER,
            text: 'количество нажатых кнопок'
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '📊 Колесо мыши'
          },
          {
            opcode: 'getScrollDeltaX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'прокрутка дельта X'
          },
          {
            opcode: 'getScrollDeltaY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'прокрутка дельта Y'
          },
          {
            opcode: 'getScrollSpeed',
            blockType: Scratch.BlockType.REPORTER,
            text: 'скорость прокрутки'
          },
          {
            opcode: 'getScrollAccumX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'накопленная прокрутка X'
          },
          {
            opcode: 'getScrollAccumY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'накопленная прокрутка Y'
          },
          {
            opcode: 'getTotalScrollUp',
            blockType: Scratch.BlockType.REPORTER,
            text: 'всего прокручено вверх'
          },
          {
            opcode: 'getTotalScrollDown',
            blockType: Scratch.BlockType.REPORTER,
            text: 'всего прокручено вниз'
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '📊 Перетаскивание'
          },
          {
            opcode: 'getDragStartX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'начало перетаскивания X'
          },
          {
            opcode: 'getDragStartY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'начало перетаскивания Y'
          },
          {
            opcode: 'getDragDeltaX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'перетаскивание дельта X'
          },
          {
            opcode: 'getDragDeltaY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'перетаскивание дельта Y'
          },
          {
            opcode: 'getDragDistance',
            blockType: Scratch.BlockType.REPORTER,
            text: 'расстояние перетаскивания'
          },
          {
            opcode: 'getDragButton',
            blockType: Scratch.BlockType.REPORTER,
            text: 'кнопка перетаскивания'
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '📊 Спрайты и зоны'
          },
          {
            opcode: 'getHoveredSprite',
            blockType: Scratch.BlockType.REPORTER,
            text: 'спрайт под мышью'
          },
          {
            opcode: 'getLastClickedSprite',
            blockType: Scratch.BlockType.REPORTER,
            text: 'последний кликнутый спрайт'
          },
          {
            opcode: 'getClickedSprite',
            blockType: Scratch.BlockType.REPORTER,
            text: 'только что кликнутый спрайт'
          },
          {
            opcode: 'getSpriteClickCount',
            blockType: Scratch.BlockType.REPORTER,
            text: 'кликов по спрайту [NAME]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'Спрайт1' }
            }
          },
          {
            opcode: 'getHoveredZones',
            blockType: Scratch.BlockType.REPORTER,
            text: 'зоны под мышью'
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '📊 Тачскрин'
          },
          {
            opcode: 'getTouchCount',
            blockType: Scratch.BlockType.REPORTER,
            text: 'количество касаний'
          },
          {
            opcode: 'getPinchScale',
            blockType: Scratch.BlockType.REPORTER,
            text: 'масштаб щипка'
          },
          {
            opcode: 'getRotationAngle',
            blockType: Scratch.BlockType.REPORTER,
            text: 'угол вращения касаний'
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '📊 Статистика и прочее'
          },
          {
            opcode: 'getMouseIdleTime',
            blockType: Scratch.BlockType.REPORTER,
            text: 'время бездействия (мс)'
          },
          {
            opcode: 'getSessionDuration',
            blockType: Scratch.BlockType.REPORTER,
            text: 'длительность сессии (сек)'
          },
          {
            opcode: 'getCurrentCursor',
            blockType: Scratch.BlockType.REPORTER,
            text: 'текущий курсор'
          },
          {
            opcode: 'getGestureDirections',
            blockType: Scratch.BlockType.REPORTER,
            text: 'направления жеста'
          },
          {
            opcode: 'getTrailLength',
            blockType: Scratch.BlockType.REPORTER,
            text: 'длина следа мыши'
          },
          {
            opcode: 'getTrailJSON',
            blockType: Scratch.BlockType.REPORTER,
            text: 'след мыши (JSON последних [N])',
            arguments: {
              N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
            }
          },
          {
            opcode: 'getHeatmapJSON',
            blockType: Scratch.BlockType.REPORTER,
            text: 'тепловая карта (JSON)'
          },
          {
            opcode: 'getHeatmapValueAt',
            blockType: Scratch.BlockType.REPORTER,
            text: 'тепловая карта в x:[X] y:[Y]',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'getRecordingLength',
            blockType: Scratch.BlockType.REPORTER,
            text: 'длина записи'
          },
          {
            opcode: 'getRecordingJSON',
            blockType: Scratch.BlockType.REPORTER,
            text: 'запись (JSON)'
          },
          {
            opcode: 'getEventLogJSON',
            blockType: Scratch.BlockType.REPORTER,
            text: 'лог событий (JSON)'
          },
          {
            opcode: 'getVirtualMouseX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'виртуальная мышь X'
          },
          {
            opcode: 'getVirtualMouseY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'виртуальная мышь Y'
          },
          
          '---',

          {
            blockType: Scratch.BlockType.LABEL,
            text: '🎨 Курсор'
          },
          {
            opcode: 'setCursor',
            blockType: Scratch.BlockType.COMMAND,
            text: '🎨 установить курсор [CURSOR]',
            arguments: {
              CURSOR: { type: Scratch.ArgumentType.STRING, menu: 'cursorMenu' }
            }
          },
          {
            opcode: 'setCustomCursor',
            blockType: Scratch.BlockType.COMMAND,
            text: '🎨 курсор из URL [URL] смещение x:[X] y:[Y]',
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https:
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'setCursorFromCostume',
            blockType: Scratch.BlockType.COMMAND,
            text: '🎨 курсор из костюма (data URI) [DATA]',
            arguments: {
              DATA: { type: Scratch.ArgumentType.STRING, defaultValue: 'data:image/png;base64,...' }
            }
          },
          {
            opcode: 'hideCursor',
            blockType: Scratch.BlockType.COMMAND,
            text: '🎨 скрыть курсор'
          },
          {
            opcode: 'showCursor',
            blockType: Scratch.BlockType.COMMAND,
            text: '🎨 показать курсор'
          },
          {
            opcode: 'resetCursor',
            blockType: Scratch.BlockType.COMMAND,
            text: '🎨 сбросить курсор'
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🔒 Блокировка указателя'
          },
          {
            opcode: 'lockPointer',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔒 заблокировать указатель (pointer lock)'
          },
          {
            opcode: 'unlockPointer',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔓 разблокировать указатель'
          },
          {
            opcode: 'preventContextMenu',
            blockType: Scratch.BlockType.COMMAND,
            text: '🚫 блокировать контекстное меню: [ON]',
            arguments: {
              ON: { type: Scratch.ArgumentType.STRING, menu: 'onOffMenu' }
            }
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '📐 Зоны'
          },
          {
            opcode: 'createZone',
            blockType: Scratch.BlockType.COMMAND,
            text: '📐 создать зону [NAME] x1:[X1] y1:[Y1] x2:[X2] y2:[Y2]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'myZone' },
              X1: { type: Scratch.ArgumentType.NUMBER, defaultValue: -50 },
              Y1: { type: Scratch.ArgumentType.NUMBER, defaultValue: -50 },
              X2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              Y2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
            }
          },
          {
            opcode: 'deleteZone',
            blockType: Scratch.BlockType.COMMAND,
            text: '🗑️ удалить зону [NAME]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'myZone' }
            }
          },
          {
            opcode: 'deleteAllZones',
            blockType: Scratch.BlockType.COMMAND,
            text: '🗑️ удалить все зоны'
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '✋ Жесты мышью'
          },
          {
            opcode: 'startGesture',
            blockType: Scratch.BlockType.COMMAND,
            text: '✋ начать запись жеста'
          },
          {
            opcode: 'stopGesture',
            blockType: Scratch.BlockType.COMMAND,
            text: '✋ остановить запись жеста'
          },
          {
            opcode: 'clearGesture',
            blockType: Scratch.BlockType.COMMAND,
            text: '✋ очистить жест'
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🎬 Запись и воспроизведение'
          },
          {
            opcode: 'startRecording',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔴 начать запись мыши'
          },
          {
            opcode: 'stopRecording',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏹️ остановить запись'
          },
          {
            opcode: 'playRecording',
            blockType: Scratch.BlockType.COMMAND,
            text: '▶️ воспроизвести запись'
          },
          {
            opcode: 'playRecordingWithSpeed',
            blockType: Scratch.BlockType.COMMAND,
            text: '▶️ воспроизвести со скоростью [SPEED]x',
            arguments: {
              SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'clearRecording',
            blockType: Scratch.BlockType.COMMAND,
            text: '🗑️ очистить запись'
          },
          {
            opcode: 'loadRecordingFromJSON',
            blockType: Scratch.BlockType.COMMAND,
            text: '📂 загрузить запись из JSON [JSON]',
            arguments: {
              JSON: { type: Scratch.ArgumentType.STRING, defaultValue: '[]' }
            }
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🕹️ Виртуальная мышь'
          },
          {
            opcode: 'setVirtualMousePos',
            blockType: Scratch.BlockType.COMMAND,
            text: '🕹️ виртуальная мышь на x:[X] y:[Y]',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'moveVirtualMouse',
            blockType: Scratch.BlockType.COMMAND,
            text: '🕹️ сдвинуть виртуальную мышь на dx:[DX] dy:[DY]',
            arguments: {
              DX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              DY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'pressVirtualButton',
            blockType: Scratch.BlockType.COMMAND,
            text: '🕹️ нажать виртуальную кнопку [BTN]',
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, defaultValue: 'virtual1' }
            }
          },
          {
            opcode: 'releaseVirtualButton',
            blockType: Scratch.BlockType.COMMAND,
            text: '🕹️ отпустить виртуальную кнопку [BTN]',
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, defaultValue: 'virtual1' }
            }
          },
          {
            opcode: 'releaseAllVirtualButtons',
            blockType: Scratch.BlockType.COMMAND,
            text: '🕹️ отпустить все виртуальные кнопки'
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '⚙️ Настройки'
          },
          {
            opcode: 'setDoubleClickTime',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏱️ время двойного клика = [MS] мс',
            arguments: {
              MS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 300 }
            }
          },
          {
            opcode: 'setLongPressThreshold',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏱️ порог долгого нажатия = [MS] мс',
            arguments: {
              MS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 500 }
            }
          },
          {
            opcode: 'setDragThreshold',
            blockType: Scratch.BlockType.COMMAND,
            text: '📏 порог перетаскивания = [PX] пикс',
            arguments: {
              PX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 }
            }
          },
          {
            opcode: 'setIdleThreshold',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏱️ порог бездействия = [MS] мс',
            arguments: {
              MS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3000 }
            }
          },
          {
            opcode: 'enableSmoothing',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 сглаживание: [ON] фактор: [F]',
            arguments: {
              ON: { type: Scratch.ArgumentType.STRING, menu: 'onOffMenu' },
              F: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.3 }
            }
          },
          {
            opcode: 'enableInertia',
            blockType: Scratch.BlockType.COMMAND,
            text: '🌊 инерция: [ON] трение: [F]',
            arguments: {
              ON: { type: Scratch.ArgumentType.STRING, menu: 'onOffMenu' },
              F: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.95 }
            }
          },
          {
            opcode: 'enableSnapToGrid',
            blockType: Scratch.BlockType.COMMAND,
            text: '📐 привязка к сетке: [ON] размер: [SIZE]',
            arguments: {
              ON: { type: Scratch.ArgumentType.STRING, menu: 'onOffMenu' },
              SIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
            }
          },
          {
            opcode: 'enableConstrain',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔲 ограничить область: [ON]',
            arguments: {
              ON: { type: Scratch.ArgumentType.STRING, menu: 'onOffMenu' }
            }
          },
          {
            opcode: 'setConstrainBounds',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔲 границы: x1:[X1] y1:[Y1] x2:[X2] y2:[Y2]',
            arguments: {
              X1: { type: Scratch.ArgumentType.NUMBER, defaultValue: -240 },
              Y1: { type: Scratch.ArgumentType.NUMBER, defaultValue: -180 },
              X2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 240 },
              Y2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 180 }
            }
          },
          {
            opcode: 'setHeatmapResolution',
            blockType: Scratch.BlockType.COMMAND,
            text: '🗺️ разрешение тепловой карты = [RES]',
            arguments: {
              RES: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
            }
          },
          {
            opcode: 'setMaxTrailLength',
            blockType: Scratch.BlockType.COMMAND,
            text: '📏 макс длина следа = [N]',
            arguments: {
              N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 500 }
            }
          },
          
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🔄 Сброс'
          },
          {
            opcode: 'resetClickCounts',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 сбросить счётчики кликов'
          },
          {
            opcode: 'resetScrollAccum',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 сбросить накопленную прокрутку'
          },
          {
            opcode: 'clearTrail',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 очистить след мыши'
          },
          {
            opcode: 'clearHeatmap',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 очистить тепловую карту'
          },
          {
            opcode: 'clearEventLog',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 очистить лог событий'
          },
          {
            opcode: 'resetTotalDistance',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 сбросить общее расстояние'
          },
          {
            opcode: 'resetEverything',
            blockType: Scratch.BlockType.COMMAND,
            text: '💥 ПОЛНЫЙ СБРОС ВСЕГО'
          },
          
          '---',

          {
            blockType: Scratch.BlockType.LABEL,
            text: '⏳ Ожидание'
          },
          {
            opcode: 'waitForClick',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать клика [BTN]',
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, menu: 'buttonMenu' }
            }
          },
          {
            opcode: 'waitForAnyClick',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать любого клика'
          },
          {
            opcode: 'waitForRelease',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать отпускания [BTN]',
            arguments: {
              BTN: { type: Scratch.ArgumentType.STRING, menu: 'buttonMenu' }
            }
          },
          {
            opcode: 'waitForDoubleClick',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать двойного клика'
          },
          {
            opcode: 'waitForMouseInZone',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать мышь в зоне [NAME]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'myZone' }
            }
          },
          {
            opcode: 'waitForMouseMove',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать движения мыши'
          },
          {
            opcode: 'waitForScroll',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать прокрутки колеса'
          },
          {
            opcode: 'waitForSpriteClick',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать клика по спрайту [NAME]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'Спрайт1' }
            }
          },
          {
            opcode: 'waitForDrag',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать перетаскивания'
          },
          {
            opcode: 'waitForIdle',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать бездействия мыши'
          },
        ],
        
        menus: {
          buttonMenu: {
            acceptReporters: true,
            items: [
              { text: 'левая (0)', value: '0' },
              { text: 'средняя (1)', value: '1' },
              { text: 'правая (2)', value: '2' },
              { text: 'кнопка 4', value: '3' },
              { text: 'кнопка 5', value: '4' }
            ]
          },
          cursorMenu: {
            acceptReporters: true,
            items: [
              'default', 'pointer', 'crosshair', 'move', 'text', 'wait',
              'help', 'progress', 'not-allowed', 'no-drop', 'grab', 'grabbing',
              'all-scroll', 'col-resize', 'row-resize', 'n-resize', 's-resize',
              'e-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize',
              'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out',
              'copy', 'alias', 'context-menu', 'cell', 'vertical-text', 'none'
            ]
          },
          directionMenu: {
            acceptReporters: true,
            items: ['вверх', 'вниз', 'влево', 'вправо']
          },
          onOffMenu: {
            acceptReporters: true,
            items: ['вкл', 'выкл']
          }
        }
      };
    }

    onLeftDown() { return true; }
    onLeftUp() { return true; }
    onMiddleDown() { return true; }
    onMiddleUp() { return true; }
    onRightDown() { return true; }
    onRightUp() { return true; }
    onAnyButtonDown() { return true; }
    onAnyButtonUp() { return true; }
    onButtonDown(args) { return this.lastButtonPressed === Number(args.BTN); }
    onButtonUp(args) { return this.lastButtonReleased === Number(args.BTN); }
    onDoubleClick() { return true; }
    onTripleClick() { return true; }
    onLongPress() { return true; }
    onContextMenu() { return true; }
    onMove() { return true; }
    onIdle() { return true; }
    onIdleEnd() { return true; }
    onEnterCanvas() { return true; }
    onLeaveCanvas() { return true; }
    onScroll() { return true; }
    onScrollUp() { return true; }
    onScrollDown() { return true; }
    onScrollLeft() { return true; }
    onScrollRight() { return true; }
    onScrollStop() { return true; }
    onDragStart() { return true; }
    onDrag() { return true; }
    onDragEnd() { return true; }
    onSpriteClicked() { return true; }
    onTouchStart() { return true; }
    onTouchMove() { return true; }
    onTouchEnd() { return true; }
    onPointerLocked() { return true; }
    onPointerUnlocked() { return true; }

    isLeftDown() { return !!this.buttonsDown[0]; }
    isMiddleDown() { return !!this.buttonsDown[1]; }
    isRightDown() { return !!this.buttonsDown[2]; }
    isButtonDown(args) { return !!this.buttonsDown[Number(args.BTN)]; }
    isAnyButtonDown() { return Object.values(this.buttonsDown).some(v => v); }
    isNoButtonDown() { return !this.isAnyButtonDown(); }
    isButtonJustPressed(args) { return !!this.buttonsJustPressed[Number(args.BTN)]; }
    isButtonJustReleased(args) { return !!this.buttonsJustReleased[Number(args.BTN)]; }
    isButtonLongPressed(args) { return !!this.longPressed[Number(args.BTN)]; }
    isDoubleClicked(args) { return !!this.doubleClicked[Number(args.BTN)]; }
    isTripleClicked(args) { return !!this.tripleClicked[Number(args.BTN)]; }
    
    isMouseMoving() { return this.mouseSpeed > 0.5; }
    isMouseIdle() { return this.isIdle; }
    isMouseInCanvas() { return this.mouseInCanvas; }
    isMouseInStage() { return this.mouseInStage; }
    
    isMouseInRect(args) {
      const x1 = Math.min(args.X1, args.X2), x2 = Math.max(args.X1, args.X2);
      const y1 = Math.min(args.Y1, args.Y2), y2 = Math.max(args.Y1, args.Y2);
      return this.mouseX >= x1 && this.mouseX <= x2 && this.mouseY >= y1 && this.mouseY <= y2;
    }
    
    isMouseInCircle(args) {
      const dx = this.mouseX - args.X;
      const dy = this.mouseY - args.Y;
      return Math.sqrt(dx * dx + dy * dy) <= args.R;
    }
    
    isMouseInZone(args) {
      return this.hoveredZones.includes(args.NAME);
    }
    
    isMouseNearPoint(args) {
      const dx = this.mouseX - args.X;
      const dy = this.mouseY - args.Y;
      return Math.sqrt(dx * dx + dy * dy) <= args.DIST;
    }
    
    isMouseMovingDirection(args) {
      if (this.mouseSpeed < 0.5) return false;
      const angle = this.mouseAngle;
      switch(args.DIR) {
        case 'вправо': return angle >= -45 && angle < 45;
        case 'вверх': return angle >= 45 && angle < 135;
        case 'влево': return angle >= 135 || angle < -135;
        case 'вниз': return angle >= -135 && angle < -45;
        default: return false;
      }
    }
    
    isDragging() { return this.isDragging; }
    isScrolling() { return this.isScrolling; }
    isScrollingUp() { return this.isScrolling && this.scrollDeltaY < 0; }
    isScrollingDown() { return this.isScrolling && this.scrollDeltaY > 0; }
    isPointerLocked() { return this.pointerLocked; }
    isCursorVisible() { return this.cursorVisible; }
    
    isHoveringSprite(args) { return this.hoveredSprite === args.NAME; }
    isHoveringAnySprite() { return this.hoveredSprite !== ''; }
    isVirtualButtonDown(args) { return !!this.virtualButtons[args.BTN]; }
    isRecording() { return this.isRecording; }
    isTouching() { return this.touchCount > 0; }

    getMouseX() { return Math.round(this.mouseX * 100) / 100; }
    getMouseY() { return Math.round(this.mouseY * 100) / 100; }
    getProcessedX() { return Math.round(this._getProcessedX() * 100) / 100; }
    getProcessedY() { return Math.round(this._getProcessedY() * 100) / 100; }
    getMouseScreenX() { return this.mouseScreenX; }
    getMouseScreenY() { return this.mouseScreenY; }
    getMouseCanvasX() { return Math.round(this.mouseCanvasX); }
    getMouseCanvasY() { return Math.round(this.mouseCanvasY); }
    getPrevMouseX() { return Math.round(this.prevMouseX * 100) / 100; }
    getPrevMouseY() { return Math.round(this.prevMouseY * 100) / 100; }
    getSmoothX() { return Math.round(this.smoothX * 100) / 100; }
    getSmoothY() { return Math.round(this.smoothY * 100) / 100; }
    
    getDeltaX() { return Math.round(this.mouseDeltaX * 100) / 100; }
    getDeltaY() { return Math.round(this.mouseDeltaY * 100) / 100; }
    getMouseSpeed() { return Math.round(this.mouseSpeed * 100) / 100; }
    getMouseSpeedX() { return Math.round(this.mouseSpeedX * 100) / 100; }
    getMouseSpeedY() { return Math.round(this.mouseSpeedY * 100) / 100; }
    getMouseAcceleration() { return Math.round(this.mouseAcceleration * 100) / 100; }
    getMouseAngle() { return Math.round(this.mouseAngle * 100) / 100; }
    getTotalDistance() { return Math.round(this.totalDistance); }
    getInertiaX() { return Math.round(this.inertiaX * 100) / 100; }
    getInertiaY() { return Math.round(this.inertiaY * 100) / 100; }
    
    getDistanceToPoint(args) {
      const dx = this.mouseX - args.X;
      const dy = this.mouseY - args.Y;
      return Math.round(Math.sqrt(dx * dx + dy * dy) * 100) / 100;
    }
    
    getAngleToPoint(args) {
      const dx = args.X - this.mouseX;
      const dy = args.Y - this.mouseY;
      return Math.round(Math.atan2(dy, dx) * 180 / Math.PI * 100) / 100;
    }
    
    getPointerLockDeltaX() { return this.pointerLockDeltaX; }
    getPointerLockDeltaY() { return this.pointerLockDeltaY; }
    
    getLastButtonPressed() { return this.lastButtonPressed >= 0 ? this._buttonName(this.lastButtonPressed) : 'нет'; }
    getLastButtonReleased() { return this.lastButtonReleased >= 0 ? this._buttonName(this.lastButtonReleased) : 'нет'; }
    
    getButtonHoldTime(args) {
      const btn = Number(args.BTN);
      if (this.buttonsDown[btn] && this.buttonPressTime[btn]) {
        return Date.now() - this.buttonPressTime[btn];
      }
      return 0;
    }
    
    getButtonPressCount(args) { return this.buttonPressCount[Number(args.BTN)] || 0; }
    getTotalClicks() { return this.totalClicks; }
    getClicksPerSecond() { return this.clicksPerSecond; }
    
    getButtonsDownList() {
      const btns = Object.keys(this.buttonsDown).filter(k => this.buttonsDown[k]).map(k => this._buttonName(Number(k)));
      return btns.join(', ') || 'нет';
    }
    
    getButtonsDownCount() { return Object.values(this.buttonsDown).filter(v => v).length; }
    
    getScrollDeltaX() { return Math.round(this.scrollDeltaX * 10) / 10; }
    getScrollDeltaY() { return Math.round(this.scrollDeltaY * 10) / 10; }
    getScrollSpeed() { return Math.round(this.scrollSpeed * 10) / 10; }
    getScrollAccumX() { return Math.round(this.scrollAccumX); }
    getScrollAccumY() { return Math.round(this.scrollAccumY); }
    getTotalScrollUp() { return Math.round(this.totalScrollUp); }
    getTotalScrollDown() { return Math.round(this.totalScrollDown); }
    
    getDragStartX() { return Math.round(this.dragStartX * 100) / 100; }
    getDragStartY() { return Math.round(this.dragStartY * 100) / 100; }
    getDragDeltaX() { return Math.round(this.dragDeltaX * 100) / 100; }
    getDragDeltaY() { return Math.round(this.dragDeltaY * 100) / 100; }
    getDragDistance() { return Math.round(this.dragDistance * 100) / 100; }
    getDragButton() { return this.dragButton >= 0 ? this._buttonName(this.dragButton) : 'нет'; }
    
    getHoveredSprite() { return this.hoveredSprite || 'нет'; }
    getLastClickedSprite() { return this.lastClickedSprite || 'нет'; }
    getClickedSprite() { return this.clickedSprite || 'нет'; }
    getSpriteClickCount(args) { return this.spriteClickCounts[args.NAME] || 0; }
    getHoveredZones() { return this.hoveredZones.join(', ') || 'нет'; }
    
    getTouchCount() { return this.touchCount; }
    getPinchScale() { return Math.round(this.pinchScale * 1000) / 1000; }
    getRotationAngle() { return Math.round(this.rotationAngle * 100) / 100; }
    
    getMouseIdleTime() { return this.mouseIdleTime; }
    getSessionDuration() { return Math.floor((Date.now() - this.sessionStartTime) / 1000); }
    getCurrentCursor() { return this.currentCursor; }
    getGestureDirections() { return this.gestureDirections.join(' → ') || 'нет'; }
    getTrailLength() { return this.mouseTrail.length; }
    
    getTrailJSON(args) {
      const n = Math.min(Math.max(1, Math.floor(args.N)), this.mouseTrail.length);
      try { return JSON.stringify(this.mouseTrail.slice(-n).map(p => ({ x: Math.round(p.x), y: Math.round(p.y) }))); }
      catch(e) { return '[]'; }
    }
    
    getHeatmapJSON() {
      try { return JSON.stringify(this.heatmap); } catch(e) { return '{}'; }
    }
    
    getHeatmapValueAt(args) {
      const hx = Math.round(args.X / this.heatmapResolution) * this.heatmapResolution;
      const hy = Math.round(args.Y / this.heatmapResolution) * this.heatmapResolution;
      return this.heatmap[`${hx},${hy}`] || 0;
    }
    
    getRecordingLength() { return this.recordedActions.length; }
    getRecordingJSON() { try { return JSON.stringify(this.recordedActions); } catch(e) { return '[]'; } }
    getEventLogJSON() { try { return JSON.stringify(this.eventLog.slice(-30)); } catch(e) { return '[]'; } }
    getVirtualMouseX() { return this.virtualMouseX; }
    getVirtualMouseY() { return this.virtualMouseY; }

    setCursor(args) {
      this.currentCursor = args.CURSOR;
      this.cursorVisible = args.CURSOR !== 'none';
      const canvas = this._getCanvas();
      if (canvas) canvas.style.cursor = args.CURSOR;
      document.body.style.cursor = args.CURSOR;
    }
    
    setCustomCursor(args) {
      const url = args.URL;
      const x = Math.max(0, Math.min(128, args.X));
      const y = Math.max(0, Math.min(128, args.Y));
      const cursorValue = `url(${url}) ${x} ${y}, auto`;
      this.currentCursor = cursorValue;
      this.customCursorURL = url;
      this.cursorVisible = true;
      const canvas = this._getCanvas();
      if (canvas) canvas.style.cursor = cursorValue;
    }
    
    setCursorFromCostume(args) {
      const data = args.DATA;
      const cursorValue = `url(${data}) 0 0, auto`;
      this.currentCursor = cursorValue;
      this.cursorVisible = true;
      const canvas = this._getCanvas();
      if (canvas) canvas.style.cursor = cursorValue;
    }
    
    hideCursor() {
      this.cursorVisible = false;
      this.currentCursor = 'none';
      const canvas = this._getCanvas();
      if (canvas) canvas.style.cursor = 'none';
      document.body.style.cursor = 'none';
    }
    
    showCursor() {
      this.cursorVisible = true;
      this.currentCursor = 'default';
      const canvas = this._getCanvas();
      if (canvas) canvas.style.cursor = 'default';
      document.body.style.cursor = 'default';
    }
    
    resetCursor() {
      this.cursorVisible = true;
      this.currentCursor = 'default';
      this.customCursorURL = '';
      const canvas = this._getCanvas();
      if (canvas) canvas.style.cursor = '';
      document.body.style.cursor = '';
    }
    
    lockPointer() {
      const canvas = this._getCanvas();
      if (canvas && canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    }
    
    unlockPointer() {
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }
    }
    
    _preventContextMenu = false;
    preventContextMenu(args) {
      const on = args.ON === 'вкл';
      this._preventContextMenu = on;
      if (on) {
        document.addEventListener('contextmenu', this._blockContext, true);
      } else {
        document.removeEventListener('contextmenu', this._blockContext, true);
      }
    }
    _blockContext = (e) => { e.preventDefault(); };
    
    createZone(args) {
      this.zones[args.NAME] = {
        x1: Math.min(args.X1, args.X2),
        y1: Math.min(args.Y1, args.Y2),
        x2: Math.max(args.X1, args.X2),
        y2: Math.max(args.Y1, args.Y2)
      };
    }
    
    deleteZone(args) { delete this.zones[args.NAME]; }
    deleteAllZones() { this.zones = {}; }
    
    startGesture() {
      this.gesturePoints = [];
      this.gestureDirections = [];
      this.lastGestureDirection = '';
      this.isRecordingGesture = true;
      this.gestureStartTime = Date.now();
    }
    
    stopGesture() { this.isRecordingGesture = false; }
    
    clearGesture() {
      this.gesturePoints = [];
      this.gestureDirections = [];
      this.lastGestureDirection = '';
      this.isRecordingGesture = false;
    }
    
    startRecording() {
      this.recordedActions = [];
      this.isRecording = true;
      this.recordStartTime = Date.now();
    }
    
    stopRecording() { this.isRecording = false; }
    
    playRecording() { return this._playRecordingInternal(1); }
    
    playRecordingWithSpeed(args) {
      return this._playRecordingInternal(Math.max(0.1, Math.min(100, args.SPEED)));
    }
    
    _playRecordingInternal(speed) {
      return new Promise(resolve => {
        if (this.recordedActions.length === 0) { resolve(); return; }
        let i = 0;
        const playNext = () => {
          if (i >= this.recordedActions.length) { resolve(); return; }
          const action = this.recordedActions[i];
          const nextAction = this.recordedActions[i + 1];
          
          if (action.type === 'move') {
            this.virtualMouseX = action.x;
            this.virtualMouseY = action.y;
          } else if (action.type === 'down') {
            this.virtualButtons[action.button] = true;
          } else if (action.type === 'up') {
            this.virtualButtons[action.button] = false;
          }
          
          i++;
          if (nextAction) {
            const delay = (nextAction.time - action.time) / speed;
            setTimeout(playNext, Math.max(1, delay));
          } else {
            resolve();
          }
        };
        playNext();
      });
    }
    
    clearRecording() { this.recordedActions = []; this.isRecording = false; }
    
    loadRecordingFromJSON(args) {
      try {
        const data = JSON.parse(args.JSON);
        if (Array.isArray(data)) this.recordedActions = data;
      } catch(e) {}
    }
    
    setVirtualMousePos(args) {
      this.virtualMouseX = args.X;
      this.virtualMouseY = args.Y;
    }
    
    moveVirtualMouse(args) {
      this.virtualMouseX += args.DX;
      this.virtualMouseY += args.DY;
    }
    
    pressVirtualButton(args) { this.virtualButtons[args.BTN] = true; }
    releaseVirtualButton(args) { this.virtualButtons[args.BTN] = false; }
    releaseAllVirtualButtons() { this.virtualButtons = {}; }
    
    setDoubleClickTime(args) { this.doubleClickTime = Math.max(50, Math.min(2000, args.MS)); }
    setLongPressThreshold(args) { this.longPressThreshold = Math.max(100, Math.min(5000, args.MS)); }
    setDragThreshold(args) { this.dragThreshold = Math.max(1, Math.min(100, args.PX)); }
    setIdleThreshold(args) { this.idleThreshold = Math.max(500, Math.min(60000, args.MS)); }
    
    enableSmoothing(args) {
      this.smoothingEnabled = args.ON === 'вкл';
      this.smoothingFactor = Math.max(0.01, Math.min(1, args.F));
    }
    
    enableInertia(args) {
      this.inertiaEnabled = args.ON === 'вкл';
      this.inertiaFriction = Math.max(0.5, Math.min(0.999, args.F));
    }
    
    enableSnapToGrid(args) {
      this.snapToGrid = args.ON === 'вкл';
      this.gridSize = Math.max(1, Math.min(100, args.SIZE));
    }
    
    enableConstrain(args) { this.constrainEnabled = args.ON === 'вкл'; }
    
    setConstrainBounds(args) {
      this.constrainMinX = Math.min(args.X1, args.X2);
      this.constrainMinY = Math.min(args.Y1, args.Y2);
      this.constrainMaxX = Math.max(args.X1, args.X2);
      this.constrainMaxY = Math.max(args.Y1, args.Y2);
    }
    
    setHeatmapResolution(args) { this.heatmapResolution = Math.max(1, Math.min(100, args.RES)); }
    setMaxTrailLength(args) { this.maxTrailLength = Math.max(1, Math.min(10000, Math.floor(args.N))); }
    
    resetClickCounts() {
      this.buttonPressCount = {};
      this.totalClicks = 0;
      this.spriteClickCounts = {};
    }
    
    resetScrollAccum() { this.scrollAccumX = 0; this.scrollAccumY = 0; this.totalScrollUp = 0; this.totalScrollDown = 0; this.totalScrollLeft = 0; this.totalScrollRight = 0; }
    clearTrail() { this.mouseTrail = []; }
    clearHeatmap() { this.heatmap = {}; }
    clearEventLog() { this.eventLog = []; }
    resetTotalDistance() { this.totalDistance = 0; }
    
    resetEverything() {
      this.buttonsDown = {};
      this.buttonsJustPressed = {};
      this.buttonsJustReleased = {};
      this.buttonPressTime = {};
      this.buttonReleaseTime = {};
      this.buttonHoldTime = {};
      this.buttonPressCount = {};
      this.lastButtonPressed = -1;
      this.lastButtonReleased = -1;
      this.totalClicks = 0;
      this.clicksPerSecond = 0;
      this.cpsHistory = [];
      this.doubleClicked = {};
      this.tripleClicked = {};
      this.longPressed = {};
      this.scrollDeltaX = 0;
      this.scrollDeltaY = 0;
      this.scrollAccumX = 0;
      this.scrollAccumY = 0;
      this.totalScrollUp = 0;
      this.totalScrollDown = 0;
      this.totalScrollLeft = 0;
      this.totalScrollRight = 0;
      this.isDragging = false;
      this.potentialDrag = false;
      this.mouseTrail = [];
      this.heatmap = {};
      this.eventLog = [];
      this.totalDistance = 0;
      this.recordedActions = [];
      this.isRecording = false;
      this.gesturePoints = [];
      this.gestureDirections = [];
      this.isRecordingGesture = false;
      this.zones = {};
      this.virtualMouseX = 0;
      this.virtualMouseY = 0;
      this.virtualButtons = {};
      this.spriteClickCounts = {};
      this.hoveredSprite = '';
      this.lastClickedSprite = '';
      this.resetCursor();
      this.smoothingEnabled = false;
      this.inertiaEnabled = false;
      this.snapToGrid = false;
      this.constrainEnabled = false;
      this.sessionStartTime = Date.now();
    }

    waitForClick(args) {
      const btn = Number(args.BTN);
      return new Promise(resolve => {
        const check = () => {
          if (this.buttonsDown[btn]) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });
    }
    
    waitForAnyClick() {
      return new Promise(resolve => {
        const check = () => {
          if (Object.values(this.buttonsDown).some(v => v)) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });
    }
    
    waitForRelease(args) {
      const btn = Number(args.BTN);
      return new Promise(resolve => {
        const check = () => {
          if (!this.buttonsDown[btn]) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });
    }
    
    waitForDoubleClick() {
      return new Promise(resolve => {
        const check = () => {
          if (Object.values(this.doubleClicked).some(v => v)) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });
    }
    
    waitForMouseInZone(args) {
      return new Promise(resolve => {
        const check = () => {
          if (this.hoveredZones.includes(args.NAME)) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });
    }
    
    waitForMouseMove() {
      const startX = this.mouseX;
      const startY = this.mouseY;
      return new Promise(resolve => {
        const check = () => {
          if (this.mouseX !== startX || this.mouseY !== startY) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });
    }
    
    waitForScroll() {
      return new Promise(resolve => {
        const check = () => {
          if (this.isScrolling) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });
    }
    
    waitForSpriteClick(args) {
      return new Promise(resolve => {
        const check = () => {
          if (this.clickedSprite === args.NAME || this.lastClickedSprite === args.NAME) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });
    }
    
    waitForDrag() {
      return new Promise(resolve => {
        const check = () => {
          if (this.isDragging) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });
    }
    
    waitForIdle() {
      return new Promise(resolve => {
        const check = () => {
          if (this.isIdle) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });
    }
  }

  Scratch.extensions.register(new MegaUltraProMouse(Scratch.vm.runtime));
})(Scratch);
