/* Author: ABDev */
(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must run unsandboxed');
  }

  class MegaUltraProKeyboard {
    constructor(runtime) {
      this.runtime = runtime;

      this.keysDown = {};              
      this.keysJustPressed = {};       
      this.keysJustReleased = {};      
      this.keyHoldTime = {};           
      this.keyPressTime = {};          
      this.keyReleaseTime = {};        
      this.keyPressCount = {};         
      this.keySequence = [];           
      this.maxSequenceLength = 50;     
      this.lastKeyPressed = '';        
      this.lastKeyReleased = '';       
      this.totalKeysPressed = 0;       
      this.keysPerSecond = 0;          
      this.capsLockOn = false;         
      this.numLockOn = true;           
      this.scrollLockOn = false;       
      this.comboCallbacks = {};        
      this.recordedMacro = [];         
      this.isRecordingMacro = false;   
      this.macroStartTime = 0;         
      this.typedText = '';             
      this.isCapturingText = false;    
      this.keyMap = {};                
      this.blockedKeys = {};           
      this.keyGroups = {};             
      this.doubleClickTime = 300;      
      this.lastClickTimes = {};        
      this.doublePressed = {};         
      this.longPressThreshold = 500;   
      this.longPressed = {};           
      this.simultaneousKeys = [];      
      this.eventLog = [];              
      this.maxEventLog = 200;          
      this.kpsHistory = [];            
      this.ghostMode = false;          
      this.virtualKeysDown = {};       
      this.chordDetection = true;      
      this.currentChord = [];          
      this.chordTimeout = null;
      this.chordDelay = 50;            
      this.patternCallbacks = {};      
      this.repeatRate = {};            
      this.repeatTimers = {};          
      this.profiles = {};              
      this.currentProfile = 'default';
      this.heatmap = {};               
      this.sessionStartTime = Date.now();

      this.keyGroups['letters'] = 'abcdefghijklmnopqrstuvwxyz'.split('');
      this.keyGroups['numbers'] = '0123456789'.split('');
      this.keyGroups['arrows'] = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
      this.keyGroups['wasd'] = ['w', 'a', 's', 'd'];
      this.keyGroups['modifiers'] = ['shift', 'control', 'alt', 'meta'];
      this.keyGroups['function'] = ['f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12'];
      this.keyGroups['numpad'] = ['numpad0','numpad1','numpad2','numpad3','numpad4','numpad5','numpad6','numpad7','numpad8','numpad9'];
      this.keyGroups['punctuation'] = ['.', ',', ';', ':', '!', '?', "'", '"', '-', '_', '/', '\\', '(', ')', '[', ']', '{', '}'];
      this.keyGroups['special'] = ['enter', 'tab', 'escape', 'backspace', 'delete', 'insert', 'home', 'end', 'pageup', 'pagedown'];

      this._onKeyDown = this._onKeyDown.bind(this);
      this._onKeyUp = this._onKeyUp.bind(this);
      this._onBlur = this._onBlur.bind(this);
      this._frameUpdate = this._frameUpdate.bind(this);
      
      document.addEventListener('keydown', this._onKeyDown, true);
      document.addEventListener('keyup', this._onKeyUp, true);
      window.addEventListener('blur', this._onBlur);

      this._frameLoop();

      setInterval(() => {
        const now = Date.now();
        this.kpsHistory = this.kpsHistory.filter(t => now - t < 1000);
        this.keysPerSecond = this.kpsHistory.length;
      }, 100);

      setInterval(() => {
        const now = Date.now();
        for (const key in this.keysDown) {
          if (this.keysDown[key] && this.keyPressTime[key]) {
            const holdDuration = now - this.keyPressTime[key];
            this.keyHoldTime[key] = holdDuration;
            if (holdDuration >= this.longPressThreshold && !this.longPressed[key]) {
              this.longPressed[key] = true;
              this._logEvent('longpress', key);
              this.runtime.startHats('megaKeyboard_onLongPress');
            }
          }
        }
      }, 50);
    }

    _normalizeKey(key) {
      if (typeof key !== 'string') return '';
      return key.toLowerCase().trim();
    }
    
    _onKeyDown(e) {
      const rawKey = e.key;
      let key = this._normalizeKey(rawKey);

      if (this.blockedKeys[key]) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (this.keyMap[key]) {
        key = this.keyMap[key];
      }

      if (e.getModifierState) {
        this.capsLockOn = e.getModifierState('CapsLock');
        this.numLockOn = e.getModifierState('NumLock');
        this.scrollLockOn = e.getModifierState('ScrollLock');
      }
      
      if (!this.keysDown[key]) {
        
        this.keysDown[key] = true;
        this.keysJustPressed[key] = true;
        this.keyPressTime[key] = Date.now();
        this.keyPressCount[key] = (this.keyPressCount[key] || 0) + 1;
        this.totalKeysPressed++;
        this.lastKeyPressed = key;
        this.kpsHistory.push(Date.now());

        this.heatmap[key] = (this.heatmap[key] || 0) + 1;

        this.keySequence.push(key);
        if (this.keySequence.length > this.maxSequenceLength) {
          this.keySequence.shift();
        }

        const now = Date.now();
        if (this.lastClickTimes[key] && (now - this.lastClickTimes[key]) < this.doubleClickTime) {
          this.doublePressed[key] = true;
          this._logEvent('doublepress', key);
          this.runtime.startHats('megaKeyboard_onDoublePress');
        }
        this.lastClickTimes[key] = now;

        if (this.chordDetection) {
          this.currentChord.push(key);
          clearTimeout(this.chordTimeout);
          this.chordTimeout = setTimeout(() => {
            if (this.currentChord.length > 1) {
              this._logEvent('chord', this.currentChord.join('+'));
              this.runtime.startHats('megaKeyboard_onChord');
            }
          }, this.chordDelay);
        }

        this.simultaneousKeys = Object.keys(this.keysDown).filter(k => this.keysDown[k]);

        if (this.isRecordingMacro) {
          this.recordedMacro.push({
            type: 'down',
            key: key,
            time: Date.now() - this.macroStartTime
          });
        }

        if (this.isCapturingText) {
          this._handleTextCapture(key, e);
        }

        this._checkPatterns();

        this._logEvent('keydown', key);

        this.runtime.startHats('megaKeyboard_onKeyPressed');
        this.runtime.startHats('megaKeyboard_onSpecificKeyPressed');
        this.runtime.startHats('megaKeyboard_onAnyKeyPressed');
        
      } else {
        
        this._logEvent('keyrepeat', key);
        this.runtime.startHats('megaKeyboard_onKeyRepeat');
      }
      
      if (this.ghostMode) return;
    }
    
    _onKeyUp(e) {
      const rawKey = e.key;
      let key = this._normalizeKey(rawKey);
      
      if (this.keyMap[key]) {
        key = this.keyMap[key];
      }
      
      if (this.keysDown[key]) {
        this.keysDown[key] = false;
        this.keysJustReleased[key] = true;
        this.keyReleaseTime[key] = Date.now();
        this.lastKeyReleased = key;
        this.longPressed[key] = false;
        this.keyHoldTime[key] = 0;

        const idx = this.currentChord.indexOf(key);
        if (idx > -1) this.currentChord.splice(idx, 1);

        this.simultaneousKeys = Object.keys(this.keysDown).filter(k => this.keysDown[k]);

        if (this.isRecordingMacro) {
          this.recordedMacro.push({
            type: 'up',
            key: key,
            time: Date.now() - this.macroStartTime
          });
        }

        this._logEvent('keyup', key);

        this.runtime.startHats('megaKeyboard_onKeyReleased');
        this.runtime.startHats('megaKeyboard_onSpecificKeyReleased');
        this.runtime.startHats('megaKeyboard_onAnyKeyReleased');
      }
    }
    
    _onBlur() {
      
      for (const key in this.keysDown) {
        if (this.keysDown[key]) {
          this.keysDown[key] = false;
          this.keysJustReleased[key] = true;
          this.keyHoldTime[key] = 0;
          this.longPressed[key] = false;
        }
      }
      this.simultaneousKeys = [];
      this.currentChord = [];
    }
    
    _frameLoop() {
      requestAnimationFrame(() => {
        this._frameUpdate();
        this._frameLoop();
      });
    }
    
    _frameUpdate() {
      
      this.keysJustPressed = {};
      this.keysJustReleased = {};
      this.doublePressed = {};
    }
    
    _handleTextCapture(key, e) {
      if (key === 'backspace') {
        this.typedText = this.typedText.slice(0, -1);
      } else if (key === 'enter') {
        this.typedText += '\n';
      } else if (key === 'tab') {
        this.typedText += '\t';
      } else if (key === ' ' || key === 'space') {
        this.typedText += ' ';
      } else if (key.length === 1) {
        const char = e.shiftKey ? key.toUpperCase() : key;
        this.typedText += char;
      }
    }
    
    _logEvent(type, key) {
      this.eventLog.push({
        type: type,
        key: key,
        time: Date.now()
      });
      if (this.eventLog.length > this.maxEventLog) {
        this.eventLog.shift();
      }
    }
    
    _checkPatterns() {
      for (const name in this.patternCallbacks) {
        const pattern = this.patternCallbacks[name];
        const seqEnd = this.keySequence.slice(-pattern.length);
        if (seqEnd.length === pattern.length && seqEnd.every((k, i) => k === pattern[i])) {
          this.runtime.startHats('megaKeyboard_onPattern');
          this._logEvent('pattern', name);
        }
      }
    }
    
    _simulateKeyEvent(key, type) {
      const event = new KeyboardEvent(type, {
        key: key,
        code: 'Key' + key.toUpperCase(),
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
    }
    
    _getKeyDisplayName(key) {
      const names = {
        ' ': 'Space', 'arrowup': '↑', 'arrowdown': '↓',
        'arrowleft': '←', 'arrowright': '→', 'enter': '↵ Enter',
        'shift': '⇧ Shift', 'control': 'Ctrl', 'alt': 'Alt',
        'meta': '⌘/⊞', 'tab': '⇥ Tab', 'escape': 'Esc',
        'backspace': '⌫', 'delete': 'Del', 'capslock': 'Caps Lock',
        'insert': 'Ins', 'home': 'Home', 'end': 'End',
        'pageup': 'PgUp', 'pagedown': 'PgDn'
      };
      return names[key] || key.toUpperCase();
    }

    getInfo() {
      return {
        id: 'megaKeyboard',
        name: '🎹 MEGA Keyboard PRO',
        color1: '#FF2D00',
        color2: '#CC2400',
        color3: '#991B00',
        
        blocks: [

          {
            blockType: Scratch.BlockType.LABEL,
            text: '🎯 События клавиатуры'
          },
          {
            opcode: 'onAnyKeyPressed',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда любая клавиша нажата',
            isEdgeActivated: false
          },
          {
            opcode: 'onAnyKeyReleased',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда любая клавиша отпущена',
            isEdgeActivated: false
          },
          {
            opcode: 'onSpecificKeyPressed',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда клавиша [KEY] нажата',
            isEdgeActivated: false,
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'onSpecificKeyReleased',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда клавиша [KEY] отпущена',
            isEdgeActivated: false,
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'onKeyPressed',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда нажата клавиша из [MENU]',
            isEdgeActivated: false,
            arguments: {
              MENU: {
                type: Scratch.ArgumentType.STRING,
                menu: 'keyMenu'
              }
            }
          },
          {
            opcode: 'onKeyReleased',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда отпущена клавиша из [MENU]',
            isEdgeActivated: false,
            arguments: {
              MENU: {
                type: Scratch.ArgumentType.STRING,
                menu: 'keyMenu'
              }
            }
          },
          {
            opcode: 'onDoublePress',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда клавиша нажата дважды',
            isEdgeActivated: false
          },
          {
            opcode: 'onLongPress',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда клавиша удерживается долго',
            isEdgeActivated: false
          },
          {
            opcode: 'onKeyRepeat',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда клавиша повторяется (удержание)',
            isEdgeActivated: false
          },
          {
            opcode: 'onChord',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда нажат аккорд клавиш',
            isEdgeActivated: false
          },
          {
            opcode: 'onPattern',
            blockType: Scratch.BlockType.HAT,
            text: '⚡ когда обнаружен паттерн клавиш',
            isEdgeActivated: false
          },
          
          '---',

          {
            blockType: Scratch.BlockType.LABEL,
            text: '🔍 Проверка клавиш'
          },
          {
            opcode: 'isKeyDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] нажата?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'isKeyFromMenuDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] нажата?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                menu: 'keyMenu'
              }
            }
          },
          {
            opcode: 'isKeyUp',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] НЕ нажата?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'isKeyJustPressed',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] только что нажата?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'isKeyJustReleased',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] только что отпущена?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'isKeyLongPressed',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] удерживается долго?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'isKeyDoublePressed',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] нажата дважды?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'isAnyKeyDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'любая клавиша нажата?'
          },
          {
            opcode: 'isNoKeyDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'ни одна клавиша не нажата?'
          },
          {
            opcode: 'areKeysComboDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'комбинация [KEYS] нажата?',
            arguments: {
              KEYS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'control+shift+a'
              }
            }
          },
          {
            opcode: 'isKeyInGroupDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'любая клавиша из группы [GROUP] нажата?',
            arguments: {
              GROUP: {
                type: Scratch.ArgumentType.STRING,
                menu: 'groupMenu'
              }
            }
          },
          {
            opcode: 'areExactKeysDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'нажаты ТОЛЬКО клавиши [KEYS]?',
            arguments: {
              KEYS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'w+a'
              }
            }
          },
          {
            opcode: 'isKeyBlocked',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] заблокирована?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'isCapsLockOn',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'Caps Lock включён?'
          },
          {
            opcode: 'isNumLockOn',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'Num Lock включён?'
          },
          {
            opcode: 'isScrollLockOn',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'Scroll Lock включён?'
          },
          {
            opcode: 'isModifierDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'модификатор [MOD] нажат?',
            arguments: {
              MOD: {
                type: Scratch.ArgumentType.STRING,
                menu: 'modifierMenu'
              }
            }
          },
          {
            opcode: 'isVirtualKeyDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'виртуальная клавиша [KEY] нажата?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'virtual1'
              }
            }
          },
          {
            opcode: 'wasKeyEverPressed',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] когда-либо нажималась?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'isRecordingMacro',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'идёт запись макро?'
          },
          {
            opcode: 'isCapturingText',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'идёт захват текста?'
          },
          {
            opcode: 'isKeyMapped',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] переназначена?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'doesPatternExist',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'паттерн [NAME] существует?',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'konami'
              }
            }
          },
          {
            opcode: 'isKeyArrow',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] — стрелка?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'arrowup'
              }
            }
          },
          {
            opcode: 'isKeyLetter',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] — буква?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'isKeyNumber',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] — цифра?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '5'
              }
            }
          },
          {
            opcode: 'keysMatchDirection',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'нажато направление [DIR]?',
            arguments: {
              DIR: {
                type: Scratch.ArgumentType.STRING,
                menu: 'directionMenu'
              }
            }
          },
          
          '---',

          {
            blockType: Scratch.BlockType.LABEL,
            text: '📊 Информация о клавишах'
          },
          {
            opcode: 'getLastKeyPressed',
            blockType: Scratch.BlockType.REPORTER,
            text: 'последняя нажатая клавиша'
          },
          {
            opcode: 'getLastKeyReleased',
            blockType: Scratch.BlockType.REPORTER,
            text: 'последняя отпущенная клавиша'
          },
          {
            opcode: 'getKeyHoldTime',
            blockType: Scratch.BlockType.REPORTER,
            text: 'время удержания [KEY] (мс)',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'getKeyPressCount',
            blockType: Scratch.BlockType.REPORTER,
            text: 'сколько раз нажата [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'getTotalKeysPressed',
            blockType: Scratch.BlockType.REPORTER,
            text: 'всего нажатий клавиш'
          },
          {
            opcode: 'getKeysPerSecond',
            blockType: Scratch.BlockType.REPORTER,
            text: 'клавиш в секунду (KPS)'
          },
          {
            opcode: 'getCurrentKeysDown',
            blockType: Scratch.BlockType.REPORTER,
            text: 'все нажатые клавиши'
          },
          {
            opcode: 'getKeysDownCount',
            blockType: Scratch.BlockType.REPORTER,
            text: 'количество нажатых клавиш'
          },
          {
            opcode: 'getKeySequence',
            blockType: Scratch.BlockType.REPORTER,
            text: 'последовательность последних [N] клавиш',
            arguments: {
              N: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 10
              }
            }
          },
          {
            opcode: 'getKeyDisplayName',
            blockType: Scratch.BlockType.REPORTER,
            text: 'красивое имя клавиши [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'arrowup'
              }
            }
          },
          {
            opcode: 'getTimeSinceKeyPress',
            blockType: Scratch.BlockType.REPORTER,
            text: 'время с момента нажатия [KEY] (мс)',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'getTimeSinceKeyRelease',
            blockType: Scratch.BlockType.REPORTER,
            text: 'время с момента отпускания [KEY] (мс)',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'getTimeBetweenKeys',
            blockType: Scratch.BlockType.REPORTER,
            text: 'время между нажатием [KEY1] и [KEY2] (мс)',
            arguments: {
              KEY1: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              },
              KEY2: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'b'
              }
            }
          },
          {
            opcode: 'getMostPressedKey',
            blockType: Scratch.BlockType.REPORTER,
            text: 'самая популярная клавиша'
          },
          {
            opcode: 'getLeastPressedKey',
            blockType: Scratch.BlockType.REPORTER,
            text: 'самая редкая нажатая клавиша'
          },
          {
            opcode: 'getHeatmapValue',
            blockType: Scratch.BlockType.REPORTER,
            text: 'тепловая карта: значение для [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'getSessionDuration',
            blockType: Scratch.BlockType.REPORTER,
            text: 'длительность сессии (сек)'
          },
          {
            opcode: 'getAverageKPS',
            blockType: Scratch.BlockType.REPORTER,
            text: 'средняя скорость набора (клавиш/сек)'
          },
          {
            opcode: 'getCurrentChord',
            blockType: Scratch.BlockType.REPORTER,
            text: 'текущий аккорд клавиш'
          },
          {
            opcode: 'getKeyFromGroup',
            blockType: Scratch.BlockType.REPORTER,
            text: 'нажатая клавиша из группы [GROUP]',
            arguments: {
              GROUP: {
                type: Scratch.ArgumentType.STRING,
                menu: 'groupMenu'
              }
            }
          },
          {
            opcode: 'getArrowDirection',
            blockType: Scratch.BlockType.REPORTER,
            text: 'направление стрелок (градусы)'
          },
          {
            opcode: 'getArrowX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'ось X стрелок (-1, 0, 1)'
          },
          {
            opcode: 'getArrowY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'ось Y стрелок (-1, 0, 1)'
          },
          {
            opcode: 'getWASDX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'ось X WASD (-1, 0, 1)'
          },
          {
            opcode: 'getWASDY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'ось Y WASD (-1, 0, 1)'
          },
          {
            opcode: 'getMovementAngle',
            blockType: Scratch.BlockType.REPORTER,
            text: 'угол движения [SCHEME] (градусы)',
            arguments: {
              SCHEME: {
                type: Scratch.ArgumentType.STRING,
                menu: 'movementMenu'
              }
            }
          },
          {
            opcode: 'getMovementMagnitude',
            blockType: Scratch.BlockType.REPORTER,
            text: 'сила движения [SCHEME]',
            arguments: {
              SCHEME: {
                type: Scratch.ArgumentType.STRING,
                menu: 'movementMenu'
              }
            }
          },
          {
            opcode: 'getTypedText',
            blockType: Scratch.BlockType.REPORTER,
            text: 'набранный текст'
          },
          {
            opcode: 'getTypedTextLength',
            blockType: Scratch.BlockType.REPORTER,
            text: 'длина набранного текста'
          },
          {
            opcode: 'getMacroLength',
            blockType: Scratch.BlockType.REPORTER,
            text: 'длина записанного макро'
          },
          {
            opcode: 'getMacroJSON',
            blockType: Scratch.BlockType.REPORTER,
            text: 'макро в формате JSON'
          },
          {
            opcode: 'getEventLogJSON',
            blockType: Scratch.BlockType.REPORTER,
            text: 'лог событий (JSON)'
          },
          {
            opcode: 'getEventLogLength',
            blockType: Scratch.BlockType.REPORTER,
            text: 'количество событий в логе'
          },
          {
            opcode: 'getHeatmapJSON',
            blockType: Scratch.BlockType.REPORTER,
            text: 'тепловая карта (JSON)'
          },
          {
            opcode: 'getKeyGroupKeys',
            blockType: Scratch.BlockType.REPORTER,
            text: 'клавиши в группе [GROUP]',
            arguments: {
              GROUP: {
                type: Scratch.ArgumentType.STRING,
                menu: 'groupMenu'
              }
            }
          },
          {
            opcode: 'getNthKeyInSequence',
            blockType: Scratch.BlockType.REPORTER,
            text: '[N]-я клавиша в последовательности',
            arguments: {
              N: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
            }
          },
          {
            opcode: 'getKeyCode',
            blockType: Scratch.BlockType.REPORTER,
            text: 'код клавиши [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'getKeyFromCode',
            blockType: Scratch.BlockType.REPORTER,
            text: 'клавиша из кода [CODE]',
            arguments: {
              CODE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 65
              }
            }
          },
          {
            opcode: 'getKeyMappedTo',
            blockType: Scratch.BlockType.REPORTER,
            text: 'клавиша [KEY] переназначена на',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'getDoubleClickTime',
            blockType: Scratch.BlockType.REPORTER,
            text: 'время двойного нажатия (мс)'
          },
          {
            opcode: 'getLongPressThreshold',
            blockType: Scratch.BlockType.REPORTER,
            text: 'порог долгого нажатия (мс)'
          },
          {
            opcode: 'getAllBlockedKeys',
            blockType: Scratch.BlockType.REPORTER,
            text: 'все заблокированные клавиши'
          },
          {
            opcode: 'getAllMappedKeys',
            blockType: Scratch.BlockType.REPORTER,
            text: 'все переназначенные клавиши'
          },
          {
            opcode: 'getCurrentProfile',
            blockType: Scratch.BlockType.REPORTER,
            text: 'текущий профиль'
          },
          
          '---',

          {
            blockType: Scratch.BlockType.LABEL,
            text: '🎮 Симуляция клавиш'
          },
          {
            opcode: 'simulateKeyPress',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔽 симулировать нажатие [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'simulateKeyRelease',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔼 симулировать отпускание [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'simulateKeyTap',
            blockType: Scratch.BlockType.COMMAND,
            text: '👆 симулировать клик [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'simulateKeyTapWithDelay',
            blockType: Scratch.BlockType.COMMAND,
            text: '👆 симулировать клик [KEY] с задержкой [MS] мс',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              },
              MS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 100
              }
            }
          },
          {
            opcode: 'simulateCombo',
            blockType: Scratch.BlockType.COMMAND,
            text: '🎹 симулировать комбинацию [KEYS]',
            arguments: {
              KEYS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'control+c'
              }
            }
          },
          {
            opcode: 'simulateTypeText',
            blockType: Scratch.BlockType.COMMAND,
            text: '⌨️ симулировать набор текста [TEXT]',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello!'
              }
            }
          },
          {
            opcode: 'simulateTypeTextWithSpeed',
            blockType: Scratch.BlockType.COMMAND,
            text: '⌨️ набрать [TEXT] со скоростью [MS] мс/символ',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello!'
              },
              MS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 50
              }
            }
          },
          {
            opcode: 'pressVirtualKey',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔽 нажать виртуальную клавишу [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'virtual1'
              }
            }
          },
          {
            opcode: 'releaseVirtualKey',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔼 отпустить виртуальную клавишу [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'virtual1'
              }
            }
          },
          {
            opcode: 'releaseAllVirtualKeys',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔼 отпустить все виртуальные клавиши'
          },
          
          '---',
          
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🔧 Настройки и управление'
          },
          {
            opcode: 'blockKey',
            blockType: Scratch.BlockType.COMMAND,
            text: '🚫 заблокировать клавишу [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'f5'
              }
            }
          },
          {
            opcode: 'unblockKey',
            blockType: Scratch.BlockType.COMMAND,
            text: '✅ разблокировать клавишу [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'f5'
              }
            }
          },
          {
            opcode: 'unblockAllKeys',
            blockType: Scratch.BlockType.COMMAND,
            text: '✅ разблокировать все клавиши'
          },
          {
            opcode: 'mapKey',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 переназначить [FROM] → [TO]',
            arguments: {
              FROM: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'w'
              },
              TO: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'arrowup'
              }
            }
          },
          {
            opcode: 'unmapKey',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 убрать переназначение [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'w'
              }
            }
          },
          {
            opcode: 'unmapAllKeys',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 убрать все переназначения'
          },
          {
            opcode: 'setDoubleClickTime',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏱️ время двойного нажатия = [MS] мс',
            arguments: {
              MS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 300
              }
            }
          },
          {
            opcode: 'setLongPressThreshold',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏱️ порог долгого нажатия = [MS] мс',
            arguments: {
              MS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 500
              }
            }
          },
          {
            opcode: 'setChordDelay',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏱️ задержка аккорда = [MS] мс',
            arguments: {
              MS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 50
              }
            }
          },
          
          '---',
          
          {
            blockType: Scratch.BlockType.LABEL,
            text: '📝 Захват текста'
          },
          {
            opcode: 'startTextCapture',
            blockType: Scratch.BlockType.COMMAND,
            text: '📝 начать захват текста'
          },
          {
            opcode: 'stopTextCapture',
            blockType: Scratch.BlockType.COMMAND,
            text: '📝 остановить захват текста'
          },
          {
            opcode: 'clearTypedText',
            blockType: Scratch.BlockType.COMMAND,
            text: '📝 очистить набранный текст'
          },
          {
            opcode: 'setTypedText',
            blockType: Scratch.BlockType.COMMAND,
            text: '📝 установить текст [TEXT]',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              }
            }
          },
          
          '---',
          
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🎬 Макросы'
          },
          {
            opcode: 'startMacroRecording',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔴 начать запись макро'
          },
          {
            opcode: 'stopMacroRecording',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏹️ остановить запись макро'
          },
          {
            opcode: 'playMacro',
            blockType: Scratch.BlockType.COMMAND,
            text: '▶️ воспроизвести макро'
          },
          {
            opcode: 'playMacroWithSpeed',
            blockType: Scratch.BlockType.COMMAND,
            text: '▶️ воспроизвести макро со скоростью [SPEED]x',
            arguments: {
              SPEED: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
            }
          },
          {
            opcode: 'clearMacro',
            blockType: Scratch.BlockType.COMMAND,
            text: '🗑️ очистить макро'
          },
          {
            opcode: 'loadMacroFromJSON',
            blockType: Scratch.BlockType.COMMAND,
            text: '📂 загрузить макро из JSON [JSON]',
            arguments: {
              JSON: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '[]'
              }
            }
          },
          
          '---',
          
          {
            blockType: Scratch.BlockType.LABEL,
            text: '🎯 Паттерны и группы'
          },
          {
            opcode: 'registerPattern',
            blockType: Scratch.BlockType.COMMAND,
            text: '🎯 зарегистрировать паттерн [NAME]: [KEYS]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'konami'
              },
              KEYS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'arrowup,arrowup,arrowdown,arrowdown,arrowleft,arrowright,arrowleft,arrowright,b,a'
              }
            }
          },
          {
            opcode: 'removePattern',
            blockType: Scratch.BlockType.COMMAND,
            text: '🗑️ удалить паттерн [NAME]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'konami'
              }
            }
          },
          {
            opcode: 'createKeyGroup',
            blockType: Scratch.BlockType.COMMAND,
            text: '📁 создать группу [NAME] с клавишами [KEYS]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'myGroup'
              },
              KEYS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'q,w,e,r'
              }
            }
          },
          {
            opcode: 'deleteKeyGroup',
            blockType: Scratch.BlockType.COMMAND,
            text: '🗑️ удалить группу [NAME]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'myGroup'
              }
            }
          },
          
          '---',
          
          {
            blockType: Scratch.BlockType.LABEL,
            text: '💾 Профили и сброс'
          },
          {
            opcode: 'saveProfile',
            blockType: Scratch.BlockType.COMMAND,
            text: '💾 сохранить профиль [NAME]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'default'
              }
            }
          },
          {
            opcode: 'loadProfile',
            blockType: Scratch.BlockType.COMMAND,
            text: '📂 загрузить профиль [NAME]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'default'
              }
            }
          },
          {
            opcode: 'resetKeyPressCount',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 сбросить счётчик нажатий [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'a'
              }
            }
          },
          {
            opcode: 'resetAllCounts',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 сбросить все счётчики'
          },
          {
            opcode: 'clearKeySequence',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 очистить последовательность клавиш'
          },
          {
            opcode: 'clearEventLog',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 очистить лог событий'
          },
          {
            opcode: 'clearHeatmap',
            blockType: Scratch.BlockType.COMMAND,
            text: '🔄 очистить тепловую карту'
          },
          {
            opcode: 'resetEverything',
            blockType: Scratch.BlockType.COMMAND,
            text: '💥 ПОЛНЫЙ СБРОС ВСЕГО'
          },
          {
            opcode: 'setMaxSequenceLength',
            blockType: Scratch.BlockType.COMMAND,
            text: '📏 макс длина последовательности = [N]',
            arguments: {
              N: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 50
              }
            }
          },
          {
            opcode: 'setGhostMode',
            blockType: Scratch.BlockType.COMMAND,
            text: '👻 режим призрака: [ON]',
            arguments: {
              ON: {
                type: Scratch.ArgumentType.STRING,
                menu: 'onOffMenu'
              }
            }
          },
          {
            opcode: 'setChordDetection',
            blockType: Scratch.BlockType.COMMAND,
            text: '🎵 обнаружение аккордов: [ON]',
            arguments: {
              ON: {
                type: Scratch.ArgumentType.STRING,
                menu: 'onOffMenu'
              }
            }
          },
          
          '---',

          {
            blockType: Scratch.BlockType.LABEL,
            text: '⏳ Ожидание клавиш'
          },
          {
            opcode: 'waitForKeyPress',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать нажатия [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'space'
              }
            }
          },
          {
            opcode: 'waitForAnyKeyPress',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать нажатия любой клавиши'
          },
          {
            opcode: 'waitForKeyRelease',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать отпускания [KEY]',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'space'
              }
            }
          },
          {
            opcode: 'waitForAllKeysReleased',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать отпускания всех клавиш'
          },
          {
            opcode: 'waitForCombo',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать комбинации [KEYS]',
            arguments: {
              KEYS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'control+s'
              }
            }
          },
          {
            opcode: 'waitForKeyFromGroup',
            blockType: Scratch.BlockType.COMMAND,
            text: '⏳ ждать клавишу из группы [GROUP]',
            arguments: {
              GROUP: {
                type: Scratch.ArgumentType.STRING,
                menu: 'groupMenu'
              }
            }
          },
        ],
        
        menus: {
          keyMenu: {
            acceptReporters: true,
            items: [
              'a','b','c','d','e','f','g','h','i','j','k','l','m',
              'n','o','p','q','r','s','t','u','v','w','x','y','z',
              '0','1','2','3','4','5','6','7','8','9',
              'space', 'enter', 'escape', 'tab', 'backspace', 'delete',
              'shift', 'control', 'alt', 'meta',
              'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
              'f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12',
              'insert', 'home', 'end', 'pageup', 'pagedown',
              'capslock', 'numlock', 'scrolllock',
              ',', '.', '/', ';', "'", '[', ']', '\\', '-', '=', '`'
            ]
          },
          modifierMenu: {
            acceptReporters: true,
            items: ['shift', 'control', 'alt', 'meta']
          },
          groupMenu: {
            acceptReporters: true,
            items: ['letters', 'numbers', 'arrows', 'wasd', 'modifiers', 'function', 'numpad', 'punctuation', 'special']
          },
          directionMenu: {
            acceptReporters: true,
            items: ['вверх', 'вниз', 'влево', 'вправо', 'вверх-влево', 'вверх-вправо', 'вниз-влево', 'вниз-вправо']
          },
          movementMenu: {
            acceptReporters: true,
            items: ['arrows', 'wasd']
          },
          onOffMenu: {
            acceptReporters: true,
            items: ['вкл', 'выкл']
          }
        }
      };
    }

    onAnyKeyPressed() { return true; }
    onAnyKeyReleased() { return true; }
    
    onSpecificKeyPressed(args) {
      const key = this._normalizeKey(args.KEY);
      return this.lastKeyPressed === key && this.keysDown[key];
    }
    
    onSpecificKeyReleased(args) {
      const key = this._normalizeKey(args.KEY);
      return this.lastKeyReleased === key;
    }
    
    onKeyPressed(args) {
      const key = this._normalizeKey(args.MENU);
      return this.lastKeyPressed === key && this.keysDown[key];
    }
    
    onKeyReleased(args) {
      const key = this._normalizeKey(args.MENU);
      return this.lastKeyReleased === key;
    }
    
    onDoublePress() { return true; }
    onLongPress() { return true; }
    onKeyRepeat() { return true; }
    onChord() { return true; }
    onPattern() { return true; }

    isKeyDown(args) {
      const key = this._normalizeKey(args.KEY);
      return !!this.keysDown[key] || !!this.virtualKeysDown[key];
    }
    
    isKeyFromMenuDown(args) {
      const key = this._normalizeKey(args.KEY);
      return !!this.keysDown[key] || !!this.virtualKeysDown[key];
    }
    
    isKeyUp(args) {
      const key = this._normalizeKey(args.KEY);
      return !this.keysDown[key] && !this.virtualKeysDown[key];
    }
    
    isKeyJustPressed(args) {
      const key = this._normalizeKey(args.KEY);
      return !!this.keysJustPressed[key];
    }
    
    isKeyJustReleased(args) {
      const key = this._normalizeKey(args.KEY);
      return !!this.keysJustReleased[key];
    }
    
    isKeyLongPressed(args) {
      const key = this._normalizeKey(args.KEY);
      return !!this.longPressed[key];
    }
    
    isKeyDoublePressed(args) {
      const key = this._normalizeKey(args.KEY);
      return !!this.doublePressed[key];
    }
    
    isAnyKeyDown() {
      return Object.values(this.keysDown).some(v => v) || Object.values(this.virtualKeysDown).some(v => v);
    }
    
    isNoKeyDown() {
      return !this.isAnyKeyDown();
    }
    
    areKeysComboDown(args) {
      const keys = args.KEYS.split('+').map(k => this._normalizeKey(k));
      return keys.every(k => this.keysDown[k] || this.virtualKeysDown[k]);
    }
    
    isKeyInGroupDown(args) {
      const group = this.keyGroups[args.GROUP];
      if (!group) return false;
      return group.some(k => this.keysDown[k] || this.virtualKeysDown[k]);
    }
    
    areExactKeysDown(args) {
      const keys = args.KEYS.split('+').map(k => this._normalizeKey(k)).sort();
      const currentKeys = Object.keys(this.keysDown).filter(k => this.keysDown[k]).sort();
      return keys.length === currentKeys.length && keys.every((k, i) => k === currentKeys[i]);
    }
    
    isKeyBlocked(args) {
      const key = this._normalizeKey(args.KEY);
      return !!this.blockedKeys[key];
    }
    
    isCapsLockOn() { return this.capsLockOn; }
    isNumLockOn() { return this.numLockOn; }
    isScrollLockOn() { return this.scrollLockOn; }
    
    isModifierDown(args) {
      const mod = this._normalizeKey(args.MOD);
      return !!this.keysDown[mod];
    }
    
    isVirtualKeyDown(args) {
      return !!this.virtualKeysDown[args.KEY];
    }
    
    wasKeyEverPressed(args) {
      const key = this._normalizeKey(args.KEY);
      return (this.keyPressCount[key] || 0) > 0;
    }
    
    isRecordingMacro() { return this.isRecordingMacro; }
    isCapturingText() { return this.isCapturingText; }
    
    isKeyMapped(args) {
      const key = this._normalizeKey(args.KEY);
      return !!this.keyMap[key];
    }
    
    doesPatternExist(args) {
      return !!this.patternCallbacks[args.NAME];
    }
    
    isKeyArrow(args) {
      const key = this._normalizeKey(args.KEY);
      return ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key);
    }
    
    isKeyLetter(args) {
      const key = this._normalizeKey(args.KEY);
      return key.length === 1 && /[a-z]/i.test(key);
    }
    
    isKeyNumber(args) {
      const key = this._normalizeKey(args.KEY);
      return key.length === 1 && /[0-9]/.test(key);
    }
    
    keysMatchDirection(args) {
      const dir = args.DIR;
      const u = !!this.keysDown['arrowup'];
      const d = !!this.keysDown['arrowdown'];
      const l = !!this.keysDown['arrowleft'];
      const r = !!this.keysDown['arrowright'];
      switch(dir) {
        case 'вверх': return u && !d && !l && !r;
        case 'вниз': return d && !u && !l && !r;
        case 'влево': return l && !r && !u && !d;
        case 'вправо': return r && !l && !u && !d;
        case 'вверх-влево': return u && l && !d && !r;
        case 'вверх-вправо': return u && r && !d && !l;
        case 'вниз-влево': return d && l && !u && !r;
        case 'вниз-вправо': return d && r && !u && !l;
        default: return false;
      }
    }

    getLastKeyPressed() { return this.lastKeyPressed; }
    getLastKeyReleased() { return this.lastKeyReleased; }
    
    getKeyHoldTime(args) {
      const key = this._normalizeKey(args.KEY);
      if (this.keysDown[key] && this.keyPressTime[key]) {
        return Date.now() - this.keyPressTime[key];
      }
      return this.keyHoldTime[key] || 0;
    }
    
    getKeyPressCount(args) {
      const key = this._normalizeKey(args.KEY);
      return this.keyPressCount[key] || 0;
    }
    
    getTotalKeysPressed() { return this.totalKeysPressed; }
    getKeysPerSecond() { return this.keysPerSecond; }
    
    getCurrentKeysDown() {
      const real = Object.keys(this.keysDown).filter(k => this.keysDown[k]);
      const virtual = Object.keys(this.virtualKeysDown).filter(k => this.virtualKeysDown[k]);
      return [...new Set([...real, ...virtual])].join(', ');
    }
    
    getKeysDownCount() {
      const real = Object.keys(this.keysDown).filter(k => this.keysDown[k]).length;
      const virtual = Object.keys(this.virtualKeysDown).filter(k => this.virtualKeysDown[k]).length;
      return real + virtual;
    }
    
    getKeySequence(args) {
      const n = Math.min(Math.max(1, Math.floor(args.N)), this.keySequence.length);
      return this.keySequence.slice(-n).join(', ');
    }
    
    getKeyDisplayName(args) {
      return this._getKeyDisplayName(this._normalizeKey(args.KEY));
    }
    
    getTimeSinceKeyPress(args) {
      const key = this._normalizeKey(args.KEY);
      if (!this.keyPressTime[key]) return -1;
      return Date.now() - this.keyPressTime[key];
    }
    
    getTimeSinceKeyRelease(args) {
      const key = this._normalizeKey(args.KEY);
      if (!this.keyReleaseTime[key]) return -1;
      return Date.now() - this.keyReleaseTime[key];
    }
    
    getTimeBetweenKeys(args) {
      const key1 = this._normalizeKey(args.KEY1);
      const key2 = this._normalizeKey(args.KEY2);
      if (!this.keyPressTime[key1] || !this.keyPressTime[key2]) return -1;
      return Math.abs(this.keyPressTime[key2] - this.keyPressTime[key1]);
    }
    
    getMostPressedKey() {
      let maxKey = '';
      let maxCount = 0;
      for (const key in this.keyPressCount) {
        if (this.keyPressCount[key] > maxCount) {
          maxCount = this.keyPressCount[key];
          maxKey = key;
        }
      }
      return maxKey || 'нет данных';
    }
    
    getLeastPressedKey() {
      let minKey = '';
      let minCount = Infinity;
      for (const key in this.keyPressCount) {
        if (this.keyPressCount[key] < minCount && this.keyPressCount[key] > 0) {
          minCount = this.keyPressCount[key];
          minKey = key;
        }
      }
      return minKey || 'нет данных';
    }
    
    getHeatmapValue(args) {
      const key = this._normalizeKey(args.KEY);
      return this.heatmap[key] || 0;
    }
    
    getSessionDuration() {
      return Math.floor((Date.now() - this.sessionStartTime) / 1000);
    }
    
    getAverageKPS() {
      const duration = (Date.now() - this.sessionStartTime) / 1000;
      if (duration <= 0) return 0;
      return Math.round((this.totalKeysPressed / duration) * 100) / 100;
    }
    
    getCurrentChord() {
      return this.currentChord.join('+') || 'нет';
    }
    
    getKeyFromGroup(args) {
      const group = this.keyGroups[args.GROUP];
      if (!group) return '';
      const pressed = group.filter(k => this.keysDown[k] || this.virtualKeysDown[k]);
      return pressed.join(', ');
    }
    
    getArrowDirection() {
      const x = (this.keysDown['arrowright'] ? 1 : 0) - (this.keysDown['arrowleft'] ? 1 : 0);
      const y = (this.keysDown['arrowup'] ? 1 : 0) - (this.keysDown['arrowdown'] ? 1 : 0);
      if (x === 0 && y === 0) return -1;
      return Math.round(Math.atan2(y, x) * 180 / Math.PI);
    }
    
    getArrowX() {
      return (this.keysDown['arrowright'] ? 1 : 0) - (this.keysDown['arrowleft'] ? 1 : 0);
    }
    
    getArrowY() {
      return (this.keysDown['arrowup'] ? 1 : 0) - (this.keysDown['arrowdown'] ? 1 : 0);
    }
    
    getWASDX() {
      return (this.keysDown['d'] ? 1 : 0) - (this.keysDown['a'] ? 1 : 0);
    }
    
    getWASDY() {
      return (this.keysDown['w'] ? 1 : 0) - (this.keysDown['s'] ? 1 : 0);
    }
    
    getMovementAngle(args) {
      let x, y;
      if (args.SCHEME === 'arrows') {
        x = this.getArrowX();
        y = this.getArrowY();
      } else {
        x = this.getWASDX();
        y = this.getWASDY();
      }
      if (x === 0 && y === 0) return -1;
      return Math.round(Math.atan2(y, x) * 180 / Math.PI);
    }
    
    getMovementMagnitude(args) {
      let x, y;
      if (args.SCHEME === 'arrows') {
        x = this.getArrowX();
        y = this.getArrowY();
      } else {
        x = this.getWASDX();
        y = this.getWASDY();
      }
      return Math.round(Math.sqrt(x * x + y * y) * 100) / 100;
    }
    
    getTypedText() { return this.typedText; }
    getTypedTextLength() { return this.typedText.length; }
    getMacroLength() { return this.recordedMacro.length; }
    
    getMacroJSON() {
      try { return JSON.stringify(this.recordedMacro); }
      catch(e) { return '[]'; }
    }
    
    getEventLogJSON() {
      try { return JSON.stringify(this.eventLog.slice(-20)); }
      catch(e) { return '[]'; }
    }
    
    getEventLogLength() { return this.eventLog.length; }
    
    getHeatmapJSON() {
      try { return JSON.stringify(this.heatmap); }
      catch(e) { return '{}'; }
    }
    
    getKeyGroupKeys(args) {
      const group = this.keyGroups[args.GROUP];
      return group ? group.join(', ') : '';
    }
    
    getNthKeyInSequence(args) {
      const n = Math.floor(args.N);
      if (n < 1 || n > this.keySequence.length) return '';
      return this.keySequence[this.keySequence.length - n];
    }
    
    getKeyCode(args) {
      const key = args.KEY;
      if (key.length === 1) return key.charCodeAt(0);
      return -1;
    }
    
    getKeyFromCode(args) {
      const code = Math.floor(args.CODE);
      try { return String.fromCharCode(code).toLowerCase(); }
      catch(e) { return ''; }
    }
    
    getKeyMappedTo(args) {
      const key = this._normalizeKey(args.KEY);
      return this.keyMap[key] || key;
    }
    
    getDoubleClickTime() { return this.doubleClickTime; }
    getLongPressThreshold() { return this.longPressThreshold; }
    
    getAllBlockedKeys() {
      return Object.keys(this.blockedKeys).filter(k => this.blockedKeys[k]).join(', ') || 'нет';
    }
    
    getAllMappedKeys() {
      const mapped = Object.entries(this.keyMap).map(([from, to]) => `${from}→${to}`);
      return mapped.join(', ') || 'нет';
    }
    
    getCurrentProfile() { return this.currentProfile; }

    simulateKeyPress(args) {
      const key = this._normalizeKey(args.KEY);
      this._simulateKeyEvent(key, 'keydown');
    }
    
    simulateKeyRelease(args) {
      const key = this._normalizeKey(args.KEY);
      this._simulateKeyEvent(key, 'keyup');
    }
    
    simulateKeyTap(args) {
      const key = this._normalizeKey(args.KEY);
      this._simulateKeyEvent(key, 'keydown');
      setTimeout(() => this._simulateKeyEvent(key, 'keyup'), 50);
    }
    
    simulateKeyTapWithDelay(args) {
      const key = this._normalizeKey(args.KEY);
      const ms = Math.max(0, args.MS);
      return new Promise(resolve => {
        this._simulateKeyEvent(key, 'keydown');
        setTimeout(() => {
          this._simulateKeyEvent(key, 'keyup');
          resolve();
        }, ms);
      });
    }
    
    simulateCombo(args) {
      const keys = args.KEYS.split('+').map(k => this._normalizeKey(k));
      keys.forEach(k => this._simulateKeyEvent(k, 'keydown'));
      setTimeout(() => {
        keys.reverse().forEach(k => this._simulateKeyEvent(k, 'keyup'));
      }, 50);
    }
    
    simulateTypeText(args) {
      const text = String(args.TEXT);
      let i = 0;
      const typeNext = () => {
        if (i < text.length) {
          const char = text[i];
          this._simulateKeyEvent(char, 'keydown');
          setTimeout(() => {
            this._simulateKeyEvent(char, 'keyup');
            i++;
            typeNext();
          }, 30);
        }
      };
      typeNext();
    }
    
    simulateTypeTextWithSpeed(args) {
      const text = String(args.TEXT);
      const ms = Math.max(1, args.MS);
      return new Promise(resolve => {
        let i = 0;
        const typeNext = () => {
          if (i < text.length) {
            const char = text[i];
            this._simulateKeyEvent(char, 'keydown');
            setTimeout(() => {
              this._simulateKeyEvent(char, 'keyup');
              i++;
              setTimeout(typeNext, ms);
            }, Math.min(ms / 2, 30));
          } else {
            resolve();
          }
        };
        typeNext();
      });
    }
    
    pressVirtualKey(args) {
      this.virtualKeysDown[args.KEY] = true;
    }
    
    releaseVirtualKey(args) {
      this.virtualKeysDown[args.KEY] = false;
    }
    
    releaseAllVirtualKeys() {
      this.virtualKeysDown = {};
    }
    
    blockKey(args) {
      const key = this._normalizeKey(args.KEY);
      this.blockedKeys[key] = true;
    }
    
    unblockKey(args) {
      const key = this._normalizeKey(args.KEY);
      delete this.blockedKeys[key];
    }
    
    unblockAllKeys() {
      this.blockedKeys = {};
    }
    
    mapKey(args) {
      const from = this._normalizeKey(args.FROM);
      const to = this._normalizeKey(args.TO);
      this.keyMap[from] = to;
    }
    
    unmapKey(args) {
      const key = this._normalizeKey(args.KEY);
      delete this.keyMap[key];
    }
    
    unmapAllKeys() {
      this.keyMap = {};
    }
    
    setDoubleClickTime(args) {
      this.doubleClickTime = Math.max(50, Math.min(2000, args.MS));
    }
    
    setLongPressThreshold(args) {
      this.longPressThreshold = Math.max(100, Math.min(5000, args.MS));
    }
    
    setChordDelay(args) {
      this.chordDelay = Math.max(10, Math.min(500, args.MS));
    }
    
    startTextCapture() {
      this.isCapturingText = true;
    }
    
    stopTextCapture() {
      this.isCapturingText = false;
    }
    
    clearTypedText() {
      this.typedText = '';
    }
    
    setTypedText(args) {
      this.typedText = String(args.TEXT);
    }
    
    startMacroRecording() {
      this.recordedMacro = [];
      this.isRecordingMacro = true;
      this.macroStartTime = Date.now();
    }
    
    stopMacroRecording() {
      this.isRecordingMacro = false;
    }
    
    playMacro() {
      return this._playMacroInternal(1);
    }
    
    playMacroWithSpeed(args) {
      const speed = Math.max(0.1, Math.min(100, args.SPEED));
      return this._playMacroInternal(speed);
    }
    
    _playMacroInternal(speed) {
      return new Promise(resolve => {
        if (this.recordedMacro.length === 0) {
          resolve();
          return;
        }
        let i = 0;
        const playNext = () => {
          if (i >= this.recordedMacro.length) {
            resolve();
            return;
          }
          const event = this.recordedMacro[i];
          const nextEvent = this.recordedMacro[i + 1];
          
          if (event.type === 'down') {
            this._simulateKeyEvent(event.key, 'keydown');
          } else {
            this._simulateKeyEvent(event.key, 'keyup');
          }
          
          i++;
          if (nextEvent) {
            const delay = (nextEvent.time - event.time) / speed;
            setTimeout(playNext, Math.max(1, delay));
          } else {
            resolve();
          }
        };
        playNext();
      });
    }
    
    clearMacro() {
      this.recordedMacro = [];
      this.isRecordingMacro = false;
    }
    
    loadMacroFromJSON(args) {
      try {
        const data = JSON.parse(args.JSON);
        if (Array.isArray(data)) {
          this.recordedMacro = data;
        }
      } catch(e) {
        
      }
    }
    
    registerPattern(args) {
      const name = args.NAME;
      const keys = args.KEYS.split(',').map(k => this._normalizeKey(k));
      this.patternCallbacks[name] = keys;
    }
    
    removePattern(args) {
      delete this.patternCallbacks[args.NAME];
    }
    
    createKeyGroup(args) {
      const name = args.NAME;
      const keys = args.KEYS.split(',').map(k => this._normalizeKey(k));
      this.keyGroups[name] = keys;
    }
    
    deleteKeyGroup(args) {
      delete this.keyGroups[args.NAME];
    }
    
    saveProfile(args) {
      const name = args.NAME;
      this.profiles[name] = {
        keyMap: { ...this.keyMap },
        blockedKeys: { ...this.blockedKeys },
        keyGroups: JSON.parse(JSON.stringify(this.keyGroups)),
        doubleClickTime: this.doubleClickTime,
        longPressThreshold: this.longPressThreshold,
        chordDelay: this.chordDelay,
        ghostMode: this.ghostMode,
        chordDetection: this.chordDetection,
        patterns: JSON.parse(JSON.stringify(this.patternCallbacks))
      };
      this.currentProfile = name;
    }
    
    loadProfile(args) {
      const name = args.NAME;
      const profile = this.profiles[name];
      if (!profile) return;
      this.keyMap = { ...profile.keyMap };
      this.blockedKeys = { ...profile.blockedKeys };
      this.keyGroups = JSON.parse(JSON.stringify(profile.keyGroups));
      this.doubleClickTime = profile.doubleClickTime;
      this.longPressThreshold = profile.longPressThreshold;
      this.chordDelay = profile.chordDelay;
      this.ghostMode = profile.ghostMode;
      this.chordDetection = profile.chordDetection;
      this.patternCallbacks = JSON.parse(JSON.stringify(profile.patterns));
      this.currentProfile = name;
    }
    
    resetKeyPressCount(args) {
      const key = this._normalizeKey(args.KEY);
      this.keyPressCount[key] = 0;
    }
    
    resetAllCounts() {
      this.keyPressCount = {};
      this.totalKeysPressed = 0;
    }
    
    clearKeySequence() {
      this.keySequence = [];
    }
    
    clearEventLog() {
      this.eventLog = [];
    }
    
    clearHeatmap() {
      this.heatmap = {};
    }
    
    resetEverything() {
      this.keysDown = {};
      this.keysJustPressed = {};
      this.keysJustReleased = {};
      this.keyHoldTime = {};
      this.keyPressTime = {};
      this.keyReleaseTime = {};
      this.keyPressCount = {};
      this.keySequence = [];
      this.lastKeyPressed = '';
      this.lastKeyReleased = '';
      this.totalKeysPressed = 0;
      this.keysPerSecond = 0;
      this.kpsHistory = [];
      this.typedText = '';
      this.isCapturingText = false;
      this.recordedMacro = [];
      this.isRecordingMacro = false;
      this.keyMap = {};
      this.blockedKeys = {};
      this.virtualKeysDown = {};
      this.longPressed = {};
      this.doublePressed = {};
      this.currentChord = [];
      this.simultaneousKeys = [];
      this.eventLog = [];
      this.heatmap = {};
      this.patternCallbacks = {};
      this.sessionStartTime = Date.now();
    }
    
    setMaxSequenceLength(args) {
      this.maxSequenceLength = Math.max(1, Math.min(1000, Math.floor(args.N)));
    }
    
    setGhostMode(args) {
      this.ghostMode = args.ON === 'вкл';
    }
    
    setChordDetection(args) {
      this.chordDetection = args.ON === 'вкл';
    }

    waitForKeyPress(args) {
      const key = this._normalizeKey(args.KEY);
      return new Promise(resolve => {
        const check = () => {
          if (this.keysDown[key]) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });
    }
    
    waitForAnyKeyPress() {
      return new Promise(resolve => {
        const check = () => {
          if (Object.values(this.keysDown).some(v => v)) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });
    }
    
    waitForKeyRelease(args) {
      const key = this._normalizeKey(args.KEY);
      return new Promise(resolve => {
        const check = () => {
          if (!this.keysDown[key]) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });
    }
    
    waitForAllKeysReleased() {
      return new Promise(resolve => {
        const check = () => {
          if (!Object.values(this.keysDown).some(v => v)) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });
    }
    
    waitForCombo(args) {
      const keys = args.KEYS.split('+').map(k => this._normalizeKey(k));
      return new Promise(resolve => {
        const check = () => {
          if (keys.every(k => this.keysDown[k])) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });
    }
    
    waitForKeyFromGroup(args) {
      const group = this.keyGroups[args.GROUP];
      if (!group) return Promise.resolve();
      return new Promise(resolve => {
        const check = () => {
          if (group.some(k => this.keysDown[k])) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });
    }
  }

  Scratch.extensions.register(new MegaUltraProKeyboard(Scratch.vm.runtime));
})(Scratch);
