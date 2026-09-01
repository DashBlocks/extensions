// Name: Dash API
// ID: polzovatel8787dashApi
// Description: An extension for interacting with the Dash API. Works only in Dash.
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
      "info.users.id": "ID пользователя [USER]",
      "info.users.username": "имя пользователя по ID [USER]",
      "info.users.projectCount": "Количество проектов проектов пользователя [USER]",
      "info.users.projects": "Проекты пользователя [USER] используя смещение: [OFFSET] лимит: [LIMIT]",
      "info.users.role": "роль пользователя [USER]",
      "info.users.description": "описание пользователя [USER]",
      "info.users.avatar": "URL аватарки пользователя [USER]",
      "info.users.links": "ссылки пользователя [USER]",
      "info.users.links.count": "количество ссылок пользователя [USER]",
      "info.users.achievements": "достижения пользователя [USER]",
      "info.users.achievements.count": "количество достижений пользователя [USER]",
      "info.users.followers": "подписчики пользователя [USER]"
    },
  });

  const Cast = Scratch.Cast;
  const NormalArray = Scratch.NormalArray;

  class DashAPI {
    constructor() {
      this.API_ORIGIN = "https://api.dashblocks.org/";
      this.isLoggedIn = false;
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
              default: "Session and My Info",
            }),
          },
          {
            opcode: "isLoginBlock",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate({
              id: "session.isLogin",
              default: "logged in?",
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
            text: Scratch.translate({ id: "session.role", default: "user role" }),
          },
          {
            opcode: "getMyAvatar",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate({
              id: "session.avatar",
              default: "user avatar URL",
            }),
          },
          {
            opcode: "getMyMessages",
            blockType: Scratch.BlockType.ARRAY,
            text: Scratch.translate({
              id: "session.messages",
              default: "user messages",
            }),
          },
          {
            blockType: Scratch.BlockType.LABEL,
            text: Scratch.translate({ id: "titles.info", default: "Get Info" }),
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
              default: "ID of user [USER]",
            }),
            arguments: {
              USER: {
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
              default: "username by ID [USER]",
            }),
            arguments: {
              USER: {
                defaultValue: 7,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getLengthProjectsUser",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate({
              id: "info.users.projectCount",
              default: "projects count of user [USER]",
            }),
            arguments: {
              USER: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getProjectsUser",
            blockType: Scratch.BlockType.ARRAY,
            text: Scratch.translate({
              id: "info.users.projects",
              default: "projects of user [USER] with offset [OFFSET] and limit [LIMIT]"
            }),
            arguments: {
              USER: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
              OFFSET: {
                defaultValue: 0,
                type: Scratch.ArgumentType.NUMBER,
              },
              LIMIT: {
                defaultValue: 20,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getRoleUser",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate({
              id: "info.users.role",
              default: "role of user [USER]"
            }),
            arguments: {
              USER: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getDescriptionUser",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate({
              id: "info.users.description",
              default: "description of user [USER]"
            }),
            arguments: {
              USER: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getAvatarUser",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate({
              id: "info.users.avatar",
              default: "avatar URL of user [USER]"
            }),
            arguments: {
              USER: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getUserLinks",
            blockType: Scratch.BlockType.ARRAY,
            text: Scratch.translate({
              id: "info.users.links",
              default: "links of user [USER]"
            }),
            arguments: {
              USER: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getUserLinksLength",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate({
              id: "info.users.links.count",
              default: "links count of user [USER]"
            }),
            arguments: {
              USER: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getUserAchievements",
            blockType: Scratch.BlockType.ARRAY,
            text: Scratch.translate({
              id: "info.users.achievements",
              default: "achievements of user [USER]"
            }),
            arguments: {
              USER: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getUserAchievementsLength",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate({
              id: "info.users.achievements.count",
              default: "achievements count of user [USER]"
            }),
            arguments: {
              USER: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "getFollowersUser",
            blockType: Scratch.BlockType.ARRAY,
            text: Scratch.translate({
              id: "info.users.followers",
              default: "followers of user [USER] with offset [OFFSET] and limit [LIMIT]"
            }),
            arguments: {
              USER: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
              OFFSET: {
                defaultValue: 0,
                type: Scratch.ArgumentType.NUMBER,
              },
              LIMIT: {
                defaultValue: 20,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getFollowingUser",
            blockType: Scratch.BlockType.ARRAY,
            text: "following of user [USER] with offset [OFFSET] and limit [LIMIT]",
            arguments: {
              USER: {
                defaultValue: "polzovatel_8787",
                type: Scratch.ArgumentType.STRING,
              },
              OFFSET: {
                defaultValue: 0,
                type: Scratch.ArgumentType.NUMBER,
              },
              LIMIT: {
                defaultValue: 20,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getUserRecommendedProjectId",
            blockType: Scratch.BlockType.REPORTER,
            text: "recommended project ID of user [USER]",
            arguments: {
              USER: {
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
            text: "author's username of project [PROJECT]",
            arguments: {
              PROJECT: {
                defaultValue: 100,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getNameProject",
            blockType: Scratch.BlockType.REPORTER,
            text: "name of project [PROJECT]",
            arguments: {
              PROJECT: {
                defaultValue: 100,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getDescriptionProject",
            blockType: Scratch.BlockType.REPORTER,
            text: "description of project [PROJECT]",
            arguments: {
              PROJECT: {
                defaultValue: 100,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getFiresProject",
            blockType: Scratch.BlockType.REPORTER,
            text: "fires of project [PROJECT]",
            arguments: {
              PROJECT: {
                defaultValue: 100,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getProjectTrumbnail",
            blockType: Scratch.BlockType.REPORTER,
            text: "thumbnail URL of project [PROJECT]",
            arguments: {
              PROJECT: {
                defaultValue: 100,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getProjectForksBlock",
            blockType: Scratch.BlockType.ARRAY,
            text: "forks of project [PROJECT] with offset [OFFSET] and limit [LIMIT]",
            arguments: {
              PROJECT: {
                defaultValue: 100,
                type: Scratch.ArgumentType.NUMBER,
              },
              OFFSET: {
                defaultValue: 0,
                type: Scratch.ArgumentType.NUMBER,
              },
              LIMIT: {
                defaultValue: 20,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getProjectForkCount",
            blockType: Scratch.BlockType.REPORTER,
            text: "forks count of project [PROJECT]",
            arguments: {
              PROJECT: {
                defaultValue: 100,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
          {
            opcode: "getProjectViews",
            blockType: Scratch.BlockType.REPORTER,
            text: "views count of project [PROJECT]",
            arguments: {
              PROJECT: {
                defaultValue: 100,
                type: Scratch.ArgumentType.NUMBER,
              },
            },
          },
        ],
      };
    }
    async _makeRequest(endpoint, options) {
      try {
        const request = await fetch(this.API_ORIGIN + endpoint, {
          credentials: "include",
          ...options
        });
        return await request.json();
      } catch (_) {
        return { ok: false };
      }
    }
    async _checkIsLoggedIn() {
      const data = await this._makeRequest("session");
      this.isLoggedIn = data.ok;
      return this.isLoggedIn;
    }
    async _getMyInfo() {
      const data = await this._makeRequest("session");
      if (data.ok) {
        return data.user;
      }
      return {};
    }
    async _getUserInfo(username) {
      const data = await this._makeRequest(`users/${username}`);
      if (data.ok) {
        return data.user;
      }
      return {};
    }
    async _getProjectInfo(id) {
      const data = await this._makeRequest(`projects/${id}`);
      if (data.ok) {
        return data.project;
      }
      return {};
    }
    async _getUserProjects(user, offset, limit) {
      const data = await this._makeRequest(
        `users/${user}/projects?offset=${offset}&limit=${limit}`
      );
      if (data.ok) {
        return data.projects;
      }
      return [];
    }
    async _getUserFollowers(user, offset, limit) {
      const data = await this._makeRequest(
        `users/${user}/followers?offset=${offset}&limit=${limit}`,
      );
      if (data.ok) {
        return data.followers;
      }
      return [];
    }
    async _getUserFollowing(user, offset, limit) {
      const data = await this._makeRequest(
        `users/${user}/following?offset=${offset}&limit=${limit}`,
      );
      if (data.ok) {
        return data.following;
      }
      return [];
    }
    async _getProjectForks(project, offset, limit) {
      const data = await this._makeRequest(
        `projects/${project}/forks?offset=${offset}&limit=${limit}`,
      );
      if (data.ok) {
        return data.forks;
      }
      return [];
    }

    async getFeaturedProjects() {
      const data = await this._makeRequest("featured-projects");
      if (data.ok) {
        return new NormalArray(data.projects);
      }
      return new NormalArray();
    }
    async isLoginBlock() {
      await this._checkIsLoggedIn();
      return this.isLoggedIn;
    }
    async getMyUsername() {
      if (this.isLoggedIn) {
        const result = await this._getMyInfo();
        if (Object.entries(result).length > 0) {
          return result.username;
        }
        return "";
      }
      return "";
    }
    async getMyId() {
      if (this.isLoggedIn) {
        const result = await this._getMyInfo();
        if (Object.entries(result).length > 0) {
          return result.id;
        }
        return "";
      }
      return "";
    }
    async getMyRole() {
      if (this.isLoggedIn) {
        const result = await this._getMyInfo();
        if (Object.entries(result).length > 0) {
          return result.role;
        }
        return "";
      }
      return "";
    }
    async getMyAvatar() {
      if (this.isLoggedIn) {
        const result = await this._getMyInfo();
        if (Object.entries(result).length > 0) {
          return this.API_ORIGIN + "users/avatars/" + result.profile.avatarId;
        }
        return this.API_ORIGIN + "users/avatars/1";
      }
      return this.API_ORIGIN + "users/avatars/1";
    }
    // this is unsafe
    async getMyMessages() {
      return new NormalArray();
    }
    async getIdUser(args) {
      const user = Cast.toString(args.USER);
      const result = await this._getUserInfo(user);
      if (Object.entries(result).length > 0) {
        return result.id;
      }
      return "";
    }
    async getUsernameUser(args) {
      const user = Cast.toString(args.USER);
      const result = await this._getUserInfo(user);
      if (Object.entries(result).length > 0) {
        return result.username;
      }
      return "";
    }
    async getLengthProjectsUser(args) {
      const user = Cast.toString(args.USER);
      const result = await this._getUserInfo(user);
      if (Object.entries(result).length > 0) {
        return result.profile.stats.projects;
      }
      return 0;
    }
    async getProjectsUser(args) {
      const user = Cast.toString(args.USER);
      const offset = Cast.toNumber(args.OFFSET);
      const limit = Cast.toNumber(args.LIMIT);
      const result = await this._getUserProjects(
        user,
        offset,
        limit,
      );
      if (result.length > 0) {
        return new NormalArray(result);
      }
      return new NormalArray();
    }
    async getRoleUser(args) {
      const user = Cast.toString(args.USER);
      const result = await this._getUserInfo(user);
      if (Object.entries(result).length > 0) {
        return result.role;
      }
      return "";
    }
    async getDescriptionUser(args) {
      const user = Cast.toString(args.USER);
      const result = await this._getUserInfo(user);
      if (Object.entries(result).length > 0) {
        return result.profile.description;
      }
      return "";
    }
    async getAvatarUser(args) {
      const user = Cast.toString(args.USER);
      const result = await this._getUserInfo(user);
      if (Object.entries(result).length > 0) {
        return this.API_ORIGIN + "users/avatars/" + result.profile.avatarId;
      }
      return this.API_ORIGIN + "users/avatars/1";
    }
    async getUserLinks(args) {
      const user = Cast.toString(args.USER);
      const result = await this._getUserInfo(user);
      if (Object.entries(result).length > 0) {
        return new NormalArray(result.profile.links);
      }
      return new NormalArray();
    }
    async getUserLinksLength(args) {
      const user = Cast.toString(args.USER);
      const result = await this._getUserInfo(user);
      if (Object.entries(result).length > 0) {
        return result.profile.links.length;
      }
      return 0;
    }
    async getUserAchievements(args) {
      const user = Cast.toString(args.USER);
      const result = await this._getUserInfo(user);
      if (Object.entries(result).length > 0) {
        return new NormalArray(result.profile.achievements);
      }
      return new NormalArray();
    }
    async getUserAchievementsLength(args) {
      const user = Cast.toString(args.USER);
      const result = await this._getUserInfo(user);
      if (Object.entries(result).length > 0) {
        return result.profile.achievements.length;
      }
      return 0;
    }
    async getFollowersUser(args) {
      const user = Cast.toString(args.USER);
      const offset = Cast.toNumber(args.OFFSET);
      const limit = Cast.toNumber(args.LIMIT);
      const result = await this._getUserFollowers(
        user,
        offset,
        limit,
      );
      if (result.length > 0) {
        return new NormalArray(result);
      }
      return new NormalArray();
    }
    async getFollowingUser(args) {
      const user = Cast.toString(args.USER);
      const offset = Cast.toNumber(args.OFFSET);
      const limit = Cast.toNumber(args.LIMIT);
      const result = await this._getUserFollowing(
        user,
        offset,
        limit,
      );
      if (result.length > 0) {
        return new NormalArray(result);
      }
      return new NormalArray();
    }
    async getUserRecommendedProjectId(args) {
      const user = Cast.toString(args.USER);
      const result = await this._getUserInfo(user);
      if (Object.entries(result).length > 0) {
        return result.profile.recommendedProject.id;
      }
      return "";
    }
    async getProjectAuthor(args) {
      const project = Cast.toNumber(args.PROJECT);
      const result = await this._getProjectInfo(project);
      if (Object.entries(result).length > 0) {
        return result.author.username;
      }
      return "";
    }
    async getNameProject(args) {
      const project = Cast.toNumber(args.PROJECT);
      const result = await this._getProjectInfo(project);
      if (Object.entries(result).length > 0) {
        return result.name;
      }
      return "";
    }
    async getDescriptionProject(args) {
      const project = Cast.toNumber(args.PROJECT);
      const result = await this._getProjectInfo(project);
      if (Object.entries(result).length > 0) {
        return result.description;
      }
      return "";
    }
    async getFiresProject(args) {
      const project = Cast.toNumber(args.PROJECT);
      const result = await this._getProjectInfo(project);
      if (Object.entries(result).length > 0) {
        return result.stats.fires;
      }
      return 0;
    }
    async getProjectTrumbnail(args) {
      const project = Cast.toNumber(args.PROJECT);
      const result = await this._getProjectInfo(project);
      if (Object.entries(result).length > 0) {
        return this.API_ORIGIN + "projects/thumbnails/" + result.thumbnailId;
      }
      return this.API_ORIGIN + "projects/thumbnails/1";
    }
    async getProjectForksBlock(args) {
      const project = Cast.toNumber(args.PROJECT);
      const offset = Cast.toNumber(args.OFFSET);
      const limit = Cast.toNumber(args.LIMIT);
      const result = await this._getProjectForks(
        project,
        offset,
        limit,
      );
      if (result.length > 0) {
        return new NormalArray(result);
      }
      return new NormalArray();
    }
    async getProjectForkCount(args) {
      const project = Cast.toNumber(args.PROJECT);
      const result = await this._getProjectInfo(project);
      if (Object.entries(result).length > 0) {
        return result.stats.forks;
      }
      return 0;
    }
    async getProjectViews(args) {
      const project = Cast.toNumber(args.PROJECT);
      const result = await this._getProjectInfo(project);
      if (Object.entries(result).length > 0) {
        return result.stats.views;
      }
      return 0;
    }
  }
  Scratch.extensions.register(new DashAPI());
})(Scratch);
