const commands = {
    "!": {
        prefix: "!",
        commands: {
            hello: {
                description: "打招呼",
                reply() {
                    return "你還要我怎樣？";
                },
            },
        },
    },
    "?": {
        prefix: "?",
        commands: {
            help: {
                description: "幫助",
                reply() {
                    return "我是個指令機器人，你可以輸入 ?commands 來查看指令列表";
                },
            },
            commands: {
                description: "指令列表",
                reply() {
                    const allCommandAry = Object.keys(commands)
                        .map(prefix => {
                            return Object.keys(commands[prefix].commands)
                                .map(command => {
                                    return `${prefix}${command}: ${commands[prefix].commands[command].description}`;
                                })
                                .join("\n");
                        })
                        .join("\n");

                    return "指令列表 \n" + allCommandAry;
                },
            },
        },
    },
};

const messages = {
    join: {
        reply() {
            return "你好，" + commands["?"].commands["help"].reply;
        },
    },
    memberJoined: {
        reply({ joinedMembers }) {
            return `歡迎 ${joinedMembers.map(member => member.displayName).join(", ")} 加入！`;
        },
    },
};

/**
 *
 *  @param {String} userMessage
 *  @returns {Null | String}
 */
function getCommandReplyMessage(userMessage, ...replyCallbackArgs) {
    const userFirstLetter = userMessage[0];
    if (commands[userFirstLetter] === undefined) return null;

    const commandText = userMessage.split(" ")[0].substring(1);
    const replyText = commands[userFirstLetter].commands[commandText]?.reply;

    if (replyText === undefined) return null;
    return replyText(...replyCallbackArgs);
}

module.exports = { commands, messages, getCommandReplyMessage };

