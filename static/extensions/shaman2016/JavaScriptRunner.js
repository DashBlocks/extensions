// Name: JavaScript Runner
// ID: shaman2016JavaScriptRunner
/* By:
SHAMAN2016 <https://scratch.mit.edu/users/SHAMAN2016/>
damir2809 <https://scratch.mit.edu/users/damir2809/>
*/
// License: MIT

(function (Scratch) {
    "use strict";

    if (!Scratch.extensions.unsandboxed) return alert("This extension needs to be unsandboxed to run!");

    const Cast = Scratch.Cast;
    const _runnerFunctions = `
        data = {
            name: "JavaScript Runner",
            authors: [
                {
                    name: "SHAMAN2016",
                    scratch: "https://scratch.mit.edu/users/SHAMAN2016",
                    github: "https://github.com/shaman2016scratch"
                },
                {
                    name: "DBDev IT",
                    scratch: "https://scratch.mit.edu/users/damir2809",
                    github: "https://github.com/DBDev-IT"
                }
            ],
            version: "3.1",
            id: "shaman2016JavaScriptRunner",
            docs: "https://shaman2016scratch.github.io/ext-docs/JavaScriptRunner/"
        };
        function output (toOutput) {
            window.RUNNER_OUTPUT = toOutput;
            return toOutput;
        };
        function warn (toWarn) {
            window.RUNNER_OUTPUT = \`Warning: \${toWarn}\`;
            return \`Warning: \${toWarn}\`;
        };
        function error (toError) {
            window.RUNNER_OUTPUT = \`Error: \${toError}\`;
            return \`Error: \${toError}\`;
        };
    `;

    class JavaScriptExtension {
        getInfo () {
            return {
                id: "shaman2016JavaScriptRunner",
                name: "JavaScript Runner",
                docsURL: "https://shaman2016scratch.github.io/ext-docs/JavaScriptRunner/",
                color1: "#0fbd8c",
                blocks: [
                    {
                        opcode: "command",
                        text: "command [CODE], is async [isAsync]",
                        blockType: Scratch.BlockType.COMMAND,
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "alert(\"Hello, world!\");"
                            },
                            isAsync: {
                                type: Scratch.ArgumentType.BOOLEAN,
                                defaultValue: false
                            }
                        }
                    },
                    {
                        opcode: "reporter",
                        text: "reporter [CODE], is async [isAsync]",
                        blockType: Scratch.BlockType.REPORTER,
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "output(\"Hello, world!\");"
                            },
                            isAsync: {
                                type: Scratch.ArgumentType.BOOLEAN,
                                defaultValue: false
                            }
                        }
                    },
                    {
                        opcode: "boolean",
                        text: "boolean [CODE], is async [isAsync]",
                        blockType: Scratch.BlockType.BOOLEAN,
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "output(1 < 2);"
                            },
                            isAsync: {
                                type: Scratch.ArgumentType.BOOLEAN,
                                defaultValue: false
                            }
                        }
                    },
                    {
                        opcode: "array",
                        text: "array [CODE], is async [isAsync]",
                        blockType: Scratch.BlockType.ARRAY,
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "output([\"apple\", \"banana\"]);"
                            },
                            isAsync: {
                                type: Scratch.ArgumentType.BOOLEAN,
                                defaultValue: false
                            }
                        }
                    },
                    {
                        opcode: "object",
                        text: "object [CODE], is async [isAsync]",
                        blockType: Scratch.BlockType.OBJECT,
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "output({a: \"apple\", b: \"banana\"});"
                            },
                            isAsync: {
                                type: Scratch.ArgumentType.BOOLEAN,
                                defaultValue: false
                            }
                        }
                    }
                ]
            }
        }
        async _runSandboxed (code, isAsync) {
            window.RUNNER_OUTPUT = null;

            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.onload = () => {
                    script.remove()
                    resolve();
                };
                script.onerror = () => {
                    script.remove()
                    reject(new Error(`Error in sandboxed script. Check the console for more info`));
                };
                if (isAsync) {
                    script.src = `data:application/javascript,async function jsRun() { ${encodeURIComponent(_runnerFunctions)};${encodeURIComponent(code)} }; jsRun()`;
                } else {
                    script.src = `data:application/javascript,${encodeURIComponent(_runnerFunctions)};${encodeURIComponent(code)}`;
                };
                document.body.appendChild(script);
            });
            return window.RUNNER_OUTPUT;
        }

        async command (args) {
            const code = Cast.toString(args.CODE);
            await this._runSandboxed(code, args.isAsync);
        }

        async reporter (args) {
            const code = Cast.toString(args.CODE);
            const output = Cast.toString(await this._runSandboxed(code, args.isAsync));
            return output;
        }

        async boolean (args) {
            const code = Cast.toString(args.CODE);
            const boolean = Cast.toBoolean(await this._runSandboxed(code, args.isAsync));
            return boolean;
        }

        async array (args) {
            const code = Cast.toString(args.CODE);
            const array = Cast.toList(await this._runSandboxed(code, args.isAsync));
            return array;
        }

        async object (args) {
            const code = Cast.toString(args.CODE);
            const object = Cast.toObject(await this._runSandboxed(code, args.isAsync));
            return object;
        }
    }

    Scratch.extensions.register(new JavaScriptExtension);
})(Scratch);
