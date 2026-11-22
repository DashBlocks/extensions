/* Author: ABDev */
(function (Scratch) {
  'use strict';

  class KeyboardPlus {
    constructor() {
      this.pressed = new Set();
      this.released = new Set();

      this.lastKey = '';
      this.lastCode = '';

      this.lastReleasedKey = '';
      this.lastReleasedCode = '';

      window.addEventListener('keydown', (e) => {
        const keys = this._getKeys(e);

        for (let i = 0; i < keys.length; i++) {
          this.pressed.add(keys[i]);
        }

        this.lastKey = this._showKey(e.key);
        this.lastCode = e.code || '';
      });

      window.addEventListener('keyup', (e) => {
        const keys = this._getKeys(e);

        for (let i = 0; i < keys.length; i++) {
          this.pressed.delete(keys[i]);
          this.released.add(keys[i]);
        }

        this.lastReleasedKey = this._showKey(e.key);
        this.lastReleasedCode = e.code || '';

        setTimeout(() => {
          for (let i = 0; i < keys.length; i++) {
            this.released.delete(keys[i]);
          }
        }, 150);
      });

      window.addEventListener('blur', () => {
        this.pressed.clear();
        this.released.clear();
      });
    }

    getInfo() {
      return {
        id: 'keyboardplus',
        name: 'Клавиатура+',
        blocks: [
          {
            opcode: 'whenKey',
            blockType: Scratch.BlockType.HAT,
            text: 'когда клавиша [KEY] нажата',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                menu: 'keys',
                defaultValue: 'space'
              }
            }
          },
          {
            opcode: 'whenKeyReleased',
            blockType: Scratch.BlockType.HAT,
            text: 'когда клавиша [KEY] отпущена',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                menu: 'keys',
                defaultValue: 'space'
              }
            }
          },
          {
            opcode: 'isDown',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] нажата?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                menu: 'keys',
                defaultValue: 'space'
              }
            }
          },
          {
            opcode: 'isUp',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'клавиша [KEY] отпущена?',
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                menu: 'keys',
                defaultValue: 'space'
              }
            }
          },
          {
            opcode: 'getLastKey',
            blockType: Scratch.BlockType.REPORTER,
            text: 'последняя нажатая клавиша'
          },
          {
            opcode: 'getLastCode',
            blockType: Scratch.BlockType.REPORTER,
            text: 'код последней нажатой'
          },
          {
            opcode: 'getLastReleasedKey',
            blockType: Scratch.BlockType.REPORTER,
            text: 'последняя отпущенная клавиша'
          },
          {
            opcode: 'getLastReleasedCode',
            blockType: Scratch.BlockType.REPORTER,
            text: 'код последней отпущенной'
          },
          {
            opcode: 'getPressed',
            blockType: Scratch.BlockType.REPORTER,
            text: 'нажатые клавиши'
          },
          {
            opcode: 'clearLast',
            blockType: Scratch.BlockType.COMMAND,
            text: 'сбросить последние клавиши'
          }
        ],
        menus: {
          keys: {
            acceptReporters: true,
            items: this._menuKeys()
          }
        }
      };
    }

    _menuKeys() {
      return [
        { text: 'пробел', value: 'space' },
        { text: 'стрелка вверх', value: 'arrowup' },
        { text: 'стрелка вниз', value: 'arrowdown' },
        { text: 'стрелка влево', value: 'arrowleft' },
        { text: 'стрелка вправо', value: 'arrowright' },

        { text: 'enter', value: 'enter' },
        { text: 'escape', value: 'escape' },
        { text: 'shift', value: 'shift' },
        { text: 'ctrl', value: 'control' },
        { text: 'alt', value: 'alt' },
        { text: 'tab', value: 'tab' },
        { text: 'backspace', value: 'backspace' },

        { text: 'a', value: 'a' },
        { text: 'b', value: 'b' },
        { text: 'c', value: 'c' },
        { text: 'd', value: 'd' },
        { text: 'e', value: 'e' },
        { text: 'f', value: 'f' },
        { text: 'g', value: 'g' },
        { text: 'h', value: 'h' },
        { text: 'i', value: 'i' },
        { text: 'j', value: 'j' },
        { text: 'k', value: 'k' },
        { text: 'l', value: 'l' },
        { text: 'm', value: 'm' },
        { text: 'n', value: 'n' },
        { text: 'o', value: 'o' },
        { text: 'p', value: 'p' },
        { text: 'q', value: 'q' },
        { text: 'r', value: 'r' },
        { text: 's', value: 's' },
        { text: 't', value: 't' },
        { text: 'u', value: 'u' },
        { text: 'v', value: 'v' },
        { text: 'w', value: 'w' },
        { text: 'x', value: 'x' },
        { text: 'y', value: 'y' },
        { text: 'z', value: 'z' },

        { text: '0', value: '0' },
        { text: '1', value: '1' },
        { text: '2', value: '2' },
        { text: '3', value: '3' },
        { text: '4', value: '4' },
        { text: '5', value: '5' },
        { text: '6', value: '6' },
        { text: '7', value: '7' },
        { text: '8', value: '8' },
        { text: '9', value: '9' },

        { text: 'а', value: 'а' },
        { text: 'б', value: 'б' },
        { text: 'в', value: 'в' },
        { text: 'г', value: 'г' },
        { text: 'д', value: 'д' },
        { text: 'е', value: 'е' },
        { text: 'ё', value: 'ё' },
        { text: 'ж', value: 'ж' },
        { text: 'з', value: 'з' },
        { text: 'и', value: 'и' },
        { text: 'й', value: 'й' },
        { text: 'к', value: 'к' },
        { text: 'л', value: 'л' },
        { text: 'м', value: 'м' },
        { text: 'н', value: 'н' },
        { text: 'о', value: 'о' },
        { text: 'п', value: 'п' },
        { text: 'р', value: 'р' },
        { text: 'с', value: 'с' },
        { text: 'т', value: 'т' },
        { text: 'у', value: 'у' },
        { text: 'ф', value: 'ф' },
        { text: 'х', value: 'х' },
        { text: 'ц', value: 'ц' },
        { text: 'ч', value: 'ч' },
        { text: 'ш', value: 'ш' },
        { text: 'щ', value: 'щ' },
        { text: 'ъ', value: 'ъ' },
        { text: 'ы', value: 'ы' },
        { text: 'ь', value: 'ь' },
        { text: 'э', value: 'э' },
        { text: 'ю', value: 'ю' },
        { text: 'я', value: 'я' }
      ];
    }

    _normalKey(key) {
      if (key === undefined || key === null) return '';

      let s = String(key);

      if (s === ' ') return 'space';

      s = s.trim().toLowerCase();

      const names = {
        'пробел': 'space',
        'spacebar': 'space',
        'space': 'space',

        'arrowup': 'arrowup',
        'up': 'arrowup',
        'стрелка вверх': 'arrowup',

        'arrowdown': 'arrowdown',
        'down': 'arrowdown',
        'стрелка вниз': 'arrowdown',

        'arrowleft': 'arrowleft',
        'left': 'arrowleft',
        'стрелка влево': 'arrowleft',

        'arrowright': 'arrowright',
        'right': 'arrowright',
        'стрелка вправо': 'arrowright',

        'enter': 'enter',
        'return': 'enter',

        'esc': 'escape',
        'escape': 'escape',

        'shift': 'shift',
        'shiftleft': 'shift',
        'shiftright': 'shift',

        'control': 'control',
        'ctrl': 'control',
        'controlleft': 'control',
        'controlright': 'control',

        'alt': 'alt',
        'altleft': 'alt',
        'altright': 'alt',

        'tab': 'tab',
        'backspace': 'backspace',

        ' ': 'space'
      };

      if (names[s]) return names[s];

      return s;
    }

    _showKey(key) {
      if (key === ' ') return 'space';
      return String(key || '');
    }

    _getKeys(e) {
      const result = new Set();

      const key = this._normalKey(e.key);
      const code = this._normalKey(e.code);

      if (key) result.add(key);
      if (code) result.add(code);

      if (/^Key[A-Z]$/.test(e.code)) {
        result.add(e.code.slice(3).toLowerCase());
      }

      if (/^Digit[0-9]$/.test(e.code)) {
        result.add(e.code.slice(5));
      }

      if (/^Numpad[0-9]$/.test(e.code)) {
        result.add(e.code.slice(6));
      }

      return Array.from(result);
    }

    whenKey(args) {
      return this.isDown(args);
    }

    whenKeyReleased(args) {
      const key = this._normalKey(args.KEY);
      return this.released.has(key);
    }

    whenKeyRelased(args) {
      return this.whenKeyReleased(args);
    }

    isDown(args) {
      const key = this._normalKey(args.KEY);
      return this.pressed.has(key);
    }

    isUp(args) {
      const key = this._normalKey(args.KEY);
      return !this.pressed.has(key);
    }

    getLastKey() {
      return this.lastKey;
    }

    getLastCode() {
      return this.lastCode;
    }

    getLastReleasedKey() {
      return this.lastReleasedKey;
    }

    getLastReleasedCode() {
      return this.lastReleasedCode;
    }

    getPressed() {
      return Array.from(this.pressed).join(' ');
    }

    clearLast() {
      this.lastKey = '';
      this.lastCode = '';
      this.lastReleasedKey = '';
      this.lastReleasedCode = '';
    }
  }

  Scratch.extensions.register(new KeyboardPlus());
})(Scratch);
