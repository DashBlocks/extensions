// Name: Ding Dong Ditch
// ID: dingDongDitch
// Description: Something I did for fun.
// By: GaiaWindWave90 <https://github.com/gaiawindwave90/>
// Original: Blocks from others users

(function(Scratch) {
  'use strict';
  
  class DingDongDitch {
    getInfo() {
      return {
        id: "dingDongDitch",
        name: "Ding Dong Ditch",
		color1: "#AE78F1",
        color2: "#8B38F1",
        color3: "#AA71F1",
        blocks: [
          {
            opcode: 'alert',
            text: 'show alert',
            blockType: Scratch.BlockType.COMMAND
          },
		 
		 {
           opcode: 'setFontinWeight',
           blockType: Scratch.BlockType.COMMAND,
           text: 'set font [FONT] in font weight [WEIGHT]',
		   arguments: {
              FONT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Comic Sans MS",
              },
			  WEIGHT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "900px",
              },
            },
         },
		 
		 {
           opcode: 'deleteSpriteinIndex',
           blockType: Scratch.BlockType.COMMAND,
           text: 'delete sprite at index [INDEX]',
		   arguments: {
              INDEX: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "1",
              },
            },
         },
		 
                  {
                    opcode: 'executeJS',
                    text: 'execute JavaScript [JS]',
                    blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        JS: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'alert("PenguinMod is a jerk.");'
                        }
                    }
                },
				
	          {
                    opcode: 'removeAllExtensions',
                    text: 'remove all extensions',
                    blockType: Scratch.BlockType.COMMAND,
                },
				
	          {
                    opcode: 'enableContentEditing',
                    text: 'enable content editing',
                    blockType: Scratch.BlockType.COMMAND,
                },
        ]
      };
    }

    alert() {
      alert('Hello!');
    }
	
   setFontinWeight({ FONT, WEIGHT }) {
        var textElements = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span, div, li, td, th, a");

        textElements.forEach(function (element) {
            element.style.fontFamily = (FONT);
            element.style.fontWeight = (WEIGHT);
        });
    }
	
	deleteSpriteinIndex({ INDEX }) {
        vm.deleteSprite(vm.runtime.targets[(INDEX)].id)
    }
	
    executeJS (args) {
        new Function(args.JS)();
    }
	
	removeAllExtensions (args) {
     Scratch.vm.runtime.extensionManager._loadedExtensions.keys().forEach(extension => {
            vm.extensionManager.removeExtension(extension);
        });
    }

	enableContentEditing (args) {
     	document.body.contentEditable = 'true';
    }
	
  }

  Scratch.extensions.register(new DingDongDitch());
})(Scratch);
