// Name: JavaScript Runner
// ID: shaman2016JavaScriptRunner
// Author: SHAMAN2016 <https://scratch.mit.edu/users/SHAMAN2016/>

(function (Scratch) {
    "use strict";

    if (!Scratch.extensions.unsandboxed) {
        return alert("This extension needs to be unsandboxed to run!");
    }

    const Cast = Scratch.Cast;
    let sandboxed = true;

    const RunnerDopFunc = `
        per = {}
        const RunnerVersion = '2.1'
        const RunnerData = {
            "name": "JavaScript Runner",
            "By": [
                {
                  "nickname": "SHAMAN2016",
                  "Scratch": "https://scratch.mit.edu/users/SHAMAN2016",
                  "Github": "https://github.com/shaman2016scratch"
                }
            ],
            "version": "2.1",
            "id": "shaman2016JavaScriptRunner"
        }
        const RunnerFunc = {}
        function output(out) {
            return out;
        }
        function error(err) {
            return \`Error: \${err}\`
        }
        function warn(war) {
            return \`Warning: \${war}\`
        }
    `

    class JavaScriptExtension {
        getInfo() {
            return {
                "id": "shaman2016JavaScriptRunner",
                "name": "JavaScript Runner",
                "color1": "#0fbd8c",
                "blocks": [
                    {
                        "func": "handleChangeSandboxed",
                        "text": sandboxed ? "Run unsandboxed" : "Run sandboxed",
                        "blockType": Scratch.BlockType.BUTTON
                    },
                    {
                        "opcode": "command",
                        "text": "command [CODE]",
                        "blockType": Scratch.BlockType.COMMAND,
                        "arguments": {
                            "CODE": {
                                "type": Scratch.ArgumentType.STRING,
                                "defaultValue": "alert(\"Hello World\")"
                            }
                        }
                    },
                    {
                        "opcode": "reporter",
                        "text": "reporter [CODE]",
                        "blockType": Scratch.BlockType.REPORTER,
                        "arguments": {
                            "CODE": {
                                "type": Scratch.ArgumentType.STRING,
                                "defaultValue": "output(\"Hello World\")"
                            }
                        }
                    },
                    {
                        "opcode": "boolean",
                        "text": "boolean [CODE]",
                        "blockType": Scratch.BlockType.BOOLEAN,
                        "arguments": {
                            "CODE": {
                                "type": Scratch.ArgumentType.STRING,
                                "defaultValue": "output(1 < 2)"
                            }
                        }
                    }
                ]
            }
        }

        handleChangeSandboxed () {
            sandboxed = !sandboxed;
            Scratch.vm.extensionManager.refreshBlocks();
        }
        SandboxJsRun (code) {
            new Promise((resolve, reject) => {
                const script = document.createElement('script');
                if (!sandboxed) {
                    script.onerror = () => {
                        reject(new Error(`Error in unsandboxed script. Check console for more info`));
                    };
                    script.src = `data:application/javascript,${encodeURIComponent(RunnerDopFunc)};${encodeURIComponent(code)}`;
                    document.body.appendChild(script);
                    return;
                }
                script.onload = () => resolve();
                script.onerror = () => {
                    reject(new Error(`Error in sandboxed script. Check the console for more info`));
                };
                script.src = `data:application/javascript,${encodeURIComponent(RunnerDopFunc)};${encodeURIComponent(code)}`;
                document.body.appendChild(script);
            })
        }

        command (args) {
            this.SandboxJsRun(args.CODE);
        }
        reporter (args) {
            const string = Cast.toString(this.SandboxJsRun(args.CODE));
            return string;
        }
        boolean (args) {
            const boolean = Cast.toBoolean(this.SandboxJsRun(args.CODE));
            return boolean;
        }
    }

    Scratch.extensions.register(new JavaScriptExtension);
})(Scratch);
