// Name: Modals
// ID: scratchCraft2Alert
// Description: This extension adds modal dialog boxes.
// By: scratch_craft_2 <https://scratch.mit.edu/users/scratch_craft_2/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("This extension MUST run unsandboxed");
  }

  const Cast = Scratch.Cast;

  class Modals {
    getInfo() {
      return {
        id: "scratchCraft2Alert",
        name: Scratch.translate("Modals"),
        color1: "#a3c0e1",
        blocks: [
          {
            opcode: "alertBlock",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("alert [TEXT]"),
            arguments: {
              TEXT: {
                defaultValue: Scratch.translate("Hello!"),
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "promptBlock",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("prompt [TEXT] with default value [DEFAULT]"),
            arguments: {
              TEXT: {
                defaultValue: Scratch.translate("What's your name?"),
                type: Scratch.ArgumentType.STRING,
              },
              DEFAULT: {
                defaultValue: Scratch.translate("Dashy"),
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "confirmBlock",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("confirm [TEXT]"),
            arguments: {
              TEXT: {
                defaultValue: Scratch.translate("Did you see that movie?"),
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
        ],
      };
    }

    alertBlock (args) {
      const text = Cast.toString(args.TEXT);
      alert(text);
    }

    promptBlock (args) {
      const text = Cast.toString(args.TEXT);
      const defaultValue = Cast.toString(args.DEFAULT);
      return prompt(text, defaultValue);
    }

    confirmBlock (args) {
      const text = Cast.toString(args.TEXT);
      return confirm(text);
    }
  }

  Scratch.extensions.register(new Modals());
})(Scratch);
