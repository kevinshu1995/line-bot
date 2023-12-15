import NormalReplyMessages from "./messages/normal.js";
import DiceMessages from "./messages/dice.js";
import UserMessages from "./messages/user.js";

const commands = {
    "!": {
        prefix: "!",
        commands: {
            roll: DiceMessages.roll,
            hello: NormalReplyMessages.hello,
            register: UserMessages.register,
            profile: UserMessages.profile,
        },
    },
    "?": {
        prefix: "?",
        commands: {
            help: NormalReplyMessages.help,
            commands: {
                description: "取得機器人的所有指令列表",
                reply(event) {
                    return "指令列表 \n" + getAllCommandsIntroText();
                },
            },
        },
    },
};

const messages = {
    join: NormalReplyMessages.join,
    memberJoined: NormalReplyMessages.memberJoined,
};

// 取得所有指令的簡易說明文字 (用來回應 ?commands)
function getAllCommandsIntroText() {
    const commandsObj = commands;
    return Object.keys(commandsObj)
        .map(prefix => {
            return Object.keys(commandsObj[prefix].commands)
                .map(command => {
                    return `${prefix}${command}: ${commandsObj[prefix].commands[command].description}`;
                })
                .join("\n");
        })
        .join("\n");
}

/**
 *
 *  @param {String} userMessage
 *  @returns {Null | MessageObject}
 */
async function getCommandReplyMessage(userMessage, ...replyCallbackArgs) {
    const userFirstLetter = userMessage[0];
    if (commands[userFirstLetter] === undefined) return null;

    const commandText = userMessage.split(" ")[0].substring(1);

    const commandObject = commands[userFirstLetter].commands[commandText];

    const replyText = commandObject?.reply;
    if (replyText && typeof replyText === "function") {
        const replyTextResult = await Promise.resolve(replyText(...replyCallbackArgs));
        if (replyTextResult) return { type: "text", text: replyTextResult };
    }

    const flexMessage = commandObject?.flexMessage;
    if (flexMessage && typeof flexMessage === "function") {
        const flexMessageResult = await Promise.resolve(flexMessage(...replyCallbackArgs));
        if (flexMessageResult) return { type: "flex", ...flexMessageResult };
    }

    return null;
}

export default { commands, messages, getCommandReplyMessage };

