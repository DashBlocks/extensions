// Name: Dash API
// ID: polzovatel8787dashApi
// Description: An extension for interacting with the Dash api. It ONLY works in Dash.
/* By:
  polzovatel_8787 <https://dashblocks.org/user#polzovatel_8787>
  DBDev-IT <https://dashblocks.org/user#DBDev-IT>
*/
// License: GNU GPL v3

(function (Scratch) {
  if (!Scratch.extensions.unsandboxed) {
    throw new Error("This Extension must run unsandboxed");
  }

  if (!Scratch.extensions.isDash) {
    throw new Error("This Extension must run in Dash (because of CORS)");
  }

  Scratch.translate.setup({
    ru: {
      getFeaturedProjects: "избранные проекты",
      "titles.session": "Cессия и моя информация",
      "session.isLogin": "вошел?",
      "session.username": "имя пользователя",
      "session.id": "ID пользователя",
      "session.role": "роль",
      "session.avatar": "URL аватарки",
      "session.messages": "сообщения",
      "titles.info": "Получение информации",
      "titles.info.users": "1. Пользователи",
      "info.users.id": "ID пользователя [user]",
      "info.users.username": "имя пользователя по ID [user]",
    },
  });

  class DashAPI {
    constructor() {
      this.isLogin = false;
    }
    getInfo() {
      return {
        id: "polzovatel8787dashApi",
        name: "Dash API",
        docsURL: "https://shaman2016scratch.github.io/ext-docs/dashapi/",
        color1: "#ff8f4d",
        blocks: [
          {
            opcode: "getFeaturedProjects",
            blockType: Scratch.BlockType.ARRAY,
            text: Scratch.translate({
              id: "getFeaturedProjects",
              default: "featured projects",
            }),
          },
          {
            blockType: Scratch.BlockType.LABEL,
            text: Scratch.translate({
              id: "titles.session",
              default: "Session and my info",
            }),
          },
          {
            opcode: "isLoginBlock",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate({
              id: "session.isLogin",
              default: "is login?",
            }),
          },
          {
            opcode: "getMyUsername",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate({
              id: "session.username",
              default: "username",
            }),
          },
          {
            opcode: "getMyId",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate({ id: "session.id", default: "user ID" }),
          },
          {
            opcode: "getMyRole",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate({ id: "session.role", default: "role" }),
          },
          {
            opcode: "getMyAvatar",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate({
              id: "session.avatar",
              default: "avatar URL",
            }),
          },
          {
            opcode: "getMyMessages",
            blockType: Scratch.BlockType.ARRAY,
            text: Scratch.translate({
              id: "session.messages",
              default: "messages",
            }),
          },
          {
            blockType: Scratch.BlockType.LABEL,
            text: Scratch.translate({ id: "titles.info", default: "Get info" }),
          },
          {
            blockType: Scratch.BlockType.LABEL,
            text: Scratch.translate({
              id: "titles.info.users",
              default: "1. Users",
            }),
          },
          {
            opcode: "getIdUser",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate({
              id: "info.users.id",
              default: "ID of user [user]",
            }),
            arguments: {
              user: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getUsernameUser",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate({
              id: "info.users.username",
              default: "username by ID [user]",
            }),
            arguments: {
              user: {
                defaultValue: 7,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getLengthProjectsUser",
            blockType: Scratch.BlockType.REPORTER,
            text: "project count of user [user]",
            arguments: {
              user: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getProjectsUser",
            blockType: Scratch.BlockType.ARRAY,
            text: "projects of user [user] with offset: [offset] limit: [limit]",
            arguments: {
              user: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
              offset: {
                defaultValue: 0,
                type: Scratch.ArgumentType.NUMBER,
              },
              limit: {
                defaultValue: 20,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getRoleUser",
            blockType: Scratch.BlockType.REPORTER,
            text: "role of user [user]",
            arguments: {
              user: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getDescriptionUser",
            blockType: Scratch.BlockType.REPORTER,
            text: "description of user [user]",
            arguments: {
              user: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getAvatarUser",
            blockType: Scratch.BlockType.REPORTER,
            text: "avatar URL of user [user]",
            arguments: {
              user: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getUserLinks",
            blockType: Scratch.BlockType.ARRAY,
            text: "links of user [user]",
            arguments: {
              user: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getUserLinksLength",
            blockType: Scratch.BlockType.REPORTER,
            text: "link count of user [user]",
            arguments: {
              user: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getUserAchievements",
            blockType: Scratch.BlockType.ARRAY,
            text: "achievements of user [user]",
            arguments: {
              user: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getUserAchievementsLength",
            blockType: Scratch.BlockType.REPORTER,
            text: "achievements count of user [user]",
            arguments: {
              user: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getFollowersUser",
            blockType: Scratch.BlockType.ARRAY,
            text: "followers of user [user] with offset: [offset] limit: [limit]",
            arguments: {
              user: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
              offset: {
                defaultValue: 0,
                type: Scratch.ArgumentType.NUMBER,
              },
              limit: {
                defaultValue: 20,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getFollowingUser",
            blockType: Scratch.BlockType.ARRAY,
            text: "following of user [user] with offset: [offset] limit: [limit]",
            arguments: {
              user: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
              offset: {
                defaultValue: 0,
                type: Scratch.ArgumentType.NUMBER,
              },
              limit: {
                defaultValue: 20,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getUserRecommendedProjectId",
            blockType: Scratch.BlockType.REPORTER,
            text: "recommended project ID of user [user]",
            arguments: {
              user: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            blockType: Scratch.BlockType.LABEL,
            text: "2. Projects",
          },
          {
            opcode: "getProjectAuthor",
            blockType: Scratch.BlockType.REPORTER,
            text: "author's username of project [project]",
            arguments: {
              project: {
                defaultValue: 100,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getNameProject",
            blockType: Scratch.BlockType.REPORTER,
            text: "name of project [project]",
            arguments: {
              project: {
                defaultValue: 100,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getDescriptionProject",
            blockType: Scratch.BlockType.REPORTER,
            text: "description of project [project]",
            arguments: {
              project: {
                defaultValue: 100,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getFiresProject",
            blockType: Scratch.BlockType.REPORTER,
            text: "fires of project [project]",
            arguments: {
              project: {
                defaultValue: 100,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getProjectTrumbnail",
            blockType: Scratch.BlockType.REPORTER,
            text: "thumbnail URL of project [project]",
            arguments: {
              project: {
                defaultValue: 100,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
        ],
      };
    }
    // Utility methods
    async checkIsLogin() {
      const req = await fetch("https://api.dashblocks.org/session", {
        credentials: "include",
      });
      let ret = false;
      if (req.ok) {
        ret = true;
      }
      this.isLogin = ret;
      return ret;
    }
    async getMyInfo() {
      const req = await fetch("https://api.dashblocks.org/session", {
        credentials: "include",
      });
      let returN = {};
      if (req.ok) {
        returN = await req.json();
      }
      return returN;
    }
    async getUserInfo(username) {
      const req = await fetch(`https://api.dashblocks.org/users/${username}`);
      let returN = {};
      if (req.ok) {
        returN = await req.json();
      }
      return returN;
    }
    async getProjectInfo(id) {
      const req = await fetch(
        `https://api.dashblocks.org/projects/${Number(id)}`,
      );
      let returN = {};
      if (req.ok) {
        returN = await req.json();
      }
      return returN;
    }
    async getUserProjects(user, offset, limit) {
      const req = await fetch(
        `https://api.dashblocks.org/users/${user}/projects?offset=${offset}&limit=${limit}`,
      );
      let returN = {};
      if (req.ok) {
        returN = await req.json();
      }
      return returN;
    }
    async getUserFollowers(user, offset, limit) {
      const req = await fetch(
        `https://api.dashblocks.org/users/${user}/followers?offset=${offset}&limit=${limit}`,
      );
      let returN = {};
      if (req.ok) {
        returN = await req.json();
      }
      return returN;
    }
    async getUserFollowing(user, offset, limit) {
      const req = await fetch(
        `https://api.dashblocks.org/users/${user}/following?offset=${offset}&limit=${limit}`,
      );
      let returN = {};
      if (req.ok) {
        returN = await req.json();
      }
      return returN;
    }
    // Block methods
    async getFeaturedProjects() {
      const returN = await (
        await fetch("https://api.dashblocks.org/featured-projects")
      ).json();
      return returN?.projects || [];
    }
    async isLoginBlock() {
      await this.checkIsLogin();
      return this.isLogin;
    }
    async getMyUsername() {
      let ret = "";
      if (this.isLogin) {
        const result = await this.getMyInfo();
        ret = result.user?.username || "";
      }
      return ret;
    }
    async getMyId() {
      let ret = "";
      if (this.isLogin) {
        const result = await this.getMyInfo();
        ret = result.user?.id || null;
      }
      return ret;
    }
    async getMyRole() {
      let ret = "";
      if (this.isLogin) {
        const result = await this.getMyInfo();
        ret = result.user?.role || "dasher";
      }
      return ret;
    }
    async getMyAvatar() {
      let ret = "";
      if (this.isLogin) {
        const result = await this.getMyInfo();
        ret = `https://api.dashblocks.org/users/avatars/${result.user?.id || null}`;
      }
      return ret;
    }
    async getMyMessages() {
      let ret = "";
      if (this.isLogin) {
        const result = await (
          await fetch("https://api.dashblocks.org/session/messages")
        ).json();
        ret = result.messages;
      }
      return ret;
    }
    async getIdUser(args) {
      const result = await this.getUserInfo(args.user);
      return result.user?.id || null;
    }
    async getUsernameUser(args) {
      const result = await this.getUserInfo(args.user);
      return result.user?.username || "Unknown";
    }
    async getLengthProjectsUser(args) {
      const result = await this.getUserInfo(args.user);
      return result.user?.profile?.stats?.projects || 0;
    }
    async getProjectsUser(args) {
      const result = await this.getUserProjects(
        args.user,
        args.offset,
        args.limit,
      );
      return result?.projects || [];
    }
    async getRoleUser(args) {
      const result = await this.getUserInfo(args.user);
      return result.user?.role || "dasher";
    }
    async getDescriptionUser(args) {
      const result = await this.getUserInfo(args.user);
      return result.user?.profile?.description || "";
    }
    async getAvatarUser(args) {
      const result = await this.getUserInfo(args.user);
      return `https://api.dashblocks.org/users/avatars/${result.user?.id}`;
    }
    async getUserLinks(args) {
      const result = await this.getUserInfo(args.user);
      return result.user?.profile?.links || [];
    }
    async getUserLinksLength(args) {
      const result = await this.getUserInfo(args.user);
      return result.user?.profile?.links?.length || 0;
    }
    async getUserAchievements(args) {
      const result = await this.getUserInfo(args.user);
      return result.user?.profile?.achievements || [];
    }
    async getUserAchievementsLength(args) {
      const result = await this.getUserInfo(args.user);
      return result.user?.profile?.achievements?.length || 0;
    }
    async getFollowersUser(args) {
      const result = await this.getUserFollowers(
        args.user,
        args.offset,
        args.limit,
      );
      return result.followers || [];
    }
    async getFollowingUser(args) {
      const result = await this.getUserFollowing(
        args.user,
        args.offset,
        args.limit,
      );
      return result.following || [];
    }
    async getUserRecommendedProjectId(args) {
      const result = await this.getUserInfo(args.user, args.offset, args.limit);
      return result.profile?.recommendedProject?.id || null;
    }
    async getProjectAuthor(args) {
      const result = await this.getProjectInfo(args.project);
      return result.project?.author?.username || "Unknown";
    }
    async getNameProject(args) {
      const result = await this.getProjectInfo(args.project);
      return result.project?.name || "";
    }
    async getDescriptionProject(args) {
      const result = await this.getProjectInfo(args.project);
      return result.project?.description || "";
    }
    async getFiresProject(args) {
      const result = await this.getProjectInfo(args.project);
      return result.project?.stats?.fires || 0;
    }
    getProjectTrumbnail(args) {
      return `https://api.dashblocks.org/projects/trumbnail/${args.project}`;
    }
  }
  Scratch.extensions.register(new DashAPI());
})(Scratch);
