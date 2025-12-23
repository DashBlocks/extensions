// Name: Telegram Bot API
// Description: Interact with Telegram Bot API
// ID: TelegramBotAPI
/* By:
    @DBDev_IT in Scratch @damir2809,
    @Fedor_sushko in Scratch @scratch_craft_2,
    @Grisshink in Scratch @ttt999,
    @MEOW_MUR920 in Scratch @By-ROlil-CO,
    @FXCHK404,
    @AnonimKingNews in Scratch @AnonimKing24,
    @d_den4ik_12 in Scratch @Den4ik-12
*/

(function (Scratch) {
    "use strict";

    if (!Scratch.extensions.unsandboxed)
        throw new Error("This extension MUST run unsandboxed!");

    class TelegramBotAPIExtension {
        constructor() {
            this.token = "";
            this.updates = [];
            this.offset = 0;
            this.pollingActive = false;
            this.pollingRunning = false;
            this.allUsers = new Set();
            this.recentUsers = [];
            this.maxRecentUsers = 10;
            this.lastCommand = "";
            this.inlineButtons = [];
            this.pollAnswers = [];
            this.dataBase = [];
        }

        getInfo() {
            return {
                id: "TelegramBotAPI",
                name: "Telegram Bot API",
                menuIconURI:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Telegram_2019_Logo.svg/768px-Telegram_2019_Logo.svg.png",
                docsURI: "https://github.com/DBDev-IT/TelegramBotAPI",
                color1: "#0088CC",
                color2: "#006699",
                blocks: [
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "Initialization",
                    },
                    {
                        opcode: "initBot",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "initialize bot with token [TOKEN]",
                        arguments: {
                            TOKEN: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "TOKEN",
                            },
                        },
                    },
                    {
                        opcode: "startPolling",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "start polling",
                    },
                    {
                        opcode: "stopPolling",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "stop polling",
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "Messaging",
                    },
                    {
                        opcode: "sendMessage",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "send message [TEXT] with formatting [PARSE_MODE] with buttons [BUTTONS] to chat id [CHATID]",
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Hello!",
                            },
                            BUTTONS: {
                                type: Scratch.ArgumentType.ARRAY,
                            },
                            PARSE_MODE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "PARSE_MODE_MENU",
                            },
                            CHATID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                        },
                    },
                    {
                        opcode: "replyToMessage",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "reply [TEXT] to message id [MESSAGEID] with formatting [PARSE_MODE] with buttons [BUTTONS] in chat id [CHATID]",
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "How are you?",
                            },
                            MESSAGEID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1,
                            },
                            BUTTONS: {
                                type: Scratch.ArgumentType.ARRAY,
                            },
                            PARSE_MODE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "PARSE_MODE_MENU",
                            },
                            CHATID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                        },
                    },
                    {
                        opcode: "sendPhoto",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "send photo [URL] with caption [TEXT] with formatting [PARSE_MODE] with buttons [BUTTONS] to chat id [CHATID]",
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "https://example.com/photo.png",
                            },
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Look!",
                            },
                            PARSE_MODE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "PARSE_MODE_MENU",
                            },
                            BUTTONS: {
                                type: Scratch.ArgumentType.ARRAY,
                            },
                            CHATID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                        },
                    },
                    {
                        opcode: "sendSticker",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "send sticker with id [STICKERID] to chat id [CHATID]",
                        arguments: {
                            STICKERID: {
                                type: Scratch.ArgumentType.STRING,
                            },
                            CHATID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                        },
                    },
                    {
                        opcode: "sendPoll",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "send poll [QUESTION] with options [OPTIONS] with settings [ISANONIM] [ALLOWSMULTIPLE] to chat id [CHATID]",
                        arguments: {
                            QUESTION: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Poll",
                            },
                            ISANONIM: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "POLL_ISANONIM_MENU",
                            },
                            ALLOWSMULTIPLE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "POLL_ALLOWSMULTIPLE_MENU",
                            },
                            OPTIONS: {
                                type: Scratch.ArgumentType.ARRAY,
                            },
                            CHATID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                        },
                    },
                    {
                        opcode: "editMessageText",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "edit message text from message id [MESSAGEID] to [TEXT] in chat id [CHATID]",
                        arguments: {
                            MESSAGEID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1,
                            },
                            CHATID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Thanks!",
                            },
                        },
                    },
                    {
                        opcode: "deleteMessage",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "delete message id [MESSAGEID] from chat id[CHATID]",
                        arguments: {
                            MESSAGEID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1,
                            },
                            CHATID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                        },
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "User permissions",
                    },
                    {
                        opcode: "kickUser",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "kick user with id [USERID] in chat id [CHATID]",
                        arguments: {
                            USERID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                            CHATID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                        },
                    },
                    {
                        opcode: "muteUser",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "mute user with id [USERID] in chat id [CHATID]",
                        arguments: {
                            USERID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                            CHATID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                        },
                    },
                    {
                        opcode: "unmuteUser",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "unmute user with id [USERID] in chat id [CHATID]",
                        arguments: {
                            USERID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                            CHATID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                        },
                    },
                    {
                        opcode: "banUser",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "ban user with id [USERID] in chat id [CHATID]",
                        arguments: {
                            USERID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                            CHATID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                        },
                    },
                    {
                        opcode: "unbanUser",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "unban user with id [USERID] in chat id [CHATID]",
                        arguments: {
                            USERID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                            CHATID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                        },
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "Reactions",
                    },
                    {
                        opcode: "setReaction",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set reaction [REACTION] to message id [MESSAGEID] in chat id [CHATID]",
                        arguments: {
                            REACTION: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "REACTION_MENU",
                            },
                            MESSAGEID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1,
                            },
                            CHATID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 123456789,
                            },
                        },
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "Arrays",
                    },
                    {
                        opcode: "addInlineButtonToInlineButtonsArray",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "add button [TEXT] with type [TYPE] with data [DATA] to buttons array",
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Button 1",
                            },
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "INLINE_BUTTONS_ARRAY_TYPE_MENU",
                            },
                            DATA: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "data_1",
                            },
                        },
                    },
                    {
                        opcode: "addPollAnswerToPollAnswersArray",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "add option [TEXT] to poll options array",
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Option 1",
                            },
                        },
                    },
                    {
                        opcode: "clearArray",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "clear [CLEAR_ARRAY] array",
                        arguments: {
                            CLEAR_ARRAY: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "CLEAR_ARRAY_MENU",
                            },
                        },
                    },
                    {
                        opcode: "getArray",
                        blockType: Scratch.BlockType.ARRAY,
                        text: "[ARRAY] array",
                        arguments: {
                            ARRAY: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "ARRAY_MENU",
                            },
                        },
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "Updates",
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "1. Messages",
                    },
                    {
                        opcode: "getMessage",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "[GETMESSAGE_TYPE] of last message",
                        arguments: {
                            GETMESSAGE_TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "GETMESSAGE_TYPE_MENU",
                            },
                        },
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "2. Callbacks",
                    },
                    {
                        opcode: "getCallback",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "[GETCALLBACK_TYPE] of callback",
                        arguments: {
                            GETCALLBACK_TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "GETCALLBACK_TYPE_MENU",
                            },
                        },
                    },
                    {
                        opcode: "answerToCallback",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "answer to callback id [ID] with type [TYPE] with text [TEXT]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1000000000,
                            },
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "CALLBACK_ANSWER_TYPE_MENU",
                            },
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Hello!",
                            },
                        },
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "3. Checks for updates",
                    },
                    {
                        opcode: "hasNewMessages",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "new messages?",
                    },
                    {
                        opcode: "isMessageStartsWith",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "last message starts with [TEXT]?",
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "/start",
                            },
                        },
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "Users",
                    },
                    {
                        opcode: "getAllUsers",
                        blockType: Scratch.BlockType.ARRAY,
                        text: "all users",
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "Updates",
                    },
                    {
                        opcode: "whenNewUpdate",
                        blockType: Scratch.BlockType.HAT,
                        text: "when new update received",
                    },
                    {
                        opcode: "clearUpdates",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "clear updates",
                    },
                ],
                menus: {
                    PARSE_MODE_MENU: {
                        items: ["no", "Markdown", "HTML"],
                    },
                    INLINE_BUTTONS_ARRAY_TYPE_MENU: {
                        items: ["data", "link"],
                    },
                    CALLBACK_ANSWER_TYPE_MENU: {
                        items: ["popup", "alert"],
                    },
                    GETMESSAGE_TYPE_MENU: {
                        items: [
                            "text",
                            "id",
                            "chat id",
                            "command",
                            "username",
                            "user id",
                            "sticker id",
                        ],
                    },
                    GETCALLBACK_TYPE_MENU: {
                        items: ["data", "id", "chat id", "username", "user id"],
                    },
                    POLL_ISANONIM_MENU: {
                        items: ["anonymous", "non-anonymous"],
                    },
                    POLL_ALLOWSMULTIPLE_MENU: {
                        items: ["multiple answers", "single answer"],
                    },
                    REACTION_MENU: {
                        items: [
                            "👍",
                            "👎",
                            "❤",
                            "🔥",
                            "🥰",
                            "👏",
                            "😁",
                            "🤔",
                            "🤯",
                            "😱",
                            "🤬",
                            "😢",
                            "🎉",
                            "🤩",
                            "🤮",
                            "💩",
                            "🙏",
                            "👌",
                            "🕊",
                            "🤡",
                            "🥱",
                            "🥴",
                            "😍",
                            "🐳",
                            "❤‍🔥",
                            "🌚",
                            "🌭",
                            "💯",
                            "🤣",
                            "⚡",
                            "🍌",
                            "🏆",
                            "💔",
                            "🤨",
                            "😐",
                            "🍓",
                            "🍾",
                            "💋",
                            "🖕",
                            "😈",
                            "😴",
                            "😭",
                            "🤓",
                            "👻",
                            "👨‍💻",
                            "👀",
                            "🎃",
                            "🙈",
                            "😇",
                            "😨",
                            "🤝",
                            "✍",
                            "🤗",
                            "🫡",
                            "🎅",
                            "🎄",
                            "☃",
                            "💅",
                            "🤪",
                            "🗿",
                            "🆒",
                            "💘",
                            "🙉",
                            "🦄",
                            "😘",
                            "💊",
                            "🙊",
                            "😎",
                            "👾",
                            "🤷‍♂",
                            "🤷",
                            "🤷‍♀",
                            "😡",
                        ],
                    },
                    CLEAR_ARRAY_MENU: {
                        items: ["buttons", "poll options"],
                    },
                    ARRAY_MENU: {
                        items: ["buttons", "poll options"],
                    },
                },
            };
        }

        resetBot(args) {
            this.token = args.TOKEN;
            this.updates = [];
            this.offset = 0;
            this.allUsers = new Set();
            this.recentUsers = [];
            this.lastCommand = "";
        }

        initBot(args) {
            this.pollingActive = false;

            return new Promise((resolve, _) => {
                const checkPoll = () => {
                    if (this.pollingRunning) {
                        setTimeout(checkPoll, 100);
                        return;
                    }
                    this.resetBot(args);
                    resolve();
                };
                checkPoll();
            });
        }

        startPolling(args) {
            if (!this.token || this.pollingActive || this.pollingRunning)
                return;
            const poll = () => {
                this.pollingRunning = true;
                const url = `https://api.telegram.org/bot${this.token}/getUpdates?offset=${this.offset}`;
                fetch(url)
                    .then((response) => {
                        if (!response.ok) {
                            console.error(response.status)
                        }
                        return response.json();
                    })
                    .then((data) => {
                        if (data.ok && data.result.length > 0) {
                            this.updates = data.result;
                            this.offset =
                                this.updates[this.updates.length - 1]
                                    .update_id + 1;
                            this._updateUsers();
                        }
                        if (!this.pollingActive) {
                            this.pollingRunning = false;
                            return;
                        }
                        setTimeout(poll, args.SECONDS * 1000);
                    })
                    .catch((error) => {
                        if (!this.pollingActive) {
                            this.pollingRunning = false;
                            return;
                        }
                        console.error(error);
                        setTimeout(poll, args.SECONDS * 1000);
                    });
            };
            this.pollingActive = true;
            poll();
        }

        stopPolling() {
            this.pollingActive = false;
        }

        async sendMessage(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
            if (args.PARSE_MODE === "no") {
                if (args.BUTTONS) {
                    await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            chat_id: args.CHATID,
                            text: args.TEXT,
                            reply_markup: {
                                inline_keyboard: [args.BUTTONS]
                            }
                        }),
                    }).catch(console.error);
                } else {
                    await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            chat_id: args.CHATID,
                            text: args.TEXT
                        }),
                    }).catch(console.error);
                }
                return;
            }
            if (args.BUTTONS) {
                await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chat_id: args.CHATID,
                        text: args.TEXT,
                        parse_mode: args.PARSE_MODE,
                        reply_markup: {
                            inline_keyboard: [args.BUTTONS]
                        }
                    }),
                }).catch(console.error);
            } else {
                await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chat_id: args.CHATID,
                        text: args.TEXT,
                        parse_mode: args.PARSE_MODE
                    }),
                }).catch(console.error);
            }
        }

        async replyToMessage(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
            if (args.PARSE_MODE === "no") {
                if (args.BUTTONS) {
                    await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            chat_id: args.CHATID,
                            text: args.TEXT,
                            reply_markup: {
                                inline_keyboard: [args.BUTTONS]
                            }
                        }),
                    }).catch(console.error);
                } else {
                    await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            chat_id: args.CHATID,
                            text: args.TEXT
                        }),
                    }).catch(console.error);
                }
                return;
            }
            if (args.BUTTONS) {
                await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chat_id: args.CHATID,
                        text: args.TEXT,
                        parse_mode: args.PARSE_MODE,
                        reply_to_message_id: args.MESSAGEID,
                        reply_markup: {
                            inline_keyboard: [args.BUTTONS]
                        }
                    }),
                }).catch(console.error);
            } else {
                await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chat_id: args.CHATID,
                        text: args.TEXT,
                        parse_mode: args.PARSE_MODE,
                        reply_to_message_id: args.MESSAGEID
                    }),
                }).catch(console.error);
            }
        }

        async sendPhoto(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/sendPhoto`;
            if (args.PARSE_MODE === "no") {
                await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chat_id: args.CHATID,
                        caption: args.TEXT,
                    }),
                }).catch(console.error);
                return;
            }
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: args.CHATID,
                    text: args.TEXT,
                    parse_mode: args.PARSE_MODE,
                    photo: args.URL,
                }),
            }).catch(console.error);
        }

        async sendSticker(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/sendSticker`;
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: args.CHATID,
                    sticker: args.STICKERID,
                }),
            }).catch(console.error);
        }

        async sendPoll(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/sendPoll`;
            if (args.ISANONIM === "anonymous") {
                if (args.ALLOWSMULTIPLE === "multiple answers") {
                    await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            chat_id: args.CHATID,
                            question: args.QUESTION,
                            options: args.OPTIONS,
                            is_anonymous: true,
                            allows_multiple_answers: true,
                        }),
                    }).catch(console.error);
                } else {
                    await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            chat_id: args.CHATID,
                            question: args.QUESTION,
                            options: args.OPTIONS,
                            is_anonymous: true,
                            allows_multiple_answers: false,
                        }),
                    }).catch(console.error);
                }
            } else {
                if (args.ALLOWSMULTIPLE === "multiple answers") {
                    await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            chat_id: args.CHATID,
                            question: args.QUESTION,
                            options: args.OPTIONS,
                            is_anonymous: false,
                            allows_multiple_answers: true,
                        }),
                    }).catch(console.error);
                } else {
                    await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            chat_id: args.CHATID,
                            question: args.QUESTION,
                            options: args.OPTIONS,
                            is_anonymous: false,
                            allows_multiple_answers: false,
                        }),
                    }).catch(console.error);
                }
            }
        }

        async editMessageText(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/editMessageText`;
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: args.CHATID,
                    message_id: args.MESSAGEID,
                    text: args.TEXT,
                }),
            }).catch(console.error);
        }

        async deleteMessage(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/deleteMessage`;
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: args.CHATID,
                    message_id: args.MESSAGEID,
                }),
            }).catch(console.error);
        }

        async kickUser(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/kickChatMember`;
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: args.CHATID,
                    user_id: args.USERID,
                }),
            }).catch(console.error);
        }

        async muteUser(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/restrictChatMember`;
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: args.CHATID,
                    user_id: args.USERID,
                    permissions: {
                        can_send_messages: false,
                    },
                }),
            }).catch(console.error);
        }

        async unmuteUser(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/restrictChatMember`;
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: args.CHATID,
                    user_id: args.USERID,
                    permissions: {
                        can_send_messages: true,
                    },
                }),
            }).catch(console.error);
        }

        async banUser(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/banChatMember`;
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: args.CHATID,
                    user_id: args.USERID,
                }),
            }).catch(console.error);
        }

        async unbanUser(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/unbanChatMember`;
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: args.CHATID,
                    user_id: args.USERID,
                }),
            }).catch(console.error);
        }

        async setReaction(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/setMessageReaction`;
            const reaction = [
                {
                    type: "emoji",
                    emoji: args.REACTION,
                },
            ];
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message_id: args.MESSAGEID,
                    chat_id: args.CHATID,
                    reaction: JSON.stringify(reaction),
                }),
            }).catch(console.error);
        }

        addInlineButtonToInlineButtonsArray(args) {
            if (args.TYPE === "data") {
                this.inlineButtons.push({
                    text: args.TEXT,
                    callback_data: args.DATA,
                });
            } else if (args.TYPE === "link") {
                this.inlineButtons.push({ text: args.TEXT, url: args.DATA });
            }
        }

        addPollAnswerToPollAnswersArray(args) {
            this.pollAnswers.push(args.TEXT);
        }

        clearArray(args) {
            if (args.CLEAR_ARRAY == "buttons") this.inlineButtons = [];
            if (args.CLEAR_ARRAY == "poll answers") this.pollAnswers = [];
        }

        getArray(args) {
            if (args.ARRAY == "buttons") return this.inlineButtons;
            if (args.ARRAY == "poll answers") return this.pollAnswers;
        }

        getMessage(args) {
            if (args.GETMESSAGE_TYPE === "text") {
                if (this.updates.length === 0) return "";
                const lastUpdate = this.updates[this.updates.length - 1];
                return lastUpdate.message ? lastUpdate.message.text || "" : "";
            } else if (args.GETMESSAGE_TYPE === "id") {
                if (this.updates.length === 0) return "";
                const lastUpdate = this.updates[this.updates.length - 1];
                return lastUpdate.message
                    ? lastUpdate.message.message_id.toString()
                    : "";
            } else if (args.GETMESSAGE_TYPE === "chat id") {
                if (this.updates.length === 0) return "";
                const lastUpdate = this.updates[this.updates.length - 1];
                return lastUpdate.message
                    ? lastUpdate.message.chat.id.toString()
                    : "";
            } else if (args.GETMESSAGE_TYPE === "command") {
                if (this.updates.length === 0) return "";
                const lastUpdate = this.updates[this.updates.length - 1];
                const text = lastUpdate.message
                    ? lastUpdate.message.text || ""
                    : "";
                if (text.startsWith("/")) this.lastCommand = text.split(" ")[0];
                return this.lastCommand;
            } else if (args.GETMESSAGE_TYPE === "sticker id") {
                if (this.updates.length === 0) return "";
                const lastUpdate = this.updates[this.updates.length - 1];
                return lastUpdate.message && lastUpdate.message.sticker
                    ? lastUpdate.message.sticker.file_id
                    : "";
            } else if (args.GETMESSAGE_TYPE === "username") {
                if (this.updates.length === 0) return "";
                const lastUpdate = this.updates[this.updates.length - 1];
                return lastUpdate.message && lastUpdate.message.from
                    ? lastUpdate.message.from.username || ""
                    : "";
            } else if (args.GETMESSAGE_TYPE === "user id") {
                if (this.updates.length === 0) return "";
                const lastUpdate = this.updates[this.updates.length - 1];
                return lastUpdate.message && lastUpdate.message.from
                    ? lastUpdate.message.from.id || ""
                    : "";
            }
        }

        getCallback(args) {
            if (args.GETCALLBACK_TYPE === "data") {
                if (this.updates.length === 0) return "";
                const lastUpdate = this.updates[this.updates.length - 1];
                return lastUpdate.callback_query
                    ? lastUpdate.callback_query.data || ""
                    : "";
            } else if (args.GETCALLBACK_TYPE === "id") {
                if (this.updates.length === 0) return "";
                const lastUpdate = this.updates[this.updates.length - 1];
                return lastUpdate.callback_query
                    ? lastUpdate.callback_query.id
                    : "";
            } else if (args.GETCALLBACK_TYPE === "chat id") {
                if (this.updates.length === 0) return "";
                const lastUpdate = this.updates[this.updates.length - 1];
                return lastUpdate.callback_query
                    ? lastUpdate.callback_query.message.chat.id.toString()
                    : "";
            } else if (args.GETCALLBACK_TYPE === "username") {
                if (this.updates.length === 0) return "";
                const lastUpdate = this.updates[this.updates.length - 1];
                return lastUpdate.callback_query &&
                    lastUpdate.callback_query.from
                    ? lastUpdate.callback_query.from.username || ""
                    : "";
            } else if (args.GETCALLBACK_TYPE === "user id") {
                if (this.updates.length === 0) return "";
                const lastUpdate = this.updates[this.updates.length - 1];
                return lastUpdate.callback_query &&
                    lastUpdate.callback_query.from
                    ? lastUpdate.callback_query.from.id || ""
                    : "";
            }
        }

        async answerToCallback(args) {
            if (!this.token) return;
            const url = `https://api.telegram.org/bot${this.token}/answerCallbackQuery`;
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    callback_query_id: args.ID,
                    text: args.TEXT,
                    show_alert: args.TYPE === "alert",
                }),
            }).catch(console.error);
        }

        hasNewMessages() {
            return this.updates.length > 0;
        }

        isMessageStartsWith(args) {
            if (this.updates.length === 0) return false;
            const lastUpdate = this.updates[this.updates.length - 1];
            const text = lastUpdate.message
                ? lastUpdate.message.text || ""
                : "";
            return text.startsWith(args.TEXT);
        }

        getAllUsers() {
            return this.allUsers;
        }

        whenNewUpdate() {
            return this.updates.length > 0;
        }

        async clearUpdates() {
            return new Promise((resolve) => {
                this.updates = [];
                this.lastCommand = "";
                resolve();
            });
        }

        async _updateUsers() {
            this.updates.forEach((update) => {
                if (update.message && update.message.from) {
                    const user = {
                        chatId: update.message.chat.id.toString(),
                        username:
                            update.message.from.username ||
                            update.message.from.id ||
                            "Unknown",
                    };
                    const userKey = `${user.chatId}:${user.username}`;
                    if (!this.allUsers.has(userKey)) {
                        this.allUsers.add(userKey);
                    }
                    this.recentUsers.push(user);
                    if (this.recentUsers.length > this.maxRecentUsers) {
                        this.recentUsers.shift();
                    }
                }
            });
        }
    }

    Scratch.extensions.register(new TelegramBotAPIExtension());
})(Scratch);
