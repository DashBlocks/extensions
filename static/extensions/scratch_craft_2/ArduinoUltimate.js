class ArduinoUltimate {
  constructor() {
    this.port = null;
    this.writer = null;
    this.reader = null;
    this.buffer = [];
    this.analog = {};
    this.digital = {};
    this.i2cData = {};
    this.servoPins = new Set();
  }

  getInfo() {
    return {
      id: "arduinoUltimate",
      name: "Arduino ULTIMATE",
      blocks: [

        { opcode: "connect", blockType: Scratch.BlockType.COMMAND, text: "подключить Arduino" },

        {
          opcode: "pinMode",
          blockType: Scratch.BlockType.COMMAND,
          text: "пин [PIN] режим [MODE]",
          arguments: {
            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 13 },
            MODE: { type: Scratch.ArgumentType.STRING, menu: "mode" }
          }
        },

        {
          opcode: "digitalWrite",
          blockType: Scratch.BlockType.COMMAND,
          text: "цифровой пин [PIN] = [VAL]",
          arguments: {
            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 13 },
            VAL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
          }
        },

        {
          opcode: "digitalRead",
          blockType: Scratch.BlockType.REPORTER,
          text: "цифровой пин [PIN]",
          arguments: { PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 } }
        },

        {
          opcode: "analogRead",
          blockType: Scratch.BlockType.REPORTER,
          text: "аналоговый пин [PIN]",
          arguments: { PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 } }
        },

        {
          opcode: "analogWrite",
          blockType: Scratch.BlockType.COMMAND,
          text: "PWM пин [PIN] значение [VAL]",
          arguments: {
            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 },
            VAL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 128 }
          }
        },

        {
          opcode: "servo",
          blockType: Scratch.BlockType.COMMAND,
          text: "servo пин [PIN] угол [ANGLE]",
          arguments: {
            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 9 },
            ANGLE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 90 }
          }
        },

        {
          opcode: "i2cRead",
          blockType: Scratch.BlockType.REPORTER,
          text: "I2C адрес [ADDR] регистр [REG]",
          arguments: {
            ADDR: { type: Scratch.ArgumentType.NUMBER, defaultValue: 39 },
            REG: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
          }
        },

        {
          opcode: "i2cWrite",
          blockType: Scratch.BlockType.COMMAND,
          text: "I2C адрес [ADDR] регистр [REG] значение [VAL]",
          arguments: {
            ADDR: { type: Scratch.ArgumentType.NUMBER, defaultValue: 39 },
            REG: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            VAL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
          }
        },

        {
          opcode: "ultrasonic",
          blockType: Scratch.BlockType.REPORTER,
          text: "ультразвук trig [T] echo [E]",
          arguments: {
            T: { type: Scratch.ArgumentType.NUMBER, defaultValue: 7 },
            E: { type: Scratch.ArgumentType.NUMBER, defaultValue: 8 }
          }
        }

      ],

      menus: {
        mode: {
          items: ["INPUT", "OUTPUT", "INPUT_PULLUP"]
        }
      }
    };
  }

  async connect() {
    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate: 57600 });
    this.writer = this.port.writable.getWriter();
    this.reader = this.port.readable.getReader();
    await this._send([0xFF]); // reset
    this._readLoop();
  }

  async _send(data) {
    await this.writer.write(new Uint8Array(data));
  }

  async pinMode({ PIN, MODE }) {
    const m = { INPUT: 0, OUTPUT: 1, INPUT_PULLUP: 2 }[MODE];
    await this._send([0xF4, PIN, m]);
  }
async digitalWrite({ PIN, VAL }) {
    const port = Math.floor(PIN / 8);
    const bit = PIN % 8;
    this.digital[port] = this.digital[port] || 0;
    VAL ? this.digital[port] |= (1 << bit) : this.digital[port] &= ~(1 << bit);
    await this._send([0x90 | port, this.digital[port] & 0x7F, this.digital[port] >> 7]);
  }

  digitalRead({ PIN }) {
    return (this.digital[Math.floor(PIN / 8)] >> (PIN % 8)) & 1;
  }

  analogRead({ PIN }) {
    return this.analog[PIN] || 0;
  }

  async analogWrite({ PIN, VAL }) {
    await this._send([0xE0 | PIN, VAL & 0x7F, VAL >> 7]);
  }

  async servo({ PIN, ANGLE }) {
    if (!this.servoPins.has(PIN)) {
      await this._send([0xF4, PIN, 4]);
      this.servoPins.add(PIN);
    }
    await this._send([0xE0 | PIN, ANGLE & 0x7F, ANGLE >> 7]);
  }

  async i2cWrite({ ADDR, REG, VAL }) {
    await this._send([0xF0, 0x76, ADDR, 0, REG, 0, VAL, 0, 0xF7]);
  }

  i2cRead({ ADDR, REG }) {
    return this.i2cData[${ADDR}:${REG}] || 0;
  }

  ultrasonic({ T, E }) {
    // через Firmata ping (упрощено)
    return this.analog[E] || 0;
  }

  async _readLoop() {
    while (true) {
      const { value } = await this.reader.read();
      for (const b of value) this.buffer.push(b);
      this._parse();
    }
  }

  _parse() {
    while (this.buffer.length >= 3) {
      const cmd = this.buffer.shift();
      if ((cmd & 0xF0) === 0xE0) {
        const pin = cmd & 0x0F;
        this.analog[pin] = this.buffer.shift() | (this.buffer.shift() << 7);
      }
    }
  }
}

Scratch.extensions.register(new ArduinoUltimate());
