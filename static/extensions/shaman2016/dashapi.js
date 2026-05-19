// Name: Dash Api
// ID: polzovatel_8787_dashApi
// Description: An extension for interacting with the Dash api. It ONLY works in Dash.
// By: polzovatel_8787 <https://dashblocks.github.io/scratch-gui/user#7>
// License: MPL-2.0

(function (Scratch) {

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("This Extension must run unsandboxed")
  }

  if (!Scratch.extensions.isDash) {
    throw new Error("This Extension must run in Dash (because of CORS)")
  }

    class polzovatel_8787_dashApi {
      getInfo() {
        return {
          id: "polzovatel8787dashApi",
          name: "Dash Api",
          docsURL: "https://shaman2016scratch.github.io/ext-docs/dashapi/",
          color1: "#ff8f4d",
          blocks: [
            {
              blockType: Scratch.BlockType.LABEL,
              text: 'Login'
            }, {
              opcode: "isLogin",
              blockType: Scratch.BlockType.BOOLEAN,
              text: "is login?",
              arguments: {}
            }, {
              blockType: Scratch.BlockType.LABEL,
              text: 'Session and my info'
            }, {
              opcode: "getMyUsername",
              blockType: Scratch.BlockType.REPORTER,
              text: "username",
              arguments: {}
            }, {
              opcode: "getMyId",
              blockType: Scratch.BlockType.REPORTER,
              text: "user id",
              arguments: {}
            }, {
              opcode: "getMyRole",
              blockType: Scratch.BlockType.REPORTER,
              text: "role",
              arguments: {}
            }, {
              opcode: "getMyAvatar",
              blockType: Scratch.BlockType.REPORTER,
              text: "avatar url",
              arguments: {}
            }, {
              blockType: Scratch.BlockType.LABEL,
              text: "Get info"
            }, {
              blockType: Scratch.BlockType.LABEL,
              text: "1. Users"
            }, {
              opcode: "getIdUser",
              blockType: Scratch.BlockType.REPORTER,
              text: "get id of [user]",
              arguments: {
                user: {
                  defaultValue: "polzovatel_8787",
                  type: Scratch.ArgumentType.STRING,
                }
              }
            }, {
              opcode: "getUsernameUser",
              blockType: Scratch.BlockType.REPORTER,
              text: "get username of id [user]",
              arguments: {
                user: {
                  defaultValue: 7,
                  type: Scratch.ArgumentType.NUMBER,
                }
              }
            }, {
              opcode: "getColvoProjectsUser",
              blockType: Scratch.BlockType.REPORTER,
              text: "get the number of projects of user [user]",
              arguments: {
                user: {
                  defaultValue: "polzovatel_8787",
                  type: Scratch.ArgumentType.STRING,
                }
              }
            }, {
              opcode: "getProjectsUser",
              blockType: Scratch.BlockType.ARRAY,
              text: "get array of projects of user [user]",
              arguments: {
                user: {
                  defaultValue: "polzovatel_8787",
                  type: Scratch.ArgumentType.STRING,
                }
              }
            }, {
              opcode: "getRoleUser",
              blockType: Scratch.BlockType.REPORTER,
              text: "get role of user [user]",
              arguments: {
                user: {
                  defaultValue: "polzovatel_8787",
                  type: Scratch.ArgumentType.STRING,
                }
              }
            }, {
              opcode: "getDescriptionUser",
              blockType: Scratch.BlockType.REPORTER,
              text: "get description of user [user]",
              arguments: {
                user: {
                  defaultValue: "polzovatel_8787",
                  type: Scratch.ArgumentType.STRING,
                }
              }
            }, {
              opcode: "getScratchUser",
              blockType: Scratch.BlockType.REPORTER,
              text: "get scratch username of user [user]",
              arguments: {
                user: {
                  defaultValue: "polzovatel_8787",
                  type: Scratch.ArgumentType.STRING,
                }
              }
            }, {
              opcode: "getAvatarUser",
              blockType: Scratch.BlockType.REPORTER,
              text: "get link of avatar of user [user]",
              arguments: {
                user: {
                  defaultValue: "polzovatel_8787",
                  type: Scratch.ArgumentType.STRING,
                }
              }
            }, {
              blockType: Scratch.BlockType.LABEL,
              text: "2. Projects"
            }, {
              opcode: "getAuthorProject",
              blockType: Scratch.BlockType.REPORTER,
              text: "get username of author project [project]",
              arguments: {
                project: {
                  defaultValue: 100,
                  type: Scratch.ArgumentType.NUMBER,
                }
              }
            }, {
              opcode: "getNameProject",
              blockType: Scratch.BlockType.REPORTER,
              text: "get name of project [project]",
              arguments: {
                project: {
                  defaultValue: 100,
                  type: Scratch.ArgumentType.NUMBER,
                }
              }
            }, {
              opcode: "getDescriptionProject",
              blockType: Scratch.BlockType.REPORTER,
              text: "get description of project [project]",
              arguments: {
                project: {
                  defaultValue: 100,
                  type: Scratch.ArgumentType.NUMBER,
                }
              }
            }, {
              opcode: "getFiresProject",
              blockType: Scratch.BlockType.REPORTER,
              text: "get fires of project [project]",
              arguments: {
                project: {
                  defaultValue: 100,
                  type: Scratch.ArgumentType.NUMBER,
                }
              }
            }
          ],
        };
      }
// Login
async isLogin() {
  const req = await fetch('https://dashblocks-server.vercel.app/session', {
    credentials: 'include'
  })
  let ret = false
  if (req) {
    ret = true
  }
  return ret
}
// get my info
async getMyUsername() {
  async function isLogin() {
    const req = await fetch('https://dashblocks-server.vercel.app/session', {
      credentials: 'include'
    })
    let ret = false
    if (req) {
      ret = true
    }
    return ret
  }
  let ret = ''
  if (isLogin()) {
    const req = await fetch('https://dashblocks-server.vercel.app/session', {
      credentials: 'include'
    })
    const res = await req.json()
    ret = res.username
  }
  return ret
}
async getMyId() {
  async function isLogin() {
    const req = await fetch('https://dashblocks-server.vercel.app/session', {
      credentials: 'include'
    })
    let ret = false
    if (req) {
      ret = true
    }
    return ret
  }
  let ret = 0
  if (isLogin()) {
    const req = await fetch('https://dashblocks-server.vercel.app/session', {
      credentials: 'include'
    })
    const res = await req.json()
    ret = res.userId
  }
  return ret
}
async getMyRole() {
  async function isLogin() {
    const req = await fetch('https://dashblocks-server.vercel.app/session', {
      credentials: 'include'
    })
    let ret = false
    if (req) {
      ret = true
    }
    return ret
  }
  let ret = ''
  if (isLogin()) {
    const req = await fetch('https://dashblocks-server.vercel.app/session', {
      credentials: 'include'
    })
    const res = await req.json()
    ret = res.role || "dasher"
  }
  return ret
}
async getMyAvatar() {
  async function isLogin() {
    const req = await fetch('https://dashblocks-server.vercel.app/session', {
      credentials: 'include'
    })
    let ret = false
    if (req) {
      ret = true
    }
    return ret
  }
  let ret = ''
  if (isLogin()) {
    const req = await fetch('https://dashblocks-server.vercel.app/session', {
      credentials: 'include'
    })
    const res = await req.json()
    ret = `https://dashblocks-server.vercel.app/users/avatars/${res.profile.avatarId}`
  }
  return ret
}
// get user data
async getIdUser(args) {
  const req = await fetch(`https://dashblocks-server.vercel.app/users/${args.user}`, {
    credentials: 'include'
  })
  const res = await req.json()
  return res.user.id
}
async getIdUser(args) {
  const req = await fetch(`https://dashblocks-server.vercel.app/users/${args.user}`, {
    credentials: 'include'
  })
  const res = await req.json()
  return res.user.id
}
async getUsernameUser(args) {
  const req = await fetch(`https://dashblocks-server.vercel.app/users/${args.user}`, {
    credentials: 'include'
  })
  const res = await req.json()
  return res.user.username
}
async getColvoProjectsUser(args) {
  const req = await fetch(`https://dashblocks-server.vercel.app/users/${args.user}`, {
    credentials: 'include'
  })
  const res = await req.json()
  return res.user.projects.length
}
async getProjectsUser(args) {
  const req = await fetch(`https://dashblocks-server.vercel.app/users/${args.user}`, {
    credentials: 'include'
  })
  const res = await req.json()
  return res.user.projects
}
async getRoleUser(args) {
  const req = await fetch(`https://dashblocks-server.vercel.app/users/${args.user}`, {
    credentials: 'include'
  })
  const res = await req.json()
  return res.user.role
}
async getDescriptionUser(args) {
  const req = await fetch(`https://dashblocks-server.vercel.app/users/${args.user}`, {
    credentials: 'include'
  })
  const res = await req.json()
  return res.user.profile.description
}
async getScratchUser(args) {
  const req = await fetch(`https://dashblocks-server.vercel.app/users/${args.user}`, {
    credentials: 'include'
  })
  const res = await req.json()
  return res.user.profile.scratchUsername || 'unknown'
}
async getAvatarUser(args) {
  const req = await fetch(`https://dashblocks-server.vercel.app/users/${args.user}`, {
    credentials: 'include'
  })
  const res = await req.json()
  return `https://dashblocks-server.vercel.app/users/avatars/${res.user.profile.avatarId}`
}
// get project data
async getAuthorProject(args) {
  const req = await fetch(`https://dashblocks-server.vercel.app/projects/${args.project}`, {
    credentials: 'include'
  })
  const res = await req.json()
  return res.project.author.username
}
async getNameProject(args) {
  const req = await fetch(`https://dashblocks-server.vercel.app/projects/${args.project}`, {
    credentials: 'include'
  })
  const res = await req.json()
  return res.project.name
}
async getDescriptionProject(args) {
  const req = await fetch(`https://dashblocks-server.vercel.app/projects/${args.project}`, {
    credentials: 'include'
  })
  const res = await req.json()
  return res.project.description
}
async getFiresProject(args) {
  const req = await fetch(`https://dashblocks-server.vercel.app/projects/${args.project}`, {
    credentials: 'include'
  })
  const res = await req.json()
  return res.project.stats.fires
}
    }
    Scratch.extensions.register(new polzovatel_8787_dashApi());
  })(Scratch);
