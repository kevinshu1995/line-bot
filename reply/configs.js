import NormalReplyMessages from "./messages/normal.js";
import DiceMessages from "./messages/dice.js";
import UserMessages from "./messages/user.js";

const commands = {
    "!": {
        prefix: "!",
        commands: {
            roll: DiceMessages.roll,
            rollguess: DiceMessages.rollguess,
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
                .join("\n\n");
        })
        .join("\n\n");
}

/**
 *
 *  @param {String} userMessage
 *  @returns {Null | MessageObject}
 */
async function getCommandReplyMessage(userMessage, ...replyCallbackArgs) {
    const userFirstLetter = userMessage[0];
    if (commands[userFirstLetter] === undefined) return null;

    // handle commands with args ( 處理參數  `1-22-(1,33)` 抓取這種格式的字串 )
    const [commandText, commandArgsString] = userMessage.split(" ")[0].substring(1).split(";");

    console.log(JSON.stringify({ commandText, commandArgsString }, null, 2));

    const commandArgsAry = commandArgsString?.split("-") ?? []; // become to ["1", "22", "(1,33)"]
    const formattedCommandArgs = commandArgsAry
        .map(arg => arg.trim())
        .map(arg => {
            // test if arg is 'number' or 'letter' or '(1)' or '(1,2)'
            const regexp = new RegExp(/^(?:\d+|\w+|\([\d|\w]+(,[\d|\w]+)*\))$/);
            return {
                test: regexp.test(arg),
                value: arg,
            };
        })
        .reduce(
            (all, { test, value }) => {
                const regexp = new RegExp(/^\([\d|\w]+(,[\d|\w]+)*\)$/);
                if (test && regexp.test(value)) {
                    all.test.push(true);
                    // make "(1,2)" (string) become ["1", "2"] (array)
                    all.value.push(
                        value
                            .replace("(", "")
                            .replace(")", "")
                            .split(",")
                            .map(arg => arg.trim())
                    );
                } else {
                    all.test.push(test);
                    all.value.push(value);
                }
                return all;
            },
            {
                test: [], // Boolean[]
                value: [], // string | string[]
            }
        );
    console.log("formattedCommandArgs \n", formattedCommandArgs);

    if (formattedCommandArgs.test.some(result => result === false)) return null; // 參數格式錯誤

    const commandObject = commands[userFirstLetter].commands[commandText];
    console.log("commandObject \n", commandObject);

    const replyText = commandObject?.reply;
    if (replyText && typeof replyText === "function") {
        const replyTextResult = await Promise.resolve(replyText(...replyCallbackArgs, ...formattedCommandArgs.value));
        if (replyTextResult) return { type: "text", text: replyTextResult };
    }

    const flexMessage = commandObject?.flexMessage;
    if (flexMessage && typeof flexMessage === "function") {
        const flexMessageResult = await Promise.resolve(flexMessage(...replyCallbackArgs, ...formattedCommandArgs.value));
        if (flexMessageResult) return { type: "flex", ...flexMessageResult };
    }

    return null;
}

export default { commands, messages, getCommandReplyMessage };

