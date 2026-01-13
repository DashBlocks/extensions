class ArduinoUltimate {
  constructor() {
    this.port = null;
    this.writer = null;
    this.reader = null;

    this.buffer = [];
    this.analog = {};
    this.digitalPorts = {};
    this.i2cData = {};
    this.servoAttached = new Set();
  }

  /* ===== Scratch Info ===== */
  getInfo() {
    return {
      id: "arduinoUltimate",
      name: "Arduino ULTIMATE",
      blocks: [
        { opcode: "connect", blockType: Scratch.BlockType.COMMAND, text: "connect Arduino" },

        {
          opcode: "pinMode",
          blockType: Scratch.BlockType.COMMAND,
          text: "pin [PIN] mode [MODE]",
          arguments: {
            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 13 },
            MODE: { type: Scratch.ArgumentType.STRING, menu: "mode" }
          }
        },

        {
          opcode: "digitalWrite",
          blockType: Scratch.BlockType.COMMAND,
          text: "digital pin [PIN] = [VAL]",
          arguments: {
            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 13 },
            VAL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
          }
        },

        {
          opcode: "digitalRead",
          blockType: Scratch.BlockType.REPORTER,
          text: "digital pin [PIN]",
          arguments: {
            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 }
          }
        },

        {
          opcode: "analogRead",
          blockType: Scratch.BlockType.REPORTER,
          text: "analog pin [PIN]",
          arguments: {
            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
          }
        },

        {
          opcode: "analogWrite",
          blockType: Scratch.BlockType.COMMAND,
          text: "PWM pin [PIN] value [VAL]",
          arguments: {
            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 },
            VAL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 128 }
          }
        },

        {
          opcode: "servoWrite",
          blockType: Scratch.BlockType.COMMAND,
          text: "servo pin [PIN] angle [ANGLE]",
          arguments: {
            PIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 9 },
            ANGLE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 90 }
          }
        },

        {
          opcode: "i2cWrite",
          blockType: Scratch.BlockType.COMMAND,
          text: "I2C address [ADDR] register [REG] value [VAL]",
          arguments: {
            ADDR: { type: Scratch.ArgumentType.NUMBER, defaultValue: 39 },
            REG: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            VAL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
          }
        },

        {
          opcode: "i2cRead",
          blockType: Scratch.BlockType.REPORTER,
          text: "I2C address [ADDR] register [REG]",
          arguments: {
            ADDR: { type: Scratch.ArgumentType.NUMBER, defaultValue: 39 },
            REG: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
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

  /* ===== Connection ===== */
  async connect() {
    if (!("serial" in navigator)) {
      alert("Web Serial is not supported by this browser");
      return;
    }

    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate: 57600 });

    this.writer = this.port.writable.getWriter();
    this.reader = this.port.readable.getReader();

    await this._send([0xFF]); // Firmata reset
    this._readLoop();
  }

  /* ===== Low-level send ===== */
  async _send(bytes) {
    if (!this.writer) return;
    await this.writer.write(new Uint8Array(bytes));
  }

  /* ===== Pin control ===== */
  async pinMode({ PIN, MODE }) {
    const modes = { INPUT: 0, OUTPUT: 1, INPUT_PULLUP: 2 };
    await this._send([0xF4, PIN, modes[MODE] ?? 0]);
  }

  async digitalWrite({ PIN, VAL }) {
    const port = Math.floor(PIN / 8);
    const bit = PIN % 8;
if (!this.digitalPorts[port]) this.digitalPorts[port] = 0;
    VAL ? this.digitalPorts[port] |= (1 << bit)
        : this.digitalPorts[port] &= ~(1 << bit);

    await this._send([
      0x90 | port,
      this.digitalPorts[port] & 0x7F,
      (this.digitalPorts[port] >> 7) & 0x7F
    ]);
  }

  digitalRead({ PIN }) {
    const port = Math.floor(PIN / 8);
    const bit = PIN % 8;
    return (this.digitalPorts[port] >> bit) & 1;
  }

  analogRead({ PIN }) {
    return this.analog[PIN] || 0;
  }

  async analogWrite({ PIN, VAL }) {
    await this._send([
      0xE0 | PIN,
      VAL & 0x7F,
      (VAL >> 7) & 0x7F
    ]);
  }

  /* ===== Servo ===== */
  async servoWrite({ PIN, ANGLE }) {
    if (!this.servoAttached.has(PIN)) {
      await this._send([0xF4, PIN, 4]); // SERVO mode
      this.servoAttached.add(PIN);
    }

    await this._send([
      0xE0 | PIN,
      ANGLE & 0x7F,
      (ANGLE >> 7) & 0x7F
    ]);
  }

  /* ===== I2C ===== */
  async i2cWrite({ ADDR, REG, VAL }) {
    await this._send([
      0xF0, 0x76,
      ADDR,
      0x00,
      REG & 0x7F, (REG >> 7) & 0x7F,
      VAL & 0x7F, (VAL >> 7) & 0x7F,
      0xF7
    ]);
  }

  i2cRead({ ADDR, REG }) {
    return this.i2cData[`${ADDR}:${REG}`] || 0;
  }

  /* ===== Serial parsing ===== */
  async _readLoop() {
    while (true) {
      const { value, done } = await this.reader.read();
      if (done) break;
      for (const b of value) this.buffer.push(b);
      this._parse();
    }
  }

  _parse() {
    while (this.buffer.length >= 3) {
      const cmd = this.buffer.shift();

      // Analog message
      if ((cmd & 0xF0) === 0xE0) {
        const pin = cmd & 0x0F;
        const lsb = this.buffer.shift();
        const msb = this.buffer.shift();
        this.analog[pin] = lsb | (msb << 7);
      }
    }
  }
}

/* ===== Register ===== */
Scratch.extensions.register(new ArduinoUltimate());
