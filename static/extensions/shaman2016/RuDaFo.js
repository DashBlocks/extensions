// Name: RuDaFo
// ID: RuDaFoByShaman2016
// Description: An extension for interacting with RuDaFo.
// By: shaman2016 <https://scratch.mit.edu/users/shaman2016/>

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("This Extension must run unsandboxed");
  }
RuDaFo = {
  "ToJson": function(f, r) {
    if (f === 'object') {
      RuDaFo.data.i = r.split(';'); RuDaFo.data.i4 = {}; for(RuDaFo.data.i2 = 0; RuDaFo.data.i2 < RuDaFo.data.i.length; RuDaFo.data.i2++) { RuDaFo.data.i3 = RuDaFo.data.i[RuDaFo.data.i2]; RuDaFo.data.i5 = RuDaFo.data.i3.split(':'); RuDaFo.data.i4[RuDaFo.data.i5[0]] = RuDaFo.data.i5[1]; }; return RuDaFo.data.i4;
    } else if (f === 'array') {
      RuDaFo.data.i = r.split('&'); RuDaFo.data.i4 = []; for(RuDaFo.data.i2 = 0; RuDaFo.data.i2 < RuDaFo.data.i.length; RuDaFo.data.i2++) { RuDaFo.data.i3 = RuDaFo.data.i[RuDaFo.data.i2];RuDaFo.data.i4.push(RuDaFo.data.i3) }; return RuDaFo.data.i4;
    } else {
      console.error(`RuDaFo error: Not RuDaFo type name '${f}'`)
    }
  },
  "data": {},
  "FromJson": function(f, r) {
    if (f === 'object') {
      RuDaFo.data.i = r; RuDaFo.data.i4 = ""; RuDaFo.data.i3 = Object.keys(RuDaFo.data.i); for(RuDaFo.data.i2 = 0; RuDaFo.data.i2 < RuDaFo.data.i3.length; RuDaFo.data.i2++) { RuDaFo.data.i5 = RuDaFo.data.i[RuDaFo.data.i3[RuDaFo.data.i2]]; RuDaFo.data.i4 = `${RuDaFo.data.i4}${RuDaFo.data.i3[RuDaFo.data.i2]}:${RuDaFo.data.i5};` }; return RuDaFo.data.i4
    } else if (f === 'array') {
      RuDaFo.data.i = r; RuDaFo.data.i4 = ""; for(RuDaFo.data.i2 = 0; RuDaFo.data.i2 < RuDaFo.data.i.length; RuDaFo.data.i2++) { RuDaFo.data.i4 = `${RuDaFo.data.i4}${RuDaFo.data.i[RuDaFo.data.i2]}&` }; return RuDaFo.data.i4
    } else {
      console.error(`RuDaFo error: Not RuDaFo type name '${f}'`)
    }
  },
}

    class RuDaFoExt {
      getInfo() {
        return {
          id: "RuDaFoByShaman2016",
          name: "RuDaFo",
          color1: "#a3c0e1",
          blocks: [
            {
              opcode: "block1",
              blockType: Scratch.BlockType.REPORTER,
              text: "RuDaFo Object from Json Object [json]",
              arguments: {
                json: {
                  defaultValue: {"key":"value", "key2":"value"},
                  type: Scratch.ArgumentType.STRING,
                },
              },
            }, {
              opcode: "block2",
              blockType: Scratch.BlockType.REPORTER,
              text: "RuDaFo Array from Json Array [json]",
              arguments: {
                json: {
                  defaultValue: ["value", "value2"],
                  type: Scratch.ArgumentType.STRING,
                },
              },
            }, {
              opcode: "block3",
              blockType: Scratch.BlockType.OBJECT,
              text: "Json Object from RuDaFo Object [json]",
              arguments: {
                json: {
                  defaultValue: "key:value;key2:value2",
                  type: Scratch.ArgumentType.STRING,
                },
              },
            }, {
              opcode: "block4",
              blockType: Scratch.BlockType.ARRAY,
              text: "Json Array from RuDaFo Array [json]",
              arguments: {
                json: {
                  defaultValue: "value&value2",
                  type: Scratch.ArgumentType.STRING,
                },
              },
            },
            {
              blockType: Scratch.BlockType.LABEL,
              text: "Interaction with RuDaFo"
            }, {
              opcode: "block5",
              blockType: Scratch.BlockType.REPORTER,
              text: "Set Key [key] in RuDaFo Object [rdf] value [value]",
              arguments: {
                rdf: {
                  defaultValue: "key:value;key2:value2",
                  type: Scratch.ArgumentType.STRING,
                },
                key: {
                  defaultValue: "key",
                  type: Scratch.ArgumentType.STRING,
                },
                value: {
                  defaultValue: "value1",
                  type: Scratch.ArgumentType.STRING,
                },
              },
            },
          ],
        };
      }
block1(args) {
  return RuDaFo.FromJson('object', args.json)
}
block2(args) {
  return RuDaFo.FromJson('array', args.json)
}
block3(args) {
  return RuDaFo.ToJson('object', args.json)
}
block4(args) {
  return RuDaFo.ToJson('array', args.json)
}
block5(args) {
  ret = RuDaFo.ToJson('object', args.rdf)
  ret = ret[args.key] = args.value
  return ret
}
    }
    Scratch.extensions.register(new RuDaFoExt());
  })(Scratch);
