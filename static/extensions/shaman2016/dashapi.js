// Name: Dash Api
// ID: polzovatel8787dashApi
// Description: An extension for interacting with the Dash api. It ONLY works in Dash.
/* By:
  polzovatel_8787 <https://dashblocks.org/scratch-gui/user#polzovatel_8787>
  DBDev-IT <https://dashblocks.org/scratch-gui/user#DBDev-IT>
*/
// License: GNU GPL v3

(function (Scratch) {

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("This Extension must run unsandboxed")
  }

  if (!Scratch.extensions.isDash) {
    throw new Error("This Extension must run in Dash (because of CORS)")
  }

    class polzovatel_8787_dashApi {

      constructor () {
        this.isLogin = false
        this.checkIsLogin = async () {
          const req = await fetch("https://api.dashblocks.org/session", {
            credentials: "include"
          })
          let ret = false
          if (req.ok) {
            ret = true
          }
          this.isLogin = ret
        }
        this.getMyInfo = async () {
          const req = await fetch("https://api.dashblocks.org/session", {
            credentials: "include"
          })
          let returN = {}
          if (req.ok) {
            returN = await req.json()
          }
          return returN
        }
        this.getUserInfo = async (username) {
          const req = await fetch(`https://api.dashblocks.org/users/${username}`)
          let returN = {}
          if (req.ok) {
            returN = await req.json()
          }
          return returN
        }
        this.getProjectInfo = async (id) {
          const req = await fetch(`https://api.dashblocks.org/projects/${Number(id)}`)
          let returN = {}
          if (req.ok) {
            returN = await req.json()
          }
          return returN
        }
      }

      getInfo() {
        return {
          id: "polzovatel8787dashApi",
          name: "Dash Api",
          docsURL: "https://shaman2016scratch.github.io/ext-docs/dashapi/",
          color1: "#ff8f4d",
          blocks: [
            {
              blockType: Scratch.BlockType.LABEL,
              text: 'session and mi info'
            }, {
              opcode: "isLogin",
              blockType: Scratch.BlockType.BOOLEAN,
              text: "is login?",
              arguments: {}
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
              text: "get info"
            }, {
              blockType: Scratch.BlockType.LABEL,
              text: "1. users"
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
              text: "2. projects"
            }, {
              opcode: "getProjectAuthor",
              blockType: Scratch.BlockType.REPORTER,
              text: "get username of author of project [project]",
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
  await this.checkIsLogin()
  return this.isLogin
}
// get my info
async getMyUsername() {
  let ret = ""
  if (this.isLogin) {
    const result = await this.getMyInfo()
    ret = result.username
  }
  return ret
}
async getMyId() {
  let ret = ""
  if (this.isLogin) {
    const result = await this.getMyInfo()
    ret = result.id
  }
  return ret
}
async getMyRole() {
  let ret = ""
  if (this.isLogin) {
    const result = await this.getMyInfo()
    ret = result.role
  }
  return ret
}
async getMyAvatar() {
  let ret = ""
  if (this.isLogin) {
    const result = await this.getMyInfo()
    ret = result.avatarId
  }
  return ret
}
// get user data
async getIdUser(args) {
  const result = await this.getUserInfo(args.user)
  return res.user?.id || null
}
async getUsernameUser(args) {
  const result = await this.getUserInfo(args.user)
  return res.user?.username || "Unknown"
}
async getColvoProjectsUser(args) {
  const result = await this.getUserInfo(args.user)
  return res.user?.projects?.length || 0
}
async getProjectsUser(args) {
  const result = await this.getUserInfo(args.user)
  return res.user?.projects || []
}
async getRoleUser(args) {
  const result = await this.getUserInfo(args.user)
  return res.user?.role || "Dasher"
}
async getDescriptionUser(args) {
  const result = await this.getUserInfo(args.user)
  return res.user?.profile?.description || ""
}
async getAvatarUser(args) {
  const result = await this.getUserInfo(args.user)
  const avatarId = res.user?.profile?.avatarId || 0
  return `https://api.dashblocks.org/users/avatars/${0}`
}
// get project data
async getProjectAuthor(args) {
  const result = await this.getProjectInfo(args.project)
  return result.project?.author?.username || "Unknown"
}
async getNameProject(args) {
  const result = await this.getProjectInfo(args.project)
  return result.project?.name || ""
}
async getDescriptionProject(args) {
  const result = await this.getProjectInfo(args.project)
  return result.project?.description || ""
}
async getFiresProject(args) {
  const result = await this.getProjectInfo(args.project)
  return result.project?.stats?.fires || 0
}
    }
    Scratch.extensions.register(new polzovatel_8787_dashApi());
  })(Scratch);
