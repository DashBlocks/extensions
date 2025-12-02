// Name: Local Data Extension
// ID: LocalDataByShaman2016
// Description: An extension for interacting with cookies and with local storage.
// By: SHAMAN2016 <https://scratch.mit.edu/users/SHAMAN2016/>
// License: MIT

(function (Scratch) {
    "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("This Extension must run unsandboxed");
  }

    class LocalData {
      getInfo() {
        return {
          id: "LocalDataByShaman2016",
          name: "Local Data Extension",
          color1: "#a3c0e1",
          blocks: [
            {
              opcode: "GetCookie",
              blockType: Scratch.BlockType.REPORTER,
              text: "Get Cookie [cookie]",
              arguments: {
                cookie: {
                  defaultValue: "User",
                  type: Scratch.ArgumentType.STRING,
                },
              },
            }, {
              opcode: "GetLocalData",
              blockType: Scratch.BlockType.REPORTER,
              text: "Get LocalStorage key [key]",
              arguments: {
                key: {
                  defaultValue: "LocalRecord",
                  type: Scratch.ArgumentType.STRING,
                },
              },
            }, {
              opcode: "SetCookie",
              blockType: Scratch.BlockType.COMMAND,
              text: "Set Cookie: name [name], value [value], max-age [age], path [path], secure [secure], domain [domain]",
              arguments: {
                name: {
                  defaultValue: "User",
                  type: Scratch.ArgumentType.STRING,
                },
                value: {
                  defaultValue: "Session89:%%_%%_ABcDccAAAAb",
                  type: Scratch.ArgumentType.STRING,
                },
                age: {
                  defaultValue: 31536000,
                  type: Scratch.ArgumentType.NUMBER,
                },
                path: {
                  defaultValue: '/',
                  type: Scratch.ArgumentType.STRING,
                },
                secure: {
                  defaultValue: true,
                  type: Scratch.ArgumentType.BOOLEAN,
                },
                domain: {
                  defaultValue: 'https://dashblocks.github.io/',
                  type: Scratch.ArgumentType.STRING,
                },
              },
            }, {
              opcode: "SetLocalData",
              blockType: Scratch.BlockType.COMMAND,
              text: "Set LocalStorage key [key] value [value]",
              arguments: {
                key: {
                  defaultValue: "LocalRecord",
                  type: Scratch.ArgumentType.STRING,
                },
                value: {
                  defaultValue: 348,
                  type: Scratch.ArgumentType.STRING,
                },
              },
            }, {
              opcode: "GetAllCookie",
              blockType: Scratch.BlockType.OBJECT,
              text: "Get All Cookies",
              arguments: {},
            }, {
              opcode: "GetAllCookie2",
              blockType: Scratch.BlockType.ARRAY,
              text: "Get All Cookies list",
              arguments: {},
            },
          ],
        };
      }
GetCookie(args) {
  Cookies = document.cookie.split("; ")
  for(i = 0; i < Cookies.length; i++) {
    if (Cookies[i].split("=")[0] === args.cookie) {
      key = Cookies[i].split("=")[1]
    }
  }
  return key
}
GetLocalData(args) {
  return localStorage.getItem(args.key)
}
SetCookie(args) {
  if (secure) {
    document.cookie = `${args.name}=${args.value}; max-age=${args.age}; path=${path}; domain=${domain}; secure`
  } else {
    document.cookie = `${args.name}=${args.value}; max-age=${args.age}; path=${path}; domain=${domain}`
  }
}
SetLocalData(args) {
  localStorage.setItem(args.key, args.value)
}
GetAllCookie(args) {
  Cookies = document.cookie.split("; ")
  keys = {}
  for(i = 0; i < Cookies.length; i++) {
    key[Cookies[i].split("=")[0]] = Cookies[i].split("=")[1]
  }
  return keys
}
GetAllCookie2(args) {
  return document.cookie.split("; ")
}
    }
    Scratch.extensions.register(new LocalData());
  })(Scratch);
