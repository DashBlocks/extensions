// Name: JavaScript Runner
// ID: shaman2016JavaScriptRunner
/* By:
 * SHAMAN2016 <https://scratch.mit.edu/users/SHAMAN2016/>
 * damir2809 <https://scratch.mit.edu/users/damir2809/>
 */
// License: MIT

(function (Scratch) {
    "use strict";

    if (!Scratch.extensions.unsandboxed) return alert("This extension MUST run unsandboxed!");

    const Cast = Scratch.Cast;

    class JavaScriptExtension {
        getInfo () {
            return {
                id: "shaman2016JavaScriptRunner",
                name: "JavaScript Runner",
                docsURL: "https://shaman2016scratch.github.io/ext-docs/JavaScriptRunner/",
                menuIconURI: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/1280px-Unofficial_JavaScript_logo_2.svg.png",
                color1: "#f3e000",
                blocks: [
                    {
                        opcode: "command",
                        text: "command [CODE]",
                        blockType: Scratch.BlockType.COMMAND,
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "alert(\"Hello, world!\");"
                            }
                        }
                    },
                    {
                        opcode: "reporter",
                        text: "reporter [CODE]",
                        blockType: Scratch.BlockType.REPORTER,
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "return \"Hello, world!\";"
                            }
                        }
                    },
                    {
                        opcode: "boolean",
                        text: "boolean [CODE]",
                        blockType: Scratch.BlockType.BOOLEAN,
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "return 1 < 2;"
                            }
                        }
                    },
                    {
                        opcode: "array",
                        text: "array [CODE]",
                        blockType: Scratch.BlockType.ARRAY,
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "return [\"apple\", \"banana\"];"
                            }
                        }
                    },
                    {
                        opcode: "object",
                        text: "object [CODE]",
                        blockType: Scratch.BlockType.OBJECT,
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "return {a: \"apple\", b: \"banana\"};"
                            }
                        }
                    }
                ]
            }
        }

        async _execute (code) {
            const wrappedCode = `(async () => {${code}})()`;
            try {
                const result = await Scratch.SandboxRunner.execute(wrappedCode);
                if (result.success) {
                    return result.value;
                } else {
                    return "Error: " + result.value.message;
                }
            } catch (error) {
                return "Error: " + result.value;
            }
        }

        async command (args) {
            const code = Cast.toString(args.CODE);
            await this._execute(code);
        }

        async reporter (args) {
            const code = Cast.toString(args.CODE);
            const output = Cast.toString(await this._execute(code));
            return output;
        }

        async boolean (args) {
            const code = Cast.toString(args.CODE);
            const boolean = Cast.toBoolean(await this._execute(code));
            return boolean;
        }

        async array (args) {
            const code = Cast.toString(args.CODE);
            const array = Cast.toList(await this._execute(code));
            return array;
        }

        async object (args) {
            const code = Cast.toString(args.CODE);
            const object = Cast.toObject(await this._execute(code));
            return object;
        }
    }
    Scratch.extensions.register(new JavaScriptExtension);
})(Scratch);
